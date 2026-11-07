# S02: India Built It Anyway (series name decided 2026-11-07; the folder keeps its stable id `S02_DENIED-...`)

Status 2026-11-07: six final scripts, ledgers, visual briefs, camera zones, QC bar, engine spec, skills and the autonomous run file are written. All six episodes carry `APPROVED.txt`. Nothing is built or rendered yet. Narration is the user's own voice (no ElevenLabs in S02).

## To start the build
Open OpenCode at the workspace root and paste the prompt in `00_SERIES/OPENCODE_PROMPT_S02.md`. It reads `00_SERIES/MASTER_RUN.md`, builds, renders on the laptop GPU, checks every frame, loops on failures, and notifies once at the end (`DONE_S02.md`). Progress is in `STATUS.md`.

## Read order for any agent
1. `../AGENTS.md`, `../docs/design/RESUME_HERE.md`
2. `00_SERIES/AUDIT_REPORT.md`, `FINALIZATION_LOG.md`
3. `00_SERIES/VISUAL_DIRECTION_S02.md`, `CAMERA_AND_ZONES_S02.md`, `QC_BAR_S02.md`, `CONTENT_STRATEGY_S02.md`
4. `../docs/design/08_S02_VISUAL_ENGINE_SPEC.md`, `09_S02_TICKETS.md`, `10_S02_SKILLS.md`
5. `00_SERIES/MASTER_RUN.md`
6. The episode folder: `EPISODE_BRIEF.md`, `script.md`, `passages.md`, `sources/LEDGER.md`

## Episodes (final scripts; durations estimated at 1.8 words per second until the voice exists)
| Folder | Title (working) | Words | Passages | Est. length | Build order |
|---|---|---|---|---|---|
| E01_Cryogenic-Engine | The Rocket Engine They Wouldn't Transfer | 567 | 10 | 5:15 | 1 (pilot) |
| E02_PARAM-Supercomputer | The Supercomputer India Couldn't Buy | 510 | 9 | 4:43 | 3 |
| E03_NavIC-Signal | Who Controls the Signal That Finds You? | 524 | 10 | 4:51 | 2 (time-sensitive) |
| E04_Three-Stage-Nuclear | The Reactor Built for the Next Generation | 509 | 11 | 4:43 | 6 |
| E05_Semiconductors | India Wants to Build the Chips Inside Everything | 527 | 11 | 4:53 | 5 |
| E06_Tunnel-Boring | The Machine That Digs Without Bringing a City Down | 498 | 11 | 4:37 | 4 |

Each episode folder holds: `script.md` (final), `script_ORIGINAL.md` (ChatGPT draft), `passages.md` (recording units; authoritative for timing), `EPISODE_BRIEF.md` (beat skeleton; numbering is indicative), `sources/LEDGER.md`, `APPROVED.txt`; the build adds `src/`, `data/`, `timing/`, `qc/`, `renders/`, `REVIEW_REQUEST.md`.
`00_SERIES/source/` keeps the original ChatGPT document. `CHATGPT_RESEARCH_PROMPT.md` is the prompt that produced it.
