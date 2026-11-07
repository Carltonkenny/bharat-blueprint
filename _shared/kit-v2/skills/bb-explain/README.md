# bb-explain

Turn one episode's documents into the artefacts the build needs:
`episode.s2.json` (beats), `glossary.json`, `captions/<ep>.srt`, `captions/<ep>.vtt`
and `timing/splits.md`.

## Usage
```
node _shared/kit-v2/skills/bb-explain/bb-explain.mjs --episode <episodeDir> [--write] [--dry-run]
```

Mode `from-script` (the S02 mode) reads, from the episode folder:

| File | Used for |
|---|---|
| `EPISODE_BRIEF.md` | the beat table: passage, layer (B/H/C), kind, prose, camera |
| `passages.md` | the passage text, the word count and the FICTIONAL SCENARIO flag |
| `sources/LEDGER.md` | the tagged numbers that may appear on screen |
| `src/scene-ops.json` | the implementation: the scene ops for each beat (authored) |

Mode `from-message` is a later-series mode. It is **not implemented in the S02 run**:
the interface exists and the stub exits with a clear message.

## Config format (the beat weights)
The weights are derived from the brief, not invented: a beat's share of its passage is
proportional to its prose length, with `mechanism` and `payoff` beats given roughly
twice the share, and beats the brief marks `[L]` (long hold) about 1.4 times.
Every weight and every split is written to `timing/splits.md` for review.

## Beat ids
`1.01`, `1.02`, ... per passage, in the order the brief lists them. A split beat becomes
`1.03a`, `1.03b`. The brief's numbering is indicative, so ids are generated in order.

## Splitting for beat density (QC B9)
If the episode has fewer than 12 beats per minute, the longest beat that can still be
split into parts of at least 1.2 s is split in two, repeatedly, until the density is
inside 12 to 20. No content is added: a sub-beat carries the same prose as its parent.
Every split is listed in `timing/splits.md`.

## Idempotence
The output depends only on the input files, so running it twice gives byte-identical
results. The scene ops live in their own file (`src/scene-ops.json`) so that the
converter can be re-run without losing the implementation.

## Acceptance (from 10_S02_SKILLS.md)
For E01 the generated `episode.s2.json` matches the brief's beat table (ids and
content; only documented splits added); the captions round-trip to the passage text;
running twice gives identical output. `test.mjs` checks all three.
