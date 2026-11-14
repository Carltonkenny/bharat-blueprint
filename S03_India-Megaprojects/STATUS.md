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

## Episodes (2026-11-14, end of build session)
All six built, rendered on GitHub Actions (workflow `.github/workflows/render-s03.yml`, 6 to 12 min each, run in parallel), voice mixed locally, and checked:
| Ep | Parity vs Series 1 | Frame gates | Final |
|---|---|---|---|
| E01 Chenab | pass (motion 53%, longest empty 2.8 s) | pass | FINAL/Bharat-Blueprint_S03E01_Chenab-Bridge_JUPITER-VOICE.mp4 |
| E02 Atal Tunnel | pass (48%, 2.0 s) | pass | ..._S03E02_Atal-Tunnel_... |
| E03 Atal Setu | pass (58%, 3.7 s) | pass | ..._S03E03_Atal-Setu_... |
| E04 Pamban | pass (48%, 3.3 s) | pass | ..._S03E04_Pamban-Bridge_... |
| E05 Vizhinjam | pass (11.6%, 3.5 s) | pass | ..._S03E05_Vizhinjam-Port_... |
| E06 Freight | pass (16%, 2.8 s) | pass | ..._S03E06_Freight-Corridor_... |
Loudness -16.6 to -17.2 LUFS. NOT done: listening to the voice by ear; script approval (no APPROVED.txt); the AUDIT_S03 open items (E04 reported timings, two concept citations); visual quality is clean but plainer than Series 1 (one hero per film, small objects in E05 and E06).
Cloud render: push to GitHub, then `gh workflow run render-s03.yml -f episodes="E04_Pamban-Bridge ..."` (or "all"); download artifacts with `gh run download <id>`; then parity_check, s03-mux, qc-frames locally. Note: `gh` needs `env -u GITHUB_TOKEN` on this PC (the env token is invalid; the stored login works).
