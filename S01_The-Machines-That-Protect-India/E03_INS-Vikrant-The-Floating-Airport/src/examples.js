// Everyday-example panels for the v6 narration: each engineering idea is paired with a picture a 5-year-old can read
// (balloon, bicycle pump, crowd at a door, gas stove, candle and spoon, chocolate bar, bicycle brake, kite, cake, movie ticket).
// Same rules as panels.js: pure functions of p, labels >= 28 px, leaders attach to anchors, conceptual drawings are labelled.
(function () {
  const BP = window.BP, C = BP.C, seg = BP.seg, T = BP.text, L = BP.label, PANELS = window.PANELS;
  const head = (ix, s, p, y = 150, size = 56) => T(ix, s, 640, y, size, { align: 'center', p, hot: 0.5 });
  const wobble = (a, f = 1.5) => (BP.now == null ? 0 : Math.sin(BP.now * f + a) * 3);

  // ---- 1.3 a car is a body plus a motor ----
  PANELS['1.3'] = { draw(ix, p) {
    head(ix, 'BODY + MOTOR', seg(p, 0, 0.3));
    BP.poly(ix, [[160, 470], [160, 420], [240, 415], [300, 360], [500, 360], [570, 415], [640, 420], [640, 470]], { close: true, w: 2.4, p: seg(p, 0.1, 0.5), seed: 1301, fill: 'rgba(238,246,255,0.10)' });
    [250, 550].forEach((x, i) => { BP.circle(ix, x, 470, 34, { w: 2.2, p: seg(p, 0.3, 0.6), seed: 1310 + i }); BP.circle(ix, x, 470, 12, { w: 1.4, p: seg(p, 0.35, 0.65), seed: 1320 + i }); });
    BP.line(ix, 120, 504, 700, 504, { w: 1.6, col: C.cyan, p: seg(p, 0.2, 0.5), seed: 1330 });
    BP.rect(ix, 190, 425, 90, 36, { w: 2, p: seg(p, 0.55, 0.75), seed: 1331 });
    BP.pt('car:body', 400, 360); BP.pt('car:motor', 235, 425);
    BP.leaderBy(ix, 'car:body', 0, -90, 'BODY', { p: seg(p, 0.4, 0.65), seed: 1340 });
    BP.leaderBy(ix, 'car:motor', -60, -130, 'MOTOR', { p: seg(p, 0.7, 0.9), seed: 1342 });
    BP.jet(ix, 960, 330, 1.8, 0, { p: seg(p, 0.6, 0.95), fill: true, id: 'cj', seed: 1350, bay: true });
    L(ix, 'A FIGHTER JET IS THE SAME', 960, 500, 28, { align: 'center', p: seg(p, 0.85, 1), weight: 400 });
  } };

  // ---- 1.4 a balloon you let go ----
  PANELS['1.4'] = { draw(ix, p) {
    head(ix, 'THROW AIR BACK, MOVE FORWARD', seg(p, 0, 0.3), 150, 44);
    BP.circle(ix, 330, 340, 80, { w: 2.4, p: seg(p, 0.1, 0.4), seed: 1401 });
    BP.poly(ix, [[330, 420], [318, 440], [342, 440]], { close: true, w: 2, p: seg(p, 0.35, 0.5), seed: 1402 });
    BP.poly(ix, [[330, 440], [312, 500], [346, 560]], { w: 1.4, p: seg(p, 0.4, 0.55), seed: 1403, col: C.cyan });
    [[170, 420], [150, 460], [170, 500]].forEach(([x, y], i) => BP.arrow(ix, 312, 440, x, y, { w: 2, p: seg(p, 0.5 + i * 0.05, 0.7 + i * 0.05), seed: 1410 + i, col: C.cyan }));
    L(ix, 'AIR OUT, FAST', 90, 560, 28, { p: seg(p, 0.6, 0.8), weight: 400 });
    BP.arrow(ix, 430, 340, 620, 340, { w: 2.6, p: seg(p, 0.65, 0.85), seed: 1420 });
    L(ix, 'THE BALLOON GOES THIS WAY', 430, 290, 28, { p: seg(p, 0.7, 0.9), weight: 400 });
    BP.jet(ix, 930, 400, 2.4, 0, { p: seg(p, 0.5, 0.95), fill: true, id: 'bj', seed: 1430 });
    [[-1, 'a'], [0, 'b'], [1, 'c']].forEach(([k], i) => BP.arrow(ix, 782, 400 + k * 18, 690, 400 + k * 28, { w: 2, p: seg(p, 0.75 + i * 0.04, 0.95), seed: 1440 + i, col: C.cyan }));
    BP.arrow(ix, 1100, 400, 1215, 400, { w: 2.6, p: seg(p, 0.85, 1), seed: 1450 });
    L(ix, 'SAME IDEA IN THE ENGINE', 930, 600, 28, { align: 'center', p: seg(p, 0.9, 1), weight: 400 });
  } };

  // ---- 2.1 a country that cannot build engines must ask for them ----
  PANELS['2.1'] = { draw(ix, p) {
    head(ix, 'A REASON BEYOND ENGINEERING', seg(p, 0, 0.3), 150, 44);
    BP.rect(ix, 90, 290, 260, 120, { w: 2.4, p: seg(p, 0.1, 0.35), seed: 2101 }); T(ix, 'INDIA', 220, 365, 44, { align: 'center', p: seg(p, 0.25, 0.45) });
    BP.rect(ix, 930, 290, 260, 120, { w: 2.4, p: seg(p, 0.1, 0.35), seed: 2102, col: C.cyan }); T(ix, 'SUPPLIER', 1060, 365, 44, { align: 'center', p: seg(p, 0.25, 0.45), col: C.cyan });
    [['ENGINES', 270], ['REPAIRS', 350], ['DELIVERY DATES', 430]].forEach(([s, y], i) => {
      const q = seg(p, 0.4 + i * 0.17, 0.62 + i * 0.17);
      BP.arrow(ix, 920, y + 20, 360, y + 20, { w: 2.2, p: q, seed: 2110 + i, col: C.cyan });
      L(ix, s, 640, y + 8, 28, { align: 'center', p: seg(q, 0.3, 1), weight: 400 });
    });
    L(ix, 'ASK, WAIT, DEPEND', 640, 600, 36, { align: 'center', p: seg(p, 0.85, 1), weight: 600 });
  } };

  // ---- 2.2 the 2025 order and its delivery window ----
  const yr = (y) => 100 + (y - 2025) * 135;
  PANELS['2.2'] = { draw(ix, p) {
    head(ix, '113 MORE AMERICAN ENGINES', seg(p, 0, 0.3), 150, 56);
    BP.line(ix, 100, 400, 1180, 400, { w: 2.4, p: seg(p, 0.1, 0.4), seed: 2201 });
    for (let y = 2025; y <= 2032; y++) {
      BP.line(ix, yr(y), 386, yr(y), 414, { w: 1.6, p: seg(p, 0.1, 0.4), seed: 2210 + y });
      L(ix, String(y), yr(y), 362, 28, { align: 'center', p: seg(p, 0.2, 0.45), weight: 400, plate: false });
    }
    BP.pt('o2025', yr(2025.85), 400);
    BP.leaderBy(ix, 'o2025', 50, 100, 'NOV 2025: ORDER SIGNED', { p: seg(p, 0.4, 0.65), seed: 2230, side: 'r' });
    BP.rect(ix, yr(2027), 420, yr(2032) - yr(2027), 36, { w: 2.2, p: seg(p, 0.6, 0.85), seed: 2240, col: C.cyan });
    BP.dim(ix, yr(2027), 456, yr(2032), 456, 'DELIVERIES 2027 TO 2032', 60, { p: seg(p, 0.75, 1), seed: 2250, size: 28 });
  } };

  // ---- 2.3 a fighter order is also an engine order ----
  PANELS['2.3'] = { draw(ix, p) {
    BP.jet(ix, 300, 300, 2.2, 0, { p: seg(p, 0, 0.45), fill: true, id: 'oj', seed: 2301, bay: true });
    T(ix, '=', 640, 330, 96, { align: 'center', p: seg(p, 0.35, 0.55), hot: 0.6 });
    BP.turbofan(ix, 780, 300, 0.4, { p: seg(p, 0.45, 0.85), id: 'ot', seed: 2310, flow: seg(p, 0.85, 1) });
    BP.stamp(ix, 'A FIGHTER ORDER IS ALSO AN ENGINE ORDER', 640, 520, 36, { p: seg(p, 0.7, 1), seed: 2320 });
  } };

  // ---- 4.pump a bicycle pump squeezes air ----
  PANELS['4.pump'] = { draw(ix, p) {
    head(ix, 'LIKE A BICYCLE PUMP', seg(p, 0, 0.3), 150, 56);
    BP.rect(ix, 300, 320, 420, 100, { w: 2.4, p: seg(p, 0.1, 0.45), seed: 4101, over: false });
    BP.line(ix, 300, 370, 250, 370, { w: 2, p: seg(p, 0.3, 0.5), seed: 4102 });
    const px = 520 + (BP.now == null ? 0 : -90 * (0.5 + 0.5 * Math.sin(BP.now * 1.3)));  // piston slides: air gets tighter as it moves left
    BP.line(ix, px, 326, px, 414, { w: 5, p: seg(p, 0.45, 0.65), seed: 4103 });
    BP.line(ix, px, 370, 900, 370, { w: 3, p: seg(p, 0.45, 0.7), seed: 4104 });
    BP.rect(ix, 900, 340, 24, 60, { w: 2.2, p: seg(p, 0.6, 0.75), seed: 4105, over: false });
    const r = H.rng(41);
    for (let i = 0; i < 26; i++) { const t = r(), y = 335 + r() * 70; if (seg(p, 0.55, 0.9) > i / 26) BP.dot(ix, 310 + t * (px - 322), y, 3, C.ink, 0.9); }
    BP.pt('pump:piston', px, 326); BP.pt('pump:air', 400, 330);
    BP.leaderBy(ix, 'pump:piston', 40, -80, 'PRESS', { p: seg(p, 0.7, 0.9), seed: 4110 });
    BP.leaderBy(ix, 'pump:air', -20, -95, 'AIR GETS SQUEEZED', { p: seg(p, 0.8, 1), seed: 4112, side: 'l' });
    L(ix, 'THE MORE YOU PRESS, THE HARDER IT PUSHES BACK', 640, 560, 28, { align: 'center', p: seg(p, 0.85, 1), weight: 400 });
  } };

  // ---- 4.crowd a crowd squeezing through a door ----
  PANELS['4.crowd'] = { draw(ix, p) {
    head(ix, 'LIKE A CROWD AT A DOOR', seg(p, 0, 0.3), 150, 56);
    BP.line(ix, 640, 230, 640, 340, { w: 4, p: seg(p, 0.1, 0.35), seed: 4201 });
    BP.line(ix, 640, 440, 640, 600, { w: 4, p: seg(p, 0.1, 0.35), seed: 4202 });
    for (let i = 0; i < 24; i++) {
      const col = i % 4, row = Math.floor(i / 4), x = 380 + col * 52 + wobble(i), y = 280 + row * 52 + wobble(i * 2);
      if (seg(p, 0.3, 0.8) > i / 24) BP.circle(ix, x, y, 17, { w: 1.8, p: 1, seed: 4210 + i, col: i === 14 ? C.red : C.ink });
    }
    BP.pt('crowd:fall', 380 + 2 * 52, 280 + 3 * 52); BP.pt('crowd:door', 640, 390);
    BP.leaderBy(ix, 'crowd:fall', -60, 130, 'ONE STUMBLES', { p: seg(p, 0.6, 0.85), seed: 4240, col: C.red, side: 'l' });
    [[760, 380], [820, 400], [880, 370]].forEach(([x, y], i) => BP.circle(ix, x, y, 17, { w: 1.8, p: seg(p, 0.5 + i * 0.05, 0.7), seed: 4250 + i, a: 0.5 }));
    L(ix, 'EVERYONE BEHIND JAMS', 760, 560, 28, { p: seg(p, 0.8, 1), weight: 400 });
  } };

  // ---- 5.stove the fire in the engine is a fiercer gas stove ----
  PANELS['5.stove'] = { draw(ix, p) {
    head(ix, 'IDEA 2 · HEAT', seg(p, 0, 0.25), 150, 56);
    BP.circle(ix, 330, 470, 70, { w: 2.4, p: seg(p, 0.1, 0.4), seed: 5101 }); BP.circle(ix, 330, 470, 44, { w: 1.6, p: seg(p, 0.15, 0.45), seed: 5102 });
    BP.line(ix, 220, 540, 440, 540, { w: 2.4, p: seg(p, 0.1, 0.4), seed: 5103 });
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, f = 18 + wobble(i, 5) + 6; BP.line(ix, 330 + Math.cos(a) * 56, 470 + Math.sin(a) * 56, 330 + Math.cos(a) * (56 + f), 470 + Math.sin(a) * (56 + f), { w: 2.4, col: C.orange, p: seg(p, 0.4, 0.7), seed: 5110 + i, bleed: false }); }
    BP.rect(ix, 270, 330, 120, 70, { w: 2.2, p: seg(p, 0.35, 0.6), seed: 5120, over: false });
    BP.pt('stove:flame', 330, 470 + 70);
    BP.leaderBy(ix, 'stove:flame', 120, 70, 'A GAS STOVE', { p: seg(p, 0.6, 0.85), seed: 5130, side: 'r' });
    BP.turbofan(ix, 650, 400, 0.5, { p: seg(p, 0.55, 0.9), id: 'sf', seed: 5140, heat: seg(p, 0.8, 1), flow: seg(p, 0.9, 1) });
    L(ix, 'THE ENGINE: THE SAME FIRE, FIERCER', 840, 520, 28, { align: 'center', p: seg(p, 0.85, 1), weight: 400 });
  } };

  // ---- 5.spoon a spoon left in a candle flame ----
  PANELS['5.spoon'] = { draw(ix, p) {
    head(ix, 'HOTTER THAN THE METAL', seg(p, 0, 0.3), 150, 56);
    BP.rect(ix, 330, 440, 56, 130, { w: 2.2, p: seg(p, 0.1, 0.4), seed: 5201, over: false });
    BP.poly(ix, [[358, 440], [338, 405], [358, 360], [378, 405]], { close: true, w: 2.2, col: C.orange, p: seg(p, 0.3, 0.55), seed: 5202, fill: 'rgba(255,155,61,0.25)' });
    BP.circle(ix, 358, 330, 26, { w: 2.2, p: seg(p, 0.5, 0.75), seed: 5203 });
    BP.line(ix, 372, 350, 640, 470, { w: 4, p: seg(p, 0.55, 0.8), seed: 5204 });
    BP.pt('spoon:bowl', 358, 330); BP.pt('spoon:flame', 358, 395);
    BP.leaderBy(ix, 'spoon:bowl', -40, -80, 'SPOON IN THE FLAME', { p: seg(p, 0.7, 0.9), seed: 5210, side: 'r' });
    L(ix, 'THE BLADES MUST SURVIVE THIS FOR', 900, 430, 28, { align: 'center', p: seg(p, 0.75, 0.92), weight: 400 });
    T(ix, 'THOUSANDS OF HOURS', 900, 490, 36, { align: 'center', p: seg(p, 0.85, 1) });
  } };

  // ---- 5.choc a bar made of crumbs cracks at the joins; one piece does not ----
  PANELS['5.choc'] = { draw(ix, p) {
    head(ix, 'ONE PIECE, NO JOINS', seg(p, 0, 0.3), 150, 56);
    const bar = (x0, crumbs, q, seed) => {
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
        const gx = crumbs ? 8 : 0, w = 64, h = 64, x = x0 + c * (w + gx), y = 260 + r * (h + gx);
        BP.rect(ix, x, y, w, h, { w: crumbs ? 1.6 : 1.4, p: seg(q, (r * 4 + c) / 14, (r * 4 + c) / 14 + 0.2), seed: seed + r * 4 + c, over: false, col: crumbs ? C.cyan : C.ink });
      }
      if (crumbs) BP.poly(ix, [[x0 + 66, 250], [x0 + 80, 300], [x0 + 70, 340], [x0 + 92, 400], [x0 + 82, 460]], { w: 2.4, col: C.red, p: seg(q, 0.7, 1), seed: seed + 50, j: 0 });
    };
    bar(150, true, seg(p, 0.1, 0.5), 5301); bar(740, false, seg(p, 0.4, 0.85), 5351);
    L(ix, 'CRUMBS STUCK TOGETHER', 330, 600, 28, { align: 'center', p: seg(p, 0.45, 0.65), weight: 400 });
    L(ix, 'CRACKS START AT THE JOINS', 330, 640, 28, { align: 'center', p: seg(p, 0.6, 0.8), weight: 400 });
    L(ix, 'ONE SINGLE CRYSTAL', 900, 600, 28, { align: 'center', p: seg(p, 0.8, 1), weight: 400 });
  } };

  // ---- 6.brake you do not trust a new brake after one try ----
  PANELS['6.brake'] = { draw(ix, p) {
    head(ix, 'IDEA 3 · PROOF', seg(p, 0, 0.25), 150, 56);
    [[260, 470], [520, 470]].forEach(([x, y], i) => { BP.circle(ix, x, y, 66, { w: 2.4, p: seg(p, 0.1, 0.45), seed: 6101 + i }); BP.circle(ix, x, y, 10, { w: 1.4, p: seg(p, 0.15, 0.5), seed: 6103 + i }); });
    BP.poly(ix, [[260, 470], [350, 380], [470, 380], [520, 470]], { w: 2.2, p: seg(p, 0.3, 0.6), seed: 6110 });
    BP.poly(ix, [[350, 380], [330, 340], [380, 335]], { w: 2.2, p: seg(p, 0.4, 0.6), seed: 6111 });
    BP.line(ix, 470, 380, 500, 335, { w: 2.2, p: seg(p, 0.45, 0.65), seed: 6112 });
    BP.pt('bike:brake', 520, 404);
    BP.leaderBy(ix, 'bike:brake', 80, -120, 'NEW BRAKE', { p: seg(p, 0.6, 0.8), seed: 6120, side: 'r' });
    BP.line(ix, 160, 536, 640, 536, { w: 1.6, col: C.cyan, p: seg(p, 0.2, 0.5), seed: 6130 });
    T(ix, '1 TRY', 900, 330, 64, { align: 'center', p: seg(p, 0.55, 0.75), weight: 400 });
    BP.line(ix, 780, 300, 1020, 360, { w: 3, col: C.red, p: seg(p, 0.7, 0.8), seed: 6140 });
    T(ix, 'IS NOT PROOF', 900, 420, 44, { align: 'center', p: seg(p, 0.75, 1) });
  } };

  // ---- 8.cake buy, copy a recipe, share a recipe, write your own ----
  PANELS['8.cake'] = { draw(ix, p) {
    head(ix, 'THINK OF BAKING A CAKE', seg(p, 0, 0.2), 150, 56);
    [['BUY IT', 'BUY'], ['SOMEONE ELSE\'S RECIPE', 'LICENCE-BUILD'], ['A SHARED RECIPE', 'CO-DEVELOP'], ['YOUR OWN RECIPE', 'OWN']].forEach(([a, b], i) => {
      const x = 215 + i * 285, q = seg(p, 0.15 + i * 0.2, 0.4 + i * 0.2);
      BP.rect(ix, x - 80, 400, 160, 70, { w: 2.2, p: q, seed: 8101 + i, over: false });
      BP.poly(ix, [[x - 80, 400], [x - 60, 365], [x + 60, 365], [x + 80, 400]], { w: 2.2, p: seg(q, 0.3, 1), seed: 8110 + i });
      BP.line(ix, x, 365, x, 335, { w: 2.2, p: seg(q, 0.6, 1), seed: 8120 + i });
      BP.dot(ix, x, 330, 5, C.orange, seg(q, 0.8, 1));
      if (i > 0) BP.rect(ix, x - 50, 230, 100, 70, { w: 1.6, p: seg(q, 0.3, 0.8), seed: 8130 + i, col: C.cyan });
      L(ix, ['', 'RECIPE', 'RECIPE', 'RECIPE'][i], x, 276, 28, { align: 'center', p: seg(q, 0.5, 1), weight: 400, plate: false });
      T(ix, b, x, 540, 28, { align: 'center', p: seg(q, 0.5, 1), weight: 600, col: i < 3 ? C.cyan : C.ink });
    });
  } };

  // ---- 10.ticket you stay because you paid ----
  PANELS['10.ticket'] = { draw(ix, p) {
    head(ix, 'SUNK COST', seg(p, 0, 0.25), 150, 80);
    BP.rect(ix, 120, 300, 300, 140, { w: 2.4, p: seg(p, 0.15, 0.45), seed: 10101, over: false });
    BP.circle(ix, 120, 370, 18, { w: 2, p: seg(p, 0.3, 0.5), seed: 10102 }); BP.circle(ix, 420, 370, 18, { w: 2, p: seg(p, 0.3, 0.5), seed: 10103 });
    T(ix, 'MOVIE TICKET', 270, 385, 28, { align: 'center', p: seg(p, 0.4, 0.6), weight: 600 });
    BP.rect(ix, 700, 280, 400, 230, { w: 2.4, p: seg(p, 0.4, 0.7), seed: 10110, over: false });
    T(ix, 'BORING FILM', 900, 400, 44, { align: 'center', p: seg(p, 0.6, 0.8) });
    T(ix, 'Z z z', 900, 460, 36, { align: 'center', p: seg(p, 0.7, 0.85), weight: 400, col: C.cyan });
    BP.pt('tk:ticket', 420, 370); BP.pt('tk:screen', 700, 400);
    BP.link(ix, 'tk:ticket', 'tk:screen', { arrow: true, w: 2.2, p: seg(p, 0.6, 0.8), seed: 10120, col: C.cyan });
    L(ix, 'I ALREADY PAID, SO I STAY', 640, 600, 36, { align: 'center', p: seg(p, 0.85, 1), weight: 600 });
  } };
})();
