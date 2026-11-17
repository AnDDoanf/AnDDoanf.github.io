// Versioned, compact state in the fragment works with static hosting and needs no server.
const INSTRUMENTS = ["crash", "ride", "cowbell", "hihat", "openhat", "snare", "tom", "midtom", "lowtom", "kick"];
const VARIANTS = ["normal", "open", "accent", "ghost", "cross-stick", "buzz", "flam", "bell", "foot", "kick-hat-foot", "stacker", "click", "click-accent"];
const METERS = ["4/4", "3/4", "6/8", "9/8", "12/8", "5/4", "7/8"];
const KITS = ["groovescribe", "acoustic", "electronic", "lofi"];

export function encodeDrumSheet({ pattern, bars, tempo, division, timeSignature, kitId, grooveName }) {
  const data = [1, grooveName, kitId, tempo, bars, division, timeSignature,
    INSTRUMENTS.map((id) => Object.entries(pattern[id] || {})
      .filter(([, variant]) => VARIANTS.includes(variant))
      .map(([step, variant]) => [Number(step), VARIANTS.indexOf(variant)]))];
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

export function decodeDrumSheet(encoded) {
  try {
    if (!encoded || encoded.length > 200000 || !/^[\w-]+$/.test(encoded)) return null;
    const binary = atob(encoded.replaceAll("-", "+").replaceAll("_", "/"));
    const data = JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0))));
    if (!Array.isArray(data) || data.length !== 8) return null;
    const [version, grooveName, kitId, tempo, bars, division, timeSignature, lanes] = data;
    if (version !== 1 || typeof grooveName !== "string" || grooveName.length > 10000 || !KITS.includes(kitId)) return null;
    if (!Number.isFinite(tempo) || tempo < 40 || tempo > 240 || !Number.isInteger(bars) || bars < 1 || bars > 1024) return null;
    if (![8, 12, 16, 24, 32].includes(division) || !Array.isArray(timeSignature) || timeSignature.length !== 2 || !timeSignature.every(Number.isInteger) || !METERS.includes(timeSignature.join("/"))) return null;
    if (!Number.isInteger(timeSignature[0] * division / timeSignature[1])) return null;
    if (!Array.isArray(lanes) || lanes.length !== INSTRUMENTS.length) return null;
    const pattern = {};
    for (let i = 0; i < INSTRUMENTS.length; i++) {
      if (!Array.isArray(lanes[i])) return null;
      const lane = {};
      for (const note of lanes[i]) {
        if (!Array.isArray(note) || note.length !== 2) return null;
        const [step, variant] = note;
        if (!Number.isInteger(step) || step < 0 || step > 200000 || !Number.isInteger(variant) || !VARIANTS[variant]) return null;
        lane[step] = VARIANTS[variant];
      }
      pattern[INSTRUMENTS[i]] = lane;
    }
    return { pattern, bars, tempo, division, timeSignature, kitId, grooveName };
  } catch {
    return null;
  }
}
