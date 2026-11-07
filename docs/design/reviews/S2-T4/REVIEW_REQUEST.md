# REVIEW REQUEST - S2-T4 (beat engine v2, retime, the three skills)

Implementer: OpenCode. Date: 2026-11-07.

## Files added
- _shared/kit-v2/engine/beats.mjs (the timeline: weights, the B8 clamps, the report)
- _shared/kit-v2/engine/retime.mjs and etime.test.mjs
- _shared/kit-v2/skills/bb-explain/ (README, bb-explain.mjs, test.mjs, demo/)
- _shared/kit-v2/skills/bb-map/ (README, bb-map.mjs, test.mjs, demo/)
- _shared/kit-v2/skills/bb-data/ (README, bb-data.mjs, test.mjs, demo/)

## How to run
    node _shared/kit-v2/skills/bb-explain/test.mjs
    node _shared/kit-v2/skills/bb-map/test.mjs
    node _shared/kit-v2/skills/bb-data/test.mjs
    node _shared/kit-v2/engine/retime.test.mjs
    node _shared/kit-v2/skills/bb-explain/bb-explain.mjs --episode <episodeDir> --write

## Verbatim output
    PASS  bb-explain: running twice gives identical output
    PASS  bb-explain: the beat ids are sequential per passage
    PASS  bb-explain: the density is inside 12 to 20 beats per minute  [12.35 beats/min]
    PASS  bb-explain: the captions round-trip to the passage text  [492 vs 492 words]
    PASS  bb-map: a border-tagged node is rejected
    PASS  bb-map: no polyline in the map renderer is tagged as a border
    PASS  bb-data: a row whose ledger row is not VERIFIED or SECONDARY is rejected
    PASS  bb-data: the formatted value equals the CSV value exactly  [22]
    PASS  retime: the boundaries are within 50 ms of the true ones  [2.000, 6.600]
    PASS  retime: it refuses to guess when there are not enough pauses
    all passing

## Acceptance
- With estimate timing, the E01 density is inside 12 to 20 beats per minute after the
  documented sub-beat splits (12.35 beats per minute, 65 beats, no split needed).
- etime on synthetic WAVs recovers the passage boundaries within 50 ms and refuses to
  guess when the counts do not match.
- The captions round-trip to the passage text and running the converter twice gives
  identical output.

## Deviations and risks
1. The scene ops live in their own file (src/scene-ops.json) instead of inside
   episode.s2.json, so the converter can be re-run without losing the implementation
   and stays idempotent.
2. b-data writes data/episode.csv; the skills file names the file after the
   episode. The per-episode name is what the MASTER_RUN step 4 asks for, so the build
   copies data/episode.csv to data/<ep>.csv.
3. The CSV carries two extra columns, display and decimals, so the exact on-screen
   string and its decimals are explicit and deterministic.

## What I did not do
The rom-message mode of b-explain is an interface and a clear-exit stub, as the
skills file asks; it is not implemented.