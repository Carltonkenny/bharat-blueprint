// kit-v2: retime. Turns the user's recording into measured passage durations.
//
//   node engine/retime.mjs --episode <episodeDir> [--write] [--confirm]
//
// Two cases (08_S02_VISUAL_ENGINE_SPEC.md section 5):
//   1. per-passage files audio/voice/P01.wav ... -> exact durations from ffprobe
//   2. one file audio/voice/full.wav -> ffmpeg silencedetect (noise -35 dB, min 0.35 s),
//      then the N-1 longest pauses that best match the passage word-count proportions.
//      The proposed boundaries are printed for the user to confirm; the tool never
//      guesses silently. If the number of usable pauses does not match, it refuses.
//
// Output: timing/measured.json  { "P01": 25.6, ... }
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

export function probeDuration(file) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' });
  if (r.status !== 0) return null;
  const v = parseFloat((r.stdout || '').trim());
  return isFinite(v) ? v : null;
}

// find the silences in a file: returns the pause mid points and their lengths
export function detectSilences(file, noise = '-35dB', minSilence = 0.35) {
  const r = spawnSync('ffmpeg', ['-nostdin', '-v', 'info', '-i', file, '-af', `silencedetect=noise=${noise}:d=${minSilence}`, '-f', 'null', '-'], { encoding: 'utf8' });
  const out = (r.stderr || '') + (r.stdout || '');
  // ffmpeg prints silence_start and silence_end on separate lines
  const starts = [...out.matchAll(/silence_start:\s*(-?[\d.]+)/g)].map((m) => parseFloat(m[1]));
  const ends = [...out.matchAll(/silence_end:\s*([\d.]+)/g)].map((m) => parseFloat(m[1]));
  const pauses = [];
  starts.forEach((s, i) => {
    const e = ends[i];
    if (e != null && e > s) pauses.push({ start: s, end: e, len: e - s });
  });
  return pauses;
}

// Choose the N-1 boundaries. The candidates are the N-1 longest pauses. The speech time
// is the total minus those pauses; the ideal boundary after passage k is the share of
// the speech time up to k plus the silences that come before it. A passage ends where
// the silence starts.
export function chooseBoundaries(pauses, passageWords, totalSec) {
  const N = passageWords.length;
  if (pauses.length < N - 1) {
    return { error: `only ${pauses.length} usable pause(s) for ${N} passages; ${N - 1} are needed` };
  }
  const candidates = pauses.slice().sort((a, b) => b.len - a.len).slice(0, N - 1).sort((a, b) => a.start - b.start);
  const totalWords = passageWords.reduce((s, w) => s + w, 0) || 1;
  const silence = candidates.reduce((s, p) => s + p.len, 0);
  const speech = Math.max(0.1, totalSec - silence);

  const chosen = [];
  let cumWords = 0, cumSilence = 0;
  for (let k = 0; k < N - 1; k++) {
    cumWords += passageWords[k];
    const ideal = speech * (cumWords / totalWords) + cumSilence;
    const cand = candidates[k];
    chosen.push({ pause: k, at: cand.start, ideal, error: Math.abs(cand.start - ideal), len: cand.len });
    cumSilence += cand.len;
  }
  return { chosen, candidates };
}

export function retime(episodeDir) {
  const dir = resolve(episodeDir);
  const voice = join(dir, 'audio', 'voice');
  if (!existsSync(voice)) return { error: 'no audio/voice folder: the narrator has not recorded yet' };
  const passages = JSON.parse(readFileSync(join(dir, 'episode.s2.json'), 'utf8')).passages || [];
  const files = existsSync(voice) ? readdirSync(voice).filter((f) => f.endsWith('.wav')) : [];

  // case 1: one file per passage
  const perPassage = passages.filter((p) => files.includes(`${p.id}.wav`));
  if (perPassage.length === passages.length && passages.length > 0) {
    const out = {};
    perPassage.forEach((p) => { out[p.id] = +probeDuration(join(voice, `${p.id}.wav`)).toFixed(4); });
    return { mode: 'per-passage', durations: out, total: +Object.values(out).reduce((s, v) => s + v, 0).toFixed(3) };
  }

  // case 2: one file for the whole film
  if (files.includes('full.wav')) {
    const file = join(voice, 'full.wav');
    const dur = probeDuration(file);
    const pauses = detectSilences(file);
    const words = passages.map((p) => p.words || String(p.text || '').split(/\s+/).filter(Boolean).length);
    const { chosen, error } = chooseBoundaries(pauses, words, dur);
    if (error) return { mode: 'single', error, pauses: pauses.length, needed: passages.length - 1 };
    const out = {};
    let speechStart = 0;
    for (let i = 0; i < passages.length; i++) {
      if (i < chosen.length) {
        // the passage ends where its pause starts; the pause itself is not speech
        out[passages[i].id] = +(chosen[i].at - speechStart).toFixed(4);
        speechStart = chosen[i].at + chosen[i].len;
      } else {
        out[passages[i].id] = +(dur - speechStart).toFixed(4);
      }
    }
    return { mode: 'single', durations: out, boundaries: chosen, pauses: pauses.length, total: +dur.toFixed(3) };
  }
  return { error: `audio/voice holds ${files.length} wav file(s) but not a usable set (need P01.wav... or full.wav)` };
}

function main() {
  const args = process.argv.slice(2);
  const i = args.indexOf('--episode');
  if (i < 0) { console.error('usage: node retime.mjs --episode <episodeDir>'); process.exit(2); }
  const dir = resolve(args[i + 1]);
  const r = retime(dir);
  if (r.error) {
    console.error('retime: ' + r.error);
    if (r.pauses != null) console.error(`  usable pauses found: ${r.pauses}, needed: ${r.needed}`);
    process.exit(3); // refuse to guess
  }
  console.log(`retime (${r.mode}): ${r.total} s`);
  Object.entries(r.durations).forEach(([k, v]) => console.log(`  ${k}: ${v} s`));
  if (r.mode === 'single') {
    console.log('proposed boundaries (confirm before use):');
    r.boundaries.forEach((b) => console.log(`  ${b.at.toFixed(3)} s (ideal ${b.ideal.toFixed(3)} s, off by ${(b.error * 1000).toFixed(0)} ms)`));
    if (!args.includes('--confirm')) {
      console.log('not written: run again with --confirm once you have checked the boundaries');
      return;
    }
  }
  if (args.includes('--write')) {
    mkdirSync(join(dir, 'timing'), { recursive: true });
    writeFileSync(join(dir, 'timing', 'measured.json'), JSON.stringify(r.durations, null, 2) + '\n');
    console.log('written timing/measured.json');
  }
}

if (process.argv[1] && process.argv[1].endsWith('retime.mjs')) main();

