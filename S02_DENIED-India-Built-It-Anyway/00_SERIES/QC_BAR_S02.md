# S02 QC bar: strict, frame by frame, pass/fail

An episode is "ready for Claude's review" only when every gate below is PASS in `qc/report.md`. A FAIL anywhere means fix and re-run, not "note and continue". Never weaken a threshold to pass; propose a change in `docs/design/QUESTIONS.md` instead.

## A. Every frame of the rendered MP4 (automated, about 9,000 frames per film)
Decode every frame (ffmpeg), downscale to 320x180 luma + a 640x360 copy for edge tests. Compute per frame; fail on:
| ID | Check | Fail when |
|---|---|---|
| F1 | blank/black frame | mean luma < 8% of paper luma for 3+ frames outside declared fades |
| F2 | frozen frame | mean absolute difference to previous frame == 0 for > 1.0 s, unless the beat is declared `hold` (max 2.5 s of zero motion anywhere) |
| F3 | pop/jump | frame delta > 6x the rolling median (window 60 frames) and the frame is not within +-1 of a declared cut |
| F4 | flicker | luma sign alternates on 4+ consecutive frames outside a declared pulse |
| F5 | blown highlights | > 2% of pixels at 255 in all channels |
| F6 | jitter | a tracked static label region (from the scene graph) moves > 0.5 px between consecutive frames when it should be static |
| F7 | duplicate frames | 3+ identical consecutive frames in a moving beat (dropped-seek bug) |
| F8 | resolution/format | not exactly the declared WxH, 30 fps, yuv420p, h264 |
Output: `qc/frames.csv` (frame, time, luma, delta, flags) and a plot `qc/delta.png`.

## B. Every beat, from the scene graph (deterministic, no pixels)
Each beat is sampled at start+3 frames, mid-hold, end-of-hold-3 frames. The page exposes `window.__sceneReport(t)` returning every text/label/shape with its bounding box, colour and opacity.
| ID | Check | Fail when |
|---|---|---|
| B1 | text inside safe area | any label box outside the central 90% x 88% of the frame |
| B2 | overlap | two label boxes intersect by > 2% of the smaller box's area, or a label overlaps a hero's bounding box edge zone |
| B3 | size | rendered cap-height < 2.0% of frame height (about 22 px at 1080p) |
| B4 | contrast | label colour vs. sampled local background < 4.5:1 |
| B5 | dwell | label visible less than 0.4 s + 0.3 s per word |
| B6 | glossary | a label word not in `glossary.json` (script words + approved technical terms): a spelling check |
| B7 | beat budget | > 2 new labels, > 1 camera move, or > 2 effect types in one beat |
| B8 | beat length | beat shorter than 1.2 s or longer than 8 s (10 s for `mechanism`/`payoff`) |
| B9 | density | beats per minute outside 12 to 20 for the episode |
| B10 | tags | missing `CONCEPTUAL`/`SCHEMATIC` tag on a hero's first beat; missing source chip on any number; FICTIONAL SCENARIO stamp not present for the whole fictional passage |
| B11 | numbers | any digit string on screen not present in the ledger with a VERIFIED or SECONDARY tag |
| B12 | geometry sanity | NaN/Infinity in any transform; 3D object outside the camera frustum for the whole beat; a part with zero visible area while labelled |
| B13 | runtime | any console error/warning, failed asset load, or WebGL context loss |
| B14 | determinism | rendering frames 100 to 160 and 3,000 to 3,060 twice on the same machine and driver gives per-frame SSIM below 0.999 (identical hashes expected on the software path; hardware GL is not guaranteed bitwise stable) |
| B16 | no borders | any scene-graph object tagged `border`, or any polyline used as a country/state outline (map rule in VISUAL_DIRECTION and 10_S02_SKILLS) |
| B17 | captions | caption text differs from the passage text, caption lines > 2 or > 42 characters, caption outside its zone, or caption on screen when the passage is silent beyond 0.5 s |
| B15 | audio-free sync | beat times equal the passage anchors within 1 frame; after the user's voice is supplied, re-run with measured durations |

## C. Visual self-review (the "10 questions", answered per beat)
For each beat OpenCode writes one line in `qc/beat_review.md`: `id | Y/N x 10 | note`, using the ten questions from the master bible section 9 (main object clear in 2 s; one idea; parts connected and plausible; every label readable; held long enough; consistent with identity and previous shot; illustrative vs fact distinguished; no fabricated detail or misleading scale; phone-readable; next shot follows). Any N must be fixed, not explained.
If OpenCode's model cannot view images, it must say so at the top of `qc/report.md` and rely on A, B and the contact sheets; Claude then does the visual pass.

## D. Contact sheets for the human/Claude review
`qc/sheet_01.png ...`: 12 frames per sheet (3x4), 2 frames per beat (mid-hold and end-of-hold), each captioned with beat id and time. Plus `qc/cuts.png`: 7 frames (-3..+3) around every cut for pop inspection. Plus 6 full-size frames chosen at the 6 largest-delta moments and the 6 busiest-label moments.

## E. Pass line
`qc/report.md` ends with a table of A, B, C, D and one line: `READY FOR REVIEW: yes/no`. Gates are re-run from scratch after every fix. Then Claude reviews sheets and frames, and the user watches the film with the voice track before anything is promoted.

## F. Not in scope of automated QC
Narration performance, music taste and whether an analogy lands. Those are the user's (and Claude's) judgement.
