# S02 understanding check (OpenCode implementer, 2026-11-07)

Driver: `00_SERIES/MASTER_RUN.md`. Scope: build, render and QC all six S02 episodes, then notify once.

## Plan (order per MASTER_RUN §3)
A. This file. B. Ticket T0 git safety net (no behaviour change). C. S2-T0 spike: 10 s WebGL/Three.js
composition, measure seconds/frame, determinism, choose master resolution. D. S2-T1..T5 kit-v2:
foundations, hero module, figure module, beat engine v2 + retime + skills (bb-explain, bb-map,
bb-data), QC v2 with a synthetic-defect test. E. Episodes in order E01, E03, E02, E06, E05, E04
(each: data generation -> build -> scene-graph gates B1..B17 -> draft render -> frame gates A/F1..F8
-> contact sheets -> final render -> qc/report.md -> copy out -> REVIEW_REQUEST.md).
F. S2-T12 mux with the user's voice (tested with a synthetic tone) plus `finalize-with-voice` and
`HOW_TO_FINISH_WITH_VOICE.md`. G. `DONE_S02.md`, one notification, three beeps.

## Environment (measured 2026-11-07)
| Item | Value |
|---|---|
| CPU / RAM | 16 logical CPUs / 15.7 GiB |
| Free on C: | 45.07 GB (keep >= 10 GB; scratch only under RENDER_ROOT) |
| GPU | NVIDIA GeForce RTX 3050 4 GB Laptop, driver 616.92, 0 MiB used at start; Intel Iris Xe also present |
| Node / npm / git / ffmpeg / python | 22.23.2 / 12.0.2 / 2.56.0 / 8.1.1 / 3.11.15 |
| Renderer | HyperFrames 0.9.9 (local dep), chrome-headless-shell 152.0.7977.30 cached |
| Three.js | not present anywhere; to be installed pinned and vendored under `_shared/kit-v2/vendor/` |
| Fonts | the four repo woff2 (IBM Plex Mono 400/600, Space Mono 400/700) reused, local only |
| Voice | no `audio/voice/` in any episode -> estimated timing (words/1.8), no burned-in captions |

## Risks and how each is handled
1. **WebGL under headless Chrome + Three.js is unproven.** Mitigated by S2-T0 first. HARD BLOCKER only
   if every GPU path and the software path both fail, or determinism fails on all paths.
2. **Render cost.** S01 2D films took 11-17 min at 720p; 3D is heavier. S2-T0 measures seconds/frame;
   master is 1920x1080 only if the projected 5-minute film is <= 3 h, otherwise 1280x720. One master
   size for all six episodes, never mixed inside a film.
3. **GPU selection.** `--browser-gpu` may land on the Intel GPU. No system setting will be changed. If the
   RTX cannot be selected process-locally, record the GPU actually used and give the user the one-line
   Windows Graphics instruction in the final report.
4. **Determinism.** Hardware GL is not bitwise stable, so QC B14 is tested by SSIM (>= 0.999), not hashes.
5. **VRAM / RAM.** 4 GB VRAM (stay under 3.2 GB) and 15.7 GB RAM (stay under 12 GB). Worker count is
   chosen from the spike measurements, not guessed.
6. **OneDrive hygiene.** Frames, segments and drafts go to RENDER_ROOT
   (`%LOCALAPPDATA%\BharatBlueprint\render\S02`), never into the project folder. Only final MP4s, qc
   reports/sheets, code and docs are copied into the project.
7. **Facts on screen.** Only numbers and dates present in that episode's ledger with a VERIFIED or
   SECONDARY tag (QC B11). No borders (B16), no country names, no rankings, FICTIONAL SCENARIO stamp over
   the whole flagged passage, CONCEPTUAL/SCHEMATIC tag on every hero's first beat.
8. **Beat density.** Briefs carry 46-63 beats; 12-20 per minute needs long `mechanism` beats split into
   identify/demonstrate/consequence sub-beats. Every split is recorded in `timing/splits.md`; no new
   content is invented.
9. **Ambiguity.** Unclear spec -> conservative reading, logged as `ASSUMED:` in `docs/design/QUESTIONS.md`,
   run continues. No questions to the user.
10. **Long run.** Per-episode caps: 15 scene-graph iterations, 5 draft renders, 2 final renders. A failed
    episode is marked BLOCKED in STATUS.md with the exact gates and attempts, and the run continues.

## Assumptions (logged in docs/design/QUESTIONS.md as Q17-Q20)
- T0's S01-specific acceptance parts (`docs/INVENTORY.md`, the four S01 engine tests) are deferred: they
  audit S01 migration, which MASTER_RUN does not require for S02. The git safety net itself is done.
- No `audio/voice/` anywhere, so QC B17 caption checks are vacuously satisfied and captions are not burned in.
- `bb-explain`, `bb-map`, `bb-data` ship as local Node skills under `_shared/kit-v2/skills/` with README,
  config format, test and demo page; `from-message` mode is an interface plus a clear-exit stub.
- Episode build order follows MASTER_RUN, not the ticket numbering.
