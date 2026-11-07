# Handoff prompt (copy everything inside the box below to another agent)

```
You are joining a finished project called THE MACHINES THAT PROTECT INDIA: five explainer films (Ep1 Akash-NG air defence, Ep2 fighter engine, Ep3 INS Vikrant, Ep4 how a missile finds its target, Ep5 from buying to building) drawn entirely in code, narrated by an unseen "Old Observer" in an ElevenLabs voice (Daniel, htZQqY7WtacRNV7s62Iy, model eleven_v4).

Where things are (Windows): C:\Users\user\OneDrive\Desktop\films and ads\
- akash-ng-episode-01\  Episode 1 project (older engine, different narrator voice)
- india-defence-series\ep02-fighter-engine, ep03-ins-vikrant, ep04-missile-shield, ep05-from-buying-to-building  one folder per episode: src\ (drawing, timing, film code), narration\ (voice plan, raw ElevenLabs passages, measured clip lengths), audio\, build\ (tests, QC, audio, split scripts), renders\, index.html
- india-defence-series\FINAL\  the five final MP4s (named The-Machines-That-Protect-India_E0N_...), voiceover-mp3\ (one MP3 per episode), index.html (plays all five)
- india-defence-series\*.md  MASTER_REFERENCE, EPISODES, EPISODE_BRIEF_V3, PIPELINE_V2 (how the pipeline works and what to refactor), EP4_EP5_REVIEW, VOICE_PLAN_EP4_EP5, REELS_PLAN, CHANNEL_PLAN (channel names, next series, reels, posting rhythm)
- Memory notes: C:\Users\user\.claude\projects\C--Users-user-OneDrive-Desktop-films-and-ads\memory\

Status: all five films are APPROVED AS FINAL by the user. Do NOT re-render, regenerate voices or delete anything without asking. Nothing has been posted. Next steps are packaging (channel, thumbnails, titles, captions), then reels and the next series, all in CHANNEL_PLAN.md.

Rules to keep: every fact needs a source (PIB first); mark VERIFIED/SECONDARY/TO VERIFY; no invented quotes or numbers; no named hostile countries; no rankings; concept-level only (no weapon schematics); fiction is stamped FICTIONAL SCENARIO; plain everyday examples; before/during/after for each idea. ElevenLabs credits are limited: estimate first, one take per passage, generations_count 1, never retry a call (it bills again). I cannot hear audio, so the user judges voices by ear.

Pipeline per episode (run inside its folder): node build/test-engine.mjs; node build/qc-frames.mjs dist/qc; node build/holds.mjs; node build/split-passages.mjs; node build/make-audio.mjs; npx hyperframes render -q standard -w 2 -o renders/<name>.mp4; then ffmpeg to join mix.wav with the silent render (libx264 crf 23, aac 192k). Gotchas: episode folders were copied from each other, so check clip-ID prefixes (e/f/g), the sound cues in build/make-audio.mjs, TARGET in src/timing.js and data-duration in index.html. Built-in WebSearch failed here; use the Tavily tool. On this PC use `python`, not `python3`. Do not run `du` over node_modules (it times out). Large intermediate *-silent.mp4 files sit in each renders\ folder; ask before deleting.

Skills worth reading first: unseen-narration, illusion-of-novelty, ig-reel (hookscore.py), video-sound-design. Read PIPELINE_V2.md and CHANNEL_PLAN.md, then ask the user what they want next.
```
