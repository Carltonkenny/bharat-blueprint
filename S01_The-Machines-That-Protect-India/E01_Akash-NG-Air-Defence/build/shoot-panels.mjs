// Dev check: open storyboard.html headless, report console errors and per-panel render time, save each panel as PNG.
// usage: node build/shoot-panels.mjs <outDir> [id,id,...]
import puppeteer from 'puppeteer-core';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = resolve(process.argv[2] || 'dist/panels');
const only = process.argv[3] ? process.argv[3].split(',') : null;
const exe = process.env.CHROME_PATH || 'C:/Users/user/.cache/puppeteer/chrome-headless-shell/win64-156.0.8078.47/chrome-headless-shell-win64/chrome-headless-shell.exe';
mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({ executablePath: exe, headless: 'shell', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
const t0 = Date.now();
await page.goto(pathToFileURL(resolve('storyboard.html')).href);
await page.waitForFunction('document.body.dataset.done === "1" || window.__err', { timeout: 180000 }).catch(() => errors.push('timeout waiting for panels'));
console.log('render total ms:', Date.now() - t0);
const ids = await page.$$eval('canvas', (c) => c.map((x) => x.id.replace('cv-', '')));
for (const id of ids) {
  if (only && !only.includes(id)) continue;
  const data = await page.evaluate((i) => document.getElementById('cv-' + i).toDataURL('image/png'), id);
  writeFileSync(join(out, id + '.png'), Buffer.from(data.split(',')[1], 'base64'));
}
console.log('panels:', ids.length, 'errors:', errors.length); errors.forEach((e) => console.log(e));
await browser.close();
