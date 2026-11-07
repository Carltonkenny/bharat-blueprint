# Questions for the reviewer (OpenCode writes here; the reviewer answers by editing the spec and logging in CHANGELOG.md)

Format: `## Q<n> (ticket) <short title>` then: what you were doing, what is unclear, options you see, which you would pick and why. Leave answered items in place with `ANSWER:` added by the reviewer.

Written 2026-11-06 by OpenCode after the Step 0 comprehension check. Each item states what was measured, so it can be checked without re-running anything. Summary and reasoning: `docs/design/UNDERSTANDING_CHECK.md`.

---

## Q1 (T2, T3) How does the page load `episode.json` / `script.json` / `beats.json`?

**What I was doing.** Spec 02 (section "How a generated episode runs") says `index.html` (generated) loads the three data files "as `window.EPISODE`". I tested whether that is possible.

**What is unclear.** It depends on how the JSON reaches the page, and the spec does not say.

Measured, using this project's own Chrome build (`chrome-headless-shell` 156.0.8078.47):
- `<script src="data.json"></script>` from a `file://` page -> `Uncaught SyntaxError: Unexpected token ':'`. JSON is not a JavaScript program.
- `fetch("data.json")` from the same `file://` page -> `Failed to fetch`. Chrome does not allow file-origin fetch.
- The existing QC scripts load the page via `pathToFileURL`: `build/test-engine.mjs` does `page.goto(pathToFileURL(resolve('index.html')).href)`. That is `file://`.
- HyperFrames' renderer serves the project over a local HTTP server (`serveStaticProjectHtml` in `node_modules/hyperframes/dist/chunk-BYC4C4YY.js`), so `fetch` would work during a render - but not in the QC path, where most gates live.

**Options.**
1. Generate `episode-data.js` containing `window.EPISODE = { ... };` and load it with a normal script tag. Works identically under `file://` and HTTP. The JSON files remain the authored source of truth; the JS file is generated.
2. Generate `index.html` with the JSON inlined as a script block. Same effect, but the data lives inside the HTML.
3. Serve the page over HTTP in every tool, including QC. Most faithful to "loads the JSON files", but adds a server dependency to `bb test` and `bb frames`, and changes how today's QC scripts work.

**Which I would pick and why.** Option 1. It keeps the three JSON files as the single authored source of truth, keeps the generated set to one more file, and works in both loading modes with no server and no change to the existing QC scripts' `file://` habit. Option 3 is the only one that literally matches the wording, but it would make `bb test` depend on a local HTTP server, which adds failure modes to the tool that most gates rely on.

---

## Q2 (T5) G9b's 0.1 s tolerance fails Ep2's approved final. Compare against `target` or widen it?

**What I was doing.** Checking whether the existing five finals would pass G9b, which requires "duration within 0.1 s of `DURATION`".

**What is unclear.** Which value "DURATION" refers to, and whether a 0.1 s tolerance is the right one.

Measured:

| Episode | `TARGET` | computed `DURATION` | `data-duration` | muxed MP4 | computed vs target |
|---|---|---|---|---|---|
| Ep2 | 265 | **265.1667** | 265 | 265.000000 | 0.167 |
| Ep3 | 290 | 290.000 | 290 | 290.000000 | 0.000 |
| Ep4 | 293 | 293.000 | 293 | 293.000000 | 0.000 |
| Ep5 | 314 | 314.000 | 314 | 314.000000 | 0.000 |

Ep2's overrun is not noise: three of its gaps (d35, d36, d37) fall below `MIN_GAP = 0.35`, so the rescale cannot shrink them further and the total lands 0.167 s long. Ep2's own engine test asserts "duration is 4:00-4:45" and passes at 265.17 s.

**Options.**
1. Compare the muxed duration against `target` (the authored number), not the recomputed `DURATION`. Ep2 then passes at exactly 0.000.
2. Keep comparing against computed `DURATION` and widen G9b to 0.5 s, matching G3's tolerance.
3. Keep both at 0.1 s and accept that Ep2 reports a WARN.

**Which I would pick and why.** Option 1, with option 2 as the fallback. The intent of the gate is "the rendered file is the film you asked for", and `target` is what the author asked for; the recomputed `DURATION` is an internal quantity that the gap rescale only approximates when `MIN_GAP` binds. Option 3 would put a permanent unexplained WARN on one of the five approved films.

---

## Q3 (T5) G10's density metric does not flag Ep4's sparse WHAT IF beat, as spec 05 expects.

**What I was doing.** Measuring the ink ratio of every Ep4 beat using spec 05's own definition, to see whether the threshold catches the known defect.

**What is unclear.** The threshold and the measurement, because they disagree with spec 05's stated expectation.

Spec 05 says: "a passing density check does not mean a beat is good, only that it is not empty: **Ep4's WHAT IF beat would be a WARN or FAIL**." I confirmed the beat is visually sparse - a full-resolution frame at 03:47 shows an empty clock reading `0.0` and two empty boxes labelled FRIEND and NOT.

Measured (paper `#0b3763` plus 40 levels = RGB 51,95,139; HUD strip excluded; frame at end-of-hold of each beat):

- All 32 Ep4 beats: **minimum 3.26 %, maximum 6.37 %.**
- The WHAT IF beats: 8.1 = 3.88 %, 8.2 = 4.37 %, 8.3 = 4.50 %.
- Lowest beat overall is 5.2 at 3.26 %.

G10's thresholds are PASS at 2.0 %, WARN 1.0 to 2.0 %, FAIL under 1.0 %. Every Ep4 beat passes, including the sparse one. The metric is measuring the wrong thing: beat 8.2 still carries the large FICTIONAL SCENARIO stamp, the headline, the caption and the frame furniture, which is more ink than a genuinely empty beat would have.

**Options.**
1. Keep the threshold and accept that G10 catches only near-blank frames, not subjectively sparse ones. Then correct spec 05's expectation, and rely on the human sign-off line that G10 already requires.
2. Change the metric to measure drawing area rather than ink pixels - for example count non-background pixels excluding the stamp, headline and HUD, so a beat with a big stamp and no drawing reads as sparse.
3. Lower the threshold to around 3 % so the existing distribution separates. This would flag Ep4's 3.26 % minimum by a hair and would need recalibrating on all five finals (T5's calibration step) before it means anything.

**Which I would pick and why.** Option 2, with option 1 as the minimum. The gate's stated purpose is "flag near-empty beats", and ink-pixel share cannot distinguish an empty beat from a beat that is mostly typography. A metric that excludes text and the stamp would. Option 3 looks tempting because it uses the data I already have, but a threshold sitting 0.26 % above the lowest real beat would produce false alarms on every future episode and would be meaningless on the other four films. Whichever is chosen, T5's calibration run against all five finals has to set the number, not this check.

---

## Q4 (T5) G11: how should headline completeness actually be tested at 60 % of a beat?

**What I was doing.** Working out whether G11 can be implemented as described.

**What is unclear.** The stated method - "tested by sampling the text-progress function at that time, as today's `text at p=1`" - mixes two different questions. Today's test proves the text *function* draws the whole string when called with `p=1`. G11 needs to know whether a headline is *fully drawn on screen* at 60 % of a beat.

Measured on Ep4: panel progress at 60 % of each beat is **at least 0.9197** (PREROLL 0.2 s, `frac`, easing `1-(1-p)^1.5`), while the highest `seg(p, a, b)` lower bound in `ep4.js` is **0.85** (168 calls, none above 0.9197). So all text is complete at 60 % of every Ep4 beat. The other four episodes behave the same way (minimum progress 0.915 to 0.916 against a maximum `seg` lower bound of 0.9).

So G11's headline check passes for every existing episode - but only because these beats happen to be long relative to their ink-in. A shorter beat, or a `seg()` bound above about 0.92, would flip it to a FAIL.

**Options.**
1. Implement G11 literally: for each beat, compute panel progress at 60 % of the beat, and require that every `seg(p, a, b)` in that panel has `a <= p`. This is checkable statically from the panel source and matches the existing `seg()` idiom.
2. Sample the rendered frame at 60 % of each beat and detect whether the headline's text is complete - a pixel test, not a source test.
3. Sample at a later point (end of hold) where progress is 1.0, which makes the check trivial but also nearly meaningless.

**Which I would pick and why.** Option 1. It tests the real invariant (no text element is scheduled to finish after the moment we claim it is finished) and it needs no new image analysis. Option 2 is a stronger guarantee but requires OCR or template matching on blueprint text, which is a lot of machinery for a QC gate. I would also suggest G11 states the beat-progress figure it assumes, so the guarantee is visible rather than implicit.

---

## Q5 (T2) "about 66 frames" - 66 matches Ep3, not Ep4.

**What I was doing.** Planning the T2 equivalence harness.

**What is unclear.** The frame count. T2 says "a screenshot at every beat's mid-hold and end-of-hold (about 66 frames)".

Measured beat counts: Ep2 has 30 beats (60 frames), Ep3 has 33 (66), Ep4 has 32 (**64**), Ep5 has 37 (74). T2 is the Ep4 ticket, so it should be 64.

**Options.**
1. Change T2 to "64 frames" for Ep4, or drop the count and say "two frames per beat".
2. Leave it as "about 66".

**Which I would pick and why.** Option 1, worded generically ("two frames per beat"), so the same harness works for any episode in T10 without editing the ticket.

---

## Q6 (T0) T0's exclude list leaves about 322 MB tracked, which breaks T0's own 50 MB acceptance test.

**What I was doing.** Simulating gitignore against the real tree before writing any pattern.

**What is unclear.** The exact patterns. T0 lists `S*/FINAL/*.mp4`, `**/renders/*.mp4`, `**/audio/*.wav`, `**/narration/raw/*.mp3`, `**/audio/daniel/` and generated PNGs, and accepts "repo size small; `git count-objects -vH` (under about 50 MB)".

Those patterns are correct as far as they go, but in gitignore a `*` does not cross `/`. Simulated against the tree:

| Path | Size | Why it survives |
|---|---|---|
| `E02/audio/backup-before-levels/mix.wav` | 48.6 MB | `**/audio/*.wav` does not reach a subdirectory |
| `E02/audio/backup-before-levels/sfx_track.wav` | 24.3 MB | same |
| `audio/fx/bed.wav` in Ep2, Ep3, Ep4, Ep5 | 24.4 to 28.8 MB each (~107 MB) | same |
| `FINAL/voiceover-mp3/*.mp3` | 30 MB | `S*/FINAL/*.mp4` is mp4-only |
| `E02/audio/raw/*.mp3`, `E02/audio/tone-test/*.mp3` | 4.5 MB | not listed |
| `E01/audio/raw_S*.mp3` | 2.2 MB | not listed |

Total tracked under T0 as literally written: **534 files, 321.75 MB**. With `**/audio/**` and `**/FINAL/**` excluded wholesale: **226 text and code files, 1.77 MB**.

**Options.**
1. Exclude `**/audio/**` and `**/FINAL/**` wholesale, keeping `voice-plan.json`, `passages.json`, `measured.js` and all scripts tracked, as T0 requires.
2. Keep the itemised list and add the missing subdirectories explicitly: `**/audio/**/`, `**/FINAL/voiceover-mp3/`, `**/audio/raw/`, `**/audio/tone-test/`, `**/audio/backup-before-levels/`.
3. Keep the itemised list as written and raise the acceptance figure to about 350 MB.

**Which I would pick and why.** Option 1, or option 2 if the reviewer wants `audio/daniel/` tracked. Note the trade-off: `**/FINAL/**` also excludes `FINAL/index.html` (the viewer page, 41 lines) and `FINAL/voiceover-mp3/` (about 30 MB of the approved voiceover mixes). T0's brief-section-7b item 6 already says the raw takes and the finals live only in OneDrive and asks the user to copy them elsewhere, so excluding them from git is consistent with the brief's intent. If the reviewer wants `FINAL/index.html` tracked, that one file can be negated with `!S*/FINAL/index.html`.

---

## Q7 (T0, T10) How should Ep3's dead files be recorded, and when should they be removed?

**What I was doing.** Verifying spec 01's defect 3 ("Ep3 contains dead Ep2 files: `src/panels.js` and `src/examples.js`").

**What is unclear.** Whether the reviewer wants the removal itself in T0 or deferred.

Confirmed, and stronger than the spec states: `E03/src/panels.js` and `E03/src/examples.js` are **byte-identical** to `E02/src/panels.js` and `E02/src/examples.js` (SHA-256 `6439e4598d11` and `72c1ff749092`). `examples.js` defines `PANELS['1.3']`, which collides with `ep3.js`'s own `PANELS['1.3']`. Ep3's `index.html` loads neither file, so the collision is inert today, but adding either file to the script list would silently replace Ep3's panel 1.3 with Ep2's bus-and-car drawing.

**Options.**
1. T0 records the hashes and the collision in `docs/INVENTORY.md` and changes nothing (T0's acceptance says "no episode file changed"). Removal happens in T10 when Ep3 is migrated.
2. Remove the two files in T0 as a separate, explicitly-approved commit, before the baseline commit.

**Which I would pick and why.** Option 1. T0 is the safety net, and its acceptance test is that no episode file changes; deleting files in the very commit that establishes the baseline would muddy that. Brief section 7b item 7 also says "Do not edit any episode file in Phase 0. Dead-code removal and ledger creation are later phases and need the user's approval."

---

## Q8 (T1) The Chrome path is in 37 scripts, not "about 31".

**What I was doing.** Counting the hard-coded Chrome path, which is spec 01 defect 6 and brief hard rule 5.

**What is unclear.** Only the number. Measured: **39 files** match `C:/Users/user/.cache/puppeteer`, of which 37 are scripts (`.mjs`, `.js`, `.cjs`), 1 is `E02/audio/backup-before-levels/make-audio.mjs.bak` and 1 is the brief itself, which quotes the path in prose. By episode: Ep1 has 4, Ep2 has 7 plus the `.bak`, Ep3 has 8, Ep4 has 8, Ep5 has 8, and `upload/` has 2. All 39 point at the same single path.

**Options.**
1. Correct spec 01 defect 6 to "37 scripts" and let T1 and T4 fix all of them as part of the kit move.
2. Leave the spec text and simply note the true count in `docs/INVENTORY.md`.

**Which I would pick and why.** Option 1, because the number is used to decide whether the fix is finished. The count that matters for "no hard-coded user paths remain" is the number of files that contain the literal string, and the brief's wording says "about 31", which would let a reviewer stop early with 31 of 37 fixed. I would also suggest the check be "no file in the tree contains the literal path", which catches the `.bak` too.

---

## Q9 (T1) The brief's kit file list cannot serve Ep2. Confirm T1's per-file approach.

**What I was doing.** Checking brief section 7 Phase 1 against what actually exists in the episodes.

**What is unclear.** Not really a question about the spec - the brief text is stale and the ticket is right, but I want it recorded.

Brief section 7 Phase 1 proposed the kit hold "the engine files that are identical across Ep2 to Ep5 (`blueprint`, `objects`, `motion`, `vehicles`, `kit`)". Measured reality:

| File | Ep2 | Ep3 | Ep4 | Ep5 |
|---|---|---|---|---|
| `blueprint.js` | identical | identical | identical | identical |
| `objects.js` | identical | identical | identical | identical |
| `motion.js` | absent | identical | identical | identical |
| `vehicles.js` | absent | identical | identical | identical |
| `kit.js` | absent | absent | identical | identical |
| `lib/harness.js` | identical | identical | identical | identical |

So no single kit version serves Ep2: Ep2 has no `motion.js`, `vehicles.js` or `kit.js` and its `index.html` loads `src/panels.js` and `src/examples.js` instead of an `epN.js`. Ticket T1 already handles this ("For each file choose the version identical across Ep3 to Ep5 (motion.js, vehicles.js), Ep2 to Ep5 (blueprint.js, objects.js), Ep4/Ep5 (kit.js)"), and README line 14 makes the tickets win.

**Options.**
1. Proceed on T1's wording and record the divergence in `docs/KIT_VERSIONS.md`, as T1 requires.
2. Amend brief section 7 Phase 1 to match, so the two documents do not disagree.

**Which I would pick and why.** Option 1, plus a note in the review request. The brief's Phase list was already superseded by section 7b and by the ticket file, so I will not touch the brief unless asked.

---

## Q10 (T1, T2) Should Ep1's `lib/harness.js` and fonts be in the kit, given Ep1 is never migrated?

**What I was doing.** Checking spec 02's layout, which puts `harness.js` in `_shared/kit/engine/` and the woff2 files in `_shared/kit/fonts/`.

**What is unclear.** Ep1 is never migrated, but its `lib/harness.js` and `assets/fonts/*.woff2` are byte-identical to the other episodes' (harness `73af921eb54f`; all four fonts identical across all five episodes, total 0.3 MB).

**Options.**
1. Move the fonts and harness into the kit (as spec 02 says) and leave Ep1's own copies in place, untouched, until it is migrated or retired. Ep1 keeps working from its own folder; the kit holds the shared copy for everything else.
2. Leave Ep1 completely alone and treat it as frozen, moving nothing at all out of any episode folder in T1.

**Which I would pick and why.** Option 1. T1's acceptance test is "nothing in `S01_*` changed", which option 1 satisfies - the kit files are new files, and Ep1's copies are not touched. But I want the reviewer's confirmation, because option 1 does mean the same file exists in two places for a while, and the reviewer's T1 wording says to record "which episodes match each kit file byte-for-byte and where Ep2/Ep3 differ", which implies Ep1 is in scope for the kit.

---

## Q11 (T4) Ep2 and Ep3 place the FICTIONAL SCENARIO stamp by beat id; Ep4 and Ep5 by clip id. Which does `stampRole` mean?

**What I was doing.** Working out how `make-audio.mjs`'s sound cues map onto the manifest's clip roles, because that is T4's whole job.

**What is unclear.** The cue anchor. Measured across the four episodes:

| Episode | Stamp cue in `make-audio.mjs` | Anchored to | First clip of the WHAT_IF scene? |
|---|---|---|---|
| Ep2 | `film.beats.find((b) => b.id === '9.1').t0 + 0.1` | beat `9.1`, which anchors to clip `d41` | yes, `d41` is scene 9's first clip |
| Ep3 | `film.beats.find((b) => b.id === '9.1').t0 + 0.1` | beat `9.1`, which anchors to clip `e38` | yes, `e38` is scene 9's first clip |
| Ep4 | `film.clips.find((c) => c.id === 'f31').start - 0.1` | clip `f31` | yes, `f31` is scene 8's first clip |
| Ep5 | `film.clips.find((c) => c.id === 'g31').start - 0.1` | clip `g31` | yes, `g31` is scene 9's first clip |

So in all four episodes the stamp lands on the **first clip of the WHAT_IF scene** - G6's rule. But Ep2 and Ep3 express it as a beat id and Ep4 and Ep5 as a clip id, and the two differ in offset too (`+0.1` after the beat start against `-0.1` before the clip start).

**Options.**
1. Define `stampRole` as "the first clip of the WHAT_IF scene" and require the cue at `clip.start - 0.1`, which is Ep4's and Ep5's convention. Ep2 and Ep3's migration would then place the cue 0.2 s earlier than today.
2. Define `stampRole` as "the first clip of the WHAT_IF scene", let the cue time be `clip.start - 0.1`, and treat the 0.2 s shift in Ep2 and Ep3 as an accepted difference, recorded in the migration review.
3. Define the cue against the **beat** that anchors that clip, so Ep2 and Ep3 keep their exact timing.

**Which I would pick and why.** Option 1, with the shift recorded. T4's acceptance test only requires Ep4 to match the original within 1 ms, and Ep4 already uses the clip-anchored form, so the clip-anchored rule is the one that already exists in the reference episode. Ep2 and Ep3 are migrated in T10, one at a time with user approval each, and a 0.2 s stamp shift on a synthetic thump is exactly the kind of thing that should be flagged in that ticket's review rather than discovered later. I would like the spec to state the anchor explicitly, since "by clip role, not by hard-coded ID" (T4) does not say which of the two conventions wins.

---

## Q12 (T3, T10) G5's "vice versa" clause fails Ep2, which has one orphan panel.

**What I was doing.** Checking G5 against each episode's beat and panel sets.

**What is unclear.** Whether "every `PANELS` entry has a beat" is a hard requirement.

Measured:

| Episode | Beats | Panels (loaded files) | Beat without a panel | Panel without a beat |
|---|---|---|---|---|
| Ep2 | 30 | 31 | none | **`PANELS['10.1']`** (the SUNK COST card; `film.js` goes `9.3` then `10.2`) |
| Ep3 | 33 | 33 | none | none |
| Ep4 | 32 | 32 | none | none |
| Ep5 | 37 | 37 | none | none |

Ep2's `panels.js` defines a `PANELS['10.1']` that no beat ever draws. The SUNK COST headline actually lives in panel `9.3`. (Ep2's `src/panels.js` and `src/examples.js` together define 31 panels with no overlap between them: 26 and 5, union 31.)

**Options.**
1. Enforce G5 both ways, and treat Ep2's migration as needing the orphan removed from the migrated copy - a change to the panel set, recorded in T10's review.
2. Enforce only the direction that matters (every beat has a panel) and relax "vice versa" to a WARN, on the grounds that an extra panel is harmless and preserves pixel equivalence exactly.
3. Keep G5 strict and leave Ep2 failing it after migration, with the failure documented.

**Which I would pick and why.** Option 1. G5's purpose is to catch a panel that will never be drawn, and Ep2's orphan is exactly that kind of dead code - the same class of defect as Ep3's dead files. Removing it from the migrated copy does not change a single rendered frame, so pixel equivalence still holds, and the migration stays clean. But this does mean the migrated Ep2's `panels.js` is not a byte-for-byte copy of the original, so I want the reviewer to sanction that before I do it.

---

## Q13 (T10) Ep2's narration data has no text and five script versions. How should Ep2 be converted?

**What I was doing.** Checking whether G2 can be computed for each episode as the spec is written.

**What is unclear.** G2 compares `script.json` clip text against `narration/voice-plan.json` passages. Measured:

| Episode | Narration file | Passages | Have text? | Clips covered |
|---|---|---|---|---|
| Ep2 | `narration/passages.json` | 18 | **none - no `text` field at all** | all 51 (`d01`-`d51`) |
| Ep3 | `narration/passages.json` | 17 | yes, all 17 | all 51 (`e01`-`e51`) |
| Ep4 | `narration/voice-plan.json` | 14 | yes, in `passagesDetail` | all 42 (`f01`-`f42`) |
| Ep5 | `narration/voice-plan.json` | 14 | yes, in `passagesDetail` | all 40 (`g01`-`g40`) |

Ep2 additionally keeps five script files (`narration_v2.txt` to `narration_v6.txt`; the engine test asserts against `narration_v6.txt`), 34 `c*` raw clips in `audio/raw/` alongside the current `d*` set, and 33 `c*` trimmed clips in `audio/trim/` alongside the current `d*` set. Ep2's `audio/daniel/` also holds 32 `P*` mp3s, including `P1a`, `P1b`, `P5a`, `P5b`, `P5c`, `P6a`, `P6b`, `P8a`, `P8b` - variant takes that are not a clean `P01`-`P18` series.

**Options.**
1. For Ep2's migration, build `script.json` from the current `src/timing.js` CLIPS text (which matches `narration_v6.txt`), and construct a `voice-plan.json` with the passage text recovered from `narration_v6.txt` plus `passages.json`'s clip mapping. G2 then works.
2. Generalise G2 to compare against whichever narration file the episode has, with a per-episode source of truth.
3. Normalise Ep2's narration into the Ep4/Ep5 `voice-plan.json` shape by hand as a separate, human-approved step before T10 begins.

**Which I would pick and why.** Option 1. It uses files that already exist and are already verified against the engine test, so nothing is invented, and it produces the same `voice-plan.json` shape as Ep4 and Ep5 so the rest of the pipeline does not need a special case. Option 3 is the most honest about the messy history but needs text that only exists in `narration_v6.txt`, and hand-authoring a file is exactly the kind of step that should be visible and approved. I would raise the `c*` leftovers and the variant `P*` takes as a separate housekeeping question for Ep2's ticket.

---

## Q14 (T4) The `role` list has no place for Ep2's and Ep3's episode-specific sound cues.

**What I was doing.** Listing every sound cue in each episode's `make-audio.mjs`, to check that the manifest's `sound` block can express them all.

**What is unclear.** The schema. Measured:

| Episode | Cues beyond the universal pen/sweep-per-wipe, title chord and bed |
|---|---|
| Ep2 | two stamp thumps at clip `d34`; an hour-counter tick run at beat `10.3` (every 0.14 s for 3 s); a thump at beat `9.1` |
| Ep3 | two touchdown thumps tied to beats `2.3` and `4.2`; a sweep at beat `3.2` (the jet leaves the ramp); a thump at beat `9.1` |
| Ep4 | a thump at clip `f31`; a chord at `titleAt` |
| Ep5 | a thump at clip `g31`; a chord at `titleAt` |

Spec 03's manifest `sound` block has exactly two keys, `stampRole` and `titleRole`, and the clip `role` list has six values. The episodes' extra cues have no home.

**Options.**
1. Add an optional `extraCues` array to the manifest's `sound` block, listing episode-specific cues by role or beat reference, for example `[{ "at": "beat:9.1", "file": "thump" }]`.
2. Keep the manifest to the universal cues and leave episode-specific cues inside the authored `panels.js` or a per-episode audio notes file.
3. Extend the clip `role` vocabulary until every cue is covered by a role.

**Which I would pick and why.** Option 1, because it keeps every sound decision visible in one authored file that a reviewer can check against the script, and it is the only option where `bb audio` can reproduce an episode's exact cue list without reading the episode's own build scripts. Option 3 would make the role list long and would still not express Ep2's tick run, which is a repeating pattern rather than a one-off. The exact schema for `extraCues` is a design decision I am not making unilaterally - this is the reviewer to specify, and I will implement whatever is written.

---

## Q15 (T5) Where do the frames that G10 and G11 measure come from at `bb qc` time?

**What I was doing.** Working out what `bb qc` needs in order to run G8 to G11.

**What is unclear.** Spec 04 says `bb qc` runs "gates G8 to G11 on the muxed file and frames", and writes `qc/report.md`. G8 and G9 measure the MP4 (loudness, true peak, silence, SFX audibility, black frames, format, sync). G10 and G11 measure frames from the page, sampled at end-of-hold and at 60 % of each beat. Nothing says whether `bb qc` generates those frames itself, or reads the ones `bb frames` already wrote to `qc/frames/`.

**Options.**
1. `bb qc` reads `qc/frames/` and fails with a clear message if the frames are missing or stale, telling the user to run `bb frames` first.
2. `bb qc` regenerates the frames itself from the page.
3. `bb qc` accepts a path to a frames directory, defaulting to `qc/frames/`.

**Which I would pick and why.** Option 1, with the staleness check comparing each frame's timestamp against the page and the manifest. Regenerating inside `bb qc` would make a read-only-looking command do real work, and option 3 adds a flag without removing the need for the staleness check. The staleness check matters: if the frames predate the current `panels.js`, G10 and G11 would report on an old film and pass silently, which is the exact failure mode G10 exists to prevent.

---

## Q16 (T3) `bb check` is listed as read-only but writes `qc/check.md`.

**What I was doing.** Reconciling spec 04's command table.

**What is unclear.** Minor. The table gives `bb check` the Default "read-only" while the Writes column says `qc/check.md`, and the Global rules say anything that "writes outside `qc/`, `packaging/`, `audio/` or `renders/`" is dry-run by default - `qc/` is inside that list, so writing there is permitted by the global rule.

**Options.**
1. Read it as "does not modify source, only writes its own report" and follow the Writes column. No spec change.
2. Change the Default column to "runs" for consistency with `bb test` and `bb frames`.

**Which I would pick and why.** Option 1, no spec change needed, since the global rules already permit writing inside `qc/`. I am noting it only so that it is a decision rather than an assumption, and so that the exit-code contract (0 success, 1 a gate failed, 2 usage or spec error, 3 refused) is not confused with "read-only".

---

## Q17 (S02 run, step B) Ticket T0's acceptance has two S01-only parts. Run them or defer them?

**What I was doing.** Executing the MASTER_RUN step B, "Ticket T0 of 07_TICKETS.md (git safety net, no
behaviour change)".

**What is unclear.** T0's acceptance has four parts: (a) repo small, no media tracked; (b) `docs/INVENTORY.md`
with a per-file hash table across Ep2 to Ep5, the exact differing lines for near-identical files, Ep1
divergence and the eight defects from 01 section 6; (c) the four S01 engine tests re-run with pasted
output; (d) no episode file changed. Parts (b) and (c) are an audit of the **S01 migration** track
(`07_TICKETS.md` T1 to T11), which the audit report and RESUME_HERE both say is parked. MASTER_RUN §3-B
says: "If git or the acceptance test fails, log it and continue (not a blocker)."

**Options.**
1. Do the git safety net (init, `.gitignore`, first commit, repo-size, media and secret scans) and defer
   (b) and (c) as S01-migration artefacts, logging the deferral here and in the T0 review request.
2. Run (b) and (c) too. (b) means hashing every file in four S01 episodes and writing `docs/INVENTORY.md`;
   (c) means running S01's `build/test-engine.mjs` inside four S01 folders, which means executing S01 code
   and touching S01 folders' read paths.

**Which I would pick and why.** Option 1. MASTER_RUN §0 forbids touching anything under `S01_*`, and
running S01's test scripts inside S01 episode folders is closer to that boundary than it needs to be for an
S02 run whose whole purpose is a separate track. The safety net that matters for S02 - a repo that tracks
code and docs but no media, so an accidental `renders/` or `audio/` dump is never committed - is done in
full. Deferred items are recorded in `docs/design/reviews/S2-T0/REVIEW_REQUEST.md`.

ASSUMED: Option 1. The S01 audit parts of T0 are out of scope for the S02 run; the git safety net is in
scope and is executed and verified.

---

## Q18 (S02 run, step E) No episode has a voice recording. What exactly does that change?

**What I was doing.** Checking `audio/voice/` in all six episode folders before generating timing.

**What is unclear.** MASTER_RUN §4 step 2 says: "If `audio/voice/` holds the user's recording (`P01.wav...`
or `full.wav`), run retime and use measured timing and captions. Otherwise use estimated timing and no
burned-in captions." Measured: no episode folder has an `audio/` directory at all, and the S02 README
confirms narration is the user's own voice and is not yet recorded.

**Options.**
1. Use `timing/estimate.json` (passage seconds = words / 1.8, the rate `passages.md` itself states), no
   burned-in captions, and treat QC B17 (captions) as vacuously satisfied because no caption exists.
2. Synthesize placeholder narration audio for the mux so the films have a soundtrack.

**Which I would pick and why.** Option 1. Option 2 would mean putting a synthetic voice into a film the
user will later narrate, and the MASTER_RUN is explicit that the final mux is the user's own voice in
S2-T12. Option 1 is what the run file says to do. QC B15 ("audio-free sync": beat times equal the passage
anchors within one frame) is still enforced against the estimated anchors.

ASSUMED: Option 1. Estimated timing only, no burned-in captions, no synthetic narration in the episodes.
The `mux` path is still built and tested with a synthetic tone in S2-T12, exactly as MASTER_RUN §3-F asks.

---

## Q19 (S02 run, step D) Where do the three skills live, and how much of `bb-explain`'s `from-message` mode is in scope?

**What is unclear.** `10_S02_SKILLS.md` says each skill is "a module in `_shared/kit-v2/skills/<name>/`
with a README, a config format, a test and a demo page", and that `bb-explain` has two modes: `from-script`
(used for S02) and `from-message` (later series), where the latter is "Not implemented in the S02 run; write
the interface and a stub that exits with a clear message". The run file repeats this: step E generates
`episode.s2.json` with `bb-explain`, `data/<ep>.csv` with `bb-data`, `map.config.json` with `bb-map`.

**Options.**
1. Three directories under `_shared/kit-v2/skills/` (`bb-explain`, `bb-map`, `bb-data`), each with README,
   config format, Node test and a demo page; `from-message` present as an interface plus a stub that exits
   with a clear message; the three entry points callable from the episode build.
2. Flat files `_shared/kit-v2/skills/bb-explain.mjs` and so on, without per-skill directories.

**Which I would pick and why.** Option 1, because the skills file names the directory layout explicitly and
because the per-skill README/config/test/demo quadruple is the acceptance structure the reviewer can check.

ASSUMED: Option 1. `bb-explain` writes `episode.s2.json`, `glossary.json`, `captions/<ep>.srt` and
`.vtt`, and `timing/splits.md`; `bb-data` writes and validates `data/<ep>.csv`; `bb-map` writes and
validates `map.config.json`.

---

## Q20 (S02 run, step A) The ledger tags include rows marked TO VERIFY. What is the rule for on-screen use?

**What is unclear.** QC B11 says "any digit string on screen not present in the ledger with a VERIFIED or
SECONDARY tag" fails. Some ledger rows are tagged TO VERIFY (E01 F08 cryogenic temperatures, E02 F05
C-DAC's current systems, E03 F05 NVS-03 status after 31 Oct 2026, E05 F05 which plants are fabs). The
briefs already honour this - E01 says "no number unless sourced" for the cryogenic temperature, E02 says
"Optional second: none until F03/F04 are fixed", E03 says to show NVS-03 only as "reaching its slot".

**Options.**
1. Treat only VERIFIED and SECONDARY rows as showable, exactly as B11 says, and additionally require the
   CSV writer (`bb-data`) to reject a row whose `source_id` resolves to a non-VERIFIED/SECONDARY ledger row.
2. Allow TO VERIFY rows to be shown when the brief asks for them.

**Which I would pick and why.** Option 1. B11 is explicit and the skills file says the same thing for
`bb-data`: "a test that an unsourced row is rejected". Option 2 would put an unverifiable number on screen,
which is the exact thing the channel rules forbid.

ASSUMED: Option 1. TO VERIFY and CUT rows never reach the screen. Where a brief wants such a number (E03
NVS-03's post-launch status), the conservative reading is used: the label states only what a VERIFIED row
supports, and the date-sensitive wording is quoted from the ledger's "Used in" column.

---

## Not questions, but findings I want the reviewer to confirm


These are not unclear specs; they are things I verified and will act on. They are listed so the reviewer can correct me if I read them wrong.

- **Ep1 is never migrated** (spec 01, 02, T10). I will not touch Ep1's `src/`, its narration, its `audio/` or its `FINAL/` copy. Its engine differs (no `timing.js`, no `measured.js`, `SC.1 - THE HOOK` scene names, a different narrator, `src/storyboard*.js`).
- **The four engine tests all pass today**, so T0's baseline is green and any later failure is mine.
- **`core.autocrlf` is already `true` at system level** (`C:/Program Files/Git/etc/gitconfig`). T0's `core.autocrlf false` must therefore be set at the repository level to take effect, which is what T0 says. Worth confirming that "at the workspace root" means `git config core.autocrlf false` in the repo, not globally.
- **All files are LF with no CRLF**, and every text file is valid UTF-8 with no BOM, except `E01/smoke/index.html`, which is gitignored. G7b will pass on the real source as it stands.
- **The `·` separator is U+00B7** in `film.js` and `timing.js`, confirmed at byte level. Any tool that rewrites these files as cp1252 would break the on-screen scene labels.
- **Four `node_modules` junctions** (Ep2 to Ep5) point at Ep1's `node_modules`, confirmed by `Get-Item ... .Target`. T1 says not to touch them; I will not.
- **No secrets anywhere.** There is no `.env`, no `*.key`, no `*.pem` or `*.p8`, and no `.git` directory anywhere in the tree. The only occurrences of `ELEVENLABS_API_KEY` are prose in the brief and in Ep1's `DISCOVERY_REPORT.md`, which also records that the key was unset.
- **`S02` to `S06` are empty placeholders** holding only a `README.md` each, so `bb new S02 ...` has a clean target.
- **Both `Impact` and `Arial Black` are installed** (`impact.ttf`, `ariblk.ttf`), so T7's thumbnail builder will find its fonts.
- **No `PANELS_META` exists anywhere in the tree today.** Spec 03 introduces it as optional metadata declaring on-screen sourced numbers for G7, so it will first appear during a migration and needs an authored value at that point.