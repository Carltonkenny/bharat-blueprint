# REDO SPEC R2 (designer: Claude, 2026-11-08). Supersedes the visual parts of VISUAL_DIRECTION_S02, spec 08 and QC_BAR_S02 where they conflict.

Read `REVIEW_R1_S02.md` first: it says what was wrong and gives the measurements. This file says what to build instead. Anything not listed here keeps the earlier specs (briefs, ledgers, camera zones, content rules).

## A. Look: port the Series 1 look into kit-v2 (design correction)
The earlier instruction "kit-v2 must not depend on the S01 engine" is withdrawn. You MAY copy (never modify, never delete) source from `S01_The-Machines-That-Protect-India/E04_How-A-Missile-Finds-Its-Target/src/` (`blueprint.js`, `objects.js`, `motion.js`, `vehicles.js`, `kit.js`) and the same-named files in E02/E03 into `_shared/kit-v2/src/s01/`, record the origin in `docs/KIT_V2_PROVENANCE.md`, and build on them. Series 1 quality is the floor, not the ceiling.
Look-and-feel targets, taken from S01 frames (extract your own stills from `S01_*/FINAL/*E02*.mp4` at 60 s, 150 s, 215 s and `*E04*.mp4` at 70 s, 150 s, 230 s and compare side by side before you start and when you finish):
- textured blueprint paper (fine grain, light vignette), double border frame, scene tag top-left ("SC.3 - IDEA 1 - SENSE" style), episode and time HUD bottom-right;
- headline type large and bright: cap height at least 4.2% of frame height for statements, 2.6% for labels, 1.9% for source chips;
- annotated drawings: dimension chains, leader-lined labels, numbered callouts, exploded and three-view drawings, pen-drawn strokes with draw-on;
- constant, purposeful motion in every beat (flow arrows, counters, rotating parts, draw-on).
Layer shares per film: S01-style annotated 2D about 55 to 60% of beats; 3D heroes about 25 to 30%; figures about 8 to 12%. The 3D heroes are inserts into this world, not the world.

## B. Text system (fixes defect 6 and 7)
- Statement cards: at most 12 words, at most 3 lines. The type-on finishes by 35% of the beat, the text then holds at full brightness until the last 0.3 s, and only then fades (R13).
- Payoff and hook lines (kind `payoff`, `hook`, and the closing line of every film) are never dimmer than 90% brightness while they are fully typed.
- Labels at most 5 words, always with a leader line to their part; chips 1.9% of height, contrast 4.5:1 or better; number cards 4% of height for the main figure.
- End card: line 1 "INDIA BUILT IT ANYWAY" (large), line 2 "S02 - E0n - <episode title>" (small). Never print the series name twice.

## C. Hero staging (fixes defects 2 and 3)
- Auto-frame: the camera fits each hero's projected bounding box inside the HERO zone (x 0.20 to 0.80, y 0.14 to 0.78) with a 4% margin. Nothing important may be cropped by the frame (R11) except deliberate push-in details.
- A hero may appear in at most 3 consecutive beats with the same camera pose. Between beats change at least one of: azimuth by 15 degrees or more, scale by 25% or more, the isolated part (cutaway, exploded, single component), or the layer (hero to annotated 2D).
- Every hero beat also shows at least one leader-lined label and one moving flow, counter or particle stream, and a ground grid or dimension line for scale (R1, R2).
- Build more of the hero set so a film has variety: E01 tank, pipe run, turbopump, injector/chamber section, nozzle, rocket stack, engine test stand; E02 processor die, node board, rack, interconnect mesh, 3D task grid; E03 phone, ground station, atomic clock, satellite, range spheres, globe region; E04 fuel pellet symbol, steam loop, turbine, generator, three-step platform; E05 wafer, mask and light path, layer stack, dicing, package; E06 cutterhead (seen face-on, side section and from behind), bulkhead, slurry line, erector arm, ring assembly, city slice.

## D. Figures (fixes defect 4); rebuild the rig
Pictogram people, anonymous and faceless, drawn in the same stroke language:
- proportions: head height = 1/7.5 of figure height; torso a rounded capsule 2.6 head heights; limbs two-segment capsules about 0.45 head width; visible hands and feet; neck; shoulders and hips as filled joints. Every limb starts exactly at its parent joint (R7).
- figure height at least 45% of frame height in its beat, centred in HERO, with its prop and a background line (counter, floor, wall) so the scene is composed, not floating.
- poses animate across the beat (reach, push, pump, carry, lift, point, sort, pass, look up) with eased transitions; at least 2 distinct poses per figure beat.
- props, each recognisable in two seconds (draw them with real silhouettes, not boxes): gas stove with burner, pot and flame; bicycle pump with hose and tyre; pressure cooker with lid, valve and steam; desk with paper piles; chopping board and knife; relay baton; phone; bell; door; spoon and bowl of sand; paintbrush and wall; fishing boat with receiver.

## E. Pace and kinds (fixes defects 10)
14 to 16 beats per minute, median beat 3.5 to 4.0 s, none above 8 s (10 s for `mechanism` and `payoff`). Kinds are derived: any beat with layer H or C is `mech`; `number`, `fiction`, `missing`, `hook`, `payoff`, `title`, `transition` as in the brief; fewer than 40% of beats may be `hold`. Split long beats into identify / demonstrate / consequence sub-beats with different content each.

## F. Content fixes (defects 8 and 9)
- E06 on-screen "NOT MERELY OPERATING IMPORTED" is replaced by "DEEPEN DOMESTIC CAPABILITY" (the brief is corrected).
- No mixed-case artefacts ("UNDersea" -> "UNDERSEA"); all on-screen text upper-case from one source of truth; one tag per tag type per beat.
- Every number and date on screen from the ledger (B11) and nothing the ledger marks CUT or TO VERIFY.

## G. Gates (binding; none may be weakened; implement in kit-v2 QC and report each as a count)
Keep A (F1 to F8) and B1 to B17 from `QC_BAR_S02.md`. Add:
| ID | Check | Fail when |
|---|---|---|
| R1 | density | a `mech`/`reveal`/`payoff` beat has fewer than 4 distinct drawn elements besides the HUD, or more than 1 beat in 10 shows a single object |
| R2 | leader lines | a rail label has no visible leader line ending inside its part's box |
| R3 | figures present | a brief row naming a figure or prop does not show it for at least 60% of that beat |
| R4 | placeholders | a filled rectangle larger than 3% of the frame without text or icon; an arrow ending in empty space |
| R5 | variety | consecutive beats in a passage share a hero camera pose (azimuth, elevation, scale all within 3%) more than 3 times in a row |
| R6 | legibility | text contrast below 4.5:1, chips below 1.9% of height, headline below 4.2%, number-card main text below 4% |
| R7 | figure integrity | a limb start is more than 0.5 px from its parent joint; head ratio outside 1/8 to 1/6; figure height below 45% of H in a figure beat; fewer than 2 poses in the beat |
| R8 | kinds | `kind` not derived by section E, or 40% or more of beats are `hold` |
| R9 | pace | median beat above 4.0 s or fewer than 14 or more than 20 beats per minute |
| R10 | reports | any QC file empty, not parsing, or a gate id missing from the report |
| R11 | framing | a hero's projected box outside the frame by more than 2% at mid-hold, outside HERO by more than 4% |
| R12 | S01 parity | `python 00_SERIES/tools/parity_check.py <film.mp4>` does not PASS (mean frame change at least 0.20; real-motion frames at least 8%; near-empty frames at most 12%; longest near-empty run at most 4.0 s). Run on every render; paste the JSON into `qc/parity.json`. |
| R13 | text timing | at 40% of a statement beat the text is not fully typed; at 60% its brightness is below 90% of its maximum |
| R14 | no repeats | two consecutive non-`hold` beats whose mid-hold frames differ in fewer than 12% of pixels (320x180, luma difference above 12 levels) |
Self-review by yes/no answers is no longer accepted as evidence. In its place `qc/weakest.md` lists the 8 beats with the lowest density score in the final render, what is wrong with each, the fix made and the before/after frame names.

## H. Process (fixes root cause 5)
1. Port the look (section A) and rebuild the primitives you need.
2. Build a **gold clip** of E01: passages P03 to P05 (about 100 s: cook, tank, pump, cyclist, chamber). Render it with `--start/--end` only. Iterate on this clip until its `parity_check` passes and every R gate passes and its frames sit beside S01 stills without embarrassment. Save `E01/gold/gold_clip.mp4`, `gold/parity.json`, `gold/sheet_mid.png`, `gold/sheet_end.png`.
3. Build the rest of E01, run every gate, render, then STOP (see REDO_RUN) for Claude's review.
4. Only after `E01/R2_APPROVED.txt` exists, rebuild E03, E02, E06, E05, E04 with the approved kit.
5. Render only what you need to judge: use `--start/--end` clips while iterating; full renders only when all scene-graph gates pass.
