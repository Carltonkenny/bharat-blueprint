# S02 visual direction: "Blueprint Plus" (designer: Claude; implementer: OpenCode)

Goal: faster, richer and more dimensional than S01 while staying one coherent world. The brand is still a living blueprint. What is new: 3D hero machines, line-figure people for everyday analogies, and a controlled effects kit. Everything is generated in code (no stock footage, no AI video shots, no real photos, no real people).

## 1. One world, three layers, one line language
| Layer | What it is | Share of screen time | Built with |
|---|---|---|---|
| A. Blueprint 2D/2.5D | diagrams, flows, dimension chains, maps, timelines, labels, number cards | about 55% | S01-style SVG/canvas, upgraded (kit-v2) |
| B. 3D hero objects | the machine itself: cutaways, exploded assemblies, orbits, wafers, TBMs | about 33% | Three.js, seek-driven, "blueprint hologram" look |
| C. Line-figure people | 2D anonymous figures acting out the everyday analogy (cook, cyclist, teacher, relay runners, painter) | about 12% | SVG parametric rig, same stroke style |
Every shot is one layer or a deliberate transform from one to the next (match-cut). No shot may mix more than two layers.

**The line language (must hold across layers):** white/pale-cyan strokes on blueprint-blue paper; consistent stroke widths per token (hairline 1, line 2, heavy 3.5 at 1080p); one accent colour per beat (amber for energy/heat, cyan for flow/signal, violet only in E05 for light); no gradients that look photographic; glow only on the active element.

**"Blueprint hologram" 3D look:** crisp edge lines (EdgesGeometry, angle threshold ~25 deg) plus a translucent fill with a fresnel rim, slight depth fog toward the paper colour, and a faint ground grid for scale. No textures, no realistic lighting, no reflections. A cutaway is a moving clipping plane that reveals interior parts in full line colour. An exploded view moves parts along their assembly axis with leader lines.

**Line figures:** anonymous, faceless, 7 joints (head, torso, two arms with elbow, two legs with knee), 1.8 head-heights wide proportions of a pictogram, white outline with one accent fill on the prop or the "active" body part. Poses are keyframed (reach, push, pump, carry, point, sort, pass baton, look up). They never speak, never have a face, never resemble a real person, and never appear in the FICTIONAL SCENARIO beats as named characters.

## 2. Pace (the "little faster" request, made measurable)
- Beat density: **12 to 20 beats per minute, aiming for about 15** (S01 was about 7, so roughly double). That is 60 to 80 beats for a 5-minute film.
- Median beat about 3.5 s; shortest 1.2 s (cuts for stakes/contrast only); longest 8 s, or 10 s for a declared `mechanism` or `payoff` beat.
- The beat tables in each `EPISODE_BRIEF.md` are a skeleton. If a skeleton gives fewer than 12 beats per minute, split the longest `mechanism` beats into identify / demonstrate / consequence sub-beats (ids `1.03a`, `1.03b`). Never add new content or labels the brief does not contain.
- Every concept follows: identify (0.8 to 1.5 s) -> demonstrate (2 to 4 s) -> label (the label is already on screen) -> consequence (1 to 2 s) -> move on.
- Max 2 new labels per beat. Label dwell >= 0.4 s + 0.3 s per word. Max 5 words per label.
- First 5 s: a striking image + an unanswered question. First 20 s: a reason to care. No logo bumper. Title card <= 2.5 s.
- One half-second of stillness before each declared reveal. No continuous camera drift for its own sake.

## 3. Effects kit (allowed) and budget
Allowed, each with a purpose: pen draw-on strokes; scanline/section-plane sweep (reveal); clipping-plane cutaway; exploded assembly; orbit, dolly, push-in, pull-back and parallax between layers; depth blur on the background layer only; glow/bloom on the active path (bloom threshold fixed so no more than 2% of pixels clip to white); seeded particle flows (propellant, signal pulses, data packets, dust); heat shimmer (cheap displacement, E01/E04 only); speed ramps via easing; match-cut morphs (shared primitives); number counters.
Banned: glitch, screen shake, lens flares, film grain, chromatic aberration, whooshing zoom spam, flashing text, unseeded randomness, any effect with no explanatory purpose.
Budget: at most 2 effect types per beat; at most 1 camera move per beat.

## 4. Episode worlds (accent variants inside the brand)
| Ep | Paper / mood | Accent | 3D hero | Character scenes |
|---|---|---|---|---|
| 1 Cryogenic | blueprint blue, frost | ice cyan + amber flame | conceptual upper-stage engine: tanks, feed lines, turbopump, chamber, nozzle | cook at gas stove, cyclist with pump, pressure cooker |
| 2 PARAM | deep navy | cyan network light | node -> board -> rack -> interconnect topology (3D mesh/torus) | teacher + papers, kitchen with one knife, relay runners |
| 3 NavIC | near-black navy, orbit grid | gold orbits + cyan signal | stylised wireframe Earth, satellites, intersecting range spheres | person hearing a bell across a field, fishing boat |
| 4 Nuclear | graphite blue | amber | staged flow platform (3 steps), conceptual heat-to-electricity loop | campfire, farmer with seed |
| 5 Chips | cleanroom, white-cyan | violet light + cyan | wafer with die grid, lithography stack, layered "city", package | blank-paper circuit, painter in a sandy room |
| 6 Tunnel | blueprint over earth strata (ochre/umber) | amber + cyan | conceptual slurry TBM: cutterhead, bulkhead, slurry lines, erector, lining rings; exaggerated city slice | spoon in wet sand, hand against a door |

## 5. Technical honesty rules (carry over, stricter)
- Every 3D hero carries a corner tag on first appearance: "CONCEPTUAL, NOT TO SCALE" (E01, E04, E06) or "SCHEMATIC".
- Do not depict real internal layouts of CE20, any reactor core, or any named product. Public, non-sensitive concepts only. No dimensions, isotopes, enrichment, coolant temperatures or core geometry in E04.
- E06 shows a slurry (Mixshield) machine, because that is what the PIB release describes. Settlement is exaggerated and labelled "EXAGGERATED".
- E03 orbit drawings are schematic; no real orbit parameters unless in the ledger. Do not show NVS-03 as operational; show its status as the ledger says on the recording date.
- Numbers on screen come only from the ledger, with a source chip (e.g. "ISRO, 7 Jul 2026").

## 6. Reframing for vertical
A centre crop of 16:9 to 9:16 keeps only about 32% of the width. So the 16:9 master is NOT constrained for it. Shorts are re-laid-out later by a `layout: "v"` option on selected beats (not part of the first build).

## 7. Resolution
Target 1920x1080, 30 fps. Decide after the spike (S2-T0): if the projected full-film render exceeds 3 hours at 1080p on the user's machine, master at 1280x720. Never mix resolutions inside one film.
