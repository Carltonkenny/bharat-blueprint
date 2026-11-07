# 08 S02 visual engine spec (kit-v2)

Designer: Claude. Implementer: OpenCode. Read first: `S02_DENIED-India-Built-It-Anyway/00_SERIES/VISUAL_DIRECTION_S02.md` (what it should look like) and `QC_BAR_S02.md` (how it is judged). This file is how it is built. Where this file and a ticket disagree, the ticket wins; unclear means a question in `QUESTIONS.md`, not a guess.

## 1. Scope and boundaries
- S02 is a separate track. **Do not modify** anything under `S01_*` or `_shared/kit/engine/`. Create `_shared/kit-v2/` for shared code and `S02_*/E0n_*/src/` for episode code.
- You may copy ideas from the S01 engine (`blueprint.js`, `objects.js`, `timing.js`, `film.js`) but kit-v2 must not depend on them at runtime.
- You write code and QC output only. You do not edit `script.md`, `passages.md`, `LEDGER.md`, `EPISODE_BRIEF.md` or any `APPROVED.txt`. Script or fact problems go to `QUESTIONS.md`.
- No ElevenLabs, no paid APIs, no network calls at render time, no logins, nothing posted.

## 2. Stack
HyperFrames (already used) as the renderer. Three.js (pin an exact version, vendored into `_shared/kit-v2/vendor/`, no CDN) for the 3D layer. GSAP is allowed for 2D timelines only if every tween is seekable and the page exposes one master `seek(t)`. Plain SVG/canvas for the blueprint and figure layers. Fonts: reuse the four woff2 files already in the repo (local only).

## 3. The seek contract (non-negotiable)
`window.__seek(t)` sets the entire page to the exact state at time `t` seconds, with no dependence on wall-clock time, `requestAnimationFrame`, `performance.now`, `Date.now` or `Math.random`. Replace `Math.random` globally with a seeded PRNG (mulberry32, seed from the episode id) at page start. Three.js: one `WebGLRenderer` (`preserveDrawingBuffer: true`, `setPixelRatio(1)`), `renderAt(t)` updates every object from `t` analytically (no incremental physics), then renders once. Particles are functions of `t` and a per-particle seed. Rendering the same `t` twice must give identical pixels (check B14).

## 4. Data model (authored JSON; a generated `episode-data.js` is what the page loads, per Q1)
`episode.s2.json`:
```
{ "id":"E01", "title":"...", "world":"ice", "size":[1920,1080], "fps":30,
  "passages":[ {"id":"P01","text":"...","estSec":21.7} ],
  "beats":[ {"id":"1.01","passage":"P01","w":0.12,"layer":"H","kind":"hook",
             "hero":"engine","camera":"push-in","fx":["draw-on"],
             "labels":[{"t":"FINAL PUSH","at":"ring","words":2}],
             "numbers":[], "figure":null, "notes":"frost drop becomes pump rotor"} ] }
```
- `w`: weight of the beat inside its passage; weights per passage sum to 1. Beat duration = passage duration x w, then clamped to the limits in QC B8 by redistributing neighbours' weights (report any clamp).
- `layer`: `B` blueprint, `H` hero 3D, `C` character; a beat may carry `"to":"H"` for a declared transform.
- `kind`: `hook | mechanism | reveal | label | number | fiction | missing | payoff | transition | hold`.
- Beats come from `EPISODE_BRIEF.md` (the table is the authority; copy it, do not improvise new content). The tables are a skeleton of 46 to 63 beats. To reach 12 to 20 beats per minute (QC B9), split the longest `mechanism` beats into identify / demonstrate / consequence sub-beats (`1.03a`, `1.03b`) without adding content, and list every split in `timing/splits.md` for review.

## 5. Timing from estimate to the user's recording
1. `timing/estimate.json`: passage durations = words / 1.8 (from `passages.md`). Build and QC everything on this first.
2. The user records their voice and puts either per-passage files `audio/voice/P01.wav ...` or one `audio/voice/full.wav` in the episode folder.
3. `retime` (a script, dry-run by default): per-passage files give exact durations. For a single file, run ffmpeg `silencedetect` (noise -35 dB, min 0.35 s), find the N-1 longest pauses that best match passage word-count proportions, and print the proposed boundaries for the user to confirm; never guess silently. Output `timing/measured.json`. If a tool such as Whisper is installed it may be used for forced alignment, but it must not be required.
4. Re-run all gates on measured timing. Beat anchors move with the passage; visual content does not change.

## 6. Modules (public API; tests in `_shared/kit-v2/test/`)
- `tokens.js`: palette per world, stroke widths (hairline/line/heavy as a function of frame height), type scale, safe areas.
- `labels.js`: `label({text, anchor, side})` with automatic placement and collision avoidance (uses the scene report), dwell computation from QC B5, glossary check.
- `fx.js`: `drawOn`, `sectionSweep`, `glow`, `depthBlur`, `particles(seed, fn)`, `counter`, `matchMorph`. Each takes `(t, params)` and is pure.
- `hero/`: `createHero(kind, opts)` returns `{object3d, update(t), parts:{name:Object3D}, sections}`. Builders from primitives only: `LatheGeometry` (nozzles, chambers, tanks, bells), `TubeGeometry`/`ExtrudeGeometry` (pipes, ducts, rings), `InstancedMesh` (blades, processors, dies, cutters, segments). Material `blueprintHologram`: edges + translucent fill + fresnel rim + depth fog; `clippingPlanes` for cutaway; `explode(axis, amount)`.
- `figure/`: SVG rig, 7 joints, pose library (`reach, push, pump, carry, point, sort, pass, look-up, stand, walk`), props drawn in the same stroke style, `pose(name, t)` and `blend(a, b, u)`.
- `camera.js`: orbit, dolly, push-in, pull-back, parallax between layers, all analytic in `t`.
- `scenereport.js`: implements `window.__sceneReport(t)` (every label/shape/hero: id, bbox in screen px, colour, opacity, layer).
- `audio/`: procedural SFX and bed generators (pen stroke, lock, rotation hum, data pulse, pressure hiss, tunnelling rumble), all optional, all below the voice. The final mux takes the user's voice (`full.wav` or the per-passage files), ducks the bed under it, targets -16 LUFS integrated and true peak <= -1 dBTP, and writes `renders/<ep>_preview_nosound.mp4` and `renders/<ep>_final.mp4`.

## 7. Hero catalogue to build (reuse across episodes; each has a `CONCEPTUAL` tag)
`tank` (LH2/LOX style, frost), `pipe-network`, `turbopump` (impeller, volute), `chamber-nozzle` (section, flow lines), `rocket-stack`, `rack-node-mesh` (processors + interconnect topology), `earth-wire` (with region highlight), `sat-constellation`, `range-spheres` (trilateration), `phone-dot`, `staged-platform` (3 steps), `loop-heat-to-power` (abstract heat -> steam -> turbine -> generator, no core detail), `wafer-die`, `litho-stack`, `layer-city`, `package-chip`, `tbm-slurry` (cutterhead with disc cutters, bulkhead, slurry lines, erector, lining ring), `city-slice`. Details per episode are in each `EPISODE_BRIEF.md`.

## 8. Performance and decision rules
Hardware (measured 2026-11-07): RTX 3050 4 GB Laptop GPU + Intel Iris Xe, 16 GB RAM, 16 logical CPUs, about 45 GB free. Use `hyperframes render --browser-gpu` (hardware GL; the default is software SwiftShader), optionally `--gpu` (GPU encode), `-w N` workers, `--resolution`. Author the composition at its native size (1920x1080 or 1280x720); `--resolution` only scales by integer multiples. Passage durations come from `passages.md` / `timing/*.json`, never from the brief's old estimates. Brief beat numbering is indicative; generate ids sequentially.
- S2-T0 measures seconds per frame for a 3D beat, a character beat and a flat beat at 1080p and 720p, with and without bloom. Report a table and the projected full-film time. Decision: master at 1080p if projected <= 3 h per film, else 720p.
- Parallelise: render in chunks (e.g. 8 segments) and concatenate, if HyperFrames allows; otherwise report the limit.
- Cache hero geometry builds; no per-frame geometry creation.

## 9. Output layout per episode
```
E0n_*/ src/ index.html episode.s2.json glossary.json timing/ audio/voice/ audio/sfx/ qc/ (report.md frames.csv delta.png sheet_*.png cuts.png beat_review.md) renders/ REVIEW_REQUEST.md
```
`index.html` is generated and must open from `file://`. File names are lower-kebab-case, ASCII only. No absolute user paths in code (use `import.meta.url` / `process.cwd()` and the config file).

## 10. Definition of done for an episode build
All QC gates in `QC_BAR_S02.md` PASS; `REVIEW_REQUEST.md` written (files, how to run, verbatim command output, deviations, risks, what you did not do); then stop. Claude reviews; the user watches with their voice track; only then is anything promoted.
