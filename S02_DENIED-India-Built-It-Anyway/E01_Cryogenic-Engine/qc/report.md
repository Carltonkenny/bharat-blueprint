# E01 QC report - The Rocket Engine They Wouldn't Transfer

Render: Bharat-Blueprint_S02E01_Cryogenic-Engine_NOVOICE.mp4 | 1920x1080 | 30 fps | 315.80 s | 22.6 MB | 9474 frames
Beats: 65 | density 12.35 per minute | world ice
Timing: estimated (words / 1.8). No voice recording exists yet, so no captions are burned in.
The model can view images: every contact sheet was reviewed by the implementer.

| gate | what it checks | result | notes |
|---|---|---|---|
| A | frame gates F1-F8 on every frame | PASS | 9474 frames checked |
| B1 | text inside the safe area | PASS | scene graph |
| B2 | no overlapping label boxes | PASS | scene graph |
| B3 | label cap height >= 2.0% of the frame | PASS | scene graph |
| B4 | label contrast >= 4.5:1 | PASS | sampled background |
| B5 | label dwell >= 0.4 s + 0.3 s per word | PASS | scene graph |
| B6 | label words in the glossary | PASS | glossary.json |
| B7 | beat budget: <= 2 labels, 1 camera move, 2 effects | PASS | scene graph |
| B8 | beat length inside 1.2 s to 8 s (10 s for mechanism/payoff) | PASS | timeline.json |
| B9 | beat density 12 to 20 per minute | PASS | 12.35 beats/min |
| B10 | CONCEPTUAL/SCHEMATIC tag, source chip, FICTIONAL SCENARIO stamp | PASS | scene graph |
| B11 | every number on screen is in the ledger | PASS | qc/ledger-numbers.json |
| B12 | geometry sanity | PASS | scene graph |
| B13 | no console error, failed asset or WebGL context loss | PASS | page log |
| B14 | determinism: per-frame SSIM >= 0.999 | PASS | software WebGL path is byte-identical (see the S2-T0 report) |
| B15 | beat times equal the passage anchors within one frame | PASS | timeline.json |
| B16 | no country, state or district border | PASS | scene graph |
| B17 | captions: text, line count, zone, silence | PASS | no measured timing: no captions burned in |
| C | visual self-review, ten questions per beat | PASS | qc/beat_review.md |
| D | contact sheets, cut strips and full-size frames | PASS | qc/sheet_*.png, qc/cuts.png, qc/frames_*.png |

READY FOR REVIEW: yes
