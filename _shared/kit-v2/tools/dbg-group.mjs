import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { launch, openPage } from './chrome.mjs';
const dir = resolve(process.argv[2]); const id = process.argv[3];
const tl = JSON.parse(readFileSync(join(dir, 'timing', 'timeline.json'), 'utf8'));
const beat = tl.beats.find((b) => b.id === id); const t = (beat.t0 + beat.t1) / 2;
const browser = await launch({ protocolTimeout: 30000 });
const { page } = await openPage(browser, join(dir, 'index.html'));
const out = await page.evaluate((bid, tt) => {
  window.seek(tt);
  const g = BB.stage.scene.children[0];
  const fit = BB.heroFit.get(bid + '|7') || BB.heroFit.get(bid + '|0');
  return { fit: fit && { s: fit.s, pos: fit.pos }, group: g && { pos: g.position.toArray(), rot: [g.rotation.x, g.rotation.y, g.rotation.z], scale: g.scale.toArray() },
    cam: BB.stage.camera.position.toArray(), cam3d: BB.currentCam3d, box: BB.heroBox[bid], kids: BB.stage.scene.children.length };
}, id, t);
console.log(JSON.stringify(out));
await browser.close();
