# 09 S02 tickets (work in order; one at a time; stop after each for review)

Same ticket rules as `07_TICKETS.md`: finish with `docs/design/reviews/S2-T<n>/REVIEW_REQUEST.md` (files changed, how to run, verbatim output, risks, what you did not do); questions go to `QUESTIONS.md`. Prerequisite: ticket **T0** of file 07 (git safety net). Tickets T1 to T11 of file 07 (migrating S01) are NOT prerequisites and stay parked. Episode tickets also require `APPROVED.txt` in the episode folder; without it, stop and ask.
Every command that renders or is slow defaults to dry-run and needs the user's explicit go (the user says "go S2-T<n>"). No ElevenLabs. Nothing posted.

> Update 2026-11-07: the user authorised an unattended run. `S02_*/00_SERIES/MASTER_RUN.md` is now the driver: it executes T0, then S2-T0 to S2-T5, the episodes, and S2-T12 in one go, with REVIEW_REQUEST files written but no stops between tickets. Renders for S02 are authorised, including GPU (`--browser-gpu`, optional `--gpu`). The skills in `10_S02_SKILLS.md` are implemented inside S2-T1/T2/T4. Episode order is E01, E03, E02, E06, E05, E04 (the ticket numbers S2-T6 to S2-T11 keep their original episode labels; follow MASTER_RUN for order).

## S2-T0: spike (renders; authorised by MASTER_RUN)
- Build a 10-second test composition in `_shared/kit-v2-spike/` with: (a) a Three.js hero (lathe nozzle + chamber with a moving clipping-plane cutaway and a 2 s explode), (b) one line-figure doing "pump" with a bicycle-pump prop, (c) a flat beat with draw-on strokes and 3 labels, (d) glow on one path. Use `window.__seek(t)` and the seeded PRNG.
- Measure at 1920x1080 and 1280x720, glow on/off: seconds per frame for each beat type, total render time, memory, any WebGL errors. Project the full-film render time for 9,000 frames.
- Render the 10 s twice; compare per-frame hashes.
- **Accept:** `spike/REPORT.md` with the table and 3 frames (mid-beat of a, b, c); determinism PASS; recommendation 1080p vs 720p by the rule in 08 section 8; honest list of what looked bad.
- **Ask if:** WebGL does not work headlessly in HyperFrames here, or hashes differ and the cause is not clear in an hour.

## S2-T1: kit-v2 foundations
`tokens.js`, `labels.js` (with collision avoidance), `scenereport.js`, `camera.js`, `fx.js` (draw-on, sweep, glow, counter, particles, matchMorph), seeded PRNG, page template generator (`file://` safe, `episode-data.js`), unit tests (Node) for tokens, label dwell and collision, PRNG determinism.
- **Accept:** `node _shared/kit-v2/test/run.mjs` prints `all passing`; a demo page opens from `file://` with no console errors; `__sceneReport` returns boxes for 5 test labels and the collision test flags a deliberate overlap.

## S2-T2: hero module (3D)
Implement `blueprintHologram` material, clipping-plane cutaway, `explode`, and the builders in 08 section 7 for **E01 only first** (`tank`, `pipe-network`, `turbopump`, `chamber-nozzle`, `rocket-stack`). Others are built in their episode tickets.
- **Accept:** a gallery page shows each hero from 3 camera angles; each is deterministic; no builder creates geometry per frame; screenshot contact sheet reviewed by Claude.

## S2-T3: figure module (2D people)
Rig, 10 poses, props needed by E01 and E02 (gas stove, pot, bicycle pump, tyre, pressure cooker, papers and desk, knife, baton), `pose`/`blend`.
- **Accept:** a gallery page; poses blend without limb flips or length changes (test: limb lengths constant to 0.1 px across a pose sweep); strokes use the token widths.

## S2-T4: beat engine v2 and retime
Read `episode.s2.json` (generated from `EPISODE_BRIEF.md` tables by a one-off converter, shown for review), compute durations from estimate or measured timing with the clamps of QC B8, expose `__seek`, `retime` command per 08 section 5, glossary generator from `script.md`.
- **Accept:** with estimate timing, density 12 to 20 beats/min for E01 (after the documented sub-beat splits); clamp report empty or explained; `retime` on synthetic WAVs (tones separated by silences) recovers passage boundaries within 50 ms; refuses to guess when counts mismatch.

## S2-T5: QC v2
Implement every gate in `QC_BAR_S02.md` A to E, run on a synthetic bad video (black frames, frozen, pop, flicker, overexposed, overlapping labels, tiny text) and confirm each defect FAILS the right gate; run on the spike render and report.
- **Accept:** table of synthetic defects vs gate outcomes; `qc/report.md` format final; sheets generate; runtime for 9,000 frames reported.

## S2-T6: E01 pilot (Cryogenic Engine)
Needs `E01/APPROVED.txt`, T0, S2-T0 to T5 reviewed. Build from `EPISODE_BRIEF.md`, `passages.md`, `LEDGER.md`. Estimate timing first; QC; fix; then write `REVIEW_REQUEST.md`. Render only on the user's go.
- **Accept:** all QC gates PASS; `qc/beat_review.md` complete; contact sheets for Claude; preview render without voice. Stop.

## S2-T7 to S2-T11: E02 PARAM, E03 NavIC, E04 Nuclear, E05 Chips, E06 Tunnel
One per ticket, same pattern as S2-T6, each needing its own `APPROVED.txt` and Claude's review of the previous episode. Each adds only the heroes and props its brief lists.

## S2-T12: final mux and packaging helpers
`mux` with the user's voice (08 section 6 audio), loudness check, titles/descriptions/thumbnail generator skeletons from the SEO data once the user supplies it. Only after a pilot episode is approved.
