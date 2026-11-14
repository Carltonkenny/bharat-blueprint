// kit-v2 round 2: compile an episode's authored beat sheet (src/beats.dsl.json) into the
// beats of episode.s2.json, regenerate glossary.json, then build the project.
//   node tools/compose-episode.mjs <episodeDir>
// A DSL beat: { id, p, w, tpl, k? (beat kind), sc?, cam?, camAz?, camEl?, camAmount?, camDist?, tr?, ...template params }
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const dir = resolve(process.argv[2] || '.');
const dsl = JSON.parse(readFileSync(join(dir, 'src', 'beats.dsl.json'), 'utf8'));
const ep = JSON.parse(readFileSync(join(dir, 'episode.s2.json'), 'utf8'));

const META = new Set(['id', 'p', 'w', 'k', 'sc', 'cam', 'camAz', 'camEl', 'camAmount', 'camDist', 'tr', 'trDur', 'notes']);
const WORLD_ONLY = new Set(['hero']);
const beats = [];
let tag = null;
for (const b of dsl) {
  if (b.sc) tag = b.sc;
  const params = {};
  for (const [k, v] of Object.entries(b)) if (!META.has(k)) params[k] = v;
  const layer = (b.tpl === 'hero' || b.hero) ? 'H' : b.tpl === 'figure' ? 'C' : 'B';
  const kind = b.k || (layer !== 'B' ? 'mech' : 'hold');
  const needsWorld = ['hero', 'flow', 'figure', 'number', 'timeline', 'grid', 'route', 'statement'].includes(b.tpl);
  const scene = [];
  if (needsWorld) scene.push(Object.assign({ op: 'cw' }, params));
  scene.push(Object.assign({ op: 'cs' }, params));
  const hasHero = b.tpl === 'hero' || !!b.hero;
  const cam = b.cam || (hasHero ? 'orbit' : 'hold');
  beats.push({
    id: b.id, p: b.p, w: b.w == null ? 1 : b.w, layer, kind, scene, labels: [], notes: b.notes || '',
    cam, camAz: b.camAz == null ? (hasHero ? 16 : undefined) : b.camAz, camEl: b.camEl == null ? (hasHero ? 5 : undefined) : b.camEl,
    camAmount: b.camAmount, camDist: b.camDist, tr: b.tr || 'fade', trDur: b.trDur, sceneTag: tag,
  });
}
ep.beats = beats;
writeFileSync(join(dir, 'episode.s2.json'), JSON.stringify(ep, null, 1));

// glossary: every word on screen (authored texts) plus the script words
const words = new Set();
const grab = (o) => {
  if (typeof o === 'string') { o.toUpperCase().split(/[^A-Z0-9']+/).filter(Boolean).forEach((w) => words.add(w)); }
  else if (Array.isArray(o)) o.forEach(grab);
  else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) if (!['tpl', 'kind', 'prop', 'pose', 'poseTo', 'col', 'side', 'layout', 'links', 'opts', 'rot', 'frame', 'cut', 'explode', 'propOpts'].includes(k)) grab(v);
};
dsl.forEach((b) => { grab(b); if (b.sc) grab(b.sc); });
(ep.passages || []).forEach((p) => grab(p.text || ''));
const gp = join(dir, 'glossary.json');
let g = {};
try { g = JSON.parse(readFileSync(gp, 'utf8')); } catch (e) { g = {}; }
words.forEach((w) => { g[w] = w; });
writeFileSync(gp, JSON.stringify(g, null, 1));

const r = spawnSync(process.execPath, [join(here, 'build-episode.mjs'), dir], { stdio: 'inherit' });
process.exit(r.status || 0);
