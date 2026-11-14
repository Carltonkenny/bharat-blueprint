// kit-v2 / S03: narration with Deepgram Aura-2 Jupiter (the S02 voice), one take per passage.
//   node tools/s03-voice.mjs <episodeDir> --estimate            characters and the rough cost, no call
//   node tools/s03-voice.mjs <episodeDir> --run [--max-chars N]  generate the passages that have no raw file yet
// Raw takes are never overwritten and never retried. The key comes from DEEPGRAM_API_KEY or
// ~/.ai/secrets/secrets.env and is never printed. Output:
//   audio/voice_jupiter_v1/raw/Pnn.wav   (as returned)
//   audio/voice_jupiter_v1/final/Pnn.wav (slowed 0.85x, 0.45 s pad)
//   timing/measured.json                 (passage id -> seconds of the final file)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const dir = resolve(args[0] || '.');
const run = args.includes('--run');
const mi = args.indexOf('--max-chars');
const maxChars = mi >= 0 ? Number(args[mi + 1]) : 6000;
const ep = JSON.parse(readFileSync(join(dir, 'episode.s2.json'), 'utf8'));
const base = join(dir, 'audio', 'voice_jupiter_v1');
const rawDir = join(base, 'raw'), finDir = join(base, 'final');
const MODEL = 'aura-2-jupiter-en';
const PRICE_PER_1K = 0.03; // USD, Deepgram's published Aura-2 pay-as-you-go rate (check the current price)

const items = ep.passages.map((p) => ({ id: p.id, text: p.text, chars: p.text.length, have: existsSync(join(rawDir, p.id + '.wav')) }));
const todo = items.filter((i) => !i.have);
const todoChars = todo.reduce((s, i) => s + i.chars, 0);
console.log(`voice: ${items.length} passages, ${todo.length} to generate, ${todoChars} characters, about $${((todoChars / 1000) * PRICE_PER_1K).toFixed(2)} at $${PRICE_PER_1K}/1K chars`);
items.forEach((i) => console.log(`  ${i.id} ${String(i.chars).padStart(4)} chars ${i.have ? '(raw take exists, skipped)' : ''}`));
if (!run) { console.log('(estimate only; pass --run to generate)'); process.exit(0); }
if (todoChars > maxChars) { console.error(`voice: ${todoChars} characters exceeds --max-chars ${maxChars}; refusing`); process.exit(3); }

function key() {
  if (process.env.DEEPGRAM_API_KEY) return process.env.DEEPGRAM_API_KEY.trim();
  const f = join(homedir(), '.ai', 'secrets', 'secrets.env');
  if (existsSync(f)) {
    const m = readFileSync(f, 'utf8').match(/^\s*DEEPGRAM_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/m);
    if (m) return m[1].trim();
  }
  return '';
}
const K = key();
if (todo.length && !K) { console.error('voice: no DEEPGRAM_API_KEY found'); process.exit(3); }

mkdirSync(rawDir, { recursive: true }); mkdirSync(finDir, { recursive: true });
for (const it of todo) {
  const url = `https://api.deepgram.com/v1/speak?model=${MODEL}&encoding=linear16&container=wav&sample_rate=48000`;
  const res = await fetch(url, { method: 'POST', headers: { Authorization: `Token ${K}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ text: it.text }) });
  if (!res.ok) { console.error(`voice: ${it.id} failed with HTTP ${res.status} (not retried)`); process.exit(1); }
  writeFileSync(join(rawDir, it.id + '.wav'), Buffer.from(await res.arrayBuffer()));
  console.log(`voice: ${it.id} generated`);
}

// post-process every passage and measure
const measured = {};
for (const p of ep.passages) {
  const raw = join(rawDir, p.id + '.wav'), fin = join(finDir, p.id + '.wav');
  const r = spawnSync('ffmpeg', ['-nostdin', '-v', 'error', '-y', '-i', raw, '-af', 'atempo=0.85,apad=pad_dur=0.45', '-ar', '48000', '-ac', '1', fin], { encoding: 'utf8' });
  if (r.status !== 0) { console.error('voice: ffmpeg failed for ' + p.id + ' ' + (r.stderr || '').slice(0, 200)); process.exit(1); }
  const pr = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', fin], { encoding: 'utf8' });
  measured[p.id] = Math.round(parseFloat(pr.stdout) * 1000) / 1000;
}
mkdirSync(join(dir, 'timing'), { recursive: true });
writeFileSync(join(dir, 'timing', 'measured.json'), JSON.stringify(measured, null, 1));
const total = Object.values(measured).reduce((s, v) => s + v, 0);
console.log(`voice: measured ${Object.keys(measured).length} passages, ${total.toFixed(1)} s of voice -> timing/measured.json`);
