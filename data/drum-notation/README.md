# Groove and fill library

75 grooves and 75 fills, including 25 ballad grooves and 25 ballad fills. Reviewed on November 16, 2026 against the teaching concepts linked in each Markdown file. These are original educational arrangements, including variations on common patterns, rather than exact transcriptions of recordings or the linked lessons. No claim is made that all 150 arrangements are individually famous or ranked by popularity.

Search for **Ballad** in either library tab. The 25 ballad grooves retain their quiet cymbals, cross-stick and slow tempos. The 25 ballad fills are focused half-bar practice phrases: recognizable tom contours, deliberate space, flam/diddle pickups, and short six-stroke or triplet ornaments. Each fill occupies beats 3–4 of one fill bar, rather than continuing as a multi-bar chops exercise. A few use local hand-foot combinations, but there is no imposed pedal-hat or bass-drum ostinato during the fill. Unsubstantiated expert labels have been removed. Sticking instructions are shown where they describe a specific rudimental figure.

Each ballad fill keeps the groove on beats 1 and 2 of its fill bar, then enters on beat 3 and ends before the next downbeat. Their separate opening groove bar still starts with crash and kick, so every ballad fill example now has two bars total. These replacements retain stable slugs and leave the total at 75 grooves and 75 fills. Previously shared URLs deliberately retain their original notes; select the updated example from the Library to load the new arrangement.

The phrasing reference is [Half Bar Rock Ballad Fill](https://bypass.drumscore.com/lessons/level-2/fills/fill-concepts/half-bar-rock-ballad-fill), which describes the half-bar 3-and-4-e-and shape and variations with flams and different endings. Dynamics and restraint are informed by [Todd Sucherman's ballad lesson](https://www.drumeo.com/beat/how-to-play-a-rock-ballad-like-a-pro-todd-sucherman/). The 25 entries are original variations on those phrasing principles, not transcriptions of particular songs, and suitability still depends on the song's melody and section. Groove definitions are in `ballad-examples.mjs`; replacement fills retain the existing file path `advanced-ballad-fills.mjs` for compatibility.

Grid divisions 12 and 24 represent eighth- and sixteenth-note triplets respectively; notation uses explicit 3:2 tuplets. Their playback, MIDI, video and shared URLs preserve these exact subdivisions. An eighth-triplet grid cannot evenly divide odd eighth-note meters, so selecting such a meter uses the finer sixteenth-triplet grid.

Every fill example begins with one groove bar, with crash and kick on beat 1. The groove uses the fill's meter, subdivision and tempo; its first hi-hat is replaced by the crash. The original fill begins in bar 2, with all its notes and articulations preserved. One-bar fills therefore load as two-bar phrases, and two-bar fills load as three-bar phrases. Metadata records `leadInBars` and `fillBars` separately from the total `bars`.

Each file contains YAML metadata and one JSON pattern. Note positions are zero based; `division` defines the grid resolution. Each bar has `timeSignature[0] * division / timeSignature[1]` steps. Values encode real articulations, including accents, ghost notes, cross-stick, foot hi-hat, flams, buzzes, and ride bell.

Compound 6/8, 9/8, and 12/8 examples use exact eighth-note spacing. The transport uses quarter-note BPM: divide the displayed tempo by 1.5 to find the dotted-quarter pulse. This avoids representing triplets as unequal straight sixteenths. Sticking instructions describe performance; playback does not simulate separate left/right-hand samples.

## Review of the original 20 examples

| Original slug | Finding and correction |
| --- | --- |
| basic-rock | Basic kick 1/3, snare 2/4, and eighth hats are consistent with the reference. Retained. |
| four-on-the-floor | Retained quarter kicks; removed simultaneous open/closed hats and clarified the basic version. |
| half-time-rock | Beat-3 snare is correct. Retained as a practice variation. |
| classic-rock | Downbeat crash now replaces its hi-hat instead of adding a third simultaneous hand part. |
| pop-rock | The extra kick is the and of 3, not a pickup into beat 4. Description corrected. |
| disco | Closed hats on downbeats alternate with open offbeats; removed conflicting simultaneous hats. |
| funk | Added explicit snare ghost articulations; removed conflicting open/closed hats. |
| shuffle | Straight-grid positions were not triplets. Rebuilt on an exact 12/8 grid. |
| punk-rock | Description said eighths while data contained sixteenths. Changed hats to eighths and revised kicks. |
| blues-rock | A straight practice variation, not a shuffle. Renamed Straight Blues Rock. |
| tom-walkdown | Removed the unexplained last sixteenth and used a consistent eighth-note descent. |
| snare-build | All strokes originally had the same velocity. Added ghost/normal/accent dynamic stages. |
| classic-sixteenth | Overlapping snare/tom parts obscured the basic figure. Replaced with four strokes per drum. |
| kick-and-toms | Reworked into a clear hand/foot practice sequence without incidental unisons. |
| tom-triplets | Straight-grid approximation was inaccurate. Rebuilt as twelve exact eighths in 12/8. |
| snare-to-floor-tom | Half-bar phrase and positions agree. Retained. |
| kick-snare-unison | Removed unnecessary crash, leaving the stated kick/snare quarter-note unisons. |
| rolling-toms | Completed the final cycle; described straight-grid three-note groupings accurately. |
| snare-flam-finish | Final stroke had no flam articulation. Added the actual flam variant. |
| four-on-the-floor-fill | Kept the quarter-kick and final-beat snare phrase; removed an unnecessary opening crash. |

## References and scope

- [Drum Beats Everyone Should Know](https://www.drumeo.com/beat/drum-beats-everyone-should-know/): rock, funk, blues, swing and basic coordination concepts.
- [13 Easy Drum Beats For Beginners](https://www.drumeo.com/beat/13-easy-beginner-drum-beats/): simple orchestration and beginner variations.
- [10 Fun Intermediate Drum Beats](https://www.drumeo.com/beat/intermediate-drum-beats/): flam backbeats, displaced kicks, sixteenths, linear playing and odd meter.
- [5 Styles Any Beginner Drummer Can Play](https://www.drumeo.com/beat/5-styles-beginner-drummers/): compound blues, jazz ride, train beat and beginner bossa foot patterns.
- [Five Less Familiar Drumming Styles](https://www.drumeo.com/beat/5-drumming-styles-youve-probably-never-heard/): flat-tire shuffle concept.
- [The Bossa Nova](https://www.drumeo.com/beat/the-bossa-nova/): Brazilian groove coordination.
- [7 Beginner Drum Fills](https://www.drumeo.com/beat/?p=27819): basic eighth/sixteenth fills, builds, splat-boom and Pat Boone rhythm.
- [Linear Drum Fills](https://www.drumlessons.com/drum-lessons/live-lessons-archive/linear-drum-fills/): hand/foot independence and orchestration.
- [3 Easy Fills That Sound Hard](https://www.youtube.com/watch?v=LZAHSmyZU0Q): three-, five- and seven-note groupings on a straight grid.
- [Applying Rudiments To Your Drum Set](https://www.drumeo.com/beat/thomas-pridgen/): rudiment orchestration and dynamics.

The sources substantiate the concepts, not each invented variation's exact placements. Every file names its concept reference, supplies a performance description, and distinguishes the arrangement from a transcription.

## Regeneration and checks

Run `node scripts/generate-drum-library.mjs` from the repository root. It retains the original slugs, applies documented corrections, adds the variations in `examples.mjs`, writes Markdown and the manifest, and checks counts, unique patterns, instrument lanes, valid positions, articulations and conflicting hi-hat strikes. The app reads Markdown with the site's existing `gray-matter` dependency.
