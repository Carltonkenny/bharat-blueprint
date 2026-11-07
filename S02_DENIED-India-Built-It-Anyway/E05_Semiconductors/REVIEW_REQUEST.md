# REVIEW REQUEST - E05 (India Wants to Build the Chips Inside Everything)

## What was built
- `episode.s2.json`: 59 beats from `EPISODE_BRIEF.md`, weights and sub-beat splits in `timing/splits.md`.
- `src/scene-ops.json`: the scene implementation of every beat; `src/episode.js`: the shared custom scene ops.
- `data/episode.csv`: the numbers taken from the ledger; `glossary.json`: 685 terms.

## Files
- `renders/Bharat-Blueprint_S02E05_Semiconductors_NOVOICE.mp4` (and `FINAL/Bharat-Blueprint_S02E05_Semiconductors_NOVOICE.mp4`): 1920x1080, 30 fps, 293.60 s, 17.6 MB, no voice track.
- `qc/report.md`: the gate table. `qc/beat_review.md`: the ten questions per beat.
- `qc/frames.csv`, `qc/frames-report.json`, `qc/scene-report.json`, `qc/label-boxes.json`.
- `qc/sheet_01.png ... sheet_10.png`, `qc/cuts.png`, `qc/frames_*.png`.

## How to run it again
```
node _shared/kit-v2/skills/bb-explain/bb-explain.mjs --episode <episodeDir> --write
node _shared/kit-v2/tools/build-episode.mjs <episodeDir> --size 1920x1080
node _shared/kit-v2/tools/qc-scene.mjs <episodeDir>
node _shared/kit-v2/tools/qc-frames.mjs <episodeDir> <video>
node _shared/kit-v2/tools/qc-sheets.mjs <episodeDir> <video>
```

## Gate result
- Scene graph (B1-B17): 0 failures over 295 samples.
- Frame gates (A, F1-F8): 0 failures over 8808 frames.
- READY FOR REVIEW: yes.

## Deviations and risks
1. The render uses the software WebGL path (`--no-browser-gpu`). Hardware GL on the RTX 3050 is
   reachable per process but is not bitwise stable enough for QC B14 (min SSIM 0.9985). See
   `_shared/kit-v2/spike/REPORT.md`.
2. No voice recording exists, so the film runs on estimated timing (words / 1.8) and carries no
   burned-in captions. Re-run `finalize-with-voice` when the recording is ready.
3. The draft render and the final render were made in one pass: on this machine both cost
   the same wall time (the capture dominates), so the frame gates were run on the delivered file.

## What I did not do
I did not edit the script, the passages, the ledger, the brief or the approval file, and I did
not touch Series 1, post anything, or change any system setting.
