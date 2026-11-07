# S02 audit report (Claude, reviewer), 2026-11-07

Input audited: `00_SERIES/source/ORIGINAL_Master_Scripts_and_Production_Bible.docx` (ChatGPT output, six episodes, no ledger tables, no SEO package, no beat plan).
Method: every dated or numbered claim was checked against the cited primary page (PIB, ISRO, C-DAC) opened on 2026-11-07, plus searches for the claims that cite no page. Narration was measured (words, sentence length, repeated openers) and read aloud-style for rhythm. Nothing was verified from memory.

## 1. How legit are the facts? Mostly sound, with 5 gaps

| Ep | Verdict | Verified against a primary page | Weak or unverified |
|---|---|---|---|
| 1 Cryogenic | Sound | ISRO 7 Jul 2026: CE20 is indigenous, powers LVM3 upper stage, 19 to 22 t thrust range, performed in 8 successive LVM3 missions incl. Chandrayaan-2 and -3, human-rated for Gaganyaan; flight acceptance hot test 6 Jul 2026 at 22 t | The "denial" itself is only gestured at ("restrictions in the early nineties"). It IS documented: a 1991 ISRO-Glavkosmos contract and 11 May 1992 US sanctions on ISRO and Glavkosmos citing MTCR (Nonproliferation Review chronology, secondary). "Indigenous cryogenic development became part of GSLV" has no source. |
| 2 PARAM | Sound | C-DAC's own page: C-DAC set up March 1988, in a technology-denial regime that denied supercomputers, Cray in particular, on the Science Advisory Council to the PM's recommendation | "Not every component became Indian" is a fair limit but has no source. Wikipedia-style sources give Nov 1987 for the founding; the script correctly follows C-DAC's own "1988". Do NOT use the Rajiv Gandhi anecdote or "3 years, budget smaller than the Cray" (social-media sources). |
| 3 NavIC | Sound | PIB 29 Jul 2026: three satellites in the constellation, at least four needed for basic positioning, no standalone positioning, timing functional. ISRO/PIB: NVS-03 launched 30 Oct 2026 on GSLV-F18, first orbit manoeuvre 31 Oct, final slot 111.75 E. ISRO: coverage to 1,500 km beyond the boundary, L1/L5/S signals | The line "ISRO explains the concern plainly: civilian signals ... can be degraded or denied" could not be confirmed from ISRO's FAQ (answer text is collapsed). A Reuters explainer says "India says" this. Reattribute or confirm. Status after launch is date-sensitive (orbit raising was still under way on 31 Oct). |
| 4 Nuclear | Sound | PIB 7 Apr 2026: 500 MWe PFBR first criticality on 6 Apr 2026; PIB (Jul 2026, DAE): designed by IGCAR, entry into stage 2, stage 1 = PHWR expertise | "The programme emerged in a world where technology was shaped by restrictions" is unsourced and sensitive. "Kalpakkam" is not in the text I opened. The two PIB pages give the criticality time as 08:25 pm and 08:20 pm, so never speak or show a time. |
| 5 Chips | Sound | PIB 1 Apr 2026 (MeitY): Semicon India since Jan 2022; 10 approved projects, about 1.6 lakh crore commitments; commercial production from two plants (Micron, Kaynes), two more due in 2026 | The September 2026 strategy note (NoteId 160020) was not opened, so the numbers may have moved. The script never says which plants are wafer fabs and which are assembly/test; the visuals must not imply a leading-edge fab is running. |
| 6 Tunnel | Sound, honest | PIB Railways 18 Jul 2026: second TBM started at Sawli (Ghansoli); 7 km of a 10 km stretch is under Thane Creek, "India's first undersea tunnel for any rail corridor"; 16 of 21 km by TBM. PIB 2281288: Mixshield slurry TBM, pressurised bentonite slurry, 4 rpm cutter wheel, 77,000 segments / 7,700 rings, about 100 t per ring | "India has used these machines for metro systems" has no source. The spoken "we do not have verified evidence ..." line is a producer note, not narration (see below). |

Overall: no invented quotes, no named villains, milestones are kept apart (launch is not service, criticality is not commercial power). That is better than most scripts of this kind. It is a DRAFT, not publication-cleared: the claim ledgers are mine, built from this audit, and several rows stay TO VERIFY (see each `sources/LEDGER.md`).

## 2. Series premise problem (needs your decision)
"DENIED: India Built It Anyway" is documented for **E01** (sanctions, 1992) and **E02** (C-DAC's own statement). **E04** is partial (restrictions are mentioned but unsourced). **E03, E05, E06 are dependence stories**, and the document says so itself. A viewer who clicks a "DENIED" series and gets "we do not have evidence anyone denied this" will feel baited, and the script's own guardrail ("do not invent a denial") correctly forbids the fix. Options:
1. **Rename the series "India Built It Anyway"** and use "DENIED" only in the titles of E01 and E02. (Recommended: keeps the proven search term where it is true.)
2. Keep the name and reorder so the two true denial stories open and close the series.
3. Keep as is (not recommended).
Also: you said five episodes; the document has **six**. Default plan: build all six in order E01 to E06, with E06 last and optional.

## 3. Narration quality (my read, not an outside test)
Measured: 507 to 524 words each (target met); sentences average 9.5 to 11.5 words (good for speech); 6 sentences over 22 words in total; "Imagine" 10 times across six episodes (E02 uses it 3 times).
Good: concrete hooks in E03, E05, E06; honest "still missing" sections; the best lines ("A closed door is not a finished story", "To know where you are, control the clock", "The greatest achievement is what never moves") are earned.
Not yet "banger" level:
- **Repeated cadence**: "It is not X. It is Y" and "The honest part matters / That is the real challenge / the real magic" appear in most episodes. Spoken aloud five times in a row it sounds templated.
- **Analogy chains**: E02, E04, E05 each stack three analogies with the same opener ("Imagine ... / Think of ... / Picture ..."). Fine on the page, flat when voiced.
- **E04 hook is abstract** ("Imagine building a power station with a problem that stretches ..."). E02 hook is weaker than E03/E05/E06.
- **E06 breaks the fourth wall**: "This episode needs an honest distinction. We do not have verified evidence ..." is a note to the production team spoken to the audience. Replace with a clean line.
- **No on-screen sourced number** in any episode, which the channel format requires. Candidates are in each ledger.
See `SCRIPT_REVISION_PROPOSALS.md` for exact line fixes. Nothing has been edited in `script.md`; the scripts stay as received until you approve.

## 4. "Code quality" of the production bible
Part I of the document is a wish-list ("genuinely high quality", "premium finish") with almost no testable criteria. A coding agent cannot pass or fail "premium". I converted it into measurable gates in `QC_BAR_S02.md` and a build spec in `docs/design/08_S02_VISUAL_ENGINE_SPEC.md`. Its 9:16 note is also unrealistic: a centre crop of 16:9 keeps only about 32% of the width, so Shorts need their own layout, not "safe framing" of the 16:9 master.

## 5. Visual upgrade: findings
- HyperFrames (v0.9.9 here) renders deterministic frame-seeked HTML and officially supports GSAP, Three.js, Lottie, CSS/WAAPI and WebGL shaders. So 3D heroes and 2D characters are possible in the same pipeline. Source: HeyGen docs and independent write-ups (2026).
- The S01 engine is custom 2D (SVG/canvas, about 110 KB of code in Ep4). It has no 3D and no characters. That is new code, not a tweak.
- Headless Chrome renders WebGL in software on machines without a GPU path; S01 2D films took 11 to 17 minutes at 720p. A 3D-heavy 5-minute film may take several times longer. This is unmeasured; ticket S2-T0 is a spike to measure it before anything else is committed.
- Your pace request ("a bit fast") means roughly 60 to 80 beats per film (12 to 20 per minute) against 30 to 37 in S01. That is about double the animation work per episode.
- Quality ceiling: procedural 3D (lathes, tubes, extrusions, instancing) gives clean engineering-schematic models, not photoreal ones. That fits the blueprint brand and the "no invented internals" rule. Do not expect movie VFX.

## 6. What changed in the plan because of this audit
1. S02 gets its own visual kit ("kit-v2": 3D heroes, line-figure characters, effects, denser beats) instead of reusing the S01 2D engine unchanged.
2. Voice is your own recording. Visuals are authored against passage weights and re-timed from your audio; no ElevenLabs spend in S02.
3. QC is frame-level and automated (every frame of the MP4, plus scene-graph checks), with my review of contact sheets. OpenCode cannot declare an episode "ready" without a passing report.
4. Old tickets T1 to T11 (migrating S01 into manifests) are no longer a prerequisite. Only T0 (git safety net) is. S02 runs on its own track: `docs/design/09_S02_TICKETS.md`.

## 7. Decisions needed from you
1. Series name (section 2): rename to "India Built It Anyway"? (recommended)
2. Approve, edit or reject each proposed script fix in `SCRIPT_REVISION_PROPOSALS.md`. Nothing is built until each episode has `APPROVED.txt`.
3. Six episodes or five (drop E06)?
4. Approve the spike render (S2-T0, a 10-second test). It is a render, so it needs your go.
5. Resolution: aim for 1920x1080 if the spike shows it is affordable, otherwise 1280x720. OK?
