// Builds the five S01 thumbnails (1280x720 PNG) from still frames of the finished films.
// Usage (from this folder): node build_thumbnails.mjs      Output: thumbnails/E0N_*.png
// puppeteer-core is borrowed from an episode folder's node_modules.
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { mkdirSync, readFileSync } from 'node:fs';
const here = dirname(fileURLToPath(import.meta.url));
const req = createRequire(resolve(here, '../E04_How-A-Missile-Finds-Its-Target/package.json'));
const puppeteer = req('puppeteer-core');
const exe = process.env.CHROME_PATH || 'C:/Users/user/.cache/puppeteer/chrome-headless-shell/win64-156.0.8078.47/chrome-headless-shell-win64/chrome-headless-shell.exe';

// img = source frame; s/tx/ty = zoom and shift of the frame; font = headline px.
const SLIDES = [
  { id: 'E01_Akash-NG-Air-Defence',          ep: 1, img: 'e1_jet.png',    s: 1.8,  tx: -220, ty: -440, font: 190, lines: [['FIRE', 'o'], ['OR WAIT?', 'w']] },
  { id: 'E02_The-Fighter-Engine',            ep: 2, img: 'e2_engine.png', s: 1.25, tx: -300, ty: 95,   font: 150, lines: [['THE ENGINE', 'w'], ['PROBLEM', 'o']] },
  { id: 'E03_INS-Vikrant-The-Floating-Airport', ep: 3, img: 'e3_ship.png', s: 1.2,  tx: -62,  ty: 10,   font: 170, lines: [['NO', 'w'], ['RUNWAY?', 'o']] },
  { id: 'E04_How-A-Missile-Finds-Its-Target', ep: 4, img: 'e4_clock.png',  s: 1.5,  tx: -90,  ty: -250, font: 150, lines: [['A MACHINE', 'w'], ['DECIDES', 'o']] },
  { id: 'E05_From-Buying-To-Building',       ep: 5, img: 'e5_bars.png',   s: 0.95, tx: 290,  ty: 50,   font: 150, lines: [['19×', 'o big'], ['WHAT?', 'w']] },
];

const page = (z) => `<!doctype html><meta charset=utf-8><style>
*{margin:0;box-sizing:border-box} body{width:1280px;height:720px;overflow:hidden;background:#0a2e5c}
.stage{position:relative;width:1280px;height:720px;overflow:hidden;background:#0a2e5c}
.stage img{position:absolute;left:0;top:0;width:1280px;height:720px;transform-origin:0 0;transform:translate(${z.tx}px,${z.ty}px) scale(${z.s})}
.shade{position:absolute;inset:0;background:linear-gradient(270deg,rgba(3,10,28,.9) 0%,rgba(3,10,28,0) 11%),linear-gradient(90deg,rgba(3,10,28,.92) 0%,rgba(3,10,28,.6) 42%,rgba(3,10,28,0) 72%),linear-gradient(180deg,rgba(3,10,28,.55) 0%,rgba(3,10,28,0) 35%,rgba(3,10,28,.0) 70%,rgba(3,10,28,.7) 100%)}
.tag{position:absolute;left:48px;top:34px;font:700 26px 'Consolas','Courier New',monospace;letter-spacing:3px;color:#7fd4ff}
.badge{position:absolute;right:40px;top:30px;background:#ff9a1f;color:#06142e;font:900 54px 'Arial Black',Impact,sans-serif;padding:4px 22px;border-radius:6px}
.head{position:absolute;left:44px;top:82px;font-family:'Impact','Arial Black',sans-serif;font-size:${z.font}px;line-height:.95;text-transform:uppercase;letter-spacing:1px}
.head div{-webkit-text-stroke:14px #03102a;paint-order:stroke fill;text-shadow:0 8px 0 #03102a}
.w{color:#fff} .o{color:#ffa21f} .big{font-size:1.6em;line-height:.8}
.foot{position:absolute;left:48px;bottom:30px;font:700 28px 'Consolas','Courier New',monospace;letter-spacing:3px;color:#cfe9ff}
</style><div class=stage><img src="data:image/png;base64,${readFileSync(resolve(here, 'thumb_src', z.img)).toString('base64')}"><div class=shade></div>
<div class=tag>THE MACHINES THAT PROTECT INDIA</div><div class=badge>EP ${z.ep}</div>
<div class=head>${z.lines.map(([t, c]) => `<div class="${c}">${t}</div>`).join('')}</div>
<div class=foot>BHARAT BLUEPRINT</div></div>`;

mkdirSync(resolve(here, 'thumbnails'), { recursive: true });
const b = await puppeteer.launch({ executablePath: exe, headless: 'shell', args: ['--no-sandbox', '--allow-file-access-from-files'] });
for (const z of SLIDES) {
  const p = await b.newPage();
  await p.setViewport({ width: 1280, height: 720 });
  await p.setContent(page(z), { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: resolve(here, 'thumbnails', `${z.id}.png`) });
  await p.close();
  console.log('wrote', z.id);
}
await b.close();
