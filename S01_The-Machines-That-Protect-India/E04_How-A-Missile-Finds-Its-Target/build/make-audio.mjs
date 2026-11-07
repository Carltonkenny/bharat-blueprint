// Builds the Episode 2 soundtrack from code: trimmed narration clips placed at their measured start times, soft
// synthesised sound design tied to beats (pen, sweep, ticks, thumps, title chord), a quiet drone bed that ducks under
// the voice, then a loudness pass to -16 LUFS. Run after audio/trim/*.wav exist: node build/make-audio.mjs
// Output: audio/mix.wav (stereo 48 kHz) and a measurement report on stdout. Requires ffmpeg on PATH.
import puppeteer from 'puppeteer-core';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const SR = 48000, OUT = 'audio';
const exe = process.env.CHROME_PATH || 'C:/Users/user/.cache/puppeteer/chrome-headless-shell/win64-156.0.8078.47/chrome-headless-shell-win64/chrome-headless-shell.exe';
const ff = (args) => execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: ['ignore', 'pipe', 'inherit'] });

// ---- 1. read the timeline from the film itself, so sound can never drift from picture ----
const browser = await puppeteer.launch({ executablePath: exe, headless: 'shell', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve('index.html')).href);
await page.evaluate(() => document.fonts.ready);
const film = await page.evaluate(() => ({
  duration: window.DURATION, titleAt: window.TIMING.TITLE_AT,
  clips: window.TIMING.clips.map((c) => ({ id: c.id, start: c.start, dur: c.dur })),
  beats: window.BEATS.map((b) => ({ id: b.id, t0: b.t0, t1: b.t1, tr: b.tr || null, d: b.d || 0 })),
}));
await browser.close();
mkdirSync(`${OUT}/fx`, { recursive: true });

// ---- 2. one-shot sound sources (deterministic: fixed noise seeds) ----
const synth = (name, src, filters) => { const p = `${OUT}/fx/${name}.wav`; ff(['-f', 'lavfi', '-i', src, '-af', filters, '-ar', String(SR), '-ac', '1', p]); return p; };
const fx = {
  pen: [1, 2, 3].map((s) => synth(`pen${s}`, `anoisesrc=d=0.55:c=pink:r=${SR}:seed=${s * 7}:a=0.5`, 'bandpass=f=4200:w=2600,tremolo=f=31:d=0.85,afade=t=in:d=0.06,afade=t=out:st=0.3:d=0.25')),
  sweep: synth('sweep', `anoisesrc=d=1.0:c=white:r=${SR}:seed=11:a=0.5`, 'highpass=f=500,lowpass=f=4200,afade=t=in:d=0.45,afade=t=out:st=0.5:d=0.5'),
  tick: synth('tick', `sine=f=1900:d=0.03:r=${SR}`, 'afade=t=out:st=0.004:d=0.026'),
  thump: synth('thump', `sine=f=82:d=0.4:r=${SR}`, 'afade=t=in:d=0.004,afade=t=out:st=0.03:d=0.37'),
  chord: synth('chord', `aevalsrc=0.5*sin(2*PI*110*t)+0.35*sin(2*PI*164.81*t)+0.25*sin(2*PI*220*t):d=4.5:s=${SR}`, 'afade=t=in:d=0.8,afade=t=out:st=1.2:d=3.3,lowpass=f=900'),
};
const bedLen = Math.ceil(film.duration + 1);
const bed = `${OUT}/fx/bed.wav`;
ff(['-f', 'lavfi', '-i', `aevalsrc=0.5*sin(2*PI*55*t)+0.35*sin(2*PI*82.41*t)+0.2*sin(2*PI*110*t):d=${bedLen}:s=${SR}`,
  '-af', `tremolo=f=0.12:d=0.35,lowpass=f=260,afade=t=in:d=4,afade=t=out:st=${bedLen - 5}:d=5`, '-ac', '1', bed]);

// ---- 3. events: where each sound lands ----
const voice = film.clips.map((c) => ({ file: `${OUT}/trim/${c.id}.wav`, at: c.start }));
const sfx = [];
film.beats.forEach((b, i) => {
  if (i === 0) return;
  if (b.tr === 'wipe') sfx.push({ file: fx.sweep, at: b.t0 - 0.3, vol: 1 });
  else sfx.push({ file: fx.pen[i % 3], at: b.t0 - 0.25, vol: 0.8 });
});
sfx.push({ file: fx.pen[0], at: 0.1, vol: 0.8 });

const fic = film.clips.find((c) => c.id === 'f31');
sfx.push({ file: fx.thump, at: fic.start - 0.1, vol: 0.7 });   // FICTIONAL SCENARIO stamp
sfx.push({ file: fx.chord, at: film.titleAt, vol: 1 });        // title, after the silence

// ---- 4. mix a set of timed one-shots into a single mono track of the full length ----
function track(events, name) {
  const out = `${OUT}/${name}.wav`, args = [];
  events.forEach((e) => { if (!existsSync(e.file)) throw new Error('missing ' + e.file); args.push('-i', e.file); });
  const chains = events.map((e, i) => `[${i}:a]aresample=${SR},adelay=${Math.round(Math.max(0, e.at) * 1000)}:all=1,volume=${e.vol ?? 1}[a${i}]`);
  const mix = `${events.map((_, i) => `[a${i}]`).join('')}amix=inputs=${events.length}:normalize=0:duration=longest,apad=whole_dur=${film.duration},atrim=0:${film.duration}[o]`;
  const script = `${OUT}/${name}.filter.txt`; writeFileSync(script, chains.concat(mix).join(';\n'));
  ff([...args, '-filter_complex_script', script, '-map', '[o]', '-ac', '1', '-ar', String(SR), out]);
  return out;
}
const voiceT = track(voice, 'voice_track'), sfxT = track(sfx, 'sfx_track');

// ---- 5. level each stem to its target loudness, duck the rest under the voice, normalise the whole ----
// ffmpeg prints the ebur128 summary on stderr
function integratedLufs(file) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 64e6 });
  const m = /I:\s+(-?\d+(\.\d+)?)\s+LUFS/g; let last = null, x; while ((x = m.exec(r.stderr))) last = parseFloat(x[1]);
  if (last == null) throw new Error('no loudness for ' + file);
  return last;
}
const TARGET = { voice: -16, sfx: -34, bed: -38 };
const gain = (file, want) => Math.pow(10, (want - integratedLufs(file)) / 20);
const g = { voice: gain(voiceT, TARGET.voice), sfx: gain(sfxT, TARGET.sfx), bed: gain(bed, TARGET.bed) };
const rawMix = `${OUT}/mix_raw.wav`, mixPath = `${OUT}/mix.wav`;
ff(['-i', voiceT, '-i', sfxT, '-i', bed,
  '-filter_complex',
  `[0:a]volume=${g.voice},asplit=2[v][vsc];[1:a]volume=${g.sfx}[s];[2:a]volume=${g.bed},atrim=0:${film.duration},asetpts=N/SR/TB[b];` +
  `[s][b]amix=inputs=2:normalize=0[fx];[fx][vsc]sidechaincompress=threshold=0.015:ratio=6:attack=30:release=500[fxd];` +
  `[v][fxd]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=9,aformat=sample_rates=${SR}:channel_layouts=stereo[o]`,
  '-map', '[o]', '-t', String(film.duration), '-ar', String(SR), rawMix]);
// single-pass loudnorm lands about 1-2 LU low on this material: correct the remainder with a plain gain and a peak limiter
const fix = -16 - integratedLufs(rawMix);
ff(['-i', rawMix, '-af', `volume=${fix.toFixed(2)}dB,alimiter=limit=0.89:level=disabled`, '-ar', String(SR), mixPath]);

console.log(JSON.stringify({
  duration: film.duration, voiceClips: voice.length, sfxEvents: sfx.length,
  stemLufs: { voice: +integratedLufs(voiceT).toFixed(1), sfx: +integratedLufs(sfxT).toFixed(1), bed: +integratedLufs(bed).toFixed(1) },
  mixLufs: +integratedLufs(mixPath).toFixed(1),
}, null, 2));
