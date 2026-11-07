# Design set for the Bharat Blueprint production line

**Roles.** Claude designs and reviews. OpenCode implements. The user decides and approves.
**OpenCode: you do not design.** The specs in this folder are the design. Your job is to understand them, then implement them exactly, one ticket at a time. Where a spec is silent, ambiguous or looks wrong, do not guess and do not redesign: stop and add the question to `docs/design/QUESTIONS.md` (what you were doing, what is unclear, the options you see, which you would pick and why). The reviewer answers by editing the spec and logging the change in `CHANGELOG.md`.

## Reading order (read all before touching anything)
1. `01_UNDERSTANDING.md`: what a Bharat Blueprint film is, how it is built today, what the theme is, known defects. Facts verified in code.
2. `02_ARCHITECTURE.md`: the target structure, what is generated vs authored, ownership.
3. `03_MANIFEST_SPEC.md`: the exact files and schemas that describe an episode (`episode.json`, `script.json`, `beats.json`).
4. `04_CLI_SPEC.md`: the `bb` command line.
5. `05_GATES_SPEC.md`: every automated check, with measurements and thresholds.
6. `06_PACKAGING_SPEC.md`: thumbnails, titles, descriptions, tags.
7. `07_TICKETS.md`: the ordered work list with acceptance tests. Work in order. One ticket at a time.
8. Series 2 only: `08_S02_VISUAL_ENGINE_SPEC.md` and `09_S02_TICKETS.md` (a separate track; S01 migration tickets T1 to T11 are parked, only T0 is a prerequisite). Series 2 content starts at `S02_DENIED-India-Built-It-Anyway/README.md`.
Then also read `00_CHANNEL/AGENT_BRIEF_OPENCODE.md` section 4 (hard rules) and 7b. If the brief's phase list conflicts with the tickets, **the tickets win**.

## Step 0: comprehension check (before any code)
Write `docs/design/UNDERSTANDING_CHECK.md` containing: (a) the film pipeline in your own words in under 400 words, (b) the list of what is generated vs authored, (c) every question or contradiction you found, (d) which ticket you would start with and why. Write no code and change no other file. Stop. The reviewer reads it and either corrects the specs or says go.

## Rules that never change
Do not render, call ElevenLabs, delete, or overwrite anything existing. Do not post or log in anywhere. No secrets in files. No hard-coded user paths. Dry-run is the default for anything slow, paid or destructive. Existing episodes are read-only until a ticket says otherwise. Every ticket ends with `REVIEW_REQUEST.md` and a stop.
