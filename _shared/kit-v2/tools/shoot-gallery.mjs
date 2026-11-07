// kit-v2: shoot a gallery page: load it, report console errors, save a PNG and print
// whatever the page exposes in window.__gallery.
//   node tools/shoot-gallery.mjs <page.html> [--out <png>]
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { launch, openPage } from './chrome.mjs';

const args = process.argv.slice(2);
const page1 = resolve(args[0]);
const flag = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const out = resolve(flag('out', page1.replace(/\.html$/, '.png')));

const browser = await launch();
const { page, errors, warnings } = await openPage(browser, page1);
const info = await page.evaluate(() => window.__gallery || null);
const png = await page.screenshot({ type: 'png' });
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, png);
console.log('wrote', out);
if (info) console.log(JSON.stringify(info, null, 1));
if (errors.length) { console.log('ERRORS:'); errors.forEach((e) => console.log('  -', e)); }
else console.log('no page errors');
if (warnings.length) { console.log('WARNINGS:'); warnings.slice(0, 5).forEach((e) => console.log('  -', e)); }
await browser.close();
process.exit(errors.length ? 1 : 0);
