// kit-v2: patch the pinned local HyperFrames install so the render browser selects the
// discrete GPU per process, with no system setting changed.
//
// Why: HyperFrames launches Chrome with "--use-gl=angle --use-angle=d3d11" on Windows.
// Chrome then picks the integrated GPU (Intel Iris Xe) unless the app is registered in
// Windows Graphics settings, which is a system setting we must not change. Adding
// "--force_high_performance_gpu" makes the same Chrome binary choose the RTX 3050 for
// this process only.
//
// The patch is applied to our own pinned dependency copy under RENDER_ROOT and is
// idempotent. Re-run tools/install-deps.mjs to get the stock package back.
//
//   node tools/patch-hyperframes-gpu.mjs [--revert]
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DEPS_ROOT } from './paths.mjs';

const revert = process.argv.includes('--revert');
const dist = join(DEPS_ROOT, 'hyperframes', 'dist');
const STOCK = 'return ["--use-gl=angle", "--use-angle=d3d11", "--enable-gpu-rasterization"];';
const PATCHED = 'return ["--use-gl=angle", "--use-angle=d3d11", "--enable-gpu-rasterization", "--force_high_performance_gpu", "--disable-accelerated-2d-canvas"];';
const PATCHED_V1 = 'return ["--use-gl=angle", "--use-angle=d3d11", "--enable-gpu-rasterization", "--force_high_performance_gpu"];';

let patched = 0, scanned = 0;
for (const f of readdirSync(dist)) {
  if (!f.endsWith('.js')) continue;
  const p = join(dist, f);
  const src = readFileSync(p, 'utf8');
  scanned++;
  if (revert) {
    let s = src;
    if (s.includes(PATCHED)) { s = s.split(PATCHED).join(STOCK); patched++; }
    else if (s.includes(PATCHED_V1)) { s = s.split(PATCHED_V1).join(STOCK); patched++; }
    if (s !== src) writeFileSync(p, s);
  } else if (src.includes(STOCK)) {
    writeFileSync(p, src.split(STOCK).join(PATCHED));
    patched++;
  }
}
console.log(revert ? `reverted ${patched} file(s)` : `patched ${patched} file(s) of ${scanned} scanned`);
if (!revert && patched === 0) {
  console.log('note: nothing to patch (already patched, or the stock file shape changed)');
}
