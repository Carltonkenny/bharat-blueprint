# Series pipeline v2 — what worked on Episode 2, and what is mandatory from Episode 3

Supersedes the pipeline section of MASTER_REFERENCE.md where they differ. Reference implementation: `ep02-fighter-engine/`.

## Gates (stop for the user at 1 and 2 only)
1. Research and source ledger (primary pages first; mark VERIFIED / PARTLY / SECONDARY / TO VERIFY).
2. Script (3 engineering ideas, India can / cannot yet, fair category comparison with no rankings, clearly fictional what-if, one behaviour idea, closing question; 230-290 spoken words; about 3:20). Stop for approval.
3. Voice: audition at least three expressive voices on a directed passage the user can hear; the user picks by ear.
4. Build, mandatory checks, render, review, show.

## Mandatory checks before the user sees anything (user rule, 2026-11-04)
- `node build/test-engine.mjs` (engine rules and timing)
- `node build/qc-frames.mjs dist/qc` (held frame of every beat) and look at the PNGs
- `node build/qc-sweep.mjs 0.5` (whole timeline) and explain every flag
- contact sheets cut from the rendered file itself, viewed; black/silence detection; loudness near -16 LUFS
- state a rating and what was fixed. The same bar applies to any generated image or video clip: view it before use, log provenance in an asset register, label it conceptual or illustration.

## Voice recipe
- Voice used for the Old Observer in Episode 2: Daniel (gruff old British), `eleven_v4`, directed with varied tags ([dryly], [wryly], [curious], [reluctantly], [amused], [deadpan]), capitalised emphasis, ellipses, and a double `[long pause]` between clips.
- Generate scene-length passages of 2-3 clips, never one sentence at a time; cut them with `build/split-passages.mjs` (the N-1 longest silences are the boundaries; check words-per-second per clip).
- Short 2-3 word clips such as "Idea one: squeeze." run slow on purpose; that is fine.
- Credits seen: about 2,700 for the 14 Episode 2 passages with tags (tags are billed as characters).

## Timing
`src/timing.js` holds the clip list and a gap-weight system: measured clip lengths go in `narration/measured.js`; gaps rescale so the film lands on TARGET seconds. `src/film.js` anchors each beat to a clip start and `keys` pin events inside multi-sentence beats to the words that cause them.

## Sound
`build/make-audio.mjs` builds the soundtrack from the film's own timeline: trimmed voice, synthesised pen/sweep/tick/thump/chord, drone bed ducked under the voice, loudnorm to -16 LUFS.

## Lessons to carry forward
- Leaders attach only to named anchors (`BP.leaderTo/leaderBy`); place elbows relative to anchors.
- A leader may not cross a drawing: leave the object through a gap (see the jet's `bayTop` anchor).
- No label may finish after its beat's content: keep window ends below 1 and finish keyed beats at p = 1.
- Do not use glyphs missing from the font subset (no rupee sign, no arrows, no approx sign).
- Held sheets need something moving: marching dashes, pulses, flow dots.
- I cannot hear audio: voice choice and delivery are the user's call.

## Next refactor (do before or during Episode 3)
Move `lib/`, `src/blueprint.js`, `src/film.js`, `src/timing.js` (without the clip list), `build/*` into `india-defence-series/series-kit/`, leaving per-episode `episode.js` (clips, beats, scene names), `objects.js` and `panels.js`. Keep the tests running against each episode.
