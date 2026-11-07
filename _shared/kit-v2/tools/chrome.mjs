// kit-v2: a small Chrome driver for the QC tools. Uses the pinned puppeteer-core that
// lives with the build dependencies (outside OneDrive).
import { pathToFileURL } from 'node:url';
import { DEPS_ROOT, chromePath } from './paths.mjs';

let puppeteer = null;

export async function getPuppeteer() {
  if (puppeteer) return puppeteer;
  const mod = pathToFileURL(DEPS_ROOT + '/puppeteer-core/lib/puppeteer/puppeteer-core.js').href;
  puppeteer = await import(mod);
  return puppeteer;
}

export async function launch(opts = {}) {
  const pp = await getPuppeteer();
  const exe = chromePath();
  if (!exe) throw new Error('no chrome-headless-shell found; set BB_CHROME');
  const browser = await pp.launch({
    executablePath: exe,
    headless: 'shell',
    args: [
      '--no-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--allow-file-access-from-files',
      '--hide-scrollbars',
      '--mute-audio',
    ],
    ...opts,
  });
  return browser;
}

export async function openPage(browser, filePath, size = { width: 1920, height: 1080 }) {
  const page = await browser.newPage();
  await page.setViewport({ width: size.width, height: size.height, deviceScaleFactor: 1 });
  const errors = [];
  const warnings = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('console.error: ' + m.text());
    else if (m.type() === 'warning') warnings.push('console.warn: ' + m.text());
  });
  page.on('requestfailed', (r) => errors.push('requestfailed: ' + r.url()));
  await page.goto(pathToFileURL(filePath).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  return { page, errors, warnings };
}
