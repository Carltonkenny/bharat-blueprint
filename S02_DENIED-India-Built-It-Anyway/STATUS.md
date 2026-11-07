# S02 build status (OpenCode updates after every step; newest at the bottom)

| Episode | Approved | Built | Draft render | Final render | QC | Notes |
|---|---|---|---|---|---|---|
| E01 Cryogenic | yes | yes | merged | 1920x1080, 5:16 | all gates pass | pilot; B14 verified by a second render (SSIM 1.0) |
| E03 NavIC | yes | yes | merged | 1920x1080, 4:52 | all gates pass | build second (time-sensitive); ledger re-checked |
| E02 PARAM | yes | yes | merged | 1920x1080, 4:44 | all gates pass | |
| E06 Tunnel | yes | yes | merged | 1920x1080, 4:38 | all gates pass | |
| E05 Semiconductors | yes | yes | merged | 1920x1080, 4:54 | all gates pass | |
| E04 Nuclear | yes | yes | merged | 1920x1080, 4:44 | all gates pass | |

Run log:

- 2026-11-07 (run start) Read the full MASTER_RUN reading order. Confirmed: all six episodes have
  `APPROVED.txt`; no `audio/voice/` in any episode (estimated timing, no burned-in captions); no git repo
  at the workspace root; no `_shared/kit-v2`; `PAUSE_AFTER_E01.flag` absent.
- 2026-11-07 Step A: wrote `00_SERIES/S2_UNDERSTANDING_CHECK.md` (plan, environment numbers, risks).
  Environment: 16 CPUs / 15.7 GiB RAM / 45.07 GB free on C: / RTX 3050 4 GB (driver 616.92) / node
  22.23.2 / ffmpeg 8.1.1 / HyperFrames 0.9.9 local.
- 2026-11-07 Step B (ticket T0): `git init -b main` at the workspace root, `core.autocrlf false`
  at repo level, `.gitignore` extended (media, FINAL, audio, narration/raw, generated PNGs).
  First commit d9be497: 270 tracked files, 667 KiB, no media tracked, no secret patterns.
  The S01-specific parts of T0 (docs/INVENTORY.md, the four S01 engine tests) are deferred and
  logged as Q17 in docs/design/QUESTIONS.md.
- 2026-11-07 Step C (S2-T0 spike): `_shared/kit-v2/spike/` built and rendered. WebGL works on
  every path. The RTX 3050 is reachable per process (no system change) via a local patch to the
  pinned HyperFrames copy. Determinism: hardware GL FAILS B14 (min SSIM 0.9985, 18 frames);
  software GL is byte-identical (SSIM 1.0) and PASSES. Decision: master 1920x1080, software WebGL,
  4 workers, CPU x264 encode; projected 12.5 min per 5-minute film. Report:
  `_shared/kit-v2/spike/REPORT.md`; review request: `docs/design/reviews/S2-T0/REVIEW_REQUEST.md`.
- 2026-11-07 Step D (S2-T1 to S2-T5): kit-v2 built under `_shared/kit-v2/` (browser modules,
  the 3D hero module, the figure rig, the beat engine, the three skills, the QC tools).
  `node _shared/kit-v2/test/run.mjs` prints "all passing"; the three skill tests and the
  retime test print "all passing"; the synthetic-defect test shows all eight defects
  failing the right gate. Review requests: `docs/design/reviews/S2-T1..S2-T5/`.
  Bugs found and fixed by the tests: the token object did not expose BASE_W (every scale was
  NaN), the figure rig had mirrored arm angles and non-constant limb lengths, the type scale
  was under the QC B3 cap-height floor, the camera pushed rail labels out of the safe area
  (now a world pass and a screen pass), custom scene ops were excluded from the render, the
  HUD sat outside the safe area, the screen pass ran under the camera transform, the camera
  scale accumulated without bound, a rect primitive used its width as the stroke width (a giant
  solid blob), and a hero that popped in mid-transition read as a jump.
- 2026-11-07 Step E (episodes): E01, E03, E02, E06, E05, E04 built in that order. Each episode:
  beats from the brief through `bb-explain` (with the documented sub-beat splits), the scene
  implementation in `src/scene-ops.json`, the numbers from the ledger in `data/episode.csv`,
  the scene-graph gates B1-B17 (0 failures), the render at 1920x1080 / 30 fps, the frame
  gates F1-F8 on every frame (0 failures), the contact sheets, the ten-question self-review
  (0 N answers), `qc/report.md` and `REVIEW_REQUEST.md`. The silent masters are in each
  episode's `renders/` and in `S02_DENIED-India-Built-It-Anyway/FINAL/`.
  Two content bugs found and fixed by the review: E02's last passage was missing a beat and
  E03's number card had a duplicated card; both were re-rendered and re-checked.
- 2026-11-07 Step F (S2-T12): `tools/mux.mjs` and `tools/finalize-with-voice.mjs` built and
  tested with a synthetic tone as the "voice" (the test artefacts were deleted afterwards);
  `00_SERIES/HOW_TO_FINISH_WITH_VOICE.md` written for the user.
- 2026-11-07 Step G: `DONE_S02.md` written; the run is complete.
