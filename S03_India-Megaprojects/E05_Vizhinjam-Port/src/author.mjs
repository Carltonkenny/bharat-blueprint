// E05 (The Port Where Boxes Change Ships). Run: node src/author.mjs, then compose-episode.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { authorKit } from '../../../_shared/kit-v2/tools/s03-author-lib.mjs';
const dir = join(dirname(fileURLToPath(import.meta.url)), '..');
const PH = 'port-hub';
const { hero, stmt, flow, num, timeline, finish } = authorKit(dir, { id: 'E05', title: 'The Port Where Boxes Change Ships', seed: 's03e05', hero: PH, heroOpts: { mode: 'hub' } });

// P01
hero('P01', PH, { mode: 'hub' }, 'WHERE GOODS CHANGE SHIPS', { sc: 'SC.1 · THE HUB', k: 'hook' });
flow('P01', 'ONE STOP, MANY ONWARD SHIPS', ['A GIANT SHIP ARRIVES', { t: 'BOXES FOR OTHER PORTS LIFT OFF', hot: true }, 'SMALLER SHIPS CARRY THEM ON']);
hero('P01', PH, { mode: 'hub' }, 'ONE BIG SHIP, MANY SMALL ONES', { camAz: 50 });
stmt('P01', ['MOST PORTS: GOODS ARRIVE', 'TO BE USED.', 'THIS ONE: GOODS CHANGE SHIPS.'], { size: 56, k: 'hook' });
// P02
timeline('P02', 'VIZHINJAM INTERNATIONAL SEAPORT, KERALA', [{ t: '2 MAY 2025', sub: 'INAUGURATED', hot: true, at: 0.5, size: 80 }], { sc: 'SC.2 · THE NUMBERS' });
stmt('P02', ['INDIA\'S FIRST DEDICATED', 'CONTAINER TRANSSHIPMENT PORT'], { sub: 'PIB', size: 58, hero: PH, heroOpts: { mode: 'quay' } });
num('P02', 'WHAT IT COST', '8,800', 'CRORE RUPEES, ABOUT', 'THE WHOLE PROJECT', 'PIB, JUN 2025');
hero('P02', PH, { mode: 'quay' }, 'DEEP WATER, CLOSE TO THE SHORE', { callouts: [{ fx: 0.5, fy: 0.85, t: 'DEEP WATER' }, { fx: 0.12, fy: 0.3, t: 'THE QUAY' }] });
hero('P02', PH, { mode: 'hub' }, 'A PORT BUILT TO CHANGE SHIPS', { camAz: 50 });
// P03
hero('P03', PH, { mode: 'hub' }, 'WHO EARNS FROM THE CHANGE', { sc: 'SC.3 · WHY IT MATTERS', camAz: 46 });
flow('P03', 'A PORT DECIDES', [{ t: 'INDIA\'S BOXES' }, { t: 'CHANGE SHIPS', sub: 'AT A PORT', hot: true }, { t: 'SOMEWHERE' }]);
stmt('P03', ['PIB: IT REDUCES', 'RELIANCE ON FOREIGN PORTS'], { size: 58 });
stmt('P03', ['THE MINISTER: EXPANSION WILL', 'HELP CUT DEPENDENCE', 'ON FOREIGN HUBS'], { size: 54 });
// P04 hub
stmt('P04', ['IDEA ONE:', 'A HUB'], { sc: 'SC.4 · IDEA 1 · A HUB', hero: PH, heroOpts: { mode: 'hub' }, size: 86 });
flow('P04', 'AN AIRLINE HUB', ['AN AIRLINE HUB', { t: 'YOU FLY TO THE HUB', hot: true }, 'THEN OUT AGAIN']);
hero('P04', PH, { mode: 'hub' }, 'EVERY ROUTE NEEDS ITS OWN BIG SHIP', { camAz: 46, w: 1.2 });
hero('P04', PH, { mode: 'hub' }, 'ONE BIG SHIP FEEDS MANY SMALL ONES', { callouts: [{ fx: 0.5, fy: 0.5, t: 'THE HUB' }], w: 1.3 });
flow('P04', 'BEFORE A HUB, AFTER IT', [{ t: 'BEFORE A HUB', sub: 'EVERY ROUTE NEEDS A BIG SHIP' }, { t: 'AFTER IT', sub: 'ONE FEEDS MANY', hot: true }], 'chain', { w: 1.2 });
stmt('P04', ['ONE STOP AT A HUB,', 'MANY ONWARD SHIPS.'], { size: 62 });
// P05 depth
stmt('P05', ['IDEA TWO:', 'DEPTH'], { sc: 'SC.5 · IDEA 2 · DEPTH', hero: PH, heroOpts: { mode: 'quay' }, size: 86 });
flow('P05', 'A LOADED TRUCK', ['A LOADED TRUCK', { t: 'NEEDS A STRONG ROAD', hot: true }]);
hero('P05', PH, { mode: 'quay' }, 'A LOADED SHIP SITS DEEP', { callouts: [{ fx: 0.5, fy: 0.85, t: 'DEEP WATER AT THE BERTH' }, { fx: 0.55, fy: 0.45, t: 'LOADED HULL' }], w: 1.3 });
hero('P05', PH, { mode: 'shallow' }, 'IN SHALLOW WATER, IT GROUNDS', { callouts: [{ fx: 0.5, fy: 0.8, t: 'TOO SHALLOW' }] });
hero('P05', PH, { mode: 'quay' }, 'LESS DIGGING WHERE WATER IS DEEP', { camAz: 44 });
stmt('P05', ['PIB: IT CAN HOST', 'THE WORLD\'S LARGEST', 'CARGO SHIPS'], { size: 56 });
// P06 speed
stmt('P06', ['IDEA THREE:', 'SPEED'], { sc: 'SC.6 · IDEA 3 · SPEED', hero: PH, heroOpts: { mode: 'quay' }, size: 86 });
flow('P06', 'A RACING PIT STOP', ['A RACING PIT STOP', { t: 'EVERY SECOND PRACTISED', hot: true }]);
hero('P06', PH, { mode: 'quay' }, 'CRANES AND YARD MACHINES, IN A LOOP', { camAz: 46, w: 1.3 });
stmt('P06', ['INDIA\'S FIRST', 'AUTOMATED PORT (PIB)'], { size: 62 });
flow('P06', 'BEFORE THE MACHINES, AFTER THEM', [{ t: 'BEFORE THE MACHINES', sub: 'A SHIP WAITS' }, { t: 'AFTER THEM', sub: 'THE SHIP LEAVES', hot: true }], 'chain', { w: 1.2 });
// P07 india
stmt('P07', ['PHASE ONE OPENED', 'IN DECEMBER 2024'], { sc: 'SC.7 · WHAT IS BUILT, WHAT IS NOT', size: 66 });
num('P07', 'DESIGNED CAPACITY', '1', 'MILLION CONTAINERS A YEAR', 'PHASE ONE, TWENTY-FOOT UNITS', 'PIB');
num('P07', 'HANDLED SINCE THEN', '1.43', 'MILLION CONTAINERS', 'OVER ITS DESIGN', 'PIB');
num('P07', 'RUNNING AT', '130', 'PERCENT OF DESIGN CAPACITY', 'MORE THAN', 'PIB', { w: 1.3 });
timeline('P07', 'PHASES TWO TO FOUR', [{ t: 'DEC 2024', sub: 'PHASE ONE OPENS', at: 0.1 }, { t: 'DEC 2028', sub: 'EXPANSION TARGETED', hot: true, at: 0.9 }]);
stmt('P07', ['A SIGN OF DEMAND,', 'AND A LIMIT.'], { size: 70, k: 'payoff' });
// P08 field
flow('P08', 'PORTS ARE NOT RANKED BY SIZE ALONE', ['A TRANSSHIPMENT HUB', 'A GATEWAY FOR LOCAL GOODS', 'A FISHING HARBOUR'], [], { sc: 'SC.8 · THE FIELD' });
flow('P08', 'VIZHINJAM IS A HUB', [{ t: 'A TRANSSHIPMENT HUB', hot: true }, 'A GATEWAY', 'A FISHING HARBOUR'], []);
hero('P08', PH, { mode: 'hub' }, 'IT DOES NOT REPLACE EVERY PORT', { camAz: 48 });
stmt('P08', ['DIFFERENT PROBLEMS,', 'NOT A LEAGUE TABLE.'], { size: 70, k: 'payoff' });
// P09 what if
stmt('P09', ['A GIANT SHIP WAITS OFFSHORE.', 'THE BERTH IS BUSY.'], { sc: 'SC.9 · WHAT IF', size: 60 });
hero('P09', PH, { mode: 'hub' }, 'EVERY HOUR OF WAITING COSTS', { camAz: 48 });
flow('P09', 'A COST FOR EVERY BOX', [{ t: 'A WAITING SHIP' }, { t: 'A COST FOR EVERY BOX ON BOARD', hot: true }]);
stmt('P09', ['A FULL PORT IS A PORT', 'THAT IS WANTED,', 'AND ALSO LATE.'], { size: 60 });
// P10 habit
stmt('P10', ['ONE IDEA ABOUT PEOPLE:', 'DEMAND FILLS CAPACITY'], { sc: 'SC.10 · THE HABIT', size: 62 });
flow('P10', 'WIDER ROADS, MORE DRIVING', [{ t: 'ROAD CAPACITY GROWS' }, { t: 'DRIVING GROWS WITH IT', sub: 'AMERICAN CITIES', hot: true }], 'chain', { w: 1.2 });
hero('P10', PH, { mode: 'hub' }, 'ALREADY ABOVE ITS DESIGN', { camAz: 48 });
stmt('P10', ['SPACE BUILT FOR TODAY', 'FILLS UP TOMORROW.'], { size: 66, k: 'payoff' });
// P11 close
stmt('P11', ['THREE THINGS', 'TO REMEMBER'], { sc: 'SC.11 · THE CLOSE', size: 80 });
flow('P11', 'THREE THINGS', [{ t: 'ONE', sub: 'A HUB LETS ONE BIG SHIP FEED MANY SMALL ONES' }, { t: 'TWO', sub: 'DEEP WATER NEAR THE SHORE IS THE FIRST ASSET' }, { t: 'THREE', sub: 'A FULL PORT IS A SIGNAL TO EXPAND' }], [], { w: 1.6 });
hero('P11', PH, { mode: 'hub' }, 'THE HUB', { camAz: 48 });
stmt('P11', ['INDIA BUILT THE HUB.', 'WILL CAPACITY KEEP UP', 'WITH THE BOXES?'], { size: 60, k: 'hook', w: 1.4 });
stmt('P11', ['INDIA MEGAPROJECTS'], { sub: 'THE PORT WHERE BOXES CHANGE SHIPS', size: 100, align: 'center' });
finish();
