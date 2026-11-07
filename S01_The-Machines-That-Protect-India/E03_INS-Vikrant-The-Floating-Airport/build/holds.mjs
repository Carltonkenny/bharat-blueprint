// "Held" QA: for every beat, how long does the drawing sit finished (only the slow camera drift moving)? usage: node build/holds.mjs
import puppeteer from 'puppeteer-core';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const exe = 'C:/Users/user/.cache/puppeteer/chrome-headless-shell/win64-156.0.8078.47/chrome-headless-shell-win64/chrome-headless-shell.exe';
const b = await puppeteer.launch({ executablePath: exe, headless: 'shell', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.goto(pathToFileURL(resolve('index.html')).href);
await p.evaluate(() => document.fonts.ready);
const d = await p.evaluate(() => window.BEATS.map((x) => {
  const end = x.keys ? x.keys[x.keys.length - 1][0] : x.t0 - 0.2 + (x.t1 - x.t0) * x.frac;
  return { id: x.id, len: x.t1 - x.t0, hold: Math.max(0, x.t1 - end) };
}));
await b.close();
const total = d.reduce((s, x) => s + x.len, 0), held = d.reduce((s, x) => s + x.hold, 0);
console.log(`total ${total.toFixed(0)} s, finished-and-held ${held.toFixed(0)} s (${(100 * held / total).toFixed(0)}%)`);
console.log('longest holds:', d.sort((a, c) => c.hold - a.hold).slice(0, 8).map((x) => `${x.id} ${x.hold.toFixed(1)}s`).join(', '));
