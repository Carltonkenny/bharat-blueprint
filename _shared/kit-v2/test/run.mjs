// kit-v2: unit tests (Node). Run: node _shared/kit-v2/test/run.mjs
// Prints "all passing" when every check passes.
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, '..', 'src');

const BROWSER_FILES = ['prng.js', 'tokens.js', 'scenereport.js', 'draw.js', 'labels.js', 'fx.js', 'camera.js', 'panels.js', 'props.js', 'figures.js'];

function loadKit() {
  const sandbox = {
    console, Math, JSON, Date, Array, Object, String, Number, Boolean, Error, isFinite, parseInt, parseFloat,
    ArrayBuffer, Float32Array, Float64Array, Uint8Array, Uint32Array, Int32Array, Int16Array, Uint16Array,
    setTimeout, clearTimeout, setInterval, clearInterval,
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  for (const f of BROWSER_FILES) {
    vm.runInContext(readFileSync(join(SRC, f), 'utf8'), sandbox, { filename: f });
  }
  return sandbox;
}

const results = [];
const ok = (name, pass, detail = '') => results.push({ name, pass: !!pass, detail });

const K = loadKit();
const BB = K.BB;

// ---------- tokens ----------
{
  const T = BB.tokens('ice', 1920, 1080);
  ok('tokens: world palette has paper, ink and an accent', !!T.paper && !!T.ink && !!T.accent);
  ok('tokens: stroke widths are hairline 1, line 2, heavy 3.5 at 1080p', T.hair === 1 && T.line === 2 && T.heavy === 3.5,
    `${T.hair}/${T.line}/${T.heavy}`);
  const T720 = BB.tokens('ice', 1280, 720);
  ok('tokens: strokes scale with the frame', T720.line < T.line, `${T720.line} < ${T.line}`);
  const worlds = ['ice', 'network', 'orbit', 'graphite', 'cleanroom', 'strata'];
  ok('tokens: every S02 world has a palette', worlds.every((w) => !!BB.tokens(w, 1920, 1080).paper));
  ok('tokens: type scale keeps every size at or above 2.0% of the frame height',
    Object.values(T.type).every((s) => (s * 0.68) / 1080 >= 0.02 - 1e-9),
    Object.values(T.type).map((s) => ((s * 0.68) / 1080).toFixed(4)).join(' '));
  const z = T.zone('SAFE');
  ok('tokens: the safe zone matches CAMERA_AND_ZONES_S02.md', z.x0 === 96 && z.x1 === 1824 && z.y0 === 64.8 && Math.abs(z.y1 - 1015.2) < 0.01,
    JSON.stringify(z));
}

// ---------- labels ----------
{
  ok('labels: dwell is 0.4 s plus 0.3 s per word', Math.abs(BB.labels.dwell('ONE') - 0.7) < 1e-9 && Math.abs(BB.labels.dwell('A B C') - 1.3) < 1e-9,
    `${BB.labels.dwell('ONE')} ${BB.labels.dwell('A B C')}`);
  const a = { x0: 0, y0: 0, x1: 100, y1: 20 };
  const b = { x0: 90, y0: 0, x1: 190, y1: 20 };
  const c = { x0: 300, y0: 0, x1: 400, y1: 20 };
  ok('labels: a deliberate overlap is detected', BB.labels.overlaps(a, b) > 0.02, String(BB.labels.overlaps(a, b)));
  ok('labels: separate boxes do not overlap', BB.labels.overlaps(a, c) === 0);
  const g = BB.labels.buildGlossary(['Final Push', 'OWN OXYGEN']);
  ok('labels: the glossary check accepts a known word', BB.labels.checkGlossary('FINAL PUSH', g).length === 0);
  const unknown = BB.labels.checkGlossary('FINAL WIDGET', g);
  ok('labels: the glossary check rejects an unknown word', unknown.length === 1 && unknown[0] === 'widget', unknown.join(','));
}

// ---------- seeded randomness ----------
{
  const a = BB.mulberry32(42), b = BB.mulberry32(42), c = BB.mulberry32(43);
  const seqA = [], seqB = [], seqC = [];
  for (let i = 0; i < 64; i++) { seqA.push(a()); seqB.push(b()); seqC.push(c()); }
  ok('prng: the same seed gives the same sequence', seqA.every((v, i) => v === seqB[i]));
  ok('prng: a different seed gives a different sequence', seqA.some((v, i) => v !== seqC[i]));
  ok('prng: values stay inside [0,1)', seqA.every((v) => v >= 0 && v < 1));
  ok('prng: a string seed is hashed stably', BB.mulberry32('E01')[0] === BB.mulberry32('E01')[0]);
}

// ---------- camera ----------
{
  const push = BB.camera.for('push-in', 1, { amount: 0.18 });
  ok('camera: a push-in scales up', push.scale > 1, String(push.scale));
  const pull = BB.camera.for('pull-back', 1, { amount: 0.18 });
  ok('camera: a pull-back ends at the normal framing and starts close', Math.abs(pull.scale - 1) < 1e-9 && BB.camera.for('pull-back', 0, { amount: 0.18 }).scale > 1, String(pull.scale));
  const orbit = BB.camera.for('orbit', 1, { az: 30, el: 8 });
  ok('camera: an orbit turns the azimuth and elevation', Math.abs(orbit.az - Math.PI / 6) < 1e-9 && Math.abs(orbit.el - 8 * Math.PI / 180) < 1e-9);
  ok('camera: a hold does not move', BB.camera.for('hold', 1).scale === 1);
  const par = BB.camera.for('parallax', 1, { amount: 0.03 });
  ok('camera: parallax layers move at 0.3 / 0.7 / 1.0', Math.abs(par.parallax.bg / par.parallax.fg - 0.3) < 1e-9 && Math.abs(par.parallax.mg / par.parallax.fg - 0.7) < 1e-9);
}

// ---------- effects ----------
{
  const p = BB.fx.drawOn(1.5, 0.5, 1.0);
  ok('fx: draw-on progress reaches 1 at the end', p === 1);
  ok('fx: draw-on progress is 0 before the start', BB.fx.drawOn(0.1, 0.5, 1.0) === 0);
  ok('fx: the counter ends exactly on the value', BB.fx.counter(22, 10, 0, 2, { decimals: 0 }) === '22');
  ok('fx: the counter is below the value mid-animation', Number(BB.fx.counter(22, 0.5, 0, 2, { decimals: 0 })) < 22);
}

// ---------- figures: limb lengths must not change across a pose sweep ----------
{
  const limbLengths = (j) => {
    const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    return [
      d(j.torso, j.armL), d(j.armL, j.elbowL), d(j.elbowL, j.handL),
      d(j.torso, j.armR), d(j.armR, j.elbowR), d(j.elbowR, j.handR),
      d(j.hip, j.kneeL), d(j.kneeL, j.footL), d(j.hip, j.kneeR), d(j.kneeR, j.footR),
      d(j.hip, j.torso),
    ];
  };
  const names = Object.keys(BB.figure.POSES);
  const ref = limbLengths(BB.figure.build(BB.figure.POSES.stand));
  let worst = 0, worstName = '';
  for (const n of names) {
    const L = limbLengths(BB.figure.build(BB.figure.POSES[n]));
    for (let i = 0; i < ref.length; i++) {
      const d = Math.abs(L[i] - ref[i]);
      if (d > worst) { worst = d; worstName = n; }
    }
  }
  ok('figure: limb lengths are constant to 0.1 px across every pose', worst < 0.1, `worst ${worst.toFixed(6)} px in ${worstName}`);
  // a blend must not change the limb lengths either
  const blended = BB.figure.blend(BB.figure.POSES.stand, BB.figure.POSES.reach, 0.5);
  const bl = limbLengths(blended);
  const drift = Math.max(...bl.map((v, i) => Math.abs(v - ref[i])));
  ok('figure: a blended pose keeps the limb lengths', drift < 0.1, `drift ${drift.toFixed(6)} px`);
  ok('figure: there are ten named poses', names.length >= 10, String(names.length));
  ok('figure: the rig has seven joints', ['head', 'torso', 'armL', 'elbowL', 'handL', 'armR', 'elbowR', 'handR', 'hip', 'kneeL', 'footL', 'kneeR', 'footR'].every((k) => BB.figure.build(BB.figure.POSES.stand)[k] != null));
  const st = BB.figure.build(BB.figure.POSES.stand);
  const height = st.head.y + st.head.r - Math.min(st.footL.y, st.footR.y);
  const shoulderW = Math.abs(st.armR.x - st.armL.x);
  ok('figure: the pictogram body is about 1.8 head widths wide', Math.abs(shoulderW / (st.head.r * 2) - 1.8) < 0.05,
    `${(shoulderW / (st.head.r * 2)).toFixed(2)} head widths, ${height.toFixed(0)} units tall`);
}

// ---------- the beat engine ----------
{
  const { buildTimeline } = await import('../engine/beats.mjs');
  const ep = {
    passages: [{ id: 'P01', estSec: 15 }],
    beats: [
      { id: '1.1', p: 'P01', w: 0.5, kind: 'hold' },
      { id: '1.2', p: 'P01', w: 0.25, kind: 'mechanism' },
      { id: '1.3', p: 'P01', w: 0.25, kind: 'hold' },
    ],
  };
  const tl = buildTimeline(ep, { P01: 15 });
  ok('beats: the passage duration is the sum of the beats', Math.abs(tl.beats.reduce((s, b) => s + b.dur, 0) - 15) < 0.01);
  ok('beats: the lead-in is applied', tl.beats[0].t0 === 0.8);
  ok('beats: the clamp report is empty when no beat is out of range', tl.clampReport.length === 0, JSON.stringify(tl.clampReport));
  const ep2 = {
    passages: [{ id: 'P01', estSec: 30 }],
    beats: [{ id: '1.1', p: 'P01', w: 0.99, kind: 'hold' }, { id: '1.2', p: 'P01', w: 0.01, kind: 'hold' }],
  };
  const tl2 = buildTimeline(ep2, { P01: 30 });
  ok('beats: an over-long beat is clamped and reported', tl2.clampReport.length > 0, JSON.stringify(tl2.clampReport));
  ok('beats: every clamped beat lands inside the B8 window', tl2.beats.every((b) => b.dur >= 1.2 - 1e-6 && b.dur <= 8 + 1e-6), tl2.beats.map((b) => b.dur).join(','));
}

// ---------- the scene report ----------
{
  const rep = K.BB.report;
  rep.begin(1.5, '9.9');
  rep.add({ kind: 'text', text: 'ONE', x0: 10, y0: 20, x1: 90, y1: 44, color: '#fff', opacity: 1 });
  const items = rep.items();
  ok('scene report: items are collected with their box', items.length === 1 && items[0].x0 === 10 && items[0].w === 80);
  ok('scene report: the beat id is attached', items[0].beat === '9.9');
  rep.begin(2.0, '10.1');
  ok('scene report: a new frame clears the previous items', rep.items().length === 0);
}

// ---------- report ----------
let bad = 0;
for (const r of results) {
  if (!r.pass) bad++;
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? '  [' + r.detail + ']' : ''}`);
}
console.log(bad ? `${bad} failing` : 'all passing');
process.exit(bad ? 1 : 0);

