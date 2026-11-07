# bb-map

Block maps, camera zooms, pins and routes - a schematic way to show where and how far,
without ever drawing a border.

## Usage
```
node _shared/kit-v2/skills/bb-map/bb-map.mjs --episode <episodeDir> [--write] [--dry-run]
```

## Config format (`map.config.json` in the episode folder)
```json
{
  "nodes": [
    { "id": "kalpakkam", "label": "KALPAKKAM", "x": 0.30, "y": 0.62, "source": "F08" }
  ],
  "routes": [
    { "id": "sawli-bkc", "nodes": ["sawli", "vikhroli", "bkc"], "source": "F01" }
  ],
  "footprints": [
    { "id": "navic", "label": "REGIONAL COVERAGE", "source": "F06" }
  ]
}
```

- `x` and `y` are fractions of the map box, placed by hand. Real coordinates are not
  used; if they are, the row needs a ledger id.
- `source` is a ledger row id, or `SCHEMATIC`.

## Rules
- **No country, state or district borders. Ever.** A node may not carry a `border` tag
  and no polyline may be tagged `border` (QC B16).
- Locations are schematic nodes: labelled dots, grid blocks, circles and route lines.
- The map camera moves between a wide grid and a local strip.

## API (the browser side, `src/maps.js`)
`map.create(config)`, `map.camera(t, keyframes)`, `map.pin(id, t)`, `map.route(id, t)`
(draw-on), `map.footprint(id, t)`.

## Acceptance (from 10_S02_SKILLS.md)
A demo with 3 pins, 1 route, 1 footprint and a wide-to-local zoom; QC B16 passes; no
polyline in the scene report is tagged `border`. `test.mjs` checks all three.
