# REVIEW REQUEST - S2-T5 (QC v2)

Implementer: OpenCode. Date: 2026-11-07.

## Files added
- _shared/kit-v2/tools/qc-scene.mjs (the scene-graph gates B1 to B17)
- _shared/kit-v2/tools/qc-frames.mjs (the frame gates A and F1 to F8, every frame)
- _shared/kit-v2/tools/qc-sheets.mjs (the contact sheets of QC part D)
- _shared/kit-v2/tools/qc-determinism.mjs (the per-frame SSIM for B14)
- _shared/kit-v2/tools/qc-synthetic.mjs (the synthetic-defect test)

## How to run
    node _shared/kit-v2/tools/qc-synthetic.mjs
    node _shared/kit-v2/tools/qc-scene.mjs <episodeDir>
    node _shared/kit-v2/tools/qc-frames.mjs <episodeDir> <video>
    node _shared/kit-v2/tools/qc-sheets.mjs <episodeDir> <video>
    node _shared/kit-v2/tools/qc-determinism.mjs <videoA> <videoB>

## Verbatim output (the synthetic-defect test)
    | defect | gate | result |
    |---|---|---|
    | black frames | F1 | FAIL (as expected) |
    | frozen frames | F2 | FAIL (as expected) |
    | duplicate frames | F7 | FAIL (as expected) |
    | a hard jump | F3 | FAIL (as expected) |
    | flicker | F4 | FAIL (as expected) |
    | overexposed | F5 | FAIL (as expected) |
    | overlapping labels | B2 | FAIL (as expected) |
    | tiny text | B3 | FAIL (as expected) |
    all passing

## Acceptance
Every synthetic defect fails the right gate and nothing else. The frame gates decode
every frame of the MP4 once at full resolution and write qc/frames.csv and
qc/frames-report.json; the scene gates sample every beat three times and write
qc/scene-report.json, qc/scene-gates.csv and qc/label-boxes.json (the tracked
label regions for the jitter gate).

## Deviations and risks
1. The frame gates need the label boxes, so qc-scene.mjs must run before
   qc-frames.mjs. The order is in the episode loop.
2. The HUD (the scene tag and the timecode) is excluded from the glossary, number and
   source-chip gates: a timecode is not a fact. It is still inside the safe area.
3. F3 uses a floor of 10 luma units when the rolling median is zero, so a hard jump
   after a static passage is still caught.

## What I did not do
The qc/delta.png plot is not produced by the frame gate: the frame delta series is in
qc/frames.csv and the contact sheets carry the largest-delta frames.