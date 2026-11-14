# ROUND 2 (current): paste this instead of the prompt below

```
You are the implementer on the Bharat Blueprint workspace. Claude (designer/reviewer) rejected all six films from your first run after measuring every frame and viewing every beat. Open and follow, completely and in order:

S02_DENIED-India-Built-It-Anyway/00_SERIES/REDO_RUN.md

Read first, as it says: REVIEW_R1_S02.md, REDO_SPEC_R2.md, REVIEWER_NOTES.md. The R gates in REDO_SPEC_R2 are binding, and your own yes/no self-review no longer counts as evidence: run 00_SERIES/tools/parity_check.py on every render and fix until it passes. Rebuild E01 first, to the Series 1 look, then STOP and wait for Claude's review as REDO_RUN step 4 says. After Claude approves, rebuild E03, E02, E06, E05, E04 without stopping and tell me once at the end. Do not touch Series 1 (you may copy its engine source as REDO_SPEC_R2 section A allows), do not use ElevenLabs, do not post anything, do not change system settings, do not edit scripts, ledgers, briefs or approval files.
```

# (Round 1, superseded) OpenCode prompt for Series 2 (one prompt for the whole run)

Paste this into OpenCode, opened at the workspace root `BHARAT-BLUEPRINT/`:

```
You are the implementer on the Bharat Blueprint workspace. Claude is the designer and reviewer; you do not redesign. Open and follow, completely and in order, this file:

S02_DENIED-India-Built-It-Anyway/00_SERIES/MASTER_RUN.md

It tells you what to read, what you are authorised to do (renders for Series 2 on this laptop's GPU are authorised for this run), the order of work, the per-episode build/render/check loop with its caps, where to put files, what the quality bar is, and when to stop. Work without asking me questions; log assumptions in docs/design/QUESTIONS.md; update S02_DENIED-India-Built-It-Anyway/STATUS.md after every step. Tell me only once, at the end, with: "S02 RUN COMPLETE: see S02_DENIED-India-Built-It-Anyway/DONE_S02.md" (or BLOCKED.md if you hit a hard blocker). Do not touch Series 1, do not use ElevenLabs, do not post anything, do not change system settings, do not edit scripts, ledgers, briefs or approval files.
```

Before pasting (user checklist):
1. Laptop plugged in; Windows sleep set to "Never" while plugged in (a system setting, so only you can do it); close other heavy apps; keep at least 15 GB free on C:.
2. Optional: Settings > System > Display > Graphics > add `chrome-headless-shell.exe` (inside the project's puppeteer/hyperframes cache) and set High performance, so Chrome uses the RTX 3050 instead of the Intel graphics.
3. Optional: record your voice first and put it in each episode's `audio/voice/` (`P01.wav`... or `full.wav`). The run then renders each film once with real timing and captions. Without it, the run renders with estimated timing and you need a second, shorter pass later (`finalize-with-voice`).
4. Optional safety switch: create an empty file `S02_DENIED-India-Built-It-Anyway/PAUSE_AFTER_E01.flag` if you want the run to stop after the first episode for Claude to look.
