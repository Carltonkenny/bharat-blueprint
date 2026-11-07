# MASTER REFERENCE — India's Defence Technology: Then, Now, Next

Searchable reference for the 5-episode series. Every section has a stable ID (e.g. `IMP-03`, `SKL-02`). Search for the ID or a keyword.
Companion file: `EPISODES.md` (the five episode briefs). Episode 1 files live in `../akash-ng-episode-01/`.

## TOC
1. SER — Series rules and tone
2. PIPE — Production pipeline per episode
3. SKL — Skills and tools protocol (what to use, when, and how to log it)
4. IMP — Episode 1 v2 improvement backlog (user-approved list)
5. PREM — Premium look checklist ("no air gap")
6. QA — Quality gates and automated checks
7. FACT — Fact and source rules
8. TECH — Tech map (files, commands, known limits)

---

## 1. SER — Series rules and tone
- **SER-01 Series title:** India's Defence Technology — Then, Now, Next. Genre kept exactly: CINEMATIC SCENARIO-DRIVEN ENGINEERING EXPLAINERS.
- **SER-02 Visual identity:** ENGINEERING BLUEPRINT — HAND-DRAWN CYANOTYPE. Same palette, type and finishing in all five episodes.
- **SER-03 Structure of every episode:** a scenario hook, then THEN (how it was), NOW (how it is), NEXT (announced plans only), and a quiet reveal ending ("the part you don't see").
- **SER-04 Length:** about 2:15 to 2:30 each. Narration is paced at the Ranbir Merchant rate (about 125 s of speech for ~1,100 characters), so scripts are ~270–320 spoken words.
- **SER-05 Tone:** curious, factual, proud without hype. No enemy-naming, no superiority claims, no "best in the world", no ranking against other countries.
- **SER-06 "Next" rule:** only officially announced goals or programmes, always worded as goals ("aims to", "announced"), never as results.
- **SER-07 Voice:** Ranbir Merchant (ElevenLabs `eleven_v4`, voice_id `9PvnT6XRzlljoaDG6Knu`) unless the user changes it. Tags per section as in `akash-ng-episode-01/narration/voice-direction.md`.
- **SER-08 Code-only:** all visuals are code-drawn (Canvas/SVG via the H library). No image generation, no stock images, no ComfyUI.

## 2. PIPE — Production pipeline per episode
1. **Brief** (in `EPISODES.md`) → user approves.
2. **Source register** (claim → PIB/MoD/DRDO/service page). Nothing is scripted before this.
3. **Script** (locked words) → user approves.
4. **Storyboard** (about 24 code-drawn frames, with timestamps) → user approves. STOP here.
5. **Film build** (beats table + panels) → automated QC sweep → visual review of every held frame and every transition.
6. **Voice**: auditions only if the voice changes; generate per section; measure with ffprobe/silencedetect.
7. **Re-time** the beats to measured words; re-run QC; render; mux; loudness check (target -16 LUFS).
8. **Final review**: contact sheets every 2 s, plus the user listens.
Never skip a gate. Log the skills used at each step (see SKL).

## 3. SKL — Skills and tools protocol
Rule: at each stage, load the listed skill first, apply it, then write one line in the episode's `SKILLS_LOG.md` (stage, skill, what it changed). Status below is what is actually available in this environment as of 2026-11-04.

| ID | Stage | Skill / tool | Status | How it is used |
|---|---|---|---|---|
| SKL-01 | Research & facts | `anthropic-skills:deep-research`, `research`, `source-driven-development` | available | Gather claims, prefer PIB/MoD/DRDO/service/ISRO pages, record URL + date in the source register. |
| SKL-02 | Fact challenge | `doubt-driven-development` | available | Second pass: try to disprove each number/date in the script before it is locked. |
| SKL-03 | Planning | `planning-and-task-breakdown`, `spec-driven-development` | available | Turn the brief into a task list and acceptance criteria before building. |
| SKL-04 | Visual design review | `design:design-critique`, `frontend-design` | available | Critique frames for hierarchy, spacing, legibility; apply the PREM checklist. |
| SKL-05 | Legibility | `design:accessibility-review` | available | Text size/contrast, reading time per caption on a phone screen. |
| SKL-06 | Code quality | `incremental-implementation`, `code-review-and-quality`, `code-simplification` | available | Change one thing at a time; keep the kit tidy as it grows across episodes. |
| SKL-07 | Performance | `performance-optimization`, `web-perf` | available | Keep frame time low (target < 250 ms); downsample bloom; cache textures. |
| SKL-08 | Browser checks | `browser-testing-with-devtools` | available only when the chrome-devtools MCP is connected | Inspect canvas output and console errors. Currently the project uses its own puppeteer scripts instead. |
| SKL-09 | Video framework | Hyperframes skills (`/hyperframes`, `/hyperframes-cli`, `/hyperframes-registry`, `/media-use`) | NOT installed. Installable with `npx hyperframes skills update` (needs the user's OK). | Registry blocks (shader transitions, camera moves, captions) and CLI guidance. Evaluate before adopting. |
| SKL-10 | Voice | ElevenLabs connector (`creative_list_voices`, `creative_get_model_guide`, `creative_generate_speech`, model `eleven_v4`) | connected | Audition, tag, generate per section. Always `estimate_only` first for new voices; never retry a paid call blindly. |
| SKL-11 | Audio finishing | FFmpeg (silencedetect, loudnorm, sidechaincompress, adelay) | installed | Measure sentence starts, mix bed under voice, check LUFS. |
| SKL-12 | Memory | project memory file `akash-ng-episode-01.md` (extend per episode) | in use | Record decisions, voice, open items. |

**SKL-90 Log format** (`SKILLS_LOG.md` per episode): `date | stage | skill | what changed | result`.
**SKL-91 Gate:** a stage is not "done" until its skill line is logged.

## 4. IMP — Episode 1 v2 improvement backlog (approved by the user)
Apply to Episode 1 first (v2 render), then carry into Episodes 2–5.

**Circles that don't line up**
- IMP-01 Wheels, hubs and rings are drawn with random wobble, so they sometimes don't close and don't sit centered.
- IMP-02 Fix: draw circles as closed, nearly perfect shapes with very little wobble, so only straight lines look hand-drawn.
- IMP-03 Fix: put the wheel centers on the chassis line and keep the hubs concentric.
- IMP-04 Fix: check ring and bracket centers against the thing they mark, like the tracking marker.

**Words that don't finish**
- IMP-05 While a headline is typing, the viewer sees cut words like "UNIDENTI" or "A NETW".
- IMP-06 Fix: reveal whole words with a quick left-to-right ink wipe, and finish each label before the spoken word ends.
- IMP-07 Fix: type faster, since a typing effect over several seconds looks like a bug.

**Lines**
- IMP-08 Leader lines sometimes cross other objects.
- IMP-09 Dashes start at random phases.
- IMP-10 Corners have no overshoot, and line weight is uniform.
- IMP-11 Fix: route leaders cleanly, vary line weight a little, add a small overshoot at corners, and attach arrowheads exactly at line ends.

**Premium glow**
Today's glow is one 5-pixel blur plus a ghost offset, which reads as fuzz. A better version:
- IMP-12 Layered bloom: a tight, a medium and a wide blur, applied only to the brightest strokes, so the lines look lit.
- IMP-13 Hot pen trail: a freshly drawn line starts white-hot and cools to cyan over about 0.4 s.
- IMP-14 Color grade: a slightly warmer highlight and a deeper blue shadow, so it feels graded.
- IMP-15 Less clutter: quieter scanlines and grid, so there are no random-looking lines.
- IMP-16 Optional cheap route: add the glow after rendering with FFmpeg (isolate the bright pixels, blur them, blend over the top). Not yet tried on this video.

**Other upgrades worth doing**
- IMP-17 Carry-over between scenes, such as the tracking marker turning into the radar, instead of plain fades.
- IMP-18 Parallax camera moves, and a 1080p render.
- IMP-19 A smaller file: re-encoding should bring the 526 MB down to roughly 150 MB.
- IMP-20 Sound effects, like pen scratches and soft ticks. The sound kit pasted earlier was cut off, so the user should resend it complete or a simpler one is built.
- IMP-21 A listening check of sync and pronunciation, which only the user can do.

**Open facts for Episode 1**
- IMP-22 Cite a source for the US Patriot.
- IMP-23 Decide the SAMP/T wording ("FRANCE · ITALY" on the card vs "France" in the narration).

## 5. PREM — Premium look checklist ("no air gap")
Use as an acceptance list for every frame, every episode. Each item is yes/no.

**Light and glow**
- PREM-01 Only the brightest ink blooms; paper never lifts (no grey haze).
- PREM-02 Bloom is layered (tight + medium + wide) and a little warmer at the core than at the edge.
- PREM-03 The pen head leaves a hot trail that cools from white to cyan.
- PREM-04 Accents are rare: red only for alerts, orange only for heat/propulsion, and each used on purpose.
- PREM-05 Vignette and grain are present but subtle; no visible banding in gradients.

**Line quality**
- PREM-06 Circles are closed and concentric; arcs end exactly on their targets.
- PREM-07 Straight lines have gentle hand wobble, curves do not.
- PREM-08 Line weight has a hierarchy: outline > detail > construction > grid.
- PREM-09 Corners overshoot slightly; dashes start at the beginning of a line, not mid-dash.
- PREM-10 Arrowheads sit exactly on line ends; leaders never cross drawings.

**Typography**
- PREM-11 Headlines >= 44 px, labels >= 28 px, key numbers >= 64 px, all inside the border.
- PREM-12 No half-typed words on screen at rest; reveals are word-by-word or wipes.
- PREM-13 Every label lands on the word it names (visual may lead by <= 0.2 s, never lag).
- PREM-14 Numbers tick up and settle in mono lettering inside dimension-style callouts.

**Motion**
- PREM-15 Something is always drawing, moving or pulsing; no dead sheet at any scene change.
- PREM-16 Elements that matter carry over between scenes (match cuts) instead of generic fades.
- PREM-17 The camera drifts with a purpose (toward the next subject) and eases in/out.
- PREM-18 Ink-in eases out so a scene populates quickly then settles.

**Explanation quality**
- PREM-19 Every narration beat has a visual event; nothing is just text.
- PREM-20 Each system is shown working (signal flows, forces, heat) not just labelled.
- PREM-21 Real proportions where public; otherwise labelled "conceptual / not to scale".
- PREM-22 One idea per scene; the viewer can restate it after the scene.

**Sound**
- PREM-23 Voice at about -16 LUFS; bed at least 18 LU below the voice and ducked.
- PREM-24 Quiet SFX (pen, tick, soft whoosh) only on events that land; none over key words.
- PREM-25 Big hits only in pauses; silence left on purpose before the final title.

**Delivery**
- PREM-26 1080p master (or 720p with crisp lines), CRF 18–20 re-encode for sharing.
- PREM-27 Final title held >= 2 s.

## 6. QA — Quality gates and automated checks
- QA-01 `node build/qc-frames.mjs <dir>`: held frame of every beat: text size, safe area, header/title-block collisions, overlaps, empty frame.
- QA-02 `node build/qc-sweep.mjs 0.25`: same checks every 0.25 s over the whole film (skips overlap checks during cross-fades).
- QA-03 `node build/shoot-frames.mjs <dir> t1,t2,...`: saves frames, reports ms/frame, and tests determinism (same t twice, and after another t).
- QA-04 Contact sheets: extract with `ffmpeg -vf fps=1/2,scale=640:-1,tile=3x3` and look at them all. Automated checks do not replace this.
- QA-05 Audio: `ffprobe` duration match, `ebur128` loudness, and the user's listening check.
- QA-06 New in v2 (to build): pixel checks for circle closure and arrow-tip contact; word-completion check at the moment each narration word starts.

## 7. FACT — Fact and source rules
- FACT-01 Primary sources only: PIB, Ministry of Defence, DRDO, the service/agency's own pages (Indian Navy, IAF, ADA, HAL, ISRO). Newspapers/blogs only as pointers.
- FACT-02 Each claim in the script has a row in the episode's source register with URL, date, and the exact supporting wording.
- FACT-03 Mark each claim: VERIFIED (page read), PARTLY (snippet only), TO VERIFY, ENGINEERING EXPLANATION, CONCEPTUAL VISUAL.
- FACT-04 Never invent: specifications, ranges, speeds, internals, deployments, procedures, classified detail.
- FACT-05 Before/after comparisons use the same measure on both sides, with a named source for each.
- FACT-06 If a fact is "announced" it is shown as an aim, with the announcement date.
- FACT-07 A completed trial or programme milestone must not be presented as induction/deployment unless the source says so.

## 8. TECH — Tech map
- TECH-01 Stack: Node 22, FFmpeg 8.1, Hyperframes 0.9.9 (local install in each episode folder), puppeteer-core with the cached Chrome headless shell.
- TECH-02 Render: `npx hyperframes render . -o renders/<name>.mp4 --fps 30 --quality looks --workers 2` (about 7 minutes for 2:16).
- TECH-03 Composition contract: `index.html` canvas 1280×720, `data-fps=30`, `data-no-timeline`, `window.seek(t)`, `window.DURATION`, `hf-seek` listener.
- TECH-04 Files: `lib/harness.js` (H library, unchanged), `src/blueprint.js` (look), `src/objects.js` (drawings), `src/panels.js` (scenes), `src/film.js` (BEATS, camera, transitions), `narration/`, `audio/`, `build/` (QC scripts).
- TECH-05 Determinism: all randomness from `H.rng` / `H.makeNoise`; every frame is a pure function of t.
- TECH-06 Known limits: the style was rebuilt from a written description because the reference source was not supplied; the pasted sound kit was truncated; low available RAM during renders (use 2 workers); output files are large because of grain.
- TECH-07 Reuse across episodes: copy the engine (`lib`, `src/blueprint.js`, `src/objects.js` base objects, `build/`) into a new episode folder; new episodes add objects and panels only.
