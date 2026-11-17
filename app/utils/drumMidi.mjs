import { expandDrumNote } from "./drumAudio.mjs";

const PITCHES = { crash: 49, ride: 51, cowbell: 56, hihat: 42, openhat: 46, snare: 38, tom: 50, midtom: 47, lowtom: 43, kick: 36 };

function midiPitch(instrument, variant) {
  if (variant === "foot") return 44;
  if (variant === "cross-stick") return 37;
  if (variant === "bell") return 53;
  if (variant === "open") return 46;
  if (variant === "stacker") return 52;
  if (variant === "click" || variant === "click-accent") return 76;
  return PITCHES[instrument];
}

const vlq = (value) => {
  const bytes = [value & 127];
  while ((value = Math.floor(value / 128))) bytes.unshift((value & 127) | 128);
  return bytes;
};
const word = (value) => [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
const text = (value) => Array.from(value, (character) => character.charCodeAt(0));

export function grooveToMidi({ pattern, tempo, bars, division, timeSignature, sampleBuffers = {} }) {
  const ppq = 480;
  const stepTicks = ppq * 4 / division;
  const totalTicks = Math.round(bars * timeSignature[0] * ppq * 4 / timeSignature[1]);
  const events = [];
  const graceTicks = Math.min(Math.round(ppq * tempo * 0.025 / 60), Math.floor(stepTicks / 3));
  const hit = (time, pitch, velocity, duration = stepTicks / 2) => {
    if (!Number.isFinite(pitch)) return;
    const start = Math.max(0, Math.round(time));
    const off = { time: start + Math.max(1, Math.round(duration)), bytes: [0x89, pitch, 0] };
    events.push({ time: start, bytes: [0x99, pitch, Math.round(velocity * 127)], off });
    events.push(off);
  };
  for (const [instrument, lane] of Object.entries(pattern)) {
    for (const [position, variant] of Object.entries(lane)) {
      const start = Number(position) * stepTicks;
      if (start >= totalTicks) continue;
      for (const note of expandDrumNote(instrument, variant)) {
        const pitch = midiPitch(note.instrument, note.variant);
        const sample = sampleBuffers[`${note.instrument}:${note.variant}`] || sampleBuffers[note.instrument] || sampleBuffers[`${note.instrument}:normal`];
        const duration = Math.round((sample?.duration || ([49, 51, 53, 46, 52].includes(pitch) ? 2 : 0.4)) * ppq * tempo / 60);
        if (variant === "flam") {
          hit(Math.max(0, start - graceTicks), pitch, 0.45, graceTicks / 2);
          hit(start === 0 ? graceTicks : start, pitch, note.velocity, duration);
        } else if (variant === "buzz") {
          for (let i = 0; i < 3; i++) hit(start + i * stepTicks / 6, pitch, note.velocity * (1 - i * 0.15), stepTicks / 8);
        } else hit(start, pitch, note.velocity, duration);
      }
    }
  }
  events.sort((a, b) => a.time - b.time || a.bytes[0] - b.bytes[0]);
  // An old note-off must not cut off a later retrigger of the same drum key.
  const previousHits = new Map();
  for (const event of events) {
    if (event.bytes[0] !== 0x99) continue;
    const previous = previousHits.get(event.bytes[1]);
    if (previous && previous.time < event.time) previous.off.time = Math.min(previous.off.time, event.time - 1);
    previousHits.set(event.bytes[1], event);
  }
  events.sort((a, b) => a.time - b.time || a.bytes[0] - b.bytes[0]);
  const micros = Math.round(60000000 / tempo);
  const track = [0, 0xff, 0x51, 3, (micros >>> 16) & 255, (micros >>> 8) & 255, micros & 255,
    0, 0xff, 0x58, 4, timeSignature[0], Math.log2(timeSignature[1]), 24, 8];
  let last = 0;
  for (const event of events) { track.push(...vlq(event.time - last), ...event.bytes); last = event.time; }
  track.push(...vlq(Math.max(0, totalTicks - last)), 0xff, 0x2f, 0);
  return new Uint8Array([...text("MThd"), 0, 0, 0, 6, 0, 0, 0, 1, 1, 0xe0, ...text("MTrk"), ...word(track.length), ...track]);
}
