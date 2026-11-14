import { join, resolve } from 'node:path';
import { launch, openPage } from './chrome.mjs';
const dir = resolve(process.argv[2]);
const browser = await launch({ protocolTimeout: 20000 });
const { page } = await openPage(browser, join(dir, 'index.html'));
const out = await page.evaluate(() => {
  const b = BB.film.cfg.timeline.beats.find((x) => x.id === '5.03');
  return { beat: { cam: b.cam, camAz: b.camAz, camEl: b.camEl, camAmount: b.camAmount, camDist: b.camDist },
    f1: BB.camera.for3d('orbit', 0.5, { az: 20, el: 5 }),
    f2: BB.camera.for3d(b.cam, 0.5, { amount: b.camAmount, az: b.camAz, el: b.camEl, base: b.camDist }),
    src: BB.camera.for3d.toString().slice(0, 400) };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
