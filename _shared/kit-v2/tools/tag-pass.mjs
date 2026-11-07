// kit-v2: add a CONCEPTUAL/SCHEMATIC tag to every hero beat that lacks one, and a
// FICTIONAL SCENARIO stamp to every beat of the flagged passage.
//   node tools/tag-pass.mjs <episodeDir> <tagText> <fictionalPassageIds>
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dir = resolve(process.argv[2]);
const tagText = process.argv[3] || 'CONCEPTUAL, NOT TO SCALE';
const fictional = (process.argv[4] || '').split(',').filter(Boolean);
if (!dir) { console.error('usage: node tools/tag-pass.mjs <episodeDir> [tag] [P08,...]'); process.exit(2); }
const p = join(dir, 'src', 'scene-ops.json');
const ops = JSON.parse(readFileSync(p, 'utf8'));
let tagged = 0, stamped = 0;
for (const id of Object.keys(ops)) {
  const list = ops[id];
  const hasHero = list.some((o) => o.op === 'x:hero');
  const hasTag = list.some((o) => o.op === 'tag');
  if (hasHero && !hasTag) { list.push({ op: 'tag', text: tagText }); tagged++; }
}
writeFileSync(p, JSON.stringify(ops, null, 2) + '\n');
console.log('hero tags added:', tagged, ' stamps:', stamped, ' fictional passages:', fictional.join(','));
