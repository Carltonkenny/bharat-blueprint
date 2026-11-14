// E04 (The Bridge That Stands Up for Ships). Run: node src/author.mjs, then compose-episode.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { authorKit } from '../../../_shared/kit-v2/tools/s03-author-lib.mjs';
const dir = join(dirname(fileURLToPath(import.meta.url)), '..');
const LS = 'lift-span';
const { hero, stmt, flow, num, timeline, finish } = authorKit(dir, { id: 'E04', title: 'The Bridge That Stands Up for Ships', seed: 's03e04', hero: LS, heroOpts: { lift: true, ship: true } });

// P01
hero('P01', LS, { lift: true, growDur: 4 }, 'A BRIDGE THAT STANDS UP FOR A SHIP', { sc: 'SC.1 · THE LIFT', k: 'hook' });
hero('P01', LS, { lift: true, growDur: 5 }, 'A RAILWAY CROSSES THE SEA', { camAz: 34 });
hero('P01', LS, { lift: true, ship: true, growDur: 5 }, 'THE MIDDLE SECTION RISES', { callouts: [{ fx: 0.5, fy: 0.4, t: 'LIFT SPAN' }] });
stmt('P01', ['A SECTION OF THE TRACK', 'RISES INTO THE AIR.'], { size: 64, k: 'hook' });
hero('P01', LS, { lift: true, ship: true, growDur: 6 }, 'A SHIP PASSES BENEATH', { camAz: 46 });
// P02
timeline('P02', 'THE NEW PAMBAN BRIDGE', [{ t: 'APRIL 2025', sub: 'INAUGURATED', hot: true, at: 0.5, size: 84 }], { sc: 'SC.2 · THE NUMBERS' });
stmt('P02', ['INDIA\'S FIRST VERTICAL LIFT', 'RAILWAY SEA BRIDGE'], { sub: 'PIB', size: 60, hero: LS, heroOpts: { lift: true } });
num('P02', 'THE LIFTING SECTION', '72.5', 'METRES LONG', 'THE NAVIGATIONAL SPAN', 'PIB, 4 APR 2025');
num('P02', 'HOW HIGH IT RISES', '17', 'METRES', 'SO LARGER SHIPS CAN PASS BENEATH', 'PIB, 4 APR 2025');
hero('P02', LS, { lift: true, growDur: 4 }, 'ONLY A SMALL PART MOVES', { chain: 'ABOUT TWO KILOMETRES LONG (PIB)' });
stmt('P02', ['ABOUT TWO KILOMETRES.', 'ONLY A SMALL PART MOVES.'], { size: 62, k: 'payoff' });
// P03
flow('P03', 'THE SEA IS SLOWLY HARD ON STEEL', ['THE SEA', { t: 'EATS IRON AND STEEL', hot: true }, 'SLOWLY'], 'chain', { sc: 'SC.3 · WHY IT MATTERS' });
timeline('P03', 'A BRIDGE A CENTURY OLD', [{ t: '1914', sub: 'THE ORIGINAL BRIDGE', at: 0.15 }, { t: 'APRIL 2025', sub: 'THE NEW BRIDGE', hot: true, at: 0.85 }]);
stmt('P03', ['NO LONGER SUITABLE FOR', 'MODERN RAIL DEMANDS', 'SAY THE RAILWAYS'], { size: 60 });
num('P03', 'THE NEW BRIDGE STANDS', '3', 'METRES HIGHER THAN THE OLD ONE', 'ABOVE THE WATER', 'PIB, 4 APR 2025');
// P04 counterweight
stmt('P04', ['IDEA ONE:', 'A COUNTERWEIGHT'], { sc: 'SC.4 · IDEA 1 · A COUNTERWEIGHT', hero: LS, heroOpts: { lift: true }, size: 70 });
flow('P04', 'AN OLD SASH WINDOW', ['AN OLD SASH WINDOW', { t: 'A HIDDEN WEIGHT', hot: true }, 'A SMALL PUSH LIFTS THE GLASS']);
hero('P04', LS, { lift: true, growDur: 4 }, 'COUNTERWEIGHTS IN FOUR TOWERS', { callouts: [{ fx: 0.18, fy: 0.3, t: 'COUNTERWEIGHT' }, { fx: 0.5, fy: 0.55, t: 'LIFT SPAN' }], w: 1.3 });
hero('P04', LS, { lift: true, growDur: 5 }, 'AN ELECTRIC DRIVE RAISES THE SPAN', { camAz: 44 });
flow('P04', 'REPORTED TIMINGS', [{ t: 'THE NEW SPAN', sub: 'OPENS IN FIVE AND A HALF MINUTES' }, { t: 'THE OLD BRIDGE', sub: 'ABOUT THIRTY, BY HAND', hot: true }], 'chain', { w: 1.2 });
hero('P04', LS, { lift: true, ship: true, growDur: 6 }, 'BEFORE, A SHIP WAITS', { camAz: 44 });
flow('P04', 'BEFORE, AFTER', [{ t: 'BEFORE', sub: 'A SHIP WAITS' }, { t: 'AFTER', sub: 'THE TRACK STEPS ASIDE', hot: true }], 'chain', { w: 1.2 });
// P05 salt
stmt('P05', ['IDEA TWO:', 'SALT'], { sc: 'SC.5 · IDEA 2 · SALT', hero: LS, heroOpts: {}, size: 86 });
flow('P05', 'SEA AIR AND SPRAY', ['SEA AIR AND SPRAY', { t: 'EAT METAL', hot: true }]);
flow('P05', 'FOUR PROTECTIONS (PIB)', ['STAINLESS STEEL REBAR', 'PROTECTIVE PAINT', 'FULLY WELDED JOINTS', 'POLYSILOXANE COATING'], [], { w: 1.4 });
hero('P05', LS, {}, 'THINK OF A RAINCOAT SEALED AT EVERY SEAM', { camAz: 46, w: 1.2 });
stmt('P05', ['SEAMS, COATINGS', 'AND STEEL TYPE MATTER.'], { size: 60 });
// P06 wind
stmt('P06', ['IDEA THREE:', 'WIND'], { sc: 'SC.6 · IDEA 3 · WIND', hero: LS, heroOpts: { lift: true }, size: 86 });
hero('P06', LS, { lift: true, growDur: 4 }, 'A KITE IN A GALE', { camAz: 50 });
hero('P06', LS, { lift: true, hold: true, growDur: 3 }, 'A LIFTING SPAN IS A BIG FLAT SURFACE', { callouts: [{ fx: 0.5, fy: 0.3, t: 'A FLAT SURFACE' }] });
hero('P06', LS, { lift: true, hold: true, growDur: 5 }, 'THE SPAN CATCHES THE WIND', { camAz: 56 });
num('P06', 'TRAINS ARE SUSPENDED ABOVE', '58', 'KM/H OF WIND, REPORTED', 'A RULE, AS MUCH AS THE STEEL', 'RAILWAY GAZETTE, APR 2025', { w: 1.3 });
flow('P06', 'BEFORE THE RULE, AFTER IT', [{ t: 'BEFORE THE RULE', sub: 'WIND IS A SURPRISE' }, { t: 'AFTER IT', sub: 'WIND IS AN INPUT', hot: true }], 'chain', { w: 1.2 });
stmt('P06', ['A RULE KEEPS THE BRIDGE SAFE', 'AS MUCH AS THE STEEL.'], { size: 60, k: 'payoff' });
// P07 india
stmt('P07', ['RAIL VIKAS NIGAM LIMITED', 'BUILT IT'], { sc: 'SC.7 · WHAT IS BUILT, WHAT IS NOT', size: 66 });
flow('P07', 'BUILT IN HARD CONDITIONS (PIB)', ['TURBULENT WATER', 'STRONG WINDS', 'CYCLONES'], []);
hero('P07', LS, {}, 'FOUNDATIONS MADE FOR TWO TRACKS', { camAz: 44 });
flow('P07', 'TWO TRACKS, ONE LINE', [{ t: 'FOUNDATIONS', sub: 'MADE FOR TWO TRACKS' }, { t: 'TODAY', sub: 'ONE LINE ON TOP', hot: true }], 'chain', { w: 1.3 });
stmt('P07', ['THE LIFT IS BUILT.', 'THE SECOND TRACK', 'IS NOT YET LAID.'], { size: 62, k: 'payoff', w: 1.3 });
// P08 field
flow('P08', 'NOT EVERY BRIDGE LIFTS', ['A GORGE', 'A BAY', 'A STRETCH OF SEA'], [], { sc: 'SC.8 · THE FIELD' });
flow('P08', 'THE PROBLEM A LIFT SOLVES', [{ t: 'A RAILWAY' }, { t: 'THE SAME WATER', hot: true }, { t: 'A SHIP' }], 'chain');
hero('P08', LS, { lift: true }, 'ONE PROBLEM, ONE SOLUTION', { camAz: 44 });
stmt('P08', ['DIFFERENT PROBLEMS,', 'NOT A LEAGUE TABLE.'], { size: 70, k: 'payoff' });
// P09 what if
stmt('P09', ['A SHIP WAITS IN THE CHANNEL.', 'A TRAIN IS TWO MINUTES AWAY.'], { sc: 'SC.9 · WHAT IF', size: 58 });
hero('P09', LS, { lift: true, ship: true, growDur: 5 }, 'SOMEONE DECIDES WHO GOES FIRST', { camAz: 46 });
flow('P09', 'A TIMETABLE', [{ t: 'THE SHIP' }, { t: 'WHO GOES FIRST?', hot: true }, { t: 'THE TRAIN' }]);
stmt('P09', ['A LIFTING BRIDGE IS STEEL.', 'IT IS ALSO A TIMETABLE.'], { size: 62 });
// P10 habit
stmt('P10', ['ONE IDEA ABOUT PEOPLE:', 'STATUS QUO BIAS'], { sc: 'SC.10 · THE HABIT', size: 66 });
flow('P10', 'WE KEEP WHAT WORKS', ['WE KEEP WHAT WORKS', { t: 'UNTIL IT STOPS', hot: true }]);
timeline('P10', 'A HUNDRED AND TEN YEARS', [{ t: '1914', sub: 'THE OLD BRIDGE BUILT', at: 0.12 }, { t: 'ABOUT 110 YEARS', sub: 'OF SERVICE (PIB)', hot: true, at: 0.6 }]);
stmt('P10', ['REPLACING WHAT WORKS IS HARD.', 'REPLACING WHAT FAILED', 'IS EASY, AND EXPENSIVE.'], { size: 56 });
// P11 close
stmt('P11', ['THREE THINGS', 'TO REMEMBER'], { sc: 'SC.11 · THE CLOSE', size: 80 });
flow('P11', 'THREE THINGS', [{ t: 'ONE', sub: 'A COUNTERWEIGHT LETS A SMALL DRIVE LIFT A LARGE SPAN' }, { t: 'TWO', sub: 'THE SEA ATTACKS METAL' }, { t: 'THREE', sub: 'A RULE IS PART OF THE BRIDGE' }], [], { w: 1.6 });
hero('P11', LS, { lift: true, ship: true, growDur: 5 }, 'THE LIFT, THE SEA, THE RULE', { camAz: 46 });
stmt('P11', ['INDIA BUILT THE LIFT.', 'WHEN WILL THE SECOND', 'TRACK BE LAID?'], { size: 62, k: 'hook', w: 1.4 });
stmt('P11', ['INDIA MEGAPROJECTS'], { sub: 'THE BRIDGE THAT STANDS UP FOR SHIPS', size: 100, align: 'center' });
finish();
