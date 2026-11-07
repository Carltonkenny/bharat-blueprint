// kit-v2: repair a JSON file whose bare object keys lost their quotes.
//   node tools/fix-json.mjs <file.json>
import { readFileSync, writeFileSync } from 'node:fs';

const p = process.argv[2];
if (!p) { console.error('usage: node tools/fix-json.mjs <file.json>'); process.exit(2); }
let s = readFileSync(p, 'utf8');
if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
const before = s;
s = s.replace(/([{,]\s*)([a-zA-Z][a-zA-Z0-9]*)(\s*:)/g, (m, a, k, c) => `${a}"${k}"${c}`);
if (s !== before) writeFileSync(p, s, 'utf8');
try {
  JSON.parse(readFileSync(p, 'utf8'));
  console.log('JSON OK', p);
} catch (e) {
  console.log('JSON ERROR', p, e.message);
  process.exit(1);
}
