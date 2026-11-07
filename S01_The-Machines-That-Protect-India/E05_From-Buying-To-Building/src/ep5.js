// Episode 5 panels, "From Buying to Building". Public facts only (PIB, Defence Minister's remarks); every illustrated object is conceptual.
// Rules: headlines >= 44 px, labels >= 28 px, leaders attach to anchors, nothing sits still (idle motion + an action per beat).
(function () {
  const BP = window.BP, C = BP.C, seg = BP.seg, T = BP.text, L = BP.label, M = BP.M, K = BP.K, V = BP.V, clamp = H.clamp;
  const PANELS = (window.PANELS = {});
  const { head, tick, FIX, fmt, source, bar, card, strike, gear, sea } = K;
  const CX = 640, MAXP = 178000;                                         // FY 2025-26 production, crore rupees: the common scale for the bars
  const pulse = (t, k = 3, lo = 0.55) => lo + (1 - lo) * (0.5 + 0.5 * Math.sin(t * k));
  const checks = (ix, items, p, y0, dy, size = 36) => items.forEach((s, i) => { tick(ix, 90, y0 + i * dy, seg(p, 0.2 + i * 0.15, 0.32 + i * 0.15), 970 + i, C.cyan); T(ix, s, 150, y0 + i * dy + 10, size, { p: seg(p, 0.22 + i * 0.15, 0.4 + i * 0.15), weight: 400 }); });
  const chimney = (ix, x, y, h, p, seed, t) => { BP.rect(ix, x, y - h, 26, h, { w: 2, p, seed, over: false }); M.particles(ix, { t, t0: 0, rate: 5, life: 2, from: () => [x + 13, y - h], vx: 8, vy: -26, spread: 10, size: 3, grow: 2.5, a: 0.35 * p, seed: seed % 17 + 1 }); };

  // ================= SCENE 1 — THE QUESTION =================
  PANELS['1.1'] = { cam: (p) => ({ x: 640, y: 360, z: 1 + 0.03 * p }), draw(ix, p) {
    const t = M.clock(), sw = Math.sin(t * 2.2) * 0.25;
    head(ix, 'DOES INDIA JUST BUY ITS WEAPONS?', seg(p, 0, 0.4), 150, 48);
    BP.rect(ix, 160, 300, 260, 200, { w: 2.4, p: seg(p, 0.15, 0.55), seed: 1, over: false, fill: 'rgba(238,246,255,0.08)' });                              // an imported crate
    BP.line(ix, 160, 360, 420, 360, { w: 1.4, p: seg(p, 0.3, 0.6), seed: 2, col: C.cyan }); BP.line(ix, 290, 300, 290, 500, { w: 1.4, p: seg(p, 0.3, 0.6), seed: 3, col: C.cyan });
    BP.line(ix, 290, 300, 290 + Math.sin(sw) * 70, 300 - Math.cos(sw) * 70, { w: 1.6, p: seg(p, 0.4, 0.6), seed: 4, j: 0 });                                    // price tag on a swinging string
    BP.rect(ix, 290 + Math.sin(sw) * 70 - 50, 300 - Math.cos(sw) * 70 - 36, 100, 36, { w: 1.8, p: seg(p, 0.45, 0.65), seed: 5, over: false });
    T(ix, 'BUY', 290 + Math.sin(sw) * 70, 300 - Math.cos(sw) * 70 - 9, 28, { align: 'center', p: seg(p, 0.5, 0.7), weight: 600 });
    L(ix, 'SOME OF IT DOES', 290, 560, 32, { align: 'center', p: seg(p, 0.5, 0.75), weight: 400 });
    BP.line(ix, 700, 500, 1180, 500, { w: 2.4, p: seg(p, 0.5, 0.8), seed: 6 });                                                                                     // a factory skyline rises
    [[720, 90], [820, 130], [980, 100]].forEach(([x, h], i) => chimney(ix, x, 500, h + 60 * M.ease.out(clamp(M.bt() / 3)), seg(p, 0.55 + i * 0.1, 0.85), 10 + i, t));
    BP.rect(ix, 760, 400, 260, 100, { w: 2.2, p: seg(p, 0.6, 0.9), seed: 20, over: false });
    [790, 850, 910, 960].forEach((x, i) => BP.rect(ix, x, 430, 36, 30, { w: 1.2, p: seg(p, 0.7, 0.95), seed: 21 + i, over: false, col: C.cyan, a: pulse(t, 2 + i * 0.3, 0.3) }));
    L(ix, 'BUT LOOK AT WHAT IS BEING MADE', 940, 560, 28, { align: 'center', p: seg(p, 0.8, 1), weight: 400 });
  } };

  PANELS['1.2'] = { draw(ix, p) {
    const t = M.clock(), bt = M.bt();
    head(ix, 'SO FAR IN THIS SERIES', seg(p, 0, 0.3), 140, 48);
    const tiles = [['1', 'AIR DEFENCE'], ['2', 'ENGINE'], ['3', 'CARRIER'], ['4', 'SHIELD'], ['5', 'WORKSHOPS']];
    tiles.forEach(([n, s], i) => {
      const x = 70 + i * 232, lit = bt > 0.4 + i * 0.5 ? 1 : 0.3;
      BP.rect(ix, x, 270, 210, 230, { w: 2.2, p: seg(p, 0.2 + i * 0.1, 0.5 + i * 0.1), seed: 40 + i, over: false, a: lit, col: i === 4 ? C.cyan : undefined });
      T(ix, 'EP ' + n, x + 105, 322, 32, { align: 'center', p: seg(p, 0.4, 0.7), weight: 600, a: lit });
      L(ix, s, x + 105, 470, 28, { align: 'center', p: seg(p, 0.5, 0.8), weight: 400, a: lit });
      const cx = x + 105, cy = 390;
      if (i === 0) { BP.arc(ix, cx, cy + 20, 40, Math.PI, 2 * Math.PI, { w: 2, seed: 50, a: lit }); BP.line(ix, cx, cy + 20, cx + Math.cos(Math.PI + (t * 1.6) % Math.PI) * 40, cy + 20 + Math.sin(Math.PI + (t * 1.6) % Math.PI) * 40, { w: 2, seed: 51, j: 0, a: lit, col: C.cyan }); }
      if (i === 1) gear(ix, cx, cy, 30, t * 5, 52, lit);
      if (i === 2) V.carrier(ix, cx, cy + 6, 0.62, { id: 'rc', seed: 53, a: lit, wake: false });
      if (i === 3) { BP.arc(ix, cx - 24, cy + 20, 30, Math.PI, 2 * Math.PI, { w: 1.8, seed: 54, a: lit }); BP.dot(ix, cx + 20 + Math.sin(t * 2) * 12, cy - 14 + Math.cos(t * 2) * 8, 5, C.ink, lit); }
      if (i === 4) { for (let k = 0; k < 6; k++) BP.dot(ix, cx - 30 + (k % 3) * 30, cy - 12 + Math.floor(k / 3) * 34, 6, C.cyan, pulse(t, 3, 0.2) * (bt > 2.8 ? 1 : 0.3)); }
    });
    L(ix, 'WHO MAKES THE THING?', CX, 590, 36, { align: 'center', p: seg(p, 0.8, 1), weight: 600 });
  } };

  PANELS['1.3'] = { draw(ix, p) {
    const t = M.clock(), n = 26, bt = M.bt();
    head(ix, 'THOUSANDS OF PARTS · THOUSANDS OF WORKSHOPS', seg(p, 0, 0.3), 140, 40);
    const nodes = Array.from({ length: n }, (_, i) => { const a = i / n * 6.2832 + M.hash(i, 2) * 0.4, r = 150 + M.hash(i, 5) * 150; return [CX + Math.cos(a) * r * 1.5, 400 + Math.sin(a) * r * 0.9]; });
    nodes.forEach(([x, y], i) => {
      const on = clamp((bt - 0.5 - i * 0.12) / 0.3);
      if (on <= 0) return;
      BP.line(ix, x, y, CX, 400, { w: 1, seed: 100 + i, j: 0, a: 0.45 * on, col: C.cyan });
      BP.rect(ix, x - 9, y - 9, 18, 18, { w: 1.6, seed: 130 + i, over: false, a: on });
      const k = (t * 0.5 + M.hash(i, 9)) % 1; BP.dot(ix, x + (CX - x) * k, y + (400 - y) * k, 3, C.ink, 0.9 * on);                                                // parts travel to the factory
    });
    BP.rect(ix, CX - 70, 370, 140, 60, { w: 2.6, p: seg(p, 0.15, 0.5), seed: 99, over: false, fill: 'rgba(238,246,255,0.12)' });
    L(ix, 'FACTORY', CX, 407, 28, { align: 'center', p: seg(p, 0.4, 0.6), weight: 600 });
  } };

  PANELS['1.4'] = { draw(ix, p) {
    const bt = M.bt(), k = M.tw(bt, [[0.6, 0], [3.4, 1]], M.ease.io);
    head(ix, 'FROM BUYING TO BUILDING', seg(p, 0, 0.3), 160, 56);
    BP.line(ix, 200, 400, 1080, 400, { w: 3, p: seg(p, 0.2, 0.6), seed: 150 });
    T(ix, 'BUYING', 200, 350, 36, { align: 'left', p: seg(p, 0.3, 0.6), weight: 600 }); T(ix, 'BUILDING', 1080, 350, 36, { align: 'right', p: seg(p, 0.3, 0.6), weight: 600 });
    [0, 0.25, 0.5, 0.75, 1].forEach((u, i) => BP.line(ix, 200 + 880 * u, 390, 200 + 880 * u, 410, { w: 1.6, p: seg(p, 0.4, 0.7), seed: 151 + i, j: 0 }));
    BP.circle(ix, 200 + 880 * k, 400, 16, { w: 3, p: seg(p, 0.5, 0.8), seed: 160, col: C.cyan });
    BP.poly(ix, [[200, 400], [200 + 880 * k, 400]], { w: 6, col: C.cyan, p: seg(p, 0.5, 0.8), seed: 161, j: 0, a: 0.7 });
    L(ix, 'A JOURNEY, NOT A SWITCH', CX, 520, 32, { align: 'center', p: seg(p, 0.8, 1), weight: 400 });
  } };

  // ================= SCENE 2 — WHY IT MATTERS =================
  PANELS['2.1'] = { draw(ix, p) {
    const bt = M.bt(), n = Math.round(M.counter(bt, 0.5, 2.8, 0, 46429));
    head(ix, 'INDIA\'S DEFENCE PRODUCTION', seg(p, 0, 0.3), 150, 48);
    L(ix, '2014-15', 100, 330, 32, { p: seg(p, 0.2, 0.4), weight: 600 });
    bar(ix, 100, 350, 1080, 70, 46429 / MAXP * M.tw(bt, [[0.5, 0], [2.8, 1]], M.ease.out), p, 200);
    T(ix, `${fmt(n)} CRORE RUPEES`, 120, 475, 44, { p: seg(p, 0.5, 0.8), hot: 0.4 });
    L(ix, 'SOURCE: PIB', 60, 640, 28, { p: seg(p, 0.85, 1), weight: 400 });
  } };

  PANELS['2.2'] = { draw(ix, p) {
    const bt = M.bt(), g = M.tw(bt, [[0.5, 0], [3.0, 1]], M.ease.out), n = Math.round(M.counter(bt, 0.5, 3.0, 46429, 178000));
    head(ix, 'INDIA\'S DEFENCE PRODUCTION', seg(p, 0, 0.3), 150, 48);
    L(ix, '2014-15', 100, 270, 32, { p: seg(p, 0.1, 0.3), weight: 400 });
    bar(ix, 100, 285, 1080, 56, 46429 / MAXP, p, 210, { fill: 'rgba(238,246,255,0.14)' });
    L(ix, 'FY 2025-26', 100, 400, 32, { p: seg(p, 0.2, 0.4), weight: 600 });
    bar(ix, 100, 415, 1080, 70, 46429 / MAXP + (1 - 46429 / MAXP) * g, p, 220);
    T(ix, `${(n / 100000).toFixed(2)} LAKH CRORE`, 120, 545, 44, { p: seg(p, 0.5, 0.8), hot: 0.4 });
    L(ix, 'A RECORD · SOURCE: PIB, JUNE 2026', 60, 640, 28, { p: seg(p, 0.85, 1), weight: 400 });
  } };

  PANELS['2.3'] = { draw(ix, p) {
    const bt = M.bt(), t = M.clock();
    head(ix, 'WHAT IS A LAKH CRORE?', seg(p, 0, 0.3), 150, 52);
    [['1 LAKH', '= 100,000', 240], ['1 CRORE', '= 10 MILLION', 330], ['1 LAKH CRORE', '= 1 TRILLION RUPEES', 420]].forEach(([a, b, y], i) => {
      T(ix, a, 120, y, 40, { p: seg(p, 0.15 + i * 0.2, 0.35 + i * 0.2), weight: 600 }); T(ix, b, 520, y, 40, { p: seg(p, 0.25 + i * 0.2, 0.45 + i * 0.2), weight: 400 });
      if (bt > 0.8 + i * 0.7) BP.rect(ix, 90, y - 44, 1100, 66, { w: 1.2, seed: 250 + i, over: false, col: C.cyan, a: 0.5, dash: [8, 8], march: 12 });
    });
    T(ix, '1.78 LAKH CRORE = 1.78 TRILLION RUPEES', CX, 560, 40, { align: 'center', p: seg(p, 0.7, 1), hot: 0.5 });
    for (let i = 0; i < 12; i++) BP.dot(ix, 120 + ((t * 40 + i * 90) % 1040), 500 + Math.sin(t * 2 + i) * 5, 3, C.cyan, 0.6 * seg(p, 0.7, 1));
  } };

  // ================= SCENE 3 — IDEA 1 · MANY MAKERS =================
  PANELS['3.1'] = { draw(ix, p) {
    const t = M.clock(), bt = M.bt();
    T(ix, 'IDEA 1 · MANY SMALL MAKERS', 90, 150, 52, { p: seg(p, 0, 0.3), hot: 0.5 });
    L(ix, 'WHY: TO SEE WHERE THE MONEY GOES', 90, 205, 32, { p: seg(p, 0.2, 0.5), weight: 400 });
    BP.rect(ix, 520, 300, 240, 160, { w: 2.6, p: seg(p, 0.3, 0.7), seed: 300, over: false, fill: 'rgba(238,246,255,0.12)' });                              // one machine, built from many pieces flying in
    for (let i = 0; i < 16; i++) {
      const a = M.hash(i, 3) * 6.28, r = 420, x0 = CX + Math.cos(a) * r, y0 = 380 + Math.sin(a) * r * 0.6, c = (bt * 0.35 + M.hash(i, 8)) % 1, u = M.ease.io(clamp(c * 1.4));
      const tx = 540 + (i % 4) * 56, ty = 320 + Math.floor(i / 4) * 36;
      BP.rect(ix, x0 + (tx - x0) * u - 12, y0 + (ty - y0) * u - 10, 24, 20, { w: 1.6, seed: 310 + i, over: false, a: 0.9 * seg(p, 0.4, 0.7), col: i % 3 ? undefined : C.cyan });
    }
    L(ix, 'ONE MACHINE', CX, 520, 32, { align: 'center', p: seg(p, 0.7, 0.95), weight: 600 });
    L(ix, 'MANY MAKERS', CX, 560, 28, { align: 'center', p: seg(p, 0.75, 1), weight: 400 });
  } };

  // exploded car: parts drift apart and come back together (a civilian example of a thing made in many shops)
  PANELS['3.2'] = { draw(ix, p) {
    const bt = M.bt(), ex = M.tw(bt, [[0.3, 0], [2.4, 1, M.ease.out], [4.6, 1], [6.2, 0.15, M.ease.io]]), cx = 640, cy = 420;
    head(ix, 'A CAR: MANY SHOPS, ONE FACTORY', seg(p, 0, 0.3), 140, 44);
    const part = ([bx, by], [dx, dy], f) => f(cx + bx + dx * ex, cy + by + dy * ex);
    part([0, 0], [0, 0], (x, y) => BP.poly(ix, [[x - 190, y + 10], [x - 190, y - 30], [x - 120, y - 40], [x - 70, y - 90], [x + 70, y - 90], [x + 130, y - 40], [x + 190, y - 30], [x + 190, y + 10]], { close: true, w: 2.4, p: seg(p, 0.1, 0.5), seed: 330, fill: 'rgba(238,246,255,0.10)' }));   // body
    [-1, 1].forEach((m, i) => part([118 * m, 8], [60 * m, 120], (x, y) => { BP.circle(ix, x, y, 36, { w: 2.2, p: seg(p, 0.3, 0.6), seed: 340 + i }); if (p > 0.6) gear(ix, x, y, 28, M.clock() * 4, 345 + i * 5); L(ix, 'WHEELS', x, y + 66, 28, { align: 'center', p: seg(p, 0.7, 0.9) * (ex > 0.6 ? 1 : 0), weight: 400 }); }));
    part([140, -14], [150, -120], (x, y) => { BP.rect(ix, x - 60, y - 30, 120, 60, { w: 2.2, p: seg(p, 0.35, 0.65), seed: 360, over: false }); gear(ix, x, y, 22, -M.clock() * 5, 361); L(ix, 'ENGINE', x, y - 50, 28, { align: 'center', p: seg(p, 0.7, 0.9) * (ex > 0.6 ? 1 : 0), weight: 400 }); });
    part([10, -62], [30, -150], (x, y) => { BP.poly(ix, [[x - 40, y + 20], [x - 20, y - 20], [x + 40, y - 20], [x + 40, y + 20]], { close: true, w: 2, p: seg(p, 0.4, 0.7), seed: 370, col: C.cyan }); L(ix, 'GLASS', x + 20, y - 40, 28, { align: 'center', p: seg(p, 0.7, 0.9) * (ex > 0.6 ? 1 : 0), weight: 400 }); });
    part([-70, -42], [-170, -100], (x, y) => { BP.rect(ix, x - 30, y - 24, 60, 48, { w: 2, p: seg(p, 0.45, 0.75), seed: 380, over: false }); L(ix, 'SEATS', x, y - 44, 28, { align: 'center', p: seg(p, 0.7, 0.9) * (ex > 0.6 ? 1 : 0), weight: 400 }); });
    L(ix, 'EXPLODED VIEW · A CIVILIAN EXAMPLE', 60, 640, 28, { p: seg(p, 0.85, 1), weight: 400 });
  } };

  PANELS['3.3'] = { draw(ix, p) {
    const t = M.clock(), bt = M.bt(), n = Math.round(M.counter(bt, 0.4, 2.4, 0, 16000));
    head(ix, 'ABOUT 16,000 SMALL AND MEDIUM BUSINESSES', seg(p, 0, 0.3), 140, 40);
    for (let i = 0; i < 32; i++) { const x = 180 + (i % 8) * 120, y = 250 + Math.floor(i / 8) * 80; if (seg(p, 0.2, 0.7) * 32 > i) { BP.rect(ix, x - 18, y - 18, 36, 36, { w: 1.6, seed: 400 + i, over: false, a: pulse(t * 1.3 + i * 0.5, 2, 0.45) }); BP.dot(ix, x, y, 4, C.cyan, 0.9); } }
    T(ix, fmt(n), CX, 570, 56, { align: 'center', p: seg(p, 0.5, 0.8), hot: 0.5 });
    L(ix, 'EACH SQUARE = 500 BUSINESSES', CX, 612, 28, { align: 'center', p: seg(p, 0.8, 1), weight: 400 });
    source(ix, 'SOURCE: PIB', p, 60, 640);
  } };

  PANELS['3.4'] = { draw(ix, p) {
    const t = M.clock(), bt = M.bt();
    head(ix, 'A WEB, NOT A TOWER', seg(p, 0, 0.3), 140, 48);
    const ring = (n, r, off) => Array.from({ length: n }, (_, i) => [CX + Math.cos(i / n * 6.2832 + off) * r * 1.5, 400 + Math.sin(i / n * 6.2832 + off) * r * 0.85]);
    const inner = ring(6, 120, 0.3), outer = ring(14, 210, 0.1);
    inner.forEach(([x, y]) => BP.line(ix, x, y, CX, 400, { w: 1.6, p: seg(p, 0.3, 0.6), seed: 500, j: 0, col: C.cyan }));
    outer.forEach(([x, y], i) => { const q = inner[Math.round(i / 14 * 6) % 6]; BP.line(ix, x, y, q[0], q[1], { w: 1, p: seg(p, 0.5, 0.8), seed: 510 + i, j: 0, a: 0.5, col: C.cyan }); const k = (t * 0.45 + M.hash(i, 4)) % 1; if (p > 0.8) BP.dot(ix, x + (q[0] - x) * k, y + (q[1] - y) * k, 3, C.ink, 0.9); });
    inner.forEach(([x, y], i) => BP.circle(ix, x, y, 14, { w: 2, p: seg(p, 0.4, 0.7), seed: 530 + i })); outer.forEach(([x, y], i) => BP.circle(ix, x, y, 8, { w: 1.6, p: seg(p, 0.6, 0.9), seed: 550 + i }));
    BP.rect(ix, CX - 60, 370, 120, 60, { w: 2.6, p: seg(p, 0.15, 0.5), seed: 570, over: false, fill: 'rgba(238,246,255,0.14)' });
    L(ix, 'BIG FACTORY', CX, 407, 28, { align: 'center', p: seg(p, 0.4, 0.6), weight: 600 });
    L(ix, 'EACH MAKER DOES ONE THING WELL', CX, 612, 28, { align: 'center', p: seg(p, 0.85, 1), weight: 400 });
  } };

  // ================= SCENE 4 — IDEA 2 · THE PASS =================
  PANELS['4.1'] = { draw(ix, p) {
    const bt = M.bt(), heights = [150, 160, 148, 155, 70, 152, 158];
    T(ix, 'IDEA 2 · NOTHING SHIPS UNTIL IT PASSES', 90, 150, 44, { p: seg(p, 0, 0.3), hot: 0.5 });
    L(ix, 'WHY: A THOUSAND PARTS ARE ONLY AS GOOD AS THE WORST ONE', 90, 205, 28, { p: seg(p, 0.2, 0.5), weight: 400 });
    heights.forEach((h, i) => { const f = M.tw(bt, [[0.4 + i * 0.25, 0], [1.0 + i * 0.25, 1]], M.ease.out), weak = i === 4; BP.rect(ix, 170 + i * 140, 560 - h * f * 1.6, 90, h * f * 1.6, { w: 2.2, p: seg(p, 0.2 + i * 0.05, 0.6 + i * 0.05), seed: 600 + i, over: false, col: weak ? C.red : undefined, fill: weak ? 'rgba(255,91,74,0.18)' : 'rgba(238,246,255,0.1)' }); });
    BP.line(ix, 140, 560, 1180, 560, { w: 2, p: seg(p, 0.1, 0.5), seed: 610 });
    BP.line(ix, 140, 560 - 70 * 1.6, 1180, 560 - 70 * 1.6, { w: 1.4, p: seg(p, 0.6, 0.9), seed: 611, col: C.red, dash: [10, 8], march: 12, j: 0 });
    L(ix, 'THE WEAKEST PART SETS THE LIMIT', 1180, 610, 32, { align: 'right', p: seg(p, 0.8, 1), weight: 600, col: C.red });
  } };

  PANELS['4.2'] = { draw(ix, p) {
    const bt = M.bt();
    head(ix, 'TRIED IS NOT PASSED', seg(p, 0, 0.3), 140, 52);
    BP.rect(ix, 300, 210, 360, 400, { w: 2.4, p: seg(p, 0.1, 0.5), seed: 650, over: false, fill: 'rgba(238,246,255,0.08)' });
    [0, 1, 2, 3, 4].forEach((i) => { BP.line(ix, 340, 290 + i * 62, 620, 290 + i * 62, { w: 1.2, p: seg(p, 0.3, 0.6), seed: 651 + i, col: C.cyan }); if (bt > 0.8 + i * 0.5) K.tick(ix, 330, 280 + i * 62, 1, 660 + i, C.cyan); });
    const stamp = M.tw(bt, [[3.4, 0], [3.7, 1, M.ease.back]]);
    ix.save(); ix.translate(820 + (1 - stamp) * 0, 420); ix.rotate(-0.18); if (stamp > 0) BP.stamp(ix, 'PASS', 0, 0, 96 * (0.8 + 0.2 * stamp), { p: stamp, seed: 670, col: C.cyan }); ix.restore();
    L(ix, 'YOU MOVE UP BECAUSE YOU PASSED', CX, 622, 32, { align: 'center', p: seg(p, 0.8, 1), weight: 400 });
  } };

  PANELS['4.3'] = { draw(ix, p) {
    const bt = M.bt(), t = M.clock(), tok = M.tw(bt, [[0.6, 0], [4.8, 2, M.ease.lin]]), st = [200, 640, 1080];
    head(ix, 'TESTED AGAIN AND AGAIN', seg(p, 0, 0.3), 140, 52);
    [['PART TEST', 'EVERY WORKSHOP'], ['WHOLE MACHINE', 'AS A SYSTEM'], ['PROOF', 'FROM EPISODE 2']].forEach(([a, b], i) => card(ix, st[i] - 150, 300, 300, 150, a, b, seg(p, 0.15 + i * 0.15, 0.6 + i * 0.15), 700 + i, { size: 32 }));
    BP.line(ix, st[0] + 150, 375, st[1] - 150, 375, { w: 2, p: seg(p, 0.5, 0.7), seed: 710, dash: [10, 8], march: 12 }); BP.line(ix, st[1] + 150, 375, st[2] - 150, 375, { w: 2, p: seg(p, 0.6, 0.8), seed: 711, dash: [10, 8], march: 12 });
    const x = st[0] + (st[2] - st[0]) * tok / 2; BP.circle(ix, x, 375, 12, { w: 3, p: seg(p, 0.5, 0.8), seed: 720, col: C.cyan });
    BP.circle(ix, st[0] + 60, 540, 46, { w: 2.2, p: seg(p, 0.6, 0.9), seed: 730 });                                                               // a gauge on the first bench
    BP.line(ix, st[0] + 60, 540, st[0] + 60 + Math.cos(-2.2 + Math.sin(t * 1.6) * 0.5) * 38, 540 + Math.sin(-2.2 + Math.sin(t * 1.6) * 0.5) * 38, { w: 3, p: seg(p, 0.7, 0.9), seed: 731, j: 0 });
    L(ix, 'MEASURE EVERY PART', st[0] + 140, 548, 28, { p: seg(p, 0.8, 1), weight: 400 });
  } };

  // ================= SCENE 5 — IDEA 3 · SCALE =================
  PANELS['5.1'] = { draw(ix, p) {
    const bt = M.bt(), t = M.clock();
    T(ix, 'IDEA 3 · ONE IS NOT A THOUSAND', 90, 150, 48, { p: seg(p, 0, 0.3), hot: 0.5 });
    L(ix, 'WHY: A DEFENCE FORCE NEEDS THOUSANDS, ON TIME', 90, 205, 32, { p: seg(p, 0.2, 0.5), weight: 400 });
    BP.rect(ix, 150, 300, 60, 50, { w: 2.2, p: seg(p, 0.3, 0.6), seed: 800, over: false });
    L(ix, 'ONE', 180, 390, 32, { align: 'center', p: seg(p, 0.5, 0.7), weight: 600 });
    const n = Math.round(M.counter(bt, 1.0, 5.0, 1, 200));
    for (let i = 0; i < 200; i++) if (i < n) BP.rect(ix, 380 + (i % 25) * 33, 290 + Math.floor(i / 25) * 36, 24, 22, { w: 1.1, seed: 810 + i, over: false, a: 0.85 * seg(p, 0.5, 0.8) });
    L(ix, 'A THOUSAND', 800, 620, 32, { align: 'center', p: seg(p, 0.7, 0.9), weight: 600 });
    for (let k = 0; k < 6; k++) BP.dot(ix, 380 + ((t * 100 + k * 150) % 820), 600, 3, C.cyan, 0.7 * seg(p, 0.7, 1));
  } };

  PANELS['5.2'] = { draw(ix, p) {
    const t = M.clock(), bt = M.bt(), made = Math.floor(bt * 3);
    head(ix, 'A BAKERY, NOT A KITCHEN', seg(p, 0, 0.3), 140, 52);
    BP.rect(ix, 90, 230, 240, 170, { w: 2.4, p: seg(p, 0.1, 0.5), seed: 900, over: false, fill: 'rgba(255,155,61,0.10)' });
    L(ix, 'OVEN', 210, 330, 32, { align: 'center', p: seg(p, 0.4, 0.6), weight: 600 });
    BP.line(ix, 90, 480, 1190, 480, { w: 2.4, p: seg(p, 0.2, 0.6), seed: 901 });
    for (let i = 0; i < 14; i++) { const x = 330 + ((i * 80 + t * 90) % 880), y = 450; BP.poly(ix, [[x - 22, y], [x - 18, y - 26], [x + 18, y - 26], [x + 22, y]], { close: true, w: 1.8, seed: 910 + i, j: 0, a: 0.9 * seg(p, 0.4, 0.8) }); BP.line(ix, x - 12, y - 28, x + 12, y - 28, { w: 1.4, seed: 930 + i, j: 0, a: 0.7 * seg(p, 0.4, 0.8), col: C.orange }); }
    for (let i = 0; i < 18; i++) BP.line(ix, 110 + i * 62 - ((t * 90) % 62), 500, 110 + i * 62 + 30 - ((t * 90) % 62), 500, { w: 1.4, seed: 950, j: 0, a: 0.6 * seg(p, 0.4, 0.8), col: C.cyan });
    M.particles(ix, { t, t0: 0, rate: 8, life: 1.5, from: () => [210, 235], vx: 0, vy: -30, spread: 24, size: 3, grow: 2, a: 0.3 * seg(p, 0.4, 0.8), seed: 3 });
    T(ix, `${fmt(made * 12)}`, 1000, 300, 64, { align: 'center', p: seg(p, 0.5, 0.8), hot: 0.4 }); L(ix, 'CAKES TODAY', 1000, 345, 28, { align: 'center', p: seg(p, 0.6, 0.9), weight: 400 });
    L(ix, 'OVENS · SHIFTS · A STEADY SUPPLY OF FLOUR', CX, 600, 32, { align: 'center', p: seg(p, 0.8, 1), weight: 400 });
  } };

  PANELS['5.3'] = { draw(ix, p) {
    const bt = M.bt(), n = Math.round(M.counter(bt, 0.4, 2.6, 0, 193)), amt = Math.round(M.counter(bt, 0.6, 3.0, 0, 209050));
    head(ix, 'A RECORD YEAR OF CONTRACTS · 2024-25', seg(p, 0, 0.3), 140, 44);
    for (let i = 0; i < 193; i++) { const x = 100 + (i % 31) * 35, y = 230 + Math.floor(i / 31) * 40, dom = i < 177; if (i < n) BP.rect(ix, x, y, 26, 28, { w: 1.2, seed: 1000 + i, over: false, col: dom ? undefined : C.cyan, fill: dom ? 'rgba(238,246,255,0.28)' : null, a: 0.9 }); }
    T(ix, `${n} CONTRACTS`, 100, 560, 44, { p: seg(p, 0.4, 0.7), hot: 0.4 }); T(ix, `${fmt(amt)} CRORE RUPEES`, 100, 610, 36, { p: seg(p, 0.5, 0.8), weight: 400 });
    L(ix, 'FILLED: DOMESTIC (ABOUT 92%)', 1180, 560, 28, { align: 'right', p: seg(p, 0.7, 0.9), weight: 400 }); L(ix, 'OUTLINE: ABROAD', 1180, 600, 28, { align: 'right', p: seg(p, 0.75, 0.95), weight: 400, col: C.cyan });
    source(ix, 'SOURCE: PIB', p, 60, 652);
  } };

  // ================= SCENE 6 — THE NUMBERS =================
  PANELS['6.1'] = { draw(ix, p) {
    const t = M.clock();
    head(ix, 'NOW, THE PART THAT IS NOT ENGINEERING', seg(p, 0, 0.3), 150, 40);
    BP.line(ix, 60, 540, 1220, 540, { w: 2.4, p: seg(p, 0.1, 0.5), seed: 1300 });
    BP.poly(ix, [[760, 540], [780, 470], [1130, 470], [1170, 540]], { close: true, w: 2.4, p: seg(p, 0.2, 0.6), seed: 1301, fill: 'rgba(238,246,255,0.10)' });                    // a cargo ship at the quay
    BP.line(ix, 1000, 470, 1000, 400, { w: 2, p: seg(p, 0.4, 0.7), seed: 1302 }); BP.line(ix, 1000, 400, 1090, 400, { w: 2, p: seg(p, 0.4, 0.7), seed: 1303 });
    for (let i = 0; i < 5; i++) { const x = 90 + ((i * 190 + t * 70) % 960), u = clamp((x - 700) / 300), y = 520 - 0 - u * 0; if (x < 1100) BP.rect(ix, x, y - 40 - (x > 760 ? Math.min(60, (x - 760) * 0.2) : 0), 60, 40, { w: 1.8, seed: 1310 + i, over: false, a: 0.9 * seg(p, 0.5, 0.9) }); }
    waves2(ix, p);
    L(ix, 'EXPORTS', 200, 300, 48, { p: seg(p, 0.5, 0.8), weight: 600 });
  } };
  const waves2 = (ix, p) => sea(ix, 575, p, 1320);

  PANELS['6.2'] = { draw(ix, p) {
    const bt = M.bt(), n = Math.round(M.counter(bt, 0.4, 2.6, 0, 38424));
    head(ix, 'DEFENCE EXPORTS · FY 2025-26', seg(p, 0, 0.3), 150, 48);
    T(ix, fmt(n), CX, 360, 120, { align: 'center', p: seg(p, 0.2, 0.6), hot: 0.6 });
    T(ix, 'CRORE RUPEES', CX, 430, 44, { align: 'center', p: seg(p, 0.4, 0.7), weight: 400 });
    bar(ix, 140, 500, 1000, 40, M.tw(bt, [[0.4, 0], [2.6, 1]], M.ease.out), p, 1400);
    L(ix, 'A RECORD', CX, 600, 36, { align: 'center', p: seg(p, 0.7, 0.9), weight: 600 }); source(ix, 'SOURCE: PIB', p);
  } };

  PANELS['6.3'] = { draw(ix, p) {
    const bt = M.bt(), g = M.tw(bt, [[0.6, 0], [3.2, 1]], M.ease.out), s = 1000 / 40000;
    head(ix, 'THE SAME EXPORTS, ON ONE SCALE', seg(p, 0, 0.3), 140, 44);
    L(ix, '2014: UNDER 2,000 CRORE', 140, 270, 32, { p: seg(p, 0.15, 0.4), weight: 400 }); bar(ix, 140, 290, 1000, 56, 2000 / 40000, p, 1500);
    L(ix, 'FY 2025-26: 38,424 CRORE', 140, 420, 32, { p: seg(p, 0.3, 0.55), weight: 600 }); bar(ix, 140, 440, 1000, 70, 38424 / 40000 * g, p, 1510);
    const st = M.tw(bt, [[3.0, 0], [3.4, 1, M.ease.back]]);
    if (st > 0) BP.stamp(ix, 'MORE THAN 19 TIMES', CX, 590, 44 * (0.85 + 0.15 * st), { p: st, seed: 1520 });
    source(ix, 'SOURCE: PIB · DEFENCE MINISTER, 3 NOV 2026', p, 60, 650);
  } };

  PANELS['6.4'] = { draw(ix, p) {
    const bt = M.bt(), g = M.tw(bt, [[0.5, 0], [3.0, 1]], M.ease.io), zx = 140 + 1000 * (2000 / 40000) / 2, t = M.clock();
    head(ix, 'A SMALL BASE MAKES EVERY GAIN LOOK HUGE', seg(p, 0, 0.3), 140, 40);
    bar(ix, 140, 380, 1000, 56, 2000 / 40000, p, 1600);
    BP.line(ix, 140, 470, 140 + 1000 * (2000 / 40000) * g, 470, { w: 6, p: seg(p, 0.4, 0.7), seed: 1601, col: C.cyan, j: 0 });
    M.inset(ix, 820, 285, 100, [zx, 408], 5, (c) => { BP.rect(c, 140, 380, 50, 56, { w: 1.8, seed: 1610, over: false, fill: 'rgba(238,246,255,0.28)' }); BP.line(c, 140, 380, 140, 436, { w: 3, seed: 1611, j: 0 }); }, { p: seg(p, 0.5, 1), seed: 1620, label: 'THE STARTING POINT' });
    L(ix, 'START NEAR ZERO, AND ANY GROWTH LOOKS ENORMOUS', CX, 600, 32, { align: 'center', p: seg(p, 0.8, 1), weight: 400 });
    for (let i = 0; i < 5; i++) BP.dot(ix, 140 + ((t * 60 + i * 40) % 100), 408, 3, C.cyan, 0.8 * seg(p, 0.6, 1));
  } };

  PANELS['6.5'] = { draw(ix, p) {
    const bt = M.bt(), f = 38424 / MAXP * M.tw(bt, [[0.5, 0], [2.6, 1]], M.ease.out);
    head(ix, 'EXPORTS NEXT TO PRODUCTION', seg(p, 0, 0.3), 140, 48);
    BP.rect(ix, 140, 300, 1000, 110, { w: 2.4, p: seg(p, 0.1, 0.5), seed: 1700, over: false });
    BP.poly(ix, [[140, 300], [140 + 1000 * f, 300], [140 + 1000 * f, 410], [140, 410]], { close: true, w: 2.4, p: seg(p, 0.3, 0.7), seed: 1701, fill: 'rgba(134,220,255,0.35)', col: C.cyan });
    L(ix, 'EXPORTS: 38,424', 150, 460, 32, { p: seg(p, 0.5, 0.8), weight: 600, col: C.cyan }); L(ix, 'ALL PRODUCTION: 1,78,000 CRORE', 1140, 460, 32, { align: 'right', p: seg(p, 0.5, 0.8), weight: 600 });
    T(ix, 'ABOUT A FIFTH', CX, 560, 56, { align: 'center', p: seg(p, 0.7, 1), hot: 0.5 });
    L(ix, 'REAL GROWTH FROM A SMALL START · STILL FAR FROM THE WHOLE', CX, 620, 28, { align: 'center', p: seg(p, 0.85, 1), weight: 400 });
  } };

  // ================= SCENE 7 — INDIA =================
  PANELS['7.1'] = { draw(ix, p) {
    const t = M.clock();
    T(ix, 'CAN', 90, 190, 96, { p: seg(p, 0, 0.3), hot: 0.6 });
    checks(ix, ['RECORD PRODUCTION', 'THOUSANDS OF SMALL MAKERS', 'EXPORTS TO MORE THAN 80 COUNTRIES', 'SAID THE DEFENCE MINISTER, NOV 2026'], p, 310, 80);
    for (let i = 0; i < 20; i++) BP.dot(ix, 900 + (i % 5) * 50, 250 + Math.floor(i / 5) * 50, 5, C.cyan, pulse(t * 1.2 + i * 0.6, 2, 0.2) * seg(p, 0.5, 0.9));
    source(ix, 'SOURCE: PIB', p, 60, 640);
  } };

  PANELS['7.2'] = { draw(ix, p) {
    const bt = M.bt(), g = M.tw(bt, [[0.6, 0], [2.4, 1]], M.ease.out);
    T(ix, 'CANNOT YET', 90, 190, 96, { p: seg(p, 0, 0.3), hot: 0.6 });
    L(ix, 'PRODUCTION, CRORE RUPEES · AIM FOR 2029', 90, 270, 32, { p: seg(p, 0.2, 0.4), weight: 400 });
    BP.rect(ix, 90, 290, 1000, 50, { w: 1.6, p: seg(p, 0.2, 0.5), seed: 1800, over: false, dash: [10, 8], col: C.cyan });
    BP.poly(ix, [[90, 290], [90 + 1000 * (178000 / 300000) * g, 290], [90 + 1000 * (178000 / 300000) * g, 340], [90, 340]], { close: true, w: 2.4, p: seg(p, 0.3, 0.6), seed: 1801, fill: 'rgba(238,246,255,0.22)', j: 0.3 });
    T(ix, '3 LAKH CRORE', 1090, 400, 36, { align: 'right', p: seg(p, 0.5, 0.8), weight: 600 });
    L(ix, 'EXPORTS, CRORE RUPEES · AIM FOR 2029', 90, 470, 32, { p: seg(p, 0.4, 0.6), weight: 400 });
    BP.rect(ix, 90, 490, 1000, 50, { w: 1.6, p: seg(p, 0.4, 0.7), seed: 1802, over: false, dash: [10, 8], col: C.cyan });
    BP.poly(ix, [[90, 490], [90 + 1000 * (38424 / 50000) * g, 490], [90 + 1000 * (38424 / 50000) * g, 540], [90, 540]], { close: true, w: 2.4, p: seg(p, 0.5, 0.8), seed: 1803, fill: 'rgba(238,246,255,0.22)', j: 0.3 });
    T(ix, '50,000 CRORE', 1090, 600, 36, { align: 'right', p: seg(p, 0.7, 0.95), weight: 600 });
  } };

  PANELS['7.3'] = { draw(ix, p) {
    const bt = M.bt(), yr = M.counter(bt, 0.6, 4.4, 2026.85, 2029.0), x = (y) => 140 + (y - 2026) * 330;
    head(ix, 'A TARGET IS NOT A RESULT', seg(p, 0, 0.3), 150, 52);
    BP.line(ix, 140, 400, 1130, 400, { w: 2.6, p: seg(p, 0.1, 0.5), seed: 1900 });
    [2026, 2027, 2028, 2029].forEach((y, i) => { BP.line(ix, x(y), 390, x(y), 410, { w: 1.6, p: seg(p, 0.2, 0.5), seed: 1901 + i }); L(ix, String(y), x(y), 450, 28, { align: 'center', p: seg(p, 0.3, 0.6), weight: 400 }); });
    BP.line(ix, x(2026.85), 400, x(yr), 400, { w: 6, col: C.cyan, p: seg(p, 0.3, 0.6), seed: 1910, j: 0, a: 0.8 }); BP.line(ix, x(yr), 375, x(yr), 425, { w: 2.4, col: C.cyan, p: seg(p, 0.3, 0.6), seed: 1911, j: 0 });
    BP.circle(ix, x(2029), 400, 18, { w: 2.4, p: seg(p, 0.5, 0.8), seed: 1912, dash: [6, 6] }); L(ix, 'THE AIM', x(2029), 340, 32, { align: 'center', p: seg(p, 0.6, 0.9), weight: 600 });
    L(ix, 'NOV 2026', x(2026.85), 340, 28, { align: 'center', p: seg(p, 0.5, 0.8), weight: 400 });
    BP.dim(ix, x(2026.85), 540, x(2029), 540, 'ABOUT 3 YEARS', 0, { p: seg(p, 0.7, 1), seed: 1920, size: 28 });
  } };

  // ================= SCENE 8 — THE FIELD =================
  const cakes = (ix, p, act, seed) => [['BUY', 140], ['LICENCE-BUILD', 400], ['CO-DEVELOP', 660], ['OWN RECIPE', 920]].forEach(([s, x], i) => {
    const on = act == null || act === i;
    BP.poly(ix, [[x, 440], [x + 20, 380], [x + 200, 380], [x + 220, 440]], { close: true, w: 2.2, p: seg(p, 0.1 + i * 0.1, 0.5 + i * 0.1), seed: seed + i, a: on ? 1 : 0.4, fill: 'rgba(238,246,255,0.1)' });
    BP.line(ix, x + 110, 380, x + 110, 340, { w: 1.6, p: seg(p, 0.4, 0.7), seed: seed + 9 + i, j: 0, a: on ? 1 : 0.4 }); BP.dot(ix, x + 110, 336 + Math.sin(M.clock() * 5 + i) * 2, 4, C.orange, on ? 1 : 0.3);
    L(ix, s, x + 110, 500, 28, { align: 'center', p: seg(p, 0.5, 0.8), weight: on ? 600 : 400, a: on ? 1 : 0.5 });
  });
  PANELS['8.1'] = { draw(ix, p) { head(ix, 'BACK TO THE CAKE', seg(p, 0, 0.3), 160, 52); cakes(ix, p, null, 2000); L(ix, 'EPISODE 2 · FOUR WAYS TO GET A CAKE', CX, 620, 28, { align: 'center', p: seg(p, 0.8, 1), weight: 400 }); } };
  PANELS['8.2'] = { draw(ix, p) { const k = Math.floor((M.clock() * 0.9) % 4); head(ix, 'A MIX OF ALL FOUR', seg(p, 0, 0.3), 160, 52); cakes(ix, p, p > 0.8 ? k : null, 2020); L(ix, 'DIFFERENT PARTS, DIFFERENT TIMES', CX, 620, 32, { align: 'center', p: seg(p, 0.8, 1), weight: 400 }); } };
  PANELS['8.3'] = { draw(ix, p) {
    const bt = M.bt(), tilt = M.tw(bt, [[0.5, 0.0], [1.6, -0.22], [3.2, 0.12], [4.6, 0]], M.ease.io), cx = CX, cy = 380;
    head(ix, 'WHAT TO BUY · WHAT TO BUILD · AND WHY', seg(p, 0, 0.3), 140, 40);
    BP.line(ix, cx, cy, cx, 560, { w: 3, p: seg(p, 0.1, 0.5), seed: 2100 }); BP.line(ix, cx - 90, 560, cx + 90, 560, { w: 3, p: seg(p, 0.2, 0.5), seed: 2101 });
    const ax = Math.cos(tilt) * 300, ay = Math.sin(tilt) * 300;
    BP.line(ix, cx - ax, cy - ay, cx + ax, cy + ay, { w: 3.4, p: seg(p, 0.2, 0.6), seed: 2102, j: 0 }); BP.dot(ix, cx, cy, 8, C.ink, seg(p, 0.3, 0.6));
    [[-1, 'BUY'], [1, 'BUILD']].forEach(([m, s], i) => { const px = cx + m * ax, py = cy + m * ay; BP.line(ix, px, py, px, py + 80, { w: 1.4, p: seg(p, 0.4, 0.7), seed: 2110 + i, j: 0 }); BP.rect(ix, px - 70, py + 80, 140, 20, { w: 2, p: seg(p, 0.4, 0.7), seed: 2112 + i, over: false }); T(ix, s, px, py + 130, 36, { align: 'center', p: seg(p, 0.5, 0.8), weight: 600 }); });
    T(ix, 'WHY?', cx, 250, 64, { align: 'center', p: seg(p, 0.7, 1), hot: 0.5 });
  } };

  // ================= SCENE 9 — WHAT IF =================
  const fic = (ix, p) => BP.stamp(ix, 'FICTIONAL SCENARIO', CX, 150, 44, { p: seg(p, 0, 0.35), seed: 95 });
  PANELS['9.1'] = Object.assign({}, FIX, { draw(ix, p) {
    const t = M.clock(), by = Math.sin(t * 1.3) * 4;
    fic(ix, p);
    V.carrier(ix, 780, 440, 1.7, { p: seg(p, 0.1, 0.6), id: 'fs', seed: 2200, bob: 3, jets: [{ u: -108 }, { u: 36 }] });
    sea(ix, 520, p, 2210);
    BP.poly(ix, [[60, 520], [60, 450], [130, 440], [190, 480], [210, 520]], { close: true, w: 2, p: seg(p, 0.2, 0.5), seed: 2220, fill: 'rgba(238,246,255,0.08)' }); L(ix, 'PORT', 135, 580, 28, { align: 'center', p: seg(p, 0.5, 0.7), weight: 400 });
    const on = Math.sin(t * 6) > 0 ? 1 : 0.2; BP.circle(ix, 780 + (-16) * 1.7, 440 - 52 * 1.7 - 20 + by, 12, { w: 3, p: seg(p, 0.6, 0.8), seed: 2230, col: C.red, a: on });
    BP.pt('fs:lamp', 780 - 16 * 1.7, 440 - 52 * 1.7 - 20 + by); BP.leaderTo(ix, 'fs:lamp', 560, 250, 'A SMALL PART FAILS', { p: seg(p, 0.7, 1), seed: 2240, side: 'l' });
  } });
  PANELS['9.2'] = Object.assign({}, FIX, { draw(ix, p) {
    const bt = M.bt(), t = M.clock(), a = M.tw(bt, [[0.8, 0], [2.6, 1]], M.ease.io), b = M.tw(bt, [[1.2, 0], [5.8, 1]], M.ease.lin);
    fic(ix, p);
    BP.circle(ix, 1080, 420, 24, { w: 2.4, p: seg(p, 0.1, 0.4), seed: 2300 }); L(ix, 'SHIP', 1080, 480, 28, { align: 'center', p: seg(p, 0.2, 0.5), weight: 600 });
    BP.rect(ix, 160, 270, 160, 70, { w: 2.2, p: seg(p, 0.1, 0.5), seed: 2301, over: false }); L(ix, 'NEARBY WORKSHOP', 240, 380, 28, { align: 'center', p: seg(p, 0.3, 0.6), weight: 400 });
    BP.rect(ix, 160, 500, 160, 70, { w: 2.2, p: seg(p, 0.1, 0.5), seed: 2302, over: false, dash: [8, 8] }); L(ix, 'FAR SUPPLIER', 240, 610, 28, { align: 'center', p: seg(p, 0.3, 0.6), weight: 400 });
    BP.line(ix, 320, 305, 320 + 740 * a, 305 + 115 * a, { w: 3, p: seg(p, 0.3, 0.6), seed: 2310, col: C.cyan, j: 0 }); BP.dot(ix, 320 + 740 * a, 305 + 115 * a, 8, C.cyan, seg(p, 0.3, 0.6));
    BP.line(ix, 320, 535, 320 + 740 * b, 535 - 115 * b, { w: 2, p: seg(p, 0.4, 0.7), seed: 2311, dash: [10, 10], march: 14, j: 0 }); BP.dot(ix, 320 + 740 * b, 535 - 115 * b, 8, C.ink, seg(p, 0.4, 0.7) * pulse(t, 6, 0.4));
    T(ix, 'BY MORNING', 680, 280, 40, { align: 'center', p: seg(p, 0.6, 0.85), weight: 600, col: C.cyan }); T(ix, 'WAITS FOR A DELIVERY', 680, 600, 36, { align: 'center', p: seg(p, 0.7, 0.95), weight: 400 });
  } });
  // blueprint: plan view and elevation of a generic production line, joined by projection lines
  PANELS['9.3'] = Object.assign({}, FIX, { draw(ix, p) {
    const t = M.clock(), px = 180, pw = 800;
    fic(ix, p);
    L(ix, 'PLAN', 70, 280, 28, { p: seg(p, 0.2, 0.4), weight: 600 }); L(ix, 'ELEVATION', 70, 500, 28, { p: seg(p, 0.3, 0.5), weight: 600 });
    BP.rect(ix, px, 210, pw, 120, { w: 2.4, p: seg(p, 0.1, 0.5), seed: 2400, over: false });
    BP.line(ix, px + 30, 270, px + pw - 30, 270, { w: 2, p: seg(p, 0.3, 0.6), seed: 2401, col: C.cyan, dash: [12, 8], march: 16, j: 0 });
    [0, 1, 2, 3].forEach((i) => BP.rect(ix, px + 90 + i * 190, 226, 80, 38, { w: 1.8, p: seg(p, 0.35 + i * 0.05, 0.65 + i * 0.05), seed: 2410 + i, over: false }));
    BP.line(ix, px, 560, px + pw, 560, { w: 2.4, p: seg(p, 0.2, 0.5), seed: 2420 });
    [0, 1, 2, 3].forEach((i) => { BP.rect(ix, px + 90 + i * 190, 480, 80, 80, { w: 1.8, p: seg(p, 0.45 + i * 0.05, 0.75 + i * 0.05), seed: 2430 + i, over: false }); if (p > 0.8) gear(ix, px + 130 + i * 190, 520, 22, t * (4 + i), 2440 + i * 5); });
    [px + 90, px + 90 + 3 * 190 + 80].forEach((x, i) => BP.line(ix, x, 330, x, 480, { w: 1.1, col: C.cyan, dash: [10, 8], j: 0, p: seg(p, 0.6, 0.9), seed: 2460 + i, a: 0.8 }));
    for (let i = 0; i < 5; i++) { const x = px + 20 + ((i * 160 + t * 80) % (pw - 40)); BP.rect(ix, x - 8, 262, 16, 16, { w: 1.4, seed: 2470 + i, over: false, a: 0.9 * seg(p, 0.5, 0.9) }); }   // parts ride the line
    L(ix, 'A FACTORY FLOOR IS PART OF THE DEFENCE', CX, 625, 32, { align: 'center', p: seg(p, 0.8, 1), weight: 400 }); L(ix, 'CONCEPTUAL', 1180, 270, 28, { align: 'right', p: seg(p, 0.85, 1), weight: 400 });
  } });

  // ================= SCENE 10 — THE HABIT =================
  PANELS['10.1'] = { draw(ix, p) {
    const bt = M.bt(), n = M.counter(bt, 0.4, 2.4, 1, 19);
    head(ix, 'WE TRUST BIG MULTIPLES', seg(p, 0, 0.3), 150, 52);
    T(ix, `${Math.round(n)} TIMES`, CX, 400, 120, { align: 'center', p: seg(p, 0.2, 0.6), hot: 0.7 });
    L(ix, 'SOUNDS LIKE A VICTORY', CX, 500, 36, { align: 'center', p: seg(p, 0.7, 0.95), weight: 400 });
  } };
  PANELS['10.2'] = { draw(ix, p) {
    const bt = M.bt(), t = M.clock(), q = 0.5 + 0.5 * Math.sin(t * 3);
    head(ix, '19 TIMES WHAT?', seg(p, 0, 0.3), 150, 64);
    [['A SMALL BASE', 16, 290], ['A BIG BASE', 90, 290]].forEach(([s, h, top], i) => {
      const x = 200 + i * 520, g = M.tw(bt, [[0.6 + i * 0.8, 0], [1.8 + i * 0.8, 1]], M.ease.out), gh = h + (top - h) * g;
      BP.rect(ix, x, 520 - h, 80, h, { w: 2.2, p: seg(p, 0.2, 0.5), seed: 2500 + i, over: false });
      BP.rect(ix, x + 160, 520 - gh, 160, gh, { w: 2.2, p: seg(p, 0.3, 0.6), seed: 2510 + i, over: false, fill: 'rgba(238,246,255,0.2)' });
      if (i && g > 0.9) BP.poly(ix, [[x + 160, 520 - top + 14], [x + 190, 520 - top + 4], [x + 220, 520 - top + 14], [x + 250, 520 - top + 4], [x + 280, 520 - top + 14], [x + 320, 520 - top + 4]], { w: 2, seed: 2520, j: 0, col: C.cyan });   // the bar runs off the page
      T(ix, '19 TIMES', x + 240, 520 - gh - 16, 28, { align: 'center', p: seg(p, 0.5, 0.8) * (g > 0.9 ? 1 : 0), weight: 600 });
      L(ix, s, x + 160, 572, 28, { align: 'center', p: seg(p, 0.5, 0.8), weight: 400 });
    });
    T(ix, '?', CX, 330, 120, { align: 'center', p: seg(p, 0.6, 0.9), hot: 0.6, a: 0.4 + 0.6 * q });
  } };

  PANELS['10.3'] = { draw(ix, p) {
    const bt = M.bt(), k = Math.floor(bt / 1.4) % 3;
    head(ix, 'ASK IT OF EVERY RECORD', seg(p, 0, 0.3), 150, 52);
    ['ONE HUNDRED PERCENT MORE', 'A RECORD YEAR', '19 TIMES AS MUCH'].forEach((s, i) => { T(ix, s, 160, 300 + i * 90, 40, { p: seg(p, 0.2 + i * 0.15, 0.45 + i * 0.15), weight: 400 }); if (bt > 1.0 + i * 0.9) T(ix, 'WHAT?', 960, 300 + i * 90, 40, { p: 1, weight: 600, col: C.cyan }); });
    L(ix, 'INCLUDING THE ONES IN THIS SERIES', CX, 620, 32, { align: 'center', p: seg(p, 0.8, 1), weight: 400 });
  } };

  // ================= SCENE 11 — THE CLOSE =================
  PANELS['11.1'] = { draw(ix, p) {
    const t = M.clock();
    head(ix, 'FIVE EPISODES, ONE CHAIN', seg(p, 0, 0.2), 140, 52);
    ['AIR DEFENCE', 'ENGINE', 'CARRIER', 'SHIELD', 'WORKSHOPS'].forEach((s, i) => {
      const x = 70 + i * 232, on = seg(p, 0.15 + i * 0.13, 0.3 + i * 0.13);
      BP.rect(ix, x, 250, 210, 180, { w: 2.2, p: on, seed: 2600 + i, over: false }); T(ix, 'EP ' + (i + 1), x + 105, 305, 32, { align: 'center', p: on, weight: 600 }); L(ix, s, x + 105, 400, 28, { align: 'center', p: on, weight: 400 });
      if (i < 4) BP.line(ix, x + 210, 340, x + 232, 340, { w: 3, p: on, seed: 2610 + i, col: C.cyan, j: 0 });
      BP.rect(ix, x, 470, 210 * (0.55 + 0.1 * i), 26, { w: 1.6, p: seg(p, 0.6, 0.9), seed: 2620 + i, over: false, fill: 'rgba(238,246,255,0.25)' }); BP.rect(ix, x, 470, 210, 26, { w: 1.2, p: seg(p, 0.6, 0.9), seed: 2630 + i, over: false, dash: [6, 6], col: C.cyan });
    });
    L(ix, 'SOLID: BUILT · DASHED: LEFT TO BUILD', CX, 580, 32, { align: 'center', p: seg(p, 0.8, 1), weight: 400 });
    for (let i = 0; i < 5; i++) BP.dot(ix, 70 + ((t * 120 + i * 200) % 1140), 340, 3, C.ink, 0.8 * seg(p, 0.8, 1));
  } };
  PANELS['11.2'] = Object.assign({}, FIX, { draw(ix, p) {
    const t = M.clock();
    head(ix, 'WHAT WILL IT CHOOSE NEVER TO BUY AGAIN?', seg(p, 0.1, 0.7), 170, 44);
    BP.rect(ix, 520, 300, 240, 200, { w: 2.6, p: seg(p, 0.1, 0.5), seed: 2700, over: false, fill: 'rgba(238,246,255,0.08)', dash: [10, 8], march: 12 });
    T(ix, '?', CX, 440, 140, { align: 'center', p: seg(p, 0.4, 0.8), hot: 0.6, a: pulse(t, 3, 0.4) });
  } });
  PANELS['11.3'] = { draw(ix, p) {
    T(ix, 'FROM BUYING TO BUILDING', CX, 330, 72, { align: 'center', p: seg(p, 0, 0.5), hot: 0.6 });
    BP.line(ix, 240, 380, 1040, 380, { w: 2.4, p: seg(p, 0.3, 0.7), seed: 2800 });
    T(ix, 'EPISODE 05 · THE MACHINES THAT PROTECT INDIA', CX, 440, 28, { align: 'center', p: seg(p, 0.5, 1), weight: 400 });
  } };
})();
