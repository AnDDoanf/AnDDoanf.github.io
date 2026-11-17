const seq = (count, start = 0, stride = 1) => Array.from({ length: count }, (_, i) => start + i * stride);
const eighths = seq(8, 0, 2);
const quarters = [0, 4, 8, 12];
const sixteenths = seq(16);
const hits = (steps, variant) => Object.fromEntries(steps.map((step) => [step, variant]));
const rock = (kick = [0, 8], hihat = eighths, snare = [4, 12]) => ({ hihat, kick, snare });
const compound = { division: 8, timeSignature: [12, 8] };
const shuffleHat = [0, 2, 3, 5, 6, 8, 9, 11];

// Each pattern is a practice arrangement of a referenced concept, not a song transcription.
export const sources = {
  "ballad-phrasing": ["Half Bar Rock Ballad Fill: Phrasing and Variations", "https://bypass.drumscore.com/lessons/level-2/fills/fill-concepts/half-bar-rock-ballad-fill"],
  "ballad-rudiments": ["How To Play A Rock Ballad Like A Pro: Dynamics and Timing", "https://www.drumeo.com/beat/how-to-play-a-rock-ballad-like-a-pro-todd-sucherman/"],
  "advanced-linear": ["Cool Linear Drum Fill: 32nd-Note Applications", "https://www.drumlessons.com/drum-lessons/rock-drumming/cool-linear-drum-fill/"],
  "advanced-groupings": ["Odd Groupings and Linear Drum Fills", "https://www.drumeo.com/beat/?p=27821"],
  "six-stroke": ["Six Stroke Roll: Drum Set Applications", "https://www.drumlessons.com/drum-lessons/drum-set-rudiments/six-stroke-roll/"],
  ballad: ["How To Play A Rock Ballad Like A Pro", "https://www.drumeo.com/beat/how-to-play-a-rock-ballad-like-a-pro-todd-sucherman/"],
  rock: ["Drum Beats Everyone Should Know", "https://www.drumeo.com/beat/drum-beats-everyone-should-know/"],
  beginner: ["13 Easy Drum Beats For Beginners", "https://www.drumeo.com/beat/13-easy-beginner-drum-beats/"],
  intermediate: ["10 Fun Intermediate Drum Beats", "https://www.drumeo.com/beat/intermediate-drum-beats/"],
  styles: ["5 Styles Any Beginner Drummer Can Play", "https://www.drumeo.com/beat/5-styles-beginner-drummers/"],
  shuffle: ["5 Drumming Styles You Have Probably Never Heard", "https://www.drumeo.com/beat/5-drumming-styles-youve-probably-never-heard/"],
  bossa: ["Introduction To Brazilian Grooves: The Bossa Nova", "https://www.drumeo.com/beat/the-bossa-nova/"],
  fills: ["7 Beginner Drum Fills", "https://www.drumeo.com/beat/?p=27819"],
  linear: ["Linear Drum Fills", "https://www.drumlessons.com/drum-lessons/live-lessons-archive/linear-drum-fills/"],
  groups: ["3 Easy Fills That Sound Hard", "https://www.youtube.com/watch?v=LZAHSmyZU0Q"],
  rudiments: ["Applying Rudiments To Your Drum Set", "https://www.drumeo.com/beat/thomas-pridgen/"],
};

export const grooveCorrections = {
  "four-on-the-floor": { pattern: rock(quarters), description: "Quarter-note kicks, eighth-note hats, and snare backbeats." },
  "classic-rock": { pattern: { ...rock([0, 6, 8], eighths.slice(1)), crash: [0] } },
  "pop-rock": { description: "Sixteenth-note hats, with an extra kick on the and of beat 3." },
  disco: { pattern: { hihat: quarters, openhat: [2, 6, 10, 14], kick: quarters, snare: [4, 12] }, description: "Open offbeat hats alternate with closed downbeat hats over four quarter-note kicks." },
  funk: { pattern: { ...rock([0, 7, 10], [0, 2, 3, 6, 8, 10, 11]), openhat: [14], snare: { ...hits([4, 12], "accent"), ...hits([5, 9], "ghost") } }, description: "Syncopated kick with genuine soft snare ghost notes." },
  shuffle: { ...compound, tempo: 150, title: "Blues Shuffle (12/8)", pattern: { hihat: shuffleHat, kick: [0, 6], snare: [3, 9] }, description: "Long-short hats on exact thirds, counted as four dotted-quarter pulses." },
  "punk-rock": { pattern: rock([0, 6, 8, 10]), description: "Fast eighth-note hats and kick pickups, with backbeats on 2 and 4." },
  "blues-rock": { title: "Straight Blues Rock", description: "An unswung, quarter-note ride-led blues-rock practice variation." },
};
export const fillCorrections = {
  "tom-walkdown": { pattern: { snare: [0, 2, 4, 6], tom: [8, 10], midtom: [12], lowtom: [14] }, description: "Eight hand strokes descend from snare through the toms." },
  "snare-build": { pattern: { snare: { ...hits(seq(4), "ghost"), ...hits(seq(8, 4), "normal"), ...hits(seq(4, 12), "accent") } }, description: "Sixteenths increase from ghost notes to normal hits and then accents." },
  "classic-sixteenth": { pattern: { snare: seq(4), tom: seq(4, 4), midtom: seq(4, 8), lowtom: seq(4, 12) }, description: "Four straight sixteenths per drum, descending around the kit." },
  "kick-and-toms": { pattern: { kick: [0, 3, 8, 11], tom: [1, 2, 9, 10], midtom: [4, 5], lowtom: [12, 13], snare: [6, 7, 14, 15] }, description: "Single-instrument hand-foot cells alternate with paired hand strokes." },
  "tom-triplets": { ...compound, title: "Tom Triplets (12/8)", pattern: { snare: [0, 1, 2], tom: [3, 4, 5], midtom: [6, 7, 8], lowtom: [9, 10, 11] }, description: "Twelve equal strokes make four true triplet groups." },
  "kick-snare-unison": { pattern: { kick: quarters, snare: quarters } },
  "rolling-toms": { pattern: { tom: [0, 3, 6, 9, 12], midtom: [1, 4, 7, 10, 13], lowtom: [2, 5, 8, 11, 14, 15] }, description: "Three-drum cycles cross straight sixteenths, ending with a floor-tom pair." },
  "snare-flam-finish": { pattern: { snare: { ...hits(quarters, "normal"), 15: "flam" }, kick: [0, 8] }, description: "The final a-of-4 stroke is an actual flam articulation." },
  "four-on-the-floor-fill": { pattern: { kick: quarters, snare: [4, 12, 13, 14, 15] } },
};

// [slug, title, tempo, lanes, performance note, reference key, timing overrides]
export const extraGrooves = [
  ["quarter-note-rock", "Quarter-Note Rock", 100, rock([0, 8], quarters), "Quarter-note hats leave space around the backbeat.", "beginner"],
  ["double-kick-pickup", "Double Kick Pickup", 100, rock([0, 2, 8]), "Two opening kick eighths support a steady backbeat.", "rock"],
  ["late-kick-rock", "Late Kick Rock", 104, rock([0, 7, 8, 14]), "Kick anticipations on the a of 2 and the and of 4.", "rock"],
  ["ride-rock", "Ride Rock", 108, { ride: eighths, snare: [4, 12], kick: [0, 8, 14] }, "Ride eighths with a late kick pickup.", "rock"],
  ["open-hat-rock", "Open-Hat Rock", 108, { ...rock([0, 8], [0, 2, 4, 6, 8, 10, 12]), openhat: [14] }, "An open hat replaces the final closed eighth.", "rock"],
  ["flam-backbeat-rock", "Flam Backbeat Rock", 96, { ...rock(), hihat: [0, 2, 6, 8, 10, 14], snare: hits([4, 12], "flam") }, "Both hands play each flam; omit simultaneous hats.", "intermediate"],
  ["no-downbeat-kick", "No Downbeat Kick", 96, rock([2, 6, 10]), "Kick enters on the and of 1, leaving the downbeat empty.", "intermediate"],
  ["two-bar-pop", "Two-Bar Pop Phrase", 110, { hihat: seq(16, 0, 2), kick: [0, 8, 16, 22, 24, 30], snare: [4, 12, 20, 28] }, "Second-bar kick pickups vary a two-measure phrase.", "beginner", { bars: 2 }],
  ["ghost-note-funk", "Ghost-Note Funk", 90, { ...rock([0, 6, 10]), snare: { ...hits([4, 12], "accent"), ...hits([3, 7, 11, 15], "ghost") } }, "Quiet snare taps surround strong backbeats.", "rock"],
  ["sixteenth-funk", "Sixteenth Funk", 92, rock([0, 3, 6, 10, 15], sixteenths), "Continuous hats above a syncopated bass drum.", "intermediate"],
  ["offbeat-hat-funk", "Offbeat Hat Funk", 100, rock([0, 7, 8, 14], [2, 6, 10, 14]), "Offbeat hats answer syncopated kicks.", "beginner"],
  ["displaced-snare-funk", "Displaced Snare Funk", 90, rock([0, 6, 9], eighths, [7, 12]), "Delay the first snare to the a of 2.", "rock"],
  ["cross-stick-soul", "Cross-Stick Soul", 78, { ...rock([0, 8, 14]), snare: hits([4, 12], "cross-stick") }, "Cross-stick backbeats with relaxed eighths.", "beginner"],
  ["half-time-funk", "Half-Time Funk", 80, { ...rock([0, 3, 10, 14]), snare: { 8: "accent", ...hits([5, 7, 11, 15], "ghost") } }, "Beat-3 snare surrounded by quiet taps.", "rock"],
  ["linear-funk", "Linear Funk Study", 92, { hihat: [0, 2, 5, 8, 10, 13], kick: [1, 6, 9, 14], snare: [4, 7, 12, 15] }, "No simultaneous instrument attacks.", "intermediate"],
  ["ride-bell-funk", "Ride Bell Funk", 96, { ride: { ...hits(quarters, "bell"), ...hits([2, 6, 10, 14], "normal") }, kick: [0, 7, 10], snare: [4, 12] }, "Bell quarters alternate with normal ride eighths.", "beginner"],
  ["offbeat-dance", "Offbeat Dance", 124, { kick: quarters, openhat: [2, 6, 10, 14], snare: [4, 12] }, "Four kicks with open offbeats and snare backbeats.", "beginner"],
  ["sixteenth-dance", "Sixteenth Dance", 124, { ...rock(quarters, sixteenths.filter(i => ![2, 6, 10, 14].includes(i))), openhat: [2, 6, 10, 14] }, "Closed sixteenths fill gaps around the open hats.", "intermediate"],
  ["half-time-electronic", "Half-Time Electronic", 140, rock([0, 6, 11], sixteenths, [8]), "Half-time backbeat with continuous hats.", "rock"],
  ["broken-dance", "Broken Dance Beat", 126, rock([0, 6, 10, 15], [0, 2, 6, 8, 10, 14]), "Broken bass-drum figures under sparse hats.", "intermediate"],
  ["floor-tom-dance", "Floor-Tom Dance", 118, { kick: quarters, lowtom: [2, 6, 10, 14], snare: [4, 12] }, "Offbeat floor toms answer steady bass drum.", "beginner"],
  ["dance-kick-pickup", "Dance Kick Pickup", 122, rock([0, 4, 8, 12, 14]), "Add an and-of-4 bass-drum pickup.", "intermediate"],
  ["slow-blues", "Slow Blues (12/8)", 90, { hihat: seq(12), kick: [0, 6], snare: [3, 9] }, "All three eighths of each dotted-quarter pulse.", "styles", compound],
  ["ride-shuffle", "Ride Shuffle (12/8)", 150, { ride: shuffleHat, kick: [0, 6], snare: [3, 9] }, "Long-short cymbal rhythm moved to the ride.", "rock", compound],
  ["half-time-shuffle", "Half-Time Shuffle Study (12/8)", 144, { hihat: shuffleHat, kick: [0, 5, 8], snare: { 6: "accent", ...hits([1, 4, 7, 10], "ghost") } }, "Pulse-3 backbeat and middle-triplet ghost notes.", "rock", compound],
  ["four-kick-shuffle", "Four-Kick Shuffle (12/8)", 156, { hihat: shuffleHat, kick: [0, 3, 6, 9], snare: [3, 9] }, "Bass drum on each dotted-quarter pulse.", "rock", compound],
  ["flat-tire-shuffle", "Flat-Tire Shuffle Study (12/8)", 150, { ride: shuffleHat, kick: [0, 3, 6, 9], hihat: hits([3, 9], "foot"), snare: hits([2, 5, 8, 11], "accent") }, "Last-third snare accents, with foot hats on 2 and 4.", "shuffle", compound],
  ["shuffle-kick-pickups", "Shuffle Kick Pickups (12/8)", 144, { hihat: shuffleHat, kick: [0, 2, 6, 8], snare: [3, 9] }, "Late-triplet kick pickups answer long-short hats.", "rock", compound],
  ["jazz-swing", "Jazz Swing (12/8)", 165, { ride: [0, 3, 5, 6, 9, 11], hihat: hits([3, 9], "foot") }, "Swing ride with hi-hat foot on pulses 2 and 4.", "styles", compound],
  ["jazz-feathering", "Jazz Feathering Study (12/8)", 156, { ride: [0, 3, 5, 6, 9, 11], hihat: hits([3, 9], "foot"), kick: hits([0, 3, 6, 9], "ghost") }, "Very soft quarter-pulse bass drum under swing ride.", "rock", compound],
  ["jazz-snare-comping", "Jazz Snare Comping (12/8)", 150, { ride: [0, 3, 5, 6, 9, 11], hihat: hits([3, 9], "foot"), snare: hits([8, 9], "ghost") }, "Quiet snare responses lead into pulse 4.", "styles", compound],
  ["jazz-waltz", "Jazz Waltz Study (9/8)", 144, { ride: [0, 3, 5, 6], hihat: hits([3], "foot"), kick: [0], snare: hits([8], "ghost") }, "Three dotted-quarter pulses with a late snare response.", "rock", { division: 8, timeSignature: [9, 8] }],
  ["bossa-nova-basic", "Bossa Nova Basic", 110, { hihat: eighths, kick: [0, 6, 8, 14], snare: hits([4, 12], "cross-stick") }, "Beginner bossa foot ostinato and cross-stick backbeats.", "styles"],
  ["bossa-nova-two-bar", "Bossa Nova Two-Bar Study", 112, { ride: seq(16, 0, 2), kick: [0, 6, 8, 14, 16, 22, 24, 30], snare: hits([0, 6, 12, 20, 26], "cross-stick") }, "A two-bar 3+2 cross-stick practice phrase.", "bossa", { bars: 2 }],
  ["bossa-ride-bell", "Bossa Bell Coordination", 108, { ride: hits(eighths, "bell"), kick: [0, 6, 8, 14], snare: hits([4, 12], "cross-stick") }, "Move beginner bossa timekeeping to the ride bell.", "styles"],
  ["country-two-beat", "Country Two-Beat", 112, { hihat: eighths, kick: [0, 8], snare: [4, 12, 14] }, "Country practice variation with a late snare pickup.", "beginner"],
  ["country-train", "Country Train Beat", 110, { kick: quarters, snare: { ...hits(quarters, "ghost"), ...hits([2, 6, 10, 14], "accent") } }, "Alternating snare eighths accent every offbeat.", "styles"],
  ["rock-waltz", "Rock Waltz (3/4)", 105, { hihat: [0, 2, 4, 6, 8, 10], kick: [0, 8], snare: [4] }, "Three quarter-note beats with a central snare.", "beginner", { timeSignature: [3, 4] }],
  ["five-four-rock", "Five-Four Rock (3+2)", 100, { hihat: seq(10, 0, 2), kick: [0, 8, 12], snare: [4, 16] }, "Five quarters phrased as three followed by two.", "intermediate", { timeSignature: [5, 4] }],
  ["seven-eight-rock", "Seven-Eight Rock (2+2+3)", 120, { hihat: seq(7, 0, 2), kick: [0, 8], snare: [4, 10] }, "Seven eighths grouped as 2+2+3.", "intermediate", { timeSignature: [7, 8] }],
];

const linear = (sequence, count = 16, start = 0) => {
  const lanes = {};
  for (let i = 0; i < count; i++) (lanes[sequence[i % sequence.length]] ||= []).push(start + i);
  return lanes;
};
// [slug, title, lanes, performance note, reference key, timing overrides]
export const extraFills = [
  ["quarter-snare-fill", "Quarter-Note Snare Fill", { snare: quarters }, "Four spacious snare quarter notes.", "fills"],
  ["eighth-snare-fill", "Eighth-Note Snare Fill", { snare: eighths }, "Eight even single strokes on snare.", "fills"],
  ["sixteenth-snare-fill", "Sixteenth-Note Snare Fill", { snare: sixteenths }, "Sixteen even snare single strokes.", "fills"],
  ["last-beat-snare", "Last-Beat Snare Roll", { snare: [12, 13, 14, 15] }, "Fill beat 4 after three beats of rest.", "fills"],
  ["half-bar-snare", "Half-Bar Snare Roll", { snare: seq(8, 8) }, "Eight sixteenths fill beats 3 and 4.", "fills"],
  ["pat-boone", "Pat Boone Debby Boone", { snare: [8, 10, 12, 13, 14] }, "Count 3-and, 4-e-and on one surface.", "fills"],
  ["splat-boom", "Splat-Boom", { snare: hits(quarters, "flam"), kick: [2, 6, 10, 14] }, "Alternate snare flams and bass-drum eighths.", "fills"],
  ["snare-floor-build", "Snare and Floor Build", { snare: { ...hits([0, 2, 4, 6], "normal"), ...hits([8, 10, 12, 14], "accent") }, lowtom: eighths, kick: quarters }, "Both hands build eighths while the foot holds quarters.", "fills"],
  ["snare-stop-fill", "Snare Stop Fill", { snare: [0, 2, 4, 6, 8] }, "Five eighths lead into space for the rest of the measure.", "fills"],
  ["syncopated-snare-fill", "Syncopated Snare Fill", { snare: [0, 3, 6, 8, 11, 14] }, "Dotted-eighth and eighth gaps make a broken snare phrase.", "groups"],
  ["eighth-tom-descent", "Eighth-Note Tom Descent", { tom: [0, 2], midtom: [4, 6], lowtom: [8, 10, 12, 14] }, "Two high, two middle, and four floor-tom strokes.", "fills"],
  ["sixteenth-tom-descent", "Sixteenth Tom Descent", { tom: seq(4), midtom: seq(4, 4), lowtom: seq(8, 8) }, "Four high, four middle, and eight low strokes.", "fills"],
  ["tom-ascent", "Tom Ascent", { lowtom: seq(4), midtom: seq(4, 4), tom: seq(4, 8), snare: seq(4, 12) }, "Reverse the usual descent, finishing on snare.", "fills"],
  ["snare-tom-answers", "Snare and Tom Answers", { snare: [0, 1, 4, 5, 8, 9, 12, 13], tom: [2, 3], midtom: [6, 7], lowtom: [10, 11, 14, 15] }, "Snare pairs alternate with descending tom pairs.", "fills"],
  ["tom-pairs", "Tom Pair Circuit", { tom: [0, 1, 8, 9], midtom: [2, 3, 10, 11], lowtom: [4, 5, 12, 13], snare: [6, 7, 14, 15] }, "Repeat a circuit with two strokes per drum.", "fills"],
  ["floor-tom-pulse", "Floor-Tom Pulse", { lowtom: eighths, snare: [4, 12], kick: [0, 8] }, "Keep the backbeat under floor-tom eighths.", "fills"],
  ["last-beat-toms", "Last-Beat Tom Descent", { snare: [12], tom: [13], midtom: [14], lowtom: [15] }, "Four descending sixteenths occupy beat 4.", "fills"],
  ["half-bar-toms", "Half-Bar Tom Descent", { tom: [8, 9], midtom: [10, 11], lowtom: [12, 13, 14, 15] }, "A two-beat tom roll ends on the floor tom.", "fills"],
  ["tom-rest-phrase", "Tom Phrase With Rests", { tom: [0, 1, 4], midtom: [6, 7, 10], lowtom: [12, 14, 15] }, "Leave space between short tom bursts.", "groups"],
  ["two-bar-tom-fill", "Two-Bar Tom Fill", { snare: [0, 2, 4, 6], tom: [8, 10, 12, 14, 16, 17, 18, 19], midtom: [20, 21, 22, 23], lowtom: seq(8, 24) }, "First-bar eighths lead to second-bar sixteenths.", "fills", { bars: 2 }],
  ["linear-hhk", "Two Hands One Kick", linear(["snare", "tom", "kick"]), "Three-note cells cross straight quarter beats.", "linear"],
  ["linear-hkk", "One Hand Two Kicks", linear(["snare", "kick", "kick"]), "A hand-foot-foot cell repeated through the bar.", "linear"],
  ["linear-four-cell", "Four-Note Linear Cell", linear(["snare", "tom", "lowtom", "kick"]), "Three hand surfaces and one kick per beat.", "linear"],
  ["linear-double-kick", "Linear Double Kick", linear(["snare", "tom", "kick", "kick"]), "Two hands followed by two foot strokes.", "linear"],
  ["linear-five-cell", "Five-Note Linear Cell", linear(["snare", "tom", "midtom", "lowtom", "kick"]), "Five-note cells finish with a final snare stroke.", "groups"],
  ["linear-seven-cell", "Seven-Note Linear Cell", linear(["snare", "snare", "tom", "tom", "lowtom", "kick", "kick"]), "Seven-note cells end with two snare strokes.", "groups"],
  ["linear-half-bar", "Half-Bar Linear Fill", linear(["snare", "tom", "kick", "lowtom"], 8, 8), "Two four-note cells start on beat 3.", "linear"],
  ["linear-kick-lead", "Kick-Led Linear Fill", linear(["kick", "snare", "tom", "midtom"]), "Bass drum begins each four-note cell.", "linear"],
  ["paradiddle-snare", "Accented Paradiddle", { snare: { ...hits(sixteenths, "normal"), ...hits(quarters, "accent") } }, "Play RLRR LRLL RLRR LRLL; accent the group starts.", "rudiments", { sticking: "RLRR LRLL RLRR LRLL" }],
  ["paradiddle-toms", "Paradiddle Tom Accents", { snare: sixteenths.filter(i => !quarters.includes(i)), tom: [0, 8], lowtom: [4, 12] }, "Leading accents move to toms; doubles stay on snare.", "rudiments", { sticking: "RLRR LRLL RLRR LRLL" }],
  ["flam-quarter-fill", "Quarter-Note Flam Fill", { snare: hits(quarters, "flam") }, "Four separated flams, one each quarter.", "rudiments"],
  ["flam-tom-response", "Flam and Tom Response", { snare: hits(quarters, "flam"), tom: [2, 6], lowtom: [10, 14] }, "Both hands play each flam, followed by a tom.", "rudiments"],
  ["ghost-accent-fill", "Ghost and Accent Fill", { snare: { ...hits(sixteenths, "ghost"), ...hits([0, 3, 6, 9, 12, 15], "accent") } }, "Accents every three sixteenths float over quiet taps.", "groups"],
  ["buzz-release-fill", "Buzz Release Fill", { snare: { ...hits([0, 4, 8], "buzz"), 12: "accent" } }, "Three buzz strokes lead to a clean accent.", "rudiments"],
  ["snare-triplets", "Snare Triplets (12/8)", { snare: seq(12) }, "Four dotted-quarter groups of three equal strokes.", "styles", compound],
  ["triplet-hand-foot", "Triplet Hand-Foot Fill (12/8)", linear(["snare", "tom", "kick"], 12), "Two hand strokes then one kick per compound beat.", "linear", compound],
  ["triplet-half-bar", "Half-Bar Triplet Fill (12/8)", { snare: [6, 7, 8], tom: [9], midtom: [10], lowtom: [11] }, "Rest for two compound pulses, then play six strokes.", "styles", compound],
  ["six-eight-tom-fill", "Six-Eight Tom Fill", { snare: [0, 1], tom: [2, 3], lowtom: [4, 5] }, "Three pairs across a six-eighth bar.", "fills", { division: 8, timeSignature: [6, 8] }],
  ["three-four-fill", "Three-Four Snare to Toms", { snare: seq(4), tom: seq(4, 4), lowtom: seq(4, 8) }, "Four sixteenths on each surface in a 3/4 bar.", "fills", { timeSignature: [3, 4] }],
  ["seven-eight-fill", "Seven-Eight Tom Fill", { snare: seq(4), tom: seq(4, 4), lowtom: seq(6, 8) }, "Fourteen sixteenths grouped as 2+2+3 eighths.", "intermediate", { timeSignature: [7, 8] }],
];
