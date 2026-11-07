// kit-v2: S2-T0 measurement matrix. Renders the spike under several configurations and
// records wall time, output size and the peak VRAM seen by nvidia-smi.
//
//   node tools/measure-spike.mjs <spikeDir> [--out <json>]
import { spawn, spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { HYPERFRAMES_BIN, RENDER_ROOT } from './paths.mjs';

const args = process.argv.slice(2);
const spike = resolve(args[0]);
const flag = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const outFile = resolve(flag('out', join(RENDER_ROOT, 'spike', 'measure.json')));
const outDir = join(RENDER_ROOT, 'spike');
mkdirSync(outDir, { recursive: true });

function gpuMem() {
  const r = spawnSync('nvidia-smi', ['--query-gpu=memory.used', '--format=csv,noheader,nounits'], { encoding: 'utf8' });
  const n = parseInt((r.stdout || '0').trim(), 10);
  return isNaN(n) ? 0 : n;
}

function render(cfg) {
  return new Promise((resolveP) => {
    const a = ['render', spike, '-o', cfg.out, '-q', cfg.q || 'draft'];
    if (cfg.browserGpu === false) a.push('--no-browser-gpu'); else a.push('--browser-gpu');
    if (cfg.gpuEncode) a.push('--gpu');
    if (cfg.workers) a.push('-w', String(cfg.workers));
    a.push('--quiet');
    const t0 = Date.now();
    const p = spawn(process.execPath, [HYPERFRAMES_BIN, ...a], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    p.stdout.on('data', (d) => { out += d.toString(); });
    p.stderr.on('data', (d) => { out += d.toString(); });
    let peak = 0;
    const poll = setInterval(() => { const m = gpuMem(); if (m > peak) peak = m; }, 200);
    p.on('close', (code) => {
      clearInterval(poll);
      const m = gpuMem(); if (m > peak) peak = m;
      resolveP({ ...cfg, seconds: +((Date.now() - t0) / 1000).toFixed(1), exit: code, peakVramMB: peak, ok: code === 0 && existsSync(cfg.out), tail: out.slice(-400) });
    });
  });
}

const results = [];
const base = (name, extra) => ({ name, out: join(outDir, name + '.mp4'), q: 'draft', workers: 2, browserGpu: true, ...extra });

// 1920x1080
for (const w of [1, 2, 3, 4]) results.push(await render(base(`1080p-w${w}`, { workers: w })));
results.push(await render(base('1080p-w2-software', { browserGpu: false })));
results.push(await render(base('1080p-w2-gpuencode', { gpuEncode: true })));
results.push(await render(base('1080p-w4-gpuencode', { workers: 4, gpuEncode: true })));

// 1280x720
const p720 = spike.replace(/spike/g, 'spike720');
if (existsSync(p720)) {
  for (const w of [1, 2, 3, 4]) results.push(await render(base(`720p-w${w}`, { workers: w, out: join(outDir, `720p-w${w}.mp4`) })));
  results.push(await render(base('720p-w2-gpuencode', { gpuEncode: true })));
} else {
  results.push({ name: '720p', skipped: 'no spike720 project' });
}

writeFileSync(outFile, JSON.stringify(results, null, 2));
console.log('name                     ok    seconds  s/frame  peakVRAM');
for (const r of results) {
  if (r.skipped) { console.log(`${r.name} skipped: ${r.skipped}`); continue; }
  const frames = 324;
  console.log(`${r.name.padEnd(24)} ${r.ok ? 'yes' : 'NO '}  ${String(r.seconds).padStart(6)}  ${(r.seconds * 1000 / frames / 1000).toFixed(3).padStart(7)}  ${String(r.peakVramMB).padStart(6)} MB`);
}
console.log('written', outFile);
