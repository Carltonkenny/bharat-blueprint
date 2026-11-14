// kit-v2: fast contact sheets with no video render. Screenshots every beat in the page at
// mid-hold (and, with --end, at end-of-hold), then tiles them 5x3 with ffmpeg.
//   node tools/shoot-beats.mjs <episodeDir> <outDir> [--end] [--only 1.03,2.04]
import { readFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { launch, openPage } from './chrome.mjs';

const dir = resolve(process.argv[2]);
const out = resolve(process.argv[3]);
const wantEnd = process.argv.includes('--end');
const oi = process.argv.indexOf('--only');
const only = oi > 0 ? process.argv[oi + 1].split(',') : null;
const tl = JSON.parse(readFileSync(join(dir, 'timing', 'timeline.json'), 'utf8'));
const tmp = join(out, '_f');
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
const browser = await launch({ protocolTimeout: 120000 });
const { page, errors } = await openPage(browser, join(dir, 'index.html'));
const beats = tl.beats.filter((b) => !only || only.includes(b.id));
const files = [];
for (let i = 0; i < beats.length; i++) {
  const b = beats[i];
  const t = wantEnd ? b.t1 - 0.4 : (b.t0 + b.t1) / 2;
  await page.evaluate((tt) => { window.seek(tt); }, t);
  const f = join(tmp, String(i).padStart(3, '0') + '.jpg');
  await page.screenshot({ path: f, type: 'jpeg', quality: 72 });
  files.push(f);
}
await browser.close();
const per = 15;
const tag = wantEnd ? 'end' : 'mid';
for (let k = 0; k * per < files.length; k++) {
  const list = join(tmp, `list${k}.txt`);
  const part = files.slice(k * per, (k + 1) * per);
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...part.flatMap((f) => ['-i', f]), '-filter_complex',
    part.map((_, i) => `[${i}:v]scale=384:-1[s${i}]`).join(';') + ';' + part.map((_, i) => `[s${i}]`).join('') + `xstack=inputs=${part.length}:layout=` +
    part.map((_, i) => `${(i % 5) * 384}_${Math.floor(i / 5) * 216}`).join('|'),
    '-frames:v', '1', join(out, `${tag}_${String(k + 1).padStart(2, '0')}.png`)], { encoding: 'utf8' });
  if (r.status) console.error(r.stderr.slice(0, 300));
}
console.log(`sheets: ${Math.ceil(files.length / per)} (${tag}); page errors: ${errors.length}`, errors.slice(0, 3));
