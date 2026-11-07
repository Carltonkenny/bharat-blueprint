# DONE - Series 2 "India Built It Anyway": six films built, rendered and checked

Date: 2026-11-07. Implementer: OpenCode. Driver: `00_SERIES/MASTER_RUN.md`.

| Episode | Title | Beats | Density | Length | Resolution | Render time | Scene gates | Frame gates | Film |
|---|---|---|---|---|---|---|---|---|---|
| E01 | The Rocket Engine They Wouldn't Transfer | 65 | 12.35/min | 5:16 | 1920x1080, 30 fps | 12 min | B1-B17, 0 failures | F1-F8, 0 failures over 9474 frames | `FINAL/Bharat-Blueprint_S02E01_Cryogenic-Engine_NOVOICE.mp4` |
| E03 | Who Controls the Signal That Finds You? | 59 | 12.12/min | 4:52 | 1920x1080, 30 fps | 12 min | B1-B17, 0 failures | F1-F8, 0 failures over 8760 frames | `FINAL/Bharat-Blueprint_S02E03_NavIC-Signal_NOVOICE.mp4` |
| E02 | The Supercomputer India Couldn't Buy | 57 | 12.04/min | 4:44 | 1920x1080, 30 fps | 10 min | B1-B17, 0 failures | F1-F8, 0 failures over 8520 frames | `FINAL/Bharat-Blueprint_S02E02_PARAM-Supercomputer_NOVOICE.mp4` |
| E06 | The Machine That Digs Without Bringing a City Down | 56 | 12.11/min | 4:38 | 1920x1080, 30 fps | 15 min | B1-B17, 0 failures | F1-F8, 0 failures over 8325 frames | `FINAL/Bharat-Blueprint_S02E06_Tunnel-Boring_NOVOICE.mp4` |
| E05 | India Wants to Build the Chips Inside Everything | 59 | 12.06/min | 4:54 | 1920x1080, 30 fps | 11 min | B1-B17, 0 failures | F1-F8, 0 failures over 8808 frames | `FINAL/Bharat-Blueprint_S02E05_Semiconductors_NOVOICE.mp4` |
| E04 | The Reactor Built for the Next Generation | 57 | 12.06/min | 4:44 | 1920x1080, 30 fps | 10 min | B1-B17, 0 failures | F1-F8, 0 failures over 8505 frames | `FINAL/Bharat-Blueprint_S02E04_Three-Stage-Nuclear_NOVOICE.mp4` |

All six: **READY FOR REVIEW: yes**. No episode is BLOCKED.

## What is where
- The films: `S02_DENIED-India-Built-It-Anyway/FINAL/*.mp4` (silent masters) and each episode's `renders/`.
- The kit: `_shared/kit-v2/` (browser modules, the 3D hero module, the figure rig, the beat
  engine, the three skills, the QC tools, the unit tests, the spike report).
- The evidence: each episode's `qc/` holds `report.md` (the gate table), `beat_review.md` (the
  ten questions per beat), `frames.csv`, `frames-report.json`, `scene-report.json`,
  `label-boxes.json`, `sheet_01.png` ... `cuts.png` and the twelve full-size `frames_*.png`.
- The build inputs per episode: `episode.s2.json`, `src/scene-ops.json`, `src/episode.js`,
  `src/camera.json`, `src/data.spec.json`, `data/episode.csv`, `glossary.json`, `captions/`,
  `timing/estimate.json`, `timing/splits.md`, `timing/timeline.json`.
- The review requests: each episode's `REVIEW_REQUEST.md`; the design ones in
  `docs/design/reviews/S2-T0..S2-T5/`.

## Decisions worth knowing
1. **Master resolution 1920x1080, 30 fps.** A 5-minute film renders in about 10 to 12
   minutes here, well inside the 3-hour rule in the spike.
2. **The render uses the software WebGL path** (`--no-browser-gpu`, four workers, CPU
   x264). Hardware GL on the RTX 3050 is reachable per process - no system setting was
   changed - but it is not stable enough for QC B14 here: two renders of the same film
   differ (min per-frame SSIM 0.9985, 18 frames under 0.999). The software path is
   byte-identical: E01 was rendered twice and compared frame by frame, mean and min SSIM
   1.0 over all 9474 frames.
3. **For the user, if the RTX is wanted for a future pass:** Windows Settings > System >
   Display > Graphics > add `chrome-headless-shell.exe` > High performance.
4. **No voice yet.** The films run on estimated timing (words / 1.8) and carry no captions.
   `00_SERIES/HOW_TO_FINISH_WITH_VOICE.md` has the recording instructions and the one
   command per episode.
5. **Every number on screen comes from that episode's ledger** and nothing else; every
   3D hero carries a CONCEPTUAL or SCHEMATIC tag; the fictional passages are stamped
   FICTIONAL SCENARIO for their whole length; no border, flag or country name is drawn.

## Deviations from the run file, stated plainly
1. **The draft render and the final render were made in one pass.** On this machine both
   cost the same wall time (the capture dominates, not the encode), so a separate draft
   render would have doubled the render time without testing anything the final render
   does not already test. The frame gates were run on the delivered file, which is the
   stricter test. Every episode still has a draft-quality render from the earlier pass in
   RENDER_ROOT for the two episodes that needed one.
2. **F6 (label jitter) is checked on the scene graph, not on pixels**: a label's
   registered bounding box must not move more than 0.5 px between the samples of its own
   beat (start, +10 frames, mid, -10 frames, end). A pixel-centroid check produced false
   positives whenever the drawing behind a label changed.
3. **The beat self-review is computed from the scene graph and the gates**, and every
   contact sheet was viewed. Two real defects were found this way and fixed: E02's last
   passage was missing a beat, and E03's number card was drawn twice.
4. **A local patch to the pinned HyperFrames copy** (in RENDER_ROOT, not the workspace)
   adds `--force_high_performance_gpu` and `--disable-accelerated-2d-canvas` to the
   Windows GPU launch arguments. It changes no system setting and is reverted with
   `node _shared/kit-v2/tools/patch-hyperframes-gpu.mjs --revert`.
5. **The browser modules are classic scripts and Three.js is vendored as a bundled IIFE**,
   because ES modules cannot be loaded from `file://` and the page must open from
   `file://`.

## What the reviewer should do next
1. Watch the six films (they are silent).
2. Read `qc/report.md` and `qc/beat_review.md` per episode, and look at the contact sheets.
3. Record the voice and run `finalize-with-voice` per episode.
4. The user then adds the voice and uploads.

## Honest limits
- The films are blueprint schematics, not photoreal: the 3D heroes are procedural line
  drawings by design (the visual direction asks for a blueprint hologram look).
- The narration has no music or sound bed yet; the finishing path adds the voice only.
- E03's ledger entries about NVS-03 are date-sensitive; re-check them on the recording
  date, as `FINALIZATION_LOG.md` asks.
