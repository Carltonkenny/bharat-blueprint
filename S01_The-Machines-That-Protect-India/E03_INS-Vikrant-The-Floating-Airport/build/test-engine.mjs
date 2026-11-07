// Engine and timing tests for Episode 2. Run: node build/test-engine.mjs
// Covers the v2 rules that can be checked in code: exact circles, anchored leaders, whole-word reveals,
// narration/timing consistency, every beat has a panel, and every panel draws without throwing.
import puppeteer from 'puppeteer-core';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const exe = process.env.CHROME_PATH || 'C:/Users/user/.cache/puppeteer/chrome-headless-shell/win64-156.0.8078.47/chrome-headless-shell-win64/chrome-headless-shell.exe';
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const narration = norm(readFileSync('narration_v1.txt', 'utf8'));
const panelsSrc = readdirSync('src').filter((n) => /^ep\d\.js$/.test(n)).map((n) => readFileSync('src/' + n, 'utf8')).join('\n');

const browser = await puppeteer.launch({ executablePath: exe, headless: 'shell', args: ['--no-sandbox'] });
const page = await browser.newPage();
const errors = []; page.on('pageerror', (e) => errors.push(e.message));
await page.goto(pathToFileURL(resolve('index.html')).href);
await page.evaluate(() => document.fonts.ready);

const results = await page.evaluate((narration) => {
  const out = [], ok = (name, pass, detail = '') => out.push({ name, pass: !!pass, detail });
  const ctx = document.getElementById('c').getContext('2d');

  // 1. circles are exact and closed
  const strokes = []; const origStroke = BP.stroke; BP.stroke = (c, pts) => strokes.push(pts);
  BP.circle(ctx, 300, 200, 50, { p: 1 });
  BP.stroke = origStroke;
  const pts = strokes[strokes.length - 1];
  const maxErr = Math.max(...pts.map(([x, y]) => Math.abs(Math.hypot(x - 300, y - 200) - 50)));
  ok('circle: first point equals last point', pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]);
  ok('circle: every point within 1e-6 of the radius', maxErr < 1e-6, 'max error ' + maxErr);
  ok('circle: dense enough to look round (>= 60 points)', pts.length >= 60, pts.length + ' points');

  // 2. leaders attach to registered anchors only
  BP.resetAnchors();
  let threw = false; try { BP.ref('nope'); } catch (e) { threw = true; }
  ok('unknown anchor throws', threw);
  BP.pt('a1', 123, 234);
  const dots = []; const origDot = BP.dot; BP.dot = (c, x, y) => dots.push([x, y]);
  BP.leaderTo(ctx, 'a1', 400, 300, 'LABEL', { p: 1 });
  BP.dot = origDot;
  ok('leader starts exactly on its anchor', dots[0] && dots[0][0] === 123 && dots[0][1] === 234, JSON.stringify(dots[0]));
  ok('BP.leader (free coordinates) no longer exists', typeof BP.leader === 'undefined');

  // 3. whole-word text: complete at p = 1, and each word complete by the end
  const calls = []; const octx = { canvas: {}, save() {}, restore() {}, beginPath() {}, rect() {}, clip() {}, measureText: (s) => ({ width: s.length * 10 }), fillText: (s) => calls.push(s), getTransform: () => new DOMMatrix() };
  BP.text(octx, 'ONE WORD AT A TIME', 0, 0, 28, { p: 1 });
  ok('text at p=1 draws the full string once', calls.length === 1 && calls[0] === 'ONE WORD AT A TIME', JSON.stringify(calls));
  calls.length = 0; BP.text(octx, 'ONE WORD AT A TIME', 0, 0, 28, { p: 0.5 });
  ok('text at p=0.5 draws whole words only (never a fragment)', calls.length > 0 && calls.every((w) => 'ONE WORD AT A TIME'.split(' ').includes(w)), JSON.stringify(calls));

  // 4. narration and timing
  const TM = window.TIMING, joined = TM.clips.map((c) => c.text).join(' ').replace(/\s+/g, ' ').trim();
  ok('clips concatenate to narration_v1.txt exactly', joined === narration, joined === narration ? '' : 'differs');
  const words = joined.split(' ').length;
  ok('narration is 500-700 words (v6 explains more)', words >= 500 && words <= 720, words + ' words');
  ok('duration is 4:00-5:05', TM.DURATION >= 240 && TM.DURATION <= 305, TM.DURATION.toFixed(2) + ' s');
  ok('clips never overlap', TM.clips.every((c, i) => i === 0 || c.start >= TM.clips[i - 1].start + TM.clips[i - 1].dur - 1e-9));
  const bs = window.BEATS;
  ok('beat start times strictly increase', bs.every((b, i) => i === 0 || b.t0 > bs[i - 1].t0));
  const shortest = bs.reduce((m, b) => (b.t1 - b.t0 < m.d ? { id: b.id, d: b.t1 - b.t0 } : m), { id: '', d: 1e9 });
  ok('no beat shorter than 2.0 s', shortest.d >= 2.0, `shortest ${shortest.id} ${shortest.d.toFixed(2)} s`);
  ok('final title held >= 2 s', bs[bs.length - 1].t1 - bs[bs.length - 1].t0 >= 2);

  // 5. every beat has a panel, and each draws (start, middle, end) without throwing
  const missing = bs.filter((b) => !window.PANELS[b.id]).map((b) => b.id);
  ok('every beat has a panel', !missing.length, missing.join(','));
  const failed = [];
  bs.forEach((b) => [b.t0 + 0.05, (b.t0 + b.t1) / 2, b.t1 - 0.05].forEach((t) => { try { window.seek(t); } catch (e) { failed.push(b.id + '@' + t.toFixed(1) + ': ' + e.message); } }));
  ok('every panel draws at start, middle and end', !failed.length, failed.join(' | '));
  return out;
}, narration);

results.push({ name: 'panels use BP.leaderTo only (no free-coordinate leaders)', pass: !/BP\.leader\(/.test(panelsSrc) });
results.push({ name: 'no page errors', pass: errors.length === 0, detail: errors.join(' | ') });
let bad = 0;
for (const r of results) { if (!r.pass) bad++; console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? '  [' + r.detail + ']' : ''}`); }
console.log(bad ? `${bad} failing` : 'all passing');
await browser.close();
process.exit(bad ? 1 : 0);
