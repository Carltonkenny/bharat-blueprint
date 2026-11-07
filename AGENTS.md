# AGENTS.md: Bharat Blueprint workspace

Calm, sourced explainer films about how India builds big machines, drawn entirely in code (HyperFrames, blueprint style), narrated by an unseen synthetic voice. Channel name: Bharat Blueprint (handle unverified). Five films (series S01) are finished, approved and posted on the channel (@BharatBlueprint-info). Series S02 (six episodes) is in design: scripts audited, not approved; narration is the user's own voice, no ElevenLabs.

**Read first:** `00_CHANNEL/AGENT_BRIEF_OPENCODE.md` (the full brief and build plan), then `00_CHANNEL/STORY_BIBLE.md`.

## Map
- `00_CHANNEL/` channel docs and plans. `_shared/pipeline/PIPELINE_V2.md` the process. `_archive/MOVE_LOG.md` old path to new path.
- `S01_The-Machines-That-Protect-India/` E01 to E05 projects, `FINAL/` the five MP4s, `upload/` titles, descriptions, thumbnails.
- `S02_DENIED-India-Built-It-Anyway/` series 2: start at its `README.md`; builder prompt in `00_SERIES/OPENCODE_PROMPT_S02.md`; engine spec `docs/design/08_S02_VISUAL_ENGINE_SPEC.md`, tickets `docs/design/09_S02_TICKETS.md`. Do not build an episode without its `APPROVED.txt`.
- `S03` to `S06` planned series (empty).

## Standing authorization (user, 2026-11-07)
Series 2 only: OpenCode may build and render S02 episodes on this laptop (GPU allowed) following `S02_DENIED-India-Built-It-Anyway/00_SERIES/MASTER_RUN.md`, working in a loop and notifying once at the end. This does not extend to Series 1, ElevenLabs, posting, deletion or system settings.

## Rules in one breath
Do not render (outside the S02 authorization above), regenerate voice, delete or overwrite existing episodes or finals. Never spend ElevenLabs credits without the user approving an estimate (one take per passage, no auto-retry). Never post anything or log in anywhere. No secrets in files. No hard-coded user paths. Facts need sources (PIB first), tagged VERIFIED / SECONDARY / TO VERIFY; no invented numbers, no rankings, no named hostile countries, concept level only, fiction stamped FICTIONAL SCENARIO. Default every slow or paid command to dry-run. Windows: use `python`, not `python3`; never scan `node_modules`.

## Commands (inside an episode folder)
`node build/test-engine.mjs` (must print "all passing"), `node build/qc-frames.mjs dist/qc`, `node build/holds.mjs`, `node build/split-passages.mjs`, `node build/make-audio.mjs`, `npx hyperframes render -q standard -w 2 -o renders/<name>.mp4` (11 to 17 min), then ffmpeg mux (libx264 crf 23, aac 192k).

## Roles
Claude designs (specs in `docs/design/`, start at `docs/design/README.md`) and reviews. OpenCode implements the tickets in `docs/design/07_TICKETS.md`, one at a time, and does not redesign: unclear spec means a question in `docs/design/QUESTIONS.md`, not a guess. The user decides, listens to voices and clicks upload. First task for any new builder: write `docs/design/UNDERSTANDING_CHECK.md` and stop.
