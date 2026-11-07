// kit-v2: QC v2, part D: the contact sheets for the human and Claude review.
//   qc/sheet_01.png ...  12 frames per sheet (3x4): 2 frames per beat (mid-hold and
//                       end-of-hold), each captioned with the beat id and the time
//   qc/cuts.png        7 frames (-3..+3) around every cut
//   qc/frames_*.png    6 full-size frames at the largest-delta moments and the
//                       busiest-label moments
//
//   node tools/qc-sheets.mjs <episodeDir> <video> [--out <qcDir>]
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { launch } from './chrome.mjs';

const args = process.argv.slice(2);
const dir = resolve(args[0]);
const video = resolve(args[1]);
if (!args[0] || !args[1]) { console.error('usage: node tools/qc-sheets.mjs <episodeDir> <video>'); process.exit(2); }
const flag = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const outDir = resolve(flag('out', join(dir, 'qc')));
const workDir = resolve(flag('work', join(process.env.LOCALAPPDATA || '.', 'BharatBlueprint', 'render', 'S02', 'sheets')));

const episode = JSON.parse(readFileSync(join(dir, 'episode.s2.json'), 'utf8'));
const timeline = JSON.parse(readFileSync(join(dir, 'timing', 'timeline.json'), 'utf8'));
const fps = episode.fps || 30;
const labelBoxesPath = join(dir, 'qc', 'label-boxes.json');
const labelBoxes = existsSync(labelBoxesPath) ? JSON.parse(readFileSync(labelBoxesPath, 'utf8')) : {};

// ---- the frames we need ----
const wanted = new Map(); // frame number -> caption
timeline.beats.forEach((b) => {
  const mid = Math.round((b.t0 + (b.t1 - b.t0) / 2) * fps);
  const end = Math.round(b.t1 * fps) - 1;
  wanted.set(mid, { cap: `${b.id}  mid  ${((mid) / fps).toFixed(2)}s`, group: 'sheet' });
  wanted.set(end, { cap: `${b.id}  end  ${(end / fps).toFixed(2)}s`, group: 'sheet' });
});
const cuts = timeline.beats.map((b) => Math.round(b.t0 * fps));
const cutFrames = [];
cuts.forEach((c) => { for (let d = -3; d <= 3; d++) { const f = c + d; if (f >= 0 && !wanted.has(f)) { wanted.set(f, { cap: `cut @${c} ${d >= 0 ? '+' : ''}${d}`, group: 'cut' }); cutFrames.push(f); } } });

// the largest-delta moments and the busiest-label moments
let deltas = [];
const framesCsv = join(dir, 'qc', 'frames.csv');
if (existsSync(framesCsv)) {
  deltas = readFileSync(framesCsv, 'utf8').split('\n').slice(1).filter(Boolean)
    .map((l) => { const c = l.split(','); return { f: +c[0], d: +c[3] }; })
    .sort((a, b) => b.d - a.d).slice(0, 6);
}
deltas.forEach((x) => { if (!wanted.has(x.f)) wanted.set(x.f, { cap: `largest delta ${x.d.toFixed(2)} @${x.f}`, group: 'big' }); });
const busiest = Object.entries(labelBoxes).sort((a, b) => (b[1].length - a[1].length)).slice(0, 6);
busiest.forEach(([id, boxes]) => {
  const b = timeline.beats.find((x) => x.id === id);
  if (!b) return;
  const f = Math.round((b.t0 + (b.t1 - b.t0) / 2) * fps);
  if (!wanted.has(f)) wanted.set(f, { cap: `${id}  ${boxes.length} labels`, group: 'big' });
});

// ---- extract the frames in one pass ----
if (existsSync(workDir)) rmSync(workDir, { recursive: true, force: true });
mkdirSync(workDir, { recursive: true });
const list = [...wanted.keys()].sort((a, b) => a - b);
// extract the frames in chunks: ffmpeg's select parser cannot take a very long expression.
// The sheet frames are scaled down: a browser cannot hold hundreds of full-size PNGs.
const CHUNK = 40;
let extracted = 0;
for (let i = 0; i < list.length; i += CHUNK) {
  const chunk = list.slice(i, i + CHUNK);
  const expr = chunk.map((n) => `eq(n\\,${n})`).join('+');
  const r = spawnSync('ffmpeg', ['-nostdin', '-v', 'error', '-y', '-i', video, '-vf', `select='${expr}',scale=640:360`, '-vsync', '0', '-start_number', String(i), join(workDir, 'f%05d.png')], { encoding: 'utf8', maxBuffer: 1 << 26 });
  if (r.status !== 0) { console.error('qc-sheets: ffmpeg failed\n' + (r.stderr || '').toString().slice(0, 400)); process.exit(2); }
  extracted += chunk.length;
}
const files = readdirSync(workDir).filter((f) => f.endsWith('.png')).sort();
if (files.length !== list.length) console.error(`warning: extracted ${files.length} frames, expected ${list.length}`);

// ---- compose the sheets in the browser ----
function dataUrl(file) { return 'data:image/png;base64,' + readFileSync(file).toString('base64'); }
function sheetHtml(items, cols, rows) {
  const cells = items.map((it) => `<figure><img src="${it.src}"><figcaption>${it.cap}</figcaption></figure>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;background:#0a0f18;font:13px 'IBM Plex Mono',monospace;color:#dfe9f5}
  .grid{display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;padding:8px}
  figure{margin:0}
  img{width:100%;display:block;border:1px solid #1d3550}
  figcaption{padding:3px 2px;color:#9fc4e8;font-size:12px}
  </style></head><body><div class="grid">${cells}</div></body></html>`;
}

const browser = await launch();
async function shoot(html, out) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => Promise.all(Array.from(document.images).map((i) => i.decode().catch(() => {}))));
  const png = await page.screenshot({ type: 'png', fullPage: true });
  mkdirSync(resolve(out, '..'), { recursive: true });
  writeFileSync(out, png);
  await page.close();
}

mkdirSync(outDir, { recursive: true });
const sheetItems = list.map((n, i) => ({ src: dataUrl(join(workDir, files[i])), cap: wanted.get(n).cap, group: wanted.get(n).group }));
const perSheet = 12;
const sheets = [];
const onlySheets = sheetItems.filter((x) => x.group === 'sheet');
for (let i = 0; i < onlySheets.length; i += perSheet) {
  const chunk = onlySheets.slice(i, i + perSheet);
  if (!chunk.length) continue;
  const name = `sheet_${String(sheets.length + 1).padStart(2, '0')}.png`;
  await shoot(sheetHtml(chunk, 3, 4), join(outDir, name));
  sheets.push(name);
}
const cutItems = sheetItems.filter((x) => x.group === 'cut');
if (cutItems.length) {
  await shoot(sheetHtml(cutItems, 7, Math.max(1, Math.ceil(cutItems.length / 7))), join(outDir, 'cuts.png'));
}
const big = [];
{
  // the six largest-delta moments and the six busiest-label moments, at full size
  const extraCaps = new Map();
  deltas.forEach((x) => { if (!extraCaps.has(x.f)) extraCaps.set(x.f, `largest delta ${x.d.toFixed(2)}`); });
  busiest.forEach(([id, boxes]) => {
    const b = timeline.beats.find((x) => x.id === id);
    if (!b) return;
    const f = Math.round((b.t0 + (b.t1 - b.t0) / 2) * fps);
    if (!extraCaps.has(f)) extraCaps.set(f, `${id}  ${boxes.length} labels`);
  });
  const bigList = [...extraCaps.keys()];
  const bigDir = join(workDir, 'big');
  mkdirSync(bigDir, { recursive: true });
  for (let i = 0; i < bigList.length; i += 12) {
    const chunk = bigList.slice(i, i + 12);
    const expr = chunk.map((n) => `eq(n\\,${n})`).join('+');
    spawnSync('ffmpeg', ['-nostdin', '-v', 'error', '-y', '-i', video, '-vf', `select='${expr}'`, '-vsync', '0', '-start_number', String(i), join(bigDir, 'b%05d.png')], { encoding: 'utf8', maxBuffer: 1 << 26 });
  }
  const bigFiles = readdirSync(bigDir).filter((f) => f.endsWith('.png')).sort();
  bigList.forEach((n, i) => {
    if (!bigFiles[i]) return;
    big.push({ src: dataUrl(join(bigDir, bigFiles[i])), cap: extraCaps.get(n) });
  });
}
for (const b of big) {
  const page = await browser.newPage();
  page.setDefaultTimeout(120000);
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.setContent(`<body style="margin:0;background:#000"><img src="${b.src}" style="width:1920px;height:1080px;display:block"></body>`, { waitUntil: 'load' });
  await page.evaluate(() => Promise.all(Array.from(document.images).map((i) => i.decode().catch(() => {}))));
  const png = await page.screenshot({ type: 'png' });
  writeFileSync(join(outDir, `frames_${b.cap.replace(/[^a-z0-9]+/gi, '_').slice(0, 40)}.png`), png);
  await page.close();
}
await browser.close();
console.log(`contact sheets: ${sheets.length} sheet(s), ${cutFrames.length} cut frame(s), ${big.length} full-size frame(s) -> ${outDir}`);
console.log(sheets.join(' '));
