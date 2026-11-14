// E06 (The Railway Built Only for Freight). Run: node src/author.mjs, then compose-episode.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { authorKit } from '../../../_shared/kit-v2/tools/s03-author-lib.mjs';
const dir = join(dirname(fileURLToPath(import.meta.url)), '..');
const RC = 'rail-corridor';
const { hero, stmt, flow, num, timeline, finish } = authorKit(dir, { id: 'E06', title: 'The Railway Built Only for Freight', seed: 's03e06', hero: RC, heroOpts: { layers: 2 } });

// P01
hero('P01', RC, { layers: 1, second: true }, 'A LANE ONLY FOR GOODS', { sc: 'SC.1 · THE LANE', k: 'hook' });
hero('P01', RC, { layers: 1 }, 'ONE LANE FOR EVERYONE', { camAz: 50 });
hero('P01', RC, { layers: 1, second: true }, 'EVERYONE MOVES AT THE SLOWEST SPEED', { camAz: 48 });
stmt('P01', ['NOW IMAGINE A LANE', 'BUILT ONLY FOR TRUCKS.'], { size: 62, k: 'hook' });
stmt('P01', ['INDIA\'S DEDICATED', 'FREIGHT CORRIDORS'], { size: 64, hero: RC, heroOpts: { layers: 2 } });
// P02
stmt('P02', ['RAILWAY LINES BUILT', 'ONLY FOR GOODS TRAINS'], { sc: 'SC.2 · THE NUMBERS', size: 62, hero: RC, heroOpts: { layers: 2 } });
flow('P02', 'WHAT THE CORRIDORS ENABLE (RAILWAYS)', ['DOUBLE-STACK CONTAINER TRAINS', 'HIGHER AXLE LOAD', 'FASTER ACCESS FROM WESTERN PORTS'], [], { w: 1.4 });
num('P02', 'THE EASTERN CORRIDOR', '1,337', 'KM: LUDHIANA TO SONNAGAR', 'COMMISSIONED', 'PIB, 2026', { size: 130 });
num('P02', 'THE WESTERN CORRIDOR', '1,506', 'KM: DADRI TO JNPT', 'COMMISSIONED', 'PIB, 2026', { size: 130 });
hero('P02', RC, { layers: 2 }, 'TWO CORRIDORS, ONE IDEA', { camAz: 46 });
// P03
hero('P03', RC, { layers: 1, second: true }, 'GOODS AND PASSENGERS, SHARING', { sc: 'SC.3 · WHY IT MATTERS', camAz: 46 });
flow('P03', 'GOODS TRAINS MOVED OVER', [{ t: 'GOODS TRAINS', sub: 'MOVE TO THE NEW LINES' }, { t: 'NEW PATHS', sub: 'OPEN ON THE OLD TRACKS', hot: true }], 'chain', { w: 1.3 });
stmt('P03', ['RAILWAYS: ADDITIONAL PATHS', 'ON THE OLD NETWORK'], { size: 58 });
stmt('P03', ['MORE GOODS AND PASSENGER', 'SERVICES COULD GROW.'], { size: 58 });
// P04 separate lanes
stmt('P04', ['IDEA ONE:', 'SEPARATE LANES'], { sc: 'SC.4 · IDEA 1 · SEPARATE LANES', hero: RC, heroOpts: { layers: 1, second: true }, size: 74 });
flow('P04', 'THE TRUCK-ONLY LANE', [{ t: 'THE TRUCKS', sub: 'STOP SLOWING THE BUSES' }, { t: 'THE BUSES', sub: 'STOP SLOWING THE TRUCKS', hot: true }], 'chain', { w: 1.2 });
hero('P04', RC, { layers: 1, second: true }, 'EACH KIND OF TRAIN, ITS OWN TRACK', { callouts: [{ fx: 0.5, fy: 0.55, t: 'GOODS TRACK' }, { fx: 0.5, fy: 0.78, t: 'PASSENGER TRACK' }], w: 1.3 });
flow('P04', 'BEFORE A DEDICATED LINE, AFTER IT', [{ t: 'BEFORE', sub: 'A GOODS TRAIN WAITS FOR AN EXPRESS' }, { t: 'AFTER', sub: 'EACH HAS ITS OWN TRACK', hot: true }], 'chain', { w: 1.2 });
hero('P04', RC, { layers: 1, second: true }, 'NO MORE WAITING TO PASS', { camAz: 48 });
// P05 double stack
stmt('P05', ['IDEA TWO:', 'DOUBLE-STACK'], { sc: 'SC.5 · IDEA 2 · DOUBLE-STACK', hero: RC, heroOpts: { layers: 2 }, size: 74 });
hero('P05', RC, { layers: 2 }, 'TWO BOOKS, NOT ONE', { camAz: 50 });
hero('P05', RC, { layers: 1 }, 'ONE LAYER OF BOXES', { camAz: 46 });
hero('P05', RC, { layers: 2 }, 'TWO LAYERS, IF THE WIRES LEAVE ROOM', { callouts: [{ fx: 0.5, fy: 0.2, t: 'THE WIRE' }, { fx: 0.5, fy: 0.5, t: 'TWO LAYERS' }], w: 1.3 });
stmt('P05', ['RAILWAYS, 2019: SUCH A TRAIN', 'CAN CARRY FOUR TIMES', 'THE CONTAINER UNITS'], { size: 54 });
// P06 axle load
stmt('P06', ['IDEA THREE:', 'WEIGHT'], { sc: 'SC.6 · IDEA 3 · WEIGHT', hero: RC, heroOpts: { axle: true, layers: 2 }, size: 86 });
hero('P06', RC, { axle: true, layers: 1 }, 'ONE FOOT, THEN TWO', { camAz: 50 });
hero('P06', RC, { axle: true, layers: 2 }, 'A HEAVIER AXLE PRESSES HARDER', { callouts: [{ fx: 0.4, fy: 0.45, t: 'AXLE LOAD' }], w: 1.3 });
num('P06', 'CORRIDOR WAGONS ARE DESIGNED FOR', '25', 'TONNES ON EACH AXLE', 'SO THE TRACK MUST BE STRONGER', 'PIB, 2019');
flow('P06', 'OLD WAGONS, NEW WAGONS (2019)', [{ t: 'OLD WAGONS', sub: 'SIXTY-ONE TO SEVENTY-ONE TONNES' }, { t: 'NEW WAGONS', sub: 'UP TO EIGHTY-ONE TONNES, FASTER', hot: true }], 'chain', { w: 1.3 });
stmt('P06', ['A STRONGER TRACK', 'FOR A HEAVIER TRAIN.'], { size: 66, k: 'payoff' });
// P07 india
stmt('P07', ['BOTH CORRIDORS', 'HAVE BEEN COMMISSIONED'], { sc: 'SC.7 · WHAT IS BUILT, WHAT IS NOT', size: 62 });
num('P07', 'TRAINS EACH DAY ON AVERAGE', '443', 'ON THE CORRIDORS', 'THE MINISTRY SAYS', 'PIB, 2026');
flow('P07', 'A NEW CORRIDOR, ONLY ANNOUNCED', [{ t: 'DANKUNI', sub: 'IN THE EAST' }, { t: 'ANNOUNCED', sub: 'UNION BUDGET 2026', hot: true }, { t: 'SURAT', sub: 'IN THE WEST' }], 'chain', { w: 1.3 });
hero('P07', RC, { layers: 2 }, 'WORK ON THE PROJECT REPORT HAS BEGUN', { camAz: 46 });
stmt('P07', ['AN ANNOUNCEMENT', 'IS NOT A RAILWAY.'], { size: 70, k: 'payoff' });
// P08 field
flow('P08', 'A FREIGHT CORRIDOR IS NOT A PASSENGER LINE', ['A FREIGHT CORRIDOR', 'A PASSENGER LINE', 'A HIGHWAY'], [], { sc: 'SC.8 · THE FIELD' });
flow('P08', 'EACH CARRIES A DIFFERENT THING', [{ t: 'GOODS', sub: 'AT ONE SPEED' }, { t: 'PEOPLE', sub: 'AT ANOTHER' }, { t: 'VEHICLES', sub: 'AT A THIRD' }], []);
hero('P08', RC, { layers: 1, second: true }, 'TOOLS, NOT RANKS', { camAz: 48 });
stmt('P08', ['TOOLS,', 'NOT RANKS.'], { size: 80, k: 'payoff' });
// P09 what if
stmt('P09', ['A CONTAINER LEAVES A PORT', 'AT NIGHT'], { sc: 'SC.9 · WHAT IF', size: 62 });
hero('P09', RC, { layers: 2 }, 'IT RIDES THE CORRIDOR', { camAz: 48 });
flow('P09', 'NO EXPRESS TO WAIT FOR', [{ t: 'THE PORT' }, { t: 'NO WAITING', sub: 'FOR A PASSENGER EXPRESS', hot: true }, { t: 'THE INLAND TERMINAL' }]);
stmt('P09', ['THE CORRIDOR DID NOT', 'MAKE THE TRAIN FLY.', 'IT STOPPED IT WAITING.'], { size: 58 });
// P10 habit
stmt('P10', ['ONE IDEA ABOUT PEOPLE:', 'AVERAGES HIDE BOTTLENECKS'], { sc: 'SC.10 · THE HABIT', size: 56 });
flow('P10', 'ONE SLOW SECTION', [{ t: 'A GOOD AVERAGE SPEED' }, { t: 'ONE SLOW SECTION', sub: 'LOSES THE TIME', hot: true }]);
num('P10', 'A TRADE PUBLICATION REPORTED', '70', 'KM/H: THE EXPECTED AVERAGE', 'UP FROM ABOUT 26: AN EXPECTATION, NOT A MEASUREMENT', 'MARITIME GATEWAY', { size: 130, w: 1.3 });
stmt('P10', ['AN EXPECTATION', 'IS NOT A MEASUREMENT.'], { size: 64, k: 'payoff' });
// P11 close
stmt('P11', ['THREE THINGS', 'TO REMEMBER'], { sc: 'SC.11 · THE CLOSE', size: 80 });
flow('P11', 'THREE THINGS', [{ t: 'ONE', sub: 'A SEPARATE LANE STOPS EVERYONE SLOWING EVERYONE' }, { t: 'TWO', sub: 'A DOUBLE STACK AND A HEAVIER AXLE CARRY MORE' }, { t: 'THREE', sub: 'AN ANNOUNCEMENT IS NOT A RAILWAY' }], [], { w: 1.6 });
hero('P11', RC, { layers: 2, axle: true }, 'THE CORRIDOR', { camAz: 48 });
stmt('P11', ['INDIA BUILT THE CORRIDORS.', 'HOW WILL THE FREIGHT', 'REACH THEM?'], { size: 58, k: 'hook', w: 1.4 });
stmt('P11', ['INDIA MEGAPROJECTS'], { sub: 'THE RAILWAY BUILT ONLY FOR FREIGHT', size: 100, align: 'center' });
finish();
