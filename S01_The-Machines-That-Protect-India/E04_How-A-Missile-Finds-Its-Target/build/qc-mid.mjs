// Mid-beat stills: the frame checks look at the end of a beat, but the motion happens in the middle. Saves PNGs at chosen fractions of each beat.
// usage: node build/qc-mid.mjs <outDir> <beatIds comma list | all> [fractions comma list = 0.25,0.5,0.75]
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
const [outDir = 'dist/mid', ids = 'all', fr = '0.25,0.5,0.75'] = process.argv.slice(2);
const exe = 'C:/Users/user/.cache/puppeteer/chrome-headless-shell/win64-156.0.8078.47/chrome-headless-shell-win64/chrome-headless-shell.exe';
mkdirSync(outDir, { recursive: true });
const b = await puppeteer.launch({ executablePath: exe, headless: 'shell', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 1280, height: 720 });
const errors = []; p.on('pageerror', (e) => errors.push(e.message));
await p.goto(pathToFileURL(resolve('index.html')).href);
await p.evaluate(() => document.fonts.ready);
const beats = await p.evaluate(() => window.BEATS.map(({ id, t0, t1 }) => ({ id, t0, t1 })));
const want = ids === 'all' ? beats : beats.filter((x) => ids.split(',').includes(x.id));
for (const x of want) for (const f of fr.split(',').map(Number)) {
  const t = x.t0 + (x.t1 - x.t0) * f;
  await p.evaluate((tt) => window.seek(tt), t);
  await (await p.$('#c')).screenshot({ path: join(outDir, `${x.id}_${String(Math.round(f * 100)).padStart(3, '0')}.png`) });
}
await b.close();
console.log('saved', want.length * fr.split(',').length, 'stills; page errors:', errors.length, errors.slice(0, 3).join(' | '));
