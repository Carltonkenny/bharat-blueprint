# Episode 2 — skills and checks log

date | stage | skill / tool | what changed | result
---|---|---|---|---
2026-11-04 | research | Tavily search + extract (PIB, GE, Eurojet, ASME, NETL) | SOURCE_LEDGER.md built; 3 claims left secondary, 2 programme statuses unconfirmed | done; WebSearch unavailable, Tavily rate-limited once
2026-11-04 | fact challenge | manual pass (doubt-driven-development skill NOT loaded) | numbers cross-checked across PIB 2012/2021 | ledger section C
2026-11-04 | engine v2 | code (src/blueprint.js) | exact circles, anchored leaders, whole-word reveals, bright-pass bloom, hot pen trail, quieter grid/scanlines | tests in build/test-engine.mjs
2026-11-04 | build | incremental checks | test-engine, qc-frames (every beat), qc-sweep (every 0.25 s) | see run output
2026-11-04 | QC | build/test-engine.mjs | 19 checks | all passing
2026-11-04 | QC | build/qc-frames.mjs (26 beats, held frame) | after fixes | 0 issues
2026-11-04 | QC | build/qc-sweep.mjs 0.5 s (390 frames) | after fixes | 10 flags, all explained: 6 crossfade duplicates of identical labels, 4 labels that complete on the last word of a keyed beat by design
2026-11-04 | QC | contact sheets every 6 s (33 frames) viewed | whole timeline | no empty sheet; mid-ink states as expected
2026-11-04 | perf | build/shoot-frames.mjs | 410-500 ms/frame, deterministic | above the 250 ms target; render will be slow until optimised
2026-11-04 | script | manual (narration v4) | +30 words of personality (hook, physics, metal, press releases); cap raised 260 -> 290, 287 words | narration_v4.txt
2026-11-04 | voice | ElevenLabs eleven_v4 via connector, voice Alfred (PmyzgD79S1p0rdLGPZBg) | 34 clips, 1 take each; 3 audition lines (Alfred, Roger One, Daniel) | 2,273 credits total (612 auditions + 1,661 clips)
2026-11-04 | audio | build/make-audio.mjs (ffmpeg) | trimmed clips at measured starts, synthesised pen/sweep/tick/thump/chord, drone bed ducked under voice | mix -16.6 LUFS, true peak -4.4 dBFS, LRA 8.1
2026-11-04 | QC | test-engine, qc-frames (26 beats), qc-sweep 0.5 s, contact sheets of the final file | after weak-spot fixes | 0 frame issues; 7 sweep flags = identical labels crossfading
2026-11-04 | render | hyperframes 30 fps looks, 2 workers, 7m03; mux + libx264 crf 20 | renders/ep02-fighter-engine-v1.mp4 | 134 MB, 200 s, no black or silent spans
2026-11-04 | voice v2 | ElevenLabs eleven_v4, Daniel (htZQqY7WtacRNV7s62Iy), 14 directed scene-length passages | split with build/split-passages.mjs (N-1 longest silences), 34 clips, 145.6 s of voice | about 2,700 credits for the passages (plus about 1,500 for Roger and Daniel auditions and the voice-design previews)
2026-11-04 | re-time | TARGET 208 s | all clip gaps rescaled | tests pass, 26 beats clean, sweep 0 issues
2026-11-04 | audio | build/make-audio.mjs + gain correction | -16.1 LUFS, true peak -2.0 dBFS, LRA 7.8 | the first single-pass loudnorm landed at -17.9 and was corrected
2026-11-04 | render | hyperframes 30 fps looks 6m55; mux crf 20 | renders/ep02-fighter-engine-daniel-final.mp4 (208 s, 139 MB) | contact sheets viewed; 0 black or silent spans
