// kit-v2: shoot one frame at the mid-hold of every beat (or every Nth beat) so the film
// can be reviewed quickly.
//   node tools/look.mjs <episodeDir> [--every 3] [--out <dir>]
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { launch, openPage } from './chrome.mjs';

const args = process.argv.slice(2);
const dir = resolve(args[0]);
const flag = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const every = parseInt(flag('every', '3'), 10);
const outDir = resolve(flag('out', join(dir, 'qc', 'look')));
mkdirSync(outDir, { recursive: true });

const timeline = JSON.parse(readFileSync(join(dir, 'timing', 'timeline.json'), 'utf8'));
const picks = timeline.beats.filter((b, i) => i % every === 0).map((b) => ({ id: b.id, t: (b.t0 + b.t1) / 2 }));

const browser = await launch();
const { page, errors } = await openPage(browser, join(dir, 'index.html'));
for (const p of picks) {
  try {
    await page.evaluate((t) => window.seek(t), p.t);
    const png = await page.screenshot({ type: 'png' });
    writeFileSync(join(outDir, `${p.id}.png`), png);
  } catch (e) {
    console.log('FAILED at beat', p.id, 't=', p.t, ':', String(e.message).split('\n')[0]);
    break;
  }
}
console.log('wrote', picks.length, 'frames to', outDir);
if (errors.length) { console.log('ERRORS'); errors.slice(0, 5).forEach((e) => console.log(' ', e)); }
await browser.close();
