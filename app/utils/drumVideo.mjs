import { expandDrumNote, scheduleDrumSound } from "./drumAudio.mjs";
import { alignSheetIndicators, renderDrumSheet } from "./renderDrumSheet.mjs";

export async function exportGrooveVideo({ pattern, tempo, bars, division, timeSignature, sampleBuffers, title, signal, onProgress }) {
  if (!window.VideoEncoder || !window.AudioEncoder) throw new Error("Frame-synchronized export needs a current Chrome, Edge, or Safari browser.");
  if (!window.Abc) throw new Error("Wait for the sheet music to finish loading, then export again.");
  const { Output, BufferTarget, CanvasSource, AudioBufferSource, Mp4OutputFormat, WebMOutputFormat, Quality, canEncodeVideo, canEncodeAudio } = await import("mediabunny");
  const mp4 = await canEncodeVideo("avc", { width: 1920, height: 1080 }) && await canEncodeAudio("aac", { sampleRate: 48000, numberOfChannels: 2 });
  if (!mp4 && (!await canEncodeVideo("vp9", { width: 1920, height: 1080 }) || !await canEncodeAudio("opus", { sampleRate: 48000, numberOfChannels: 2 }))) {
    throw new Error("This browser does not have the audio and video encoders needed for export.");
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  const holder = document.createElement("div");
  holder.style.cssText = "position:fixed;left:-10000px;top:0;width:900px;color:#111;background:#fff";
  holder.innerHTML = renderDrumSheet(window.Abc, { pattern, bars, division, timeSignature, pageWidth: 900 });
  document.body.append(holder);
  alignSheetIndicators(holder);
  let output;
  let imageUrl;
  try {
    const svgs = [...holder.querySelectorAll("svg")];
    const anchors = [];
    let sheetHeight = 0;
    let sheetWidth = 0;
    for (const svg of svgs) {
      const bounds = svg.getBoundingClientRect();
      sheetWidth = Math.max(sheetWidth, bounds.width);
      for (const anchor of svg.querySelectorAll(".drum-sheet-anchor")) {
        const rect = anchor.getBoundingClientRect();
        anchors.push({ step: Number(anchor.dataset.step), x: rect.left - bounds.left, width: rect.width, y: sheetHeight + rect.top - bounds.top, height: rect.height });
      }
      sheetHeight += bounds.height;
    }
    anchors.sort((a, b) => a.step - b.step);
    const markup = svgs.map((svg) => {
      const copy = svg.cloneNode(true);
      copy.setAttribute("y", copy.dataset.offset || "0");
      return copy;
    });
    let offset = 0;
    for (let i = 0; i < markup.length; i++) {
      markup[i].setAttribute("y", String(offset));
      offset += svgs[i].getBoundingClientRect().height;
    }
    const svgText = `<svg xmlns="http://www.w3.org/2000/svg" width="${sheetWidth}" height="${sheetHeight}" color="#111" fill="#111">${markup.map((svg) => svg.outerHTML).join("")}</svg>`;
    imageUrl = URL.createObjectURL(new Blob([svgText], { type: "image/svg+xml" }));
    const image = new Image();
    image.src = imageUrl;
    await image.decode();
    signal?.throwIfAborted();
    const scale = Math.min(1800 / sheetWidth, 880 / sheetHeight);
    const left = (canvas.width - sheetWidth * scale) / 2;
    const top = 140 + (880 - sheetHeight * scale) / 2;
    const totalSteps = bars * timeSignature[0] * division / timeSignature[1];
    const stepSeconds = 60 / tempo / (division / 4);
    const duration = totalSteps * stepSeconds;
    // Paint the static score once; each encoded frame only copies this bitmap.
    const background = document.createElement("canvas");
    background.width = canvas.width;
    background.height = canvas.height;
    const backgroundContext = background.getContext("2d");
    backgroundContext.fillStyle = "#fff";
    backgroundContext.fillRect(0, 0, canvas.width, canvas.height);
    backgroundContext.fillStyle = "#263238";
    backgroundContext.font = "bold 30px sans-serif";
    backgroundContext.fillText(title || "Drum groove", 60, 60, 1400);
    backgroundContext.font = "22px sans-serif";
    backgroundContext.fillText(`${tempo} BPM ? ${timeSignature.join("/")} ? ${bars} bar${bars === 1 ? "" : "s"}`, 60, 100);
    backgroundContext.drawImage(image, left, top, sheetWidth * scale, sheetHeight * scale);
    const draw = (elapsed) => {
      ctx.drawImage(background, 0, 0);
      const step = Math.max(0, Math.min(totalSteps - 1, elapsed / stepSeconds));
      let current = anchors[0];
      for (const anchor of anchors) {
        if (anchor.step <= step) current = anchor;
        else break;
      }
      if (current && elapsed < duration) {
        ctx.fillStyle = "rgba(38,139,210,0.22)";
        ctx.fillRect(left + current.x * scale, top + current.y * scale, current.width * scale, current.height * scale);
      }
      ctx.fillStyle = "#268bd2";
      ctx.fillRect(60, 1040, 1800 * Math.min(1, Math.max(0, elapsed / duration)), 5);
    };
    // Schedule the exact same sounds into an offline audio buffer from time zero.
    // Encoder speed and UI rendering cannot alter the audio/visual timeline.
    const scheduled = [];
    let finish = duration;
    for (const [instrument, lane] of Object.entries(pattern)) {
      for (const [position, variant] of Object.entries(lane)) {
        if (Number(position) >= totalSteps) continue;
        for (const note of expandDrumNote(instrument, variant)) {
          const time = Number(position) * stepSeconds;
          const sample = sampleBuffers[`${note.instrument}:${note.variant}`] || sampleBuffers[note.instrument] || sampleBuffers[`${note.instrument}:normal`];
          finish = Math.max(finish, time + (sample?.duration || 0.18));
          scheduled.push({ ...note, time });
        }
      }
    }
    const sampleRate = 48000;
    const frameRate = 30;
    const frameCount = Math.ceil((finish + 0.1) * frameRate);
    const totalDuration = frameCount / frameRate;
    const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const audio = new OfflineContext(2, Math.ceil(totalDuration * sampleRate), sampleRate);
    for (const note of scheduled) scheduleDrumSound(audio, audio.destination, sampleBuffers, note.instrument, note.velocity, note.variant, note.time);
    signal?.throwIfAborted();
    onProgress?.(0);
    const renderedAudio = await audio.startRendering();
    signal?.throwIfAborted();
    output = new Output({ format: mp4 ? new Mp4OutputFormat() : new WebMOutputFormat(), target: new BufferTarget() });
    const videoSource = new CanvasSource(canvas, { codec: mp4 ? "avc" : "vp9", quality: new Quality({ bitrate: 5000000 }), latencyMode: "quality" });
    const audioSource = new AudioBufferSource({ codec: mp4 ? "aac" : "opus", quality: new Quality({ bitrate: 192000 }) });
    output.addVideoTrack(videoSource, { frameRate });
    output.addAudioTrack(audioSource);
    await output.start();
    const cancel = () => { void output.cancel(); };
    signal?.addEventListener("abort", cancel, { once: true });
    try {
      let lastProgress = -1;
      for (let index = 0; index < frameCount; index++) {
        signal?.throwIfAborted();
        const timestamp = index / frameRate;
        draw(timestamp);
        await videoSource.add(timestamp, 1 / frameRate);
        // Supply a matching audio slice so muxing never queues the whole opposite track.
        const firstSample = Math.round(timestamp * sampleRate);
        const lastSample = Math.min(renderedAudio.length, Math.round((index + 1) * sampleRate / frameRate));
        const chunk = audio.createBuffer(2, lastSample - firstSample, sampleRate);
        for (let channel = 0; channel < 2; channel++) chunk.copyToChannel(renderedAudio.getChannelData(channel).subarray(firstSample, lastSample), channel);
        await audioSource.add(chunk);
        const progress = Math.floor((index + 1) / frameCount * 99);
        if (progress !== lastProgress) { onProgress?.(progress); lastProgress = progress; }
        if (index % 10 === 0) await new Promise((resolve) => setTimeout(resolve, 0));
      }
      videoSource.close();
      audioSource.close();
      signal?.throwIfAborted();
      await output.finalize();
      signal?.throwIfAborted();
      onProgress?.(100);
      return { blob: new Blob([output.target.buffer], { type: mp4 ? "video/mp4" : "video/webm" }), extension: mp4 ? "mp4" : "webm" };
    } finally {
      signal?.removeEventListener("abort", cancel);
    }
  } finally {
    if (output && output.state !== "finalized" && output.state !== "canceled") await output.cancel();
    holder.remove();
    if (imageUrl) URL.revokeObjectURL(imageUrl);
  }
}
