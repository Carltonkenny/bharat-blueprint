# bb-data

CSV -> chart, with exact numbers on every frame. The numbers come from the episode's
ledger and nowhere else.

## Usage
```
node _shared/kit-v2/skills/bb-data/bb-data.mjs --episode <episodeDir> [--write] [--dry-run]
```

## Config format (`src/data.spec.json` in the episode folder)
```json
{ "rows": [
  { "id": "thrust", "ledger": "F05", "label": "TONNES OF THRUST", "kind": "counter",
    "unit": "t", "as_of": "2026-07-06", "display": "22" }
] }
```

| column | meaning |
|---|---|
| `id` | the row id used by the chart op (`{"op":"chart","row":"thrust"}`) |
| `ledger` | the ledger row id; it must exist and be tagged VERIFIED or SECONDARY |
| `label` | the on-screen label |
| `kind` | `counter`, `bar`, `chain`, `ratio` or `timeline` |
| `value`, `unit`, `as_of` | taken from the ledger row unless given here |
| `display` | the exact string shown on screen (optional) |
| `decimals` | fixed decimals for the value (default 0) |

## CSV format (`data/<ep>.csv`)
`id,label,value,unit,as_of,source_id,kind,display,decimals`

## Rules
- The displayed value is a pure function of t; at the end of the animation it equals the
  CSV value exactly (a string compare of the formatted number).
- Number formatting is deterministic: a fixed locale and fixed decimals per row.
- No value on screen may differ from the CSV (QC B11).
- A row whose `source_id` is not in the ledger, or is not tagged VERIFIED or SECONDARY,
  is **rejected** and the tool exits with an error.

## Acceptance (from 10_S02_SKILLS.md)
A demo chart of each type; a frame-by-frame test that the final frame text equals the
CSV; a test that an unsourced row is rejected. `test.mjs` checks all three.
