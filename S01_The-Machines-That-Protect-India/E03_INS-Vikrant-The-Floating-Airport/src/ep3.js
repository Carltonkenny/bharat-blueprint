// Episode 3 panels (INS Vikrant). Each draw(ix, p) is a pure function of beat progress p (0..1) and, for motion, of M.bt() (seconds into the beat).
// Rules: headlines >= 44 px, labels >= 28 px, leaders attach to registered anchors, conceptual drawings are labelled.
// Vehicles and motion come from vehicles.js / motion.js, so Episodes 4 and 5 reuse them.
(function () {
  const BP = window.BP, C = BP.C, seg = BP.seg, T = BP.text, L = BP.label, V = BP.V, M = BP.M, clamp = H.clamp;
  const PANELS = (window.PANELS = {});
  const CX = 640;
  const FIX = { cam: () => ({ x: 640, y: 360, z: 1 }) };               // fixed camera: identical drawings cross-fade without ghosting
  const head = (ix, s, p, y = 150, size = 56, o = {}) => T(ix, s, CX, y, size, Object.assign({ align: 'center', p, hot: 0.5 }, o));
  const tick = (ix, x, y, p, seed, col) => BP.poly(ix, [[x, y], [x + 11, y + 12], [x + 32, y - 14]], { w: 3, p, seed, col, j: 0 });
  const sine = (x0, x1, y, amp, ph, n = 60) => Array.from({ length: n + 1 }, (_, i) => { const x = x0 + (x1 - x0) * i / n; return [x, y + Math.sin(x / 38 + ph) * amp]; });
  const waves = (ix, x0, x1, y, p, seed, a = 1) => { const ph = M.clock() * 1.2; BP.poly(ix, sine(x0, x1, y, 5, ph), { w: 1.8, col: C.cyan, p, seed, j: 0, a }); };
  const sea = (ix, y, p, seed) => { waves(ix, 60, 1220, y, seg(p, 0.3, 0.7), seed); waves(ix, 60, 1220, y + 28, seg(p, 0.35, 0.75), seed + 1, 0.55); };
  const jetY = (ground, s) => ground - V.GROUND * s;                    // centre height of a jet whose wheels stand on `ground`
  const wheelSpin = (x, s) => x / (2.4 * s);
  const dashPath = (ix, f, p, seed) => BP.poly(ix, Array.from({ length: 41 }, (_, i) => { const q = f(i / 40); return [q.x, q.y]; }), { w: 1.4, col: C.cyan, p, seed, j: 0, dash: [10, 8], a: 0.7 });
  const gear = (ix, cx, cy, r, ang, seed, a = 1) => {                  // small spinning gear / rotor
    BP.circle(ix, cx, cy, r, { w: 1.8, seed, a });
    for (let i = 0; i < 3; i++) { const q = ang + i * Math.PI / 3; BP.line(ix, cx - Math.cos(q) * r, cy - Math.sin(q) * r, cx + Math.cos(q) * r, cy + Math.sin(q) * r, { w: 1.6, seed: seed + 1 + i, j: 0, a }); }
  };

  // ================= SCENE 1 — THE QUESTION =================
  PANELS['1.1'] = { cam: (p) => ({ x: 640, y: 360, z: 1 + 0.03 * p }), draw(ix, p) {
    const t = M.clock(), gy = 470, s = 3.4;
    head(ix, 'A RUNWAY STAYS STILL', seg(p, 0, 0.4));
    [[80, 250, 60], [520, 215, 80], [930, 270, 70]].forEach(([x, y, w], i) => {                                             // slow clouds
      const cx = ((x + t * (6 + i * 3)) % 1500) - 110;
      BP.poly(ix, [[cx - w, y], [cx - w * 0.6, y - 18], [cx - w * 0.2, y - 10], [cx + w * 0.2, y - 26], [cx + w * 0.7, y - 8], [cx + w, y]], { w: 1.4, col: C.cyan, p: seg(p, 0.2, 0.6), seed: 300 + i, a: 0.5 });
    });
    BP.line(ix, 100, gy, 1180, gy, { w: 2.6, p: seg(p, 0.1, 0.5), seed: 301 });
    for (let i = 0; i < 22; i++) { const lit = Math.sin(t * 4 - i * 0.55) > 0.1; BP.dot(ix, 110 + i * 49, gy + 14, 3, C.cyan, seg(p, 0.3, 0.6) * (lit ? 1 : 0.25)); }   // runway lights chase
    [300, 480, 660, 840, 1020].forEach((u, i) => BP.line(ix, u, gy + 36, u + 80, gy + 36, { w: 1.8, p: seg(p, 0.3 + i * 0.03, 0.65), seed: 303 + i, col: C.cyan }));
    BP.line(ix, 1080, gy, 1080, gy - 110, { w: 2, p: seg(p, 0.4, 0.6), seed: 310 });                                          // windsock
    BP.poly(ix, [[1080, gy - 110], [1130, gy - 104 + Math.sin(t * 2.2) * 4], [1180, gy - 98 + Math.sin(t * 2.2 + 1) * 8], [1180, gy - 80 + Math.sin(t * 2.2 + 1) * 8], [1080, gy - 92]], { close: true, w: 1.8, p: seg(p, 0.45, 0.7), seed: 311, j: 0 });
    V.jetSide(ix, 640, jetY(gy, s), s, { p: seg(p, 0.3, 0.85), seed: 312, id: 'rj' });
    M.particles(ix, { t, t0: 0, rate: 7, life: 1.4, from: () => [640 - 50 * s, jetY(gy, s)], vx: -14, vy: -12, spread: 14, size: 2, grow: 1.5, a: 0.25, seed: 3 });  // idling exhaust
    L(ix, 'LAND: SOLID, FLAT, STILL', CX, 590, 32, { align: 'center', p: seg(p, 0.7, 1), weight: 400 });
  } };

  PANELS['1.2'] = { cam: (p) => ({ x: 640, y: 360, z: 1.03 + 0.02 * p }), draw(ix, p) {
    head(ix, 'NOW PUT IT ON THE SEA', seg(p, 0, 0.35));
    V.carrier(ix, 640, 400, 2.6, { p: seg(p, 0.1, 0.7), id: 's1', seed: 720, bob: 5, jets: [{ u: -108 }, { u: -76 }, { u: 36 }] });
    sea(ix, 482, p, 330);
    L(ix, 'AN AIRPORT THAT MOVES', CX, 600, 32, { align: 'center', p: seg(p, 0.75, 1), weight: 400 });
  } };

  PANELS['1.3'] = { draw(ix, p) {
    const t = M.clock(), gy = 510;
    head(ix, 'THINK OF A BUS', seg(p, 0, 0.3));
    for (let i = 0; i < 5; i++) { const x = ((i * 260 - t * 30) % 1300 + 1300) % 1300 - 60; BP.rect(ix, x, 380 - (i % 3) * 30, 110, 130 + (i % 3) * 30, { w: 1.2, p: seg(p, 0.2, 0.5), seed: 320 + i, over: false, a: 0.28 }); }   // buildings drift past
    BP.poly(ix, [[180, 470], [180, 330], [200, 310], [720, 310], [740, 330], [740, 470]], { close: true, w: 2.4, p: seg(p, 0.1, 0.5), seed: 340, fill: 'rgba(238,246,255,0.10)' });
    [250, 360, 470, 580].forEach((u, i) => BP.rect(ix, u, 335, 80, 60, { w: 1.6, p: seg(p, 0.3 + i * 0.04, 0.6), seed: 341 + i, over: false }));
    [290, 620].forEach((u, i) => { BP.circle(ix, u, 476, 32, { w: 2.2, p: seg(p, 0.35, 0.6), seed: 350 + i }); if (p > 0.6) gear(ix, u, 476, 24, t * 7, 352 + i * 5); });
    BP.line(ix, 140, gy, 1180, gy, { w: 1.6, col: C.cyan, p: seg(p, 0.2, 0.5), seed: 355 });
    for (let i = 0; i < 9; i++) { const x = ((i * 130 - t * 220) % 1100 + 1100) % 1100 + 100; BP.line(ix, x, gy + 24, x + 50, gy + 24, { w: 1.6, seed: 356, j: 0, a: 0.6 * seg(p, 0.4, 0.7), col: C.cyan }); }   // road dashes race by
    const walk = (t * 52) % 400;
    [0, 1, 2].forEach((i) => {
      const px = i === 1 ? 260 + walk : 300 + i * 150, sw = i === 1 ? Math.sin(t * 9) * 7 : 0;
      BP.dot(ix, px, 420, 7, C.ink, seg(p, 0.6 + i * 0.05, 0.8)); BP.line(ix, px, 428, px, 452, { w: 2, p: seg(p, 0.6, 0.85), seed: 360 + i });
      BP.line(ix, px, 452, px - 6 + sw, 466, { w: 2, seed: 363 + i, j: 0, a: seg(p, 0.7, 0.9) }); BP.line(ix, px, 452, px + 6 - sw, 466, { w: 2, seed: 366 + i, j: 0, a: seg(p, 0.7, 0.9) });
    });
    BP.arrow(ix, 780, 400, 1000, 400, { w: 2.6, p: seg(p, 0.55, 0.8), seed: 365 });
    L(ix, 'THE BUS DRIVES', 800, 360, 28, { p: seg(p, 0.6, 0.8), weight: 400 });
    L(ix, 'YOU WALK AROUND INSIDE IT', CX, 590, 32, { align: 'center', p: seg(p, 0.8, 1), weight: 400 });
  } };

  PANELS['1.4'] = { draw(ix, p) {
    head(ix, 'INS VIKRANT', seg(p, 0, 0.3));
    V.carrier(ix, 640, 420, 3.2, { p: seg(p, 0.1, 0.6), id: 'v', seed: 740, bob: 3, jets: [{ u: -108 }, { u: -78 }, { u: 34 }] });
    sea(ix, 566, p, 385);
    BP.leaderTo(ix, 'v:island', 520, 190, 'CONTROL TOWER', { p: seg(p, 0.75, 1), seed: 386, side: 'l' });
    L(ix, 'THE BUS IS A WARSHIP · THE PASSENGERS ARE JETS', CX, 610, 28, { align: 'center', p: seg(p, 0.85, 1), weight: 400 });
  } };

  // ---- blueprint of one jet: top, side and front views joined by projection lines ----
  PANELS['1.5'] = { draw(ix, p) {
    const t = M.clock(), s = 2.6, cx = 420, fx = 900, gy = 540, cy = jetY(gy, s), ty = 270;
    head(ix, 'THREE VIEWS OF ONE JET', seg(p, 0, 0.25), 125, 44);
    BP.line(ix, 230, gy, 1100, gy, { w: 1.4, p: seg(p, 0.1, 0.4), seed: 500, col: C.cyan });
    V.jetTop(ix, cx, ty, s, { p: seg(p, 0.1, 0.55), id: 'jt', seed: 510 });
    V.jetSide(ix, cx, cy, s, { p: seg(p, 0.3, 0.75), id: 'jsv', seed: 530 });
    V.jetFront(ix, fx, cy, s, { p: seg(p, 0.5, 0.95), id: 'jfv', seed: 560 });
    const dash = { w: 1.1, col: C.cyan, dash: [10, 8], j: 0, a: 0.8 };
    [cx + 48 * s, cx - 49 * s].forEach((x, i) => {                                                                                              // top view down to side view
      BP.line(ix, x, ty + 14, x, cy - 8, Object.assign({ p: seg(p, 0.55 + i * 0.05, 0.85), seed: 570 + i }, dash));
      if (p > 0.85) BP.dot(ix, x, ty + 14 + ((t * 70 + i * 90) % (cy - ty - 22)), 3, C.cyan, 0.9);
    });
    [cy - 10 * s, gy, cy - 26 * s].forEach((y, i) => {                                                                                          // side view across to front view
      BP.line(ix, cx + 56 * s, y, fx - 36 * s, y, Object.assign({ p: seg(p, 0.6 + i * 0.05, 0.9), seed: 580 + i }, dash));
      if (p > 0.85) BP.dot(ix, cx + 56 * s + ((t * 90 + i * 70) % (fx - cx - 92 * s)), y, 3, C.cyan, 0.9);
    });
    L(ix, 'TOP', 70, ty + 8, 28, { p: seg(p, 0.4, 0.6), weight: 600 });
    L(ix, 'SIDE', 70, cy + 8, 28, { p: seg(p, 0.55, 0.75), weight: 600 });
    L(ix, 'FRONT', fx, 340, 28, { align: 'center', p: seg(p, 0.7, 0.9), weight: 600 });
    BP.leaderTo(ix, 'jsv:wheel', cx - 60, 590, 'WHEELS DOWN', { p: seg(p, 0.85, 1), seed: 590, side: 'l' });
    L(ix, 'CONCEPTUAL · NOT TO SCALE', 1190, 610, 28, { align: 'right', p: seg(p, 0.9, 1), weight: 400 });
  } };

  // ================= SCENE 2 — WHY IT MATTERS =================
  PANELS['2.1'] = { draw(ix, p) {
    const t = M.clock(), bt = M.bt();
    head(ix, 'TRADE THAT TRAVELS BY SEA', seg(p, 0, 0.3), 150, 52);
    const x0 = 240, w = 860, f95 = M.tw(bt, [[0.6, 0], [2.4, 1]], M.ease.out), f70 = M.tw(bt, [[1.6, 0], [3.4, 1]], M.ease.out);
    L(ix, 'BY VOLUME', 60, 300, 28, { p: seg(p, 0.2, 0.4), weight: 400 });
    BP.rect(ix, x0, 270, w, 54, { w: 1.6, p: seg(p, 0.2, 0.45), seed: 400, over: false, dash: [10, 8], col: C.cyan });
    BP.poly(ix, [[x0, 270], [x0 + w * 0.95 * f95, 270], [x0 + w * 0.95 * f95, 324], [x0, 324]], { close: true, w: 2.4, p: seg(p, 0.35, 0.65), seed: 401, fill: 'rgba(238,246,255,0.22)' });
    T(ix, 'ABOUT 95%', x0 + w * 0.95 - 16, 312, 36, { align: 'right', p: seg(p, 0.55, 0.75) * (f95 > 0.99 ? 1 : 0), hot: 0.4 });
    L(ix, 'BY VALUE', 60, 440, 28, { p: seg(p, 0.5, 0.7), weight: 400 });
    BP.rect(ix, x0, 410, w, 54, { w: 1.6, p: seg(p, 0.5, 0.7), seed: 402, over: false, dash: [10, 8], col: C.cyan });
    BP.poly(ix, [[x0, 410], [x0 + w * 0.7 * f70, 410], [x0 + w * 0.7 * f70, 464], [x0, 464]], { close: true, w: 2.4, p: seg(p, 0.6, 0.85), seed: 403, fill: 'rgba(238,246,255,0.22)' });
    T(ix, 'ABOUT 70%', x0 + w * 0.7 - 16, 452, 36, { align: 'right', p: seg(p, 0.8, 0.95) * (f70 > 0.99 ? 1 : 0), hot: 0.4 });
    BP.line(ix, 60, 540, 1220, 540, { w: 1.2, p: seg(p, 0.6, 0.9), seed: 404, col: C.cyan, dash: [12, 8], j: 0, a: 0.7 });               // sea lane with cargo ships crossing
    [0, 1, 2, 3].forEach((i) => {
      const x = ((i * 320 + t * 60) % 1400) - 100, y = 528, al = seg(p, 0.7, 1);
      BP.poly(ix, [[x, y - 14], [x + 70, y - 14], [x + 60, y], [x + 6, y]], { close: true, w: 1.6, seed: 405 + i, j: 0, a: al });
      [0, 1, 2].forEach((k) => BP.rect(ix, x + 8 + k * 17, y - 26, 14, 12, { w: 1, seed: 410 + k, over: false, a: 0.7 * al }));
      M.particles(ix, { t, t0: 0, rate: 5, life: 1.6, from: () => [x, y], vx: -22, vy: 0, spread: 5, size: 1.6, col: C.cyan, a: 0.5 * al, seed: 20 + i });
    });
    L(ix, 'SOURCE: PIB, MINISTRY OF PORTS, SHIPPING AND WATERWAYS', 60, 622, 28, { p: seg(p, 0.85, 1), weight: 400 });
  } };

  PANELS['2.2'] = { draw(ix, p) {
    const t = M.clock();
    head(ix, 'FAR FROM LAND', seg(p, 0, 0.3));
    BP.poly(ix, [[60, 480], [60, 330], [150, 320], [250, 360], [300, 420], [340, 480]], { close: true, w: 2.2, p: seg(p, 0.1, 0.45), seed: 410, fill: 'rgba(238,246,255,0.08)' });
    L(ix, 'COAST', 150, 400, 28, { align: 'center', p: seg(p, 0.35, 0.55), weight: 400 });
    const sx = 860 + M.tw(M.bt(), [[0, 0], [7, 60]], M.ease.lin);
    V.carrier(ix, sx, 440, 1.7, { p: seg(p, 0.3, 0.7), id: 'f', seed: 750, bob: 3, jets: [{ u: -108 }, { u: 36 }] });
    sea(ix, 500, p, 411);
    for (let i = 0; i < 3; i++) { const k = (t * 0.5 + i / 3) % 1; BP.arc(ix, sx - 16 * 1.7, 440 - 52 * 1.7, 20 + k * 90, Math.PI * 1.15, Math.PI * 1.85, { w: 1.4, col: C.cyan, p: seg(p, 0.6, 0.8), seed: 414 + i, a: (1 - k) * 0.8 }); }   // radar pulses
    BP.dim(ix, 340, 590, 760, 590, 'NO RUNWAY HERE', 0, { p: seg(p, 0.55, 0.85), seed: 413, size: 28 });
    L(ix, 'THE ONLY AIRFIELD IS THE ONE THE SHIP CARRIES', CX, 262, 32, { align: 'center', p: seg(p, 0.8, 1), weight: 400 });
  } };

  // ---- hero: the jet comes in, touches down, the hook takes wire 2, the jet stops ----
  PANELS['2.3'] = { draw(ix, p) {
    const bt = M.bt(), d = window.TIMING.byId.e08.dur, tt = 0.72 * d, t0 = Math.max(0.3, tt - 3.6), s = 1.1, gy = 470, cy = jetY(gy, s);
    head(ix, 'FIRST LANDING: 29 OCT 2026', seg(p, 0, 0.35), 150, 48);
    ix.save(); ix.translate(0, M.shake(bt, [tt], 4));
    const P = V.carrier(ix, 760, gy, 2.3, { p: seg(p, 0.1, 0.5), id: 'r', seed: 760 });
    sea(ix, 548, p, 420);
    const wire2 = P(-100, 0)[0], path = M.path([[60, 170], [220, 250], [380, 350], [470, 420], [581, cy]], 1);
    dashPath(ix, path, seg(p, 0.5, 0.8) * (bt < tt ? 1 : 0), 421);
    if (bt >= t0 - 0.01) {
      let x, y, rot = 0;
      if (bt < tt) { const q = path(M.tw(bt, [[t0, 0], [tt, 1]], M.ease.lin)); x = q.x; y = q.y; rot = clamp(q.ang, 0, 0.3) * 0.6; }
      else { x = M.tw(bt, [[tt, 581], [tt + 1.5, 610]], M.ease.out); y = cy; }
      V.jetSide(ix, x, y, s, { p: seg(p, 0.5, 0.9), id: 'rj', seed: 422, rot, hook: M.tw(bt, [[t0 + 0.6, 0], [t0 + 1.4, 1]]), spin: wheelSpin(x, s) });
      if (bt >= tt) {
        const tip = BP.ref('rj:hookTip');
        if (tip[0] > wire2) BP.line(ix, wire2, gy, tip[0], tip[1] - 1, { w: 2.6, col: C.orange, seed: 423, j: 0 });
        M.particles(ix, { t: bt, t0: tt, until: tt + 1.1, rate: 30, life: 0.5, from: () => [tip[0], tip[1]], vx: 40, vy: -30, spread: 10, size: 1.6, col: C.orange, a: 0.9, seed: 5 });
        M.particles(ix, { t: bt, t0: tt, until: tt + 0.4, rate: 30, life: 0.9, from: () => [x - 20, gy], vx: -30, vy: -16, spread: 8, size: 2.4, grow: 2.5, a: 0.5, seed: 6 });
      }
    }
    ix.restore();
    T(ix, 'RAFALE M', 110, 330, 32, { p: seg(p, 0.7, 1) });
    L(ix, 'FIRST ATTEMPT · THE NAVY SAID SO', CX, 610, 28, { align: 'center', p: seg(p, 0.85, 1), weight: 400 });
    L(ix, 'SOURCE: INDIAN NAVY POST, 30 OCT 2026', 60, 660, 28, { p: seg(p, 0.9, 1), weight: 400 });
  } };

  // ================= SCENE 3 — IDEA 1 · THE RAMP =================
  PANELS['3.1'] = { draw(ix, p) {
    T(ix, 'IDEA 1 · THE RAMP', 90, 160, 56, { p: seg(p, 0, 0.3), hot: 0.5 });
    V.carrier(ix, 640, 400, 3.5, { p: seg(p, 0.1, 0.55), id: 'g', seed: 770, bob: 2, jets: [{ u: -108 }, { u: 36 }] });
    sea(ix, 575, p, 430);
    BP.dim(ix, 185, 400, 1109, 400, '262 METRES LONG', 215, { p: seg(p, 0.45, 0.75), seed: 431, size: 28 });
    BP.leaderBy(ix, 'g:ramp', -60, -120, 'SKI-JUMP RAMP', { p: seg(p, 0.75, 1), seed: 432 });
    const ph = (M.clock() * 0.8) % 1;                                                                                                          // dots flow up the ramp
    [0, 1, 2].forEach((i) => { const k = (ph + i / 3) % 1; BP.dot(ix, 640 + (70 + k * 64) * 3.5, 400 - k * k * 20 * 3.5 - 6, 3, C.cyan, seg(p, 0.8, 1) * (1 - k * 0.5)); });
  } };

  PANELS['3.bike'] = { draw(ix, p) {
    const bt = M.bt(), gy = 520, t0 = 0.4, t1 = 4.6;
    head(ix, 'THE RAMP POINTS YOUR SPEED UP', seg(p, 0, 0.3), 150, 44);
    BP.line(ix, 80, gy, 640, gy, { w: 2.6, p: seg(p, 0.1, 0.4), seed: 440 });
    BP.poly(ix, [[640, gy], [980, 430], [1020, 430]], { w: 2.6, p: seg(p, 0.2, 0.5), seed: 441, j: 0.5 });
    const path = M.path([[80, gy - 26], [640, gy - 26], [800, gy - 70], [980, gy - 96], [1060, gy - 100], [1150, gy - 150], [1250, gy - 230]], 1);
    const u = M.tw(bt, [[t0, 0], [t1, 1]], M.ease.in), q = path(u), ang = q.ang * 0.85, co = Math.cos(ang), si = Math.sin(ang);
    const Q = (a, b) => [q.x + a * co - b * si, q.y + a * si + b * co];
    [-38, 38].forEach((a, i) => { const c = Q(a, 0); BP.circle(ix, c[0], c[1], 26, { w: 2.2, p: seg(p, 0.35, 0.65), seed: 450 + i }); if (p > 0.6) gear(ix, c[0], c[1], 22, q.x / 26, 460 + i * 5); });
    BP.poly(ix, [Q(-38, 0), Q(-8, -40), Q(30, -40), Q(38, 0), Q(8, 0), Q(-8, -40)], { w: 2, p: seg(p, 0.4, 0.7), seed: 470, j: 0.3 });
    BP.line(ix, ...Q(-14, -52), ...Q(-2, -52), { w: 2, p: seg(p, 0.45, 0.7), seed: 471 }); BP.line(ix, ...Q(-8, -40), ...Q(-10, -52), { w: 2, p: seg(p, 0.45, 0.7), seed: 472 });
    BP.line(ix, ...Q(30, -40), ...Q(34, -52), { w: 2, p: seg(p, 0.45, 0.7), seed: 473 });
    const al = 80 + 20 * Math.sin(M.clock() * 6), a0 = Q(48, -30), a1 = [a0[0] + Math.cos(q.ang) * al, a0[1] + Math.sin(q.ang) * al];   // the speed arrow turns with the slope
    if (bt > t0) BP.arrow(ix, a0[0], a0[1], a1[0], a1[1], { w: 2.8, col: C.cyan, seed: 474, p: seg(p, 0.5, 0.8) });
    L(ix, 'SPEED', Math.min(a1[0] + 20, 1130), Math.max(a1[1] - 10, 200), 28, { p: seg(p, 0.7, 0.9), weight: 400 });
    L(ix, 'SAME SPEED, NOW UPWARDS', CX, 610, 32, { align: 'center', p: seg(p, 0.85, 1), weight: 400 });
  } };

  // ---- hero: the jet runs forward of the island, up the ramp, lifts its wheels and climbs away ----
  PANELS['3.2'] = { draw(ix, p) {
    const bt = M.bt(), s = 1.4, gy = 440, cy = jetY(gy, s), t0 = 0.5;
    head(ix, 'THE JET PUSHES · THE RAMP LIFTS', seg(p, 0, 0.3), 150, 44);
    V.carrier(ix, 420, gy, 3.0, { p: seg(p, 0.05, 0.45), id: 'h', seed: 780, wake: false });
    sea(ix, 575, p, 500);
    const path = M.path([[510, cy], [606, cy], [708, 390], [792, 351], [822, 351], [900, 320], [1010, 270], [1130, 235], [1250, 215]], 1);
    const u = M.tw(bt, [[t0, 0], [3.5, 0.4, M.ease.in], [5.6, 1, M.ease.lin]]), q = path(u);
    V.jetSide(ix, q.x, q.y, s, { p: seg(p, 0.4, 0.7), id: 'hj', seed: 501, rot: u > 0.12 ? clamp(q.ang, -0.6, 0.1) : 0, gear: 1 - clamp((u - 0.42) / 0.08), flame: bt > t0 ? 1 : 0, spin: wheelSpin(q.x * 2.2, s) });
    if (bt < 2.4) BP.leaderBy(ix, 'hj:engine', 40, -150, 'ENGINES PUSH', { p: seg(p, 0.65, 0.85), seed: 506, side: 'r' });
    BP.leaderTo(ix, 'h:ramp', 1000, 210, 'RAMP TURNS SPEED INTO CLIMB', { p: seg(p, 0.8, 1), seed: 509, side: 'l' });
    if (u > 0.2) dashPath(ix, (v) => path(0.4 + v * 0.6), seg(p, 0.6, 0.9), 510);
  } };

  // ================= SCENE 4 — IDEA 2 · THE WIRE =================
  PANELS['4.1'] = { draw(ix, p) {
    T(ix, 'IDEA 2 · THE WIRE', 90, 160, 56, { p: seg(p, 0, 0.3), hot: 0.5 });
    V.carrier(ix, 640, 410, 3.3, { p: seg(p, 0.1, 0.5), id: 'w', seed: 790, bob: 6, jets: [{ u: 34 }] });
    sea(ix, 560, p, 510);
    BP.leaderTo(ix, 'w:deck', 350, 250, 'A SHORT DECK', { p: seg(p, 0.55, 0.8), seed: 511, side: 'l' });
    BP.arrow(ix, 1000, 580, 1180, 580, { w: 2.6, p: seg(p, 0.7, 0.9), seed: 512, col: C.cyan });
    L(ix, 'THAT ALSO MOVES', 1180, 620, 28, { align: 'right', p: seg(p, 0.8, 1), weight: 400 });
  } };

  // ---- hero close-up: the hook drops, takes wire 2, the wire stretches, the jet stops; a magnifier shows the hook ----
  PANELS['4.2'] = { draw(ix, p) {
    const bt = M.bt(), s = 3, gy = 520, cy = jetY(gy, s), tt = 3.2, t0 = 0.2;
    head(ix, 'HOOK + THREE WIRES', seg(p, 0, 0.3));
    ix.save(); ix.translate(0, M.shake(bt, [tt], 4));
    BP.line(ix, 80, gy, 1200, gy, { w: 2.6, p: seg(p, 0.05, 0.4), seed: 520 });
    [560, 640, 720].forEach((u, i) => { BP.poly(ix, [[u - 18, gy], [u, gy - 12], [u + 18, gy]], { w: 2.2, p: seg(p, 0.25 + i * 0.05, 0.5), seed: 521 + i, col: C.cyan, j: 0 }); L(ix, String(i + 1), u, gy + 40, 28, { align: 'center', p: seg(p, 0.35, 0.55), weight: 400 }); });
    const path = M.path([[-200, 180], [200, 260], [520, 380], [766, cy]], 1);
    let x, y, rot = 0;
    if (bt < tt) { const q = path(M.tw(bt, [[t0, 0], [tt, 1]], M.ease.lin)); x = q.x; y = q.y; rot = clamp(q.ang, 0, 0.3) * 0.6; }
    else { x = M.tw(bt, [[tt, 766], [tt + 1.7, 866]], M.ease.out) + 3 * M.spring(bt - tt - 1.7); y = cy; }
    const jopt = { p: seg(p, 0.35, 0.75), id: 'hk', seed: 525, rot, hook: M.tw(bt, [[0.9, 0], [1.8, 1]]), spin: wheelSpin(x, s) };
    V.jetSide(ix, x, y, s, jopt);
    const tip = BP.ref('hk:hookTip');
    if (bt >= tt && tip[0] > 640) BP.line(ix, 640, gy, tip[0], tip[1] - 2, { w: 3, col: C.orange, seed: 530, j: 0 });
    if (bt >= tt) M.particles(ix, { t: bt, t0: tt, until: tt + 1.5, rate: 36, life: 0.5, from: () => [tip[0], tip[1]], vx: 50, vy: -34, spread: 12, size: 1.8, col: C.orange, a: 0.9, seed: 8 });
    ix.restore();
    BP.leaderTo(ix, 'hk:hook', 520, 300, 'HOOK AT THE TAIL', { p: seg(p, 0.75, 0.95), seed: 531, side: 'l' });
    M.inset(ix, 1020, 262, 92, [tip[0], tip[1]], 2.4, (c) => {
      BP.line(c, tip[0] - 120, gy, tip[0] + 120, gy, { w: 2.6, seed: 540, j: 0 });
      if (tip[0] > 640) BP.line(c, 640, gy, tip[0], tip[1] - 2, { w: 3, col: C.orange, seed: 541, j: 0 });
      V.jetSide(c, x, y, s, Object.assign({}, jopt, { p: 1, id: 'ins', seed: 545 }));
    }, { p: seg(p, 0.6, 1), seed: 550, label: 'HOOK MEETS WIRE' });
  } };

  PANELS['4.rope'] = { draw(ix, p) {
    const bt = M.bt(), gy = 540;
    head(ix, 'LIKE RUNNING INTO ELASTIC', seg(p, 0, 0.3), 150, 48);
    BP.line(ix, 80, gy, 1200, gy, { w: 2.2, p: seg(p, 0.05, 0.3), seed: 540 });
    BP.line(ix, 960, 400, 960, gy, { w: 3, p: seg(p, 0.15, 0.4), seed: 541 }); BP.line(ix, 1100, 400, 1100, gy, { w: 3, p: seg(p, 0.15, 0.4), seed: 542 });
    const rx = M.tw(bt, [[0.3, 380], [2.4, 700, M.ease.lin], [4.2, 790, M.ease.out]]), speed = M.tw(bt, [[0.3, 1], [2.4, 1], [4.2, 0]], M.ease.io), ph = bt * 9 * speed;
    BP.poly(ix, [[960, 430], [Math.max(718, rx + 22), 455], [960, 480]], { w: 2.4, col: C.orange, p: seg(p, 0.35, 0.6), seed: 543, j: 0.4 });
    BP.dot(ix, rx, 430, 14, C.ink, seg(p, 0.2, 0.4));
    BP.line(ix, rx, 444, rx + 6, 500, { w: 3, p: seg(p, 0.25, 0.5), seed: 545 });
    [0, Math.PI].forEach((off, i) => {                                                                                                          // legs and arms swing
      const sw = Math.sin(ph + off) * 22 * speed;
      BP.line(ix, rx + 6, 500, rx + 6 + sw, gy - 4, { w: 3, seed: 546 + i, j: 0, a: seg(p, 0.3, 0.55) });
      BP.line(ix, rx + 2, 458, rx + 2 - sw * 0.8, 488, { w: 2.4, seed: 548 + i, j: 0, a: seg(p, 0.3, 0.55) });
    });
    for (let i = 0; i < 3; i++) BP.line(ix, rx - 40 - i * 22, 450 + i * 14, rx - 40 - i * 22 - 36 * speed, 450 + i * 14, { w: 1.6, seed: 552 + i, j: 0, a: 0.7 * speed * seg(p, 0.3, 0.6), col: C.cyan });   // speed lines
    L(ix, 'SPEED', 240, 584, 28, { p: seg(p, 0.5, 0.7), weight: 400 });
    BP.rect(ix, 330, 566, 500, 22, { w: 1.4, p: seg(p, 0.5, 0.75), seed: 556, over: false, col: C.cyan });
    BP.poly(ix, [[330, 566], [330 + 500 * speed, 566], [330 + 500 * speed, 588], [330, 588]], { close: true, w: 1.6, p: seg(p, 0.55, 0.8), seed: 557, fill: 'rgba(238,246,255,0.3)', j: 0 });
    L(ix, 'SLOWS YOU SMOOTHLY, INSTEAD OF CRASHING', CX, 628, 28, { align: 'center', p: seg(p, 0.85, 1), weight: 400 });
  } };

  PANELS['4.3'] = { draw(ix, p) {
    const bt = M.bt(), s = 1.8, gy = 520, t0 = 0.3;
    head(ix, 'MISSED THE WIRES?', seg(p, 0, 0.35));
    BP.line(ix, 80, gy, 760, gy, { w: 2.6, p: seg(p, 0.05, 0.35), seed: 560 });
    [380, 460, 540].forEach((u, i) => BP.poly(ix, [[u - 16, gy], [u, gy - 10], [u + 16, gy]], { w: 2.2, p: seg(p, 0.2, 0.4), seed: 561 + i, col: C.cyan, j: 0 }));
    const path = M.path([[40, 300], [260, 420], [470, 470], [640, 462], [800, 380], [1000, 270], [1150, 210]], 1), u = M.tw(bt, [[t0, 0], [3.4, 1]], M.ease.lin), q = path(u);
    dashPath(ix, path, seg(p, 0.35, 0.8), 565);
    if (bt >= t0 - 0.01) V.jetSide(ix, q.x, q.y, s, { p: seg(p, 0.5, 0.9), id: 'ga', seed: 566, rot: clamp(q.ang, -0.5, 0.25), hook: 1, gear: 1 - clamp((u - 0.55) / 0.1), flame: clamp((u - 0.5) / 0.08), spin: wheelSpin(q.x, s) });
    L(ix, 'FULL POWER · TRY AGAIN', CX, 610, 36, { align: 'center', p: seg(p, 0.75, 1), weight: 400 });
  } };

  // ================= SCENE 5 — IDEA 3 · THE FLOATING TOWN =================
  PANELS['5.1'] = { draw(ix, p) {
    const t = M.clock();
    T(ix, 'IDEA 3 · A FLOATING TOWN', 90, 160, 56, { p: seg(p, 0, 0.3), hot: 0.5 });
    const P = V.carrier(ix, 640, 380, 3.6, { p: seg(p, 0.1, 0.45), id: 't', seed: 800, bob: 2, wake: false });
    [[-100, 14, 70], [-26, 14, 60], [40, 14, 50]].forEach(([u, v, w], i) => BP.rect(ix, ...P(u, v), w * 3.6 * 0.9, 54, { w: 1.6, p: seg(p, 0.45 + i * 0.07, 0.7 + i * 0.07), seed: 810 + i, over: false }));
    BP.rect(ix, ...P(-60, 2), 26 * 3.6 * 0.9, 20, { w: 1.6, p: seg(p, 0.66, 0.9), seed: 813, over: false });
    if (p > 0.9) {                                                                                                                              // life inside the rooms
      const a = P(-100, 14), b = P(-26, 14), c = P(40, 14), h = P(-60, 2);
      gear(ix, a[0] + 56, a[1] + 27, 18, t * 6, 830); gear(ix, a[0] + 130, a[1] + 27, 18, -t * 6, 835);                                         // turbines
      gear(ix, b[0] + 50, b[1] + 27, 15, t * 3, 840);
      M.particles(ix, { t, t0: 0, rate: 12, life: 0.5, from: () => [b[0] + 100, b[1] + 40], vx: 14, vy: -26, spread: 6, size: 1.4, col: C.orange, a: 0.8, seed: 9 });   // workshop sparks
      const lvl = 0.5 + 0.3 * Math.sin(t * 0.8); BP.line(ix, c[0] + 8, c[1] + 50 - lvl * 40, c[0] + 158, c[1] + 50 - lvl * 40, { w: 2, seed: 845, j: 0, col: C.cyan });   // fuel level
      [0, 1, 2].forEach((i) => BP.dot(ix, h[0] + 20 + ((t * 24 + i * 40) % 160), h[1] + 10, 3.4, C.ink, 0.9));                                 // people moving about
    }
    BP.pt('t:power', ...P(-65, 30)); BP.pt('t:work', ...P(4, 30)); BP.pt('t:fuel', ...P(65, 30)); BP.pt('t:home', ...P(-48, 8));
    BP.leaderBy(ix, 't:power', -40, 130, 'POWER STATION', { p: seg(p, 0.6, 0.8), seed: 820 });
    BP.leaderBy(ix, 't:work', 0, 140, 'WORKSHOP', { p: seg(p, 0.7, 0.88), seed: 822 });
    BP.leaderBy(ix, 't:fuel', 60, 130, 'FUEL STORE', { p: seg(p, 0.78, 0.94), seed: 824 });
    BP.leaderBy(ix, 't:home', -60, -130, 'HOME: 1,600 PEOPLE', { p: seg(p, 0.85, 1), seed: 826 });
  } };

  // ---- exploded oblique view of the carrier ----
  PANELS['5.1b'] = { draw(ix, p) {
    const bt = M.bt(), ex = M.tw(bt, [[0.3, 0], [1.7, 1]], M.ease.out), lift = (i) => 520 - i * (30 + 45 * ex), x0 = 330, w = 480, k = 70;
    head(ix, 'THE SHIP, TAKEN APART', seg(p, 0, 0.3), 130, 44);
    const y = [lift(0), lift(1), lift(2)];
    V.slab(ix, x0, y[0], w, 50, { p: seg(p, 0.1, 0.6), seed: 1200, col: C.cyan });
    V.slab(ix, x0, y[1], w, 34, { p: seg(p, 0.2, 0.7), seed: 1210 });
    V.slab(ix, x0, y[2], w, 18, { p: seg(p, 0.3, 0.8), seed: 1220 });
    BP.poly(ix, [[x0 + w - 70, y[2] + 2], [x0 + w + 10, y[2] - 20], [x0 + w + k + 10, y[2] - 60], [x0 + w + k, y[2] - 40]], { w: 1.6, p: seg(p, 0.5, 0.85), seed: 1230, j: 0, a: 0.9 });   // ski-jump wedge
    BP.rect(ix, x0 + 120, y[2] - 100 - 22 * ex, 120, 60, { w: 2, p: seg(p, 0.5, 0.9), seed: 1240, over: false });                                // island, lifted clear
    BP.rect(ix, x0 + 150, y[2] - 130 - 22 * ex, 60, 30, { w: 1.6, p: seg(p, 0.55, 0.9), seed: 1241, over: false });
    if (ex > 0.15) [[x0, 0], [x0 + w, 0], [x0 + w + k, -40]].forEach(([cx, dy], i) => BP.line(ix, cx, y[0] + dy, cx, y[2] + dy + 18, { w: 1, col: C.cyan, dash: [8, 8], j: 0, seed: 1250 + i, a: 0.6 * ex, march: 14, p: seg(p, 0.6, 1) }));   // alignment lines
    BP.pt('x:deck', x0 + w / 2 + k, y[2] - 20); BP.pt('x:hang', x0 + w / 2 + k, y[1] - 20); BP.pt('x:eng', x0 + w / 2 + k, y[0] - 20); BP.pt('x:isl', x0 + 240, y[2] - 130 - 22 * ex);
    if (p > 0.5) { gear(ix, x0 + 110, y[0] + 25, 15, M.clock() * 6, 1260); gear(ix, x0 + 160, y[0] + 25, 15, -M.clock() * 6, 1265); }          // turbines turn in the engine room
    BP.leaderTo(ix, 'x:deck', 1000, y[2] - 40, 'FLIGHT DECK', { p: seg(p, 0.7, 0.9), seed: 1270, side: 'r' });
    BP.leaderTo(ix, 'x:hang', 1000, y[1] - 10, 'HANGAR', { p: seg(p, 0.75, 0.93), seed: 1272, side: 'r' });
    BP.leaderTo(ix, 'x:eng', 1000, y[0] + 20, 'ENGINE ROOM', { p: seg(p, 0.8, 0.96), seed: 1274, side: 'r' });
    BP.leaderTo(ix, 'x:isl', 520, y[2] - 150, 'ISLAND', { p: seg(p, 0.85, 1), seed: 1276, side: 'l' });
    L(ix, 'CONCEPTUAL · NOT TO SCALE', 60, 622, 28, { p: seg(p, 0.9, 1), weight: 400 });
  } };

  PANELS['5.2'] = { draw(ix, p) {
    const t = M.clock();
    head(ix, 'ABOUT 88 MEGAWATTS', seg(p, 0, 0.3));
    [0, 1, 2, 3].forEach((i) => { const cx = 150 + i * 140; BP.circle(ix, cx, 280, 46, { w: 2.2, p: seg(p, 0.1 + i * 0.05, 0.35 + i * 0.05), seed: 830 + i }); if (p > 0.5) { gear(ix, cx, 280, 38, t * (5 + i), 840 + i * 6); BP.circle(ix, cx, 280, 12, { w: 1.4, seed: 870 + i, a: 0.9 }); } });
    L(ix, '4 GAS TURBINES', 150, 370, 28, { p: seg(p, 0.3, 0.5), weight: 400 });
    BP.line(ix, 740, 280, 850, 280, { w: 2.6, p: seg(p, 0.45, 0.6), seed: 850, dash: [12, 8], march: 14, j: 0 });
    T(ix, '5,000 HOMES', 880, 292, 40, { p: seg(p, 0.5, 0.7), hot: 0.4 });
    let n = 0;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 20; c++) { const k = n++; if (seg(p, 0.55, 0.95) * 100 > k) BP.rect(ix, 130 + c * 50, 420 + r * 36, 32, 24, { w: 1.4, p: 1, seed: 860 + k, over: false, a: 0.55 + 0.45 * Math.sin(t * 2.4 + k * 0.7) }); }
    L(ix, 'EACH SQUARE = 50 HOMES', CX, 640, 28, { align: 'center', p: seg(p, 0.85, 1), weight: 400 });
    L(ix, 'SOURCE: PIB', 60, 640, 28, { p: seg(p, 0.9, 1), weight: 400 });
  } };

  PANELS['5.3'] = { draw(ix, p) {
    const bt = M.bt(), s = 1.4, platY = M.tw(bt, [[0.8, 480], [3.0, 250]], M.ease.io), cyc = (M.clock() * 0.25) % 1;
    head(ix, 'LIFTS FROM THE HANGAR', seg(p, 0, 0.3), 130, 44);
    BP.line(ix, 100, 250, 520, 250, { w: 2.6, p: seg(p, 0.1, 0.4), seed: 900 }); BP.line(ix, 640, 250, 840, 250, { w: 2.6, p: seg(p, 0.1, 0.4), seed: 901 });
    BP.rect(ix, 100, 340, 740, 140, { w: 2.4, p: seg(p, 0.2, 0.5), seed: 902, over: false });
    BP.line(ix, 520, 250, 520, platY, { w: 1.2, p: seg(p, 0.4, 0.6), seed: 903, col: C.cyan, j: 0 }); BP.line(ix, 640, 250, 640, platY, { w: 1.2, p: seg(p, 0.4, 0.6), seed: 904, col: C.cyan, j: 0 });
    BP.rect(ix, 520, platY, 120, 14, { w: 2.2, p: seg(p, 0.4, 0.6), seed: 905, over: false, col: C.cyan });
    const taxi = M.tw(bt, [[3.4, 580], [4.9, 770]], M.ease.io);
    V.jetSide(ix, taxi, platY - V.GROUND * s, s, { p: seg(p, 0.4, 0.7), id: 'lj', seed: 906, spin: wheelSpin(taxi, s) });
    V.jetSide(ix, 250, 480 - V.GROUND * s, s, { p: seg(p, 0.5, 0.8), id: 'lk', seed: 907 });
    BP.pt('l:lift', 580, 250); BP.pt('l:hangar', 200, 420);
    BP.leaderTo(ix, 'l:hangar', 130, 560, 'HANGAR BELOW DECK', { p: seg(p, 0.65, 0.85), seed: 908, side: 'r' });
    BP.leaderTo(ix, 'l:lift', 700, 200, 'DECK LIFT', { p: seg(p, 0.7, 0.9), seed: 909, side: 'r' });
    BP.rect(ix, 940, 150, 200, 420, { w: 2.2, p: seg(p, 0.6, 0.85), seed: 910, over: false });
    [0, 1, 2, 3, 4, 5].forEach((r) => BP.line(ix, 940, 220 + r * 60, 1140, 220 + r * 60, { w: 1.2, p: seg(p, 0.7, 0.9), seed: 911 + r, col: C.cyan }));
    BP.rect(ix, 1010, 500 - 330 * (cyc < 0.5 ? cyc * 2 : 2 - cyc * 2) - 30, 60, 50, { w: 2, p: seg(p, 0.8, 1), seed: 920, over: false });
    L(ix, 'LIKE A LIFT IN A TALL BUILDING', 1190, 610, 28, { align: 'right', p: seg(p, 0.85, 1), weight: 400 });
  } };

  // ================= SCENE 6 — THE LONG BUILD =================
  const yx = (y) => 120 + (y - 2005) * 50;
  PANELS['6.1'] = { draw(ix, p) {
    const bt = M.bt(), yr = M.counter(bt, 0.8, 7.0, 2009.15, 2022.55), px = yx(yr);
    head(ix, 'NOW, THE PART THAT IS NOT ENGINEERING', seg(p, 0, 0.3), 150, 40);
    BP.line(ix, 100, 400, 1180, 400, { w: 2.6, p: seg(p, 0.1, 0.4), seed: 930 });
    [2005, 2010, 2015, 2020, 2025].forEach((y, i) => { BP.line(ix, yx(y), 392, yx(y), 408, { w: 1.6, p: seg(p, 0.2, 0.4), seed: 931 + i }); L(ix, String(y), yx(y), 450, 28, { align: 'center', p: seg(p, 0.25, 0.45), weight: 400 }); });
    BP.pt('k:keel', yx(2009.15), 400); BP.pt('k:launch', yx(2013.6), 400); BP.pt('k:deliv', yx(2022.55), 400);
    const on = (a) => clamp((px - BP.ref(a)[0]) / 40);
    ['k:keel', 'k:launch', 'k:deliv'].forEach((a) => BP.dot(ix, ...BP.ref(a), 7, C.ink, seg(p, 0.35, 0.5) * (on(a) > 0 ? 1 : 0.35)));
    BP.line(ix, px, 380, px, 420, { w: 2.4, col: C.cyan, seed: 936, j: 0, p: seg(p, 0.4, 0.6) });                                               // the playhead
    BP.line(ix, yx(2009.15), 400, px, 400, { w: 5, col: C.cyan, seed: 937, j: 0, p: seg(p, 0.4, 0.6), a: 0.8 });
    L(ix, String(Math.floor(yr)), px, 360, 28, { align: 'center', p: seg(p, 0.45, 0.65), weight: 600 });
    BP.leaderBy(ix, 'k:keel', 30, -110, 'KEEL LAID · FEB 2009', { p: on('k:keel'), seed: 940, side: 'r' });
    BP.leaderBy(ix, 'k:launch', 10, 120, 'LAUNCHED · AUG 2013', { p: on('k:launch'), seed: 942 });
    BP.leaderBy(ix, 'k:deliv', -10, -150, 'DELIVERED · JUL 2022', { p: on('k:deliv'), seed: 944, side: 'l' });
    L(ix, 'SOURCE: PIB, JULY 2022', 60, 640, 28, { p: seg(p, 0.85, 1), weight: 400 });
  } };

  PANELS['6.2'] = { draw(ix, p) {
    const bt = M.bt(), m = Math.round(M.counter(bt, 0.3, 2.2, 0, 161));
    T(ix, `${Math.floor(m / 12)} YEARS, ${m % 12} MONTHS`, CX, 210, 72, { align: 'center', p: seg(p, 0, 0.3), hot: 0.6 });
    L(ix, 'KEEL TO DELIVERY, IN THREE CONTRACTS', CX, 275, 32, { align: 'center', p: seg(p, 0.3, 0.55), weight: 400 });
    [['CONTRACT 1', 'MAY 2007'], ['CONTRACT 2', 'DEC 2014'], ['CONTRACT 3', 'OCT 2019']].forEach(([a, b], i) => {
      const x = 130 + i * 370, pulse = 0.7 + 0.3 * Math.sin(M.clock() * 3 - i * 1.2);
      BP.rect(ix, x, 350, 320, 130, { w: 2.2, p: seg(p, 0.35 + i * 0.1, 0.55 + i * 0.1), seed: 950 + i, over: false, col: i === 1 ? C.cyan : undefined, a: pulse });
      T(ix, a, x + 160, 410, 36, { align: 'center', p: seg(p, 0.45 + i * 0.1, 0.65 + i * 0.1), weight: 600 });
      L(ix, b, x + 160, 456, 28, { align: 'center', p: seg(p, 0.5 + i * 0.1, 0.7 + i * 0.1), weight: 400 });
    });
    L(ix, 'SOURCE: PIB, JULY 2022', 60, 640, 28, { p: seg(p, 0.85, 1), weight: 400 });
  } };

  PANELS['6.3'] = { draw(ix, p) {
    const bt = M.bt(), n = Math.round(M.counter(bt, 0.3, 2.6, 0, 20000)), t = M.clock();
    BP.coins(ix, 300, 560, 26, 5, { p: 1, id: 'pile', a: 0.8 });
    M.particles(ix, { t, t0: 0, rate: 3, life: 1.2, from: () => [300, 360], vx: 0, vy: 90, spread: 20, size: 3.5, a: 0.6 * seg(p, 0.2, 0.5), seed: 12, g: 60 });     // coins keep falling onto the pile
    T(ix, `CLOSE TO ${n.toLocaleString('en-US')} CRORE RUPEES`, CX, 190, 48, { align: 'center', p: seg(p, 0.1, 0.3), hot: 0.4 });
    L(ix, '1 CRORE = 10 MILLION', 860, 340, 36, { align: 'center', p: seg(p, 0.45, 0.7), weight: 400 });
    T(ix, 'ABOUT 200 BILLION RUPEES', 860, 420, 44, { align: 'center', p: seg(p, 0.65, 0.95) });
    L(ix, 'SOURCE: PIB, JULY 2022', 60, 622, 28, { p: seg(p, 0.85, 1), weight: 400 });
  } };

  PANELS['6.4'] = { draw(ix, p) {
    const t = M.clock();
    head(ix, 'THE PEOPLE BEHIND IT', seg(p, 0, 0.3), 140, 52);
    L(ix, 'DIRECT: ABOUT 2,000', 110, 230, 32, { p: seg(p, 0.15, 0.35), weight: 400 });
    for (let i = 0; i < 8; i++) if (seg(p, 0.2, 0.4) * 8 > i) BP.dot(ix, 130 + i * 40, 280 + Math.sin(t * 3 + i) * 2, 10, C.cyan, 1);
    L(ix, 'INDIRECT: ABOUT 12,500', 110, 360, 32, { p: seg(p, 0.4, 0.6), weight: 400 });
    for (let i = 0; i < 50; i++) if (seg(p, 0.45, 0.85) * 50 > i) BP.dot(ix, 130 + (i % 25) * 40, 410 + Math.floor(i / 25) * 44 + Math.sin(t * 2.5 + i * 0.4) * 2, 10, C.ink, 0.95);
    L(ix, 'EACH DOT = 250 PEOPLE', CX, 590, 28, { align: 'center', p: seg(p, 0.85, 1), weight: 400 });
    L(ix, 'SOURCE: PIB, SEPT 2022', 60, 640, 28, { p: seg(p, 0.88, 1), weight: 400 });
  } };

  // ================= SCENE 7 — INDIA =================
  PANELS['7.1'] = { draw(ix, p) {
    T(ix, 'CAN', 90, 190, 96, { p: seg(p, 0, 0.3), hot: 0.6 });
    [['DESIGNED BY THE NAVY', 290], ['BUILT AT COCHIN SHIPYARD', 360], ['ABOUT 45,000 TONNES', 430], ['76% INDIGENOUS CONTENT', 500], ['FIGHTERS LAND ON IT', 570]].forEach(([s, y], i) => {
      tick(ix, 90, y, seg(p, 0.2 + i * 0.13, 0.32 + i * 0.13), 970 + i, C.cyan);
      T(ix, s, 150, y + 10, 36, { p: seg(p, 0.22 + i * 0.13, 0.4 + i * 0.13), weight: 400 });
    });
    V.carrier(ix, 1010, 220, 1.1, { p: seg(p, 0.3, 0.9), id: 'cn', seed: 1900, bob: 2, jets: [{ u: -108 }, { u: 34 }] });
    L(ix, 'SOURCE: PIB', 960, 622, 28, { p: seg(p, 0.85, 1), weight: 400 });
  } };

  PANELS['7.2'] = { draw(ix, p) {
    const bt = M.bt(), t = M.clock();
    T(ix, 'CANNOT YET', 90, 190, 96, { p: seg(p, 0, 0.3), hot: 0.6 });
    [['LAUNCH WITH A CATAPULT', 290], ['FLY ITS OWN CARRIER FIGHTER', 370]].forEach(([s, y], i) => {
      BP.circle(ix, 106, y - 4, 15, { w: 2.4, p: seg(p, 0.2 + i * 0.15, 0.35 + i * 0.15), seed: 980 + i });
      T(ix, s, 150, y + 8, 36, { p: seg(p, 0.25 + i * 0.15, 0.45 + i * 0.15), weight: 400 });
    });
    BP.arrow(ix, 400, 450, 400, 520, { w: 2.6, p: seg(p, 0.6, 0.75), seed: 985 });
    BP.stamp(ix, '26 RAFALE M ORDERED FROM FRANCE', CX, 590, 36, { p: seg(p, 0.7, 1), seed: 986 });
    if (bt > 2.0) {                                                                                                                              // a flight of three crosses the sky
      const k = M.tw(bt, [[2.0, 0], [8.0, 1]], M.ease.lin);
      [[0, 0], [-50, -34], [-50, 34]].forEach(([dx, dy], i) => {
        const x = -150 + k * 1500 + dx, y = 140 + dy + Math.sin(t + i) * 4;
        V.jetTop(ix, x, y, 0.62, { p: 1, id: 'fl' + i, seed: 1700 + i * 40, fill: false });
        M.particles(ix, { t, t0: 0, rate: 30, life: 0.7, from: () => [x - 31, y], vx: -90, vy: 0, spread: 3, size: 1.4, col: C.cyan, a: 0.6, seed: 30 + i });
      });
    }
    L(ix, 'SOURCE: PIB, 2025', 60, 640, 28, { p: seg(p, 0.9, 1), weight: 400 });
  } };

  // ================= SCENE 8 — THE FIELD =================
  PANELS['8.ball'] = { draw(ix, p) {
    const bt = M.bt(), a1 = M.at('e33'), a2 = M.at('e34'), a3 = M.at('e35');
    head(ix, 'THINK OF A BALL', seg(p, 0, 0.15));
    const A = seg(p, 0.12, 0.38), B = seg(p, 0.4, 0.66), D = seg(p, 0.68, 0.95);
    BP.line(ix, 80, 470, 380, 470, { w: 2.4, p: A, seed: 1000 }); BP.poly(ix, [[210, 470], [380, 400]], { w: 2.4, p: A, seed: 1001, j: 0.3 });
    const bu = M.tw(bt, [[a1, 0], [a1 + 2.0, 1]], M.ease.in), bx = bu < 0.45 ? 100 + bu * 2.2 * 110 : 210 + (bu - 0.45) / 0.55 * 150, by = bu < 0.45 ? 456 : 456 - (bu - 0.45) / 0.55 * 66;
    BP.circle(ix, bx, by, 14, { w: 2.2, p: A, seed: 1002 }); BP.arrow(ix, 120, 420, 220, 420, { w: 2.4, p: seg(p, 0.2, 0.4), seed: 1003, col: C.cyan });
    L(ix, 'SLOPE', 230, 530, 32, { align: 'center', p: seg(p, 0.25, 0.4), weight: 600 }); L(ix, 'SKI JUMP', 230, 570, 28, { align: 'center', p: seg(p, 0.3, 0.42), weight: 400 });
    const sw = M.tw(bt, [[a2 + 0.3, -0.9], [a2 + 0.9, 0.5, M.ease.in]]), hit = bt > a2 + 0.9;
    BP.line(ix, 500 + 100 * Math.sin(sw * 0.2), 520, 600 + 120 * Math.sin(sw), 520 - 140 * Math.cos(sw), { w: 7, p: B, seed: 1010 });
    const fx = hit ? 690 + (bt - a2 - 0.9) * 260 : 690, fy = hit ? 440 - Math.sin(clamp((bt - a2 - 0.9) / 1.4) * Math.PI) * 70 : 440;
    BP.circle(ix, Math.min(fx, 900), fy, 14, { w: 2.2, p: B, seed: 1011 }); BP.arrow(ix, 720, 440, 840, 440, { w: 2.6, p: seg(p, 0.5, 0.7) * (hit ? 0 : 1), seed: 1012, col: C.cyan });
    L(ix, 'BAT', 700, 530, 32, { align: 'center', p: seg(p, 0.52, 0.68), weight: 600 }); L(ix, 'CATAPULT', 700, 570, 28, { align: 'center', p: seg(p, 0.55, 0.7), weight: 400 });
    const th = clamp((bt - a3 - 0.2) / 2.2), ty = 440 - Math.sin(th * Math.PI) * 130;
    BP.circle(ix, 1050, th > 0 ? ty : 440, 14, { w: 2.2, p: D, seed: 1020 }); BP.arrow(ix, 1050, 400, 1050, 330, { w: 2.6, p: seg(p, 0.75, 0.92) * (th > 0 ? 0 : 1), seed: 1021, col: C.cyan }); BP.line(ix, 960, 500, 1140, 500, { w: 2.4, p: D, seed: 1022 });
    L(ix, 'STRAIGHT UP', 1050, 540, 32, { align: 'center', p: seg(p, 0.78, 0.92), weight: 600 }); L(ix, 'VERTICAL TAKE-OFF', 1050, 580, 28, { align: 'center', p: seg(p, 0.82, 0.96), weight: 400 });
  } };

  PANELS['8.1'] = { draw(ix, p) {
    const k = Math.floor((M.clock() * 0.5) % 3);
    head(ix, 'WHO USES WHICH', seg(p, 0, 0.3), 140, 52);
    [['CATAPULT LAUNCH', 'UNITED STATES · FRANCE', 270], ['SKI JUMP, VERTICAL LANDING', 'UNITED KINGDOM', 360], ['SKI JUMP, ARRESTED LANDING', 'INDIA', 450]].forEach(([a, b, y], i) => {
      BP.line(ix, 80, y + 30, 1200, y + 30, { w: 1.4, p: seg(p, 0.15 + i * 0.2, 0.35 + i * 0.2), seed: 1030 + i, col: C.cyan });
      if (p > 0.9 && k === i) BP.rect(ix, 70, y - 30, 1140, 66, { w: 1.2, seed: 1036 + i, over: false, col: C.cyan, a: 0.5, dash: [8, 8], march: 12 });
      T(ix, a, 90, y, 32, { p: seg(p, 0.2 + i * 0.2, 0.4 + i * 0.2), weight: 400 });
      T(ix, b, 730, y, 32, { p: seg(p, 0.3 + i * 0.2, 0.5 + i * 0.2), weight: 600 });
    });
    L(ix, 'METHODS, NOT RANKS · EXAMPLES ONLY', 90, 600, 28, { p: seg(p, 0.8, 1), weight: 400 });
  } };

  PANELS['8.2'] = { draw(ix, p) {
    head(ix, 'NOT A LEAGUE TABLE', seg(p, 0, 0.35));
    [['SKI JUMP', 150], ['CATAPULT', 480], ['VERTICAL', 810]].forEach(([s, x], i) => {
      BP.rect(ix, x, 290, 320, 130, { w: 2.2, p: seg(p, 0.2 + i * 0.12, 0.45 + i * 0.12), seed: 1040 + i, over: false, a: 0.7 + 0.3 * Math.sin(M.clock() * 2 + i * 2) });
      T(ix, s, x + 160, 368, 40, { align: 'center', p: seg(p, 0.3 + i * 0.12, 0.55 + i * 0.12), weight: 600 });
    });
    BP.poly(ix, [[150, 470], [150, 490], [1130, 490], [1130, 470]], { w: 2, p: seg(p, 0.6, 0.9), seed: 1045, j: 0, col: C.cyan });
    L(ix, 'DIFFERENT TOOLS FOR DIFFERENT JOBS', CX, 560, 32, { align: 'center', p: seg(p, 0.75, 1), weight: 400 });
  } };

  // ================= SCENE 9 — WHAT IF =================
  PANELS['9.1'] = Object.assign({}, FIX, { draw(ix, p) {
    const t = M.clock(), by = Math.sin(t * 1.4) * 4, ph = (t * 0.5) % 1;
    BP.stamp(ix, 'FICTIONAL SCENARIO', CX, 150, 44, { p: seg(p, 0, 0.35), seed: 95 });
    BP.poly(ix, [[780, 430 + by], [1100, 430 + by], [1130, 400 + by], [1160, 400 + by], [1130, 470 + by], [830, 480 + by]], { close: true, w: 2.4, p: seg(p, 0.2, 0.55), seed: 1050, fill: 'rgba(238,246,255,0.10)' });
    [800, 880, 960].forEach((u, i) => BP.rect(ix, u, 380 + by, 70, 50, { w: 1.6, p: seg(p, 0.4 + i * 0.05, 0.6 + i * 0.05), seed: 1051 + i, over: false, col: C.cyan }));
    waves(ix, 60, 1220, 500, seg(p, 0.3, 0.6), 1055); waves(ix, 60, 1220, 530, seg(p, 0.35, 0.65), 1056, 0.6);
    [0, 0.33, 0.66].forEach((o, i) => { const k = (ph + o) % 1; BP.circle(ix, 960, 360 + by, 30 + k * 120, { w: 1.6, col: C.red, p: seg(p, 0.55, 0.75), seed: 1060 + i, a: (1 - k) * 0.9 }); });
    BP.pt('c:ship', 960, 380 + by);
    BP.leaderTo(ix, 'c:ship', 700, 260, 'A CARGO SHIP CALLS FOR HELP', { p: seg(p, 0.75, 1), seed: 1062, side: 'r' });
    BP.poly(ix, [[60, 520], [60, 450], [130, 440], [190, 480], [210, 520]], { close: true, w: 2, p: seg(p, 0.2, 0.5), seed: 1063, fill: 'rgba(238,246,255,0.08)' });
    L(ix, 'FAR FROM LAND', 165, 590, 28, { align: 'center', p: seg(p, 0.6, 0.8), weight: 400 });
  } });

  PANELS['9.2'] = Object.assign({}, FIX, { draw(ix, p) {
    const t = M.clock(), sw = Math.PI + ((t * 1.6) % Math.PI), hv = Math.sin(t * 2) * 6, rw = 80 * Math.abs(Math.cos(t * 26)) + 10;
    BP.stamp(ix, 'FICTIONAL SCENARIO', CX, 150, 44, { p: 1, seed: 95 });
    V.carrier(ix, 640, 520, 2.0, { p: seg(p, 0.05, 0.4), id: 'q', seed: 1070, bob: 3 });
    waves(ix, 60, 1220, 580, seg(p, 0.2, 0.5), 1071);
    BP.arc(ix, 240, 340, 60, Math.PI, 2 * Math.PI, { w: 2, p: seg(p, 0.3, 0.5), seed: 1072 }); BP.arc(ix, 240, 340, 30, Math.PI, 2 * Math.PI, { w: 2, p: seg(p, 0.35, 0.55), seed: 1073 });
    BP.line(ix, 240, 340, 240 + Math.cos(sw) * 60, 340 + Math.sin(sw) * 60, { w: 2.4, p: seg(p, 0.4, 0.55), seed: 1074, col: C.cyan, j: 0 });   // radar sweep
    L(ix, 'WATCH THE SEA', 240, 400, 28, { align: 'center', p: seg(p, 0.45, 0.62), weight: 400 });
    BP.rect(ix, 560, 300 + hv, 120, 44, { w: 2.2, p: seg(p, 0.5, 0.7), seed: 1075, over: false });                                              // helicopter hovers, rotor blurs
    BP.line(ix, 620 - rw, 286 + hv, 620 + rw, 286 + hv, { w: 2.4, p: seg(p, 0.55, 0.72), seed: 1076, j: 0 }); BP.line(ix, 680, 322 + hv, 740, 308 + hv, { w: 2, p: seg(p, 0.55, 0.72), seed: 1077 });
    L(ix, 'RESCUE', 620, 400, 28, { align: 'center', p: seg(p, 0.6, 0.76), weight: 400 });
    BP.rect(ix, 900, 290, 200, 80, { w: 2.2, p: seg(p, 0.7, 0.88), seed: 1078, over: false });
    [930, 980, 1030].forEach((u, i) => BP.rect(ix, u, 308, 36, 28, { w: 1.4, p: seg(p, 0.75, 0.9), seed: 1079 + i, over: false, col: C.cyan, a: 0.5 + 0.5 * Math.max(0, Math.sin(t * 3 + i * 2)) }));
    L(ix, 'CONTROL ROOM', 1000, 410, 28, { align: 'center', p: seg(p, 0.8, 0.95), weight: 400 });
    [[240, 430], [620, 430], [1000, 430]].forEach(([u, v], i) => BP.line(ix, u, v + 10, 640, 470, { w: 1.2, p: seg(p, 0.85, 1), seed: 1085 + i, col: C.cyan, dash: [8, 8], march: 12, j: 0 }));
  } });

  PANELS['9.3'] = Object.assign({}, FIX, { draw(ix, p) {
    const t = M.clock(), lv = 400 - (0.5 + 0.5 * Math.sin(t)) * 50;
    BP.stamp(ix, 'FICTIONAL SCENARIO', CX, 150, 44, { p: 1, seed: 95 });
    head(ix, 'NOT A MAGIC SHIELD', seg(p, 0, 0.3), 250, 52);
    BP.rect(ix, 190, 340, 100, 130, { w: 2.2, p: seg(p, 0.3, 0.55), seed: 1090, over: false }); BP.line(ix, 190, 370, 290, 370, { w: 1.6, p: seg(p, 0.4, 0.6), seed: 1091, col: C.cyan }); BP.line(ix, 190, 440, 290, 440, { w: 1.6, p: seg(p, 0.4, 0.6), seed: 1092, col: C.cyan });
    BP.line(ix, 196, lv, 284, lv, { w: 2, seed: 1093, j: 0, col: C.cyan, a: seg(p, 0.5, 0.7) });
    L(ix, 'FUEL', 240, 520, 32, { align: 'center', p: seg(p, 0.45, 0.65), weight: 600 });
    BP.circle(ix, 640, 405, 52, { w: 2.2, p: seg(p, 0.5, 0.75), seed: 1094 }); BP.circle(ix, 640, 405, 18, { w: 1.6, p: seg(p, 0.55, 0.78), seed: 1095 });
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + t * 0.8; BP.line(ix, 640 + Math.cos(a) * 52, 405 + Math.sin(a) * 52, 640 + Math.cos(a) * 68, 405 + Math.sin(a) * 68, { w: 5, p: seg(p, 0.55, 0.78), seed: 1096 + i, j: 0 }); }
    L(ix, 'SPARE PARTS', 640, 520, 32, { align: 'center', p: seg(p, 0.6, 0.8), weight: 600 });
    BP.circle(ix, 1040, 370 + Math.sin(t * 2) * 3, 20, { w: 2.2, p: seg(p, 0.7, 0.88), seed: 1110 }); BP.poly(ix, [[1000, 470], [1010, 410], [1070, 410], [1080, 470]], { close: true, w: 2.2, p: seg(p, 0.72, 0.92), seed: 1111 });
    L(ix, 'TRAINED CREW', 1040, 520, 32, { align: 'center', p: seg(p, 0.8, 0.95), weight: 600 });
    L(ix, 'ALL OF IT MUST BE CARRIED ALONG', CX, 620, 32, { align: 'center', p: seg(p, 0.85, 1), weight: 400 });
  } });

  // ================= SCENE 10 — PLANNING =================
  PANELS['10.1'] = { draw(ix, p) {
    const bt = M.bt(), a1 = M.tw(bt, [[0.5, 0], [2.0, Math.PI / 3]]), a2 = M.tw(bt, [[2.8, 0], [5.4, Math.PI]]);
    head(ix, 'THE PLANNING FALLACY', seg(p, 0, 0.3), 150, 52);
    const clock = (cx, cy, ang, pp, seed, col) => {
      BP.circle(ix, cx, cy, 110, { w: 2.4, p: pp, seed });
      if (ang > 0.01) BP.arc(ix, cx, cy, 80, -Math.PI / 2, -Math.PI / 2 + ang, { w: 8, p: seg(pp, 0.3, 1), seed: seed + 1, col });
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; BP.line(ix, cx + Math.cos(a) * 98, cy + Math.sin(a) * 98, cx + Math.cos(a) * 110, cy + Math.sin(a) * 110, { w: 1.6, p: seg(pp, 0.2, 0.8), seed: seed + 5 + i, j: 0 }); }
      if (pp >= 0.99) BP.line(ix, cx, cy, cx + Math.cos(-Math.PI / 2 + ang) * 92, cy + Math.sin(-Math.PI / 2 + ang) * 92, { w: 3, seed: seed + 30, j: 0 });   // minute hand
    };
    clock(340, 390, a1, seg(p, 0.1, 0.5), 1120, C.cyan);
    clock(940, 390, a2, seg(p, 0.45, 0.85), 1140, C.red);
    L(ix, 'I SAY: 10 MINUTES', 340, 560, 32, { align: 'center', p: seg(p, 0.35, 0.55), weight: 600 });
    L(ix, 'REALITY: 30 MINUTES', 940, 560, 32, { align: 'center', p: seg(p, 0.75, 0.95), weight: 600 });
    BP.line(ix, 500, 390, 780, 390, { w: 2.4, p: seg(p, 0.6, 0.8), seed: 1160, dash: [10, 8], march: 14, j: 0 });
    L(ix, 'I IMAGINED NOTHING GOING WRONG', CX, 615, 28, { align: 'center', p: seg(p, 0.85, 1), weight: 400 });
  } };

  PANELS['10.2'] = { draw(ix, p) {
    const t = M.clock();
    head(ix, 'ABOUT 2,200 COMPARTMENTS', seg(p, 0, 0.3), 140, 52);
    let n = 0;
    for (let r = 0; r < 10; r++) for (let c = 0; c < 22; c++) { const k = n++, bad = k === 97; if (seg(p, 0.15, 0.7) * 220 > k) BP.rect(ix, 130 + c * 48, 210 + r * 34, 34, 22, { w: bad ? 2.4 : 1.3, p: 1, seed: 1170 + k, over: false, col: bad ? C.red : undefined, a: bad ? 0.5 + 0.5 * Math.abs(Math.sin(t * 3)) : 0.5 + 0.3 * Math.max(0, Math.sin(t * 1.5 - (c + r) * 0.5)) }); }
    L(ix, 'EACH SQUARE = 10 COMPARTMENTS', 130, 600, 28, { p: seg(p, 0.6, 0.8), weight: 400 });
    L(ix, 'EVERY ONE HAD TO WORK', 1150, 600, 32, { align: 'right', p: seg(p, 0.8, 1), weight: 600, col: C.red });
    L(ix, 'SOURCE: PIB, OCT 2025', 60, 660, 28, { p: seg(p, 0.9, 1), weight: 400 });
  } };

  // ================= SCENE 11 — THE CLOSE =================
  PANELS['11.1'] = { draw(ix, p) {
    head(ix, 'THREE THINGS TO REMEMBER', seg(p, 0, 0.2), 150, 52);
    [['1', "MOST OF INDIA'S TRADE RIDES THE SEA", 290], ['2', '13 YEARS FROM KEEL TO DELIVERY', 400], ['3', 'ABOUT 14,500 JOBS BUILT THE SHIP', 510]].forEach(([n, s, y], i) => {
      BP.circle(ix, 120, y - 10, 28, { w: 2.4, p: seg(p, 0.2 + i * 0.25, 0.32 + i * 0.25), seed: 1400 + i });
      T(ix, n, 120, y + 4, 36, { align: 'center', p: seg(p, 0.24 + i * 0.25, 0.36 + i * 0.25), weight: 600 });
      T(ix, s, 180, y + 6, 36, { p: seg(p, 0.26 + i * 0.25, 0.46 + i * 0.25), weight: 400 });
    });
  } };

  PANELS['11.2'] = Object.assign({}, FIX, { draw(ix, p) {
    head(ix, 'INDIA BUILT THE SHIP', seg(p, 0.1, 0.6), 160, 56);
    V.carrier(ix, 640, 430, 3.4, { p: seg(p, 0, 0.5), id: 'z', seed: 1500, bob: 3, jets: [{ u: -108 }, { u: -78 }, { u: 34 }] });
    sea(ix, 590, p, 1501);
  } });

  PANELS['11.3'] = Object.assign({}, FIX, { draw(ix, p) {
    const d = { dash: [8, 8], fill: false };
    head(ix, 'WHO WILL BUILD THE JETS?', seg(p, 0.1, 0.7), 160, 56);
    V.carrier(ix, 640, 430, 3.4, { p: 1, id: 'z', seed: 1500, bob: 3, a: 0.9, jets: [Object.assign({ u: -108, a: 0.5 }, d), Object.assign({ u: -78, a: 0.5 }, d), Object.assign({ u: 34, a: 0.5 + 0.5 * Math.abs(Math.sin(M.clock() * 2)) }, d)] });
    sea(ix, 590, 1, 1501);
    BP.leaderBy(ix, 'zj2:top', 0, -120, 'ONE OF THESE?', { p: seg(p, 0.5, 0.9), seed: 1530, side: 'r' });
  } });

  PANELS['11.4'] = { draw(ix, p) {
    T(ix, 'INS VIKRANT', CX, 330, 88, { align: 'center', p: seg(p, 0, 0.5), hot: 0.6 });
    BP.line(ix, 240, 380, 1040, 380, { w: 2.4, p: seg(p, 0.3, 0.7), seed: 1600 });
    T(ix, 'AN AIRPORT THAT MOVES', CX, 432, 36, { align: 'center', p: seg(p, 0.45, 0.85), weight: 400 });
    T(ix, 'EPISODE 03 · THE MACHINES THAT PROTECT INDIA', CX, 490, 28, { align: 'center', p: seg(p, 0.6, 1), weight: 400 });
  } };
})();
