// kit-v2 / S03: shared authoring helpers. An episode's src/author.mjs imports this and writes
// src/beats.dsl.json + episode.s2.json. Rules learned on E01/E02 are built in:
//   hero beats orbit (camAz 22); beats with callouts use camAz 9 (labels anchor to a reference box);
//   statements without a hero get the episode's default hero and a CONCEPTUAL tag;
//   numbers go on `number` beats (size 150, source chip); words, not digits, elsewhere.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export function authorKit(dir, cfg) {
  const md = readFileSync(join(dir, 'passages.md'), 'utf8');
  const parts = md.split(/^### (P\d+)\s*$/m);
  const passages = [];
  for (let i = 1; i < parts.length; i += 2) {
    const text = parts[i + 1].trim().replace(/\s*\n\s*/g, ' ');
    const words = (text.match(/[A-Za-z0-9'’-]+/g) || []).length;
    passages.push({ id: parts[i], text, estSec: Math.round((words / 2.42) * 10) / 10, flag: /^a fictional/i.test(text) ? 'FICTIONAL SCENARIO' : '', words });
  }
  const B = [];
  let n = 0, scene = 0;
  const add = (p, o) => { const sc = +p.slice(1); if (sc !== scene) { scene = sc; n = 0; } n += 1; const sparse = ['flow', 'number', 'timeline', 'route'].includes(o.tpl); const b = Object.assign({ id: `${sc}.${String(n).padStart(2, '0')}`, p, w: 1 }, o); if (sparse) b.w = Math.min(b.w, o.tpl === 'flow' ? 0.62 : 0.72); else if (o.tpl === 'hero' && o.w == null) b.w = 1.6; B.push(b); };
  const TAG = 'CONCEPTUAL, NOT TO SCALE';
  const hero = (p, kind, opts, title, extra) => add(p, Object.assign({ tpl: 'hero', kind, opts, title, tag: TAG, camAz: 55 }, extra, extra && extra.callouts ? { camAz: 14 } : {}));
  const stmt = (p, lines, extra) => {
    const e = Object.assign({}, extra);
    if (!e.hero && !(e.size >= 100)) { e.hero = cfg.hero; e.heroOpts = cfg.heroOpts || {}; e.camAz = 55; e.hframe = [900, 230, 1840, 920]; delete e.align; if (e.size > 64) e.size = 64; }
    if (e.hero && !e.tag) e.tag = TAG;
    add(p, Object.assign({ tpl: 'statement', lines, size: 70 }, e));
  };
  const flow = (p, title, nodes, links, extra) => add(p, Object.assign({ tpl: 'flow', title, nodes, links: links || 'chain', layout: 'row' }, extra));
  const num = (p, title, value, unit, note, source, extra) => add(p, Object.assign({ tpl: 'number', k: 'number', title, value, unit, note, size: 150, source }, extra));
  const timeline = (p, title, items, extra) => add(p, Object.assign({ tpl: 'timeline', title, items }, extra));
  const finish = () => {
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src', 'beats.dsl.json'), JSON.stringify(B, null, 1));
    writeFileSync(join(dir, 'episode.s2.json'), JSON.stringify({ id: cfg.id, title: cfg.title, seriesTitle: 'INDIA MEGAPROJECTS', world: cfg.world || 'strata', fps: 30, seed: cfg.seed, passages, beats: [] }, null, 1));
    writeFileSync(join(dir, 'src', 'camera.json'), '{}\n');
    writeFileSync(join(dir, 'src', 'episode.js'), '// uses only kit templates; no custom ops.\n(function () { const BB = window.BB; BB.customOps = BB.customOps || {}; })();\n');
    console.log('beats', B.length, 'passages', passages.length, 'est voice s', passages.reduce((s, p) => s + p.estSec, 0).toFixed(1));
  };
  return { add, hero, stmt, flow, num, timeline, finish, B };
}
