// kit-v2: smoke test. Load a composition from file://, report console errors and the
// WebGL renderer string, and write one screenshot per named time.
//   node tools/smoke.mjs <projectDir> [--times 1.5,5,7.5,9] [--out <dir>]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { launch, openPage } from './chrome.mjs';

const args = process.argv.slice(2);
const dir = resolve(args[0]);
if (!args[0]) { console.error('usage: node tools/smoke.mjs <projectDir>'); process.exit(2); }
const flag = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const times = flag('times', '1.5,5,7.5,9').split(',').map(Number);
const outDir = resolve(flag('out', join(dir, 'qc', 'smoke')));

mkdirSync(outDir, { recursive: true });
const browser = await launch();
const { page, errors, warnings } = await openPage(browser, join(dir, 'index.html'));

const info = await page.evaluate(() => {
  const c = document.createElement('canvas');
  const gl = c.getContext('webgl2') || c.getContext('webgl');
  let renderer = 'none', vendor = 'none';
  if (gl) {
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    if (dbg) { renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL); vendor = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL); }
    else { renderer = gl.getParameter(gl.RENDERER); vendor = gl.getParameter(gl.VENDOR); }
  }
  return {
    renderer, vendor,
    duration: window.EPISODE ? window.EPISODE.timeline.duration : null,
    beats: window.EPISODE ? window.EPISODE.timeline.beats.length : null,
    hasThree: !!window.THREE,
    hasBB: !!window.BB,
  };
});
console.log('WebGL renderer:', info.renderer);
console.log('WebGL vendor  :', info.vendor);
console.log('duration:', info.duration, 'beats:', info.beats, 'three:', info.hasThree, 'bb:', info.hasBB);

for (const t of times) {
  await page.evaluate((tt) => window.seek(tt), t);
  const png = await page.screenshot({ type: 'png' });
  const f = join(outDir, `t${String(t).replace('.', '_')}.png`);
  writeFileSync(f, png);
  console.log('wrote', f);
}

if (errors.length) {
  console.log('ERRORS:');
  errors.forEach((e) => console.log('  -', e));
} else console.log('no page errors');

if (warnings.length) {
  console.log('WARNINGS:');
  warnings.slice(0, 10).forEach((e) => console.log('  -', e));
}
await browser.close();
process.exit(errors.length ? 1 : 0);
