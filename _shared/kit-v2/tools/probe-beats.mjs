// kit-v2: probe every beat for slow or failing frames (finds the beat that hangs a render).
//   node tools/probe-beats.mjs <episodeDir> [--limit <ms>]
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { launch, openPage } from './chrome.mjs';

const dir = resolve(process.argv[2]);
const li = process.argv.indexOf('--limit');
const limit = li > 0 ? +process.argv[li + 1] : 2500;
const tl = JSON.parse(readFileSync(join(dir, 'timing', 'timeline.json'), 'utf8'));
const browser = await launch({ protocolTimeout: 120000 });
const { page, errors } = await openPage(browser, join(dir, 'index.html'));
const slow = [];
let total = 0;
for (const b of tl.beats) {
  for (const u of [0.5]) {
    const t = b.t0 + (b.t1 - b.t0) * u;
    const t0 = Date.now();
    try { await page.evaluate((tt) => { window.seek(tt); }, t); }
    catch (e) { slow.push({ id: b.id, t: +t.toFixed(2), ms: 'ERROR ' + String(e.message).slice(0, 80) }); continue; }
    const ms = Date.now() - t0;
    total += ms;
    console.log(b.id, b.scene[b.scene.length-1].tpl, ms + ' ms');
    if (ms > limit) slow.push({ id: b.id, t: +t.toFixed(2), ms });
  }
}
console.log('beats', tl.beats.length, 'total ms', total, 'avg per frame', Math.round(total / (tl.beats.length * 4)));
console.log('slow/failed frames:', JSON.stringify(slow));
console.log('page errors:', errors.slice(0, 8));
await browser.close();
