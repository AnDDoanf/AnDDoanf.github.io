export function noteVelocity(variant) {
  return variant === "ghost" ? 0.5 : variant === "accent" || variant === "flam" || variant === "click-accent" ? 1 : 0.82;
}

export function expandDrumNote(instrument, variant) {
  if (!variant || variant === "off") return [];
  if (variant === "foot") return [{ instrument: "hihat", variant: "foot", velocity: 0.72 }];
  if (variant === "kick-hat-foot") return [
    { instrument: "kick", variant: "normal", velocity: 0.9 },
    { instrument: "hihat", variant: "foot", velocity: 0.72 },
  ];
  return [{ instrument, variant, velocity: noteVelocity(variant) }];
}

// Shared by preview, transport, and video export. Samples always finish naturally.
export function scheduleDrumSound(context, destination, buffers, instrument, velocity, variant, when = context.currentTime) {
  const gain = context.createGain();
  gain.connect(destination);
  gain.gain.setValueAtTime(velocity, when);
  const sample = buffers[`${instrument}:${variant}`] || buffers[instrument] || buffers[`${instrument}:normal`];
  if (sample) {
    const source = context.createBufferSource();
    source.buffer = sample;
    source.connect(gain);
    source.onended = () => { source.disconnect(); gain.disconnect(); };
    source.start(when);
    return when + sample.duration;
  }
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.18);
  if (["kick", "tom", "midtom", "lowtom"].includes(instrument)) {
    const source = context.createOscillator();
    source.type = "sine";
    source.frequency.setValueAtTime(instrument === "kick" ? 150 : 110, when);
    source.frequency.exponentialRampToValueAtTime(instrument === "kick" ? 42 : 55, when + 0.16);
    source.connect(gain);
    source.onended = () => { source.disconnect(); gain.disconnect(); };
    source.start(when);
    source.stop(when + 0.18);
  } else {
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.18), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const source = context.createBufferSource();
    source.buffer = buffer;
    const filter = context.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = instrument === "snare" ? 1200 : 6500;
    source.connect(filter);
    filter.connect(gain);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
    source.start(when);
    source.stop(when + (instrument === "snare" ? 0.15 : 0.08));
  }
  return when + 0.18;
}
