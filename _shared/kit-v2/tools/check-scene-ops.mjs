// kit-v2: validate the authored scene ops: every primitive must have the fields its
// drawing needs, and every op must be known.
//   node tools/check-scene-ops.mjs <episodeDir> ...
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const NEEDS = {
  rect: ['x', 'y', 'w', 'h'],
  circle: ['x', 'y', 'r'],
  line: ['x1', 'y1', 'x2', 'y2'],
  poly: ['pts'],
  arc: ['x', 'y', 'r', 'a0', 'a1'],
  arrow: ['x1', 'y1', 'x2', 'y2'],
  drop: ['x', 'y', 'r'],
  gauge: ['x', 'y'],
  spark: ['x', 'y', 'r'],
  zigzag: ['pts'],
  dot: ['x', 'y'],
  text: ['s', 'x', 'y'],
};
const OPS = new Set(['x:draw', 'x:hero', 'x:people', 'x:flow', 'text', 'stack', 'panel', 'stamp', 'tag', 'numberCard', 'titleCard', 'sourceChip', 'prop', 'railLabel', 'leader', 'chart', 'map']);

let bad = 0;
for (const dir of process.argv.slice(2)) {
  const p = join(resolve(dir), 'src', 'scene-ops.json');
  const ops = JSON.parse(readFileSync(p, 'utf8'));
  const errs = [];
  for (const id of Object.keys(ops)) {
    for (const op of ops[id]) {
      if (!OPS.has(op.op)) errs.push(`${id}: unknown op "${op.op}"`);
      if (op.op === 'x:draw') {
        for (const prim of op.prims || []) {
          if (!NEEDS[prim.k]) { errs.push(`${id}: unknown primitive "${prim.k}"`); continue; }
          for (const f of NEEDS[prim.k]) {
            if (prim[f] === undefined || prim[f] === null) errs.push(`${id}: primitive "${prim.k}" is missing "${f}"`);
          }
        }
      }
      if (op.op === 'x:hero' && !op.kind) errs.push(`${id}: x:hero without a kind`);
      if (op.op === 'panel' && !op.name) errs.push(`${id}: panel without a name`);
      if (op.op === 'chart' && !op.row && !op.items) errs.push(`${id}: chart without a row`);
    }
  }
  if (errs.length) { bad += errs.length; console.log(dir + ':'); errs.forEach((e) => console.log('  ' + e)); }
  else console.log(dir + ': ok');
}
process.exit(bad ? 1 : 0);
