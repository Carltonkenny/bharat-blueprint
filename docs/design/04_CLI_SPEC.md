# 04 CLI spec: `bb`

Node 22 ESM, no global install: `npm run bb -- <command>` from the workspace root, or `node _shared/cli/bb.mjs <command>`. Run from any folder: it finds the workspace root, and infers the episode from the current directory or from `--ep S01/E04`.

## Global rules
- Every command prints what it will do first. Anything that renders, calls a paid API, writes outside `qc/`, `packaging/`, `audio/` or `renders/`, or overwrites a file is **dry-run by default**; `--run` (or `--write`) performs it. Exit code `0` = success, `1` = a gate failed, `2` = usage or spec error, `3` = refused (would overwrite protected files or exceed a cap).
- **Protected paths (never written, even with `--run`):** `S*/FINAL/**`, `narration/raw/**` once a file exists, `audio/daniel/**`, `renders/**` files that already exist (a new render writes a new versioned name). Attempting it exits `3`.
- `--json` prints a machine-readable result. Logs go to `<episode>/qc/bb.log`.

## Commands
| Command | Does | Reads | Writes | Default |
|---|---|---|---|---|
| `bb new S02 "Title" --slug Slug` | scaffold an episode from `_shared/templates/episode/` with the next free episode number and clip prefix registered in `series.json`; no copying from another episode | series.json | new folder | dry-run |
| `bb gen` | generate `index.html`, `timing.js`, `film.js`, `narration/measured.js` stub from the three data files | episode.json, script.json, beats.json | generated files with GENERATED header | dry-run (shows diff) |
| `bb check [--publish]` | gates G1 to G7 (spec only: schemas, text, timing math, beats vs panels, theme, ledger). `--publish` also fails on any `TO VERIFY` ledger row | data files, panels.js, ledger | `qc/check.md` | read-only |
| `bb test` | runs the engine tests (today's `test-engine.mjs` assertions, generalised) in headless Chrome | the page | `qc/test.txt` | runs (no render) |
| `bb frames [--beats]` | headless stills: one per beat at mid-hold and end-of-hold, plus a contact sheet | the page | `qc/frames/`, `qc/contact.png` | runs |
| `bb voice --estimate` | character count to credits per passage and total; shows which passages already have raw takes (skipped) | voice-plan.json | nothing | read-only |
| `bb voice --run --max-credits N` | generates only passages with no raw take, one take each, no retry, cap enforced before each call, ledger written | env `ELEVENLABS_API_KEY` | `narration/raw/Pnn.mp3`, `narration/voice-ledger.jsonl` | refuses without `--run` and `--max-credits` |
| `bb split` | cut raw passages into clips on the N-1 longest silences, trim to `audio/trim/`, write `narration/measured.js` | raw takes | audio/trim, measured.js | dry-run |
| `bb audio` | build `audio/mix.wav` (voice + sfx by clip role + bed, ducking, -16 LUFS) | the page timeline, audio/trim | audio/ | dry-run |
| `bb render` | silent render via `npx hyperframes render -q standard -w 2` to a **new versioned name** (`renders/<slug>-vN-silent.mp4`); prints estimate (11 to 17 min) | the page | renders/ | dry-run |
| `bb mux` | join `mix.wav` and the silent render (libx264 crf 23, aac 192k) to `renders/<slug>-vN.mp4` | renders, audio | renders/ | dry-run |
| `bb qc` | gates G8 to G11 on the muxed file and frames | mp4, frames | `qc/report.md` | runs |
| `bb package` | thumbnails, title candidates, description, tags (spec 06) | packaging.json, ledger, script | `packaging/` | dry-run |
| `bb status` | one table: per episode, which stages are done, gate results, paths, last timestamps | everything | nothing | read-only |
| `bb promote` | copy a muxed file that passed `bb qc` into `S0N/FINAL/` with the series naming rule, **only with `--run` and `--confirm-human-approved`** | renders | FINAL | refuses otherwise |

## Output contracts
- `qc/check.md` and `qc/report.md` list each gate as `PASS`, `WARN` or `FAIL` with the measured value and the threshold (spec 05). Overall verdict line first.
- `bb status --json` shape: `{ series, episode, slug, stages: { gen, check, test, voice, split, audio, render, mux, qc, package }, gates: { G1: "PASS", ... } }`.

## Not in the CLI
Posting, logging in, deleting, regenerating existing voice takes, editing scripts or facts.
