# OpenCode prompts for Series 3 (paste into OpenCode opened at the workspace root BHARAT-BLUEPRINT/)

Do not use these until the scripts you want built have an `APPROVED.txt`. Prompt 1 is safe to use anytime (it renders nothing).

## Prompt 1: understanding check (no code, no render)
```
You are the implementer on the Bharat Blueprint workspace. Claude designs and reviews; you do not redesign. Read, in this order:
1. AGENTS.md and docs/design/RESUME_HERE.md
2. S03_India-Megaprojects/00_SERIES/SERIES_PLAN_S03.md and AUDIT_S03.md
3. S03_India-Megaprojects/E01_Chenab-Bridge/ : script.md, EPISODE_BRIEF.md, sources/LEDGER.md
4. The Series 2 build rules that S03 reuses unchanged: S02_DENIED-India-Built-It-Anyway/00_SERIES/MASTER_RUN.md, REDO_SPEC_R2.md, REDO_RUN.md, QC_BAR_S02.md, REVIEWER_NOTES.md, and S02 FINAL/README_FINAL.md (the voice and retime pipeline).
Then write S03_India-Megaprojects/00_SERIES/S3_UNDERSTANDING_CHECK.md: (a) how S03 differs from S02 (no denial angle, new subjects, same kit-v2 and gates), (b) which kit-v2 worlds, heroes and figures each of the six briefs needs, which exist and which are missing (list the missing ones as proposals, do not build them), (c) a build and render plan with time estimates per film, (d) every question or risk, including any claim in a script that conflicts with its ledger. Write no other file, do not render, do not call any voice API, do not edit scripts, ledgers or briefs. Stop.
```

## Prompt 2: the run (use only after you approve scripts and say "go")
```
You are the implementer on the Bharat Blueprint workspace. Open and follow, completely and in order, S02_DENIED-India-Built-It-Anyway/00_SERIES/REDO_RUN.md, applied to Series 3: S03_India-Megaprojects, episodes in this order: E01_Chenab-Bridge first, then STOP and wait for Claude's review (WAITING_FOR_CLAUDE.md; Claude writes R_APPROVED.txt or R_FIXES.md). After approval build E04_Pamban-Bridge, E02_Atal-Tunnel, E03_Atal-Setu, E06_Freight-Corridor, E05_Vizhinjam-Port. Build only episodes that have an APPROVED.txt. The R gates in S02 REDO_SPEC_R2.md and 00_SERIES/tools/parity_check.py are binding; your own yes/no self-review is not evidence. Narration: reproduce the S02 voice pipeline (Deepgram Aura-2 Jupiter, slowed 0.85x, 0.45 s pad, retime the visuals to the measured audio); read DEEPGRAM_API_KEY from the environment or ~/.ai/secrets/secrets.env, never print or store it, one take per passage, show me the character count before the first call and stop if it exceeds the cap in S03 STATUS.md. Do not touch Series 1 or 2, do not use ElevenLabs, do not post anything, do not change system settings, do not edit scripts, ledgers, briefs or approval files. Keep S03_India-Megaprojects/STATUS.md current; tell me once at the end with DONE_S03.md (or BLOCKED.md).
```
Notes for you: the S03 render authority is the same standing authorization you gave for S02 only if you say so; this prompt asks OpenCode to render for S03, so using it is your go. Check Windows sleep and free disk as in S02's MASTER_RUN checklist first.
