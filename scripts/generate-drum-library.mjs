import fs from "node:fs";
import assert from "node:assert/strict";
import { extraGrooves, extraFills, grooveCorrections, fillCorrections, sources } from "../data/drum-notation/examples.mjs";
import { balladGrooves, balladFills } from "../data/drum-notation/ballad-examples.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = { grooves: [], fills: [] };
const ids = ["crash", "ride", "cowbell", "hihat", "openhat", "snare", "tom", "midtom", "lowtom", "kick"];
const empty = () => Object.fromEntries(ids.map((id) => [id, []]));
const groove = (title, tempo, configure, description) => {
  const pattern = empty(); configure(pattern);
  return { title, tempo, bars: 1, pattern, description };
};
const hat = (steps = [0, 2, 4, 6, 8, 10, 12, 14]) => (p) => { p.hihat.push(...steps); };
const grooves = {
  "basic-rock": groove("Basic Rock", 100, (p) => { hat()(p); p.kick.push(0, 8); p.snare.push(4, 12); }, "The dependable eighth-note rock beat: kick on beats one and three, snare on two and four, steady closed hi-hat."),
  "four-on-the-floor": groove("Four on the Floor", 120, (p) => { hat()(p); p.kick.push(0, 4, 8, 12); p.snare.push(4, 12); p.openhat.push(6, 14); }, "A dance and pop staple with a kick on every quarter note, backbeat snare, and open hats between beats."),
  "half-time-rock": groove("Half-Time Rock", 85, (p) => { hat()(p); p.kick.push(0, 10); p.snare.push(8); }, "A spacious half-time pocket: the snare lands on beat three while the hi-hat keeps eighth notes moving."),
  "classic-rock": groove("Classic Rock", 110, (p) => { hat()(p); p.kick.push(0, 6, 8); p.snare.push(4, 12); p.crash.push(0); }, "A driving classic rock variation with a pickup kick before beat three and a crash on the downbeat."),
  "pop-rock": groove("Pop Rock", 115, (p) => { p.hihat.push(...Array.from({ length: 16 }, (_, i) => i)); p.kick.push(0, 8, 10); p.snare.push(4, 12); }, "Bright sixteenth-note hats, a solid backbeat, and a small kick pickup into beat four."),
  "disco": groove("Disco", 118, (p) => { p.hihat.push(...Array.from({ length: 16 }, (_, i) => i)); p.kick.push(0, 4, 8, 12); p.snare.push(4, 12); p.openhat.push(2, 6, 10, 14); }, "Four-on-the-floor kick with a steady backbeat, sixteenth-note closed hats, and open offbeat accents."),
  "funk": groove("Funk", 96, (p) => { p.hihat.push(0, 2, 3, 6, 8, 10, 11, 14); p.kick.push(0, 7, 10); p.snare.push(4, 12); p.openhat.push(14); }, "A syncopated funk pocket. Keep the ghosted-looking extra hat strokes light when performing."),
  "shuffle": groove("Shuffle", 112, (p) => { p.hihat.push(0, 3, 4, 7, 8, 11, 12, 15); p.kick.push(0, 8); p.snare.push(4, 12); }, "A simplified swung eighth-note shuffle with the long-short ride feel represented on the hi-hat lane."),
  "punk-rock": groove("Punk Rock", 168, (p) => { p.hihat.push(...Array.from({ length: 16 }, (_, i) => i)); p.kick.push(0, 4, 8, 12); p.snare.push(4, 12); p.crash.push(0); }, "Fast eighth-note hats and a forceful straight backbeat. Add energy with consistent kick strokes."),
  "blues-rock": groove("Blues Rock", 92, (p) => { p.ride.push(0, 4, 8, 12); p.kick.push(0, 8, 10); p.snare.push(4, 12); p.openhat.push(14); }, "A relaxed ride-led blues rock beat with a small kick pickup and an open-hat lift at the end.")
};
const fill = (title, configure, description) => {
  const pattern = empty(); configure(pattern);
  return { title, tempo: 100, bars: 1, pattern, description };
};
const fills = {
  "tom-walkdown": fill("Tom Walkdown", (p) => { p.snare.push(0, 2, 4, 6); p.tom.push(8, 10); p.midtom.push(12, 14); p.lowtom.push(15); p.kick.push(0, 8); }, "A simple descending orchestral tom phrase, ending with a low tom pickup."),
  "snare-build": fill("Snare Build", (p) => { p.snare.push(...Array.from({ length: 16 }, (_, i) => i)); p.kick.push(0, 8); p.crash.push(0); }, "Straight sixteenth-note snare build. Start softly and grow into the next section."),
  "classic-sixteenth": fill("Classic Sixteenth", (p) => { p.snare.push(0, 3, 4, 7, 8, 11, 12, 15); p.tom.push(8, 11); p.lowtom.push(12, 15); p.kick.push(0, 8); }, "A familiar syncopated sixteenth-note snare fill that opens into the toms."),
  "kick-and-toms": fill("Kick and Toms", (p) => { p.kick.push(0, 6, 8, 14); p.tom.push(2, 4); p.midtom.push(10, 12); p.lowtom.push(15); p.snare.push(4, 12); }, "Alternating kick and tom accents with a low tom at the phrase ending."),
  "tom-triplets": fill("Tom Triplets", (p) => { p.tom.push(0, 3, 6); p.midtom.push(9, 12, 15); p.kick.push(0, 8); }, "Two groups of descending tom triplets. The straight grid approximates triplet placement."),
  "snare-to-floor-tom": fill("Snare to Floor Tom", (p) => { p.snare.push(8, 10, 12); p.midtom.push(13); p.lowtom.push(14, 15); p.kick.push(8); }, "A compact snare phrase that moves down through the toms to the floor tom."),
  "kick-snare-unison": fill("Kick Snare Unison", (p) => { p.kick.push(0, 4, 8, 12); p.snare.push(0, 4, 8, 12); p.crash.push(0); }, "Big kick and snare unisons on quarter notes for a bold transition."),
  "rolling-toms": fill("Rolling Toms", (p) => { p.tom.push(0, 4, 8, 12); p.midtom.push(1, 5, 9, 13); p.lowtom.push(2, 6, 10, 14); p.kick.push(0, 8); }, "A cascading tom roll that moves across the kit in alternating sixteenth notes."),
  "snare-flam-finish": fill("Snare Flam Finish", (p) => { p.snare.push(0, 4, 8, 12, 15); p.kick.push(0, 8, 12); p.crash.push(0); }, "A backbeat-led snare fill with a final accented stroke to lead into the next downbeat."),
  "four-on-the-floor-fill": fill("Four on the Floor Fill", (p) => { p.kick.push(0, 4, 8, 12); p.snare.push(4, 12, 13, 14, 15); p.crash.push(0); }, "Keep the dance kick moving while a snare roll builds across the last beat.")
};

for (const [slug, changes] of Object.entries(grooveCorrections)) Object.assign(grooves[slug], changes);
for (const [slug, changes] of Object.entries(fillCorrections)) Object.assign(fills[slug], changes);
for (const [slug, title, tempo, pattern, description, source, options] of extraGrooves) {
  grooves[slug] = { title, tempo, pattern, description, source, ...options };
}
for (const [slug, title, pattern, description, source, options] of extraFills) {
  fills[slug] = { title, tempo: 90, pattern, description, source, ...options };
}
assert.equal(balladGrooves.length, 25);
assert.equal(balladFills.length, 25);
for (const record of balladGrooves) grooves[record.slug] = record;
for (const record of balladFills) fills[record.slug] = record;

function grooveLeadIn(division, [numerator, denominator], style) {
  const stepsPerBar = numerator * division / denominator;
  const compound = denominator === 8 && numerator % 3 === 0;
  const pulseSteps = division / denominator * (compound ? 3 : 1);
  const pulseCount = numerator / (compound ? 3 : 1);
  const pattern = Object.fromEntries(ids.map((id) => [id, {}]));
  pattern.crash[0] = "normal";
  // The crash replaces the first hat, keeping the opening playable with two hands.
  const hatSpacing = division === 12 ? 1 : division === 24 ? 2 : division / 8;
  for (let step = hatSpacing; step < stepsPerBar; step += hatSpacing) pattern.hihat[step] = style === "ballad" ? "ghost" : "normal";
  for (let pulse = 0; pulse < pulseCount; pulse++) {
    const instrument = pulse % 2 === 0 ? "kick" : "snare";
    pattern[instrument][pulse * pulseSteps] = style === "ballad" && instrument === "snare" ? "cross-stick" : "normal";
  }
  if (denominator === 8 && numerator === 7) {
    pattern.kick = { 0: "normal", [division / 2]: "normal" };
    pattern.snare = { [division / 4]: "normal", [division * 5 / 8]: "normal" };
  }
  return pattern;
}

for (const [kind, records] of Object.entries({ grooves, fills })) {
  assert.equal(Object.keys(records).length, 75, `${kind}: expected 75`);
  const fingerprints = new Set();
  for (const [slug, record] of Object.entries(records)) {
    const fillBars = record.bars || 1;
    const leadInBars = kind === "fills" ? 1 : 0;
    const bars = fillBars + leadInBars;
    const division = record.division || 16;
    const timeSignature = record.timeSignature || [4, 4];
    const stepsPerBar = timeSignature[0] * division / timeSignature[1];
    const length = bars * stepsPerBar;
    const leadIn = leadInBars ? grooveLeadIn(division, timeSignature, record.style) : null;
    const pattern = Object.fromEntries(ids.map((id) => {
      const lane = record.pattern[id] || {};
      const notes = Array.isArray(lane) ? lane.map((step) => [step, "normal"]) : Object.entries(lane);
      return [id, Object.fromEntries([
        ...Object.entries(leadIn?.[id] || {}),
        ...notes.map(([step, variant]) => [Number(step) + leadInBars * stepsPerBar, variant]),
      ])];
    }));
    for (const [instrument, lane] of Object.entries(pattern)) {
      for (const [step, variant] of Object.entries(lane)) {
        assert(Number.isInteger(Number(step)) && Number(step) >= 0 && Number(step) < length, `${slug}: ${instrument} step ${step}`);
        assert(["normal", "accent", "ghost", "cross-stick", "flam", "buzz", "bell", "foot"].includes(variant), `${slug}: ${variant}`);
      }
    }
    for (const step of Object.keys(pattern.openhat)) assert(!pattern.hihat[step], `${slug}: conflicting hats`);
    const fingerprint = JSON.stringify([timeSignature, division, bars, pattern]);
    assert(!fingerprints.has(fingerprint), `${slug}: duplicate pattern`);
    fingerprints.add(fingerprint);
    const [referenceTitle, reference] = sources[record.source || (kind === "grooves" ? "rock" : "fills")];
    const metadata = {
      title: record.title, category: kind, tempo: record.tempo, bars, division, timeSignature,
      ...(leadInBars ? { leadInBars, fillBars } : {}),
      ...(record.style ? { style: record.style } : {}),
      ...(record.difficulty ? { difficulty: record.difficulty } : {}),
      ...(record.fillStartBeat ? { fillStartBeat: record.fillStartBeat, grooveBeats: record.grooveBeats } : {}),
      ...(record.leftFoot ? { leftFootOstinato: "Pedal hi-hat on the offbeat of each main pulse" } : {}),
      ...(record.kickPulse ? { kickOstinato: "Bass drum on each main pulse" } : {}),
      referenceTitle, reference, reviewedOn: "2026-11-16",
      arrangement: "Original educational practice arrangement of the referenced concept; not an exact song or lesson transcription.",
      ...(record.sticking ? { sticking: record.sticking } : {}),
    };
    const header = Object.entries(metadata).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join("\n");
    const compoundNote = timeSignature[1] === 8 && [6, 9, 12].includes(timeSignature[0])
      ? "\n\nCompound-meter timing uses exact thirds. Tempo is quarter-note BPM; divide by 1.5 for the dotted-quarter pulse." : "";
    const tripletNote = division === 12 || division === 24
      ? `\n\nGrid: ${division === 12 ? "eighth-note triplets (three notes per quarter)" : "sixteenth-note triplets (six notes per quarter)"}. Triplet timing is exact and the notation uses explicit tuplets.` : "";
    const file = `${kind}/${slug}.md`;
    const description = leadInBars ? `Bar 1 is a groove with a crash and kick on beat 1; the ${fillBars}-bar fill starts in bar 2. ${record.description}` : record.description;
    const coordination = [metadata.leftFootOstinato, metadata.kickOstinato].filter(Boolean).join("; ");
    const content = `---\n${header}\n---\n\n${description}${compoundNote}${tripletNote}\n\n${record.sticking ? `Sticking: ${record.sticking}\n\n` : ""}${coordination ? `Foot coordination: ${coordination}.\n\n` : ""}Reference: [${referenceTitle}](${reference}). The reference supports the rhythmic concept; the pattern is an original practice arrangement.\n\n\`\`\`json\n${JSON.stringify(pattern, null, 2)}\n\`\`\`\n`;
    fs.mkdirSync(path.join(root, "data/drum-notation", kind), { recursive: true });
    fs.writeFileSync(path.join(root, "data/drum-notation", file), content, "utf8");
    manifest[kind].push({ slug, title: record.title, file });
  }
}
fs.writeFileSync(path.join(root, "data/drum-notation/manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log("Generated and validated 75 grooves and 75 fills, including 25 ballad examples in each category.");

