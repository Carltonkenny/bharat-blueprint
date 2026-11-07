// kit-v2: a tiny debug helper. Load a composition, seek to a time and print the scene
// report. usage: node tools/dbg-scene.mjs <projectDir> <t>
import { join, resolve } from 'node:path';
import { launch, openPage } from './chrome.mjs';

const dir = resolve(process.argv[2]);
const t = Number(process.argv[3] || 0);
const evalIdx = process.argv.indexOf('--eval');
const snippet = evalIdx >= 0 ? process.argv[evalIdx + 1] : null;
const browser = await launch();
const { page, errors } = await openPage(browser, join(dir, 'index.html'));
if (snippet) {
  const r = await page.evaluate((s) => {
    // eslint-disable-next-line no-new-func
    return new Function('return (' + s + ')()')();
  }, snippet);
  console.log(JSON.stringify(r, null, 1));
  await browser.close();
  process.exit(0);
}
const out = await page.evaluate((tt) => {
  window.seek(tt);
  const r = window.__sceneReport(tt);
  return {
    t: r.t, beat: r.beat, n: r.items.length,
    items: r.items.map((i) => ({ k: i.kind, t: i.text, x0: Math.round(i.x0), y0: Math.round(i.y0), x1: Math.round(i.x1), y1: Math.round(i.y1), o: i.opacity })),
  };
}, t);
console.log(JSON.stringify(out, null, 1));
if (errors.length) console.log('errors:', errors);
await browser.close();
