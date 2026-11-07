// v2 "dramatic" thumbnails for E02..E05 (E01 was already posted, so it is NOT rebuilt).
// Usage (from this folder): node build_thumbnails_v2.mjs    Output: thumbnails_v2/<id>.png
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, readFileSync } from 'node:fs';
const here = dirname(fileURLToPath(import.meta.url));
const puppeteer = createRequire(resolve(here, '../E04_How-A-Missile-Finds-Its-Target/package.json'))('puppeteer-core');
const exe = process.env.CHROME_PATH || 'C:/Users/user/.cache/puppeteer/chrome-headless-shell/win64-156.0.8078.47/chrome-headless-shell-win64/chrome-headless-shell.exe';

// s/tx/ty: zoom+shift of the film frame. g: glow centre. mark: red SVG annotation. sub: small line under headline.
const SLIDES = [
  { id: 'E02_The-Fighter-Engine', ep: 2, img: 'e2_heat.png', s: 1.2, tx: -110, ty: -20, font: 165, g: [766, 450], sub: '',
    lines: [['HOTTER THAN', 'w'], ['MELTING', 'r']],
    mark: '<ellipse cx="766" cy="448" rx="222" ry="74" fill="none" stroke="#ff2a2a" stroke-width="9" stroke-dasharray="26 14"/>' },
  { id: 'E03_INS-Vikrant-The-Floating-Airport', ep: 3, img: 'e3_ship.png', s: 1.2, tx: -62, ty: 10, font: 128, g: [850, 500], sub: '262 METRES OF SHIP',
    lines: [['NO LAND.', 'w'], ['NO RUNWAY.', 'o']],
    mark: '<circle cx="856" cy="456" r="82" fill="none" stroke="#ff2a2a" stroke-width="9"/><path d="M930 400 L880 440" stroke="#ff2a2a" stroke-width="9" stroke-linecap="round"/>' },
  { id: 'E04_How-A-Missile-Finds-Its-Target', ep: 4, img: 'e4_clock.png', s: 1.5, tx: -30, ty: -250, font: 120, g: [920, 380], sub: 'A MACHINE MAKES THE CALL',
    lines: [['3 SECONDS', 'w'], ['TO DECIDE', 'r']],
    mark: '' },
  { id: 'E05_From-Buying-To-Building', ep: 5, img: 'e5_bars.png', s: 0.95, tx: 290, ty: 50, font: 150, g: [900, 450], sub: 'INDIA DEFENCE EXPORTS',
    lines: [['19×', 'o big'], ['WHAT?', 'w']],
    mark: '<circle cx="896" cy="332" r="74" fill="none" stroke="#ff2a2a" stroke-width="9"/>' },
];

const page = (z) => `<!doctype html><meta charset=utf-8><style>
*{margin:0;box-sizing:border-box} body{width:1280px;height:720px;overflow:hidden;background:#06142e}
.stage{position:relative;width:1280px;height:720px;overflow:hidden;background:#06142e}
.stage img{position:absolute;left:0;top:0;width:1280px;height:720px;transform-origin:0 0;transform:translate(${z.tx}px,${z.ty}px) scale(${z.s});filter:brightness(1.6) contrast(1.4) saturate(1.5) drop-shadow(0 0 14px rgba(90,210,255,.9))}
.glow{position:absolute;left:${z.g[0] - 420}px;top:${z.g[1] - 320}px;width:840px;height:640px;background:radial-gradient(closest-side,rgba(255,90,20,.62),rgba(255,40,40,.22) 55%,transparent);mix-blend-mode:screen}
.vig{position:absolute;inset:0;background:radial-gradient(ellipse at 62% 50%,rgba(0,0,0,0) 38%,rgba(0,0,0,.72) 100%),linear-gradient(90deg,rgba(2,8,24,.94) 0%,rgba(2,8,24,.62) 40%,rgba(2,8,24,0) 70%),linear-gradient(0deg,rgba(2,8,24,.8) 0%,rgba(2,8,24,0) 28%),linear-gradient(270deg,rgba(2,8,24,.95) 0%,rgba(2,8,24,0) 9%)}
svg.m{position:absolute;inset:0;filter:drop-shadow(0 0 10px rgba(255,40,40,.95))}
.tag{position:absolute;left:48px;top:30px;font:700 24px 'Consolas','Courier New',monospace;letter-spacing:3px;color:#7fd4ff}
.badge{position:absolute;right:40px;top:28px;background:#ff2a2a;color:#fff;font:900 54px 'Arial Black',Impact,sans-serif;padding:4px 22px;border-radius:6px;box-shadow:0 0 22px rgba(255,40,40,.9)}
.head{position:absolute;left:40px;top:70px;font-family:'Impact','Arial Black',sans-serif;font-size:${z.font}px;line-height:.98;text-transform:uppercase;letter-spacing:1px}
.head div{-webkit-text-stroke:16px #020a1c;paint-order:stroke fill;text-shadow:0 10px 0 #020a1c,0 0 36px rgba(255,150,30,.55);width:max-content}
.w{color:#fff}.o{color:#ffb020}.big{font-size:1.6em;line-height:.8}
.r{color:#fff;background:#e3191c;padding:0 22px;transform:rotate(-2.5deg);margin-top:8px;-webkit-text-stroke:0!important;text-shadow:0 6px 0 #6a0b0d!important;box-shadow:0 0 30px rgba(255,40,40,.8)}
.sub{position:absolute;left:48px;bottom:74px;font:800 40px 'Arial Black',Impact,sans-serif;letter-spacing:2px;color:#ffe08a;text-shadow:0 4px 0 #020a1c,0 0 18px rgba(255,170,40,.7)}
.foot{position:absolute;left:48px;bottom:28px;font:700 26px 'Consolas','Courier New',monospace;letter-spacing:3px;color:#cfe9ff}
</style><div class=stage><img src="data:image/png;base64,${readFileSync(resolve(here, 'thumb_src', z.img)).toString('base64')}"><div class=glow></div><div class=vig></div>
<svg class=m viewBox="0 0 1280 720" width=1280 height=720>${z.mark}</svg>
<div class=tag>THE MACHINES THAT PROTECT INDIA</div><div class=badge>EP ${z.ep}</div>
<div class=head>${z.lines.map(([t, c]) => `<div class="${c}">${t}</div>`).join('')}</div>
<div class=sub>${z.sub}</div><div class=foot>BHARAT BLUEPRINT</div></div>`;

mkdirSync(resolve(here, 'thumbnails_v2'), { recursive: true });
const b = await puppeteer.launch({ executablePath: exe, headless: 'shell', args: ['--no-sandbox'] });
for (const z of SLIDES) {
  const p = await b.newPage();
  await p.setViewport({ width: 1280, height: 720 });
  await p.setContent(page(z), { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: resolve(here, 'thumbnails_v2', `${z.id}.png`) });
  await p.close();
  console.log('wrote', z.id);
}
await b.close();
