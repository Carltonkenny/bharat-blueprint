// bb-explain test. Run: node _shared/kit-v2/skills/bb-explain/test.mjs
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildEpisode, parseBrief, parsePassages, parseLedger, allowedNumbers } from './bb-explain.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const WORKSPACE = resolve(here, '..', '..', '..', '..');
const EPISODE = process.argv[2] || join(WORKSPACE, 'S02_DENIED-India-Built-It-Anyway', 'E01_Cryogenic-Engine');

const results = [];
const ok = (name, pass, detail = '') => results.push({ name, pass: !!pass, detail });

// ---- the parsers ----
const brief = readFileSync(join(EPISODE, 'EPISODE_BRIEF.md'), 'utf8');
const rows = parseBrief(brief);
ok('bb-explain: every brief row is parsed', rows.length >= 10, String(rows.length));
ok('bb-explain: the beats of a row keep their order', rows[0].beats.every((b, i, a) => i === 0 || b.order > a[i - 1].order));
ok('bb-explain: the layer is read', rows[0].beats.some((b) => ['B', 'H', 'C'].includes(b.layer)));
ok('bb-explain: a kind in square brackets is read', rows.flatMap((r) => r.beats).some((b) => b.kind));

const passages = parsePassages(readFileSync(join(EPISODE, 'passages.md'), 'utf8'));
ok('bb-explain: every passage has text', [...passages.values()].every((p) => p.text.length > 20), String(passages.size));
ok('bb-explain: the FICTIONAL SCENARIO flag is read', [...passages.values()].some((p) => /FICTIONAL/i.test(p.flag)));

const ledger = parseLedger(readFileSync(join(EPISODE, 'sources', 'LEDGER.md'), 'utf8'));
ok('bb-explain: the ledger rows are parsed', ledger.size >= 5, String(ledger.size));
const nums = allowedNumbers(ledger);
ok('bb-explain: only VERIFIED/SECONDARY numbers are allowed', nums.length > 0 && !nums.includes('52'), nums.join(','));

// ---- the generated episode ----
const a = buildEpisode(EPISODE);
const b = buildEpisode(EPISODE);
ok('bb-explain: running twice gives identical output', JSON.stringify(a.episode) === JSON.stringify(b.episode));
ok('bb-explain: the beat ids are sequential per passage', a.episode.beats.every((x, i, arr) => i === 0 || x.p !== arr[i - 1].p || x.id > arr[i - 1].id));
ok('bb-explain: every beat belongs to a passage', a.episode.beats.every((x) => a.episode.passages.some((p) => p.id === x.p)));
const totalW = a.episode.passages.map((p) => a.episode.beats.filter((x) => x.p === p.id).reduce((s, x) => s + x.w, 0));
ok('bb-explain: every passage has beats', totalW.every((w) => w > 0));
ok('bb-explain: the density is inside 12 to 20 beats per minute', (() => {
  const dur = a.episode.passages.reduce((s, p) => s + p.estSec, 0) + 0.8;
  const bpm = a.episode.beats.length / (dur / 60);
  return bpm >= 12 && bpm <= 20;
})(), (a.episode.beats.length / ((a.episode.passages.reduce((s, p) => s + p.estSec, 0) + 0.8) / 60)).toFixed(2) + ' beats/min');

// ---- the captions round-trip to the passage text ----
const capWords = a.captions.map((c) => c.text).join(' ').split(/\s+/).filter(Boolean);
const passWords = a.episode.passages.map((p) => p.text).join(' ').split(/\s+/).filter(Boolean);
ok('bb-explain: the captions round-trip to the passage text', capWords.join(' ') === passWords.join(' '),
  `${capWords.length} vs ${passWords.length} words`);
ok('bb-explain: the glossary holds every script word', (() => {
  const missing = passWords.map((w) => w.toLowerCase().replace(/[^a-z'-]/g, '')).filter((w) => w.length > 1 && !a.glossary[w]);
  return missing.length === 0;
})());

let bad = 0;
for (const r of results) { if (!r.pass) bad++; console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? '  [' + r.detail + ']' : ''}`); }
console.log(bad ? `${bad} failing` : 'all passing');
process.exit(bad ? 1 : 0);
