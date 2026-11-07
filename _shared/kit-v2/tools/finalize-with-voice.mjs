// kit-v2: finalize-with-voice. The command the user runs once the voice recording exists.
//
//   node _shared/kit-v2/tools/finalize-with-voice.mjs --episode <episodeDir> [--voice <wav|dir>]
//
// It re-times the episode from the recording, rebuilds the page, re-renders at the master
// resolution, re-runs the gates and muxes the voice in. Without a recording it stops with a
// clear message and changes nothing.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, mkdtempSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { KIT_ROOT, RENDER_ROOT, HYPERFRAMES_BIN } from './paths.mjs';

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const dir = resolve(flag('episode', ''));
if (!dir) { console.error('usage: node finalize-with-voice.mjs --episode <episodeDir> [--voice <wav|dir>]'); process.exit(2); }
const voice = flag('voice', '');
const voiceDir = join(dir, 'audio', 'voice');
const hasVoice = voice || (existsSync(voiceDir) && readdirSync(voiceDir).some((f) => f.endsWith('.wav')));

if (!hasVoice) {
  console.error('finalize-with-voice: no recording found.');
  console.error('Put the voice in ' + voiceDir + ' as P01.wav ... P10.wav (one file per passage)');
  console.error('or as full.wav (the whole narration in one file), then run this again.');
  console.error('Nothing was changed.');
  process.exit(3);
}

const titleSlug = process.env.BB_TITLE_SLUG || '';
function run(cmd, label) {
  console.log('--- ' + label);
  const r = spawnSync(process.execPath, cmd, { encoding: 'utf8', stdio: 'inherit' });
  if (r.status !== 0) { console.error('failed: ' + label); process.exit(r.status || 1); }
}

// 1. measure the passages from the recording
run([join(KIT_ROOT, 'engine', 'retime.mjs'), '--episode', dir, '--write'], 'retime: measure the passages');

// 2. rebuild the page and the timeline on the measured timing
run([join(KIT_ROOT, 'skills', 'bb-explain', 'bb-explain.mjs'), '--episode', dir, '--write'], 'bb-explain: rebuild the beats');
run([join(KIT_ROOT, 'tools', 'build-episode.mjs'), dir, '--size', '1920x1080', '--timing', 'measured'], 'build: the page and the timeline');

// 3. the gates, without a render
run([join(KIT_ROOT, 'tools', 'qc-scene.mjs'), dir], 'qc-scene: the scene-graph gates');

// 4. the render
const id = dir.split(/[\\/]/).pop().slice(0, 3);
mkdirSync(join(RENDER_ROOT, id));
const out = join(RENDER_ROOT, id, `${id}-final.mp4`);
console.log('--- render');
const r = spawnSync(process.execPath, [HYPERFRAMES_BIN, 'render', dir, '-o', out, '-q', 'standard', '-w', '4', '--no-browser-gpu', '--quiet'], { encoding: 'utf8', stdio: 'inherit' });
if (r.status !== 0) { console.error('the render failed'); process.exit(r.status || 1); }

// 5. the frame gates
run([join(KIT_ROOT, 'tools', 'qc-frames.mjs'), dir, out], 'qc-frames: the frame gates');

// 6. the contact sheets
run([join(KIT_ROOT, 'tools', 'qc-sheets.mjs'), dir, out], 'qc-sheets: the contact sheets');

// 7. the voice
run([join(KIT_ROOT, 'tools', 'mux.mjs'), '--episode', dir, ...(voice ? ['--voice', voice] : [])], 'mux: the voice');
console.log('finalize-with-voice: done. The final film is in the episode folder and in FINAL/.');
