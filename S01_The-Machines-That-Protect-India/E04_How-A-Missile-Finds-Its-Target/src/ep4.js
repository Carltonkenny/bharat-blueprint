// Episode 4 panels: public, concept-level explanation of how a defence system finds and meets a target (sense, decide, steer).
// Everything illustrated is an everyday analogy or an abstract marker; there are no designs, dimensions, ranges or payloads.
(function () {
  const BP = window.BP, C = BP.C, seg = BP.seg, T = BP.text, L = BP.label, M = BP.M, K = BP.K, V = BP.V, clamp = H.clamp;
  const PANELS = (window.PANELS = {});
  const { head, tick, FIX, source, scope, person, gear, card } = K;
  const CX = 640, pulse = (t, k = 3, lo = 0.5) => lo + (1 - lo) * (0.5 + 0.5 * Math.sin(t * k));
  const chevron = (ix, x, y, ang, s, p, seed, col) => { const c = Math.cos(ang), n = Math.sin(ang), P = (u, v) => [x + (u * c - v * n) * s, y + (u * n + v * c) * s]; BP.poly(ix, [P(12, 0), P(-8, -7), P(-3, 0), P(-8, 7)], { close: true, w: 2, p, seed, j: 0, col, fill: 'rgba(238,246,255,0.2)' }); };   // abstract marker, not a design
  const ring = (ix, x, y, r, p, seed, col) => { BP.circle(ix, x, y, r, { w: 2, p, seed, col }); BP.circle(ix, x, y, r * 0.45, { w: 1.4, p, seed: seed + 1, col, a: 0.7 }); };
  const checks = (ix, items, p, y0, dy) => items.forEach((s, i) => { tick(ix, 90, y0 + i * dy, seg(p, 0.2 + i * 0.15, 0.32 + i * 0.15), 970 + i, C.cyan); T(ix, s, 150, y0 + i * dy + 10, 36, { p: seg(p, 0.22 + i * 0.15, 0.4 + i * 0.15), weight: 400 }); });
  const bike = (ix, x, y, ro, lean, p, seed, ph) => {                                                        // everyday bicycle: wheel centres at y
    const c = Math.cos(ro), n = Math.sin(ro), Q = (u, v) => [x + (u * c - v * n), y + (u * n + v * c)];
    [-38, 38].forEach((u, i) => { const q = Q(u, 0); BP.circle(ix, q[0], q[1], 26, { w: 2.2, p, seed: seed + i }); K.gear(ix, q[0], q[1], 22, ph, seed + 5 + i * 5); });
    BP.poly(ix, [Q(-38, 0), Q(-8, -40), Q(30, -40), Q(38, 0), Q(8, 0), Q(-8, -40)], { w: 2, p, seed: seed + 20, j: 0.3 });
    BP.line(ix, ...Q(-14, -52), ...Q(-2, -52), { w: 2, p, seed: seed + 21 }); BP.line(ix, ...Q(-8, -40), ...Q(-10, -52), { w: 2, p, seed: seed + 22 });
    const hb = lean; BP.line(ix, ...Q(30, -40), ...Q(34 + hb * 16, -54), { w: 2.4, p, seed: seed + 23, j: 0, col: C.cyan });                                  // handlebar turns
  };

  // ================= SCENE 1 — THE QUESTION =================
  PANELS['1.1'] = { cam: (p) => ({ x: 640, y: 360, z: 1 + 0.03 * p }), draw(ix, p) {
    const t = M.clock(), sw = Math.sin(t * 2.2) * 0.25;
    head(ix, 'WE BELIEVE A MISSILE IS JUST BOUGHT', seg(p, 0, 0.4), 150, 44);
    BP.rect(ix, 480, 290, 320, 210, { w: 2.4, p: seg(p, 0.15, 0.55), seed: 1, over: false, fill: 'rgba(238,246,255,0.08)' });
    BP.line(ix, 480, 360, 800, 360, { w: 1.4, p: seg(p, 0.3, 0.6), seed: 2, col: C.cyan }); BP.line(ix, 640, 290, 640, 500, { w: 1.4, p: seg(p, 0.3, 0.6), seed: 3, col: C.cyan });
    const tx = 640 + Math.sin(sw) * 80, ty = 290 - Math.cos(sw) * 80;
    BP.line(ix, 640, 290, tx, ty, { w: 1.6, p: seg(p, 0.4, 0.6), seed: 4, j: 0 }); BP.rect(ix, tx - 50, ty - 36, 100, 36, { w: 1.8, p: seg(p, 0.45, 0.65), seed: 5, over: false }); T(ix, 'BUY', tx, ty - 9, 28, { align: 'center', p: seg(p, 0.5, 0.7), weight: 600 });
    L(ix, 'A BOX WITH A PRICE TAG', CX, 560, 32, { align: 'center', p: seg(p, 0.7, 1), weight: 400 });
  } };

  PANELS['1.2'] = { draw(ix, p) {
    const bt = M.bt(), t = M.tw(bt, [[0.6, 0], [3.4, 3]], M.ease.lin), a = -Math.PI / 2 + t / 3 * 2 * Math.PI;
    head(ix, 'A DECISION IN SECONDS', seg(p, 0, 0.3), 150, 52);
    BP.circle(ix, CX, 400, 140, { w: 3, p: seg(p, 0.1, 0.5), seed: 20 });
    for (let i = 0; i < 12; i++) { const q = i * Math.PI / 6; BP.line(ix, CX + Math.cos(q) * 124, 400 + Math.sin(q) * 124, CX + Math.cos(q) * 140, 400 + Math.sin(q) * 140, { w: 1.8, p: seg(p, 0.2, 0.7), seed: 21 + i, j: 0 }); }
    BP.arc(ix, CX, 400, 100, -Math.PI / 2, a, { w: 8, col: C.cyan, p: seg(p, 0.3, 0.8), seed: 40 });
    BP.line(ix, CX, 400, CX + Math.cos(a) * 118, 400 + Math.sin(a) * 118, { w: 3, p: seg(p, 0.4, 0.8), seed: 41, j: 0 });
    T(ix, t.toFixed(2) + ' S', CX, 640, 44, { align: 'center', p: seg(p, 0.5, 0.9), hot: 0.4 });
    L(ix, 'MADE BY A MACHINE', 1180, 270, 28, { align: 'right', p: seg(p, 0.7, 1), weight: 400 });
  } };

  PANELS['1.3'] = { draw(ix, p) {
    const t = M.clock();
    head(ix, 'WHAT KEEPS THE CARRIER SAFE', seg(p, 0, 0.3), 140, 48);
    V.carrier(ix, 640, 470, 2.4, { p: seg(p, 0.1, 0.5), id: 'sc', seed: 30, bob: 3, jets: [{ u: -108 }, { u: -78 }, { u: 34 }] });
    K.sea(ix, 590, p, 40);
    [150, 230, 310].forEach((r, i) => BP.arc(ix, 640, 470, r * 1.5, Math.PI * 1.1, Math.PI * 1.9, { w: 1.8, dash: [10, 8], march: 10 + i * 3, j: 0, p: seg(p, 0.5 + i * 0.1, 0.8 + i * 0.1), seed: 50 + i, col: C.cyan, a: pulse(t * 0.8 + i, 2, 0.4) }));
    L(ix, 'EPISODE 3 · THE CARRIER', 60, 640, 28, { p: seg(p, 0.85, 1), weight: 400 });
  } };

  PANELS['1.4'] = { draw(ix, p) {
    const bt = M.bt(), t = M.clock(), path = M.path([[160, 520], [320, 420], [520, 330], [720, 300], [900, 340]], 2), q = path(M.tw(bt, [[0.4, 0], [3.4, 1]], M.ease.io));
    head(ix, 'HOW DOES IT FIND ITS TARGET?', seg(p, 0, 0.3), 150, 48);
    K.dashPath(ix, path, seg(p, 0.3, 0.7), 60);
    ring(ix, 980, 345, 36, seg(p, 0.3, 0.6), 70, C.cyan);
    chevron(ix, q.x, q.y, q.ang, 2.4, seg(p, 0.3, 0.6), 75);
    for (let i = 0; i < 3; i++) { const k = (t * 0.6 + i / 3) % 1; BP.arc(ix, q.x, q.y, 20 + k * 120, q.ang - 0.5, q.ang + 0.5, { w: 1.4, col: C.cyan, seed: 80 + i, a: (1 - k) * 0.8, p: seg(p, 0.5, 0.8) }); }                // it is looking ahead
    T(ix, '?', 640, 560, 96, { align: 'center', p: seg(p, 0.6, 0.9), hot: 0.6, a: pulse(t, 3, 0.4) });
  } };

  // ================= SCENE 2 — WHY IT MATTERS =================
  const yx = (y, a = 1980, b = 2040) => 100 + (y - a) / (b - a) * 1080;
  PANELS['2.1'] = { draw(ix, p) {
    const bt = M.bt(), yr = M.counter(bt, 0.4, 2.6, 1980, 1983.55), px = yx(yr), t = M.clock();
    head(ix, 'A PROGRAMME BEGINS · JULY 1983', seg(p, 0, 0.3), 150, 48);
    BP.line(ix, 100, 420, 1180, 420, { w: 2.6, p: seg(p, 0.1, 0.5), seed: 100 });
    [1980, 1990, 2000, 2010, 2020, 2030, 2040].forEach((y, i) => { BP.line(ix, yx(y), 412, yx(y), 428, { w: 1.6, p: seg(p, 0.2, 0.5), seed: 101 + i }); L(ix, String(y), yx(y), 470, 28, { align: 'center', p: seg(p, 0.25, 0.55), weight: 400 }); });
    BP.line(ix, yx(1980), 420, px, 420, { w: 6, col: C.cyan, p: seg(p, 0.3, 0.6), seed: 110, j: 0, a: 0.8 }); BP.line(ix, px, 392, px, 448, { w: 2.4, col: C.cyan, p: seg(p, 0.3, 0.6), seed: 111, j: 0 });
    if (bt > 2.6) { BP.circle(ix, yx(1983.55), 420, 12 + 5 * Math.sin(t * 5), { w: 2.4, p: seg(p, 0.5, 0.9), seed: 112 }); T(ix, 'JULY 1983', yx(1983.55) + 20, 340, 40, { p: seg(p, 0.5, 0.9), weight: 600 }); }
    source(ix, 'SOURCE: PIB', p, 60, 640);
  } };

  PANELS['2.2'] = { draw(ix, p) {
    const bt = M.bt();
    head(ix, 'WHAT SLOWED IT DOWN', seg(p, 0, 0.3), 140, 52);
    [['DENIAL OF CRITICAL TECHNOLOGIES', 290], ['IMPORT EMBARGOES', 400]].forEach(([s, y], i) => {
      BP.rect(ix, 90, y - 52, 1100, 84, { w: 2, p: seg(p, 0.15 + i * 0.2, 0.45 + i * 0.2), seed: 200 + i, over: false, a: 0.9 });
      T(ix, s, 130, y + 4, 40, { p: seg(p, 0.25 + i * 0.2, 0.55 + i * 0.2), weight: 400 });
      BP.stamp(ix, 'NOT AVAILABLE', 1060, y + 4, 28, { p: seg(p, 0.5 + i * 0.2, 0.8 + i * 0.2), seed: 210 + i, col: C.red });
      K.strike(ix, 130, 130 + s.length * 24, y - 10, (bt - 0.8 - i * 0.7) / 0.5, 220 + i);
    });
    L(ix, 'THE MINISTRY OF DEFENCE LISTS BOTH AS REASONS FOR DELAY', CX, 560, 28, { align: 'center', p: seg(p, 0.8, 1), weight: 400 });
    source(ix, 'SOURCE: PIB', p, 60, 640);
  } };

  PANELS['2.3'] = { draw(ix, p) {
    const bt = M.bt(), g1 = M.tw(bt, [[0.6, 0], [1.6, 1]], M.ease.out), g2 = M.tw(bt, [[1.8, 0], [4.6, 1]], M.ease.out), n = M.counter(bt, 1.8, 4.6, 95.34, 548.45);
    head(ix, 'ONE MISSILE, TWO SANCTIONS', seg(p, 0, 0.3), 150, 52);
    L(ix, 'AKASH · 1983', 140, 280, 32, { p: seg(p, 0.1, 0.35), weight: 600 }); K.bar(ix, 140, 300, 1000, 56, 95.34 / 600 * g1, p, 230);
    T(ix, '95 CRORE RUPEES', 150, 400, 36, { p: seg(p, 0.3, 0.55), weight: 400 });
    L(ix, 'AKASH · BY 2007', 140, 460, 32, { p: seg(p, 0.4, 0.6), weight: 600 }); K.bar(ix, 140, 480, 1000, 56, 95.34 / 600 + (548.45 - 95.34) / 600 * g2, p, 240);
    T(ix, `${Math.round(n)} CRORE RUPEES`, 150, 590, 36, { p: seg(p, 0.5, 0.75), weight: 600 });
    source(ix, 'SOURCE: PIB', p, 60, 652);
  } };

  PANELS['2.4'] = { draw(ix, p) {
    const bt = M.bt(), st = M.tw(bt, [[0.8, 0], [1.3, 1, M.ease.back]]), a = (y) => 140 + (y - 1990) / (2010 - 1990) * 1000, u = M.tw(bt, [[2.0, 0], [4.0, 1]], M.ease.io);
    if (st > 0) BP.stamp(ix, 'MORE THAN 5 TIMES THE COST', CX, 220, 44 * (0.85 + 0.15 * st), { p: st, seed: 250 });
    BP.line(ix, 140, 420, 1140, 420, { w: 2.4, p: seg(p, 0.2, 0.5), seed: 251 });
    [1990, 1995, 2000, 2005, 2010].forEach((y, i) => { BP.line(ix, a(y), 412, a(y), 428, { w: 1.6, p: seg(p, 0.3, 0.6), seed: 252 + i }); L(ix, String(y), a(y), 468, 28, { align: 'center', p: seg(p, 0.3, 0.6), weight: 400 }); });
    BP.circle(ix, a(1995), 420, 14, { w: 2.4, p: seg(p, 0.4, 0.7), seed: 260, col: C.cyan }); BP.circle(ix, a(2007), 420, 14, { w: 2.4, p: seg(p, 0.5, 0.8), seed: 261, dash: [5, 5] });
    BP.arrow(ix, a(1995) + 16, 380, a(1995) + 16 + (a(2007) - a(1995) - 40) * u, 380, { w: 3, p: seg(p, 0.5, 0.9), seed: 262, col: C.orange });
    T(ix, 'PLANNED: 1995', a(1995), 330, 32, { align: 'center', p: seg(p, 0.5, 0.8), weight: 600 }); T(ix, 'NOW: 2007', a(2007), 330, 32, { align: 'center', p: seg(p, 0.6, 0.9), weight: 600 });
    source(ix, 'SOURCE: PIB', p, 60, 640);
  } };

  // ================= SCENE 3 — IDEA 1 · SENSE =================
  const dish = (ix, x, y, s, p, seed, a = 1) => {                                                                                          // radar dish, turning
    const w = Math.abs(Math.cos(M.clock() * 1.8)) * 40 * s;
    BP.line(ix, x, y, x, y + 60 * s, { w: 2.4, p, seed, a }); BP.line(ix, x - 30 * s, y + 60 * s, x + 30 * s, y + 60 * s, { w: 2.4, p, seed: seed + 1, a });
    BP.poly(ix, [[x - w, y - 12 * s], [x - w * 0.5, y - 26 * s], [x + w * 0.5, y - 26 * s], [x + w, y - 12 * s]], { w: 2.2, p, seed: seed + 2, j: 0, a, col: C.cyan });
    BP.line(ix, x, y, x, y - 18 * s, { w: 1.6, p, seed: seed + 3, j: 0, a });
  };
  PANELS['3.1'] = { draw(ix, p) {
    T(ix, 'IDEA 1 · SENSE', 90, 150, 56, { p: seg(p, 0, 0.3), hot: 0.5 });
    L(ix, 'WHY: TO HIT SOMETHING, YOU MUST FIRST KNOW WHERE IT IS', 90, 205, 28, { p: seg(p, 0.2, 0.5), weight: 400 });
    dish(ix, 380, 380, 2.2, seg(p, 0.2, 0.6), 300);
    K.scope(ix, 900, 400, 150, { p: seg(p, 0.3, 0.8), seed: 310, blips: [{ x: 0.4, y: -0.3, t0: 1.2 }, { x: -0.5, y: 0.35, t0: 2.4 }] });
  } };

  PANELS['3.2'] = { draw(ix, p) {
    const bt = M.bt(), t0 = 1.2, ph = ((bt - t0) % 3) / 3, out = clamp(ph * 2), back = clamp(ph * 2 - 1), gy = 520;
    head(ix, 'A SHOUT ACROSS A VALLEY', seg(p, 0, 0.3), 140, 48);
    BP.poly(ix, [[60, gy], [60, 360], [160, 380], [200, gy]], { close: true, w: 2.2, p: seg(p, 0.1, 0.5), seed: 320, fill: 'rgba(238,246,255,0.08)' });
    BP.poly(ix, [[1080, gy], [1080, 300], [1130, 290], [1220, 310], [1220, gy]], { close: true, w: 2.2, p: seg(p, 0.1, 0.5), seed: 321, fill: 'rgba(238,246,255,0.08)' });
    L(ix, 'CLIFF', 1150, 400, 28, { align: 'center', p: seg(p, 0.4, 0.6), weight: 400 });
    person(ix, 300, gy, { s: 1.4, arms: ph < 0.15 && bt > t0 ? 1 : 0, p: seg(p, 0.3, 0.7), seed: 330, id: 'sh' });
    if (bt > t0) { if (out > 0 && back <= 0) for (let i = 0; i < 3; i++) BP.arc(ix, 330 + out * 740 - i * 36, 420, 70, -0.9, 0.9, { w: 2.2, seed: 340 + i, a: 1 - i * 0.3 }); if (back > 0) for (let i = 0; i < 3; i++) BP.arc(ix, 1070 - back * 740 + i * 36, 420, 70, Math.PI - 0.9, Math.PI + 0.9, { w: 2.2, seed: 345 + i, a: 1 - i * 0.3, col: C.cyan }); }
    T(ix, `${Math.min(3, Math.max(0, (bt - t0) % 3)).toFixed(1)} S`, 640, 600, 44, { align: 'center', p: seg(p, 0.5, 0.9), hot: 0.4 });
    L(ix, 'THE DELAY TELLS YOU HOW FAR AWAY THE CLIFF IS', CX, 250, 28, { align: 'center', p: seg(p, 0.7, 1), weight: 400 });
  } };

  PANELS['3.3'] = { draw(ix, p) {
    const bt = M.bt(), t0 = 1.0, ph = ((bt - t0) % 3.2) / 3.2, out = clamp(ph * 2), back = clamp(ph * 2 - 1);
    head(ix, 'RADIO WAVES INSTEAD OF A SHOUT', seg(p, 0, 0.3), 140, 44);
    dish(ix, 220, 400, 1.8, seg(p, 0.1, 0.5), 360);
    ring(ix, 1040, 330, 28, seg(p, 0.3, 0.6), 370, C.ink); L(ix, 'TARGET', 1040, 400, 28, { align: 'center', p: seg(p, 0.5, 0.7), weight: 400 });
    if (bt > t0) { if (back <= 0) for (let i = 0; i < 3; i++) BP.arc(ix, 270 + out * 720 - i * 30, 360, 60, -0.8, 0.8, { w: 2.2, seed: 380 + i, a: 1 - i * 0.3, col: C.cyan }); else for (let i = 0; i < 3; i++) BP.arc(ix, 990 - back * 720 + i * 30, 360, 60, Math.PI - 0.8, Math.PI + 0.8, { w: 2.2, seed: 385 + i, a: 1 - i * 0.3 }); }
    L(ix, 'SEND A PULSE · WAIT FOR THE ECHO · MEASURE THE TIME', CX, 580, 28, { align: 'center', p: seg(p, 0.7, 1), weight: 400 });
    BP.dim(ix, 270, 520, 1010, 520, 'HALF THE ROUND TRIP', 0, { p: seg(p, 0.8, 1), seed: 390, size: 28 });
  } };

  PANELS['3.4'] = { draw(ix, p) {
    head(ix, 'AN ECHO BECOMES A POINT', seg(p, 0, 0.3), 140, 52);
    K.scope(ix, 420, 400, 190, { p: seg(p, 0.1, 0.6), seed: 400, blips: [{ x: 0.45, y: -0.4, t0: 0.8, ring: true, col: C.ink }, { x: -0.3, y: 0.5, t0: 2.0 }] });
    T(ix, 'A PLACE', 740, 330, 48, { p: seg(p, 0.5, 0.75), weight: 600 }); T(ix, 'AND A DIRECTION', 740, 410, 48, { p: seg(p, 0.65, 0.9), weight: 600 });
    BP.arrow(ix, 640, 360, 720, 335, { w: 2.4, p: seg(p, 0.5, 0.75), seed: 410, col: C.cyan });
    L(ix, 'BEFORE: EMPTY SKY · AFTER: A POINT ON A SCREEN', CX, 612, 28, { align: 'center', p: seg(p, 0.8, 1), weight: 400 });
  } };

  // ================= SCENE 4 — IDEA 2 · DECIDE =================
  PANELS['4.1'] = { draw(ix, p) {
    const bt = M.bt(), gy = 540, cyc = (bt - 0.8) % 3.6, u = clamp(cyc / 2.6), bx = 240 + u * 640, by = gy - 40 - Math.sin(u * Math.PI) * 260, land = 880;
    T(ix, 'IDEA 2 · DECIDE', 90, 150, 56, { p: seg(p, 0, 0.3), hot: 0.5 });
    L(ix, 'WHY: KNOWING IS NOT ENOUGH, YOU MUST AIM WHERE IT WILL BE', 90, 205, 28, { p: seg(p, 0.2, 0.5), weight: 400 });
    BP.line(ix, 100, gy, 1180, gy, { w: 2.4, p: seg(p, 0.1, 0.5), seed: 420 });
    BP.line(ix, land, gy, land, gy + 24, { w: 3, col: C.cyan, p: seg(p, 0.4, 0.7), seed: 421, j: 0 }); L(ix, 'WHERE IT WILL LAND', land, gy + 60, 28, { align: 'center', p: seg(p, 0.5, 0.8), weight: 400 });
    K.dashPath(ix, (v) => ({ x: 240 + v * 640, y: gy - 40 - Math.sin(v * Math.PI) * 260 }), seg(p, 0.4, 0.8), 422);
    const pos = bt > 0.8 ? 300 + (land - 300) * M.ease.io(clamp(cyc / 2.6)) : 300;
    person(ix, pos, gy, { s: 1.3, arms: u > 0.8 ? 1 : 0, ph: bt * 9, speed: u > 0 && u < 0.97 ? 1 : 0.2, p: seg(p, 0.3, 0.7), seed: 430, id: 'ct' });
    BP.circle(ix, bx, by, 14, { w: 2.4, p: seg(p, 0.3, 0.6), seed: 440 });
  } };

  PANELS['4.2'] = { draw(ix, p) {
    const bt = M.bt(), t = M.clock(), gy = 400, tx = 200 + M.tw(bt, [[0.4, 0], [5.0, 1]], M.ease.lin) * 700, ty = 250, mx = 160 + M.tw(bt, [[0.4, 0], [5.0, 1]], M.ease.lin) * 740, my = 540 - M.tw(bt, [[0.4, 0], [5.0, 1]], M.ease.lin) * 250;
    head(ix, 'THE SAME SUM, AGAIN AND AGAIN', seg(p, 0, 0.3), 140, 44);
    BP.line(ix, 160, ty, 1000, ty, { w: 1.4, p: seg(p, 0.1, 0.5), seed: 450, dash: [10, 8], j: 0, col: C.cyan });
    ring(ix, tx, ty, 22, seg(p, 0.2, 0.5), 451, C.ink); chevron(ix, mx, my, -0.4, 2, seg(p, 0.2, 0.5), 455);
    for (let i = 0; i < 4; i++) { const f = (t * 2.2 + i * 0.25) % 1, qx = 900 - 0 * f; BP.line(ix, mx, my, tx + 200 + 0, ty, { w: 1.2, seed: 460 + i, j: 0, a: (i === Math.floor((t * 4) % 4) ? 0.9 : 0.2) * seg(p, 0.4, 0.8), col: C.cyan }); }   // the aim is recalculated
    BP.circle(ix, tx + 200, ty, 12, { w: 2, p: seg(p, 0.5, 0.8), seed: 470, col: C.cyan, dash: [4, 4] }); L(ix, 'WHERE IT WILL BE', Math.min(tx + 200, 1030), ty - 36, 28, { align: 'center', p: seg(p, 0.6, 0.9), weight: 600 });
    T(ix, 'MANY TIMES A SECOND', CX, 620, 40, { align: 'center', p: seg(p, 0.7, 1), weight: 600, a: pulse(t, 4, 0.6) });
  } };

  PANELS['4.3'] = { draw(ix, p) {
    const bt = M.bt(), now = M.tw(bt, [[0.4, 0], [3.2, 1]], M.ease.lin), x0 = 160, xn = 560;
    head(ix, 'THE PAST · THE FUTURE', seg(p, 0, 0.3), 140, 52);
    BP.line(ix, x0, 420, 1140, 420, { w: 1.6, p: seg(p, 0.1, 0.5), seed: 500, col: C.cyan });
    for (let i = 0; i < 8; i++) { const x = x0 + (xn - x0) * i / 7 * now; BP.dot(ix, x, 420 - Math.sin(i / 7 * 2 * now) * 40 * 0, 6, C.ink, 0.9 * seg(p, 0.3, 0.6)); }
    BP.dot(ix, x0 + (xn - x0) * now, 420, 10, C.cyan, seg(p, 0.3, 0.6), true);
    BP.line(ix, xn, 420, 1140, 420, { w: 3, p: seg(p, 0.5, 0.9) * (now > 0.9 ? 1 : 0), seed: 510, dash: [12, 10], march: 14, j: 0, col: C.cyan });
    L(ix, 'WHAT IT KNOWS', 360, 500, 32, { align: 'center', p: seg(p, 0.5, 0.8), weight: 600 }); L(ix, 'A PATH THROUGH THE FUTURE', 860, 500, 32, { align: 'center', p: seg(p, 0.7, 1), weight: 600, col: C.cyan });
    L(ix, 'BEFORE THE SUM: ONLY THE PAST · AFTER IT: A PATH', CX, 600, 28, { align: 'center', p: seg(p, 0.8, 1), weight: 400 });
  } };

  // ================= SCENE 5 — IDEA 3 · STEER =================
  PANELS['5.1'] = { draw(ix, p) {
    const bt = M.bt(), gy = 540, path = M.path([[100, gy - 26], [520, gy - 26], [760, gy - 90], [980, gy - 150], [1200, gy - 130]], 2), u = M.tw(bt, [[0.4, 0], [8.0, 1]], M.ease.lin), q = path(u);
    T(ix, 'IDEA 3 · STEER', 90, 150, 56, { p: seg(p, 0, 0.3), hot: 0.5 });
    L(ix, 'WHY: A DECISION IS USELESS UNTIL THE BODY OBEYS', 90, 205, 28, { p: seg(p, 0.2, 0.5), weight: 400 });
    BP.line(ix, 60, gy, 1220, gy, { w: 2, p: seg(p, 0.1, 0.5), seed: 520 });
    K.dashPath(ix, path, seg(p, 0.3, 0.7), 521);
    bike(ix, q.x, q.y, q.ang * 0.7, clamp(Math.sin(q.ang * 3) * 2, -1, 1), seg(p, 0.3, 0.7), 530, q.x / 26);
    L(ix, 'A SMALL TURN · THE WHOLE BIKE LEANS', CX, 620, 32, { align: 'center', p: seg(p, 0.8, 1), weight: 400 });
  } };

  PANELS['5.2'] = { draw(ix, p) {
    const bt = M.bt(), t = M.clock(), path = M.path([[160, 520], [400, 500], [640, 420], [860, 300], [1040, 230]], 2), u = M.tw(bt, [[0.4, 0], [5.0, 1]], M.ease.io), q = path(u);
    head(ix, 'AIR PUSHES · THE WHOLE THING TURNS', seg(p, 0, 0.3), 140, 40);
    K.dashPath(ix, path, seg(p, 0.2, 0.6), 540);
    chevron(ix, q.x, q.y, q.ang, 3, seg(p, 0.2, 0.6), 545);
    for (let i = 0; i < 4; i++) { const k = (t * 1.2 + i / 4) % 1; BP.arrow(ix, q.x - 20 + i * 12, q.y + 70 - k * 30, q.x - 20 + i * 12, q.y + 36 - k * 30, { w: 2, seed: 550 + i, a: (1 - k) * 0.9 * seg(p, 0.5, 0.8), col: C.cyan }); }   // the air pushing from one side
    L(ix, 'SMALL MOVEMENTS · BIG CHANGE OF DIRECTION', CX, 620, 32, { align: 'center', p: seg(p, 0.8, 1), weight: 400 });
  } };

  PANELS['5.3'] = { draw(ix, p) {
    const bt = M.bt(), t = M.clock(), nodes = [[260, 400, 'SENSE'], [640, 250, 'DECIDE'], [1020, 400, 'STEER']], k = (bt * 0.5) % 3, i0 = Math.floor(k), f = k - i0, a = nodes[i0], b = nodes[(i0 + 1) % 3];
    head(ix, 'THREE JOBS, REPEATED', seg(p, 0, 0.3), 140, 52);
    nodes.forEach(([x, y, s], i) => { BP.circle(ix, x, y, 70, { w: 2.6, p: seg(p, 0.1 + i * 0.12, 0.4 + i * 0.12), seed: 600 + i, a: i === i0 ? 1 : 0.6 }); T(ix, s, x, y + 10, 28, { align: 'center', p: seg(p, 0.3 + i * 0.12, 0.6 + i * 0.12), weight: 600 }); });
    nodes.forEach(([x, y], i) => { const [x2, y2] = nodes[(i + 1) % 3], ang = Math.atan2(y2 - y, x2 - x); BP.arrow(ix, x + Math.cos(ang) * 76, y + Math.sin(ang) * 76, x2 - Math.cos(ang) * 76, y2 - Math.sin(ang) * 76, { w: 2.2, p: seg(p, 0.5, 0.8), seed: 610 + i, col: C.cyan }); });
    if (p > 0.7) BP.dot(ix, a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, 7, C.ink, 1, true);
    L(ix, 'UNTIL THE MISSILE AND ITS TARGET MEET', CX, 600, 32, { align: 'center', p: seg(p, 0.8, 1), weight: 400 });
    ring(ix, 1150, 580 + Math.sin(t) * 3, 18, seg(p, 0.8, 1), 620, C.cyan);
  } };

  // ================= SCENE 6 — INDIA =================
  PANELS['6.1'] = { draw(ix, p) {
    const t = M.clock();
    T(ix, 'ONE PROGRAMME · THREE MISSILES', 90, 150, 48, { p: seg(p, 0, 0.3), hot: 0.5 });
    [['TRISHUL', 'LOW-LEVEL', 'AIR DEFENCE'], ['AKASH', 'MEDIUM-RANGE', 'AIR DEFENCE'], ['NAG', 'THIRD-GENERATION', 'ANTI-TANK']].forEach(([n, a, b], i) => {
      const x = 90 + i * 380, on = seg(p, 0.15 + i * 0.12, 0.4 + i * 0.12);
      BP.rect(ix, x, 260, 340, 250, { w: 2.2, p: on, seed: 700 + i, over: false, a: pulse(t * 1.2 + i, 2, 0.75) });
      T(ix, n, x + 170, 340, 48, { align: 'center', p: seg(p, 0.3 + i * 0.12, 0.5 + i * 0.12), weight: 600 }); L(ix, a, x + 170, 410, 28, { align: 'center', p: seg(p, 0.4 + i * 0.12, 0.6 + i * 0.12), weight: 400 }); L(ix, b, x + 170, 450, 28, { align: 'center', p: seg(p, 0.45 + i * 0.12, 0.65 + i * 0.12), weight: 400 });
    });
    L(ix, 'THREE DIFFERENT JOBS', CX, 580, 32, { align: 'center', p: seg(p, 0.8, 1), weight: 600 }); source(ix, 'SOURCE: PIB', p, 60, 640);
  } };
  PANELS['6.2'] = { draw(ix, p) {
    T(ix, 'CAN', 90, 190, 96, { p: seg(p, 0, 0.3), hot: 0.6 });
    checks(ix, ['DESIGN MISSILE FAMILIES OF ITS OWN', 'BUILD THEM', 'TEST THEM'], p, 320, 90);
    source(ix, 'SOURCE: PIB', p, 60, 640);
  } };
  PANELS['6.3'] = { draw(ix, p) {
    const bt = M.bt(), yr = M.counter(bt, 0.8, 5.0, 2025.62, 2035), x = (y) => 140 + (y - 2025) * 100, t = M.clock();
    T(ix, 'CANNOT YET', 90, 190, 96, { p: seg(p, 0, 0.3), hot: 0.6 }); L(ix, 'FINISH THE SHIELD', 90, 250, 32, { p: seg(p, 0.2, 0.4), weight: 400 });
    BP.line(ix, x(2025), 420, x(2036), 420, { w: 2.6, p: seg(p, 0.2, 0.5), seed: 800 });
    [2025, 2027, 2029, 2031, 2033, 2035].forEach((y, i) => { BP.line(ix, x(y), 412, x(y), 428, { w: 1.6, p: seg(p, 0.3, 0.6), seed: 801 + i }); L(ix, String(y), x(y), 468, 28, { align: 'center', p: seg(p, 0.3, 0.6), weight: 400 }); });
    BP.line(ix, x(2025.62), 420, x(yr), 420, { w: 6, col: C.cyan, p: seg(p, 0.4, 0.7), seed: 810, j: 0, a: 0.8 }); BP.line(ix, x(yr), 396, x(yr), 444, { w: 2.4, col: C.cyan, p: seg(p, 0.4, 0.7), seed: 811, j: 0 });
    BP.circle(ix, x(2035), 420, 16 + 3 * Math.sin(t * 4), { w: 2.4, p: seg(p, 0.5, 0.8), seed: 812, dash: [6, 6] }); L(ix, 'THE AIM', x(2035), 360, 32, { align: 'center', p: seg(p, 0.6, 0.9), weight: 600 });
    L(ix, 'ANNOUNCED 15 AUGUST 2025', x(2025.62), 360, 28, { align: 'left', p: seg(p, 0.5, 0.8), weight: 400 }); source(ix, 'SOURCE: PIB', p, 60, 640);
  } };
  PANELS['6.4'] = { draw(ix, p) {
    const t = M.clock(), cx = 460, cy = 420;
    head(ix, 'MULTI-LEVEL · THREE LAYERS', seg(p, 0, 0.3), 140, 52);
    [190, 125, 60].forEach((r, i) => { BP.circle(ix, cx, cy, r, { w: 2.4, p: seg(p, 0.15 + i * 0.12, 0.45 + i * 0.12), seed: 900 + i, a: pulse(t * 1.4 - i, 2, 0.5), dash: i === 0 ? [10, 8] : null, march: i === 0 ? 12 : 0 }); });
    BP.dot(ix, cx, cy, 8, C.ink, seg(p, 0.5, 0.8), true); for (let i = 0; i < 3; i++) { const k = (t * 0.4 + i / 3) % 1; BP.circle(ix, cx, cy, 20 + k * 180, { w: 1.2, seed: 910 + i, a: (1 - k) * 0.6 * seg(p, 0.6, 0.9), col: C.cyan }); }
    ['OUTER LAYER', 'MIDDLE LAYER', 'INNER LAYER'].forEach((s, i) => L(ix, s, 760, 330 + i * 60, 32, { p: seg(p, 0.45 + i * 0.1, 0.7 + i * 0.1), weight: 600 }));
    BP.stamp(ix, 'AN AIM IS NOT AN ACHIEVEMENT', 760, 580, 28, { p: seg(p, 0.8, 1), seed: 920 }); source(ix, 'SOURCE: PIB', p, 60, 640);
  } };

  // ================= SCENE 7 — THE FIELD =================
  PANELS['7.1'] = { draw(ix, p) {
    const bt = M.bt(), t = M.clock(), a1 = M.at('f27'), a2 = M.at('f28'), a3 = M.at('f29');
    head(ix, 'FINDING A FRIEND IN THE DARK', seg(p, 0, 0.15), 140, 44);
    const A = seg(p, 0.12, 0.38), B = seg(p, 0.4, 0.66), D = seg(p, 0.68, 0.95);
    person(ix, 160, 520, { s: 1.2, arms: bt > a1 && bt < a1 + 1 ? 1 : 0, p: A, seed: 1000, id: 'fa' }); person(ix, 460, 520, { s: 1.2, p: A, seed: 1010, face: -1, id: 'fb' });
    if (bt > a1) for (let i = 0; i < 3; i++) { const k = ((bt - a1) * 0.7 + i / 3) % 1; BP.arc(ix, 190 + k * 250, 450, 40, -0.8, 0.8, { w: 2, seed: 1020 + i, a: 1 - k, col: C.cyan }); }
    L(ix, 'ECHO', 300, 590, 32, { align: 'center', p: seg(p, 0.25, 0.42), weight: 600 }); L(ix, 'RADAR', 300, 628, 28, { align: 'center', p: seg(p, 0.3, 0.45), weight: 400 });
    person(ix, 780, 520, { s: 1.2, p: B, seed: 1030, id: 'fc' });
    const g = bt > a2 ? 1 : 0.2; for (let i = 0; i < 8; i++) { const q = i / 8 * 6.28; BP.line(ix, 780 + Math.cos(q) * 70, 450 + Math.sin(q) * 80, 780 + Math.cos(q) * (96 + 8 * Math.sin(t * 5 + i)), 450 + Math.sin(q) * (106 + 8 * Math.sin(t * 5 + i)), { w: 2, seed: 1040 + i, j: 0, a: g * seg(p, 0.5, 0.7), col: C.orange }); }
    L(ix, 'HEAT', 780, 590, 32, { align: 'center', p: seg(p, 0.52, 0.68), weight: 600 }); L(ix, 'HEAT SEEKER', 780, 628, 28, { align: 'center', p: seg(p, 0.55, 0.7), weight: 400 });
    person(ix, 1080, 520, { s: 1.2, p: D, seed: 1060, id: 'fd' }); BP.rect(ix, 1060, 470, 40, 36, { w: 2.2, p: D, seed: 1070, over: false, col: C.cyan, fill: bt > a3 ? 'rgba(134,220,255,0.4)' : null, a: 0.5 + 0.5 * (bt > a3 ? Math.abs(Math.sin(t * 6)) : 0.4) });
    L(ix, 'LIGHT', 1080, 590, 32, { align: 'center', p: seg(p, 0.78, 0.92), weight: 600 }); L(ix, 'CAMERA', 1080, 628, 28, { align: 'center', p: seg(p, 0.82, 0.96), weight: 400 });
  } };
  PANELS['7.2'] = { draw(ix, p) {
    head(ix, 'TOOLS, NOT RANKS', seg(p, 0, 0.35), 150, 52);
    [['ECHO', 150], ['HEAT', 480], ['LIGHT', 810]].forEach(([s, x], i) => { BP.rect(ix, x, 290, 320, 130, { w: 2.2, p: seg(p, 0.2 + i * 0.12, 0.45 + i * 0.12), seed: 1100 + i, over: false, a: pulse(M.clock() * 1.5 + i * 2, 2, 0.6) }); T(ix, s, x + 160, 368, 44, { align: 'center', p: seg(p, 0.3 + i * 0.12, 0.55 + i * 0.12), weight: 600 }); });
    BP.poly(ix, [[150, 470], [150, 490], [1130, 490], [1130, 470]], { w: 2, p: seg(p, 0.6, 0.9), seed: 1110, j: 0, col: C.cyan });
    L(ix, 'EACH WORKS BEST IN SOME CONDITIONS AND WORST IN OTHERS', CX, 560, 28, { align: 'center', p: seg(p, 0.75, 1), weight: 400 });
  } };

  // ================= SCENE 8 — WHAT IF =================
  const fic = (ix, p) => BP.stamp(ix, 'FICTIONAL SCENARIO', CX, 150, 44, { p: seg(p, 0, 0.35), seed: 95 });
  PANELS['8.1'] = Object.assign({}, FIX, { draw(ix, p) {
    fic(ix, p);
    K.scope(ix, 640, 410, 190, { p: seg(p, 0.1, 0.6), seed: 1200, blips: [{ x: -0.5, y: -0.2, t0: 0 }, { x: 0.3, y: 0.45, t0: 0.5 }, { x: 0.55, y: -0.4, t0: 1.5, ring: true, col: C.red }] });
    BP.leaderTo(ix, 'fs:dot', 1180, 195, 'A DOT WHERE NO DOT SHOULD BE', { p: seg(p, 0.7, 1), seed: 1210, side: 'l' });
  } });
  PANELS['8.2'] = Object.assign({}, FIX, { draw(ix, p) {
    const bt = M.bt(), t = Math.max(0, 3 - bt * 0.8), t2 = M.clock();
    fic(ix, p);
    BP.circle(ix, CX, 400, 130, { w: 3, p: seg(p, 0.1, 0.5), seed: 1300 }); BP.arc(ix, CX, 400, 100, -Math.PI / 2, -Math.PI / 2 + t / 3 * 2 * Math.PI, { w: 8, col: C.red, p: seg(p, 0.3, 0.8), seed: 1301 });
    T(ix, t.toFixed(1), CX, 420, 80, { align: 'center', p: seg(p, 0.4, 0.8), hot: 0.5 });
    card(ix, 160, 330, 260, 130, 'FRIEND', '', seg(p, 0.5, 0.9), 1310, { size: 40, a: pulse(t2 * 2, 2, 0.6) }); card(ix, 860, 330, 260, 130, 'NOT', '', seg(p, 0.55, 0.95), 1311, { size: 40, col: C.red, a: pulse(t2 * 2 + 3, 2, 0.6) });
    L(ix, 'WITHIN SECONDS THE SYSTEM MUST DECIDE', CX, 620, 32, { align: 'center', p: seg(p, 0.8, 1), weight: 400 });
  } });
  PANELS['8.3'] = Object.assign({}, FIX, { draw(ix, p) {
    const t = M.clock(), n = 7, k = (t * 0.9) % n;
    fic(ix, p);
    for (let i = 0; i < n; i++) { const x = 130 + i * 170, weak = i === 4; BP.rect(ix, x, 360, 110, 70, { w: 2.4, p: seg(p, 0.1 + i * 0.07, 0.4 + i * 0.07), seed: 1400 + i, over: false, col: weak ? C.red : undefined, a: Math.floor(k) === i ? 1 : 0.55, fill: Math.floor(k) === i ? 'rgba(238,246,255,0.22)' : null }); if (i < n - 1) BP.line(ix, x + 110, 395, x + 170, 395, { w: 2.4, p: seg(p, 0.3 + i * 0.07, 0.6 + i * 0.07), seed: 1420 + i, j: 0, col: C.cyan }); }
    BP.dot(ix, 130 + (k / (n - 1)) * 6 * 170 + 55, 395, 6, C.ink, seg(p, 0.7, 1), true);
    L(ix, 'EVERY LINK MUST ANSWER IN TIME', CX, 560, 36, { align: 'center', p: seg(p, 0.7, 1), weight: 600 });
  } });

  // ================= SCENE 9 — THE HABIT =================
  PANELS['9.1'] = { draw(ix, p) {
    const bt = M.bt(), g = M.tw(bt, [[0.6, 0], [3.4, 1]], M.ease.io);
    head(ix, 'HINDSIGHT BIAS', seg(p, 0, 0.3), 150, 56);
    BP.line(ix, 160, 520, 160 + 960 * g, 330, { w: 3, p: seg(p, 0.3, 0.7), seed: 1500, col: C.cyan, j: 0 });
    L(ix, 'LOOKING BACK, IT LOOKS OBVIOUS', CX, 600, 32, { align: 'center', p: seg(p, 0.6, 0.9), weight: 400 }); T(ix, 'I KNEW IT ALL ALONG', 160, 270, 40, { p: seg(p, 0.7, 1), weight: 600 });
  } };
  PANELS['9.2'] = { draw(ix, p) {
    const bt = M.bt(), path = M.path([[160, 520], [300, 440], [380, 520], [520, 420], [600, 330], [740, 400], [880, 300], [1060, 350], [1140, 280]], 2), u = M.tw(bt, [[0.4, 0], [6.0, 1]], M.ease.lin), q = path(u);
    head(ix, 'AT THE TIME, THE ROAD WAS UNCERTAIN', seg(p, 0, 0.3), 140, 40);
    K.dashPath(ix, path, seg(p, 0.2, 0.7), 1600);
    [[300, 440], [520, 420], [740, 400], [1060, 350]].forEach(([x, y], i) => T(ix, '?', x, y - 30, 40, { align: 'center', p: seg(p, 0.5 + i * 0.08, 0.8 + i * 0.08), weight: 600, col: C.cyan }));
    BP.dot(ix, q.x, q.y, 9, C.ink, seg(p, 0.3, 0.6), true);
    L(ix, '1983', 160, 570, 32, { align: 'center', p: seg(p, 0.4, 0.7), weight: 600 }); L(ix, '2035?', 1140, 240, 32, { align: 'center', p: seg(p, 0.6, 0.9), weight: 600 });
    L(ix, 'REMEMBER HOW UNCERTAIN THE FIRST ROAD WAS', CX, 630, 28, { align: 'center', p: seg(p, 0.85, 1), weight: 400 });
  } };

  // ================= SCENE 10 — THE CLOSE =================
  PANELS['10.1'] = { draw(ix, p) {
    head(ix, 'THREE THINGS TO REMEMBER', seg(p, 0, 0.2), 150, 52);
    [['1', 'BEGUN IN 1983, UNDER DENIAL, NOW THE BASE', 290], ['2', 'A MISSILE DOES THREE JOBS', 400], ['3', 'A SHIELD IS A CHAIN: THE WEAKEST LINK', 510]].forEach(([n, s, y], i) => {
      BP.circle(ix, 120, y - 10, 28, { w: 2.4, p: seg(p, 0.2 + i * 0.25, 0.32 + i * 0.25), seed: 1700 + i });
      T(ix, n, 120, y + 4, 36, { align: 'center', p: seg(p, 0.24 + i * 0.25, 0.36 + i * 0.25), weight: 600 }); T(ix, s, 180, y + 6, 32, { p: seg(p, 0.26 + i * 0.25, 0.46 + i * 0.25), weight: 400 });
    });
  } };
  PANELS['10.2'] = Object.assign({}, FIX, { draw(ix, p) {
    const t = M.clock(), n = 6;
    head(ix, 'WHICH LINK WILL BE FINISHED LAST?', seg(p, 0.1, 0.7), 160, 44);
    for (let i = 0; i < n; i++) { const x = 160 + i * 180, last = i === n - 1; BP.rect(ix, x, 330, 120, 80, { w: 2.4, p: seg(p, 0.1 + i * 0.07, 0.4 + i * 0.07), seed: 1800 + i, over: false, dash: last ? [8, 8] : null, march: last ? 12 : 0, a: last ? pulse(t * 2, 2, 0.4) : 1 }); if (i < n - 1) BP.line(ix, x + 120, 370, x + 180, 370, { w: 2.4, p: seg(p, 0.3, 0.6), seed: 1820 + i, j: 0, col: C.cyan }); }
    T(ix, '?', 160 + (n - 1) * 180 + 60, 392, 64, { align: 'center', p: seg(p, 0.6, 0.9), hot: 0.6, a: pulse(t, 3, 0.4) });
  } });
  PANELS['10.3'] = { draw(ix, p) {
    T(ix, 'SENSE · DECIDE · STEER', CX, 330, 72, { align: 'center', p: seg(p, 0, 0.5), hot: 0.6 });
    BP.line(ix, 240, 380, 1040, 380, { w: 2.4, p: seg(p, 0.3, 0.7), seed: 1900 });
    T(ix, 'EPISODE 04 · THE MACHINES THAT PROTECT INDIA', CX, 440, 28, { align: 'center', p: seg(p, 0.5, 1), weight: 400 });
  } };
  // anchor used by the scope leader in 8.1: the unknown dot's position on screen
  const oldScope = K.scope;
  K.scope = (ix, cx, cy, r, o = {}) => { oldScope(ix, cx, cy, r, o); (o.blips || []).forEach((b) => { if (b.ring) BP.pt('fs:dot', cx + b.x * r, cy + b.y * r); }); };
})();
