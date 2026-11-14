import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { launch, openPage } from './chrome.mjs';
const dir = resolve(process.argv[2]); const id = process.argv[3];
const tl = JSON.parse(readFileSync(join(dir, 'timing', 'timeline.json'), 'utf8'));
const beat = tl.beats.find((b) => b.id === id); const t = (beat.t0 + beat.t1) / 2;
const browser = await launch({ protocolTimeout: 20000 });
const { page } = await openPage(browser, join(dir, 'index.html'));
const out = await page.evaluate((bid, tt) => {
  const b = BB.film.cfg.timeline.beats.find((x) => x.id === bid);
  b.scene.forEach((o) => { delete o.callouts; });
  window.seek(tt);
  return BB.heroFit.get(bid + '|0') || BB.heroFit.get(bid + '|7');
}, id, t);
console.log(JSON.stringify(out));
await browser.close();
