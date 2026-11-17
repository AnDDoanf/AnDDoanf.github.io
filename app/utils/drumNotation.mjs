const PITCHES = {
  crash: "^c'", ride: "^a", cowbell: "^b", hihat: "^g", openhat: "^g",
  snare: "c", tom: "e", midtom: "d", lowtom: "A", kick: "F",
};

function noteFor(instrument, variant) {
  if (!variant || variant === "off") return "";
  if (variant === "foot") return "^D";
  if (variant === "kick-hat-foot") return "F^D";
  if (variant === "cross-stick") return "^c";
  if (variant === "bell") return "^b";
  if (variant === "stacker") return "^d'";
  if (variant === "click" || variant === "click-accent") return "^e'";
  if (instrument === "snare" && variant === "ghost") return "_c";
  return PITCHES[instrument] || "";
}

export function grooveToAbc({ pattern, bars, division, timeSignature, pageWidth = 1000 }) {
  const triplets = division === 12 || division === 24;
  const compound = timeSignature[1] === 8 && [6, 9, 12].includes(timeSignature[0]);
  const stepsPerBar = timeSignature[0] * division / timeSignature[1];
  const stepsPerBeat = triplets ? 3 : division / timeSignature[1] * (compound ? 3 : 1);
  const beatsPerBar = stepsPerBar / stepsPerBeat;
  const measures = [];

  for (let bar = 0; bar < bars; bar++) {
    const beats = [];
    for (let beat = 0; beat < beatsPerBar; beat++) {
      const events = [];
      for (let offset = 0; offset < stepsPerBeat; offset++) {
        const step = bar * stepsPerBar + beat * stepsPerBeat + offset;
        const notes = Object.entries(pattern).flatMap(([instrument, positions]) => {
          const variant = positions[step];
          const pitch = noteFor(instrument, variant);
          return pitch ? [{ pitch, variant, instrument }] : [];
        });
        events.push(notes);
      }
      let group = "";
      for (let offset = 0; offset < events.length;) {
        const notes = events[offset];
        let duration = 1;
        while (!triplets && offset + duration < events.length && !events[offset + duration].length) duration++;
        const pitches = [...new Set(notes.map((note) => note.pitch))].join("");
        let decoration = "";
        if (notes.some(({ variant }) => variant === "accent" || variant === "click-accent")) decoration += "!accent!";
        if (notes.some(({ instrument, variant }) => instrument === "openhat" || variant === "open")) decoration += "!open!";
        if (notes.some(({ variant }) => variant === "buzz")) decoration += "!///!";
        if (notes.some(({ variant }) => variant === "flam")) decoration += "{/c}";
        group += decoration + (pitches ? `[${pitches}]` : "z") + duration;
        offset += duration;
      }
      beats.push((triplets ? "(3:2:3" : "") + group);
    }
    measures.push(beats.join(" "));
  }

  return [
    "X:1", `M:${timeSignature.join("/")}`, `L:1/${triplets ? division * 2 / 3 : division}`,
    `%%pagewidth ${Math.min(900, Math.max(320, pageWidth))}px`, "%%leftmargin 12px", "%%rightmargin 12px",
    "%%topspace 12px", "%%scale 1.7", "%%stretchlast 0.01", "%%stretchstaff 0", "%%flatbeams 1", "%%ornament up",
    ...(division === 32 || triplets ? ["%%barsperstaff 1"] : []),
    "%%beginsvg", '<defs><path id="drumCross" d="M-3-3L3 3M-3 3L3-3" class="stroke" style="stroke-width:1.2"/><path id="drumTriangle" d="M-3 2H3L0-4Z" class="stroke"/><g id="drumGhost"><ellipse rx="3.8" ry="2.7" transform="rotate(-20)" fill="currentColor" stroke="none"/><path d="M-7-5Q-10 0-7 5M7-5Q10 0 7 5" class="stroke" style="stroke-width:.8"/></g></defs>', "%%endsvg",
    ...["^g", "^a", "^c'", "^d'", "^e'", "^c", "^D"].map((pitch) => `%%map drum ${pitch} heads=drumCross print=${pitch.replace("^", "")}`),
    "%%map drum ^b heads=drumTriangle print=a", "%%map drum _c heads=drumGhost print=c", "K:C clef=perc", "V:Drums stem=up", "%%voicemap drum",
    measures.join(" | ") + " |]",
  ].join("\n");
}
