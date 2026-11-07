# MASTER RUN: build, render and check all of Series 2, then notify once

Owner: the user. Designer/reviewer: Claude. You are OpenCode, the implementer. This file is your complete instruction for the run. Read it fully, then work through it without stopping for approval, except at a HARD BLOCKER (section 7). Do not ask the user questions during the run; make the conservative choice, log it, continue.

## 0. Authorization (given by the user on 2026-11-07, valid for this run only)
- You MAY: write code under `_shared/kit-v2/` and the S02 episode folders; run Node, ffmpeg, ffprobe, git, `npx hyperframes render` for **Series 2 only**; use the laptop GPU; create files in `RENDER_ROOT` (section 5); install nothing globally; install project dependencies locally only if pinned and offline-capable afterwards (Three.js is vendored).
- You MAY NOT: touch anything under `S01_*`, `_shared/kit/engine/` or any existing final; call ElevenLabs or any paid/online generation service; post, upload or log in anywhere; delete anything you did not create in this run; change system settings (power plan, graphics preferences, drivers, registry); read or write outside the workspace and `RENDER_ROOT`; put secrets in files; hard-code user paths; edit `script.md`, `passages.md`, `LEDGER.md`, `EPISODE_BRIEF.md`, `CAMERA_AND_ZONES_S02.md`, the design docs or any `APPROVED.txt` (problems with those go to `docs/design/QUESTIONS.md`, and you continue with the conservative reading).
- Facts: every number and date on screen must exist in the episode's ledger with a VERIFIED or SECONDARY tag. No rankings, no named hostile countries, no country or state borders, concept level only, fiction stamped FICTIONAL SCENARIO.

## 1. Read first (in this order; do not skip)
`AGENTS.md`, `docs/design/RESUME_HERE.md`, `S02_*/README.md`, `00_SERIES/AUDIT_REPORT.md`, `VISUAL_DIRECTION_S02.md`, `CAMERA_AND_ZONES_S02.md`, `QC_BAR_S02.md`, `CONTENT_STRATEGY_S02.md`, `docs/design/08_S02_VISUAL_ENGINE_SPEC.md`, `09_S02_TICKETS.md`, `10_S02_SKILLS.md`, then for each episode `script.md`, `passages.md`, `EPISODE_BRIEF.md`, `sources/LEDGER.md`. The existing S01 engine files (`blueprint.js`, `objects.js`, `timing.js`, `film.js`, `build/*.mjs`) are references only.

## 2. Hardware and GPU (measured on 2026-11-07)
Laptop: NVIDIA GeForce RTX 3050 4 GB Laptop GPU (driver 616.92) plus Intel Iris Xe; 16 GB RAM; 16 logical CPUs; about 45 GB free on C:. HyperFrames 0.9.9 render options you will use: `--browser-gpu` (host GPU for Chrome/WebGL; default is auto-probe then SwiftShader software), `--gpu` (GPU video encoding), `-w/--workers` (each worker is a separate Chrome, about 256 MB RAM plus GPU memory), `--resolution`, `-q`, `--start/--end`, `--resume` (needs `HF_SEGMENTED_CAPTURE=true`), `--quiet`. Hardware GL is not guaranteed bitwise identical across runs, so determinism is tested by SSIM (QC B14), not hashes.
Procedure in S2-T0 and logged in `spike/REPORT.md`:
1. Print the WebGL renderer string seen by the page under `--browser-gpu`. It must name NVIDIA or the Intel GPU, not SwiftShader. If it says Intel, try to get the RTX used by launching the same Chrome binary via a per-process approach that needs no system change (for example `--use-angle=d3d11` with `--use-gl=angle` plus an environment variable such as `DXGI` adapter preference if Chrome supports it); if you cannot select the RTX without changing system settings, use whatever hardware GL you get, record it, and put a one-line instruction for the user in the final report (Windows Settings > System > Display > Graphics > add chrome-headless-shell.exe > High performance). Never change that setting yourself.
2. Measure seconds per frame for: flat beat, 3D hero beat, character beat; at the candidate resolutions; with 1, 2, 3, 4 workers; browser GPU on vs off; `--gpu` encode on vs off. Watch VRAM with `nvidia-smi` (stay under 3.2 GB of 4 GB) and RAM (stay under 12 GB).
3. Pick the fastest stable combination that passes F8 and B14. Rule for resolution: master at 1920x1080 if the projected time for a 5-minute film is at most 3 hours; otherwise 1280x720. Write the decision and the numbers; use it for all six episodes.
4. Use `--gpu` encoding only if the output passes F1 to F8 and looks equivalent in the contact sheet; otherwise encode on CPU (x264, crf 18 to 20).

## 3. Order of work (no stops between steps)
A. Write `00_SERIES/S2_UNDERSTANDING_CHECK.md`, at most 1 page: your plan, environment numbers, risks. No questions to the user.
B. Ticket T0 of `07_TICKETS.md` (git safety net, no behaviour change). If `git` or the acceptance test fails, log it and continue (not a blocker).
C. S2-T0 spike (10 s test, now authorized to render). If WebGL does not work with any GPU or software path, or determinism fails (SSIM below 0.999) for both, that is a HARD BLOCKER.
D. S2-T1 to S2-T5 in order (kit-v2 foundations; hero module; figure module; beat engine v2 + retime + the three skills in `10_S02_SKILLS.md`; QC v2 with the synthetic-defect test). Each ends with its `REVIEW_REQUEST.md` (do not wait for review).
E. Episodes in this order: E01, E03, E02, E06, E05, E04 (E01 is the pilot; E03 is next because it is time-sensitive). Per-episode loop in section 4.
F. S2-T12 `mux` (the user's voice into a finished render; tested with a synthetic tone as "voice"), the finishing command `finalize-with-voice` and `HOW_TO_FINISH_WITH_VOICE.md` for the user.
G. Final report, section 8.
If the file `S02_*/PAUSE_AFTER_E01.flag` exists when E01 reaches `READY FOR REVIEW: yes`, stop there and notify (the user's optional safety switch).

## 4. Per-episode loop (repeat for each episode; hard caps prevent endless loops)
Precondition: `APPROVED.txt` in the episode folder; 10 GB or more free on C:; no leftover Chrome/ffmpeg processes of yours.
1. Generate `episode.s2.json` from `EPISODE_BRIEF.md` + `passages.md` (`bb-explain`), `data/<ep>.csv` from the ledger (`bb-data`), `map.config.json` where the brief has maps (`bb-map`), `glossary.json`. Record every sub-beat split in `timing/splits.md`.
2. If `audio/voice/` holds the user's recording (`P01.wav...` or `full.wav`), run `retime` and use measured timing and captions. Otherwise use estimated timing and no burned-in captions.
3. Build the episode code. Run the scene-graph gates (QC B1 to B17) **without rendering** and fix until they pass (cap 15 iterations).
4. Draft render (`-q draft`, the chosen GPU settings, full length, output in `RENDER_ROOT`). Run the frame gates (QC A, F1 to F8) on every frame. Fix and repeat (cap 5 draft renders).
5. Produce contact sheets (QC D). If your model can view images, look at every sheet and every cut strip, fill `qc/beat_review.md` honestly (Y/N for the ten questions; any N is fixed, not explained). If it cannot, say so at the top of `qc/report.md`.
6. Final render at the chosen resolution, then the frame gates again on the final file (cap 2 final renders). Write `qc/report.md` ending with a gate table and `READY FOR REVIEW: yes/no`.
7. Copy the final MP4, `qc/` (reports and sheets, not raw frames) into the project, write `REVIEW_REQUEST.md`, update `S02_*/STATUS.md`, move to the next episode.
If an episode still fails after the caps: mark it `BLOCKED` in STATUS with the exact failing gates and what you tried, keep the best render, and continue with the next episode. Never lower a threshold; propose changes in `docs/design/QUESTIONS.md`.

## 5. Files, space and OneDrive hygiene
- `RENDER_ROOT` = `%LOCALAPPDATA%\BharatBlueprint\render\S02` (create it). All frames, segments and drafts live there, NEVER inside the OneDrive project folder (OneDrive would sync thousands of files and lock them). Only final MP4s, `qc/` reports/sheets, code and docs go into the project.
- Keep at least 10 GB free on C:. Check before each render. You may delete only scratch files you created inside `RENDER_ROOT`, and only after the episode's final render is copied and verified.
- Keep paths short (Windows path limit); avoid deep nesting in `RENDER_ROOT`.
- One render at a time. Kill Chrome/ffmpeg processes you started if a render fails. Long runs: you may run a process-scoped keep-awake helper (e.g. a PowerShell script holding `SetThreadExecutionState`) that changes no settings; stop it at the end.
- Final names (also copy into `S02_*/FINAL/`): `Bharat-Blueprint_S02E01_Cryogenic-Engine_NOVOICE.mp4` (and with the voice later: `..._FINAL.mp4`), same pattern for E02..E06; captions `captions/S02E01.srt`.

## 6. Quality bar (summary; the full text is `QC_BAR_S02.md`)
Every gate PASS before an episode may say READY. Beat density 12 to 20 per minute; labels readable and spelled from the glossary; numbers only from the ledger; no borders; hero tagged CONCEPTUAL/SCHEMATIC; FICTIONAL SCENARIO stamp for the whole fictional passage; determinism by SSIM; every frame checked; contact sheets produced; self-review recorded.
Look at the work like a viewer: does each beat explain its mechanism, move with purpose, and match the narration passage? Fix what looks crude (flat shading, intersecting parts, floating pipes, labels on parts they do not name) before reporting.

## 7. Hard blockers (the only reasons to stop early; then write `S02_*/BLOCKED.md` and notify)
WebGL unusable by every path; determinism fails on every path; less than 5 GB free and nothing of yours to clean; the workspace is unreadable; a rule in section 0 would have to be broken to continue; the same gate fails on 3 different episodes for the same root cause that you cannot fix in kit-v2 within 3 attempts.
Not blockers: a failed episode (continue), an unclear spec (choose conservative, log as `ASSUMED:` in QUESTIONS.md), slow renders, missing voice (use estimates).

## 8. Notify once, at the end
When all six episodes are either `READY` or `BLOCKED`, write `S02_*/DONE_S02.md` (one page: table of episode, resolution, render time, gates passed/failed, files, open issues, the one-line GPU instruction if relevant, how to add your voice) and print one final message: "S02 RUN COMPLETE: see S02_*/DONE_S02.md". Then play three short beeps (`powershell -c "1..3 | % { [console]::beep(800,300) }"`). Say nothing else during the run apart from the files you update (`STATUS.md` after every step with a timestamp). Claude then does the final check from the sheets, frames and reports; the user listens, adds the voice and uploads.
