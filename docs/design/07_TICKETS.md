# 07 Tickets (work in order; one at a time; stop after each for review)

Each ticket: scope, what the spec already decides, acceptance tests (commands and expected result), and when to stop and ask. Finish by writing `REVIEW_REQUEST.md` in the ticket's folder (`docs/design/reviews/T<n>/`): files changed, how to run, captured output verbatim, risks, what you did not do. Questions go to `QUESTIONS.md`.

## T0: safety net (no behaviour change)
- `git init -b main` at the workspace root, `core.autocrlf false`. Extend `.gitignore` so only code, docs and small data are tracked: exclude `**/FINAL/**`, `**/audio/**`, `**/renders/**`, `**/narration/raw/**`, generated PNGs (measured: this leaves 226 text/code files, about 1.8 MB; the itemised list left 322 MB). Set `core.autocrlf false` in the repository config, not globally. Keep `voice-plan.json`, `passages.json`, `measured.js`, all scripts and docs tracked.
- First commit; verify with `git count-objects -vH` (under about 50 MB), a scan for tracked `*.mp4 *.wav *.mp3 *.png`, and a secret scan.
- `docs/INVENTORY.md`: per file hash table across Ep2 to Ep5, exact differing lines for near-identical files, Ep1 divergence, and the defects listed in 01 section 6 with file and line.
- Re-run the four engine tests; paste output.
- **Accept:** repo size small; no media tracked; INVENTORY lists all 8 defects; four tests print `all passing`; no episode file changed (`git diff` after first commit is empty and file hashes of all `S01_*/E0*/` files equal their pre-ticket values).
- **Ask if:** a file you would exclude looks like the only copy of source text.

## T1: shared kit, no behaviour change
- Create `_shared/kit/engine/` containing the engine files. For each file choose the version identical across Ep3 to Ep5 (`motion.js`, `vehicles.js`), Ep2 to Ep5 (`blueprint.js`, `objects.js`), Ep4/Ep5 (`kit.js`). Record in `docs/KIT_VERSIONS.md` which episodes match each kit file byte-for-byte and where Ep2/Ep3 differ.
- Workspace `package.json` with `"bbWorkspace": true` and npm workspaces; one real `node_modules` at the root; do **not** touch the existing junctions yet.
- **Accept:** hash of each kit file equals the hash of its source episode file; documented diffs for the rest; nothing in `S01_*` changed.

## T2: equivalence harness and migrated Ep4
- `_shared/kit/core/timing-core.js` and `film-core.js`: the generic logic extracted from Ep4's `timing.js` and `film.js` (no behaviour change; the logic is in 01 section 3).
- `_shared/schemas/*.json` for the specs in 03. A one-off converter reads Ep4's `timing.js` and `film.js` and writes `episode.json`, `script.json`, `beats.json` (review them by eye against the originals).
- Create a **copy** at `_shared/kit-wip/migrated/E04/` (never edit the original) with generated `index.html`, `timing.js`, `film.js` and the original `ep4.js` renamed `panels.js`.
- `bb`-style script `equiv.mjs`: loads old and new in headless Chrome and compares (a) `TIMING.clips` id, start, dur, (b) `BEATS` id, t0, t1, tr, d, frac and evaluated keys, (c) `DURATION`, (d) a screenshot at every beat's mid-hold and end-of-hold (about 66 frames) pixel by pixel.
- **Accept:** (a) to (c) exactly equal; (d) all frames identical (same Chrome, same fonts). Any difference is a FAIL; report which beat and which pixels. Ep4 `index.html` title bug is fixed in the migrated copy only.
- **Ask if:** frames differ and the cause is not obvious in under an hour.

## T3: `bb gen`, `bb check`, `bb test`
- Implement per 04 and gates G1 to G7b from 05. `bb gen` output equals T2's generated files byte-for-byte; running it twice changes nothing.
- **Accept:** on migrated Ep4: gen is idempotent; check passes G1 to G5 and G7b; G6 passes (all roles present); G7 FAILS with "no ledger" (correct, Ep4 has none) and explains how; unit tests exist for each gate with a deliberately broken fixture that must FAIL (missing cannot-yet role, unstamped what-if, wrong clip prefix, wrong data-duration, duplicate prefix, non-UTF-8 file).

## T4: audio by clip role
- Port `make-audio.mjs` into `_shared/kit/sfx/` as `bb audio`. Cues are chosen by role (`stamp-fiction` gets the thump, `title` gets the chord) not by clip id. Chrome path via the resolution order in 02. Everything else unchanged (seeds, filters, ducking, -16 LUFS).
- **Accept:** `bb audio` on migrated Ep4 in dry-run lists the same events (file, at, vol) as the original `make-audio.mjs` for Ep4 within 1 ms; on `--run` into a temp folder, the mix has identical duration and integrated loudness within 0.2 LU of the existing `mix.wav`.

## T5: render, mux, media gates (no real render)
- `bb render` and `bb mux` per 04 (dry-run prints the exact commands and estimate); `bb qc` for G8 to G11 per 05.
- **Calibration run (read-only):** run `bb qc` against the five existing finals and put the measured table in the review. Do not render.
- **Accept:** table covers all five finals and all gates; G8d flags Ep2 as expected or the report explains why not; G9b passes for all; a synthetic test file (black frames, long silence, wrong loudness) FAILS the right gates.

## T6: voice with a spending cap
- `bb voice --estimate` and `--run --max-credits N` per 04 (client via `ELEVENLABS_API_KEY`; no key in files). Hash cache; never regenerate a passage that has a raw take; no retries; every call logged with credits.
- **Accept:** against Ep4's real `voice-plan.json`, `--estimate` reports all passages as already generated and zero credits to spend; with a mocked HTTP client (no network, no key) `--run` on a fixture episode stops at the cap and writes a correct ledger; running `--run` without `--max-credits` exits 3. **Do not make a real API call in this ticket.**

## T7: packaging
- Implement 06: generalised thumbnail builder (reads `packaging.json`), `bb package` outputs, gates. Port the posted S01 look exactly (compare to `upload/thumbnails_v2/` for Ep2 to Ep5: same layout; pixel match not required, visual match is).
- **Accept:** reproduce Ep2 to Ep5 packaging from four `packaging.json` files written from the existing `UPLOAD_READY_E02-E05.md`; the description generator's figures all trace to the script text; a fixture with a made-up number in the title FAILS; a headline of 6 words FAILS; `hookCheck` missing FAILS.

## T8: `bb new` scaffold and a dry S02 skeleton
- Template episode with placeholder script and beats satisfying the spine; `bb new S02 "Title"` registers the next prefix. Produce `S02_*/E01_*` skeleton and run `bb check`: it must FAIL only on the missing authored content (ledger, real script text, panels) and nothing else.
- **Accept:** scaffold passes G1, G2, G3, G6 on its placeholder data; fails G7 and G5 (no panels) for the right reasons; no file copied from another episode.

## T9: reusable panel types (design review first)
- Not to be started until the reviewer issues a design addendum for the panel-type library after T2 to T5 are approved. Purpose: express the recurring grammar (headline card, analogy card, labelled diagram with leaders, before/after bars on one scale, timeline with dimension chain, checklist close with callback, FICTIONAL SCENARIO stamp scene, CANNOT YET slide, series recap strip) as data so most panels need no hand-drawn code.

## T10: migrate Ep2 to Ep5 (one per ticket, user approval each)
- Only after T2 equivalence has passed for Ep4. Each migration is a copy first, equivalence proven, then the user decides whether the original folder is replaced. Ep1 is never migrated.

## T11: vertical cuts for Shorts and Reels (later)
- 1080x1920 layout from existing clips and voice, safe zone top 14%, bottom 35%, sides 6%; hook card at frame 1; burned-in word-timed captions. Needs a design addendum.

## Standing definition of done
Runs from a clean checkout on Windows with the documented commands; dry-run default; tests with deliberately broken fixtures; existing episodes unchanged (hash check); no secrets; no hard-coded user paths; docs updated; `REVIEW_REQUEST.md` written; stop.
