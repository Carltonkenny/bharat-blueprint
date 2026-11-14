// kit-v2 / S03: place each narrated passage at its beat start on the timeline, normalise to -16 LUFS,
// and mux over the silent render (video copied, not re-encoded).
//   node tools/s03-mux.mjs <episodeDir> <silentVideo> <outName> [--dry-run]
import { readFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const [dirArg, videoArg, outName] = process.argv.slice(2);
const dry = process.argv.includes('--dry-run');
const dir = resolve(dirArg);
const ep = JSON.parse(readFileSync(join(dir, 'episode.s2.json'), 'utf8'));
const tl = JSON.parse(readFileSync(join(dir, 'timing', 'timeline.json'), 'utf8'));
const finDir = join(dir, 'audio', 'voice_jupiter_v1', 'final');
const video = resolve(videoArg);
const out = join(dir, 'renders', outName);

const starts = {};
for (const b of tl.beats) if (starts[b.p] == null) starts[b.p] = b.t0;
const inputs = ['-i', video], chains = [];
ep.passages.forEach((p, i) => {
  const f = join(finDir, p.id + '.wav');
  if (!existsSync(f)) { console.error('mux: missing ' + f); process.exit(3); }
  inputs.push('-i', f);
  chains.push(`[${i + 1}:a]aresample=48000,adelay=${Math.round(starts[p.id] * 1000)}:all=1[a${i}]`);
});
const mix = `${ep.passages.map((_, i) => `[a${i}]`).join('')}amix=inputs=${ep.passages.length}:normalize=0:duration=longest,apad=whole_dur=${tl.duration},atrim=0:${tl.duration},loudnorm=I=-16:TP=-1.5:LRA=11[a]`;
const cmd = ['-nostdin', '-v', 'error', '-y', ...inputs, '-filter_complex', chains.concat(mix).join(';'), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', out];
if (dry) { console.log('ffmpeg ' + cmd.join(' ')); process.exit(0); }
mkdirSync(join(dir, 'renders'), { recursive: true });
const r = spawnSync('ffmpeg', cmd, { encoding: 'utf8' });
if (r.status !== 0) { console.error('mux: ffmpeg failed\n' + (r.stderr || '').slice(0, 800)); process.exit(1); }
const pr = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out], { encoding: 'utf8' });
console.log('mux: wrote ' + out + ' (' + pr.stdout.trim() + ' s)');
