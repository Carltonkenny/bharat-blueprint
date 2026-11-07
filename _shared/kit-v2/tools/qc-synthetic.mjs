// kit-v2: QC v2, part 5: the synthetic-defect test. Each known defect must FAIL the
// right gate, and nothing else.
//
//   node tools/qc-synthetic.mjs
import { spawnSync, spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RENDER_ROOT } from './paths.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const KIT = resolve(here, '..');
const work = join(RENDER_ROOT, 'synthetic');
if (existsSync(work)) rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });

const results = [];
const ok = (name, pass, detail = '') => results.push({ name, pass: !!pass, detail });

function ffmpeg(args) {
  const r = spawnSync('ffmpeg', ['-nostdin', '-v', 'error', '-y', ...args], { encoding: 'utf8', maxBuffer: 1 << 26 });
  return { ok: r.status === 0, err: (r.stderr || '').toString() };
}
function run(cmd, args, cwd) {
  const r = spawnSync(process.execPath, [cmd, ...args], { cwd, encoding: 'utf8', maxBuffer: 1 << 26 });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

// ---------- a synthetic video with known defects ----------
const seg = join(work, 'seg');
mkdirSync(seg, { recursive: true });
const W = 320, H = 180;
const segs = [
  { name: '00-normal', args: ['-f', 'lavfi', '-i', `testsrc2=size=${W}x${H}:rate=30:d=1`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p'] },
  { name: '01-black', args: ['-f', 'lavfi', '-i', `color=c=black:size=${W}x${H}:rate=30:d=1`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p'] },
  { name: '02-frozen', args: ['-f', 'lavfi', '-i', `color=c=navy:size=${W}x${H}:rate=30:d=2`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p'] },
  { name: '03-blown', args: ['-f', 'lavfi', '-i', `color=c=white:size=${W}x${H}:rate=30:d=1`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p'] },
  // the flicker segment is built separately, below
];
// the flicker segment: a black frame and a white frame, repeated. Every step is a file
// level operation, so no filter quoting is involved.
const flick = join(seg, '04-flicker.mp4');
const flickDir = join(seg, 'flick');
mkdirSync(flickDir, { recursive: true });
const flickOk = ffmpeg(['-f', 'lavfi', '-i', 'color=c=black:size=' + W + 'x' + H + ':rate=1:d=1', '-frames:v', '1', join(flickDir, 'f00.png')]).ok
  && ffmpeg(['-f', 'lavfi', '-i', 'color=c=white:size=' + W + 'x' + H + ':rate=1:d=1', '-frames:v', '1', join(flickDir, 'f01.png')]).ok;
// 30 pngs, alternating, then one image2 sequence
for (let i = 0; i < 30; i++) {
  const col = (i % 2) ? 'white' : 'black';
  ffmpeg(['-f', 'lavfi', '-i', 'color=c=' + col + ':size=' + W + 'x' + H + ':rate=1:d=1', '-frames:v', '1', join(flickDir, 'g' + String(i).padStart(3, '0') + '.png')]);
}
const pngSizes = readdirSync(flickDir).filter((f) => f.startsWith('g')).map((f) => statSync(join(flickDir, f)).size);
const fr2 = ffmpeg(['-framerate', '30', '-i', join(flickDir, 'g%03d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', flick]);
ok('synthetic: the flicker segment is built', flickOk && fr2.ok, fr2.err.slice(0, 200) + ' png sizes: ' + pngSizes.slice(0, 6).join(','));

const made = segs.map((s) => {
  const f = join(seg, s.name + '.mp4');
  const r = ffmpeg([...s.args, f]);
  return { file: f, ok: r.ok };
});
made[4] = { file: flick, ok: existsSync(flick) };
ok('synthetic: every segment is built', made.every((m) => m.ok));
const listFile = join(seg, 'list.txt');
writeFileSync(listFile, made.map((m) => `file '${m.file.replace(/\\/g, '/')}'`).join('\n') + '\n');
const badVideo = join(work, 'bad.mp4');
const cat = ffmpeg(['-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', badVideo]);
ok('synthetic: the bad video is assembled', cat.ok, cat.err.slice(0, 200));

// ---------- run the frame gates on it ----------
const epDir = join(work, 'framebad');
mkdirSync(join(epDir, 'timing'), { recursive: true });
mkdirSync(join(epDir, 'qc'), { recursive: true });
writeFileSync(join(epDir, 'episode.s2.json'), JSON.stringify({ id: 'SYN', title: 'synthetic', world: 'ice', fps: 30, size: [W, H], passages: [{ id: 'P01', text: 'x', estSec: 5 }], beats: [{ id: '1.01', p: 'P01', w: 1, kind: 'mechanism' }] }));
writeFileSync(join(epDir, 'timing', 'timeline.json'), JSON.stringify({ duration: 5, bpm: 12, beats: [{ id: '1.01', p: 'P01', kind: 'mechanism', t0: 0, t1: 5, dur: 5, fx: [] }] }));
writeFileSync(join(epDir, 'qc', 'label-boxes.json'), '{}');

const fr = run(join(KIT, 'tools', 'qc-frames.mjs'), [epDir, badVideo]);
const frameFailures = [...fr.out.matchAll(/\b(F\d)\b/g)].map((m) => m[1]);
const gates = new Set(frameFailures);
ok('synthetic: the black frames fail F1', gates.has('F1'), fr.out.split('\n').slice(0, 6).join(' | '));
ok('synthetic: the frozen frames fail F2', gates.has('F2'), [...gates].join(','));
ok('synthetic: the duplicate frames fail F7', gates.has('F7'), [...gates].join(','));
ok('synthetic: the hard jump fails F3', gates.has('F3'), [...gates].join(','));
ok('synthetic: the flicker fails F4', gates.has('F4'), [...gates].join(','));
ok('synthetic: the blown segment fails F5', gates.has('F5'), [...gates].join(','));

// ---------- the scene-graph defects ----------
const sceneEp = join(work, 'scenebad');
mkdirSync(join(sceneEp, 'src', 'kit'), { recursive: true });
mkdirSync(join(sceneEp, 'timing'), { recursive: true });
mkdirSync(join(sceneEp, 'qc'), { recursive: true });
run(join(KIT, 'tools', 'sync-kit.mjs'), [sceneEp]);
writeFileSync(join(sceneEp, 'episode.s2.json'), JSON.stringify({
  id: 'SYN2', title: 'synthetic scene', world: 'ice', fps: 30, size: [1920, 1080],
  passages: [{ id: 'P01', text: 'x', estSec: 4 }],
  beats: [{ id: '1.01', p: 'P01', w: 1, kind: 'hold', scene: [] }, { id: '1.02', p: 'P01', w: 1, kind: 'hold', scene: [] }],
}));
writeFileSync(join(sceneEp, 'timing', 'timeline.json'), JSON.stringify({
  duration: 4, bpm: 30,
  beats: [
    { id: '1.01', p: 'P01', kind: 'hold', t0: 0, t1: 2, dur: 2, fx: [], scene: [{ op: 'x:bad' }] },
    { id: '1.02', p: 'P01', kind: 'hold', t0: 2, t1: 4, dur: 2, fx: [], scene: [{ op: 'x:small' }] },
  ],
}));
// two overlapping labels and one tiny label
writeFileSync(join(sceneEp, 'src', 'episode.js'), `
(function () {
  BB.customOps = BB.customOps || {};
  BB.customOps.bad = function (ctx, op, p) {
    const T = ctx.T;
    // two labels that overlap on purpose (QC B2)
    BB.draw.text(ctx.ctx, 'OVERLAPPING LABEL ONE', 700, 500, T.type.label, { id: 'B1' });
    BB.draw.text(ctx.ctx, 'OVERLAPPING LABEL TWO', 720, 520, T.type.label, { id: 'B2' });
  };
  BB.customOps.small = function (ctx, op, p) {
    // a label below the 2.0% cap-height floor (QC B3)
    BB.draw.text(ctx.ctx, 'TINY TEXT', 960, 500, 16, { id: 'B3' });
  };
})();
`);
// the episode's beats drive the bad content
const ep = JSON.parse(readFileSync(join(sceneEp, 'episode.s2.json'), 'utf8'));
ep.beats[0].scene = [{ op: 'x:bad' }];
ep.beats[1].scene = [{ op: 'x:small' }];
writeFileSync(join(sceneEp, 'episode.s2.json'), JSON.stringify(ep));
// build the page (the template loads src/episode.js)
const tpl = readFileSync(join(KIT, 'templates', 'index.template.html'), 'utf8');
writeFileSync(join(sceneEp, 'index.html'), tpl
  .replaceAll('{{TITLE}}', 'synthetic')
  .replaceAll('{{PAPER}}', '#0a2f5c')
  .replaceAll('{{W}}', '1920').replaceAll('{{H}}', '1080')
  .replaceAll('{{FPS}}', '30').replaceAll('{{DURATION}}', '4')
  .replaceAll('{{COMPOSITION_ID}}', 'synthetic'));
writeFileSync(join(sceneEp, 'episode-data.js'), 'window.EPISODE = ' + JSON.stringify({
  id: 'SYN2', title: 'synthetic', world: 'ice', size: [1920, 1080], fps: 30, seed: 'syn',
  timeline: JSON.parse(readFileSync(join(sceneEp, 'timing', 'timeline.json'), 'utf8')),
  glossary: {}, data: [], map: null,
}) + ';\n');
writeFileSync(join(sceneEp, 'qc', 'ledger-numbers.json'), '[]');

const sr = run(join(KIT, 'tools', 'qc-scene.mjs'), [sceneEp]);
const sceneGates = new Set([...sr.out.matchAll(/\b(B\d+)\b/g)].map((m) => m[1]));
ok('synthetic: the overlapping labels fail B2', sceneGates.has('B2'), [...sceneGates].join(','));
ok('synthetic: the tiny text fails B3', sceneGates.has('B3'), [...sceneGates].join(','));

// ---------- the report ----------
let bad = 0;
for (const r of results) { if (!r.pass) bad++; console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? '  [' + r.detail + ']' : ''}`); }
console.log('');
console.log('| defect | gate | result |');
console.log('|---|---|---|');
console.log('| black frames | F1 | ' + (gates.has('F1') ? 'FAIL (as expected)' : 'not detected') + ' |');
console.log('| frozen frames | F2 | ' + (gates.has('F2') ? 'FAIL (as expected)' : 'not detected') + ' |');
console.log('| duplicate frames | F7 | ' + (gates.has('F7') ? 'FAIL (as expected)' : 'not detected') + ' |');
console.log('| a hard jump | F3 | ' + (gates.has('F3') ? 'FAIL (as expected)' : 'not detected') + ' |');
console.log('| flicker | F4 | ' + (gates.has('F4') ? 'FAIL (as expected)' : 'not detected') + ' |');
console.log('| overexposed | F5 | ' + (gates.has('F5') ? 'FAIL (as expected)' : 'not detected') + ' |');
console.log('| overlapping labels | B2 | ' + (sceneGates.has('B2') ? 'FAIL (as expected)' : 'not detected') + ' |');
console.log('| tiny text | B3 | ' + (sceneGates.has('B3') ? 'FAIL (as expected)' : 'not detected') + ' |');
console.log(bad ? `${bad} failing` : 'all passing');
process.exit(bad ? 1 : 0);


