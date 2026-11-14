# RESUME HERE (written 2026-11-06 at the end of a session)

**If you are Claude in a new session:** you are the **designer and reviewer** of the Bharat Blueprint production line. You do not write production code. OpenCode (the user's other AI) writes code from your specs; HyperFrames renders; you review. Read this file, then `docs/design/README.md`, then `00_CHANNEL/STORY_BIBLE.md`, then ask the user what they want next.

## Where things stand
- Channel **Bharat Blueprint** is live on YouTube (`@BharatBlueprint-info`) with all five S01 films posted (Ep2 to Ep5 with SEO titles and the v2 thumbnails; Ep1 was posted by the user with its own title and thumbnail).
- Finals: `S01_The-Machines-That-Protect-India/FINAL/`. Packaging: `S01_*/upload/` (thumbnails_v2 for Ep2 to Ep5, `UPLOAD_READY_E02-E05.md`).
- Design set written: `docs/design/` (01 understanding, 02 architecture, 03 manifest, 04 CLI, 05 gates, 06 packaging, 07 tickets, CHANGELOG, QUESTIONS).
- OpenCode has been told to read the design set and write `docs/design/UNDERSTANDING_CHECK.md` (no code). **Next: read that file, answer its questions by fixing the specs (log in CHANGELOG.md), then tell the user to say "go" for ticket T0.**
- No further renders, voice generation or deletion have been approved.

## Update 2026-11-14: S02 voiced finals confirmed; S03 drafted
S02: six `*_JUPITER-VOICE.mp4` finals exist in `S02_*/FINAL/` (1080p30, about -16.5 LUFS, 3:40 to 4:19), not checked by ear; E04 motion just under its bar; E03 NVS-03 status is date-sensitive. S03 ("India Megaprojects", six films: Chenab bridge, Atal Tunnel, Atal Setu, Pamban bridge, Vizhinjam port, freight corridors): scripts, briefs, passages and ledgers written by Claude, NOT approved and NOT audited by anyone else. Start at `S03_India-Megaprojects/00_SERIES/SERIES_PLAN_S03.md` and `AUDIT_S03.md`; OpenCode prompts in `OPENCODE_PROMPT_S03.md`.

## Update 2026-11-08: S02 run 1 REJECTED, round 2 specified
All six films from the first unattended run fail review (sparse, repeated or cropped heroes, broken figures, dim slow text, 36 to 56% near-empty frames against 6 to 7% in Series 1). Read `S02_*/00_SERIES/REVIEW_R1_S02.md`, then `REDO_SPEC_R2.md` and `REDO_RUN.md`. Round 2 prompt is at the top of `00_SERIES/OPENCODE_PROMPT_S02.md`. OpenCode rebuilds E01 and stops (`WAITING_FOR_CLAUDE.md`); Claude reviews (sheets, `parity_check.py`, frames) and writes either `E01_Cryogenic-Engine/R2_APPROVED.txt` or `R2_FIXES.md`; after approval OpenCode rebuilds E03, E02, E06, E05, E04 and notifies once (`DONE_S02_R2.md`).

## Update 2026-11-07 (late): S02 is READY TO RUN (superseded by the entry above)
Series name: "India Built It Anyway". All six scripts final and approved; the user authorised one unattended OpenCode run (renders on the RTX 3050, loop until QC passes, notify once). Prompt: `S02_*/00_SERIES/OPENCODE_PROMPT_S02.md`; instructions: `00_SERIES/MASTER_RUN.md`; progress: `S02_*/STATUS.md`; end marker: `DONE_S02.md` or `BLOCKED.md`. Claude's job after the run: final check of QC reports, contact sheets and frames, then tell the user. The older paragraph below describes the earlier state (before approval).

## Update 2026-11-07 (Series 2)
- Six S02 scripts received (ChatGPT) and filed under `S02_DENIED-India-Built-It-Anyway/` with ledgers, briefs and passages. Audit: `00_SERIES/AUDIT_REPORT.md`. Proposed script fixes (not applied): `00_SERIES/SCRIPT_REVISION_PROPOSALS.md`. No episode has `APPROVED.txt`.
- New visual track: `docs/design/08_S02_VISUAL_ENGINE_SPEC.md`, `09_S02_TICKETS.md`, `00_SERIES/VISUAL_DIRECTION_S02.md`, `QC_BAR_S02.md`. Voice is the user's own recording; no ElevenLabs in S02.
- OpenCode's next step is Prompt 1 in `00_SERIES/OPENCODE_PROMPT_S02.md` (understanding check, no code), then Claude reviews it. Then T0, then S2-T0 (spike render, needs the user's "go").
- Decisions waiting on the user: series name, approval of each script fix, six vs five episodes, spike go, 1080p vs 720p after the spike.
- The Step 0 questions Q1 to Q16 were ruled earlier (see CHANGELOG); Q11 to Q14 only matter if S01 is migrated.

## The working loop (the user's chosen division of labour)
1. **Claude designs:** next series ideas, scripts, scene-by-scene beat design, fact ledger, packaging, specs, and for each coding job a **copy-paste prompt for OpenCode**.
2. **OpenCode codes** against the specs; writes `REVIEW_REQUEST.md`; stops.
3. **Machines run:** `bb` commands, HyperFrames render (`npx hyperframes render`, 11 to 17 min per film), QC gates.
4. **Claude reviews:** reads the diff and the QC report, looks at contact sheets and at frames at fixed timestamps (frame-by-frame spot checks at beat mid-hold and end-of-hold, not every frame), and approves or sends back precise fixes.
5. **User** approves scripts and facts, listens to the voice, clicks upload.
Claude reviews, it does not fix code in bulk. Keep reads small: look at diffs and reports, not whole files; view images only at the sizes needed.

## Rules that stay
No render, ElevenLabs call, deletion or posting without the user's go-ahead. ElevenLabs credits are low. VidIQ credits are nearly out (resets about 2026-12-02). Sources first (PIB), tag claims VERIFIED / SECONDARY / TO VERIFY, no rankings, no named hostile countries, concept level only, fiction stamped FICTIONAL SCENARIO.

## Good things to say to start the next session
- "Resume the Bharat Blueprint project: read docs/design/RESUME_HERE.md."
- "Review OpenCode's UNDERSTANDING_CHECK.md." or "Review OpenCode's REVIEW_REQUEST for ticket T<n>."
- "Design Series 2 (DENIED: India Built It Anyway) episode 1: script, beats, ledger, then the OpenCode prompt."
- "Do a frame-by-frame check of <episode> render."
