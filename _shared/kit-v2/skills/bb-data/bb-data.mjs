// bb-data: CSV -> chart with exact numbers on every frame.
// Reads the episode's ledger and the episode's data spec, writes data/<ep>.csv,
// and rejects any row that is not in the ledger or is not tagged VERIFIED/SECONDARY.
//
//   node bb-data.mjs --episode <episodeDir> [--write] [--dry-run]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

export function parseLedger(text) {
  const rows = new Map();
  for (const line of text.split(/\r?\n/)) {
    if (!/^\|\s*F\d+/.test(line)) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 6) continue;
    rows.set(cells[0], { id: cells[0], claim: cells[1], num: cells[2], source: cells[3], url: cells[4], tag: cells[5].toUpperCase() });
  }
  return rows;
}

// a deterministic number format: fixed locale, fixed decimals per row
export function format(row, value) {
  if (row.display != null && row.display !== '') return String(row.display);
  const dec = row.decimals == null ? 0 : row.decimals;
  const v = dec > 0 ? value.toFixed(dec) : String(Math.round(value));
  if (!row.group) return v;
  const parts = v.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

export function buildRows(spec, ledger) {
  const out = [];
  const errors = [];
  for (const r of spec.rows || []) {
    const l = ledger.get(r.ledger);
    if (!l) { errors.push(`row "${r.id}": ledger row "${r.ledger}" does not exist`); continue; }
    if (!/VERIFIED|SECONDARY/.test(l.tag)) { errors.push(`row "${r.id}": ledger row "${r.ledger}" is tagged ${l.tag}, not VERIFIED or SECONDARY`); continue; }
    const num = r.value != null ? String(r.value) : l.num;
    const m = String(num).match(/-?[0-9][0-9.,]*/);
    const value = r.value != null ? Number(r.value) : (m ? parseFloat(m[0].replace(/,/g, '')) : NaN);
    if (!isFinite(value)) { errors.push(`row "${r.id}": no number found in "${num}"`); continue; }
    out.push({
      id: r.id,
      label: r.label != null ? r.label : l.claim,
      value,
      unit: r.unit != null ? r.unit : '',
      as_of: r.as_of != null ? r.as_of : '',
      source_id: r.ledger,
      kind: r.kind || 'counter',
      display: r.display != null ? r.display : format({ decimals: r.decimals }, value),
      decimals: r.decimals == null ? 0 : r.decimals,
      source: r.source != null ? r.source : `${l.source}`,
    });
  }
  return { rows: out, errors };
}

export function toCsv(rows) {
  const head = ['id', 'label', 'value', 'unit', 'as_of', 'source_id', 'kind', 'display', 'decimals', 'source'];
  const esc = (v) => {
    const s = String(v == null ? '' : v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return head.join(',') + '\n' + rows.map((r) => head.map((h) => esc(r[h])).join(',')).join('\n') + '\n';
}

export function buildEpisode(episodeDir) {
  const dir = resolve(episodeDir);
  const ledger = parseLedger(readFileSync(join(dir, 'sources', 'LEDGER.md'), 'utf8'));
  const specPath = join(dir, 'src', 'data.spec.json');
  const spec = existsSync(specPath) ? JSON.parse(readFileSync(specPath, 'utf8')) : { rows: [] };
  const { rows, errors } = buildRows(spec, ledger);
  return { rows, errors, csv: toCsv(rows), ledger };
}

function main() {
  const args = process.argv.slice(2);
  const i = args.indexOf('--episode');
  if (i < 0) { console.error('usage: node bb-data.mjs --episode <episodeDir>'); process.exit(2); }
  const dir = resolve(args[i + 1]);
  const { rows, errors, csv } = buildEpisode(dir);
  if (errors.length) {
    console.error('bb-data: rejected rows');
    errors.forEach((e) => console.error('  - ' + e));
    process.exit(1);
  }
  const write = args.includes('--write') && !args.includes('--dry-run');
  if (write) {
    mkdirSync(join(dir, 'data'), { recursive: true });
    writeFileSync(join(dir, 'data', 'episode.csv'), csv);
  }
  console.log(`bb-data: ${rows.length} row(s) accepted`);
  rows.forEach((r) => console.log(`  ${r.id}: ${r.display} ${r.unit} (${r.source_id}, ${r.kind})`));
  if (!write) console.log('(dry run: nothing written)');
}

if (process.argv[1] && process.argv[1].endsWith('bb-data.mjs')) main();
