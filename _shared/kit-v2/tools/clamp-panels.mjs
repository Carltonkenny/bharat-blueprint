// kit-v2: add the safe-area clamp to the panel library's labels.
//   node tools/clamp-panels.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const p = resolve(here, '..', 'src', 'panels.js');
let s = readFileSync(p, 'utf8');
const before = s;
s = s.replace(/\{ align: 'center',/g, "{ align: 'center', clamp: true,");
s = s.replace(/\{ align: 'left',/g, "{ align: 'left', clamp: true,");
s = s.replace(/\{ align: 'right',/g, "{ align: 'right', clamp: true,");
if (s !== before) writeFileSync(p, s, 'utf8');
console.log('panel labels clamped:', before !== s);
