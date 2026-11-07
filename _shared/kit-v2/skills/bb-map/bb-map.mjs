// bb-map: validate and write the episode's map configuration.
//   node bb-map.mjs --episode <episodeDir> [--write] [--dry-run]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

export function validate(config, ledger) {
  const errors = [];
  const notes = [];
  if (!config || typeof config !== 'object') return { errors: ['the map config is not an object'], notes };
  const nodes = config.nodes || [];
  const routes = config.routes || [];
  const footprints = config.footprints || [];

  const all = [
    ...nodes.map((n) => ({ kind: 'node', o: n })),
    ...routes.map((r) => ({ kind: 'route', o: r })),
    ...footprints.map((f) => ({ kind: 'footprint', o: f })),
  ];
  for (const { kind, o } of all) {
    if (o.tag === 'border' || o.border === true) errors.push(`${kind} "${o.id}" is tagged as a border`);
    if (o.source && o.source !== 'SCHEMATIC') {
      if (!ledger.has(o.source)) errors.push(`${kind} "${o.id}": source "${o.source}" is not a ledger row`);
      else if (!/VERIFIED|SECONDARY/.test(ledger.get(o.source).tag)) errors.push(`${kind} "${o.id}": source "${o.source}" is ${ledger.get(o.source).tag}`);
    } else if (!o.source) {
      notes.push(`${kind} "${o.id}" has no source (treated as SCHEMATIC)`);
    }
    if (kind === 'node') {
      if (typeof o.x !== 'number' || typeof o.y !== 'number') errors.push(`node "${o.id}" has no x/y`);
      else if (o.x < 0 || o.x > 1 || o.y < 0 || o.y > 1) errors.push(`node "${o.id}" is outside the map box`);
    }
  }
  for (const r of routes) {
    for (const id of r.nodes || []) {
      if (!nodes.find((n) => n.id === id)) errors.push(`route "${r.id}" references the unknown node "${id}"`);
    }
  }
  return { errors, notes };
}

export function parseLedger(text) {
  const rows = new Map();
  for (const line of text.split(/\r?\n/)) {
    if (!/^\|\s*F\d+/.test(line)) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 6) continue;
    rows.set(cells[0], { id: cells[0], tag: cells[5].toUpperCase() });
  }
  return rows;
}

function main() {
  const args = process.argv.slice(2);
  const i = args.indexOf('--episode');
  if (i < 0) { console.error('usage: node bb-map.mjs --episode <episodeDir>'); process.exit(2); }
  const dir = resolve(args[i + 1]);
  const cfgPath = join(dir, 'map.config.json');
  if (!existsSync(cfgPath)) { console.log('bb-map: no map.config.json for this episode (nothing to do)'); return; }
  const config = JSON.parse(readFileSync(cfgPath, 'utf8'));
  const ledger = parseLedger(readFileSync(join(dir, 'sources', 'LEDGER.md'), 'utf8'));
  const { errors, notes } = validate(config, ledger);
  notes.forEach((n) => console.log('  note: ' + n));
  if (errors.length) {
    console.error('bb-map: rejected the map config');
    errors.forEach((e) => console.error('  - ' + e));
    process.exit(1);
  }
  const write = args.includes('--write') && !args.includes('--dry-run');
  if (write) writeFileSync(cfgPath, JSON.stringify(config, null, 2) + '\n');
  console.log(`bb-map: ${(config.nodes || []).length} nodes, ${(config.routes || []).length} routes, ${(config.footprints || []).length} footprints, no borders`);
}

if (process.argv[1] && process.argv[1].endsWith('bb-map.mjs')) main();
