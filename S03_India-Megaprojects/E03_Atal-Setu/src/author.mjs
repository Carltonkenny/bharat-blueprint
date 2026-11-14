// E03 (The Road Across the Sea). Run: node src/author.mjs, then compose-episode.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { authorKit } from '../../../_shared/kit-v2/tools/s03-author-lib.mjs';
const dir = join(dirname(fileURLToPath(import.meta.url)), '..');
const SB = 'sea-bridge', DP = 'deck-plate';
const { hero, stmt, flow, num, timeline, finish } = authorKit(dir, { id: 'E03', title: 'The Road Across the Sea', seed: 's03e03', hero: SB, heroOpts: {} });

// P01
hero('P01', SB, {}, 'BETWEEN MUMBAI AND NAVI MUMBAI', { sc: 'SC.1 · THE WATER', k: 'hook' });
flow('P01', 'A BAY IN THE WAY', ['MUMBAI', { t: 'WATER', sub: 'A LONG WAY AROUND', hot: true }, 'NAVI MUMBAI']);
hero('P01', SB, {}, 'WHAT IF THE ROAD WENT OVER THE SEA?', { camAz: 28 });
stmt('P01', ['WHAT IF THE ROAD', 'SIMPLY WENT', 'OVER THE SEA?'], { k: 'hook', size: 64 });
// P02
timeline('P02', 'ATAL SETU, THE MUMBAI TRANS HARBOUR LINK', [{ t: 'JANUARY 2024', sub: 'OPENED', hot: true, at: 0.5, size: 80 }], { sc: 'SC.2 · THE NUMBERS' });
num('P02', 'HOW LONG', '21.8', 'KILOMETRES', 'SIX LANES, ABOUT', 'PIB, 12 JAN 2024');
num('P02', 'OVER THE SEA', '16.5', 'KILOMETRES OVER WATER', 'ABOUT 5.5 KM ON LAND', 'PIB, 12 JAN 2024', { w: 1.3 });
hero('P02', SB, {}, 'INDIA\'S LONGEST SEA BRIDGE (PIB)', { chain: 'ABOUT 16.5 KM OVER THE SEA (PIB)' });
hero('P02', SB, { piles: true }, 'SIX LANES ON A STEEL AND CONCRETE DECK', { camAz: 28 });
num('P02', 'WHAT IT COST', '17,840', 'CRORE RUPEES', 'MORE THAN', 'PIB, 12 JAN 2024', { size: 130 });
// P03
flow('P03', 'FASTER CONNECTIONS TO BOTH AIRPORTS', ['MUMBAI AIRPORT', { t: 'ATAL SETU', hot: true }, 'NAVI MUMBAI AIRPORT'], 'chain', { sc: 'SC.3 · WHY IT MATTERS' });
num('P03', 'THE CROSSING', '20', 'MINUTES, ABOUT', 'QUOTED BY ITS FINANCIER', 'JICA, 12 JAN 2024');
flow('P03', 'TWO STATEMENTS, TWO "BEFORE" TIMES', [{ t: 'ONE STATEMENT', sub: 'SIXTY MINUTES BEFORE' }, { t: 'ANOTHER', sub: 'ONE HUNDRED AND TWENTY BEFORE', hot: true }], 'chain', { w: 1.2 });
stmt('P03', ['A SAVING DEPENDS ON', 'WHERE YOU START COUNTING.'], { size: 62 });
// P04 piles
stmt('P04', ['IDEA ONE:', 'STANDING ON MUD'], { sc: 'SC.4 · IDEA 1 · PILES', hero: SB, heroOpts: { piles: true }, size: 76 });
flow('P04', 'THINK OF A TENT PEG', ['A TENT PEG IN WET SAND', { t: 'PULL', sub: 'IT COMES OUT', hot: true }]);
hero('P04', SB, { piles: true, growDur: 3 }, 'SEA BRIDGES COMMONLY STAND ON PILES', { callouts: [{ fx: 0.5, fy: 0.9, t: 'PILES' }, { fx: 0.08, fy: 0.72, t: 'SOFT SEABED' }], w: 1.3 });
hero('P04', SB, { piles: true, growDur: 5 }, 'DRIVEN DEEP TO FIRM GROUND', { w: 1.3 });
flow('P04', 'BEFORE THE PILES, AFTER THEM', [{ t: 'BEFORE THE PILES', sub: 'A PIER HAS NOTHING TO STAND ON' }, { t: 'AFTER THEM', sub: 'IT STANDS ON GROUND IT CANNOT SEE', hot: true }], 'chain', { w: 1.2 });
// P05 plate
stmt('P05', ['IDEA TWO:', 'A STIFF, LIGHT FLOOR'], { sc: 'SC.5 · IDEA 2 · THE DECK', hero: DP, heroOpts: {}, size: 70 });
flow('P05', 'THINK OF CARD', ['A FLAT SHEET OF CARD', { t: 'IT BENDS', hot: true }, 'FOLD IT INTO CORRUGATED CARD']);
hero('P05', DP, {}, 'A FLAT STEEL PLATE BENDS', { w: 1.2 });
hero('P05', DP, { ribs: true, growDur: 3 }, 'RIBS UNDER THE PLATE MAKE IT STIFF', { callouts: [{ fx: 0.5, fy: 0.7, t: 'RIBS' }], w: 1.4 });
hero('P05', SB, { ribs: true, growDur: 3 }, 'A STIFF DECK REACHES FARTHER', { callouts: [{ fx: 0.5, fy: 0.3, t: 'RIBBED DECK' }] });
hero('P05', SB, { ribs: true, growDur: 5 }, 'FEWER PIERS HAVE TO STAND IN THE WATER', { camAz: 26 });
flow('P05', 'BUILT IN A FACTORY', [{ t: 'BUILT IN A FACTORY' }, { t: 'LESS WORK AT SEA', hot: true }], 'chain', { w: 1.2 });
// P06 salt
stmt('P06', ['IDEA THREE:', 'SALT'], { sc: 'SC.6 · IDEA 3 · SALT', size: 86 });
flow('P06', 'A BICYCLE BY THE BEACH', ['SEA AIR', { t: 'RUSTS STEEL', hot: true }, 'LIKE A BICYCLE LEFT BY THE BEACH']);
hero('P06', SB, { ribs: true }, 'DESIGNED FOR A MARINE ENVIRONMENT', { w: 1.3 });
flow('P06', 'DURABILITY AND FLAMINGOS', [{ t: 'CORROSION PROTECTION' }, { t: 'SPECIAL MEASURES', sub: 'TO PROTECT FLAMINGO HABITAT', hot: true }], 'chain', { w: 1.3 });
// P07 india
stmt('P07', ['MMRDA CARRIED OUT', 'THE PROJECT'], { sc: 'SC.7 · WHAT INDIA BUILT, WHAT IT RELIED ON', size: 72 });
num('P07', 'A JAPANESE LOAN', '13,658', 'CRORE RUPEES, ABOUT', 'JICA, JAPAN\'S DEVELOPMENT AGENCY', 'JICA, 14 JAN 2022', { size: 130 });
hero('P07', SB, {}, 'A BRIDGE BUILT WITH PARTNERS', { camAz: 26 });
flow('P07', 'THE DECK TECHNOLOGY', [{ t: 'A JAPANESE EXPERT', sub: 'RECOMMENDED THE DECK' }, { t: 'FIRST USE IN INDIA', sub: 'JICA SAYS', hot: true }], 'chain', { w: 1.2 });
hero('P07', DP, { ribs: true, growDur: 3 }, 'THE DECK THAT WAS NEW TO INDIA', { callouts: [{ fx: 0.5, fy: 0.72, t: 'RIBBED STEEL DECK' }] });
flow('P07', 'STEEL SPANS MADE IN FIVE COUNTRIES (MMRDA)', ['JAPAN', 'SOUTH KOREA', 'VIETNAM', 'TAIWAN', 'MYANMAR'], [], { w: 1.3 });
hero('P07', SB, { ribs: true, growDur: 4 }, 'SPANS ARRIVE FROM MANY WORKSHOPS', { camAz: 28 });
stmt('P07', ['INDIA BUILT THE BRIDGE,', 'WITH PARTNERS.', 'BOTH ARE TRUE.'], { size: 62, k: 'payoff', w: 1.8 });
// P08 field
flow('P08', 'LENGTH IS ONE MEASURE', ['THE SEA SECTION', 'THE LAND VIADUCTS'], [], { sc: 'SC.8 · THE FIELD' });
num('P08', 'THE SEA SECTION', '16.5', 'KILOMETRES', 'THE FULL 21.8 KM INCLUDES VIADUCTS ON LAND', 'PIB, 12 JAN 2024');
flow('P08', 'OTHER BRIDGES, OTHER PROBLEMS', ['HIGHER', 'LIFTING', 'CARRYING TRAINS'], []);
stmt('P08', ['DIFFERENT PROBLEMS,', 'NOT A LEAGUE TABLE.'], { size: 72, k: 'payoff' });
// P09 what if
stmt('P09', ['A COMMUTER LEAVES', 'SEWRI AT SIX'], { sc: 'SC.9 · WHAT IF', size: 72 });
flow('P09', 'TWO ROUTES', [{ t: 'WITHOUT THE BRIDGE', sub: 'AROUND THE BAY' }, { t: 'WITH IT', sub: 'OVER THE BAY', hot: true }], 'chain', { w: 1.2 });
hero('P09', SB, {}, 'THE ROAD GOES OVER', { camAz: 26 });
stmt('P09', ['IT CHANGES WHICH SIDE', 'OF THE WATER A FAMILY', 'CAN LIVE ON.'], { size: 60, w: 1.3 });
// P10 habit
stmt('P10', ['ONE IDEA ABOUT PEOPLE:', 'PER WHAT?'], { sc: 'SC.10 · THE HABIT', size: 72 });
num('P10', 'SOUNDS HUGE', '17,840', 'CRORE RUPEES', 'A BIG NUMBER', 'PIB, 12 JAN 2024', { size: 130 });
num('P10', 'NOW DIVIDE BY THE LENGTH', '818', 'CRORE RUPEES PER KILOMETRE, ABOUT', 'DERIVED: THE COST DIVIDED BY 21.8 KM', 'PIB, DERIVED', { size: 130, w: 1.3 });
stmt('P10', ['A BIG NUMBER WITHOUT', 'A DENOMINATOR', 'IS ONLY A FEELING.'], { size: 60, k: 'payoff' });
// P11 close
stmt('P11', ['THREE THINGS', 'TO REMEMBER'], { sc: 'SC.11 · THE CLOSE', size: 80 });
flow('P11', 'THREE THINGS', [{ t: 'ONE', sub: 'SEA BRIDGES STAND ON PILES' }, { t: 'TWO', sub: 'A STIFF, LIGHT DECK REACHES FARTHER' }, { t: 'THREE', sub: 'A BIG NUMBER NEEDS A DENOMINATOR' }], [], { w: 1.6 });
hero('P11', SB, { piles: true }, 'THE OTHER END OF THE BRIDGE', { camAz: 24 });
stmt('P11', ['INDIA BUILT THE BRIDGE.', 'WHAT WILL THE OTHER END', 'BECOME?'], { size: 62, k: 'hook', w: 1.4 });
stmt('P11', ['INDIA MEGAPROJECTS'], { sub: 'THE ROAD ACROSS THE SEA', size: 100, align: 'center' });
finish();
