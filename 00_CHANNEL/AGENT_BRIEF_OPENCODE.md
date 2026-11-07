# Agent brief for OpenCode (builder). Claude is the designer and reviewer.

> **UPDATE 2026-11-06: roles changed by the user.** Claude designs; OpenCode implements; you do not design or start automating on your own. The authoritative design is the spec set in `docs/design/` (start at `docs/design/README.md`). Do the Step 0 comprehension check there first and stop. The ticket list in `docs/design/07_TICKETS.md` replaces the phase list in section 7 below; where they differ, the tickets win. Sections 1 to 6 and 8 to 10 remain valid background and rules.

You are the code-writing agent on **Bharat Blueprint**. Read this whole file, then `AGENTS.md` (root), `00_CHANNEL/STORY_BIBLE.md`, and `_shared/pipeline/PIPELINE_V2.md`. Then do **Phase 0** and stop for review. Do not start later phases until the reviewer (Claude, working with the user) has approved the previous one.

## 1. What this project is
A YouTube and Instagram channel of calm, sourced explainer films about how India builds big machines. The films are **not filmed and not AI-generated video**. They are drawn in code (HyperFrames: an HTML/JS timeline rendered to MP4, blueprint style, 1280x720, 30 fps), narrated by an unseen synthetic voice (ElevenLabs, Daniel, `eleven_v4`), mixed with code-synthesised sound effects, and muxed with ffmpeg. Five finished films exist (Series S01). Five more series are planned (S02 to S06).

## 2. What "automation" means here
Goal: a new episode can go from **approved script + source ledger** to **finished MP4, thumbnails, titles, Shorts cuts and upload package** with a handful of commands, by any agent, with the same result, while a human keeps control of everything that costs money, is public, or needs judgement.

The automation is a **production line with gates**, not a "make me a video" button. Machine steps: build, measure, mix, render, QC, package. Human gates: script and fact approval, voice listening, final watch, upload click.

Today the line works but is manual and copy-pasted: each episode folder is a copy of the previous one, with its own engine copy, hard-coded timing, hard-coded sound cues and a shared `node_modules` junction. That is where the bugs came from (see Gotchas).

## 3. Layout (Windows, `C:\Users\user\OneDrive\Desktop\films and ads\BHARAT-BLUEPRINT\`)
```
00_CHANNEL/            channel docs: STORY_BIBLE, CHANNEL, CHANNEL_PLAN, REELS_PLAN, this brief
_shared/pipeline/      PIPELINE_V2.md (the process and the planned series-kit refactor)
_archive/              old handoff prompt, MOVE_LOG.md (old path -> new path)
S01_The-Machines-That-Protect-India/
   E01_Akash-NG-Air-Defence/ ... E05_From-Buying-To-Building/   one project per episode
   FINAL/               the five approved MP4s, viewer index.html, voiceover-mp3/
   docs/                series reference, episode briefs, reviews
   upload/              titles, descriptions, thumbnails (build_thumbnails.mjs)
S02_DENIED-India-Built-It-Anyway/ ... S06_Old-Observer-Checks/  empty placeholders (planned series)
```
Episode folder: `src/` (blueprint, objects, motion, vehicles, kit, epN, timing, film), `narration/` (voice-plan.json, raw/ passages, measured.js), `audio/`, `build/` (test-engine, qc-frames, qc-sweep, qc-mid, holds, split-passages, make-audio, storyboard, shoot-frames), `renders/`, `sources/`, `index.html`.
Ep1 is older (different engine and narrator). Ep2 to Ep5 share the v2 engine by copy.

## 4. Hard rules (non-negotiable)
1. **Do not render, regenerate voice, delete or overwrite any existing episode, final, raw take or audio file.** The five films are approved final. New work goes in new folders or new files.
2. **Never spend ElevenLabs credits without explicit user approval of an estimate.** Credits are limited. One take per passage, `generations_count` 1, never auto-retry (a retry bills again). Default every paid or slow command to `--dry-run`.
3. **Never post, publish, send or log in anywhere.** Prepare packages; the user clicks upload.
4. **No secrets in the repo.** API keys via environment variables only; `.env` is git-ignored. Do not paste keys into docs or chat.
5. **No hard-coded absolute paths.** Today the Chrome path `C:/Users/user/.cache/puppeteer/...` is hard-coded in about 31 build scripts; fix by reading `CHROME_PATH` or resolving through puppeteer, with the current path only as a documented fallback.
6. **Content rules from STORY_BIBLE.md apply to anything that generates text**: sources first (PIB), VERIFIED/SECONDARY/TO VERIFY tags, no invented facts, no rankings, no named hostile countries, concept level only, FICTIONAL SCENARIO stamps.
7. Windows machine: use `python` (not `python3`); do not run `du` or recursive scans over `node_modules` (times out); the built-in WebSearch tool failed in earlier sessions, use the Tavily search tool if you need the web.
8. Ask before anything destructive, anything outward-facing, or anything that costs money.

## 5. How the pipeline runs today (per episode, inside its folder)
```
node build/test-engine.mjs            # engine + timing assertions (must print "all passing")
node build/qc-frames.mjs dist/qc      # frame stills for review
node build/holds.mjs                  # how long each beat sits finished
node build/split-passages.mjs         # cut raw ElevenLabs passages into clips on the longest silences
node build/make-audio.mjs             # read film timeline via headless Chrome, synthesise SFX + drone, duck under voice, normalise to -16 LUFS -> audio/mix.wav
npx hyperframes render -q standard -w 2 -o renders/<name>-silent.mp4     # 11 to 17 minutes per film
ffmpeg ... join mix.wav with the silent render (libx264 crf 23, aac 192k)
```
Voice: `narration/voice-plan.json` holds the passages (about 14) and clip IDs (`e*` Ep3, `f*` Ep4, `g*` Ep5). Timing: `src/timing.js` has a clip list and a gap-weight system that rescales gaps to `TARGET` seconds; `narration/measured.js` holds measured clip lengths; `data-duration` in `index.html` must equal TARGET.
QC after muxing: ffmpeg `blackdetect`, `silencedetect`, `ebur128` (target -16 LUFS), plus frame stills mid-beat.

## 6. Gotchas that already bit us
- Episode folders were copied from each other: after copying, the **clip-ID prefix** in `build/split-passages.mjs` (regex `\['(f\d+)'`), the **hard-coded sound cues** in `build/make-audio.mjs` (an `e08` lookup crashed Ep4), `TARGET` in `src/timing.js` and `data-duration` in `index.html` all still pointed at the previous episode.
- `node_modules` for Ep2 to Ep5 is a Windows **junction** to `E01_Akash-NG-Air-Defence\node_modules`. The 2026-11-05 folder move broke the old symlinks; they were recreated as junctions. A real workspace-root install would remove this fragility.
- Sparse frames: some sampled frames look sparse or catch text half-typed; mid-beat stills were not run on the final files.
- Ep2 sound effects were near-inaudible (pen and wipe sounds); `video-sound-design` skill has `soundcheck.py` for sync and loudness.
- The hook scorer penalises length; a rewritten hook can score lower.
- OneDrive syncs everything, including 0.5 to 0.8 GB `*-silent.mp4` files (about 5 GB in total). Do not add more large files to synced folders without telling the user.

## 7. Build plan (phases; stop for review after each)
Work on a git branch per phase (`opencode/phase-N-name`) or, if git is not set up, in a new folder `_shared/kit-wip/phase-N/` that does not touch episodes. Every phase ends with a `REVIEW_REQUEST.md` in that folder: what changed, how to run it, what you tested and the output, risks, what you did not do.

**Phase 0: safety net (no behaviour change).**
- `git init` at the workspace root (the `.gitignore` is already there), first commit of docs and code only; confirm no large media or secrets were added (`git count-objects -vH`, check for `*.mp4`, `.env`).
- In each of E02 to E05 run `node build/test-engine.mjs` and report pass/fail (E04 passed on 2026-11-05 after the move; verify the others). Do not render.
- Write a `docs/INVENTORY.md` listing every duplicated file across episodes (which `src/` files are identical, which differ) using hashes. This is the input to Phase 1.

**Phase 1: shared engine + episode manifest.**
- Create `_shared/kit/` holding the engine files that are identical across Ep2 to Ep5 (`blueprint`, `objects`, `motion`, `vehicles`, `kit`), versioned (`kit/package.json`), and a per-episode `episode.json` manifest: series, episode id, title, TARGET, clip-ID prefix, passages file, sound cues (by clip role, not by hard-coded ID), source ledger path.
- Episodes consume the kit through the manifest. **Prove equivalence**: for E04, build twice (old copy vs kit) and diff the rendered frame stills and `measured` timings at fixed timestamps (no full render needed; use `build/qc-frames.mjs`). Differences must be zero or explained.
- Move the shared `node_modules` to the workspace root with an npm workspace; remove the junctions only after the reviewer approves.

**Phase 2: one CLI.**
- A small Node CLI (`bb`) with subcommands: `new` (scaffold a new episode from a template, never copying another episode's IDs or cues), `check` (manifest validation: clip prefixes, TARGET vs data-duration vs measured sum, cue references resolve), `test`, `qc`, `audio`, `render` (dry-run by default; prints the command and estimated time), `mux`, `package`.
- Idempotent, resumable, prints exactly what it will do; non-zero exit on any failed gate.

**Phase 3: voice step with a spending cap.**
- `bb voice --estimate` (character count to credits, per passage and total) then `bb voice --run --max-credits N`. Reads `ELEVENLABS_API_KEY` from the environment. Caches every take by hash of (text, voice, model, settings); refuses to regenerate a cached passage; no automatic retry; logs every call and its cost to `narration/voice-ledger.jsonl`. The voice plan stays human-approved text.
- (Claude Code can also call the ElevenLabs connector; the CLI is for agents without that connector.)

**Phase 4: QC gates.**
- Automate: black frames, silences over a limit, loudness within 1 LU of -16, clip overlap, final title hold, **density check** (flag near-empty beats), **mid-beat stills** (sample three timestamps per beat, write a contact sheet for human review), SFX audibility (level of each cue vs the voice bed). One `qc-report.md` per episode with PASS/FAIL.

**Phase 5: packaging.**
- Generalise `S01/upload/build_thumbnails.mjs` (reads a SLIDES list, builds 1280x720 PNGs from film frames) and add `bb package`: title candidates from the episode's hook, description template filled from the source ledger, tags, thumbnail PNGs, a `UPLOAD_PACKAGE.md`. Add the posting tracker CSV (columns in `CHANNEL.md`).

**Phase 6: vertical cuts for Shorts and Reels.**
- 1080x1920 layout from existing clips (reuse voice clips, no new credits): hook card at frame 1, scene clip centred in Meta's safe zone (top 14%, bottom 35%, sides 6% free), word-timed burned-in captions, series tag and one call to action. Export the dozen reels listed in `CHANNEL_PLAN.md`.

**Phase 7 (optional): scheduling.** A cron or n8n flow that only prepares and notifies; it never uploads.

## 7b. Reviewer amendments (2026-11-06, after OpenCode's Phase 0 plan). These override section 7 where they differ.
1. **Theme block in the manifest (approved now, build in Phase 1).** `episode.json` must carry the theme, not only the plumbing: the scene spine (ordered scene slots; THE QUESTION, WHY IT MATTERS, IDEA 1/2/3, INDIA, THE FIELD, WHAT IF, THE HABIT, THE CLOSE are required slots, extra scenes such as THE MARUT, SUNK COST, THE LONG BUILD, PLANNING, THE NUMBERS are optional slots), required beats (a CANNOT YET beat, one sourced on-screen number with SOURCE tag, a FICTIONAL SCENARIO stamp, the series callback close), and the source-tag rule. `bb check` fails an episode that lacks a CANNOT YET beat, an unstamped what-if, or a source ledger.
2. **Derive, never hand-type:** the `EPnn ·` HUD label in `film.js`, the `SC.n · NAME` scene labels and `SCENE_NAMES` in `timing.js` come from the manifest. Keep UTF-8 (the `·` is U+00B7); add a test that fails on any non-UTF-8 write.
3. **Inventory location:** `BHARAT-BLUEPRINT/docs/INVENTORY.md` (workspace root; it spans all episodes). Include: files identical across episodes (verified: `blueprint.js`, `objects.js` identical in E02 to E05; `motion.js`, `vehicles.js` identical in E03 to E05; `kit.js` identical in E04 and E05 only), near-identical files with the exact differing lines, E01's divergence, dead code (E03's `src/panels.js` and `src/examples.js` are Ep2 leftovers, not loaded by `index.html`, and `examples.js` redefines `PANELS['1.3']`), and the missing source ledgers (E03, E04, E05 have none).
4. **Clip prefixes:** Ep2 `d*`, Ep3 `e*`, Ep4 `f*`, Ep5 `g*`.
5. **Git scope:** code and docs only. Exclude finals (`S*/FINAL/*.mp4`), all `renders/*.mp4`, `audio/*.wav`, `narration/raw/*.mp3`, generated PNGs. Keep `voice-plan.json`, `passages.json`, `measured.js` and all scripts tracked. `core.autocrlf false`.
6. **Back-ups outside git (user action, flag it in REVIEW_REQUEST.md):** the raw ElevenLabs takes (`narration/raw`, `audio/daniel`, about 73 MB, cost credits to make) and the five finals exist only in OneDrive. Ask the user to copy them to a second place.
7. **Do not edit any episode file in Phase 0.** Dead-code removal and ledger creation are later phases and need the user's approval.

## 8. Definition of done (every phase)
- Runs from a clean checkout on this Windows machine with documented commands.
- A dry-run mode for anything slow or paid; the default is dry-run.
- Tests or a verification script with captured output in `REVIEW_REQUEST.md`.
- Existing episodes untouched; equivalence proven where the kit replaces copies.
- No secrets, no hard-coded user paths (except documented fallbacks), no new large files in synced folders.
- Docs updated: `AGENTS.md` if commands changed, `_shared/pipeline/PIPELINE_V2.md` if the process changed.

## 9. Skills and tools the work used (copy what you need into your own environment)
Skills (live in the user's `C:\Users\user\.claude\skills\`; other agents will not see them unless copied into the repo): `unseen-narration` (script and voice direction), `illusion-of-novelty` (hooks), `ig-reel` (reel scripts, `hookscore.py`), `video-sound-design` (`soundcheck.py`), plus `youtube-full` for channel work.
Connectors used in Claude Code: ElevenLabs (voice), VidIQ (outliers, keywords, trending, title scoring), Tavily (web search).
Local software: Node 22, HyperFrames CLI 0.9.9 (`npx hyperframes`), puppeteer-core with chrome-headless-shell, ffmpeg and ffprobe, Python (`python`).

## 10. Review protocol (so the builder and reviewer do not collide)
1. You finish a phase and write `REVIEW_REQUEST.md`. 2. The user tells Claude it is in. 3. Claude reads the diff against this brief's definition of done and the hard rules, runs the checks, and replies with blocking issues and suggestions. 4. You fix; the user tells Claude again. 5. Only after Claude says "approved" does the next phase start. Claude does not write the production code; it reviews it.
