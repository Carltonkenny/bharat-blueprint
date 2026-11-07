// Contact sheets (3 x 4 frames each, 640 x 360 tiles) from a folder of PNGs, in beat order. usage: node build/contact.mjs dist/qc dist/sheets
import { execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const [src = 'dist/qc', out = 'dist/sheets'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const key = (f) => f.replace('.png', '').split('.').map((x) => (/^\d+$/.test(x) ? x.padStart(3, '0') : x)).join('.');
const files = readdirSync(src).filter((f) => f.endsWith('.png')).sort((a, b) => key(a).localeCompare(key(b)));
for (let i = 0, n = 1; i < files.length; i += 12, n++) {
  const g = files.slice(i, i + 12), args = [];
  g.forEach((f) => args.push('-i', join(src, f)));
  const sc = g.map((_, k) => `[${k}:v]scale=640:360[s${k}]`).join(';');
  const lay = g.map((_, k) => `${(k % 3) * 640}_${Math.floor(k / 3) * 360}`).join('|');
  const filt = g.length === 1 ? `${sc};[s0]null` : `${sc};${g.map((_, k) => `[s${k}]`).join('')}xstack=inputs=${g.length}:layout=${lay}`;
  execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args, '-filter_complex', filt, '-frames:v', '1', join(out, `sheet_${n}.png`)]);
  console.log(`sheet_${n}.png:`, g.map((f) => f.replace('.png', '')).join(' '));
}
