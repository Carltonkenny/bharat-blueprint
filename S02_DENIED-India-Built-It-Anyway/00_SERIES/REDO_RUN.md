# REDO RUN (round 2): rebuild all six S02 films to the Series 1 bar

You are OpenCode. Claude (designer/reviewer) rejected all six films from the first run. Read, in order: `REVIEW_R1_S02.md`, `REDO_SPEC_R2.md`, `REVIEWER_NOTES.md` (its R1 to R10 are now binding, redefined in REDO_SPEC_R2 section G), then the unchanged specs (`CAMERA_AND_ZONES_S02.md`, `QC_BAR_S02.md`, the briefs, scripts, ledgers). The earlier `MASTER_RUN.md` still governs authorization, hardware and file hygiene (its sections 0, 2, 5, 7), with these changes.

## Authorization changes
- You MAY copy (not modify, not delete) S01 engine source into `_shared/kit-v2/src/s01/` as REDO_SPEC_R2 section A says.
- Move the rejected first-run finals from `S02_*/FINAL/` into `S02_*/FINAL/_rejected_R1/` (move, do not delete) before producing new ones. You may delete only scratch files you created inside RENDER_ROOT.
- Everything else stays forbidden: S01 files, ElevenLabs, posting, system settings, editing scripts, ledgers, briefs, approval files, camera zones, REVIEW/REDO/REVIEWER files.

## Steps
1. Write `S02_*/00_SERIES/R2_PLAN.md` (one page): what you will port, the hero and prop list you will build, how each R gate will be implemented. No questions.
2. Port the look and build the gold clip of E01 (P03 to P05), per REDO_SPEC_R2 section H step 2. Iterate until the gold clip passes `parity_check.py` and all R gates. Compare your stills with S01 stills and write `E01/gold/COMPARISON.md` (what is equal, what is still weaker).
3. Build the full E01. Run every gate (A, B, R1 to R14). Render. Run `parity_check.py` on the final and save `E01/qc/parity.json`. Produce `qc/sheet_mid_*.png` (mid-hold, 15 frames per sheet), `qc/sheet_end_*.png` (end-of-hold) and `qc/weakest.md`. A FAIL on any gate means fix and re-run, not note and continue (cap: 8 full renders for E01).
4. **STOP after E01.** Write `S02_*/WAITING_FOR_CLAUDE.md` with the path of the final, the parity JSON, the gate table and the 8 weakest beats. Print one message: "R2 E01 READY FOR REVIEW: see S02_DENIED-India-Built-It-Anyway/WAITING_FOR_CLAUDE.md". Then wait. Do not start E03.
5. Resume only when `E01_Cryogenic-Engine/R2_APPROVED.txt` exists (written by Claude after review). If instead `E01_Cryogenic-Engine/R2_FIXES.md` appears, apply every item in it and repeat step 3 and 4 (do not touch other episodes).
6. After approval rebuild E03, E02, E06, E05, E04 in that order with the approved kit, each with the full gate set including R12 (`parity_check.py` must PASS) and `qc/weakest.md`. Cap 6 full renders per episode; an episode that still fails is marked BLOCKED with its failing gates, and the run continues.
7. Finish with `S02_*/DONE_S02_R2.md` (table: episode, beats, beats/min, parity metrics, gates failed, render count, final path) and one message: "S02 R2 COMPLETE: see S02_DENIED-India-Built-It-Anyway/DONE_S02_R2.md". Three beeps. Final files go to `S02_*/FINAL/` with the same names as before plus nothing else.

## Hard blockers
As in MASTER_RUN section 7. A failing gate is not a blocker. Do not stop to ask anything except at step 4.
