# 01 Understanding: what a Bharat Blueprint film is and how it is built

All statements below were checked in the code on 2026-11-06 (Ep4 as the reference episode).

## 1. The product
A 2:15 to 5:15 explainer film, 1280x720, 30 fps, drawn on a blueprint sheet, narrated by an unseen synthetic voice, ending in a title card. No filmed footage. Each film explains one machine through three everyday analogies, says honestly what India can and cannot yet do, and carries one sourced number.

## 2. The theme is a contract, not decoration
**Look (shared engine):** paper `#0b3763`, ink `#eef6ff`, cyan `#86dcff` for annotation, orange `#ff9b3d` only for heat or the key accent, red `#ff5b4a` only for negation. IBM Plex Mono and Space Mono, uppercase, wide letterspacing. Grid, scanlines, vignette, grain, bloom. Strokes ink on with a white-hot pen tip that cools. Persistent HUD: top-left `SC.n · SCENE NAME`, bottom-right `EPnn · mm:ss`. Dimension chains, leader lines to anchors, exploded and three-view drawings.
**Spine (argument skeleton):** THE QUESTION, WHY IT MATTERS, IDEA 1, IDEA 2, IDEA 3 (each opens with an everyday analogy: a bus, a bicycle pump, catching a ball), INDIA (the "cannot yet" beat), THE FIELD (fair comparison, "tools not ranks"), WHAT IF (stamped FICTIONAL SCENARIO), THE HABIT (one behaviour idea such as sunk cost or hindsight bias), THE CLOSE (three things to remember, series callback, title). Episodes may add scenes (Ep2: THE MARUT, SUNK COST; Ep3: THE LONG BUILD, PLANNING; Ep5: THE NUMBERS). Ep1 is a legacy outlier (older engine, different scene names, different narrator); it is **never** migrated.
**Content rules:** one honest sourced number on screen with `SOURCE: PIB`; a CANNOT YET beat; the stamp FICTIONAL SCENARIO; no rankings; no named hostile countries; concept level only.
The automation must make it impossible to produce a film that has the right plumbing and the wrong soul (see gates G6).

## 3. How an episode is built today (Ep2 to Ep5)
An episode folder is a web page plus scripts. **Every frame is a pure function of time `t`**; the renderer (`npx hyperframes render`) seeks `t` and screenshots the canvas.

| File | Role | Authored or copied | Lines (Ep4) |
|---|---|---|---|
| `index.html` | loads scripts in order, sets `data-duration`, `data-composition-id`, adapter (`window.__hf`, `seek`) | copied, hand-edited | 38 |
| `lib/harness.js` | seek loop, `H.lerp/clamp/ease` | copied | |
| `src/blueprint.js` | palette, fonts, paper, frame/border/HUD, pen-ink, dimension chains, `BP.leaderTo`, `BP.link` | identical in Ep2 to Ep5 | 398 |
| `src/objects.js` | drawing objects (labels, bars, timelines, boxes...) | identical in Ep2 to Ep5 | 187 |
| `src/motion.js`, `src/vehicles.js` | animated parts, vehicles (jets, ships, trucks) | identical in Ep3 to Ep5; Ep2 older | 79, 131 |
| `src/kit.js` | extra shared helpers | identical in Ep4 and Ep5 only | 57 |
| `src/epN.js` | **the drawings:** `PANELS['scene.sub'] = { draw(ix,p), cam(pc)? }` for every beat | **authored per episode** | 331 |
| `src/timing.js` | the clip list `[id, scene, text, gapWeight]`, `TARGET`, `SCENE_NAMES`, measured-length override, gap rescale so the film lands on TARGET | per episode (copied then edited) | 76 |
| `narration/measured.js` | clip id to measured seconds (from audio) | generated | |
| `src/film.js` | the beat list `B(id, anchorClip, {tr, d, frac, keys})`, scene/HUD drawing, camera, progress | copied then edited (anchors, HUD label `EPnn`) | 101 |
| `narration/voice-plan.json` | voice id, model, tempo, passages (about 14) with text and tags, estimated credits | authored + generated | |
| `build/*.mjs` | test-engine, qc-frames, qc-sweep, qc-mid, holds, storyboard, shoot-frames, split-passages, make-audio | copied per episode; Chrome path hard-coded | |
| `audio/trim/*.wav`, `audio/mix.wav` | clip audio, final mix | generated | |
| `renders/*.mp4` | silent render, then muxed final in `S0N/FINAL/` | generated | |

**Timing logic (`timing.js`):** each clip has a duration (measured if present, else words / `WPS`). A gap weight says how much silence is wanted after the clip. Gaps are rescaled by `k = (TARGET - leadIn - voice - tailAfterQuestion - titleHold) / sum(weights)` so the film is exactly `TARGET` seconds whatever the voice speed. `TITLE_AT = end of last clip + tailAfterQuestion`; `DURATION = TITLE_AT + titleHold`.
**Beat logic (`film.js`):** a beat is anchored to the first word of a clip (`at('f05')`), arrives by `fade` (0.5 s) or `wipe` (0.9 s plotter line), inks in over `frac` of its length, and may pin panel progress to words with `keys`. The last beat is the title card at `TITLE_AT`. Beat id `3.2` means scene 3, panel 2.
**Audio logic (`make-audio.mjs`):** opens the film in headless Chrome, reads `TIMING.clips` and `BEATS`, synthesises pen/sweep/tick/thump/chord and a drone bed with ffmpeg, places voice clips at their start times, ducks effects under the voice, normalises to -16 LUFS, writes `audio/mix.wav`. Sound cues are tied to clip ids (`f31` for the stamp thump): hard-coded, which is why copying an episode crashed.
**Mux:** ffmpeg joins `mix.wav` with the silent render (libx264 crf 23, aac 192k).
**Voice:** ElevenLabs `eleven_v4`, voice `htZQqY7WtacRNV7s62Iy` (Daniel), tempo 1.12, one take per passage, passages cut into sentence clips on the longest silences (`split-passages.mjs`).

## 4. What is human-only
Script and fact approval, listening to the voice, the creative drawings (panels), final watch, upload.

## 5. Where the creative bottleneck is
About 80% of each episode's real effort is `epN.js` (the panels). The plumbing around it (timing, beats, index, audio cues, QC, packaging) is what this automation removes. A later ticket (T9) adds a library of reusable panel types for the recurring grammar so most panels become data; custom drawings remain code.

## 6. Verified defects (the automation must prevent each)
1. Copy-forward drift: `EPnn` HUD label, clip prefixes (Ep2 `d`, Ep3 `e`, Ep4 `f`, Ep5 `g`), scene names, TARGET, `data-duration`, sound-cue clip ids are all hand-edited per copy.
2. Ep4 `index.html` `<title>` still says "Episode 2: The Fighter Engine".
3. Ep3 contains dead Ep2 files: `src/panels.js` ("Episode 2 panels") and `src/examples.js` (redefines `PANELS['1.3']`); not loaded by `index.html`.
4. Ep3, Ep4, Ep5 have no source ledger file (Ep1: `sources/SOURCE_REGISTER.md`, Ep2: `SOURCE_LEDGER.md`).
5. Ep4's WHAT IF beat (about 03:47) is sparse: an empty clock showing 0.0 and two empty boxes.
6. Chrome path hard-coded in about 31 scripts.
7. Ep2 sound effects near-inaudible.
8. Files are UTF-8; `·` is U+00B7. Any tool that rewrites in cp1252 breaks on-screen labels.
