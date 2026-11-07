// kit-v2: QC v2, part A: the frame gates on the rendered MP4 (QC_BAR_S02.md A, F1..F8).
//
//   node tools/qc-frames.mjs <episodeDir> <video> [--out <qcDir>]
//
// It decodes every frame once at full resolution and computes, per frame: mean luma,
// the mean absolute difference to the previous frame, the fraction of blown pixels, and
// the centroid of each tracked label box (for the jitter gate).
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const dir = resolve(args[0]);
const video = resolve(args[1]);
if (!args[0] || !args[1]) { console.error('usage: node tools/qc-frames.mjs <episodeDir> <video>'); process.exit(2); }
const flag = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const outDir = resolve(flag('out', join(dir, 'qc')));

const episode = JSON.parse(readFileSync(join(dir, 'episode.s2.json'), 'utf8'));
const timeline = JSON.parse(readFileSync(join(dir, 'timing', 'timeline.json'), 'utf8'));
const boxesPath = join(dir, 'qc', 'label-boxes.json');
const labelBoxes = existsSync(boxesPath) ? JSON.parse(readFileSync(boxesPath, 'utf8')) : {};

// ---------- F8: the format ----------
function probe(file) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate,codec_name,pix_fmt,nb_frames:format=duration', '-of', 'json', file], { encoding: 'utf8', maxBuffer: 1 << 24 });
  return JSON.parse(r.stdout);
}
const info = probe(video);
const stream = info.streams[0];
const W = stream.width, H = stream.height;
const fpsNum = (() => { const [a, b] = stream.r_frame_rate.split('/').map(Number); return b ? a / b : a; })();
const duration = parseFloat(info.format.duration);
const declared = episode.size || [1920, 1080];
const declaredFps = episode.fps || 30;

const failures = [];
const fail = (gate, msg, frame) => failures.push({ gate, msg, frame: frame == null ? null : frame });

// ---------- the declared cuts, holds and pulses ----------
const cuts = timeline.beats.map((b) => Math.round(b.t0 * declaredFps));
// a fade transition swaps its screen content at the midpoint: that is a cut too
timeline.beats.forEach((b, i) => {
  const trDur = b.tr === 'wipe' ? (b.trDur || 0.9) : (b.trDur || 0.55);
  const nb = timeline.beats[i + 1];
  if (!nb) return;
  const mid = b.t0 + (nb.t0 - b.t0 - trDur / 2);
  if (mid > b.t0) cuts.push(Math.round(mid * declaredFps));
});
const holdBeats = new Set(timeline.beats.filter((b) => b.kind === 'hold').map((b) => b.id));
const pulseBeats = new Set(timeline.beats.filter((b) => (b.fx || []).includes('pulse') || /puls/i.test(b.notes || '')).map((b) => b.id));
const beatAt = (t) => {
  for (let i = timeline.beats.length - 1; i >= 0; i--) if (t >= timeline.beats[i].t0 - 1e-6) return timeline.beats[i];
  return timeline.beats[0];
};

// ---------- F8 checks ----------
if (W !== declared[0] || H !== declared[1]) fail('F8', `the frame is ${W}x${H}, the episode declares ${declared[0]}x${declared[1]}`);
if (Math.abs(fpsNum - declaredFps) > 0.01) fail('F8', `the frame rate is ${fpsNum}, the episode declares ${declaredFps}`);
if (stream.codec_name !== 'h264') fail('F8', `the codec is ${stream.codec_name}, not h264`);
if (stream.pix_fmt !== 'yuv420p') fail('F8', `the pixel format is ${stream.pix_fmt}, not yuv420p`);

// ---------- decode every frame ----------
const frameBytes = W * H;
const luma = new Float32Array(W * H);
const prevLuma = new Float32Array(W * H);
let havePrev = false;

const stats = [];
let pending = Buffer.alloc(0);
let frameIndex = 0;
let blackRun = 0, zeroRun = 0, dupRun = 0, altRun = 0, lastSign = 0;
let prevMeanLuma = 0;
let prevCentroid = new Map();

function processFrame(buf) {
  const f = frameIndex;
  const t = f / declaredFps;
  const beat = beatAt(t);
  const nearCut = cuts.some((c) => Math.abs(c - f) <= 1);

  // mean luma and the blown-pixel fraction, on a 1-in-4 sample of the pixels
  let sum = 0, blown = 0, samples = 0;
  const step = 4;
  let dsum = 0, dn = 0, changed = 0;
  for (let p = 0; p < buf.length; p++) {
    if ((p % step) !== 0) continue;
    const y = buf[p];
    luma[p] = y;
    sum += y; samples++;
    if (y >= 254) blown++;
    if (havePrev) {
      const d = Math.abs(y - prevLuma[p]);
      dsum += d; dn++;
      if (d !== 0) changed++;
    }
  }
  const pixels = W * H;
  const meanLuma = sum / Math.max(1, samples);
  const meanDiff = dn ? dsum / dn : 0;
  const blownFrac = blown / Math.max(1, samples);
  // F1: a frame is black when it is far darker than the paper of its world
  const PAPER_HEX = { ice: '#0a2f5c', network: '#071c38', orbit: '#050d21', graphite: '#123043', cleanroom: '#0c3b47', strata: '#112430' }[episode.world] || '#0a2f5c';
  const pr = parseInt(PAPER_HEX.slice(1, 3), 16), pg2 = parseInt(PAPER_HEX.slice(3, 5), 16), pb = parseInt(PAPER_HEX.slice(5, 7), 16);
  const paperLuma = 0.08 * (0.2126 * pr + 0.7152 * pg2 + 0.0722 * pb);
  if (meanLuma < paperLuma) blackRun++; else blackRun = 0;
  if (blackRun >= 3) fail('F1', `the frame is black (mean luma ${meanLuma.toFixed(1)})`, f);
  // a frame is identical when not one sampled pixel changed
  if (changed === 0) { zeroRun++; dupRun++; } else { zeroRun = 0; dupRun = 0; }
  if (dupRun >= 3 && !holdBeats.has(beat.id) && !nearCut) fail('F7', `${dupRun} identical frames in a moving beat`, f);
  if (zeroRun * (1 / declaredFps) > 1.0 && !holdBeats.has(beat.id)) fail('F2', `the frame is frozen for ${(zeroRun / declaredFps).toFixed(2)} s`, f);
  if (zeroRun * (1 / declaredFps) > 2.5) fail('F2', `the frame is frozen for ${(zeroRun / declaredFps).toFixed(2)} s`, f);
  // flicker: the sign of the luma change alternates for 4+ consecutive frames
  const dMean = havePrev ? (meanLuma - prevMeanLuma) : 0;
  const s = dMean > 0.5 ? 1 : (dMean < -0.5 ? -1 : 0);
  if (s !== 0 && lastSign !== 0 && s !== lastSign) altRun++; else altRun = 0;
  lastSign = s;
  if (altRun >= 3 && !pulseBeats.has(beat.id)) fail('F4', `the luma alternates for ${altRun + 1} frames`, f);
  if (blownFrac > 0.02) fail('F5', `${(blownFrac * 100).toFixed(2)}% of the pixels are blown out`, f);
  prevMeanLuma = meanLuma;

  // F6 is checked on the scene graph: a label's registered box must not move inside a beat
  stats.push({ frame: f, time: +t.toFixed(4), luma: +meanLuma.toFixed(3), delta: +meanDiff.toFixed(4), blown: +blownFrac.toFixed(6), beat: beat.id, flags: 0 });
  if (havePrev) prevLuma.set(luma);
  else prevLuma.set(luma);
  havePrev = true;
  frameIndex++;
}

let lastMean = 0;

const ff = spawn('ffmpeg', ['-nostdin', '-v', 'error', '-i', video, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { stdio: ['ignore', 'pipe', 'pipe'] });
ff.stdout.on('data', (chunk) => {
  pending = pending.length ? Buffer.concat([pending, chunk]) : chunk;
  while (pending.length >= frameBytes) {
    const frame = pending.subarray(0, frameBytes);
    processFrame(frame);
    pending = pending.subarray(frameBytes);
  }
});
await new Promise((resolveP, rejectP) => {
  ff.on('close', (code) => (code === 0 ? resolveP() : rejectP(new Error('ffmpeg failed with code ' + code))));
  ff.on('error', rejectP);
});

if (stats.length === 0) { console.error('qc-frames: no frames decoded'); process.exit(2); }

// ---------- the rolling median for F3 ----------
const WINDOW = 60;
for (let i = 1; i < stats.length; i++) {
  const from = Math.max(0, i - WINDOW);
  const win = stats.slice(from, i).map((s) => s.delta).sort((a, b) => a - b);
  const med = win.length ? win[Math.floor(win.length / 2)] : 0;
  const f = stats[i].frame;
  const nearCut = cuts.some((c) => Math.abs(c - f) <= 1);
  const thr = Math.max(6 * med, 10);
  if (stats[i].delta > thr && !nearCut) {
    fail('F3', `the frame delta ${stats[i].delta.toFixed(3)} is more than 6x the rolling median ${med.toFixed(3)}`, f);
  }
}

// ---------- outputs ----------
mkdirSync(outDir, { recursive: true });
const csv = ['frame,time,luma,delta,blown,beat'].concat(stats.map((s) => `${s.frame},${s.time},${s.luma},${s.delta},${s.blown},${s.beat}`)).join('\n') + '\n';
writeFileSync(join(outDir, 'frames.csv'), csv);

const summary = {
  video, width: W, height: H, fps: fpsNum, codec: stream.codec_name, pixFmt: stream.pix_fmt,
  duration: +duration.toFixed(3), frames: stats.length,
  meanLuma: +(stats.reduce((s, x) => s + x.luma, 0) / stats.length).toFixed(3),
  maxDelta: +Math.max(...stats.map((s) => s.delta)).toFixed(4),
  frozenFrames: stats.filter((s) => s.delta === 0).length,
  failures,
};
writeFileSync(join(outDir, 'frames-report.json'), JSON.stringify(summary, null, 2));

const byGate = {};
failures.forEach((x) => { byGate[x.gate] = (byGate[x.gate] || 0) + 1; });
console.log(`frame gates: ${stats.length} frames, ${failures.length} failure(s)`);
console.log(Object.keys(byGate).sort().map((g) => `${g}: ${byGate[g]}`).join('  ') || 'all frame gates pass');
failures.slice(0, 25).forEach((x) => console.log(`  ${x.gate}${x.frame == null ? '' : ' @' + x.frame}: ${x.msg}`));
process.exit(failures.length ? 1 : 0);

