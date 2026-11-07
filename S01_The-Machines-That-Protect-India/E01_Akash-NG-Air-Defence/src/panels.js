// The 24 storyboard key frames. Each draw(ix, p) is a pure function of beat progress p (0..1) so the same code
// will drive the film. Text sizes follow the brief: headlines >= 44px, labels >= 28px.
(function () {
  const BP = window.BP, C = BP.C, seg = BP.seg, T = BP.text, L = BP.label;
  const W = 1280;
  const PANELS = (window.PANELS = {});
  const lerp = H.lerp;
  const D = (a, extra) => Object.assign({ w: 1.6, col: C.cyan, a: 0.7, dash: [10, 8] }, extra, a);
  // pulsing data dot travelling along a straight link
  const pulse = (ix, x1, y1, x2, y2, t, col) => BP.dot(ix, lerp(x1, x2, t), lerp(y1, y2, t), 4.5, col || C.cyan);
  const link = (ix, a, b, p, seed, o = {}) => {
    BP.line(ix, a[0], a[1], b[0], b[1], Object.assign({ w: 2.2, col: C.cyan, seed, p: seg(p, 0, 0.8) }, o));
    if (p > 0.8) {
      const k = BP.now == null ? 0.35 : (BP.now * 0.45 + seed * 0.137) % 1;
      pulse(ix, a[0], a[1], b[0], b[1], k); pulse(ix, a[0], a[1], b[0], b[1], (k + 0.5) % 1);
    }
  };
  const systemRow = (ix, p, y, s, xs, a) => {
    BP.radar(ix, xs[0], y, s, { p, a, seed: 5 });
    BP.c2(ix, xs[1], y, s, { p, a, seed: 6 });
    BP.launcher(ix, xs[2], y, s, { p, a, seed: 7 });
  };

  // ---------------- SCENE 1 — THE HOOK ----------------
  PANELS['1.1'] = { cam: (p) => ({ x: 640, y: 380, z: 1 + 0.1 * p }), draw(ix, p) {
    const g = seg(p, 0, 0.6);
    for (let i = 0; i <= 10; i++) BP.line(ix, 100 + i * 108, 80, 100 + i * 108, 650, { w: 1.2, a: 0.5, col: C.cyan, p: seg(g, i / 14, i / 14 + 0.4), seed: 100 + i });
    for (let j = 0; j <= 6; j++) BP.line(ix, 100, 110 + j * 90, 1180, 110 + j * 90, { w: 1.2, a: 0.5, col: C.cyan, p: seg(g, j / 10, j / 10 + 0.4), seed: 120 + j });
    BP.india(ix, 640, 380, 480, { p: seg(p, 0.15, 0.8), a: 0.9 });
    const r = seg(p, 0.5, 1);
    if (r > 0) {
      [40, 72, 104].forEach((rad, i) => BP.circle(ix, 960, 170, rad * seg(r, i * 0.15, 0.7 + i * 0.1), { col: C.red, a: 0.75 - i * 0.2, w: 2, seed: 140 + i, p: 1 }));
      BP.poly(ix, [[960, 142], [990, 196], [930, 196]], { close: true, col: C.red, w: 3, seed: 150, p: seg(r, 0, 0.5) });
      BP.line(ix, 960, 158, 960, 178, { col: C.red, w: 3.5, seed: 151, p: seg(r, 0.4, 0.7) });
      T(ix, 'ALERT', 1010, 188, 56, { col: C.red, p: seg(r, 0.5, 1) });
      BP.dot(ix, 330, 250, 5, C.red, r); BP.circle(ix, 330, 250, 22, { col: C.red, w: 2, p: seg(r, 0.4, 1), seed: 152 });
    }
  } };

  PANELS['1.2'] = { cam: (p) => ({ x: 640, y: 360, z: 1 + 0.04 * p }), draw(ix, p) {
    const q = seg(p, 0, 0.8);
    BP.line(ix, 120, 440, 1160, 280, D({ p: q, seed: 160 }));
    for (let k = 4; k >= 1; k--) BP.aircraft(ix, 700 - k * 125, 340 + k * 14, 3.0, -0.12, { p: 1, a: 0.28 / (k * 0.7), w: 1.4, seed: 170 + k });
    BP.aircraft(ix, 700, 340, 3.2, -0.12, { p: seg(p, 0, 0.7), constr: true, pen: true, fill: true, seed: 180 });
    BP.track(ix, 650, 340, 150, { p: seg(p, 0.5, 1), seed: 190 });
    T(ix, 'UNIDENTIFIED AIRCRAFT', 640, 150, 52, { align: 'center', p: seg(p, 0.45, 1) });
    L(ix, 'GENERIC SILHOUETTE · NO MARKINGS', 60, 655, 28, { p: seg(p, 0.6, 1), weight: 400 });
  } };

  PANELS['1.3'] = { draw(ix, p) {
    const c = [760, 390];
    BP.india(ix, c[0], c[1], 520, { p: seg(p, 0, 0.3), a: 0.9 });
    BP.india(ix, c[0], c[1], 520 * 1.14, { p: seg(p, 0.1, 0.55), a: 0.8, dash: [14, 10], col: C.cyan, w: 1.8, seed: 41 });
    const st = [720, 440];
    const sw = seg(p, 0.35, 1);
    if (sw > 0) {
      const a0 = -2.3 + sw * 0.8 + (BP.now == null ? 0 : BP.now * 1.5);
      ix.save(); ix.fillStyle = 'rgba(134,220,255,0.22)'; ix.beginPath(); ix.moveTo(st[0], st[1]); ix.arc(st[0], st[1], 230, a0, a0 + 0.55); ix.closePath(); ix.fill(); ix.restore();
      [70, 140, 230].forEach((r, i) => BP.circle(ix, st[0], st[1], r, { w: 1.4, col: C.cyan, a: 0.55, seed: 200 + i, p: sw }));
      BP.line(ix, st[0], st[1], st[0] + Math.cos(a0 + 0.55) * 230, st[1] + Math.sin(a0 + 0.55) * 230, { w: 2.2, col: C.cyan, seed: 205 });
      BP.dot(ix, st[0], st[1], 6, C.ink);
    }
    const ac = lerp(130, 330, seg(p, 0, 1)), ay = lerp(150, 250, seg(p, 0, 1));
    BP.line(ix, 60, 120, ac, ay, D({ p: 1, seed: 210 }));
    BP.line(ix, ac, ay, 560, 360, D({ p: seg(p, 0.3, 1), seed: 211, a: 0.4 }));
    BP.aircraft(ix, ac, ay, 1.4, 0.45, { p: 1, fill: true, seed: 212 });
    BP.track(ix, ac, ay, 62, { p: seg(p, 0.4, 1), seed: 213 });
    L(ix, 'INDIAN AIRSPACE', 1195, 330, 28, { align: 'right', p: seg(p, 0.5, 1) });
    L(ix, 'RADAR SWEEP', st[0], st[1] + 56, 28, { align: 'center', p: seg(p, 0.6, 1), weight: 400 });
  } };

  PANELS['1.4'] = { cam: (p) => ({ x: 640, y: 420, z: 1 + 0.12 * p }), draw(ix, p) {
    BP.india(ix, 640, 400, 460, { p: 1, a: 0.22, w: 1.8 });
    const m = seg(p, 0, 0.5);
    [[110, 560, 300, 108], [490, 536, 300, 132], [870, 560, 300, 108]].forEach(([x, y, w, h], i) => {
      BP.rect(ix, x, y, w, h, { w: 2, seed: 220 + i, p: seg(m, i * 0.15, i * 0.15 + 0.6) });
      for (let k = 1; k < 5; k++) BP.line(ix, x + 18, y + k * (h / 5), x + w * (0.3 + 0.15 * ((k * 7 + i * 3) % 5)), y + k * (h / 5), { w: 1.2, a: 0.5, col: C.cyan, seed: 230 + k, p: seg(m, 0.5, 1) });
    });
    BP.line(ix, 60, 676, 1220, 676, { w: 2, seed: 240, p: m });
    BP.aircraft(ix, 640, 440, 0.8, -0.2, { p: 1, fill: true, seed: 241 });
    BP.track(ix, 640, 440, 80, { p: seg(p, 0.1, 0.6), w: 3, seed: 242 });
    if (BP.now != null && p > 0.6) { const k = (BP.now * 0.55) % 1; BP.circle(ix, 640, 440, 80 + 70 * k, { col: C.ink, a: 0.45 * (1 - k), w: 2, seed: 243, p: 1 }); }
    T(ix, 'DOES INDIA IMMEDIATELY', 640, 245, 56, { align: 'center', p: seg(p, 0.35, 0.75) });
    T(ix, 'FIRE A MISSILE?', 640, 310, 56, { align: 'center', p: seg(p, 0.65, 1) });
  } };

  // ---------------- SCENE 2 — THE PROBLEM ----------------
  PANELS['2.1'] = { draw(ix, p) {
    BP.line(ix, 60, 560, 1220, 560, { w: 1.6, dash: [16, 8], seed: 250, p: seg(p, 0, 0.3) });
    const rd = BP.radar(ix, 230, 560, 1.25, { p: seg(p, 0, 0.5), seed: 251 });
    const ac = [940, 250];
    BP.aircraft(ix, ac[0], ac[1], 1.4, -0.2, { p: seg(p, 0.2, 0.6), fill: true, seed: 252 });
    const f = [200, 435], ang = Math.atan2(ac[1] - f[1], ac[0] - f[0]);
    BP.waves(ix, f[0], f[1], [120, 230, 340, 450, 560, 670, 780], ang - 0.32, ang + 0.32, { p: seg(p, 0.35, 0.9), w: 2.2 });
    BP.waves(ix, ac[0], ac[1], [70, 140, 220], Math.PI + ang - 0.5, Math.PI + ang + 0.5, { p: seg(p, 0.6, 1), dash: [6, 6], col: C.ink, w: 2 });
    BP.track(ix, ac[0], ac[1], 84, { p: seg(p, 0.7, 1), seed: 253 });
    T(ix, 'DETECT', 60, 170, 80, { p: seg(p, 0.1, 0.5) });
    L(ix, 'SENSOR', 205, 620, 28, { align: 'center', p: seg(p, 0.5, 0.8) });
    L(ix, 'AERIAL OBJECT', ac[0], 340, 28, { align: 'center', p: seg(p, 0.75, 1) });
  } };

  PANELS['2.2'] = { draw(ix, p) {
    const r = H.rng(7), bl = seg(p, 0, 0.3);
    for (let i = 0; i < 70; i++) { const x = r.range(80, 480), y = r.range(240, 560); if (i / 70 < bl) BP.dot(ix, x, y, 2.4, C.ink, 0.55); }
    for (let i = 0; i < 14; i++) { const t = i / 13, x = lerp(100, 470, t) + r.gauss() * 8, y = lerp(520, 300, t) + r.gauss() * 14; if (t < bl) BP.dot(ix, x, y, 3.6, C.ink, 0.95); }
    BP.arrow(ix, 500, 400, 540, 400, { w: 2.4, p: seg(p, 0.3, 0.5), seed: 260 });
    BP.rect(ix, 540, 280, 200, 240, { w: 2.2, p: seg(p, 0.3, 0.6), seed: 261 });
    for (let i = 0; i < 5; i++) BP.line(ix, 562, 320 + i * 40, 562 + 60 + ((i * 53) % 90), 320 + i * 40, { w: 1.5, col: C.cyan, p: seg(p, 0.5, 0.8), seed: 262 + i });
    BP.arrow(ix, 740, 400, 790, 400, { w: 2.4, p: seg(p, 0.55, 0.7), seed: 270 });
    const tr = [[810, 520], [850, 490], [900, 450], [950, 425], [1000, 395], [1060, 360]];
    BP.poly(ix, tr, { w: 3, p: seg(p, 0.65, 0.95), seed: 271, pen: true });
    BP.poly(ix, [[1060, 360], [1120, 328], [1190, 292]], D({ p: seg(p, 0.9, 1), seed: 272, col: C.ink }));
    BP.track(ix, 1060, 360, 44, { p: seg(p, 0.85, 1), seed: 273 });
    T(ix, 'ANALYSE', 60, 170, 80, { p: seg(p, 0.1, 0.5) });
    L(ix, 'RAW RETURNS', 280, 620, 28, { align: 'center', p: seg(p, 0.2, 0.4) });
    L(ix, 'PROCESSING', 640, 620, 28, { align: 'center', p: seg(p, 0.45, 0.65) });
    L(ix, 'TRACK', 990, 620, 28, { align: 'center', p: seg(p, 0.8, 1) });
  } };

  PANELS['2.3'] = { draw(ix, p) {
    const s = BP.radar(ix, 200, 520, 0.95, { p: seg(p, 0, 0.35), seed: 280 });
    const c = BP.c2(ix, 640, 560, 1.0, { p: seg(p, 0.1, 0.45), seed: 281 });
    const ac = [1030, 230];
    BP.aircraft(ix, ac[0], ac[1], 1.3, 0.0, { p: seg(p, 0.2, 0.5), fill: true, seed: 282 });
    const lm = BP.launcher(ix, 1090, 520, 0.85, { p: seg(p, 0.3, 0.6), seed: 283 });
    const l = seg(p, 0.5, 1);
    link(ix, s.top, c.top, l, 290); link(ix, c.top, [ac[0] - 20, ac[1] + 40], l, 291); link(ix, c.top, lm.muzzle, l, 292);
    T(ix, 'CONCEPTUAL NETWORK', 640, 120, 44, { align: 'center', p: seg(p, 0.3, 0.7) });
    L(ix, 'SURVEILLANCE', 190, 610, 28, { align: 'center', p: seg(p, 0.4, 0.6) }); L(ix, 'SENSORS', 190, 648, 28, { align: 'center', p: seg(p, 0.4, 0.6) });
    L(ix, 'COMMAND &', 640, 610, 28, { align: 'center', p: seg(p, 0.5, 0.7) }); L(ix, 'COORDINATION', 640, 648, 28, { align: 'center', p: seg(p, 0.5, 0.7) });
    L(ix, 'AIRBORNE DEFENCE', ac[0], 320, 28, { align: 'center', p: seg(p, 0.6, 0.8) });
    L(ix, 'GROUND-BASED', 1085, 575, 28, { align: 'center', p: seg(p, 0.7, 0.9) }); L(ix, 'AIR DEFENCE', 1085, 613, 28, { align: 'center', p: seg(p, 0.7, 0.9) });
  } };

  PANELS['2.4'] = { draw(ix, p) {
    const r = H.rng(5), xs = [150, 370, 590, 810, 1030, 1180], ys = [300, 450, 600], nodes = [];
    ys.forEach((y, j) => xs.forEach((x, i) => nodes.push({ x: x + r.range(-35, 35), y: y + r.range(-30, 30), g: i >= 3 && j >= 1 })));
    const e = seg(p, 0.1, 0.7);
    nodes.forEach((a, i) => nodes.forEach((b, j) => { if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < 250) BP.line(ix, a.x, a.y, b.x, b.y, D({ p: e, seed: 300 + i * 20 + j, a: a.g && b.g ? 0.95 : 0.4, col: a.g && b.g ? C.ink : C.cyan })); }));
    nodes.forEach((n, i) => BP.circle(ix, n.x, n.y, n.g ? 13 : 9, { p: seg(p, 0, 0.4), seed: 330 + i, a: n.g ? 1 : 0.6, w: n.g ? 2.6 : 1.8 }));
    const gc = [1010, 540], h = seg(p, 0.6, 1);
    BP.circle(ix, gc[0], gc[1], 160, { p: h, dash: [12, 8], w: 2, seed: 360 });
    BP.launcher(ix, gc[0] + 30, gc[1] + 5, 0.6, { p: h, seed: 361 });
    L(ix, 'GROUND-BASED AIR DEFENCE', 1195, 620, 28, { align: 'right', p: h });
    T(ix, 'A NETWORK,', 60, 170, 56, { p: seg(p, 0.1, 0.4) });
    T(ix, 'NOT ONE MACHINE', 60, 236, 56, { p: seg(p, 0.35, 0.7) });
  } };

  // ---------------- SCENE 3 — THE REVEAL ----------------
  PANELS['3.1'] = { draw(ix, p) {
    BP.launcher(ix, 900, 610, 2.4, { p: 1, w: 16, a: 0.15, bleed: false, seed: 400 });
    BP.launcher(ix, 900, 610, 2.4, { p: seg(p, 0.15, 1), pen: true, seed: 401 });
    T(ix, 'AKASH-NG', 60, 200, 96, { p: seg(p, 0.2, 0.6) });
    BP.line(ix, 60, 222, 560, 222, { w: 2, p: seg(p, 0.5, 0.7), seed: 402 });
    T(ix, "INDIA'S INDIGENOUS", 60, 272, 36, { p: seg(p, 0.6, 0.85), weight: 400 });
    T(ix, 'AIR DEFENCE ENGINEERING', 60, 316, 36, { p: seg(p, 0.7, 1), weight: 400 });
    L(ix, 'CONCEPTUAL ILLUSTRATION', 60, 655, 28, { p: seg(p, 0.8, 1), weight: 400 });
  } };

  PANELS['3.2'] = { draw(ix, p) {
    const big = BP.interceptor(ix, 200, 330, 4.4, { p: seg(p, 0, 0.7), pen: true, seed: 410 });
    const row = seg(p, 0.5, 1);
    systemRow(ix, row, 640, 0.62, [330, 640, 950], 0.55);
    [330, 640, 950].forEach((x, i) => BP.line(ix, x, 520, 200 + 100 * 4.4 * (0.35 + i * 0.15), 372, D({ p: seg(row, 0.5, 1), seed: 420 + i, a: 0.5 })));
    T(ix, 'NOT JUST A MISSILE', 640, 150, 56, { align: 'center', p: seg(p, 0.3, 0.7) });
    BP.leader(ix, 700, 322, 780, 250, 'INTERCEPTOR', { p: seg(p, 0.6, 1), seed: 430 });
  } };

  PANELS['3.3'] = { draw(ix, p) {
    const rd = BP.radar(ix, 320, 330, 1.0, { p: seg(p, 0, 0.35), seed: 440 });
    const c2 = BP.c2(ix, 940, 335, 1.1, { p: seg(p, 0.15, 0.5), seed: 441 });
    const ln = BP.launcher(ix, 330, 590, 1.0, { p: seg(p, 0.3, 0.65), seed: 442 });
    const ic = BP.interceptor(ix, 780, 540, 1.8, { p: seg(p, 0.45, 0.8), seed: 443 });
    const k = seg(p, 0.7, 1);
    link(ix, rd.top, c2.top, k, 450); link(ix, [880, 300], ln.muzzle, k, 451); link(ix, ln.muzzle, ic.tail, k, 452);
    L(ix, 'MULTI-FUNCTION RADAR', 320, 372, 28, { align: 'center', p: seg(p, 0.3, 0.5) });
    L(ix, 'COMMAND & CONTROL UNIT', 940, 380, 28, { align: 'center', p: seg(p, 0.45, 0.65) });
    L(ix, 'MISSILE LAUNCH VEHICLE', 330, 640, 28, { align: 'center', p: seg(p, 0.6, 0.8) });
    L(ix, 'INTERCEPTOR', 960, 610, 28, { align: 'center', p: seg(p, 0.75, 0.95) });
  } };

  PANELS['3.4'] = { cam: (p) => ({ x: lerp(640, 520, p), y: 400, z: 1 + 0.12 * p }), draw(ix, p) {
    const rd = BP.radar(ix, 220, 470, 1.45, { p: 1, seed: 460 });
    const c2 = BP.c2(ix, 570, 470, 1.3, { p: 1, seed: 461 });
    const ln = BP.launcher(ix, 940, 480, 1.3, { p: 1, seed: 462 });
    const ic = BP.interceptor(ix, 830, 215, 1.1, { p: 1, seed: 463 });
    const k = seg(p, 0, 0.7);
    link(ix, rd.top, c2.top, k, 470); link(ix, c2.top, ic.tail, k, 471); link(ix, [610, 440], [750, 440], k, 472);
    BP.track(ix, 200, 410, 160, { p: seg(p, 0.5, 1), seed: 473, a: 0.9 });
    T(ix, 'THE COMPLETE SYSTEM', 60, 215, 44, { align: 'left', p: seg(p, 0, 0.4) });
    L(ix, 'RADAR', 220, 540, 28, { align: 'center' }); L(ix, 'C2', 570, 540, 28, { align: 'center' });
    L(ix, 'LAUNCHER', 940, 550, 28, { align: 'center' }); L(ix, 'INTERCEPTOR', 940, 280, 28, { align: 'center' });
  } };

  // ---------------- SCENE 4 — INSIDE THE ENGINEERING ----------------
  PANELS['4.1'] = { draw(ix, p) {
    const rd = BP.radar(ix, 230, 590, 2.0, { p: seg(p, 0, 0.4), seed: 500 });
    const ac = [960, 250], f = [176, 390], ang = Math.atan2(ac[1] - f[1], ac[0] - f[0]);
    BP.aircraft(ix, ac[0], ac[1], 1.6, ang, { p: seg(p, 0.1, 0.4), fill: true, seed: 501 });
    BP.waves(ix, f[0], f[1], [120, 200, 280, 360, 440, 520, 600, 680, 760], ang - 0.3, ang + 0.3, { p: seg(p, 0.3, 0.75), w: 2.2 });
    BP.waves(ix, ac[0], ac[1], [70, 130, 190], Math.PI + ang - 0.55, Math.PI + ang + 0.55, { p: seg(p, 0.65, 0.95), dash: [6, 6], col: C.ink, w: 2 });
    BP.track(ix, ac[0], ac[1], 95, { p: seg(p, 0.85, 1), seed: 502 });
    T(ix, 'THE EYES', 60, 150, 72, { p: seg(p, 0.05, 0.4) });
    L(ix, 'MULTI-FUNCTION RADAR', 270, 650, 28, { align: 'center', p: seg(p, 0.35, 0.55) });
    L(ix, 'RADIO WAVES OUT', 560, 450, 28, { align: 'center', p: seg(p, 0.55, 0.75) });
    L(ix, 'REFLECTED SIGNAL', 960, 380, 28, { align: 'center', p: seg(p, 0.7, 0.9) });
    L(ix, 'DETECT + TRACK', 960, 140, 28, { align: 'center', p: seg(p, 0.85, 1) });
  } };

  PANELS['4.2'] = { draw(ix, p) {
    BP.waves(ix, 120, 380, [40, 90, 140, 200], -0.55, 0.55, { p: seg(p, 0, 0.3), col: C.ink, dash: [6, 6], w: 2 });
    BP.arrow(ix, 340, 380, 440, 380, { w: 2.4, p: seg(p, 0.25, 0.4), seed: 510 });
    const r = H.rng(9);
    for (let i = 0; i < 7; i++) {
      const len = r.range(90, 260), y = 240 + i * 38;
      BP.rect(ix, 470, y, len, 22, { w: 1.8, p: seg(p, 0.35 + i * 0.04, 0.6 + i * 0.04), seed: 511 + i });
      BP.hatch(ix, [[470, y], [470 + len, y], [470 + len, y + 22], [470, y + 22]], Math.PI / 4, 6, { p: seg(p, 0.5 + i * 0.04, 0.75), a: 0.5 });
    }
    L(ix, 'SIGNAL TO INFORMATION', 600, 540, 28, { align: 'center', p: seg(p, 0.55, 0.75) });
    const c = BP.c2(ix, 1000, 560, 1.7, { p: seg(p, 0.5, 0.9), seed: 520 });
    BP.poly(ix, [[740, 330], [900, 330], [1000, 380], [c.top[0], c.top[1] - 6]], { w: 2.2, p: seg(p, 0.7, 0.95), seed: 521 });
    [[1090, 170], [1180, 250], [1180, 340]].forEach(([x, y], i) => { BP.arrow(ix, c.top[0] + 6, c.top[1] - 10, x - 20, y + 20, { w: 2, p: seg(p, 0.8, 1), seed: 530 + i }); BP.circle(ix, x, y, 14, { p: seg(p, 0.85, 1), seed: 540 + i }); });
    T(ix, 'THE BRAIN', 60, 150, 72, { p: seg(p, 0.05, 0.4) });
    L(ix, 'PROCESS', 600, 210, 28, { align: 'center', p: seg(p, 0.45, 0.65), weight: 400 });
    L(ix, 'COORDINATE', 1050, 130, 28, { align: 'center', p: seg(p, 0.85, 1), weight: 400 });
    L(ix, 'COMMAND AND CONTROL UNIT', 960, 612, 28, { align: 'center', p: seg(p, 0.7, 0.9) });
  } };

  PANELS['4.3'] = { draw(ix, p) {
    BP.interceptor(ix, 100, 215, 2.6, { p: seg(p, 0, 0.4), seed: 550 });
    const x0 = 230, y0 = 500, s = 4.4;
    const sec = BP.interceptor(ix, x0, y0, s, { p: seg(p, 0.15, 0.55), sec: seg(p, 0.45, 0.85), seed: 551 });
    BP.line(ix, x0 + 148 * s, y0 - 130, x0 + 148 * s, y0 + 130, D({ p: seg(p, 0.4, 0.55), a: 0.45, seed: 552 }));
    for (let i = 0; i < 3; i++) BP.arrow(ix, x0 - 40, y0 - 30 + i * 30, x0 - 160 + i * 6, y0 - 30 + i * 30, { col: C.orange, w: 3.4, p: seg(p, 0.75, 1), seed: 553 + i });
    BP.arrow(ix, 300, 362, 700, 362, { w: 3.4, p: seg(p, 0.8, 1), seed: 560 });
    BP.leader(ix, sec.seeker[0], sec.seeker[1], 960, 308, 'RF SEEKER (INDIGENOUS)', { p: seg(p, 0.6, 0.85), side: 'l', seed: 561 });
    BP.leader(ix, x0 + 80 * s, y0 + 20, 430, 650, 'SOLID ROCKET MOTOR', { p: seg(p, 0.5, 0.75), side: 'r', seed: 563 });
    T(ix, 'THE INTERCEPTOR', 1205, 150, 56, { align: 'right', p: seg(p, 0.05, 0.4) });
    L(ix, 'EXHAUST', 150, 445, 28, { align: 'center', p: seg(p, 0.8, 1), col: C.orange });
    L(ix, 'THRUST ACTS FORWARD', 500, 345, 28, { align: 'center', p: seg(p, 0.85, 1) });
    L(ix, 'CONCEPTUAL SECTION · NOT TO SCALE', 1195, 205, 28, { align: 'right', p: seg(p, 0.7, 1), weight: 400 });
  } };

  PANELS['4.4'] = { draw(ix, p) {
    const rd = BP.radar(ix, 190, 400, 1.0, { p: 1, seed: 570 });
    const c2 = BP.c2(ix, 450, 400, 1.0, { p: 1, seed: 571 });
    const ln = BP.launcher(ix, 780, 410, 1.0, { p: 1, seed: 572 });
    const ic = BP.interceptor(ix, 860, 215, 1.2, { p: 1, seed: 573 });
    const k = seg(p, 0, 0.6), g = { w: 3.4, col: C.cyan };
    link(ix, rd.top, c2.top, k, 580, g); link(ix, c2.top, ic.tail, k, 581, g); link(ix, [520, 340], [700, 360], k, 582, g); link(ix, ln.muzzle, ic.tail, k, 583, g);
    T(ix, 'DIFFERENT TECHNOLOGIES.', 640, 530, 44, { align: 'center', p: seg(p, 0.2, 0.5) });
    T(ix, 'DIFFERENT JOBS.', 640, 586, 44, { align: 'center', p: seg(p, 0.45, 0.7) });
    T(ix, 'ONE CONNECTED SYSTEM.', 640, 642, 44, { align: 'center', p: seg(p, 0.7, 1), col: C.cyan });
  } };

  // ---------------- SCENE 5 — WHY IT MATTERS ----------------
  PANELS['5.1'] = { draw(ix, p) {
    [[90, 'US PATRIOT', 'UNITED STATES'], [690, 'EUROPEAN SAMP/T', 'FRANCE · ITALY']].forEach(([x, name, ctry], i) => {
      const q = seg(p, i * 0.15, 0.6 + i * 0.15);
      BP.rect(ix, x, 150, 500, 430, { w: 2.2, p: q, seed: 600 + i });
      T(ix, name, x + 250, 215, 36, { align: 'center', p: seg(p, 0.3 + i * 0.1, 0.6 + i * 0.1) });
      T(ix, ctry, x + 250, 258, 28, { align: 'center', p: seg(p, 0.4 + i * 0.1, 0.7 + i * 0.1), weight: 400, col: C.cyan });
      BP.line(ix, x + 30, 280, x + 470, 280, { w: 1.4, p: seg(p, 0.4, 0.7), seed: 610 + i });
      BP.radar(ix, x + 140, 520, 0.8, { p: seg(p, 0.5 + i * 0.1, 0.9 + i * 0.1), seed: 620 + i });
      BP.launcher(ix, x + 380, 520, 0.8, { p: seg(p, 0.55 + i * 0.1, 0.95 + i * 0.1), seed: 630 + i });
    });
    L(ix, 'ILLUSTRATIVE — NOT TO SCALE', 560, 650, 28, { align: 'center', p: seg(p, 0.8, 1), weight: 400 });
  } };

  PANELS['5.2'] = { draw(ix, p) {
    const label = (s, x, y, a, b) => L(ix, s, x, y, 28, { align: 'center', p: seg(p, a, b) });
    // design: gear + dimension
    const gp = []; for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2, r = (i % 2 ? 70 : 84) ; gp.push([340 + Math.cos(a) * r, 225 + Math.sin(a) * r]); gp.push([340 + Math.cos(a + 0.09) * r, 225 + Math.sin(a + 0.09) * r]); }
    BP.poly(ix, gp, { close: true, w: 2, p: seg(p, 0, 0.3), seed: 650, j: 0.3 });
    BP.circle(ix, 340, 225, 28, { p: seg(p, 0.15, 0.35), seed: 651 });
    BP.line(ix, 230, 225, 450, 225, D({ p: seg(p, 0.2, 0.4), seed: 652, a: 0.6 })); BP.line(ix, 340, 120, 340, 330, D({ p: seg(p, 0.2, 0.4), seed: 653, a: 0.6 }));
    BP.dim(ix, 256, 225, 424, 225, '', 118, { p: seg(p, 0.3, 0.5), seed: 654 });
    label('DESIGN & ENGINEERING', 340, 372, 0.2, 0.4);
    // radar: element grid + waves
    BP.rect(ix, 850, 160, 130, 130, { w: 2, p: seg(p, 0.1, 0.4), seed: 660 });
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) if ((i * 5 + j) / 25 < seg(p, 0.25, 0.5)) BP.dot(ix, 850 + 130 * (i + 0.5) / 5, 160 + 130 * (j + 0.5) / 5, 3, C.ink);
    BP.waves(ix, 990, 225, [50, 100, 150, 200], -0.7, 0.7, { p: seg(p, 0.35, 0.6) });
    label('RADAR TECHNOLOGY', 940, 372, 0.35, 0.55);
    // electronics: chip with traces
    BP.rect(ix, 280, 420, 120, 120, { w: 2.2, p: seg(p, 0.4, 0.6), seed: 670 });
    for (let i = 0; i < 4; i++) { const t = 440 + i * 26; [[260, 280], [400, 420]].forEach(([a, b], k) => BP.line(ix, a, t, b, t, { w: 1.6, p: seg(p, 0.5, 0.7), seed: 671 + i * 2 + k })); BP.line(ix, 300 + i * 26, 400, 300 + i * 26, 420, { w: 1.6, p: seg(p, 0.5, 0.7), seed: 690 + i }); BP.line(ix, 300 + i * 26, 540, 300 + i * 26, 560, { w: 1.6, p: seg(p, 0.5, 0.7), seed: 700 + i }); }
    BP.poly(ix, [[260, 440], [200, 440], [180, 470], [120, 470]], { p: seg(p, 0.55, 0.8), seed: 710 }); BP.poly(ix, [[420, 492], [470, 492], [490, 520], [560, 520]], { p: seg(p, 0.55, 0.8), seed: 711 });
    T(ix, '1011', 340, 490, 28, { align: 'center', p: seg(p, 0.65, 0.85), col: C.cyan });
    label('ELECTRONICS & SOFTWARE', 340, 628, 0.55, 0.75);
    // manufacturing: robot arm over conveyor
    BP.line(ix, 780, 560, 1110, 560, { w: 2, p: seg(p, 0.55, 0.75), seed: 720 });
    [800, 880, 960, 1040, 1100].forEach((x, i) => BP.circle(ix, x, 572, 10, { w: 1.6, p: seg(p, 0.6, 0.8), seed: 721 + i }));
    BP.rect(ix, 870, 505, 90, 50, { w: 2, p: seg(p, 0.7, 0.9), seed: 730 });
    BP.rect(ix, 800, 520, 50, 40, { w: 2, p: seg(p, 0.65, 0.8), seed: 731 });
    BP.poly(ix, [[825, 520], [860, 430], [960, 400]], { w: 3, p: seg(p, 0.7, 0.95), seed: 732 });
    BP.circle(ix, 860, 430, 10, { p: seg(p, 0.8, 1), seed: 733 }); BP.circle(ix, 960, 400, 8, { p: seg(p, 0.85, 1), seed: 734 });
    BP.poly(ix, [[960, 400], [960, 440], [940, 460]], { w: 2.4, p: seg(p, 0.9, 1), seed: 735 }); BP.poly(ix, [[960, 440], [980, 460]], { w: 2.4, p: seg(p, 0.9, 1), seed: 736 });
    label('INDUSTRIAL MANUFACTURING', 900, 628, 0.75, 0.95);
  } };

  PANELS['5.3'] = { draw(ix, p) {
    BP.india(ix, 800, 400, 500 * 1.05, { p: seg(p, 0, 0.4), dash: [12, 8], a: 0.4, w: 1.6, seed: 740 });
    BP.india(ix, 800, 400, 500, { p: seg(p, 0, 0.5), fill: seg(p, 0.7, 1) > 0.5 ? 'rgba(134,220,255,0.10)' : null, seed: 741 });
    const caps = [['DESIGN', 340, [800, 280]], ['RADAR', 420, [740, 330]], ['ELECTRONICS', 500, [820, 430]], ['INDUSTRY', 580, [760, 520]]];
    caps.forEach(([name, y, tgt], i) => {
      const q = seg(p, 0.3 + i * 0.1, 0.6 + i * 0.1), w = BP.tw(ix, name, 28);
      L(ix, name, 60, y, 28, { p: q });
      BP.line(ix, 60 + w + 20, y - 9, tgt[0], tgt[1], { w: 1.8, p: q, seed: 750 + i, col: C.cyan });
      BP.dot(ix, tgt[0], tgt[1], 6, C.ink, seg(q, 0.7, 1));
    });
    T(ix, "INDIA'S", 60, 170, 56, { p: seg(p, 0.1, 0.4) });
    T(ix, 'CAPABILITY', 60, 236, 56, { p: seg(p, 0.25, 0.6) });
  } };

  PANELS['5.4'] = { draw(ix, p) {
    const a = seg(p, 0, 0.5);
    BP.line(ix, 60, 600, 1220, 600, { w: 2.2, p: a, seed: 760 });
    BP.poly(ix, [[120, 600], [120, 190], [640, 140], [1160, 190], [1160, 600]], { w: 2.4, p: a, seed: 761 });
    const z = []; for (let i = 0; i <= 13; i++) z.push([120 + i * 80, i % 2 ? 190 + Math.abs(i - 6.5) * 0 : 250]);
    BP.poly(ix, [[120, 250], [1160, 250]], { w: 1.6, p: seg(p, 0.2, 0.6), seed: 762 });
    for (let i = 0; i < 12; i++) BP.line(ix, 120 + i * 86.7, i % 2 ? 190 - Math.abs(i - 6) * 7 : 250, 120 + (i + 1) * 86.7, i % 2 ? 250 : 190 - Math.abs(i - 5) * 7, { w: 1.3, a: 0.7, p: seg(p, 0.25, 0.6), seed: 770 + i });
    BP.rect(ix, 300, 262, 680, 24, { w: 2, p: seg(p, 0.35, 0.65), seed: 790 });
    BP.rect(ix, 590, 286, 100, 36, { w: 2, p: seg(p, 0.5, 0.75), seed: 791 });
    BP.line(ix, 560, 322, 530, 366, { w: 1.6, p: seg(p, 0.6, 0.8), seed: 792 }); BP.line(ix, 720, 322, 760, 366, { w: 1.6, p: seg(p, 0.6, 0.8), seed: 793 });
    BP.interceptor(ix, 490, 400, 1.5, { p: seg(p, 0.55, 0.95), seed: 794 });
    [[480, 560], [800, 560]].forEach(([x], i) => { BP.poly(ix, [[x - 40, 600], [x, 530], [x + 40, 600]], { w: 2, p: seg(p, 0.7, 0.9), seed: 800 + i }); });
    BP.rect(ix, 150, 480, 160, 120, { w: 2.2, p: seg(p, 0.7, 0.95), seed: 810 }); BP.circle(ix, 230, 540, 30, { p: seg(p, 0.8, 1), seed: 811 });
    BP.rect(ix, 920, 500, 200, 100, { w: 2.2, p: seg(p, 0.75, 1), seed: 812 });
    for (let i = 0; i < 4; i++) BP.line(ix, 940, 520 + i * 20, 1100, 520 + i * 20, { w: 1.3, p: seg(p, 0.85, 1), seed: 813 + i });
    T(ix, 'INDUSTRIAL MANUFACTURING', 1205, 112, 44, { align: 'right', p: seg(p, 0.1, 0.5) });
    L(ix, 'ILLUSTRATIVE', 60, 655, 28, { p: seg(p, 0.8, 1), weight: 400 });
  } };

  // ---------------- SCENE 6 — THE REVELATION ----------------
  PANELS['6.1'] = { draw(ix, p) {
    BP.interceptor(ix, 260, 600, 3.8, { p: 1, a: 0.2, w: 1.6, seed: 820 });
    BP.rect(ix, 200, 160, 880, 360, { w: 2.6, p: seg(p, 0, 0.35), seed: 821, fill: 'rgba(9,44,86,0.82)' });
    BP.rect(ix, 214, 174, 852, 332, { w: 1.2, p: seg(p, 0.1, 0.4), seed: 822 });
    T(ix, 'DECEMBER 2025', 640, 275, 80, { align: 'center', p: seg(p, 0.3, 0.6) });
    BP.line(ix, 260, 305, 1020, 305, { w: 2, p: seg(p, 0.55, 0.7), seed: 823 });
    T(ix, 'USER EVALUATION TRIALS', 640, 372, 44, { align: 'center', p: seg(p, 0.6, 0.85) });
    T(ix, 'COMPLETED', 640, 434, 44, { align: 'center', p: seg(p, 0.75, 0.95), col: C.cyan });
    BP.poly(ix, [[940, 420], [972, 452], [1030, 380]], { w: 6, p: seg(p, 0.85, 1), seed: 824, pen: true });
    L(ix, 'SOURCE: MINISTRY OF DEFENCE / PIB · 23 DEC 2025', 640, 590, 28, { align: 'center', p: seg(p, 0.9, 1), weight: 400 });
  } };

  PANELS['6.2'] = { draw(ix, p) {
    systemRow(ix, seg(p, 0.3, 1), 640, 0.7, [300, 620, 950], 0.5);
    BP.interceptor(ix, 150, 300, 4.6, { p: seg(p, 0, 0.5), seed: 830 });
    BP.poly(ix, [[130, 168], [110, 168], [110, 432], [130, 432]], { w: 2, p: seg(p, 0.3, 0.6), seed: 831 });
    T(ix, 'WHAT YOU SEE', 640, 135, 44, { align: 'center', p: seg(p, 0.2, 0.55) });
    L(ix, 'EVERYTHING BEHIND IT', 640, 495, 28, { align: 'center', p: seg(p, 0.6, 0.9) });
    BP.poly(ix, [[120, 520], [100, 520], [100, 660], [120, 660]], { w: 2, p: seg(p, 0.6, 0.9), seed: 832 });
  } };

  PANELS['6.3'] = { draw(ix, p) {
    const rd = BP.radar(ix, 230, 540, 1.2, { p: 1, seed: 840 });
    const c2 = BP.c2(ix, 640, 520, 1.2, { p: 1, seed: 841 });
    const ln = BP.launcher(ix, 1030, 545, 1.2, { p: 1, seed: 842 });
    const ic = BP.interceptor(ix, 520, 255, 1.2, { p: 1, seed: 843 });
    const k = seg(p, 0, 0.7), g = { w: 3.6, col: C.cyan };
    link(ix, rd.top, c2.top, k, 850, g); link(ix, ic.tail, c2.top, k, 851, g); link(ix, ln.muzzle, c2.top, k, 852, g); link(ix, ic.nose, ln.muzzle, k, 853, g);
    T(ix, 'THE REAL ENGINEERING', 640, 160, 56, { align: 'center', p: seg(p, 0.3, 0.8) });
  } };

  PANELS['6.4'] = { draw(ix, p) {
    BP.line(ix, 120, 220, 1160, 220, { w: 2.2, p: seg(p, 0, 0.4), seed: 860 });
    BP.line(ix, 120, 470, 1160, 470, { w: 2.2, p: seg(p, 0, 0.4), seed: 861 });
    T(ix, 'AKASH-NG', 640, 350, 120, { align: 'center', p: seg(p, 0.2, 0.7) });
    T(ix, 'ENGINEERING AN ENTIRE DEFENCE SYSTEM.', 640, 535, 44, { align: 'center', p: seg(p, 0.6, 1), col: C.cyan });
  } };
})();

