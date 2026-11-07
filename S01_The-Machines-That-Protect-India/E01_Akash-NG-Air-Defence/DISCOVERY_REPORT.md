# Akash-NG Episode 01 — Discovery Report (Phase A–E)

Status: discovery only. No packages installed, no production code written, no audio generated.
Date: 2026-11-04

## 1. Understanding of the project
A recurring series, CINEMATIC SCENARIO-DRIVEN ENGINEERING EXPLAINERS. Each episode opens with a hypothetical scenario and
explains an engineering system by showing it being drafted, connected and revealed, not by narrating over slides.
Visual identity: ENGINEERING BLUEPRINT — HAND-DRAWN CYANOTYPE (Prussian-blue paper, white/cyan linework, inked view by view,
dimension chains, hatched sections, title block, creases). Red and orange are rare accents. Episode 1: "What happens before a
missile is fired?" (Akash-NG), 110 s, 1280x720, 30 fps, silent, six scenes, ~24 storyboard frames.

## 2. Reference implementation: what I actually received
- RECEIVED: the H helper library (rng, makeNoise, math/ease, colour, layer, grain, paper, vignette, render, loadFonts).
- RECEIVED BUT TRUNCATED: SOUND kit, cut off mid-function (`function out(node, p) { const pan = ctx.createSt`). Not usable; not needed this stage.
- NOT RECEIVED: the reference animation source. The prompt says "complete source code of a reference animation" but contains only
  the H library and the sound kit. Missing: `explainer()`, `draw()`, `explainerSound()`, and every blueprint-specific function
  (paper mottling parameters, ink pooling/bleed, misregistration, fold creases, glow, scanlines, border/title block, lettering,
  arrows, dimension callouts, transitions). H.paper/H.grain/H.vignette are generic; the "cyanotype" look lives in the missing code.
- Consequence: I cannot reproduce "the authoritative style" faithfully without it. I will not guess it.

## 3. Hyperframes (inspected, NOT installed)
- npm `hyperframes` latest 0.9.9 (modified 2026-11-03), Apache-2.0, repo heygen-com/hyperframes. Not installed here (npx --no-install failed).
- Docs read via Context7/Tavily (Context7 snapshot is v0.8.169, so 0.9.9 specifics are unverified until installed).
- Model: HTML composition; root element `data-composition-id`, `data-width`, `data-height`, optional `data-fps`; timed children use
  `class="clip"` + `data-start/data-duration/data-track-index`. Seekable animation via a paused GSAP timeline in
  `window.__timelines[id]`, or a custom runtime using the seek protocol: `window.addEventListener("hf-seek", e => renderAt(e.detail.time))`
  (with `e.detail.waitUntil`), or `window.__hf = { duration, seek }`. Docs forbid rAF/timers as the clock.
- Render: `npx hyperframes render -o out.mp4 --fps 30 --quality looks|high`, engine = Puppeteer + FFmpeg, `--docker` for byte-identical output.
- Proposed integration (smallest adapter): one composition 1280x720, data-fps=30, a single full-size `<canvas>`, H library loaded unchanged,
  `explainer(ctx,W,H_,t)` unchanged; a ~15-line adapter calls `window.seek(t)` from `hf-seek` and sets `window.DURATION = 110`.
  Keep the standalone player path (`window.seek(i/30)`) working in parallel.
- Risks: (a) hf-seek/__hf API names must be re-verified against installed 0.9.9; (b) H.grain/getImageData per frame is heavy (3300 frames) —
  measure; (c) Google Fonts need network — render needs fonts loaded before first frame (self-host IBM Plex Mono / Space Mono for offline determinism);
  (d) Hyperframes ships its own Chrome/Puppeteer — large download on install, needs your OK.
- Fallback if integration is awkward: own Puppeteer/Playwright loop + FFmpeg (as the reference prompt itself describes).

## 4. ElevenLabs (inspected, NOT connected)
- No ElevenLabs MCP in Claude config (checked ~/.claude.json and settings.json), no SDK installed, no API key env var set
  (ELEVENLABS_API_KEY / XI_API_KEY / ELEVEN_API_KEY all unset). Authentication is therefore NOT configured; nothing was called.
- Official options (from docs): MCP server `elevenlabs-mcp` (run via `uvx`, env `ELEVENLABS_API_KEY`, optional `ELEVENLABS_MCP_OUTPUT_MODE`);
  REST `POST /v1/text-to-speech/:voice_id` with `xi-api-key` header, `model_id`, `output_format`.
- To do later (you): create/keep an API key, put it in an environment variable or a git-ignored `.env`; never in the repo or chat.
  `uv` availability not checked.
- Other connectors in this session (Comfy, Higgsfield, generic speech tools) are not your ElevenLabs account; I will not use them.
- Future flow: `narration.json` (locked script + segment timestamps) -> generate per segment -> measure durations with ffprobe -> compare to slots -> adjust -> mux.

## 5. Silent video architecture
index.html (Hyperframes composition) -> H library -> `explainer(ctx,W,H_,t)` split into scene modules (S1..S6) with a shared camera/transition layer
-> adapter -> `hyperframes render` -> silent MP4 (H.264, 1280x720, 30 fps, 3300 frames). All art drawn in SVG/Canvas via H; seeded rng only.

## 6. Storyboard plan
One self-contained `storyboard.html`; each of 24 panels is a `<canvas>` drawn at runtime with the same H functions and finishing passes
as the film (so it needs no images), plus timestamps, exact narration, camera, transition, accuracy notes, source register, classification
(public reference / conceptual / original), architecture, asset inventory and QC checklist. Fonts embedded or fallback stack. Stop for approval afterwards.

## 7. Technical / factual risks
1. Missing reference animation source (blocker for style fidelity).
2. Truncated sound kit (not needed now).
3. Fact sources not yet gathered: no DRDO/MoD/PIB lookup done yet. The "December 2025 UET completion" claim is from your brief, not yet verified by me.
4. Narration says "United States and France"; SAMP/T is a Franco-Italian (Eurosam) system and the brief names the European SAMP/T — suggest the caption read "SAMP/T (France–Italy)" or the line stay generic. Needs your call.
5. Frame 5.4 "real public references": no raster imagery allowed, so this will be an illustrative drawing, labelled conceptual.
6. Frame 4.3 sectional view must remain generic/conceptual (no undocumented internals).
7. `C:\Users\user\.ai\prompts\global-system-prompt.md` exists (referenced by your CLAUDE.md); I have not read it yet and will before writing code.

## 8. Deliverables
DISCOVERY_REPORT.md (this), lib/harness.js (your H library verbatim), narration/narration.json, src/ scene modules + adapter,
storyboard.html, sources/SOURCE_REGISTER.md, index.html (composition), package.json (after approval), renders/akash-ng-silent.mp4, QC checklist.

## 9. Execution order
0 You supply the full reference source -> 1 I read global standards, save H library unchanged -> 2 verify facts, build source register ->
3 build narration.json -> 4 build storyboard.html -> STOP for approval -> 5 install Hyperframes (with OK) + adapter smoke test (a few frames) ->
6 build scenes -> 7 determinism test (same t twice => identical pixels) -> 8 render 110 s silent MP4 -> 9 QC.

## 10. Confirmation
I understand: no image-generation API, no ComfyUI, no stock/raster imagery, no voiceover generation, no ElevenLabs generation calls and
no audio mix at this stage. The film stays silent; narration is only prepared as structured data.
