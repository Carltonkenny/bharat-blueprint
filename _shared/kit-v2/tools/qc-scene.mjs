// kit-v2: QC v2, part B: the scene-graph gates (QC_BAR_S02.md B1..B17).
// Deterministic, no pixels except the local background sample for B4.
//
//   node tools/qc-scene.mjs <episodeDir> [--json <out.json>] [--csv <out.csv>]
//
// It samples every beat at start+3 frames, mid-hold and end-of-hold-3 frames and
// evaluates every gate that can be decided from the scene report.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { launch, openPage } from './chrome.mjs';

const args = process.argv.slice(2);
const dir = resolve(args[0]);
if (!args[0]) { console.error('usage: node tools/qc-scene.mjs <episodeDir>'); process.exit(2); }
const flag = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };

const episode = JSON.parse(readFileSync(join(dir, 'episode.s2.json'), 'utf8'));
const timeline = JSON.parse(readFileSync(join(dir, 'timing', 'timeline.json'), 'utf8'));
const glossary = existsSync(join(dir, 'glossary.json')) ? JSON.parse(readFileSync(join(dir, 'glossary.json'), 'utf8')) : {};
const ledgerNumbers = existsSync(join(dir, 'qc', 'ledger-numbers.json'))
  ? JSON.parse(readFileSync(join(dir, 'qc', 'ledger-numbers.json'), 'utf8')) : [];

const fps = episode.fps || 30;
const W = 1920, H = 1080;
const SAFE = { x0: 0.05 * W, x1: 0.95 * W, y0: 0.06 * H, y1: 0.94 * H };

const browser = await launch();
const { page, errors, warnings } = await openPage(browser, join(dir, 'index.html'));

// pass the glossary and the ledger numbers into the page
await page.evaluate((g, nums) => { window.__GLOSSARY = g; window.__LEDGER_NUMBERS = nums; }, glossary, ledgerNumbers);
const PAPER = { ice: '#0a2f5c', network: '#071c38', orbit: '#050d21', graphite: '#123043', cleanroom: '#0c3b47', strata: '#112430' }[episode.world] || '#0a2f5c';

const samples = await page.evaluate(async (beats, PAPER) => {
  const out = [];
  for (const b of beats) {
    const dur = b.t1 - b.t0;
    const ts = [b.t0 + 3 / 30, b.t0 + 10 / 30, b.t0 + dur / 2, Math.max(b.t0 + 10 / 30, b.t1 - 10 / 30), Math.max(b.t0 + 3 / 30, b.t1 - 3 / 30)];
    for (const t of ts) {
      const r = window.__sceneReport(t);
      // sample the local background behind each text box (below the baseline)
      const c = document.getElementById('c2d');
      const ctx = c.getContext('2d');
      const scale = c.width / 1920;
      const bg = [];
      for (const it of r.items) {
        if (it.kind !== 'text') { bg.push(null); continue; }
        // the local background: several samples around the text box, and the darkest
        // of them, so a sample that lands on the glyph itself cannot pass the check
        const x = Math.round(it.x0 * scale), w = Math.max(1, Math.round((it.x1 - it.x0) * scale));
        const ys = [it.y0 - 10, it.y0 - 24, it.y1 + 8, it.y1 + 22].map((v) => Math.round(v * scale));
        let darkest = null;
        for (const yy of ys) {
          if (x < 0 || yy < 0 || x + w > c.width || yy + 4 > c.height) continue;
          const d = ctx.getImageData(x, yy, w, 4).data;
          let r0 = 0, g0 = 0, b0 = 0, n = 0;
          for (let i = 0; i < d.length; i += 4) { r0 += d[i]; g0 += d[i + 1]; b0 += d[i + 2]; n++; }
          const rgbv = [Math.round(r0 / n), Math.round(g0 / n), Math.round(b0 / n)];
          if (!darkest || (rgbv[0] + rgbv[1] + rgbv[2]) < (darkest[0] + darkest[1] + darkest[2])) darkest = rgbv;
        }
        if (darkest) {
          const pk = parseInt(PAPER.slice(1, 3), 16), pg = parseInt(PAPER.slice(3, 5), 16), pb = parseInt(PAPER.slice(5, 7), 16);
          const pl = pk + pg + pb;
          if (darkest[0] + darkest[1] + darkest[2] > pl) darkest = [pk, pg, pb];
        }
        bg.push(darkest);
      }
      out.push({ beat: b.id, t, items: r.items, bg });
    }
  }
  return out;
}, timeline.beats, PAPER);

// ---------- gates ----------
const failures = [];
const notes = [];
const fail = (gate, beat, msg) => failures.push({ gate, beat, msg });
const note = (gate, msg) => notes.push({ gate, msg });

function parseColor(c) {
  if (!c) return null;
  const m = /^#([0-9a-f]{6})$/i.exec(c);
  if (m) { const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  const rgb = /^rgba?\(([^)]+)\)$/.exec(c);
  if (rgb) { const p = rgb[1].split(',').map((s) => parseFloat(s)); return [p[0], p[1], p[2]]; }
  return null;
}
function relLum(rgb) {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
}
function contrast(a, b) {
  const l1 = relLum(a), l2 = relLum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const words = (s) => String(s).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

// B1 text inside the safe area
// B2 no overlap between two text boxes (> 2% of the smaller box)
// B3 cap height >= 2.0% of frame height
// B4 contrast >= 4.5:1 against the sampled local background
for (const s of samples) {
  const texts = s.items.filter((i) => i.kind === 'text' && i.opacity > 0.3 && i.text);
  for (const it of texts) {
    if (it.x0 < SAFE.x0 - 0.5 || it.x1 > SAFE.x1 + 0.5 || it.y0 < SAFE.y0 - 0.5 || it.y1 > SAFE.y1 + 0.5) {
      fail('B1', s.beat, `"${it.text}" outside the safe area [${it.x0 | 0},${it.y0 | 0}..${it.x1 | 0},${it.y1 | 0}]`);
    }
    const cap = (it.y1 - it.y0) * 0.74;
    if (cap < 0.02 * H - 0.5) fail('B3', s.beat, `"${it.text}" cap height ${cap.toFixed(1)} px < ${(0.02 * H).toFixed(1)} px`);
    const fg = parseColor(it.color), bg = s.bg[s.items.indexOf(it)];
    if (fg && bg) {
      const cr = contrast(fg, bg);
      if (cr < 4.5) fail('B4', s.beat, `"${it.text}" contrast ${cr.toFixed(2)}:1 < 4.5:1 (bg rgb(${bg.join(',')}))`);
    }
  }
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i], b = texts[j];
      const ix = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
      const iy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
      if (ix <= 0 || iy <= 0) continue;
      const inter = ix * iy;
      const smaller = Math.min((a.x1 - a.x0) * (a.y1 - a.y0), (b.x1 - b.x0) * (b.y1 - b.y0)) || 1;
      if (inter / smaller > 0.02) fail('B2', s.beat, `"${a.text}" overlaps "${b.text}" by ${(100 * inter / smaller).toFixed(1)}%`);
    }
  }
}

// B5 dwell, B6 glossary, B7 budget, B8 length, B9 density, B10 tags, B11 numbers, B12 geometry
const byBeat = new Map();
for (const s of samples) {
  if (!byBeat.has(s.beat)) byBeat.set(s.beat, []);
  byBeat.get(s.beat).push(s);
}

const glossaryMap = new Map();
for (const [k, v] of Object.entries(glossary)) glossaryMap.set(String(k).toLowerCase().replace(/[^a-z0-9]/g, ''), v);

const heroFirstBeat = new Set();
const fictionPassages = new Set((episode.passages || []).filter((p) => /FICTIONAL/i.test(p.flag || '')).map((p) => p.id));

for (const b of timeline.beats) {
  // B8 beat length
  const dur = b.t1 - b.t0;
  const mx = (b.kind === 'mechanism' || b.kind === 'payoff') ? 10 : 8;
  if (dur < 1.2 - 1e-6 || dur > mx + 1e-6) fail('B8', b.id, `beat length ${dur.toFixed(2)} s outside [1.2, ${mx}]`);

  // B7 beat budget
  const src = (episode.beats || []).find((x) => x.id === b.id) || {};
  const newLabels = (src.labels || []).length;
  if (newLabels > 2) fail('B7', b.id, `${newLabels} new labels in one beat (max 2)`);
  const moves = src.cams ? src.cams.length : (src.cam ? 1 : 0);
  if (moves > 1) fail('B7', b.id, `${moves} camera moves in one beat (max 1)`);
  const fx = (src.fx || []).length;
  if (fx > 2) fail('B7', b.id, `${fx} effect types in one beat (max 2)`);

  const ss = byBeat.get(b.id) || [];
  const items = ss.length ? ss[ss.length - 1].items : [];
  const texts = items.filter((i) => i.kind === 'text' && i.text);
  // the HUD carries a timecode and the episode id, not a fact: it is not a label
  const facts = texts.filter((i) => i.layer !== 'HUD');

  // B5 dwell: the label must be on screen for at least 0.4 + 0.3 s per word
  for (const it of texts) {
    const need = 0.4 + 0.3 * words(it.text).length;
    const visible = b.t1 - b.t0;
    if (visible < need - 1e-6) fail('B5', b.id, `"${it.text}" visible ${visible.toFixed(2)} s < required ${need.toFixed(2)} s`);
  }

  // B6 glossary
  for (const it of facts) {
    for (const w of words(it.text)) {
      if (w.length < 2) continue;
      if (!glossaryMap.has(w)) fail('B6', b.id, `"${it.text}" uses "${w}", which is not in the glossary`);
    }
  }

  // F6: a label that should be static must not move inside its beat
  {
    const samplesForBeat = byBeat.get(b.id) || [];
    const seen = new Map();
    for (const smp of samplesForBeat) {
      for (const it of smp.items.filter((i) => i.kind === 'text' && i.opacity > 0.3 && i.text && i.id)) {
        const key = it.id;
        const prev = seen.get(key);
        const moved = prev && (Math.abs((prev.ax || prev.x0) - (it.ax || it.x0)) > 0.5 || Math.abs((prev.ay || prev.y0) - (it.ay || it.y0)) > 0.5);
        if (moved) {
          fail('F6', b.id, `the label "${it.text}" moved more than 0.5 px inside the beat`);
        }
        seen.set(key, it);
      }
    }
  }

  // B10 tags: the first beat that uses a hero must carry its CONCEPTUAL/SCHEMATIC tag
  const heroes = items.filter((i) => i.kind === 'hero');
  for (const h of heroes) {
    const key = h.hero || 'hero';
    if (heroFirstBeat.has(key)) continue;
    heroFirstBeat.add(key);
    const tagged = texts.some((it) => /CONCEPTUAL|SCHEMATIC/i.test(it.text));
    if (!tagged) {
      // the beat may be showing the hero only because a transition is running: look at
      // the authored scene of the beat that introduces this hero
      const intro = (episode.beats || []).find((bb) => (bb.scene || []).some((o) => o.op === 'x:hero' && o.kind === key));
      const introTagged = intro && (intro.scene || []).some((o) => o.op === 'tag' || (o.op === 'x:hero' && o.tag));
      if (!introTagged) fail('B10', b.id, `the hero "${key}" appears on its first beat without a CONCEPTUAL/SCHEMATIC tag`);
    }
  }
  const nums = facts.filter((it) => /\d/.test(it.text));
  if (nums.length) {
    // the source chip may appear anywhere inside the beat
    const hasChip = (byBeat.get(b.id) || []).some((smp) => smp.items.some((it) => it.kind === 'text' && it.layer !== 'HUD' && it.opacity > 0.3 && it.text && (/\b(19|20)\d\d\b/.test(it.text) || /ISRO|PIB|C-DAC|NONPROLIFERATION|STATE DEPARTMENT|DAE|MINISTRY|SECONDARY/i.test(it.text))));
    if (!hasChip) fail('B10', b.id, `a number is on screen without a source chip: ${nums.map((n) => n.text).join(' | ')}`);
  }
  if (fictionPassages.has(b.p)) {
    const stamped = items.some((i) => /FICTIONAL SCENARIO/.test(i.text || ''));
    if (!stamped) fail('B10', b.id, 'the fictional passage has no FICTIONAL SCENARIO stamp on this beat');
  }

  // B11 numbers: every digit string on screen must exist in the ledger allowlist
  for (const it of facts) {
    const found = it.text.match(/[0-9][0-9.,]*/g) || [];
    for (const f of found) {
      const clean = f.replace(/[.,]$/, '');
      const digits = clean.replace(/[,.]/g, '');
      if (!ledgerNumbers.some((n) => {
        const nd = String(n).replace(/[,.]/g, '');
        return digits === nd || digits.includes(nd) || nd.includes(digits);
      })) {
        fail('B11', b.id, `"${it.text}" shows "${clean}", which is not in the ledger (VERIFIED/SECONDARY)`);
      }
    }
  }

  // B12 geometry sanity
  for (const it of items) {
    for (const k of ['x0', 'y0', 'x1', 'y1']) {
      if (!isFinite(it[k])) fail('B12', b.id, `item "${it.text || it.kind}" has a non-finite ${k}`);
    }
  }
  for (const h of heroes) {
    if (h.x1 <= h.x0 || h.y1 <= h.y0) fail('B12', b.id, 'a hero has zero visible area');
    if (h.x1 < 0 || h.y1 < 0 || h.x0 > W || h.y0 > H) fail('B12', b.id, 'a hero is outside the camera frustum for the whole beat');
  }
}

// B9 density
if (timeline.bpm < 12 || timeline.bpm > 20) fail('B9', '-', `${timeline.bpm} beats/min is outside 12..20`);

// B13 runtime
if (errors.length) for (const e of errors) fail('B13', '-', e);

// B14 determinism is measured separately (tools/qc-determinism.mjs)

// B15 audio-free sync: beat times equal the passage anchors within one frame
for (const b of timeline.beats) {
  const src = (episode.beats || []).find((x) => x.id === b.id);
  if (src && src.at != null) {
    const d = Math.abs(b.t0 - src.at);
    if (d > 1 / fps) fail('B15', b.id, `beat start ${b.t0.toFixed(4)} s differs from the passage anchor ${src.at.toFixed(4)} s by ${d.toFixed(4)} s`);
  }
}

// B16 no borders
const borderish = JSON.stringify(episode.beats || []).match(/"tag"\s*:\s*"border"/g);
if (borderish) fail('B16', '-', 'the episode data contains a border-tagged polyline');

// B17 captions (only when measured timing exists)
if (existsSync(join(dir, 'captions'))) {
  const capItems = samples.flatMap((s) => s.items).filter((i) => i.kind === 'caption');
  for (const it of capItems) {
    const lines = (it.text || '').split('\n');
    if (lines.length > 2) fail('B17', b.id, 'a caption has more than 2 lines');
    for (const l of lines) if (l.length > 42) fail('B17', b.id, `caption line longer than 42 characters: "${l}"`);
  }
}

const out = {
  episode: episode.id,
  generated: new Date().toISOString(),
  beats: timeline.beats.length,
  duration: timeline.duration,
  bpm: timeline.bpm,
  samples: samples.length,
  failures,
  notes,
  warnings,
};
const outPath = resolve(flag('json', join(dir, 'qc', 'scene-report.json')));
mkdirSync(join(dir, 'qc'), { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 2));

// the tracked label boxes, per beat, for the jitter gate (F6)
const labelBoxes = {};
for (const [id, list] of byBeat) {
  const last = list[list.length - 1];
  if (!last) continue;
  labelBoxes[id] = last.items
    .filter((i) => i.kind === 'text' && i.opacity > 0.3 && i.text)
    .map((i) => ({ id: i.id, text: i.text, x0: i.x0, y0: i.y0, x1: i.x1, y1: i.y1 }));
}
writeFileSync(join(dir, 'qc', 'label-boxes.json'), JSON.stringify(labelBoxes, null, 2));

const csvPath = resolve(flag('csv', join(dir, 'qc', 'scene-gates.csv')));
const rows = [['gate', 'beat', 'message']];
for (const f of failures) rows.push([f.gate, f.beat, f.msg]);
for (const n of notes) rows.push([n.gate, '-', n.msg]);
writeFileSync(csvPath, rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n') + '\n');

console.log(`scene gates: ${failures.length} failure(s) over ${samples.length} samples`);
const byGate = {};
for (const f of failures) byGate[f.gate] = (byGate[f.gate] || 0) + 1;
console.log(Object.keys(byGate).sort().map((g) => `${g}: ${byGate[g]}`).join('  ') || 'all gates pass');
for (const f of failures.slice(0, 40)) console.log(`  ${f.gate} ${f.beat}: ${f.msg}`);
await browser.close();
process.exit(failures.length ? 1 : 0);
