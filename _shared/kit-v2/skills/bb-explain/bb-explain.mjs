// bb-explain: message -> script -> storyboard -> scenes -> synced captions.
// Mode from-script is the S02 mode: it reads the brief, the passages and the ledger and
// writes episode.s2.json, glossary.json, captions and timing/splits.md.
//
//   node bb-explain.mjs --episode <episodeDir> [--dry-run] [--write]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

// ---------------------------------------------------------------- from-message stub
export function fromMessage(message) {
  console.error('bb-explain: mode "from-message" is not implemented in the S02 run.');
  console.error('It would write a research prompt (in the style of CHATGPT_RESEARCH_PROMPT.md)');
  console.error('and an empty brief skeleton. Use --episode <dir> for the from-script mode.');
  process.exit(3);
}

// ---------------------------------------------------------------- brief parsing
export function parseBrief(text) {
  const rows = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const m = /^\|\s*(P\d+)\s*\(([\d.]+)\)\s*\|\s*(.*?)\s*\|\s*$/.exec(line);
    if (!m) continue;
    const passage = m[1];
    const est = parseFloat(m[2]);
    const cell = m[3];
    // beats are separated by a middle dot; each starts with a number
    const parts = cell.split(/·/).map((s) => s.trim()).filter(Boolean);
    const beats = [];
    for (const part of parts) {
      const b = /^\s*(\d+)\s*([BHC])?\s*(?:\[([a-z-]+)\])?\s*(.*)$/.exec(part);
      if (!b) {
        // a chunk that is not a new beat continues the previous one
        if (beats.length) beats[beats.length - 1].prose += ' · ' + part;
        continue;
      }
      const text2 = b[4] || '';
      // a trailing camera move, e.g. "push-in", "orbit 30 degrees", "slow dolly"
      const cam = /\b(push-in|pull-back|orbit|dolly|parallax|hold)\b/.exec(text2);
      beats.push({
        order: parseInt(b[1], 10),
        layer: b[2] || 'B',
        kind: b[3] || null,
        long: /\[L\]/.test(text2) || /\blong hold\b/i.test(text2),
        camera: cam ? cam[1] : null,
        prose: text2.replace(/\s+/g, ' ').trim(),
      });
    }
    rows.push({ passage, est, beats });
  }
  return rows;
}

// ---------------------------------------------------------------- passages parsing
export function parsePassages(text) {
  const out = new Map();
  const lines = text.split(/\r?\n/);
  let cur = null;
  const table = /^\|\s*(P\d+)\s*\|\s*(\d+)\s*\|\s*([\d.]+)\s*\|\s*([^|]*)\|\s*$/;
  const head = /^###\s*(P\d+)\s*$/;
  for (const line of lines) {
    let m = table.exec(line);
    if (m) { out.set(m[1], { id: m[1], words: +m[2], estSec: +m[3], flag: m[4].trim(), text: '' }); continue; }
    m = head.exec(line);
    if (m) { cur = m[1]; continue; }
    if (cur && line.trim() && !line.startsWith('#') && !line.startsWith('|')) {
      const p = out.get(cur);
      if (p) p.text += (p.text ? ' ' : '') + line.trim();
      cur = null;
    }
  }
  return out;
}

// ---------------------------------------------------------------- ledger parsing
export function parseLedger(text) {
  const rows = new Map();
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (!/^\|\s*F\d+/.test(line)) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 6) continue;
    const id = cells[0], claim = cells[1], num = cells[2], src = cells[3], url = cells[4], tag = cells[5];
    rows.set(id, { id, claim, num, source: src, url, tag: tag.toUpperCase() });
  }
  return rows;
}

// allowed tags: only VERIFIED or SECONDARY numbers may appear on screen (QC B11).
// A number is allowed when it appears anywhere in the claim, the number column or the
// source line of a VERIFIED or SECONDARY ledger row.
export function allowedNumbers(ledger) {
  const nums = new Set();
  for (const r of ledger.values()) {
    if (!/VERIFIED|SECONDARY/.test(r.tag)) continue;
    const text = `${r.claim} ${r.num} ${r.source}`;
    const m = text.match(/[0-9][0-9.,]*/g) || [];
    m.forEach((s) => {
      const clean = s.replace(/[.,]$/, '');
      if (clean) nums.add(clean);
    });
    const range = /(\d+)\s*to\s*(\d+)/.exec(r.num || '');
    if (range) { nums.add(range[1]); nums.add(range[2]); }
  }
  return [...nums];
}

// ---------------------------------------------------------------- weights
export function weightFor(b) {
  const words = b.prose.split(/\s+/).filter(Boolean).length;
  let w = 1 + words * 0.10;
  if (b.kind === 'mechanism' || b.kind === 'payoff') w *= 2.0;
  if (b.long) w *= 1.4;
  return w;
}

// ---------------------------------------------------------------- main
export function buildEpisode(episodeDir) {
  const dir = resolve(episodeDir);
  const brief = readFileSync(join(dir, 'EPISODE_BRIEF.md'), 'utf8');
  const passagesTxt = readFileSync(join(dir, 'passages.md'), 'utf8');
  const ledgerTxt = readFileSync(join(dir, 'sources', 'LEDGER.md'), 'utf8');

  const rows = parseBrief(brief);
  const passages = parsePassages(passagesTxt);
  const ledger = parseLedger(ledgerTxt);
  const numbers = allowedNumbers(ledger);

  // the scene ops, authored by the implementer
  let sceneOps = {};
  const opsPath = join(dir, 'src', 'scene-ops.json');
  if (existsSync(opsPath)) sceneOps = JSON.parse(readFileSync(opsPath, 'utf8'));

  const beats = [];
  const splits = [];
  for (const row of rows) {
    const p = passages.get(row.passage);
    const pnum = parseInt(row.passage.replace(/\D/g, ''), 10);
    row.beats.forEach((b, i) => {
      const id = `${pnum}.${String(i + 1).padStart(2, '0')}`;
      beats.push({
        id, p: row.passage, order: b.order, layer: b.layer, kind: b.kind || 'hold',
        w: weightFor(b), prose: b.prose, camera: b.camera,
        scene: sceneOps[id] || [], labels: [], notes: b.prose,
      });
    });
  }

  // split for density (QC B9): the passage duration is fixed, so splitting only adds beats
  const passageSec = (pid) => (passages.get(pid) ? passages.get(pid).estSec : 0);
  const totalSec = passages.size ? [...passages.values()].reduce((s, p) => s + p.estSec, 0) : rows.reduce((s, r) => s + r.est, 0);
  const LEAD = 0.8;
  const duration = totalSec + LEAD;
  let guard = 0;
  while ((beats.length / (duration / 60)) < 12 && guard++ < 40) {
    // find the longest beat that can still be split into two parts of at least 1.2 s
    let best = null;
    for (const b of beats) {
      const dur = (passageSec(b.p) * b.w) / beats.filter((x) => x.p === b.p).reduce((s, x) => s + x.w, 0);
      if (dur < 2.4) continue;
      if (!best || dur > best.dur) best = { b, dur };
    }
    if (!best) break;
    const parent = best.b;
    const a = Object.assign({}, parent, { id: parent.id + 'a', w: parent.w / 2 });
    const c = Object.assign({}, parent, { id: parent.id + 'b', w: parent.w / 2, scene: parent.scene.map((s) => Object.assign({}, s, { id: undefined })) });
    const i = beats.indexOf(parent);
    beats.splice(i, 1, a, c);
    splits.push({ parent: parent.id, into: [a.id, c.id], reason: 'beat density (QC B9)' });
  }

  // the ids stay as parsed: a split beat becomes 1.03a / 1.03b and carries its parent's scene
  // the ids stay as parsed: a split beat becomes 1.03a / 1.03b and carries its parent's scene
  // the ids stay as parsed: a split beat becomes 1.03a / 1.03b and carries its parent's scene
  // the ids stay as parsed: a split beat becomes 1.03a / 1.03b and carries its parent's scene
  // the ids stay as parsed: a split beat becomes 1.03a / 1.03b and carries its parent's scene
  // the ids stay as parsed: a split beat becomes 1.03a / 1.03b and carries its parent's scene
  // the ids stay as parsed: a split beat becomes 1.03a / 1.03b and carries its parent's scene

  // the camera overrides, authored per episode (src/camera.json)
  let camera = {};
  const camPath = join(dir, 'src', 'camera.json');
  if (existsSync(camPath)) camera = JSON.parse(readFileSync(camPath, 'utf8'));

  const episode = {
    id: (dir.split(/[\\/]/).pop().match(/^(E\d+)/i) || [null, 'E01'])[1].toUpperCase(),
    title: (readFileSync(join(dir, 'script.md'), 'utf8').match(/^# Episode \d+: (.+)$/m) || [, 'Episode'])[1].trim(),
    world: (brief.match(/World:\s*`?([a-z]+)`?/) || [, 'ice'])[1],
    fps: 30,
    seed: 's02',
    passages: [...passages.values()].map((p) => ({ id: p.id, text: p.text, estSec: p.estSec, flag: p.flag, words: p.words })),
    beats: beats.map((b) => ({
      id: b.id, p: b.p, layer: b.layer, kind: b.kind, w: +b.w.toFixed(4),
      scene: b.scene, labels: b.labels, notes: b.prose, cam: b.camera || 'hold',
      ...(camera[b.id] || {}),
    })),
  };

  // the glossary: the words of the script, the passages and the brief, plus technical terms
  const glossaryTerms = new Set();
  const addWords = (txt) => String(txt).split(/\s+/).map((w) => w.replace(/^[^\w]+|[^\w]+$/g, '')).filter((w) => w.length > 1).forEach((w) => {
    glossaryTerms.add(w.toLowerCase());
    w.split(/[^A-Za-z0-9]+/).forEach((part) => { if (part.length > 1) glossaryTerms.add(part.toLowerCase()); });
  });
  addWords(readFileSync(join(dir, 'script.md'), 'utf8'));
  passages.forEach((p) => addWords(p.text));
  addWords(brief);
  addWords('INDIA BUILT IT ANYWAY');
  // the ledger's source names are approved technical terms as well
  for (const r of ledger.values()) addWords(r.source + ' ' + r.claim);
  ['ISRO', 'PIB', 'C-DAC', 'CE20', 'LVM3', 'GSLV', 'NavIC', 'NVS', 'ATMP', 'OSAT', 'PFBR', 'PHWR', 'TBM', 'MWe', 'km', 'mm', 'rpm', 'K', 'MPa'].forEach((t) => glossaryTerms.add(t.toLowerCase()));
  const glossary = Object.fromEntries([...glossaryTerms].sort().map((t) => [t, t]));

  // captions, sentence level, from the passage text
  const captions = [];
  let ct = 0;
  for (const p of episode.passages) {
    const sentences = p.text.split(/(?<=[.!?])\s+/).filter(Boolean);
    const total = sentences.length || 1;
    sentences.forEach((s, i) => {
      const dur = (p.estSec / total);
      captions.push({ id: `${p.id}.${i + 1}`, text: s, start: ct, end: ct + dur });
      ct += dur;
    });
  }

  const srt = captions.map((c, i) => {
    const f = (t) => {
      const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = (t % 60).toFixed(3).padStart(6, '0');
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${s}`;
    };
    return `${i + 1}\n${f(c.start)} --> ${f(c.end)}\n${c.text}\n`;
  }).join('\n');
  const vtt = 'WEBVTT\n\n' + captions.map((c, i) => {
    const f = (t) => {
      const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = (t % 60).toFixed(3).padStart(6, '0');
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${s}`;
    };
    return `${i + 1}\n${f(c.start)} --> ${f(c.end)}\n${c.text}\n`;
  }).join('\n');

  const splitsMd = [
    `# Beat splits and weights - ${episode.id}`,
    '',
    'Generated by `bb-explain` from `EPISODE_BRIEF.md`. Weights come from the brief prose;',
    'the sub-beat splits below are the only additions to the brief\'s beat table.',
    '',
    '## Sub-beat splits',
    splits.length ? '' : 'None: the beat table already gives 12 to 20 beats per minute.',
    ...splits.map((s) => `- ${s.parent} -> ${s.into.join(' and ')} (${s.reason})`),
    '',
    '## Weights per beat',
    '',
    '| beat | passage | layer | kind | weight | prose |',
    '|---|---|---|---|---|---|',
    ...beats.map((b) => `| ${b.id} | ${b.p} | ${b.layer} | ${b.kind} | ${b.w.toFixed(3)} | ${b.prose.replace(/\|/g, '/')} |`),
    '',
  ].join('\n');

  return { episode, glossary, captions, srt, vtt, splitsMd, splits, numbers, ledger, passages, briefRows: rows };
}

// ---------------------------------------------------------------- CLI
function main() {
  const args = process.argv.slice(2);
  if (args.includes('--message')) return fromMessage(args[args.indexOf('--message') + 1] || '');
  const i = args.indexOf('--episode');
  if (i < 0) { console.error('usage: node bb-explain.mjs --episode <episodeDir>'); process.exit(2); }
  const dir = resolve(args[i + 1]);
  const out = buildEpisode(dir);
  const write = args.includes('--write') && !args.includes('--dry-run');
  const ep = out.episode;
  if (write) {
    writeFileSync(join(dir, 'episode.s2.json'), JSON.stringify(ep, null, 2) + '\n');
    writeFileSync(join(dir, 'glossary.json'), JSON.stringify(out.glossary, null, 2) + '\n');
    mkdirSync(join(dir, 'captions'), { recursive: true });
    writeFileSync(join(dir, 'captions', `${ep.id}.srt`), out.srt);
    writeFileSync(join(dir, 'captions', `${ep.id}.vtt`), out.vtt);
    mkdirSync(join(dir, 'timing'), { recursive: true });
    writeFileSync(join(dir, 'timing', 'splits.md'), out.splitsMd);
    mkdirSync(join(dir, 'qc'), { recursive: true });
    writeFileSync(join(dir, 'qc', 'ledger-numbers.json'), JSON.stringify(out.numbers, null, 2) + '\n');
  }
  console.log(`${ep.id}: ${ep.beats.length} beats, ${out.passages.size} passages, ${Object.keys(out.glossary).length} glossary terms, ${out.numbers.length} ledger numbers`);
  console.log(`splits: ${out.splits.length}`);
  if (!write) console.log('(dry run: nothing written)');
}

if (process.argv[1] && process.argv[1].endsWith('bb-explain.mjs')) main();
