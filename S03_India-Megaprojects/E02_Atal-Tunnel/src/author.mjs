// E02 (The Tunnel Under a Himalayan Pass): authors the beat sheet. Run: node src/author.mjs
// then: node ../../_shared/kit-v2/tools/compose-episode.mjs .
// Rules learned on E01: callout beats use cam 'hold'; titles under ~42 characters; numbers on `number`
// beats (size 150, no bars) or next to "(PIB)"; one route segment label per beat; no digits in the title card.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = join(dirname(fileURLToPath(import.meta.url)), '..');

const md = readFileSync(join(dir, 'passages.md'), 'utf8');
const parts = md.split(/^### (P\d+)\s*$/m);
const passages = [];
for (let i = 1; i < parts.length; i += 2) {
  const text = parts[i + 1].trim().replace(/\s*\n\s*/g, ' ');
  const words = (text.match(/[A-Za-z0-9'’-]+/g) || []).length;
  passages.push({ id: parts[i], text, estSec: Math.round((words / 2.42) * 10) / 10, flag: /^a fictional/i.test(text) ? 'FICTIONAL SCENARIO' : '', words });
}

const B = [];
let n = 0, scene = 0;
const add = (p, o) => { const sc = +p.slice(1); if (sc !== scene) { scene = sc; n = 0; } n += 1; const sparse = ['flow', 'number', 'timeline', 'route'].includes(o.tpl); const b = Object.assign({ id: `${sc}.${String(n).padStart(2, '0')}`, p, w: 1 }, o); if (sparse) b.w = Math.min(b.w, o.tpl === 'flow' ? 0.62 : 0.72); else if (o.tpl === 'hero' && o.w == null) b.w = 1.6; B.push(b); };
const hero = (p, kind, opts, title, extra) => add(p, Object.assign({ tpl: 'hero', kind, opts, title, tag: 'CONCEPTUAL, NOT TO SCALE', camAz: 22 }, extra, extra && extra.callouts ? { camAz: 9 } : {}));
const stmt = (p, lines, extra) => { const e = Object.assign({}, extra); if (!e.hero && !(e.size >= 100)) { e.hero = 'pass-profile'; e.heroOpts = { dig: true }; e.camAz = 22; if (e.align) delete e.align; if (e.size > 64) e.size = 64; } if (e.hero && !e.tag) e.tag = 'CONCEPTUAL, NOT TO SCALE'; add(p, Object.assign({ tpl: 'statement', lines, size: 70 }, e)); };
const flow = (p, title, nodes, links, extra) => add(p, Object.assign({ tpl: 'flow', title, nodes, links: links || 'chain', layout: 'row' }, extra));
const num = (p, title, value, unit, note, source, extra) => add(p, Object.assign({ tpl: 'number', k: 'number', title, value, unit, note, size: 150, source }, extra));
const PP = 'pass-profile', TS = 'tunnel-section';

// P01
hero('P01', PP, { snow: true, noTunnel: true, growDur: 3 }, 'ROHTANG PASS, IN THE HIMALAYAS', { sc: 'SC.1 · THE PASS', k: 'hook', callouts: [{ fx: 0.5, fy: 0.08, t: 'THE PASS' }, { fx: 0.12, fy: 0.55, t: 'MANALI SIDE' }, { fx: 0.88, fy: 0.55, t: 'LAHAUL AND SPITI SIDE' }] });
hero('P01', PP, { snow: true, noTunnel: true, growDur: 4 }, 'SNOW CLOSED THE ROAD FOR MONTHS', { camAz: 14, w: 1.2 });
flow('P01', 'A VALLEY CUT OFF', ['MANALI', { t: 'CLOSED', sub: 'ABOUT SIX MONTHS EACH WINTER (PIB)', hot: true }, 'LAHAUL AND SPITI']);
stmt('P01', ['SO ENGINEERS ASKED', 'A DIFFERENT QUESTION'], { hero: PP, heroOpts: { snow: true, noTunnel: true }, camAz: 12 });
hero('P01', PP, { dig: true, growDur: 4.5 }, 'NOT HOW TO CLEAR THE SNOW', { camAz: 14, callouts: [{ fx: 0.5, fy: 0.7, t: 'UNDERNEATH' }], w: 1.3 });
stmt('P01', ['BUT HOW TO GO', 'UNDERNEATH IT.'], { k: 'hook', size: 84, align: 'center', w: 1.2 });

// P02
add('P02', { tpl: 'timeline', sc: 'SC.2 · THE NUMBERS', title: 'THE ATAL TUNNEL', items: [{ t: '2022', sub: 'RECOGNISED AS THE WORLD\'S LONGEST HIGHWAY TUNNEL ABOVE 10,000 FEET (PIB)', hot: true, at: 0.5, size: 84 }] });
num('P02', 'HOW LONG', '9.02', 'KILOMETRES', 'THE ATAL TUNNEL', 'PIB', { w: 1.2 });
hero('P02', PP, { dig: true, growDur: 2 }, 'A STRAIGHT LINE UNDER THE PASS', { camAz: 12, chain: '9.02 KM (PIB)', w: 1.2 });
num('P02', 'MANALI TO SARCHU', '46', 'KILOMETRES SHORTER', 'A SHORTER ROAD', 'PIB');
num('P02', 'AND THE TRAVEL TIME', '4 TO 5', 'HOURS SAVED', 'THE JOURNEY IS SHORTER', 'PIB', { size: 120 });

// P03
add('P03', { tpl: 'timeline', sc: 'SC.3 · TWENTY YEARS', title: 'FROM DECISION TO DEDICATION', items: [{ t: 'JUN 2000', sub: 'DECISION TO BUILD', at: 0.08 }, { t: 'MAY 2002', sub: 'ACCESS ROAD STARTED', at: 0.36 }, { t: 'OCT 2017', sub: 'THE TWO ENDS MEET', at: 0.66 }, { t: 'OCT 2020', sub: 'DEDICATED TO THE NATION', hot: true, at: 0.94 }] });
stmt('P03', ['TWENTY YEARS,', 'FOR NINE KILOMETRES.'], { hero: PP, heroOpts: { dig: true }, camAz: 14, size: 66, w: 1.2 });
stmt('P03', ['ROCK DOES NOT HURRY.'], { size: 88, align: 'center', k: 'payoff' });

// P04 idea 1
stmt('P04', ['IDEA ONE:', 'READING THE ROCK'], { sc: 'SC.4 · IDEA 1 · READING THE ROCK', hero: PP, heroOpts: { layers: true }, camAz: 14, size: 76 });
flow('P04', 'THINK OF CUTTING A CAKE', ['A CAKE YOU CANNOT SEE INSIDE', { t: 'HERE, A SOFT LAYER' }, { t: 'THERE, A NUT', hot: true }]);
hero('P04', PP, { layers: true }, 'A MOUNTAIN IS NOT ONE MATERIAL', { callouts: [{ fx: 0.28, fy: 0.8, t: 'SOFT LAYER' }, { fx: 0.62, fy: 0.74, t: 'HARD NUGGET' }], w: 1.3 });
stmt('P04', ['YOU CANNOT PLAN', 'EVERY CUT IN ADVANCE.'], { size: 70, align: 'center' });
flow('P04', 'SUPPORT FOLLOWS THE ROCK', [{ t: 'DRILL AND BLAST', sub: 'THE BUILDERS\' CHOICE' }, { t: 'CHANGE THE SUPPORT', sub: 'AS THE DIGGING GOES', hot: true }], 'chain', { w: 1.2 });
flow('P04', 'BEFORE EACH BLAST, AFTER IT', [{ t: 'BEFORE EACH BLAST', sub: 'THE ROCK IS A GUESS' }, { t: 'AFTER IT', sub: 'THE ROCK TELLS YOU WHAT IT NEEDS', hot: true }], 'chain', { w: 1.2 });

// P05 idea 2
stmt('P05', ['IDEA TWO:', 'AIR'], { sc: 'SC.5 · IDEA 2 · AIR', hero: TS, heroOpts: { air: true }, camAz: 16, size: 86 });
flow('P05', 'A ROOM WITH NO WINDOWS', ['A ROOM WITH NO WINDOWS', { t: 'A CAR ENGINE RUNNING', hot: true }, 'THE AIR TURNS BAD']);
hero('P05', TS, { air: true }, 'FANS MOVE THE AIR IN AND OUT', { callouts: [{ fx: 0.5, fy: 0.08, t: 'FANS IN THE CROWN' }], w: 1.3 });
stmt('P05', ['A SEMI-TRANSVERSE SYSTEM:', 'LARGE FANS CIRCULATE AIR', 'ALONG THE TUNNEL'], { size: 56, hero: TS, heroOpts: { air: true }, camAz: 18 });
flow('P05', 'DIFFERENT PRESSURE AT EACH END', [{ t: 'ONE PORTAL', sub: 'ONE AIR PRESSURE' }, { t: 'THE OTHER', sub: 'ANOTHER AIR PRESSURE', hot: true }], 'chain', { w: 1.2 });
stmt('P05', ['AND DIFFERENT AGAIN', 'THROUGH THE SEASONS'], { size: 72, align: 'center' });

// P06 idea 3
stmt('P06', ['IDEA THREE:', 'A WAY OUT,', 'A WAY TO KNOW'], { sc: 'SC.6 · IDEA 3 · A WAY OUT', hero: TS, heroOpts: { signs: true, services: true }, camAz: 16, size: 70 });
stmt('P06', ['A TUNNEL THIS LONG', 'CANNOT RELY ON', 'ONE SAFEGUARD.'], { size: 64, align: 'center' });
hero('P06', TS, { signs: true }, 'EXIT SIGNS EVERY TWENTY-FIVE METRES', { callouts: [{ fx: 0.12, fy: 0.45, t: 'EXIT SIGN' }], tag: 'CONCEPTUAL, PIB FACTSHEET' });
hero('P06', TS, { services: true }, 'A TELEPHONE, A HYDRANT, A CAMERA', { callouts: [{ fx: 0.88, fy: 0.5, t: 'SERVICE POINTS' }], tag: 'CONCEPTUAL, PIB FACTSHEET', w: 1.3 });
flow('P06', 'AIR QUALITY, WATCHED EVERY KILOMETRE', [{ t: 'CAMERAS', sub: 'DETECT INCIDENTS' }, { t: 'SENSORS', sub: 'WATCH THE AIR', hot: true }, { t: 'SIGNS', sub: 'SHOW THE WAY' }], 'chain', { w: 1.2 });
stmt('P06', ['THE EXIT SIGNS', 'ARE NOT FOR THE SHOW.', 'THEY ARE FOR THE WORST NIGHT.'], { size: 60, align: 'center', k: 'payoff', w: 1.3 });

// P07 india
hero('P07', PP, { layers: true, dig: true, growDur: 4 }, 'THE BORDER ROADS ORGANISATION BUILT IT', { sc: 'SC.7 · WHAT IS BUILT, WHAT IS NOT', camAz: 12 });
num('P07', 'THE HARDEST STRETCH', '587', 'METRES OF WEAK ROCK', 'THE SERI NALAH FAULT ZONE', 'PIB FACTSHEET, 24 MAR 2022', { w: 1.3 });
add('P07', { tpl: 'timeline', title: 'THE TWO ENDS MET', items: [{ t: '15 OCT 2017', sub: 'BREAKTHROUGH FROM BOTH ENDS (PIB)', hot: true, at: 0.5, size: 80 }] });
stmt('P07', ['IT REMOVES ONE BARRIER.', 'IT IS NOT THE WHOLE ROUTE.'], { size: 66, align: 'center', k: 'payoff' });

// P08 field
flow('P08', 'TUNNELS ARE MEASURED MANY WAYS', ['LENGTH', 'ALTITUDE', 'WIDTH', 'TUBES'], [], { sc: 'SC.8 · THE FIELD' });
flow('P08', 'THE RECORD IS ONE MEASURE', ['LENGTH', { t: 'ALTITUDE', sub: 'ABOVE TEN THOUSAND FEET', hot: true }, 'WIDTH', 'TUBES'], [], { w: 1.2 });
stmt('P08', ['A HIGHWAY TUNNEL,', 'ABOVE TEN THOUSAND FEET.'], { size: 66, hero: PP, heroOpts: {}, camAz: 12 });
stmt('P08', ['CHANGE THE MEASURE,', 'AND THE LIST CHANGES.'], { size: 70, align: 'center' });
stmt('P08', ['MEASURES,', 'NOT A LEAGUE TABLE.'], { size: 82, align: 'center', k: 'payoff' });

// P09 what if
stmt('P09', ['SNOW IS FALLING', 'AT ONE END'], { sc: 'SC.9 · WHAT IF', hero: PP, heroOpts: { snow: true, noTunnel: true }, camAz: 14, size: 72 });
hero('P09', TS, { air: true }, 'A DRIVER ENTERS THE TUNNEL', { camAz: 16, w: 1.2 });
hero('P09', PP, { dig: true, growDur: 3.5 }, 'NINE KILOMETRES, WITHOUT THE WEATHER', { camAz: 12, w: 1.2 });
stmt('P09', ['A TUNNEL DOES NOT REMOVE WINTER.', 'IT MOVES THE ROAD OUT OF IT.'], { size: 62, align: 'center' });

// P10 habit
stmt('P10', ['ONE IDEA ABOUT PEOPLE:', 'THE PLANNING FALLACY'], { sc: 'SC.10 · THE HABIT', size: 70 });
flow('P10', 'WE EXPECT LESS TIME', [{ t: 'WE EXPECT', sub: 'A HARD JOB TO TAKE LESS TIME' }, { t: 'IT TAKES', sub: 'MORE', hot: true }], 'chain', { w: 1.2 });
hero('P10', PP, { dig: true, growDur: 4 }, 'EVERY SECTION HAD ITS SURPRISE', { camAz: 44 });
add('P10', { tpl: 'timeline', title: 'THE PLAN AND THE ROCK', items: [{ t: '2000', sub: 'THE DECISION', at: 0.12 }, { t: '2017', sub: 'THE TWO ENDS MEET', hot: true, at: 0.62 }, { t: '2020', sub: 'DEDICATED', at: 0.92 }] });
hero('P10', PP, { layers: true, dig: true, growDur: 4 }, 'THE ROCK DECIDES THE SCHEDULE', { camAz: 44 });
stmt('P10', ['ROCK IS A', 'SURPRISE GENERATOR.'], { size: 80, align: 'center', k: 'payoff' });

// P11 close
stmt('P11', ['THREE THINGS', 'TO REMEMBER'], { sc: 'SC.11 · THE CLOSE', size: 84, align: 'center' });
flow('P11', 'THREE THINGS', [{ t: 'ONE', sub: 'READ THE ROCK AS YOU CUT IT' }, { t: 'TWO', sub: 'A LONG TUNNEL NEEDS AIR AND A WAY OUT' }, { t: 'THREE', sub: 'A BARRIER REMOVED IS NOT THE WHOLE ROUTE' }], [], { w: 1.6 });
hero('P11', PP, { dig: true, growDur: 4 }, 'ONE PASS, ONE TUNNEL', { camAz: 14 });
stmt('P11', ['INDIA BUILT THE TUNNEL.', 'WHICH PASS IS NEXT?'], { size: 74, align: 'center', k: 'hook', w: 1.4 });
stmt('P11', ['INDIA MEGAPROJECTS'], { sub: 'THE TUNNEL UNDER A HIMALAYAN PASS', size: 100, align: 'center' });

mkdirSync(join(dir, 'src'), { recursive: true });
writeFileSync(join(dir, 'src', 'beats.dsl.json'), JSON.stringify(B, null, 1));
writeFileSync(join(dir, 'episode.s2.json'), JSON.stringify({ id: 'E02', title: 'The Tunnel Under a Himalayan Pass', seriesTitle: 'INDIA MEGAPROJECTS', world: 'strata', fps: 30, seed: 's03e02', passages, beats: [] }, null, 1));
writeFileSync(join(dir, 'src', 'camera.json'), '{}\n');
writeFileSync(join(dir, 'src', 'episode.js'), '// E02 uses only kit templates; no custom ops.\n(function () { const BB = window.BB; BB.customOps = BB.customOps || {}; })();\n');
console.log('beats', B.length, 'passages', passages.length, 'est voice s', passages.reduce((s, p) => s + p.estSec, 0).toFixed(1));
