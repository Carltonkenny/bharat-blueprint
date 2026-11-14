// E01 (The Railway Bridge Above a Gorge): authors the beat sheet from EPISODE_BRIEF.md and script.md.
// Output: src/beats.dsl.json, episode.s2.json (passages + metadata), src/episode.js (stub), src/camera.json.
// Run: node src/author.mjs   then: node ../../_shared/kit-v2/tools/compose-episode.mjs .
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---- passages from passages.md
const md = readFileSync(join(dir, 'passages.md'), 'utf8');
const parts = md.split(/^### (P\d+)\s*$/m);
const passages = [];
for (let i = 1; i < parts.length; i += 2) {
  const text = parts[i + 1].trim().replace(/\s*\n\s*/g, ' ');
  const words = (text.match(/[A-Za-z0-9'’-]+/g) || []).length;
  passages.push({ id: parts[i], text, estSec: Math.round((words / 2.42) * 10) / 10, flag: /^a fictional/i.test(text) ? 'FICTIONAL SCENARIO' : '', words });
}

// ---- beat helpers
const B = [];
let n = 0, scene = 0;
const add = (p, o) => { const sc = +p.slice(1); if (sc !== scene) { scene = sc; n = 0; } n += 1; const sparse = ['flow', 'number', 'timeline', 'route'].includes(o.tpl); const b = Object.assign({ id: `${sc}.${String(n).padStart(2, '0')}`, p, w: 1 }, o); if (sparse) b.w = Math.min(b.w, o.tpl === 'flow' ? 0.62 : 0.72); else if (o.tpl === 'hero' && o.w == null) b.w = 1.6; B.push(b); };
const hero = (p, kind, opts, title, extra) => add(p, Object.assign({ tpl: 'hero', kind, opts, title, tag: 'CONCEPTUAL, NOT TO SCALE', camAz: 40 }, extra, extra && extra.callouts ? { camAz: 14 } : {}));
const stmt = (p, lines, extra) => { const e = Object.assign({}, extra); if (!e.hero && !(e.size >= 100)) { e.hero = 'arch-gorge'; e.heroOpts = { stage: 'full', thrust: true }; e.camAz = 40; if (e.align) delete e.align; if (e.size > 64) e.size = 64; } add(p, Object.assign({ tpl: 'statement', lines, size: 70 }, e)); };
const flow = (p, title, nodes, links, extra) => add(p, Object.assign({ tpl: 'flow', title, nodes, links: links || 'chain', layout: 'row' }, extra));
const AG = 'arch-gorge';

// P01 the gap
hero('P01', AG, { stage: 'gap' }, 'A GORGE IN REASI, JAMMU AND KASHMIR', { sc: 'SC.1 · THE GAP', k: 'hook', camAz: 20, callouts: [{ fx: 0.5, fy: 0.9, t: 'THE RIVER' }, { fx: 0.12, fy: 0.12, t: 'ROCK' }] });
hero('P01', AG, { stage: 'gap' }, 'THE RIVER IS A THIN LINE, FAR BELOW', { camAz: -26, camEl: 18, callouts: [{ fx: 0.5, fy: 0.86, t: 'FAR BELOW' }] });
stmt('P01', ['NOW ASK THE', "ENGINEER'S QUESTION"], { hero: AG, heroOpts: { stage: 'gap' }, camAz: 14 });
hero('P01', AG, { stage: 'full' }, 'HOLD A RAILWAY LINE IN EMPTY AIR', { camAz: 18, callouts: [{ fx: 0.5, fy: 0.16, t: 'RAILWAY DECK' }, { fx: 0.5, fy: 0.56, t: 'STEEL ARCH' }] });
stmt('P01', ['ACROSS A GAP THAT WIDE,', 'FOR DECADES?'], { k: 'hook', size: 76, align: 'center', w: 1.3 });

// P02 two numbers
add('P02', { tpl: 'timeline', sc: 'SC.2 · TWO NUMBERS', title: 'THE CHENAB RAIL BRIDGE', items: [{ t: 'JUNE 2025', sub: 'INAUGURATED', hot: true, at: 0.5, size: 84 }] });
hero('P02', AG, { stage: 'full' }, 'A STEEL ARCH BRIDGE', { chain: '1,315 METRES LONG (PIB)', camAz: 14, callouts: [{ fx: 0.5, fy: 0.15, t: 'DECK' }, { fx: 0.5, fy: 0.55, t: 'ARCH' }] });
add('P02', { tpl: 'number', k: 'number', title: 'HOW HIGH IT STANDS', value: '359', unit: 'METRES ABOVE THE RIVERBED', note: 'PIB: HIGHER THAN THE EIFFEL TOWER', size: 150, chain: '359 M HIGH', source: 'PIB, 4 JUN 2025', w: 1.3 });
stmt('P02', ['COST: ABOUT', '1,486 CRORE RUPEES'], { sub: 'PIB FEATURES, BRIDGES OF INDIA', hero: AG, heroOpts: { stage: 'full' }, camAz: -18 });
flow('P02', 'TWO NUMBERS', [{ t: '359 M', sub: 'HOW HIGH IT STANDS' }, { t: 'VS' }, { t: '467 M', sub: 'HOW WIDE THE ARCH SPANS', hot: true }], 'chain', { w: 1.3 });
hero('P02', AG, { stage: 'full', load: true }, 'HOW HIGH, ABOVE THE RIVER', { camAz: 44 });
hero('P02', AG, { stage: 'full', thrust: true }, 'HOW WIDE, ACROSS THE ARCH', { camAz: 44 });
stmt('P02', ['TWO NUMBERS.', 'TWO DIFFERENT PROBLEMS.'], { k: 'payoff', size: 74, align: 'center' });

// P03 why it matters
add('P03', { tpl: 'route', sc: 'SC.3 · WHY IT MATTERS', title: 'THE UDHAMPUR-SRINAGAR-BARAMULLA RAIL LINK', pts: [{ t: 'KATRA', x: 0 }, { t: 'SRINAGAR', x: 1 }], segs: [{ from: 0.38, to: 0.62, t: 'CHENAB BRIDGE', hot: true }], source: 'PIB, 4 JUN 2025' });
add('P03', { tpl: 'number', k: 'number', title: 'KATRA TO SRINAGAR BY VANDE BHARAT', value: '3', unit: 'HOURS, ABOUT', note: '2 TO 3 HOURS LESS THAN BEFORE', size: 150, chain: 'ABOUT 3 H', source: 'PIB, 4 JUN 2025', w: 1.2 });
stmt('P03', ['A REASON TO CARE', 'THAT IS NOT ABOUT HEIGHT'], { hero: AG, heroOpts: { stage: 'full' }, camAz: 20 });
hero('P03', AG, { stage: 'full' }, 'THE BRIDGE IS ONE LINK IN THE LINE', { chain: 'USBRL', camAz: -12, callouts: [{ fx: 0.5, fy: 0.15, t: 'THE RAILWAY' }] });

// P04 idea 1: the arch
stmt('P04', ['IDEA ONE:', 'THE ARCH'], { sc: 'SC.4 · IDEA 1 · THE ARCH', hero: AG, heroOpts: { stage: 'full' }, camAz: 16, size: 86 });
add('P04', { tpl: 'figure', title: 'TWO PEOPLE, PALMS TOGETHER', pose: 'push', fig2: { pose: 'push', x: 1090, flip: true }, figX: 800, callouts: [{ t: 'EACH PUSHES SIDEWAYS', dx: 0, dy: -60 }], ground: 840, w: 1.2 });
add('P04', { tpl: 'figure', title: 'THE SIDEWAYS PUSH KEEPS BOTH UP', pose: 'push', poseTo: 'stand', hz: 0.5, fig2: { pose: 'push', poseTo: 'stand', x: 1090, flip: true }, figX: 800, callouts: [{ t: 'BOTH STAY UP', dx: 0, dy: -60 }], ground: 840 });
hero('P04', AG, { stage: 'full', load: true }, 'AN ARCH WORKS THE SAME WAY', { camAz: 16, callouts: [{ fx: 0.5, fy: 0.04, t: 'WEIGHT PRESSES DOWN' }] });
hero('P04', AG, { stage: 'full', thrust: true }, 'THE PUSH RUNS ALONG THE CURVE', { camAz: 10, callouts: [{ fx: 0.5, fy: 0.5, t: 'THE CURVE' }] });
hero('P04', AG, { stage: 'full', thrust: true }, 'AT THE TWO ENDS, THE PUSH GOES SIDEWAYS', { camAz: 28, callouts: [{ fx: 0.14, fy: 0.62, t: 'INTO THE LEFT HILLSIDE' }, { fx: 0.86, fy: 0.62, t: 'INTO THE RIGHT HILLSIDE' }] });
stmt('P04', ['THE ROCK HAS TO PUSH BACK.', 'THE GORGE WALLS BECOME', 'PART OF THE BRIDGE.'], { size: 64, hero: AG, heroOpts: { stage: 'full', thrust: true }, camAz: 22 });
flow('P04', 'BEFORE THE ARCH, AFTER IT', [{ t: 'BEFORE', sub: 'A GAP IS ONLY A GAP' }, { t: 'AFTER', sub: 'THE HILLS CARRY THE LOAD', hot: true }], 'chain', { w: 1.3 });

// P05 idea 2: from both sides
stmt('P05', ['IDEA TWO:', 'BUILDING ACROSS EMPTY AIR'], { sc: 'SC.5 · IDEA 2 · FROM BOTH SIDES', hero: AG, heroOpts: { stage: 'gap' }, camAz: 16, size: 72 });
hero('P05', AG, { stage: 'gap' }, 'NO SCAFFOLDING ON THE GORGE FLOOR', { camAz: 22, callouts: [{ fx: 0.5, fy: 0.75, t: 'TOO DEEP' }] });
hero('P05', AG, { stage: 'halves', growDur: 4.2 }, 'LONG ARCHES: BUILT FROM BOTH SIDES', { tag: 'A COMMON METHOD, CONCEPTUAL', camAz: 14, w: 1.4 });
hero('P05', AG, { stage: 'halves', growDur: 4.8 }, 'EACH HALF IS HELD UNTIL THEY MEET', { tag: 'A COMMON METHOD, CONCEPTUAL', camAz: -22, callouts: [{ fx: 0.1, fy: 0.12, t: 'HELD FROM BEHIND' }], w: 1.3 });
add('P05', { tpl: 'figure', title: 'TWO PEOPLE REACHING ACROSS A STREAM', pose: 'reach', fig2: { pose: 'reach', x: 1330, flip: true }, figX: 590, callouts: [{ t: 'EACH REACHES AS FAR AS THEY CAN', dx: 0, dy: -60 }], ground: 840 });
hero('P05', AG, { stage: 'full' }, 'WHEN THE HANDS MEET, THE ARCH HOLDS', { camAz: 16, callouts: [{ fx: 0.5, fy: 0.48, t: 'THE MIDDLE' }], w: 1.2 });
stmt('P05', ['A COMMON METHOD', 'FOR LONG ARCHES'], { size: 76, align: 'center' });

// P06 idea 3: wind
stmt('P06', ['IDEA THREE:', 'STANDING STILL IN THE WIND'], { sc: 'SC.6 · IDEA 3 · WIND', hero: AG, heroOpts: { stage: 'full', wind: true }, camAz: 18, size: 72 });
hero('P06', AG, { stage: 'full', wind: true, sway: true }, 'A TALL, SLIM STRUCTURE MOVES A LITTLE', { camAz: 14, w: 1.3 });
flow('P06', 'THE TREE IN A STORM', ['A TREE IN A STORM', { t: 'IT BENDS', sub: 'AND COMES BACK', hot: true }, 'IT SURVIVES']);
hero('P06', AG, { stage: 'full', wind: true }, 'DESIGNED FOR WIND AND EARTHQUAKES', { tag: 'PIB: ENGINEERED FOR WIND AND QUAKES', camAz: -20, callouts: [{ fx: 0.5, fy: 0.16, t: 'WIND' }], w: 1.3 });
flow('P06', 'BEFORE THE DESIGN, AFTER IT', [{ t: 'BEFORE THE DESIGN', sub: 'THE FORCES ARE GUESSES' }, { t: 'AFTER IT', sub: 'NUMBERS THE STEEL CARRIES EVERY DAY', hot: true }], 'chain', { w: 1.3 });
stmt('P06', ['STEEL THAT FLEXES', 'AND COMES BACK'], { size: 72, align: 'center' });

// P07 what is built
add('P07', { tpl: 'route', sc: 'SC.7 · WHAT IS BUILT, WHAT IS NOT', title: 'ONE CRUCIAL SEGMENT OF THE RAIL LINK', pts: [{ t: 'KATRA', x: 0 }, { t: 'SRINAGAR', x: 1 }], segs: [{ from: 0.28, to: 0.46, t: 'CHENAB BRIDGE', hot: true }], source: 'PIB, 4 JUN 2025' });
stmt('P07', ['ANJI KHAD BRIDGE:', "INDIA'S FIRST CABLE-STAYED", 'RAILWAY BRIDGE'], { sub: 'INAUGURATED JUNE 2025 (PIB)', size: 62 });
flow('P07', 'ONE BRIDGE IS NOT A RAILWAY', ['ONE BRIDGE', { t: 'IS NOT', hot: true }, 'A RAILWAY'], 'chain', { w: 1.3 });
stmt('P07', ['A ROUTE IS ONLY AS STRONG', 'AS ITS HARDEST LINK.'], { k: 'payoff', size: 68, align: 'center' });
hero('P07', AG, { stage: 'full' }, 'THIS WAS ONE OF THE HARDEST', { camAz: 16, callouts: [{ fx: 0.5, fy: 0.5, t: 'THE HARDEST LINK' }] });

// P08 the field
flow('P08', 'BRIDGES ARE NOT RANKED BY HEIGHT ALONE', ['HIGH', 'LONG', 'WIDE SPAN', 'HEAVY LOAD'], [], { sc: 'SC.8 · THE FIELD' });
flow('P08', 'EACH SOLVES A DIFFERENT PROBLEM', [{ t: 'HIGH', sub: 'THE CHENAB BRIDGE', hot: true }, 'LONG', 'WIDE SPAN', 'HEAVY LOAD'], [], { w: 1.3 });
stmt('P08', ['THE CHENAB BRIDGE IS HIGH,', 'WITH A LONG ARCH.'], { hero: AG, heroOpts: { stage: 'full' }, camAz: 20, size: 62 });
flow('P08', 'A DIFFERENT PROBLEM, LATER IN THIS SERIES', [{ t: 'THE CHENAB BRIDGE', sub: 'HIGH' }, { t: 'A BRIDGE ACROSS THE SEA', sub: 'LONG' }], [[0, 1, 'VS']]);
stmt('P08', ['MEASURES,', 'NOT A LEAGUE TABLE.'], { size: 80, align: 'center', k: 'payoff' });

// P09 what if (the stamp comes from the passage flag)
stmt('P09', ['WIND IS BUILDING', 'IN THE GORGE'], { sc: 'SC.9 · WHAT IF', hero: AG, heroOpts: { stage: 'full', wind: true, sway: true }, camAz: 24, size: 70 });
hero('P09', AG, { stage: 'full', wind: true, sway: true }, 'A TRAIN IS ON ITS WAY', { camAz: -14 });
flow('P09', 'A RULE MUST SAY WHEN', [{ t: 'STRONG WIND' }, { t: 'A RULE', sub: 'SLOW OR STOP', hot: true }, { t: 'THE TRAIN' }], 'chain', { w: 1.3 });
stmt('P09', ['A BRIDGE IS STEEL.', 'IT IS ALSO A SET OF RULES.'], { size: 66, align: 'center', w: 1.2 });

// P10 the habit: anchoring
stmt('P10', ['ONE IDEA ABOUT PEOPLE:', 'ANCHORING'], { sc: 'SC.10 · THE HABIT', size: 74 });
flow('P10', "'TALLER THAN THE EIFFEL TOWER'", [{ t: 'A NUMBER YOU KNOW', sub: 'THE EIFFEL TOWER' }, { t: 'ANCHORS', hot: true }, { t: 'YOUR JUDGEMENT' }], 'chain', { w: 1.3 });
flow('P10', 'A COMPARISON IS A SHORTCUT', [{ t: 'HOW HIGH', sub: 'WHAT THE COMPARISON TELLS YOU' }, { t: 'NOT', hot: true }, { t: 'HOW HARD', sub: 'THE ARCH, THE GORGE, THE WIND' }], 'chain');
hero('P10', AG, { stage: 'full', thrust: true, wind: true }, 'THE HARD PART: ARCH, GORGE, WIND', { camAz: 20, callouts: [{ fx: 0.5, fy: 0.5, t: 'THE ARCH' }, { fx: 0.5, fy: 0.9, t: 'THE GORGE' }] });

// P11 the close
stmt('P11', ['THREE THINGS', 'TO REMEMBER'], { sc: 'SC.11 · THE CLOSE', size: 84, align: 'center' });
flow('P11', 'THREE THINGS', [{ t: '1', sub: 'AN ARCH TURNS A DOWNWARD PUSH SIDEWAYS' }, { t: '2', sub: 'LONG ARCHES ARE OFTEN BUILT FROM BOTH SIDES' }, { t: '3', sub: 'A ROUTE IS ONLY AS STRONG AS ITS HARDEST LINK' }], [], { w: 1.6 });
hero('P11', AG, { stage: 'full', thrust: true }, 'THE HILLS PUSH BACK', { camAz: 18, callouts: [{ fx: 0.5, fy: 0.5, t: 'THE ARCH' }] });
stmt('P11', ['INDIA BUILT THE BRIDGE.', 'WHERE IS THE NEXT GORGE?'], { size: 74, align: 'center', k: 'hook', w: 1.4 });
stmt('P11', ['INDIA MEGAPROJECTS'], { sub: 'THE RAILWAY BRIDGE ABOVE A GORGE', size: 100, align: 'center' });

// ---- write
mkdirSync(join(dir, 'src'), { recursive: true });
writeFileSync(join(dir, 'src', 'beats.dsl.json'), JSON.stringify(B, null, 1));
const epPath = join(dir, 'episode.s2.json');
const ep = { id: 'E01', title: 'The Railway Bridge Above a Gorge', seriesTitle: 'INDIA MEGAPROJECTS', world: 'strata', fps: 30, seed: 's03e01', passages, beats: [] };
writeFileSync(epPath, JSON.stringify(ep, null, 1));
writeFileSync(join(dir, 'src', 'camera.json'), '{}\n');
writeFileSync(join(dir, 'src', 'episode.js'), '// E01 uses only kit templates; no custom ops.\n(function () { const BB = window.BB; BB.customOps = BB.customOps || {}; })();\n');
console.log('beats', B.length, 'passages', passages.length, 'est voice s', passages.reduce((s, p) => s + p.estSec, 0).toFixed(1));
