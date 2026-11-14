// kit-v2: find what makes one beat hang the page, by editing the beat in the page and seeking.
//   node tools/bisect-beat.mjs <episodeDir> <beatId>
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { launch, openPage } from './chrome.mjs';

const dir = resolve(process.argv[2]);
const id = process.argv[3];
const tl = JSON.parse(readFileSync(join(dir, 'timing', 'timeline.json'), 'utf8'));
const beat = tl.beats.find((b) => b.id === id);
const t = (beat.t0 + beat.t1) / 2;
const variants = {
  original: () => {},
  noCallouts: (b) => { b.scene.forEach((o) => { delete o.callouts; }); },
  noFlame: (b) => { b.scene.forEach((o) => { if (o.opts) delete o.opts; }); },
  noCamera: (b) => { b.cam = 'hold'; },
  noScreenOp: (b) => { b.scene = b.scene.filter((o) => o.op !== 'cs'); },
  noWorldOp: (b) => { b.scene = b.scene.filter((o) => o.op !== 'cw'); },
};
for (const [name, fn] of Object.entries(variants)) {
  const browser = await launch({ protocolTimeout: 9000 });
  const { page } = await openPage(browser, join(dir, 'index.html'));
  const t0 = Date.now();
  let res;
  try {
    await page.evaluate((bid, src) => {
      const b = BB.film.cfg.timeline.beats.find((x) => x.id === bid);
      new Function('b', src)(b);
    }, id, '(' + fn.toString() + ')(b)');
    await page.evaluate((tt) => { window.seek(tt); return 1; }, t);
    res = 'ok ' + (Date.now() - t0) + ' ms';
  } catch (e) { res = 'HANG/ERROR ' + String(e.message).slice(0, 60); }
  console.log(name.padEnd(12), res);
  try { await browser.close(); } catch (e) { /* ignore */ }
}
