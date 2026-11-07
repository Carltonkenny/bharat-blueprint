// Writes STORYBOARD.md: every beat with its time, panel image (from dist/qc) and the narration spoken during it.
import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const exe = 'C:/Users/user/.cache/puppeteer/chrome-headless-shell/win64-156.0.8078.47/chrome-headless-shell-win64/chrome-headless-shell.exe';
const dir = process.argv[2] || 'dist/qc3';
const b = await puppeteer.launch({ executablePath: exe, headless: 'shell', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.goto(pathToFileURL(resolve('index.html')).href);
await p.evaluate(() => document.fonts.ready);
const d = await p.evaluate(() => ({ beats: window.BEATS.map(({ id, t0, t1, scene }) => ({ id, t0, t1, scene })), clips: window.TIMING.clips.map(({ id, text, start, dur }) => ({ id, text, start, dur })), names: window.TIMING.SCENE_NAMES, dur: window.DURATION }));
await b.close();
const f = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
let md = `# Storyboard (${f(d.dur)})\n\nOne row per beat: time, scene, the frame as held at the end of the beat, and the narration spoken while it is on screen.\n\n`;
for (const x of d.beats) {
  const said = d.clips.filter((c) => c.start >= x.t0 - 0.3 && c.start < x.t1 - 0.3).map((c) => c.text).join(' ');
  md += `### ${f(x.t0)} · beat ${x.id} · ${d.names[x.scene - 1]}\n![${x.id}](${dir}/${x.id}.png)\n\n> ${said || '(silence, title card)'}\n\n`;
}
writeFileSync('STORYBOARD.md', md);
console.log('beats', d.beats.length);
