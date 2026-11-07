// kit-v2: move a hero op's tag into its own screen-space op, so the tag does not
// overlap with the outgoing beat's tag during a transition.
//   node tools/move-tags.mjs <episodeDir>
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dir = resolve(process.argv[2]);
if (!dir) { console.error('usage: node tools/move-tags.mjs <episodeDir>'); process.exit(2); }
const p = join(dir, 'src', 'scene-ops.json');
const ops = JSON.parse(readFileSync(p, 'utf8'));
let moved = 0;
for (const id of Object.keys(ops)) {
  const list = ops[id];
  const out = [];
  for (const op of list) {
    if (op.tag && op.op === 'x:hero') {
      const tag = op.tag;
      delete op.tag;
      out.push(op);
      out.push({ op: 'tag', text: tag });
      moved++;
    } else out.push(op);
  }
  ops[id] = out;
}
writeFileSync(p, JSON.stringify(ops, null, 2) + '\n');
console.log('tags moved:', moved);
