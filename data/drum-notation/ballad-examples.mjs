const hits = (steps, variant = "normal") => Object.fromEntries(steps.map((step) => [step, variant]));
const eighths = [0, 2, 4, 6, 8, 10, 12, 14];
const quarters = [0, 4, 8, 12];
const compound = { division: 8, timeSignature: [12, 8] };
const sixEight = { division: 8, timeSignature: [6, 8] };
const waltz = { timeSignature: [3, 4] };

function groove(slug, title, tempo, pattern, description, options = {}) {
  return { slug: `ballad-${slug}`, title: `Ballad: ${title}`, tempo, pattern, description, source: "ballad", style: "ballad", ...options };
}
// Original practice arrangements: space, restrained cymbals, and controlled dynamics.
export const balladGrooves = [
  groove("quarter-cross-stick", "Quarter-Note Cross-Stick", 68, { hihat: hits(quarters, "ghost"), kick: [0, 8], snare: hits([4, 12], "cross-stick") }, "Quiet quarter hats leave space for the vocal; cross-stick marks the backbeat."),
  groove("eighth-cross-stick", "Eighth-Note Cross-Stick", 72, { hihat: hits(eighths, "ghost"), kick: [0, 8], snare: hits([4, 12], "cross-stick") }, "Soft eighths maintain slow-time accuracy around the rim-click backbeat."),
  groove("soft-pop", "Soft Pop Backbeat", 74, { hihat: hits(eighths, "ghost"), kick: [0, 8], snare: [4, 12] }, "A full snare backbeat sits above quiet hats; resist rushing the spaces."),
  groove("ride-quarters", "Ride Quarter Notes", 66, { ride: hits(quarters, "ghost"), kick: [0, 8], snare: hits([4, 12], "cross-stick") }, "Low-volume ride quarters support an intimate verse."),
  groove("ride-eighths", "Ride Eighth Notes", 76, { ride: hits(eighths, "ghost"), kick: [0, 8, 14], snare: [4, 12] }, "A restrained ride pattern and late bass-drum pickup lift the phrase."),
  groove("hushed-verse", "Hushed Verse", 62, { hihat: hits(quarters, "ghost"), kick: hits([0, 8], "ghost"), snare: hits([4, 12], "ghost") }, "All three voices stay soft; use the empty space as part of the groove."),
  groove("open-hat-lift", "Open-Hat Lift", 78, { hihat: hits(quarters, "ghost"), kick: [0, 8], snare: [4, 12], openhat: [14] }, "One final open hat creates a small lift without filling the whole bar."),
  groove("whisper-sixteenths", "Whispered Sixteenths", 64, { hihat: hits(Array.from({ length: 16 }, (_, i) => i), "ghost"), kick: [0, 8, 10], snare: hits([4, 12], "cross-stick") }, "Quiet sixteenth hats are a texture, with the rim click kept clearly audible."),
  groove("half-time-pocket", "Half-Time Pocket", 80, { hihat: hits(eighths, "ghost"), kick: [0, 10], snare: [8] }, "The sole snare backbeat lands on beat 3 above soft eighth-note hats."),
  groove("sparse-half-time", "Sparse Half-Time", 76, { hihat: hits(quarters, "ghost"), kick: [0, 14], snare: hits([8], "cross-stick") }, "Quarter hats and a single cross-stick leave room around the melody."),
  groove("half-time-ride", "Half-Time Ride", 82, { ride: hits(eighths, "ghost"), kick: [0, 6, 10], snare: [8] }, "Ride eighths support a broad beat-3 backbeat and two kick pickups."),
  groove("floor-tom-heartbeat", "Floor-Tom Heartbeat", 70, { lowtom: hits(quarters, "ghost"), kick: [0, 8], snare: hits([4, 12], "cross-stick") }, "Quiet floor-tom quarters replace the cymbal texture."),
  groove("half-time-ghost", "Half-Time Ghost Pickup", 78, { hihat: hits(eighths, "ghost"), kick: [0, 7, 10], snare: { 5: "ghost", 8: "normal" } }, "A single quiet snare pickup leads into the half-time backbeat."),
  groove("soft-snare-response", "Soft Snare Response", 72, { hihat: hits(eighths, "ghost"), kick: [0, 8, 14], snare: { 4: "normal", 11: "ghost", 12: "normal" } }, "One ghost note just before beat 4 answers the vocal phrase."),
  groove("broken-hat-verse", "Broken-Hat Verse", 68, { hihat: hits([0, 2, 4, 8, 10, 12], "ghost"), kick: [0, 6, 8], snare: hits([4, 12], "cross-stick") }, "Leave the ands of 2 and 4 empty to make a breathy verse pattern."),
  groove("six-eight-cross-stick", "Six-Eight Cross-Stick", 96, { hihat: hits([0, 1, 2, 3, 4, 5], "ghost"), kick: [0], snare: hits([3], "cross-stick") }, "Two dotted-quarter pulses, felt at 64 per minute, with a cross-stick on the second pulse.", sixEight),
  groove("six-eight-ride", "Six-Eight Ride", 105, { ride: hits([0, 1, 2, 3, 4, 5], "ghost"), kick: [0, 5], snare: [3] }, "Quiet ride eighths and a late kick support a two-pulse compound bar.", sixEight),
  groove("twelve-eight-pop", "Twelve-Eight Pop", 90, { hihat: hits(Array.from({ length: 12 }, (_, i) => i), "ghost"), kick: [0, 6], snare: [3, 9] }, "A slow triplet-based ballad with clear backbeats and soft cymbals.", compound),
  groove("gentle-shuffle", "Gentle Shuffle", 102, { hihat: hits([0, 2, 3, 5, 6, 8, 9, 11], "ghost"), kick: [0, 6], snare: hits([3, 9], "cross-stick") }, "Long-short hats use exact thirds; the backbeat stays light.", compound),
  groove("compound-half-time", "Compound Half-Time", 108, { ride: hits([0, 3, 6, 9], "ghost"), kick: [0, 8], snare: [6] }, "Sparse ride pulses and a pulse-3 snare make a broad compound half-time feel.", compound),
  groove("waltz-verse", "Waltz Verse", 72, { hihat: hits([0, 2, 4, 6, 8, 10], "ghost"), kick: [0], snare: hits([4, 8], "cross-stick") }, "A gentle three-quarter bar with cross-stick on beats 2 and 3.", waltz),
  groove("two-bar-verse", "Two-Bar Verse", 66, { hihat: hits(Array.from({ length: 16 }, (_, i) => i * 2), "ghost"), kick: [0, 8, 16, 24, 30], snare: hits([4, 12, 20, 28], "cross-stick") }, "Repeat the quiet verse pocket, adding a single late kick in the second bar.", { bars: 2 }),
  groove("chorus-entry", "Chorus Entry", 78, { crash: [0], hihat: hits(eighths.slice(1), "ghost"), kick: [0, 6, 8, 14], snare: hits([4, 12], "accent") }, "A downbeat crash replaces the first hat; stronger backbeats mark the chorus."),
  groove("two-bar-rise", "Two-Bar Dynamic Rise", 76, { hihat: { ...hits(eighths, "ghost"), ...hits(eighths.map(i => i + 16), "normal") }, kick: [0, 8, 16, 22, 24], snare: { 4: "cross-stick", 12: "cross-stick", 20: "normal", 28: "normal" } }, "Cross-stick and soft hats open into a fuller second-bar backbeat.", { bars: 2 }),
  groove("ride-and-foot", "Ride and Foot-Hat", 70, { ride: hits(quarters, "ghost"), hihat: hits([4, 12], "foot"), kick: hits([0, 8], "ghost"), snare: hits([4, 12], "cross-stick") }, "Soft ride quarters with pedal hats tucked under the cross-stick backbeat."),
];

export { advancedBalladFills as balladFills } from "./advanced-ballad-fills.mjs";
