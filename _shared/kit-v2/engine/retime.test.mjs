// kit-v2: retime test. Builds synthetic WAVs (tones separated by silences) and checks
// that the passage boundaries are recovered within 50 ms, and that the tool refuses to
// guess when the counts do not match.
//   node _shared/kit-v2/engine/retime.test.mjs
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { retime, detectSilences, chooseBoundaries, probeDuration } from './retime.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const tmp = join(process.env.LOCALAPPDATA || '.', 'BharatBlueprint', 'render', 'S02', 'retime-test');
const results = [];
const ok = (name, pass, detail = '') => results.push({ name, pass: !!pass, detail });

// build a synthetic recording: 3 passages of tone separated by silences
function makeWav(path, seconds) {
  const r = spawnSync('ffmpeg', ['-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', `sine=frequency=440:duration=${seconds}`, '-ac', '1', '-ar', '16000', path], { encoding: 'utf8' });
  return r.status === 0;
}

if (existsSync(tmp)) rmSync(tmp, { recursive: true, force: true });
mkdirSync(join(tmp, 'audio', 'voice'), { recursive: true });
mkdirSync(join(tmp, 'sources'), { recursive: true });
writeFileSync(join(tmp, 'episode.s2.json'), JSON.stringify({
  passages: [
    { id: 'P01', text: 'one two three four five six seven eight nine ten', words: 10, estSec: 10 },
    { id: 'P02', text: 'one two three four five six seven eight nine ten one two three four five six seven eight nine ten', words: 20, estSec: 10 },
    { id: 'P03', text: 'one two three four five six seven eight nine ten one two three four five six seven eight nine ten one two three four five six seven eight nine ten', words: 30, estSec: 10 },
  ],
}));

// per-passage files
ok('retime: the synthetic per-passage wavs are written',
  makeWav(join(tmp, 'audio', 'voice', 'P01.wav'), 2.0) &&
  makeWav(join(tmp, 'audio', 'voice', 'P02.wav'), 3.0) &&
  makeWav(join(tmp, 'audio', 'voice', 'P03.wav'), 4.0));
const per = retime(tmp);
ok('retime: the per-passage mode gives the exact durations', per.mode === 'per-passage' && Math.abs(per.durations.P01 - 2) < 0.05 && Math.abs(per.durations.P03 - 4) < 0.05, JSON.stringify(per.durations));

// one file for the whole film: three 2 s passages separated by 0.6 s silences
rmSync(join(tmp, 'audio', 'voice'), { recursive: true, force: true });
mkdirSync(join(tmp, 'audio', 'voice'), { recursive: true });
const whole = join(tmp, 'audio', 'voice', 'full.wav');
const rc = spawnSync('ffmpeg', ['-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2', '-f', 'lavfi', '-i', 'anullsrc=r=16000:cl=mono:d=0.6', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=4', '-f', 'lavfi', '-i', 'anullsrc=r=16000:cl=mono:d=0.6', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=6', '-filter_complex', '[0:a][1:a][2:a][3:a][4:a]concat=n=5:v=0:a=1[out]', '-map', '[out]', '-ac', '1', '-ar', '16000', whole], { encoding: 'utf8' });
ok('retime: the synthetic whole-film wav is written', rc.status === 0 && existsSync(whole));
const dur = probeDuration(whole);
ok('retime: the whole-film wav is about 13.2 s', Math.abs(dur - 13.2) < 0.2, String(dur));
const pauses = detectSilences(whole);
ok('retime: two silences are found', pauses.length === 2, JSON.stringify(pauses.map((p) => +p.len.toFixed(2))));
const { chosen, error } = chooseBoundaries(pauses, [10, 10, 10], dur);
ok('retime: the boundaries are chosen', !error && chosen.length === 2, error || '');
ok('retime: the boundaries are within 50 ms of the true ones',
  chosen && Math.abs(chosen[0].at - 2.0) < 0.05 && Math.abs(chosen[1].at - 6.6) < 0.05,
  chosen ? chosen.map((c) => c.at.toFixed(3)).join(', ') : '');
const single = retime(tmp);
ok('retime: the single-file mode returns three durations', single.mode === 'single' && Object.keys(single.durations).length === 3, JSON.stringify(single.durations));
ok('retime: the single-file durations are close to the truth',
  single && Math.abs(single.durations.P01 - 2.0) < 0.05 && Math.abs(single.durations.P02 - 4.0) < 0.05 && Math.abs(single.durations.P03 - 6.0) < 0.1,
  single ? JSON.stringify(single.durations) : '');

// refuses to guess when the counts do not match
const bad = chooseBoundaries([{ start: 1, end: 1.5, len: 0.5 }], [10, 10, 10, 10], 10);
ok('retime: it refuses to guess when there are not enough pauses', !!bad.error, bad.error || '');

let n = 0;
for (const r of results) { if (!r.pass) n++; console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? '  [' + r.detail + ']' : ''}`); }
console.log(n ? `${n} failing` : 'all passing');
process.exit(n ? 1 : 0);



