// Timeline sweep QC: every STEP seconds, check text safety (inside border, clear of header/title block, not overlapping
// other text) including partially inked states. Overlap checks are skipped while two beats cross-fade.
// v2 additions: a word still mid-reveal long after its beat started is flagged (half-revealed text at rest).
// usage: node build/qc-sweep.mjs [step=0.25]
import puppeteer from 'puppeteer-core';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const step = Number(process.argv[2] || 0.25);
const exe = process.env.CHROME_PATH || 'C:/Users/user/.cache/puppeteer/chrome-headless-shell/win64-156.0.8078.47/chrome-headless-shell-win64/chrome-headless-shell.exe';
const browser = await puppeteer.launch({ executablePath: exe, headless: 'shell', args: ['--no-sandbox'] });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(pathToFileURL(resolve('index.html')).href);
await page.evaluate(() => document.fonts.ready);
const issues = await page.evaluate((step) => {
  const out = [], seen = new Set();
  const orig = BP.text;
  for (let t = 0; t < window.DURATION; t += step) {
    const texts = [];
    BP.text = function (ctx, s, x, y, size, o = {}) {
      const p = o.p == null ? 1 : Math.min(1, Math.max(0, o.p));
      if (p > 0 && ctx.canvas !== document.getElementById('c') && (o.a == null || o.a > 0.3)) {
        const m = ctx.getTransform(), full = BP.tw(ctx, s, size, o), w = full * m.a, al = o.align || 'left';
        const x0 = al === 'center' ? x - full / 2 : al === 'right' ? x - full : x;
        texts.push({ s, p, size: size * m.a, x0: m.a * x0 + m.e, x1: m.a * x0 + m.e + w, y0: m.d * (y - size * 0.8) + m.f, y1: m.d * (y + size * 0.2) + m.f });
      }
      return orig.apply(this, arguments);
    };
    window.seek(t);
    const bi = window.BEATS.findIndex((b) => b.t0 > t) - 1, b = window.BEATS[bi < 0 ? window.BEATS.length - 1 : bi];
    const inTrans = b.tr && t - b.t0 < b.d;
    const live = texts.filter((q) => !/^EP04|^SC\./.test(q.s));
    const add = (k, msg) => { const key = b.id + k; if (!seen.has(key)) { seen.add(key); out.push(`t=${t.toFixed(2)} beat ${b.id}: ${msg}`); } };
    live.forEach((q) => {
      if (q.x0 < 30 || q.x1 > 1250 || q.y0 < 28 || q.y1 > 692) add('safe' + q.s, `"${q.s}" outside border [${q.x0 | 0},${q.y0 | 0}..${q.x1 | 0},${q.y1 | 0}]`);
      if (q.size < 27.5) add('sz' + q.s, `"${q.s}" ${q.size.toFixed(0)}px`);
      if (!(q.x1 < 900 || q.x0 > 1254 || q.y1 < 646 || q.y0 > 694)) add('tb' + q.s, `"${q.s}" hits title block`);
      if (q.y0 < 80 && q.x0 < 540) add('hd' + q.s, `"${q.s}" hits header`);
      if (q.p < 1 && !b.keys && t - b.t0 > 0.75 * (b.t1 - b.t0) && t - b.t0 > 2.5) add('rest' + q.s, `"${q.s}" still mid-reveal (p=${q.p.toFixed(2)}) late in its beat`);
    });
    if (!inTrans) for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) {
      const a = live[i], q = live[j];
      if (a.x0 < q.x1 - 2 && a.x1 > q.x0 + 2 && a.y0 < q.y1 - 4 && a.y1 > q.y0 + 4) add('ov' + a.s + q.s, `overlap "${a.s}" / "${q.s}"`);
    }
  }
  BP.text = orig;
  return out;
}, step);
console.log('page errors:', errors.length); errors.forEach((e) => console.log(' !', e));
console.log('issues:', issues.length); issues.forEach((i) => console.log(' -', i));
await browser.close();
process.exit(issues.length || errors.length ? 1 : 0);
