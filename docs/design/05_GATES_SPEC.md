# 05 Gates spec: every automated check

Each gate returns PASS, WARN or FAIL with the measured value. FAIL blocks the next stage. WARN is shown to the human, never silently ignored. Thresholds come from today's tests where they exist.

## Spec gates (run by `bb check`, no browser needed unless noted)
| Gate | Rule | Source |
|---|---|---|
| G1 schema | `episode.json`, `script.json`, `beats.json`, `series.json` validate against their schemas; folder name matches; clip prefix unique in series | new |
| G2 text | concatenated `script.json` clip text equals concatenated `voice-plan.json` passages exactly (ignoring bracket direction tags) | today's "clips concatenate to narration exactly" |
| G3 timing math | `target` in the allowed range for the series (default 120 to 330 s); `index.html` `data-duration` equals `target`; computed `DURATION` within 0.5 s of target once measured; gap rescale factor k between 0.3 and 4 (warn outside) | today's "duration is 4:00 to 5:05" generalised |
| G4 clips and beats | clips never overlap; beat start times strictly increase; no beat shorter than 2.0 s; final title held at least 2 s (needs browser: `bb test`) | today's test-engine |
| G5 beats vs panels | every beat id has a `PANELS` entry and every `PANELS` entry has a beat; every panel draws at start, middle and end without error; leaders use `BP.leaderTo` only | today's test-engine |
| G6 theme | scenes follow the slot order in 03; exactly three IDEA scenes; there is a clip with role `cannot-yet` inside the INDIA scene; a `stamp-fiction` clip that is the first clip of the WHAT_IF scene and whose beat draws the text `FICTIONAL SCENARIO`; a `callback-close` clip as the last clip; at least one `sourced-number` clip; HUD strings derive from the manifest (no hard-coded `EP0n` in generated or authored kit code) | new |
| G7 sources | `sources/LEDGER.md` exists; every row has an id, claim, source URL or reference, date, and a tag in `VERIFIED, PARTLY, SECONDARY, TO VERIFY`; every `PANELS_META` sourced number cites a ledger row id; `--publish` fails on any `TO VERIFY` row | new |
| G7b hygiene | all files UTF-8 no BOM, LF; no `�`; no absolute user paths in code; generated files carry the GENERATED header and match a fresh `bb gen` | new |

## Media gates (run by `bb qc` on the muxed MP4 and frames)
| Gate | Measurement | PASS | WARN | FAIL |
|---|---|---|---|---|
| G8a loudness | ffmpeg `ebur128` integrated LUFS | -16 ±1 | ±1 to 2 | beyond ±2 |
| G8b true peak | `ebur128` true peak | at most -1.5 dBTP | -1.5 to -1.0 | above -1.0 |
| G8c silence | `silencedetect noise=-50dB d=3.5` | none except lead-in and the pause before the title | 1 extra | 2 or more |
| G8d SFX audibility | RMS of the sfx stem in a ±0.3 s window at each cue vs RMS of the bed alone over the same window | at least +3 dB for every cue | one cue under | two or more under |
| G9a black frames | `blackdetect d=0.3 pix_th=0.10` | none after 0.5 s and before the last 0.5 s | | any |
| G9b format | ffprobe: 1280x720, 30 fps, h264 + aac, audio and video duration equal within 0.1 s, duration within 0.1 s of the authored `target` (not the recomputed `DURATION`, which can overrun when MIN_GAP binds, as in Ep2) | all | | any |
| G9c sync | detected first voice onset within 0.15 s of first clip start; each beat's wipe sweep within 0.35 s of beat `t0 - 0.3` | all | one | two or more |
| G10 density | frame at end-of-hold of each beat; ink ratio = share of pixels brighter than paper by 40 levels, excluding the HUD strip; per-beat | at least 2.0% | 1.0 to 2.0% | under 1.0% |
| G11 completeness | frame at 60% of each beat: every typed headline fully drawn (tested by sampling the text-progress function at that time, as today's `text at p=1`) and no clipped text | all | | any |
G10 and G11 produce `qc/contact.png` for a human to look at; **a human sign-off line is required in `qc/report.md` (`HUMAN: watched, approved, <date>`) before `bb promote`.** G10 is a near-blank detector only. Measured on Ep4, every beat is between 3.26% and 6.37% and the visibly sparse WHAT IF beat 8.2 reads 4.37%, so ink share cannot judge sparseness. Sparse beats are caught by the human reading `qc/contact.png`, which must print each beat's id and ink ratio under its thumbnail. T5's calibration run may propose a drawing-area metric (excluding text, stamp and HUD) as G10b, advisory only, and only if it separates Ep4's 8.x beats from the rest across all five finals.

## Reporting
`qc/report.md` lists all gates, the worst three beats by density, and the measured numbers. The same format is used for all episodes so they can be compared.

## Calibration rule
Thresholds above are starting values. T5 must run G8 to G11 on the five existing finals (read-only) and report the numbers; the reviewer tunes thresholds against that baseline before they become FAIL conditions. Known: Ep2 SFX are weak and should show as WARN/FAIL on G8d.
