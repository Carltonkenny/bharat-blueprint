# 10 S02 skills: three reusable production skills (explain, map, data)

These are the three capabilities that lift a film above a slideshow. Each is a module in `_shared/kit-v2/skills/<name>/` with a README, a config format, a test and a demo page. They are free, local and offline. Skills are implemented inside the S2 tickets (S2-T1 to S2-T5); the master run (`00_SERIES/MASTER_RUN.md`) says when.

## Skill 1: `bb-explain` (message -> script -> storyboard -> scenes -> synced captions)
Purpose: turn one message into the full set of artefacts, so the same pipeline serves S03+.
- Mode `from-script` (used for S02): reads `script.md`, `passages.md`, `EPISODE_BRIEF.md`, `LEDGER.md` and writes `episode.s2.json` (beats), `glossary.json`, `captions/<ep>.srt` and `captions/<ep>.vtt`, `timing/splits.md`.
- Mode `from-message` (later series): takes a one-line message and writes a research prompt (in the style of `CHATGPT_RESEARCH_PROMPT.md`) plus an empty brief skeleton. Not implemented in the S02 run; write the interface and a stub that exits with a clear message.
- Captions: burned in only when measured timing exists. Word-level timing needs forced alignment; use it only if a local aligner (e.g. Whisper or faster-whisper) is installed. Otherwise caption at sentence level, timing each sentence by its share of the passage's measured duration. Style per `CAMERA_AND_ZONES_S02.md` (CAPTION zone). Captions text must equal the passage text exactly (QC B17).
- Acceptance: for E01, the generated `episode.s2.json` matches the brief's beat table (ids and content; only documented splits added); captions round-trip to the passage text; running twice gives identical output.

## Skill 2: `bb-map` (block maps, camera zooms, pins, routes)
Purpose: show where and how far without a country outline.
- Style: abstract block/grid terrain (hex or square blocks, 2 to 3 tones of blueprint blue), pins with labels, route lines that draw on, circles for coverage footprints, camera zoom/pan between a wide grid and a local strip.
- **No country, state or district borders. Ever.** Locations are schematic nodes placed by hand in `map.config.json` (`{id,label,x,y,source}`); `source` is a ledger id or `SCHEMATIC`. Real coordinates are not required; if used they need a ledger row.
- Uses: E03 regional footprint circle (labelled "up to 1,500 km beyond the boundary, ISRO") and orbit-region glow; E06 route strip Sawli -> Vikhroli -> BKC with the 7 km Thane Creek segment highlighted; E04 Kalpakkam pin; E05 twelve unit slots with state names as labels on schematic blocks (not a map of India).
- API: `map.create(config)`, `map.camera(t, keyframes)`, `map.pin(id, t)`, `map.route(id, t)` (draw-on), `map.footprint(id, t)`.
- Acceptance: a demo with 3 pins, 1 route, 1 footprint and a wide-to-local zoom; QC B16 passes; no polyline in the scene report tagged `border`.

## Skill 3: `bb-data` (CSV -> chart with exact numbers on every frame)
Purpose: numbers that are visibly true.
- Input `data/<ep>.csv` with columns `id,label,value,unit,as_of,source_id,kind` where `source_id` is a ledger id and `kind` is one of `counter | bar | chain | ratio | timeline`.
- Chart types: `counter` (count up to the value), `bar` (a bar to scale against a reference), `chain` (dimension chain, the channel's signature "honest number"), `ratio` (n of m dots, e.g. 9 of 12), `timeline` (dated ticks).
- Exactness: during an animation the displayed value is a pure function of t; at the end of the animation it equals the CSV value exactly (string compare of the formatted number); number formatting is deterministic (fixed locale, fixed decimals per row). No value on screen may differ from the CSV (QC B11).
- Data for S02 (from the ledgers): E01 thrust 19.5 and 22 t, 8 missions; E02 1988; E03 3 and 4 satellites; E04 500 MWe; E05 12 units, 9 and 3, 5 producing; E06 7 of 10 km, 7,700 rings, about 100 t. The agent writes the CSVs from the ledgers and a test that every CSV `source_id` exists and is VERIFIED or SECONDARY.
- Acceptance: a demo chart of each type; frame-by-frame test that the final frame text equals the CSV; a test that an unsourced row is rejected.
