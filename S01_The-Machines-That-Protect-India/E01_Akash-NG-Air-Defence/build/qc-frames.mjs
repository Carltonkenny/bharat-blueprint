// Pre-render QC: for every beat, draw the held state and check text size, safe area, header/title-block collisions,
// text-on-text overlap, and that the frame is not blank. Saves PNGs for visual review.
// usage: node build/qc-frames.mjs <outDir>
import puppeteer from 'puppeteer-core';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = resolve(process.argv[2] || 'dist/qc');
const exe = 'C:/Users/user/.cache/puppeteer/chrome-headless-shell/win64-156.0.8078.47/chrome-headless-shell-win64/chrome-headless-shell.exe';
mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: exe, headless: 'shell', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve('index.html')).href);
await page.evaluate(() => document.fonts.ready);

const report = await page.evaluate(async () => {
  const res = [];
  const c = document.getElementById('c');
  for (const b of window.BEATS) {
    const t = b.t1 - 0.05; // end of the beat: everything inked in, held
    const texts = [];
    const origText = BP.text, origLabel = BP.label;
    BP.text = function (ctx, s, x, y, size, o = {}) {
      const p = o.p == null ? 1 : o.p;
      if (p > 0 && ctx.canvas !== document.getElementById('c')) {
        const m = ctx.getTransform(), w = BP.tw(ctx, s, size, o) * m.a, al = o.align || 'left';
        const x0 = (al === 'center' ? x - BP.tw(ctx, s, size, o) / 2 : al === 'right' ? x - BP.tw(ctx, s, size, o) : x);
        texts.push({ s, size: size * m.a, x0: m.a * x0 + m.e, x1: m.a * x0 + m.e + w, y0: m.d * (y - size * 0.8) + m.f, y1: m.d * (y + size * 0.2) + m.f, full: p >= 1, a: o.a == null ? 1 : o.a });
      }
      return origText.apply(this, arguments);
    };
    window.seek(t);
    BP.text = origText;
    const issues = [];
    const live = texts.filter((q) => q.a > 0.3 && !/^EP01|^SC\./.test(q.s));
    live.forEach((q) => {
      if (!q.full) issues.push(`truncated text "${q.s}"`);
      if (q.size < 27.5) issues.push(`text "${q.s}" is ${q.size.toFixed(0)}px (<28)`);
      if (q.x0 < 30 || q.x1 > 1250 || q.y0 < 28 || q.y1 > 692) issues.push(`"${q.s}" outside safe area [${q.x0 | 0},${q.y0 | 0}..${q.x1 | 0},${q.y1 | 0}]`);
      const hb = { x0: 30, y0: 40, x1: 30 + 40 + 17.5 * 30, y1: 80 }, tb = { x0: 900, y0: 646, x1: 1254, y1: 694 };
      const hit = (r) => !(q.x1 < r.x0 || q.x0 > r.x1 || q.y1 < r.y0 || q.y0 > r.y1);
      if (q.size < 60 && hit(tb)) issues.push(`"${q.s}" overlaps title block`);
      if (q.y0 < 80 && q.x0 < 520 && q.y1 > 40 && q.x0 > 40 && q.s !== texts[0]?.s) { /* header text is drawn by border; checked below */ }
    });
    for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) {
      const a = live[i], q = live[j];
      if (a.x0 < q.x1 - 2 && a.x1 > q.x0 + 2 && a.y0 < q.y1 - 4 && a.y1 > q.y0 + 4) issues.push(`text overlap "${a.s}" / "${q.s}"`);
    }
    // header = first plate at top-left (drawn by border); flag any other text crossing y<82 in x<540
    live.forEach((q) => { if (!/^SC\.|^EP01/.test(q.s) && q.y0 < 78 && q.x0 < 540) issues.push(`"${q.s}" collides with header`); });
    // blank-frame check: count bright pixels
    const d = c.getContext('2d').getImageData(0, 0, 1280, 720).data; let bright = 0;
    for (let i = 0; i < d.length; i += 64) if (d[i] > 200 && d[i + 1] > 200) bright++;
    if (bright < 120) issues.push(`frame looks empty (bright px ${bright})`);
    res.push({ id: b.id, t, texts: live.length, bright, issues, png: c.toDataURL('image/png') });
  }
  return res;
});
let bad = 0;
for (const r of report) {
  writeFileSync(join(out, r.id + '.png'), Buffer.from(r.png.split(',')[1], 'base64'));
  console.log(`${r.id} t=${r.t.toFixed(2)} texts=${r.texts} bright=${r.bright} ${r.issues.length ? 'ISSUES' : 'ok'}`);
  r.issues.forEach((i) => { bad++; console.log('   -', i); });
}
console.log('total issues:', bad);
await browser.close();
