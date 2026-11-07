// kit-v2: the final mux. Puts the user's own voice into a finished render.
//   node tools/mux.mjs --episode <episodeDir> [--voice <wav|dir>] [--out <name>] [--dry-run]
//
// The voice is the user's own recording: per-passage files audio/voice/P01.wav ... or one
// file audio/voice/full.wav. The mix targets -16 LUFS integrated and a true peak of
// -1.5 dBTP, and the video stream is copied (no re-encode).
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const dir = resolve(flag('episode', ''));
if (!dir) { console.error('usage: node tools/mux.mjs --episode <episodeDir> [--voice <wav>] [--out <name>]'); process.exit(2); }
const dry = args.includes('--dry-run');

const episode = JSON.parse(readFileSync(join(dir, 'episode.s2.json'), 'utf8'));
const id = episode.id;
const renders = join(dir, 'renders');
const video = join(renders, `Bharat-Blueprint_S02${id}_${process.env.BB_TITLE_SLUG || 'FILM'}_NOVOICE.mp4`);
const fallback = readdirSync(renders).filter((f) => f.endsWith('_NOVOICE.mp4'))[0];
const src = existsSync(video) ? video : join(renders, fallback);

// the voice: per-passage files, or one file
let voiceFiles = [];
const voiceArg = flag('voice', '');
const voiceDir = join(dir, 'audio', 'voice');
if (voiceArg) {
  const v = resolve(voiceArg);
  if (existsSync(v) && !readdirSync(v).length) voiceFiles = [v];
  else if (existsSync(v) && v.endsWith('.wav')) voiceFiles = [v];
  else if (existsSync(v)) voiceFiles = readdirSync(v).filter((f) => f.endsWith('.wav')).map((f) => join(v, f));
} else if (existsSync(voiceDir)) {
  const files = readdirSync(voiceDir).filter((f) => f.endsWith('.wav'));
  const perPassage = episode.passages.map((p) => join(voiceDir, `${p.id}.wav`)).filter((f) => existsSync(f));
  voiceFiles = perPassage.length === episode.passages.length && perPassage.length
    ? perPassage
    : (files.includes('full.wav') ? [join(voiceDir, 'full.wav')] : files.map((f) => join(voiceDir, f)));
}

if (!voiceFiles.length) {
  console.error('mux: no voice found. Put audio/voice/P01.wav ... or audio/voice/full.wav in the episode folder.');
  process.exit(3);
}

const outName = flag('out', `Bharat-Blueprint_S02${id}_FINAL.mp4`);
const out = join(renders, outName);

// build the voice track: the per-passage files in passage order, with a short gap between
let inputArgs = [];
let filter;
if (voiceFiles.length === 1) {
  inputArgs = ['-i', voiceFiles[0]];
  filter = '[1:a]aresample=48000,loudnorm=I=-16:TP=-1.5:LRA=11';
} else {
  inputArgs = [];
  voiceFiles.forEach((f) => inputArgs.push('-i', f));
  const labels = voiceFiles.map((_, i) => `[${i + 1}:a]`).join('');
  filter = `${labels}concat=n=${voiceFiles.length}:v=0:a=1,aresample=48000,loudnorm=I=-16:TP=-1.5:LRA=11[a]`;
}

const cmd = ['-nostdin', '-v', 'error', '-y', '-i', src, ...inputArgs,
  '-filter_complex', `${filter}[a]`, '-map', '0:v', '-map', '[a]',
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', out];

console.log('mux: ' + basename(src) + ' + ' + voiceFiles.length + ' voice file(s) -> ' + outName);
if (dry) { console.log('(dry run)'); console.log('ffmpeg ' + cmd.join(' ')); process.exit(0); }
mkdirSync(renders, { recursive: true });
const r = spawnSync('ffmpeg', cmd, { encoding: 'utf8' });
if (r.status !== 0) { console.error('mux: ffmpeg failed\n' + (r.stderr || '').toString().slice(0, 600)); process.exit(1); }
copyFileSyncSafe(out, join(dir, '..', 'FINAL', outName));

function copyFileSyncSafe(a, b) {
  mkdirSync(join(b, '..'), { recursive: true });
  try { require('node:fs').copyFileSync(a, b); } catch (e) { /* the FINAL copy is best effort */ }
}

// measure the result
const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out], { encoding: 'utf8' });
console.log('mux: done, ' + (probe.stdout || '').trim() + ' s');
