// bb-map test. Run: node _shared/kit-v2/skills/bb-map/test.mjs
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validate, parseLedger } from './bb-map.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const WORKSPACE = resolve(here, '..', '..', '..', '..');
const EPISODE = process.argv[2] || join(WORKSPACE, 'S02_DENIED-India-Built-It-Anyway', 'E01_Cryogenic-Engine');

const results = [];
const ok = (name, pass, detail = '') => results.push({ name, pass: !!pass, detail });

const ledger = parseLedger(readFileSync(join(EPISODE, 'sources', 'LEDGER.md'), 'utf8'));

// a valid config: three pins, one route, one footprint
const good = {
  nodes: [
    { id: 'a', label: 'SAWLI', x: 0.2, y: 0.5, source: 'SCHEMATIC' },
    { id: 'b', label: 'VIKHROLI', x: 0.5, y: 0.4, source: 'SCHEMATIC' },
    { id: 'c', label: 'BKC', x: 0.8, y: 0.6, source: 'SCHEMATIC' },
  ],
  routes: [{ id: 'sawli-bkc', nodes: ['a', 'b', 'c'], source: 'SCHEMATIC' }],
  footprints: [{ id: 'f1', label: 'REGIONAL COVERAGE', source: 'SCHEMATIC' }],
};
const v = validate(good, ledger);
ok('bb-map: a config with 3 pins, 1 route and 1 footprint is accepted', v.errors.length === 0, v.errors.join(' | '));
ok('bb-map: the route only uses nodes that exist', v.errors.length === 0);

// a border is rejected
const bordered = JSON.parse(JSON.stringify(good));
bordered.nodes[0].tag = 'border';
const vb = validate(bordered, ledger);
ok('bb-map: a border-tagged node is rejected', vb.errors.length === 1 && /border/.test(vb.errors[0]), vb.errors.join(' | '));

// a source that is not a ledger row is rejected
const badSource = JSON.parse(JSON.stringify(good));
badSource.nodes[0].source = 'F999';
const vs = validate(badSource, ledger);
ok('bb-map: a source that is not a ledger row is rejected', vs.errors.length === 1, vs.errors.join(' | '));

// a node outside the map box is rejected
const outside = JSON.parse(JSON.stringify(good));
outside.nodes[0].x = 1.4;
const vo = validate(outside, ledger);
ok('bb-map: a node outside the map box is rejected', vo.errors.length === 1, vo.errors.join(' | '));

// the browser side never draws a border
const maps = readFileSync(join(WORKSPACE, '_shared', 'kit-v2', 'src', 'maps.js'), 'utf8');
ok('bb-map: no polyline in the map renderer is tagged as a border', !/tag\s*:\s*['"]border['"]/.test(maps));
ok('bb-map: the map renderer only draws blocks, pins, routes and circles', /terrain/.test(maps) && /pins/.test(maps) && /route/.test(maps) && /footprint/.test(maps));

let bad = 0;
for (const r of results) { if (!r.pass) bad++; console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? '  [' + r.detail + ']' : ''}`); }
console.log(bad ? `${bad} failing` : 'all passing');
process.exit(bad ? 1 : 0);
