const fs = require('fs');
process.chdir('C:/Users/user/OneDrive/Desktop/films and ads/india-defence-series/ep03-ins-vikrant');
let s = fs.readFileSync('src/ep3.js', 'utf8');
const miss = [];
const rep = (a, b) => { if (!s.includes(a)) { miss.push(a.slice(0, 70)); return; } s = s.replace(a, () => b); };
// 1.1 bigger jet resting on the runway
rep("sideJet(ix, 640, 436, 3.2, { p: seg(p, 0.4, 0.85), seed: 310, id: 'rj' });", "sideJet(ix, 640, 424, 5.2, { p: seg(p, 0.4, 0.85), seed: 310, id: 'rj' });");
// 3.1 dimension under the ship, waves lower
rep("waves(ix, 60, 1220, 560, seg(p, 0.3, 0.6), 430);\n    BP.dim(ix, ...BP.ref('g:stern'), ...BP.ref('g:bow'), '262 METRES LONG', -110,", "waves(ix, 60, 1220, 575, seg(p, 0.3, 0.6), 430);\n    BP.dim(ix, ...BP.ref('g:stern'), ...BP.ref('g:bow'), '262 METRES LONG', 215,");
// 3.2 jet sits on the deck behind the ramp, labels clear of the island
rep("sideJet(ix, 630, 410, 1.7, { p: seg(p, 0.4, 0.7), id: 'hj', seed: 501, rot: -0.05 });", "sideJet(ix, 690, 427, 1.4, { p: seg(p, 0.4, 0.7), id: 'hj', seed: 501 });");
rep("BP.arrow(ix, 520, 398, 440, 398, { w: 2.6, p: seg(p, 0.6, 0.8), seed: 505, col: C.cyan });", "BP.arrow(ix, 665, 392, 735, 392, { w: 2.6, p: seg(p, 0.6, 0.8), seed: 505, col: C.cyan });");
rep("BP.leaderTo(ix, 'hj:engine', 330, 250, 'ENGINES PUSH', { p: seg(p, 0.65, 0.85), seed: 506, side: 'l' });", "BP.leaderBy(ix, 'hj:engine', 40, -110, 'ENGINES PUSH', { p: seg(p, 0.65, 0.85), seed: 506, side: 'r' });");
// 4.2 big close-up of the hook and the wires
rep("[520, 600, 680].forEach((u, i) => { BP.poly(ix, [[u - 14, 520], [u, 512], [u + 14, 520]]", "[560, 640, 720].forEach((u, i) => { BP.poly(ix, [[u - 18, 520], [u, 508], [u + 18, 520]]");
rep("sideJet(ix, 800, 468, 3.3, { p: seg(p, 0.35, 0.75), id: 'hk', seed: 525 });", "sideJet(ix, 900, 460, 6, { p: seg(p, 0.35, 0.75), id: 'hk', seed: 525 });");
rep("BP.poly(ix, [[...BP.ref('hk:hook')], [640, 496], [600, 514]]", "BP.poly(ix, [[...BP.ref('hk:hook')], [672, 502], [640, 514]]");
rep("BP.leaderTo(ix, 'hk:hook', 520, 330, 'HOOK AT THE TAIL', { p: seg(p, 0.75, 0.95), seed: 531, side: 'l' });", "BP.leaderTo(ix, 'hk:hook', 520, 300, 'HOOK AT THE TAIL', { p: seg(p, 0.75, 0.95), seed: 531, side: 'l' });");
// 5.3 header higher so DECK LIFT does not touch it
rep("head(ix, 'LIFTS FROM THE HANGAR', seg(p, 0, 0.3), 140, 52);", "head(ix, 'LIFTS FROM THE HANGAR', seg(p, 0, 0.3), 118, 48);");
rep("BP.leaderTo(ix, 'l:lift', 700, 180, 'DECK LIFT'", "BP.leaderTo(ix, 'l:lift', 700, 200, 'DECK LIFT'");
// 8.1 right column clear of the border
rep("T(ix, b, 800, y, 32,", "T(ix, b, 730, y, 32,");
fs.writeFileSync('src/ep3.js', s);
console.log('misses', JSON.stringify(miss));
