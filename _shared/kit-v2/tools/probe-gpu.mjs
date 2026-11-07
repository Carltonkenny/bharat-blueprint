// kit-v2: print the WebGL renderer string Chrome reports under different launch
// configurations, so the spike can record which GPU the render actually used.
//   node tools/probe-gpu.mjs
import { getPuppeteer, launch } from './chrome.mjs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { RENDER_ROOT } from './paths.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

const pp = await getPuppeteer();
const { chromePath } = await import('./paths.mjs');
const exe = chromePath();

const CONFIGS = [
  { name: 'default-hardware', args: ['--no-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--hide-scrollbars'] },
  { name: 'angle-d3d11', args: ['--no-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=d3d11', '--hide-scrollbars'] },
  { name: 'angle-vulkan', args: ['--no-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=vulkan', '--hide-scrollbars'] },
  { name: 'd3d11-force-highperf', args: ['--no-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=d3d11', '--force_high_performance_gpu', '--hide-scrollbars'] },
  { name: 'd3d11-gpu-compositing', args: ['--no-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=d3d11', '--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--disable-gpu-driver-bug-workarounds', '--hide-scrollbars'] },
  { name: 'angle-gl', args: ['--no-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=gl', '--hide-scrollbars'] },
  { name: 'swiftshader', args: ['--no-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=swiftshader', '--hide-scrollbars'] },
];

const out = [];
for (const c of CONFIGS) {
  let browser;
  try {
    browser = await pp.launch({ executablePath: exe, headless: 'shell', args: c.args, env: c.env ? { ...process.env, ...c.env } : process.env });
    const page = await browser.newPage();
    await page.goto('data:text/html,<canvas id=c></canvas>');
    const info = await page.evaluate(() => {
      const gl = document.getElementById('c').getContext('webgl2') || document.getElementById('c').getContext('webgl');
      if (!gl) return { renderer: 'NO WEBGL' };
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      return {
        renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
        vendor: dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
        version: gl.getParameter(gl.VERSION),
      };
    });
    out.push({ ...c, ...info });
    console.log(`${c.name.padEnd(24)} ${info.renderer}`);
  } catch (e) {
    out.push({ ...c, error: String(e.message || e) });
    console.log(`${c.name.padEnd(24)} ERROR ${e.message || e}`);
  } finally {
    if (browser) await browser.close();
  }
}
mkdirSync(join(RENDER_ROOT, 'spike'), { recursive: true });
writeFileSync(join(RENDER_ROOT, 'spike', 'gpu-probe.json'), JSON.stringify(out, null, 2));
