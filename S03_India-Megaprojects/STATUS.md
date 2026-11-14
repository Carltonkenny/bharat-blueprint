# S03 build status (Claude builds S03 itself, by the user's instruction of 2026-11-14)

Authority: the user told Claude to write the code and QA it for Series 3 ("not OpenCode"). Scripts are not formally approved (`APPROVED.txt` absent): the user's go-ahead is the authorisation to build; the open audit items in `00_SERIES/AUDIT_S03.md` still apply before posting.

## Per-episode recipe (what works, E01 proved it)
All paths from the episode folder; `K=../../_shared/kit-v2/tools`.
1. `node src/author.mjs` writes `src/beats.dsl.json`, `episode.s2.json` (passages from `passages.md`), `src/episode.js` stub. Beats are authored in that file with helper calls (`hero`, `stmt`, `flow`, `add`).
2. `node $K/compose-episode.mjs .` compiles the DSL into beats, writes `glossary.json` and builds the project (estimate timing).
3. Voice: `node $K/s03-voice.mjs . --estimate` then `--run --max-chars 5000` (Deepgram Aura-2 Jupiter, one take per passage, slowed 0.85x, 0.45 s pad; writes `timing/measured.json`). About US$0.11 per episode.
4. `node $K/build-episode.mjs . --size 1920x1080 --timing measured`.
5. `node $K/qc-scene.mjs . --json qc/scene-report.json --csv qc/scene.csv` must print "all gates pass".
6. Render (about 12 min, outside OneDrive): `HF="$LOCALAPPDATA/BharatBlueprint/render/S02/deps/node_modules/hyperframes/bin/hyperframes.mjs"; OUT="$LOCALAPPDATA/BharatBlueprint/render/S03/E0n"; node "$HF" render . -o "$OUT/E0n-r1.mp4" -q standard -w 8 --no-browser-gpu --quiet`.
7. Mux voice: `node $K/s03-mux.mjs . <silent.mp4> Bharat-Blueprint_S03E0n_<Slug>_JUPITER-VOICE.mp4` (places each passage at its beat start, -16 LUFS, video copied).
8. QC the render: `python ../00_SERIES/../../S02_DENIED-India-Built-It-Anyway/00_SERIES/tools/parity_check.py <silent.mp4> --json qc/parity.json`, `node $K/qc-frames.mjs . <silent.mp4> --out qc`, `node $K/qc-sheets.mjs ...`, then look at the sheets.

## Kit changes made for S03 (all in `_shared/kit-v2`)
- `src/hero/s03.js` (new): `arch-gorge` hero (Chenab). More heroes to add per episode in this file; registered via `H.builders`. Wired into `tools/sync-kit.mjs` and `templates/index.template.html`.
- `src/figures.js` and `src/compose.js`: figures can be mirrored (`flip: true` on `fig2`) so two people face each other.
- `tools/qc-scene.mjs`: B10 accepts an authored CONCEPTUAL tag on the beat (the tag fades in after the first sample).
- New tools: `tools/s03-voice.mjs`, `tools/s03-mux.mjs`.

## Lessons (save the next episode some time)
- Hero beats with callouts need `cam: 'hold'` (orbit camera moves labels and fails F6); animate hero parts by opacity, not by scale or rotation, when labels are present.
- Do not use two callouts with identical text in one beat. Keep titles under about 42 characters (they overflow the safe area beyond ~50).
- The `number` template: set `size: 150` and no `bars` (bar labels fail contrast; the numeral overlaps the unit at the default size). One `segs` label per `route` beat.
- Any digit on screen needs a source chip or a ledger entry (B10/B11): avoid "S03 · E01" in the title card.

## Episodes
| Ep | Status |
|---|---|
| E01 Chenab | script, DSL, voice (291 s), scene QC pass; render r1 started 2026-11-14 (see below for the result) |
| E02 to E06 | not started (scripts, briefs, ledgers and passages exist; heroes `pass-profile`, `tunnel-section`, `sea-bridge`, `deck-plate`, `lift-span`, `port-hub`, `rail-corridor` still to write in `s03.js`) |
