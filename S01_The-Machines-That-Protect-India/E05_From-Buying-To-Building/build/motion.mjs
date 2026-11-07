// Motion QA: how much of a finished video is visually still? Frames are shrunk to 96x54 (grain disappears), compared 2x per second.
// usage: node build/motion.mjs <video.mp4> [stillThreshold=0.12]
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const [video, thrArg] = process.argv.slice(2), thr = +(thrArg || 0.12);
const dir = mkdtempSync(join(tmpdir(), 'motion-')), out = join(dir, 'm.txt').replace(/\\/g, '/');
execFileSync('ffmpeg', ['-hide_banner', '-nostats', '-loglevel', 'error', '-i', video, '-vf',
  `fps=2,scale=96:54:flags=area,format=gray,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file='${out.replace(':', '\\:')}'`, '-an', '-f', 'null', '-']);
const v = readFileSync(out, 'utf8').split('\n').filter((l) => l.includes('YAVG')).map((l) => +l.split('=')[1]);
let st = -1, still = 0, longest = 0; const runs = [];
const close = (i) => { if (st >= 0) { const d = (i - st) / 2; longest = Math.max(longest, d); if (d >= 3) runs.push(`${(st / 2).toFixed(0)}-${(i / 2).toFixed(0)}s`); st = -1; } };
v.forEach((x, i) => { if (x < thr) { still++; if (st < 0) st = i; } else close(i); }); close(v.length);
const mean = v.reduce((a, b) => a + b, 0) / v.length;
console.log(JSON.stringify({ video, seconds: v.length / 2, meanMotion: +mean.toFixed(3), stillShare: +(100 * still / v.length).toFixed(1) + '%', longestStill: longest + 's', stillRunsOver3s: runs }, null, 1));
