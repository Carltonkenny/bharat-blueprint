// kit-v2: test whether a .cmd wrapper can be used as the Chrome executable (so the
// per-process flag --force_high_performance_gpu can be added without a system change).
import { getPuppeteer } from './chrome.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RENDER_ROOT } from './paths.mjs';

const wrapper = process.argv[2] || join(RENDER_ROOT, 'chrome-hw.cmd');
const pp = await getPuppeteer();
try {
  const b = await pp.launch({
    executablePath: wrapper,
    headless: 'shell',
    args: ['--no-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=d3d11'],
  });
  const pg = await b.newPage();
  await pg.goto('data:text/html,<canvas id=c></canvas>');
  const i = await pg.evaluate(() => {
    const gl = document.getElementById('c').getContext('webgl2');
    if (!gl) return 'NO WEBGL';
    const d = gl.getExtension('WEBGL_debug_renderer_info');
    return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  });
  console.log('WRAPPER OK. RENDERER:', i);
  await b.close();
} catch (e) {
  console.log('WRAPPER FAILED:', e.message);
}
