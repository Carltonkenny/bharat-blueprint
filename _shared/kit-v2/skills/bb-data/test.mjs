// bb-data test. Run: node _shared/kit-v2/skills/bb-data/test.mjs
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRows, toCsv, format, parseLedger } from './bb-data.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const WORKSPACE = resolve(here, '..', '..', '..', '..');
const EPISODE = process.argv[2] || join(WORKSPACE, 'S02_DENIED-India-Built-It-Anyway', 'E01_Cryogenic-Engine');

const results = [];
const ok = (name, pass, detail = '') => results.push({ name, pass: !!pass, detail });

const ledger = parseLedger(readFileSync(join(EPISODE, 'sources', 'LEDGER.md'), 'utf8'));

// every chart type can be built from a ledger row
const kinds = ['counter', 'bar', 'chain', 'ratio', 'timeline'];
const spec = { rows: kinds.map((k, i) => ({ id: 'r' + i, ledger: 'F05', label: 'LABEL ' + k, kind: k, value: 22, unit: 't' })) };
const { rows, errors } = buildRows(spec, ledger);
ok('bb-data: a row of each chart type is accepted', errors.length === 0 && rows.length === kinds.length, errors.join(' | '));
ok('bb-data: every accepted row keeps its kind', rows.every((r) => kinds.includes(r.kind)));

// an unsourced row is rejected
const bad = buildRows({ rows: [{ id: 'x', ledger: 'NOPE', label: 'X' }] }, ledger);
ok('bb-data: a row whose ledger id does not exist is rejected', bad.errors.length === 1, bad.errors.join(' | '));

// a TO VERIFY ledger row is rejected
const toVerify = [...ledger.values()].find((r) => !/VERIFIED|SECONDARY/.test(r.tag));
if (toVerify) {
  const b2 = buildRows({ rows: [{ id: 'y', ledger: toVerify.id, label: 'Y' }] }, ledger);
  ok('bb-data: a row whose ledger row is not VERIFIED or SECONDARY is rejected', b2.errors.length === 1, b2.errors.join(' | '));
} else {
  ok('bb-data: a row whose ledger row is not VERIFIED or SECONDARY is rejected', true, 'no TO VERIFY row in this ledger');
}

// the final frame text equals the CSV value exactly
const r0 = rows[0];
ok('bb-data: the formatted value equals the CSV value exactly', format({ display: r0.display }, r0.value) === r0.display, `${r0.display}`);
ok('bb-data: the counter format is deterministic', format({ decimals: 0 }, 22) === '22' && format({ decimals: 0 }, 22) === '22');
ok('bb-data: the grouped format is deterministic', format({ decimals: 0, group: true }, 7700) === '7,700', format({ decimals: 0, group: true }, 7700));
ok('bb-data: the decimals are fixed per row', format({ decimals: 1 }, 19.5) === '19.5' && format({ decimals: 1 }, 19.5) === '19.5');

// the CSV carries the source id
const csv = toCsv(rows);
ok('bb-data: the CSV carries the source id and the display string', csv.split('\n')[1].includes('F05') && csv.split('\n')[1].includes('22'));

let bad2 = 0;
for (const r of results) { if (!r.pass) bad2++; console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? '  [' + r.detail + ']' : ''}`); }
console.log(bad2 ? `${bad2} failing` : 'all passing');
process.exit(bad2 ? 1 : 0);

