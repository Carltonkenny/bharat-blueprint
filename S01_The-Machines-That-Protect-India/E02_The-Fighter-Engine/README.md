# Episode 2 — The Fighter Engine (code build)

Silent film, 1280×720 at 30 fps, 195 s (3:15), drawn entirely in code. No voice yet: the narrator audition is the next gate.

## Run
```bash
node build/test-engine.mjs            # engine + timing tests (exact circles, anchored leaders, whole words, 230-260 words, 3:00-3:30)
node build/qc-frames.mjs dist/qc     # held frame of every beat: text size, safe area, overlaps, truncation; saves PNGs
node build/qc-sweep.mjs 0.5          # whole timeline every 0.5 s (use 0.25 for the final check)
node build/shoot-frames.mjs dist/shots 3,60,150   # PNGs + ms/frame + determinism check
```
Open `index.html` in a browser and call `seek(t)` in the console to scrub. `node_modules` is a junction to the Episode 1 folder.

## Where things are
| File | Job |
|---|---|
| `narration_v3.txt`, `SCRIPT_v3.md` | words (259) and the beat plan; tests keep `timing.js` equal to the text |
| `src/timing.js` | the 33 narration clips, estimated lengths, gap weights; put measured seconds in `MEASURED` after the voice is chosen |
| `src/film.js` | beats anchored to clip starts; `keys` pin panel events to the words that cause them |
| `src/blueprint.js` | v2 engine: exact circles, anchors, whole-word reveals, bloom, hot pen trail |
| `src/objects.js`, `src/panels.js` | drawings and the 26 panels |
| `SOURCE_LEDGER.md` | every claim, its source and status |

## Known limits
- About 450 ms per frame in headless Chrome (Episode 1 target was under 250 ms): expect a long render until the bloom is optimised.
- Timing is estimated at 2.2 words/s. Re-time after the voice is measured.
- Not yet done: voice, music/SFX, render, mux, loudness check.

## Status after the voice step (2026-11-04)
- Narration is `narration_v4.txt` (287 words). Voice: ElevenLabs `eleven_v4`, Alfred. Raw takes in `audio/raw`, trimmed in `audio/trim`, measured lengths in `narration/measured.js`.
- `node build/make-audio.mjs` rebuilds `audio/mix.wav` from the film's own timeline (run it after any timing change).
- Final: `renders/ep02-fighter-engine-v1.mp4` (200 s, 30 fps, stereo, about -16.6 LUFS). Picture-only master: `renders/ep02-video-30fps.mp4`.
- Swapping the voice means regenerating all 34 clips (about 1,700 credits), then re-running the trim/measure step and make-audio.
