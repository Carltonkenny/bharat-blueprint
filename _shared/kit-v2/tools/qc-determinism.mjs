// kit-v2: SSIM between two videos, frame by frame (QC B14 determinism).
// Decodes both files to 320x180 luma with ffmpeg and computes the mean SSIM of an
// 8x8 uniform window, the same approximation scikit-image uses in "uniform" mode.
//
//   node tools/qc-determinism.mjs <videoA> <videoB> [--csv <out.csv>] [--json <out.json>]
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const args = process.argv.slice(2);
const A = args[0], B = args[1];
if (!A || !B) { console.error('usage: node tools/qc-determinism.mjs <videoA> <videoB>'); process.exit(2); }
const flag = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const W = 320, H = 180;

function decode(path) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', path, '-f', 'rawvideo', '-pix_fmt', 'gray', '-s', `${W}x${H}`, '-'], { maxBuffer: 1024 * 1024 * 1024 });
  if (r.status !== 0) throw new Error('ffmpeg failed on ' + path + ': ' + (r.stderr || '').toString().slice(0, 400));
  const buf = r.stdout;
  const size = W * H;
  const frames = [];
  for (let i = 0; i + size <= buf.length; i += size) frames.push(buf.subarray(i, i + size));
  return frames;
}

const C1 = (0.01 * 255) ** 2, C2 = (0.03 * 255) ** 2;

function ssimFrame(a, b, w, h) {
  const win = 8;
  let total = 0, count = 0;
  const sx = new Float64Array(w * h), sy = new Float64Array(w * h), sxy = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) { const x = a[i], y = b[i]; sx[i] = x; sy[i] = y; sxy[i] = x * y; }
  for (let y = 0; y + win <= h; y += 4) {
    for (let x = 0; x + win <= w; x += 4) {
      let mx = 0, my = 0, mxy = 0, mxx = 0, myy = 0, n = 0;
      for (let j = y; j < y + win; j++) {
        for (let i = x; i < x + win; i++) {
          const k = j * w + i;
          mx += sx[k]; my += sy[k]; mxy += sxy[k]; mxx += sx[k] * sx[k]; myy += sy[k] * sy[k]; n++;
        }
      }
      mx /= n; my /= n;
      const vx = mxx / n - mx * mx, vy = myy / n - my * my;
      const vxy = mxy / n - mx * my;
      const s = ((2 * mx * my + C1) * (2 * vxy + C2)) / ((mx * mx + my * my + C1) * (vx + vy + C2));
      total += s; count++;
    }
  }
  return count ? total / count : 1;
}

const fa = decode(A), fb = decode(B);
const n = Math.min(fa.length, fb.length);
const rows = [['frame', 'ssim']];
let min = 1, sum = 0, below = 0;
for (let i = 0; i < n; i++) {
  const s = ssimFrame(fa[i], fb[i], W, H);
  rows.push([i, s.toFixed(6)]);
  if (s < min) min = s;
  sum += s;
  if (s < 0.999) below++;
}
const mean = n ? sum / n : 1;
const csv = resolve(flag('csv', 'determinism.csv'));
mkdirSync(dirname(csv), { recursive: true });
writeFileSync(csv, rows.map((r) => r.join(',')).join('\n') + '\n');
const out = { a: A, b: B, framesA: fa.length, framesB: fb.length, compared: n, meanSsim: +mean.toFixed(6), minSsim: +min.toFixed(6), framesBelow0999: below, pass: min >= 0.999 };
const jsonPath = resolve(flag('json', 'determinism.json'));
writeFileSync(jsonPath, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
process.exit(out.pass ? 0 : 1);

