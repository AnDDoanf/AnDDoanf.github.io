// Performance-oriented half-bar studies. These are original arrangements,
// not transcriptions or claims that every ballad calls for the same fill.
const voices = {
  s: ["snare", "ghost"], S: ["snare", "normal"], a: ["snare", "accent"],
  t: ["tom", "normal"], T: ["tom", "accent"], m: ["midtom", "normal"], M: ["midtom", "accent"],
  f: ["lowtom", "normal"], F: ["lowtom", "accent"], k: ["kick", "normal"],
  z: ["snare", "flam"], x: ["snare", "cross-stick"], c: ["crash", "normal"],
};
function notes(...events) {
  const pattern = {};
  for (const [step, codes] of events) {
    for (const code of codes) {
      const [instrument, variant] = voices[code];
      (pattern[instrument] ||= {})[step] = variant;
    }
  }
  return pattern;
}
function fill(slug, title, pattern, description, options = {}) {
  const division = options.division || 32;
  const entrance = division / 2;
  const arranged = Object.fromEntries(Object.entries(pattern).map(([id, lane]) => [id,
    Object.fromEntries(Object.entries(lane).map(([step, variant]) => {
      if (!Number.isInteger(Number(step)) || Number(step) < 0 || Number(step) >= entrance) throw new Error(`${slug}: fill must fit beats 3?4`);
      return [Number(step) + entrance, variant];
    })),
  ]));
  const hatSpacing = division === 12 ? 1 : division === 24 ? 2 : division / 8;
  arranged.hihat = {};
  for (let step = 0; step < entrance; step += hatSpacing) arranged.hihat[step] = "ghost";
  (arranged.kick ||= {})[0] = "normal";
  (arranged.snare ||= {})[division / 4] = "cross-stick";
  return {
    slug: `ballad-fill-${slug}`, title: `Ballad: ${title}`, tempo: 78,
    division, bars: 1, timeSignature: [4, 4], style: "ballad", source: "ballad-phrasing",
    pattern: arranged, fillStartBeat: 3, grooveBeats: 2,
    description: `Keep the groove on beats 1?2. Enter the fill on beat 3 and resolve into the next downbeat. ${description}`,
    ...options,
  };
}

// Stable slugs replace the unsuitable multi-bar chops. Note numbers below
// are relative to beat 3. Short 32nd/triplet ornaments sit inside a melodic phrase.
export const advancedBalladFills = [
  fill("last-beat-answer", "Flam Motif with Diddle Pickup", notes([0,"z"],[4,"T"],[6,"s"],[7,"s"],[8,"M"],[10,"f"],[14,"k"]), "A flam opens the phrase; a quiet snare double connects two tom statements. Leave air after the low tom and use the late kick to lead home.", { sticking: "Flam, single tom, quiet LL pickup, two descending tom singles" }),
  fill("rim-click-pickup", "Delayed Tom Answer", notes([0,"T"],[3,"s"],[4,"M"],[8,"s"],[9,"s"],[10,"F"],[14,"k"]), "A delayed soft pickup answers the first tom. The brief double before the floor tom supplies detail without turning both beats into a roll."),
  fill("snare-tom-pair", "Six-Stroke Burst and Tom Reply", notes([0,"T"],[2,"s"],[3,"s"],[4,"s"],[5,"s"],[6,"F"],[10,"m"],[14,"k"]), "One six-stroke figure occupies beat 3. A separated middle-tom reply and kick leave space on beat 4.", { sticking: "R LL RR L on beat 3; separate tom and kick reply on beat 4", source: "ballad-rudiments" }),
  fill("low-tom-answer", "Paradiddle into a Low-Tom Cadence", notes([0,"T"],[1,"s"],[2,"s"],[3,"s"],[4,"M"],[5,"s"],[6,"s"],[7,"s"],[10,"F"],[14,"k"]), "A single paradiddle cycle is the brief flourish, followed by a low-tom cadence and a late kick. Keep the taps well below the leading accents.", { sticking: "RLRR LRLL on beat 3; low tom and kick after it", source: "ballad-rudiments" }),
  fill("three-note-descent", "Dotted Tom Motif", notes([0,"T"],[3,"s"],[4,"m"],[6,"k"],[8,"F"],[12,"S"],[14,"k"]), "Dotted spacing and one kick connect a three-pitch tom motif. Let the last snare note ring rather than adding a continuous run."),
  fill("soft-four-stroke", "Sextuplet Pickup, Broad Resolution", notes([0,"T"],[1,"s"],[2,"s"],[3,"m"],[4,"k"],[5,"k"],[6,"F"],[9,"S"]), "A six-note triplet pickup occupies beat 3; two broad strokes resolve beat 4. The foot double belongs to the pickup, not an ostinato under the whole phrase.", { division: 24, tempo: 76, sticking: "RLLRKK pickup; separate floor tom and snare reply" }),
  fill("cross-stick-floor", "Cross-Stick to Open Tom Phrase", notes([0,"x"],[4,"T"],[8,"m"],[10,"s"],[11,"s"],[12,"F"]), "The rim click keeps the verse character before the tom sound opens. A small snare double decorates the final tom, then the remaining space carries the transition."),
  fill("dotted-answer", "Herta Pickup into Held Toms", notes([0,"s"],[1,"s"],[2,"T"],[4,"m"],[8,"F"],[12,"S"]), "Use one short-short-long-long herta, followed by two separated answers. The herta is an ornament within the cadence.", { sticking: "RLRL herta on beat 3, then two separated single strokes", source: "ballad-rudiments" }),
  fill("gentle-flam", "Flam and Backbeat Answer", notes([0,"z"],[4,"T"],[8,"a"],[10,"s"],[11,"s"],[12,"F"]), "A beat-3 flam and tom lead to the beat-4 backbeat. Two soft taps connect that backbeat to the last floor tom."),
  fill("kick-between-hands", "Hand-Foot Pickup to Tom Cadence", notes([0,"T"],[2,"s"],[3,"k"],[4,"k"],[8,"M"],[12,"F"],[14,"S"]), "A compact hand-foot pickup gives way to spaced descending toms. The change from close notes to broad notes creates the shape."),
  fill("soft-eighth-descent", "Rising Then Falling Tom Motif", notes([0,"f"],[4,"m"],[6,"t"],[8,"T"],[10,"s"],[11,"s"],[12,"M"],[14,"F"]), "Rise through the toms in the first beat, then answer downwards with a short double-stroke pickup. The melodic contour is the main phrase."),
  fill("snare-crescendo", "Snare Crescendo with a Short Release", notes([0,"s"],[4,"S"],[8,"a"],[9,"s"],[10,"s"],[11,"t"],[12,"F"]), "Two broad snare strokes build to beat 4; a four-note flourish releases into the floor tom. Keep the increasing volume separate from the tempo."),
  fill("floor-tom-crescendo", "Two-Hand Tom Punctuation", notes([0,"Tf"],[4,"s"],[6,"m"],[8,"MF"],[12,"S"],[14,"k"]), "Two deliberately placed two-hand tom unisons provide weight. Single notes between them leave room for the song; no extra pedal pattern is imposed."),
  fill("two-beat-breath", "Motif, Breath, and Triplet Answer", notes([0,"T"],[3,"m"],[6,"s"],[7,"s"],[8,"t"],[9,"k"],[10,"k"],[11,"F"]), "Two spaced notes establish the motif before a beat-4 sextuplet answer. The short burst ends the phrase rather than extending into another fill bar.", { division: 24, tempo: 80 }),
  fill("quiet-double-pickup", "Doubles between Tom Landings", notes([0,"T"],[2,"s"],[3,"s"],[4,"M"],[8,"F"],[10,"s"],[11,"s"],[12,"S"]), "Quiet doubles connect the larger tom notes, with a clear breath before beat 4. Aim for a consistent soft-to-loud balance on every pickup.", { sticking: "Accented single, quiet LL, single; accented single, quiet RR, single" }),
  fill("power-ballad-landing", "Chorus Setup with a Final Flurry", notes([0,"a"],[4,"T"],[8,"M"],[10,"s"],[11,"s"],[12,"t"],[13,"m"],[14,"F"]), "Broad snare and tom strokes set up a five-note closing flourish. Keep the low tom as the final destination and allow the next downbeat to be the arrival.", { tempo: 82 }),
  fill("halftime-response", "Half-Time Backbeat and Answer", notes([0,"a"],[4,"s"],[6,"T"],[8,"m"],[10,"k"],[11,"k"],[12,"F"]), "The beat-3 snare keeps the half-time backbeat intact. A quiet pickup, melodic tom answer, and local kick double complete the transition."),
  fill("soft-tom-pairs", "Moving Doubles with a Long Finish", notes([0,"T"],[1,"t"],[4,"M"],[5,"m"],[8,"s"],[9,"s"],[10,"s"],[11,"s"],[12,"F"]), "Two separated tom doubles lead to a short snare double-stroke roll and a held floor-tom finish. Match the second note of each tom double to the first.", { sticking: "RR, LL, RRLL, final single; the pairs are separated by space", source: "ballad-rudiments" }),
  fill("buzz-to-rim", "Flam Pickup and Warm Low-Tom Finish", notes([0,"z"],[4,"s"],[5,"s"],[6,"T"],[8,"m"],[12,"F"],[14,"k"]), "A flam and brief snare double lead into broad descending toms. Keep the grace note of the flam quiet and let the toms sustain."),
  fill("six-eight-descent", "Triplet Descent with a Diddle Answer", notes([0,"T"],[2,"m"],[4,"F"],[6,"s"],[7,"s"],[8,"t"],[10,"F"]), "Three eighth-triplet attacks descend on beat 3; a short sixteenth-triplet double decorates the beat-4 reply. Keep both beats equal in length.", { division: 24, tempo: 76 }),
  fill("six-eight-breath", "Triplet Motif with a Last-Beat Pickup", notes([0,"T"],[2,"m"],[4,"k"],[6,"F"],[9,"s"],[10,"s"],[11,"S"]), "The first beat states a three-note motif. A spaced floor tom and late three-stroke pickup prepare the next groove.", { division: 24, tempo: 78 }),
  fill("twelve-eight-reply", "Six-Stroke Triplet Flourish", notes([0,"T"],[1,"s"],[2,"s"],[3,"s"],[4,"s"],[5,"F"],[6,"M"],[9,"F"]), "A single RLLRRL sextuplet flourish is followed by two broad tom strokes. The soft snare doubles sit inside the phrase, below the accented tom melody.", { division: 24, tempo: 74, sticking: "RLLRRL on beat 3; two broad tom replies on beat 4", source: "ballad-rudiments" }),
  fill("compound-soft-roll", "Triplet Question and Answer", notes([0,"T"],[2,"s"],[3,"s"],[4,"M"],[6,"F"],[8,"m"],[10,"S"]), "The question has a small doubled pickup; the answer uses three broader attacks. Keep the triplet pulse audible without filling every slot.", { division: 24, tempo: 78 }),
  fill("waltz-answer", "Melodic Snare-to-Tom Turnaround", notes([0,"z"],[3,"s"],[4,"T"],[6,"m"],[8,"F"],[12,"s"],[13,"s"],[14,"S"]), "A flam and delayed pickup start the melody; a late snare double turns the phrase back toward the next bar. The last pickup stays quiet.", { tempo: 76 }),
  fill("two-bar-goodbye", "Tom Hook with a Brief Closing Roll", notes([0,"T"],[4,"m"],[6,"F"],[8,"s"],[9,"s"],[10,"t"],[11,"m"],[12,"F"],[14,"k"]), "A repeatable three-note tom hook leads to a short closing roll and kick pickup. Keep the shape recognizable so it can function as a recurring transition.", { tempo: 80 }),
];
