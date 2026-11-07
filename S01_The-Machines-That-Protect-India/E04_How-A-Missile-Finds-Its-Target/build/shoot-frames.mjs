// Dev check: load index.html, seek to times, save PNGs, time frames, and test determinism.
// usage: node build/shoot-frames.mjs <outDir> t1,t2,...
import puppeteer from 'puppeteer-core';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const out = resolve(process.argv[2] || 'dist/frames');
const times = (process.argv[3] || '0,10').split(',').map(Number);
const exe = process.env.CHROME_PATH || 'C:/Users/user/.cache/puppeteer/chrome-headless-shell/win64-156.0.8078.47/chrome-headless-shell-win64/chrome-headless-shell.exe';
mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: exe, headless: 'shell', args: ['--no-sandbox'] });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(pathToFileURL(resolve('index.html')).href);
await page.evaluate(() => document.fonts.ready);
const fonts = await page.evaluate(() => [...document.fonts].map((f) => f.family + ' ' + f.weight + ' ' + f.status));
console.log('fonts:', fonts.join(' | '));
const grab = (t) => page.evaluate((x) => { window.seek(x); return document.getElementById('c').toDataURL('image/png'); }, t);
const ms = [];
for (const t of times) {
  const s = Date.now(); const d = await grab(t); ms.push(Date.now() - s);
  writeFileSync(join(out, `t${String(t).replace('.', '_')}.png`), Buffer.from(d.split(',')[1], 'base64'));
}
console.log('ms/frame:', ms.join(','));
const h = (d) => createHash('sha1').update(d).digest('hex').slice(0, 12);
const a = h(await grab(times[0])), b = h(await grab(times[0]));
await grab(5); const c = h(await grab(times[0]));
console.log('determinism same t twice / after other t:', a === b, a === c);
console.log('errors:', errors.length); errors.forEach((e) => console.log(e));
await browser.close();
