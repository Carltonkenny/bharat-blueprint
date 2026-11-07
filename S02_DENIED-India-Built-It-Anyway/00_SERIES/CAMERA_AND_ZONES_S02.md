# S02 camera and screen zones (designer: Claude; authority for layout and camera; build to this)

Coordinates are fractions of frame width W and height H, origin top-left. At 1920x1080 multiply by W and H.

## 1. Screen zones (the HUD layer is in screen space; the camera never moves it)
| Zone | x range | y range | Used for | Rules |
|---|---|---|---|---|
| SAFE | 0.05 to 0.95 | 0.06 to 0.94 | everything with text | nothing readable outside (QC B1 uses 0.05/0.95 and 0.06/0.94) |
| TOP_BAND | 0.05 to 0.95 | 0.06 to 0.13 | FICTIONAL SCENARIO stamp, CONCEPTUAL / SCHEMATIC / EXAGGERATED tags, scene tag | stamp left-aligned x 0.05 to 0.45 for the whole fictional passage; tags right-aligned |
| HERO | 0.20 to 0.80 | 0.14 to 0.78 | the 3D hero, the main drawing, a character scene | one primary subject; keep its bounding box inside this zone at every frame of a hold |
| RAIL_L / RAIL_R | 0.05 to 0.19 / 0.81 to 0.95 | 0.14 to 0.78 | component labels (<= 5 words), with leader lines to the part | labels never sit on the hero; max 3 labels per rail per beat |
| NUMBER_CARD | 0.06 to 0.40 | 0.62 to 0.80 | the honest number and its dimension chain | hero must leave this zone clear while the card is up; hold >= 3.5 s |
| SOURCE_CHIP | 0.06 to 0.40 | 0.81 to 0.85 | "ISRO, 7 Jul 2026" style chip under the number card | font >= 1.9% of H, always attached to a number |
| CAPTION | 0.15 to 0.85 | 0.86 to 0.94 | burned-in captions (only when measured timing exists) | max 2 lines, 42 characters per line, centred, 85% opaque dark plate |
| TITLE_CARD | 0.20 to 0.80 | 0.38 to 0.62 | series title at the end (<= 2.5 s) and episode title at start (<= 2 s) | no other text at the same time |
Overlap rule: two zones may overlap only if at most one has content in that beat (QC B2 enforces).

## 2. Camera vocabulary (all analytic functions of t; no wall clock)
| Move | Parameters | Limits (readability) | Use |
|---|---|---|---|
| hold | none | min 0.5 s before a reveal | stillness before the payoff |
| push-in | scale 1.0 -> 1.15 to 1.35 over the beat, ease-in-out | <= 25% per second | focus a part |
| pull-back | reverse of push-in | same | resolve to the whole machine |
| orbit | azimuth +-20 to 40 degrees, elevation +-8 degrees | <= 12 degrees per second | show a 3D hero from a second angle |
| dolly | forward/back along the view axis 10 to 25% | <= 20% per second | reveal depth |
| parallax | layers move at BG 0.3, MG 0.7, FG 1.0 of the camera shift | shift <= 4% of W per beat | depth between layers |
| whip (cut) | 6-frame ease between two beats, with motion blur off | only at declared scene changes, max 4 per film | transitions |
Per beat: at most one camera move (QC B7). Camera never moves during a number card or a label's first 0.4 s. No handheld shake, no rotation of the horizon (roll = 0).
World-anchored labels follow their part but are clamped into the rails; if clamping would cross the hero, the label flips to the other rail.

## 3. Per-episode camera plan (by passage; moves are guides, the brief's beats decide content)
Episode 1: P01 push-in on drop, match-cut to rotor, pull-back to rocket; P02 hold on gate then slow dolly into the engine silhouette; P03 hold on cook, push-in on frosted tank; P04 hold on cyclist, orbit 30 degrees around the turbopump; P05 push-in on chamber, dolly along the nozzle; P06 hold; P07 pull-back across the timeline, hold on the 22 t card; P08 locked-off (fiction), slow push-in on the gauge; P09 hold; P10 reverse of P01: pull-back to the full rocket, hold.
Episode 2: P01 push-in on the locked cabinet; P02 hold; P03 hold on classroom, dolly to the node grid; P04 orbit 25 degrees around the mesh, push-in on the slow link; P05 hold; P06 slow pull-back as the machine assembles; P07 locked-off weather grid; P08 hold; P09 push-in then pull-back as the cabinet opens.
Episode 3: P01 hold; P02 vertical pull-back from phone to satellite (dolly + parallax); P03 hold; P04 orbit 30 degrees over Earth, push-in on the pulse; P05 push-in on the first sphere; P06 orbit around the intersecting spheres; P07 hold; P08 hold on the number card, slow push-in on NVS-03; P09 locked-off boat; P10 pull-back through layers.
Episode 4: P01 hold on date card, slow dolly toward the bridge; P02 hold; P03 hold; P04 push-in on loop; P05 hold; P06 hold; P07 orbit 20 degrees around the staged platform; P08 hold on the 500 MWe card; P09 locked-off; P10 hold; P11 pull-back to the road.
Episode 5: P01 five quick holds (one chip each, whip cuts allowed); P02 slow pull-back to the lattice; P03 push-in on the wafer; P04 orbit 25 degrees around the litho stack; P05 hold then dolly down the cleanroom corridor; P06 orbit 35 degrees around the layer city; P07 hold and pan along dicing/packaging; P08 hold on the 12-slot card; P09 locked-off; P10 hold; P11 pull-back to the single chip.
Episode 6: P01 pull-back from the street, dolly down through the fold into the cutaway; P02 hold; P03 slow pull-back to the city slice; P04 hold on the spoon, push-in on the settling ground; P05 push-in on the cutterhead, dolly along the slurry line; P06 hold on door, orbit 20 degrees around the face; P07 follow the erector arm, pull-back along the ring; P08 hold on the 7-of-10-km map strip; P09 locked-off; P10 rise through strata; P11 hold, then still.

## 4. Hard drawing rules
- No country, state or district outlines anywhere (India's boundary depiction is legally sensitive and any error is a problem). Use pins, labelled dots, grid blocks, circles and route lines only. QC B16 enforces.
- Nothing outside SAFE except background grid and decorative parallax layers.
- Labels use the glossary only (QC B6). Numbers only from the ledger (QC B11).
