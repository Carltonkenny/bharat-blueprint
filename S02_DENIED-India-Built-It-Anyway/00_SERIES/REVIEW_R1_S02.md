# Review R1 of the S02 run (Claude, 2026-11-08): all six films FAIL

Method: I did not rely on OpenCode's reports. (1) ffprobe of all six finals. (2) My own per-frame analysis of every frame of every film (ffmpeg signalstats at 320x180: luma, frame difference) and of two Series 1 finals (E02, E04) as the baseline. (3) A mid-hold frame of every beat of every film, viewed on 25 contact sheets (E01 to E06, 5+4+4+4+4+4). (4) End-of-hold frames for E01's text beats. Numbers below are mine.

## Verdict
| Film | Verdict | Score (S01 about 7) | One-line reason |
|---|---|---|---|
| E01 Cryogenic | FAIL | 3 | sparse frames, crude figures, one chamber image repeated, tiny dim text |
| E02 PARAM | FAIL | 2 | a single flat slab fills 14 of 57 beats, figures crude, many near-empty beats |
| E03 NavIC | FAIL | 3 | satellites and globe cropped at the frame edge, many near-empty beats |
| E04 Nuclear | FAIL | 3.5 | stepped platform cropped at the bottom and left, mostly text and small icons |
| E05 Semiconductors | FAIL (closest) | 4 | wafer / litho stack / layer stack / package sequence and the ATMP-FAB grid are the best frames of the series, but the opening is placeholder rectangles |
| E06 Tunnel | FAIL (closest) | 4 | number cards and city slice are good, but the TBM face is one oversized, cropped circle shown in about 20 of 56 beats |

## What works (keep it)
Deterministic software render (byte-identical, verified by OpenCode and consistent with my frame checks), 1920x1080 at 30 fps, correct runtimes (4:37 to 5:16), honest tags (CONCEPTUAL / SCHEMATIC / EXAGGERATED / FICTIONAL SCENARIO for the whole passage), number cards with sources (22 t; 8 missions; 3 of 4 satellites; 500 MWe; 12 units / 9 ATMP / 5 producing; 7 km of 10; 7,700 rings), no borders, the series end card. Some 3D heroes are good in isolation (rocket stack, litho stack, layered wafer, package, building slice).

## Objective measures (my script; baseline = Series 1)
| Film | mean frame change (YDIF) | frames with real motion (>0.5) | near-empty frames |
|---|---|---|---|
| S1 E02 | 0.438 | 23.6% | 6.8% |
| S1 E04 | 0.296 | 9.6% | 6.0% |
| S2 E01 | 0.075 | 1.6% | 39.9% |
| S2 E02 | 0.053 | 0.7% | 46.9% |
| S2 E03 | 0.177 | 11.8% | 41.1% |
| S2 E04 | 0.085 | 0.9% | 55.9% |
| S2 E05 | 0.059 | 0.6% | 54.0% |
| S2 E06 | 0.352 | 34.3% | 36.1% |
Near-empty = a frame whose mean luma is within 0.6 levels of the film's own 3rd-percentile frame (only grid and HUD). No frame is exactly frozen (OpenCode's F2 is honest), but between cuts E01, E02, E04 and E05 hardly change at all. Roughly 40 to 56% of each S2 film is near-empty, against 6 to 7% for Series 1.

## Defects seen (with where)
1. **Frames are sparse.** Most beats are one small object or one line of text in a mostly empty frame (all films).
2. **Reused heroes.** E01 chamber (about 12 beats), E02 slab (14 of 57), E04 stepped platform (about 10), E06 TBM face (about 20 of 56), same camera pose.
3. **Hero framing bugs.** E06 TBM face, E04 platform and E03 globe/satellites are cropped by the frame edges (E06 0:14 to 3:55, E04 0:41, 0:57, 2:31 to 4:32, E03 0:29 to 0:39 and 1:22 to 1:33); E01 turbopump jammed against the left edge at 1:53.
4. **Figures are broken.** Arms are separate strokes not attached to the shoulders, no hands or feet, an oversized head, props unrecognisable (stove, pump, cooker, papers, knife), figure about 25% of frame height, same pose throughout (E01, E02, E03, E04, E05, E06).
5. **Placeholders on screen.** E01 0:40 pale rounded boxes with "I"; E01 1:16 two arrows pointing at nothing; E05 0:03 to 0:18 plain rectangles standing for a car, phone, scanner and grid.
6. **Text is slow and dim.** Statement text is typed word by word and is only complete near the end of the beat, where it is already fading (E01 0:26, 0:50, 3:54, 4:50, 5:12 show the sentence dim at end of hold; mid-hold frames show half sentences such as "A CLOSED DOOR IS / A FINISHED"). The payoff lines are dim. Note: I first mistook this for truncated text; it is not truncation, it is bad timing and brightness. Fix timing, not wording.
7. **Small text.** Labels and chips are tiny at 1080p; source chips ("ISRO, 6 JUL 2026", "PIB, 18 JUL 2026") are barely readable.
8. **Unsourced claim on screen.** E06 4:14 shows "NOT MERELY OPERATING IMPORTED" (the script and ledger removed that claim). The brief row has now been corrected.
9. **Typos and duplicates.** E06 3:20 and 3:24 "UNDersea STRETCH OF THE LINE" (mixed case); E06 1:27 the EXAGGERATED tag is printed twice; every end card prints the series name twice ("INDIA BUILT IT ANYWAY / THE INDIA BUILT IT ANYWAY SERIES").
10. **Pace barely inside the gate.** 12.04 to 12.35 beats per minute (E01: 65 beats, median 4.8 s). Beat kinds are mis-tagged (E01: 59 of 65 `hold`).
11. **My review notes were not applied.** `REVIEWER_NOTES.md` (R1 to R10) produced no visible change: the same beat counts, the same figures, the same frames, and no R gate in the reports. Whether OpenCode did not read it or ignored it, the reports still say every gate passes and every self-review answer is yes. Self-review is not reliable evidence.

## Root causes
1. My spec (08) told OpenCode not to depend on the Series 1 engine, so S2 lost the S1 look (textured paper, large headlines, scene tags, dimension chains, annotated drawings). That is my design error.
2. The beats were generated from one-line brief descriptions into a few primitives, with no visual reference and no iteration loop.
3. The gates measure absence of defects (pops, flicker, overlap), not presence of content; they cannot fail a sparse film.
4. The implementer graded its own work with yes/no answers.
5. Too much at once (3D, figures, maps, data, QC, six films) with no vertical slice.

## Decision
All six films are rejected as finals. Do not record voice over them. Redo per `REDO_SPEC_R2.md` and `REDO_RUN.md`; E01 is rebuilt first and must pass my review before E03, E02, E06, E05 and E04 are rebuilt.
