// Episode 2 panels. Each draw(ix, p) is a pure function of beat progress p (0..1). Headlines >= 44px, labels >= 28px.
// Leaders and links attach to anchors registered by the objects (BP.leaderTo / BP.link); nothing is positioned by hand.
(function () {
  const BP = window.BP, C = BP.C, seg = BP.seg, T = BP.text, L = BP.label, lerp = H.lerp;
  const PANELS = (window.PANELS = {});
  const CX = 640;
  const head = (ix, s, p, y = 150, size = 56, o = {}) => T(ix, s, CX, y, size, Object.assign({ align: 'center', p, hot: 0.5 }, o));
  const tick = (ix, x, y, p, seed, col) => BP.poly(ix, [[x, y], [x + 11, y + 12], [x + 32, y - 14]], { w: 3, p, seed, col, j: 0 });

  // ================= SCENE 1 — THE FIGHTER =================
  PANELS['1.1'] = { cam: (p) => ({ x: 640, y: 360, z: 1 + 0.03 * p }), draw(ix, p) {
    BP.jet(ix, 640, 400, 3.8, 0, { p: seg(p, 0, 0.8), constr: true, fill: true, id: 'jet', seed: 180 });
    head(ix, 'THE PART YOU PHOTOGRAPH', seg(p, 0.3, 1));
  } };

  PANELS['1.2'] = { cam: (p) => ({ x: 640, y: 360, z: 1.03 + 0.03 * p }), draw(ix, p) {
    BP.jet(ix, 640, 400, 3.8, 0, { p: 1, constr: true, fill: true, id: 'jet', seed: 180, a: 0.45, bay: true, bayCol: C.ink });
    head(ix, 'THE PART YOU WAIT FOR', seg(p, 0.1, 0.8));
    BP.leaderBy(ix, 'jet:bayTop', 0, -76, 'THE ENGINE', { p: seg(p, 0.4, 1), seed: 14, side: 'l' });
  } };

  PANELS['1.3'] = { draw(ix, p) {
    BP.jet(ix, 370, 400, 2.6, 0, { p: seg(p, 0, 0.5), fill: true, id: 'mj', seed: 190, bay: true });
    T(ix, 'HF-24 MARUT', 90, 170, 44, { p: seg(p, 0, 0.3) });
    T(ix, '1961', 740, 190, 96, { weight: 400, p: seg(p, 0.15, 0.5), hot: 0.6 });
    BP.rect(ix, 740, 250, 440, 84, { w: 1.8, p: seg(p, 0.45, 0.65), seed: 31, dash: [10, 8], col: C.cyan });
    T(ix, 'PLANNED: MORE POWER', 758, 303, 28, { p: seg(p, 0.55, 0.75), weight: 400 });
    BP.line(ix, 758, 322, 1150, 322, { w: 3, p: seg(p, 0.6, 0.8), seed: 32, col: C.cyan });
    BP.rect(ix, 740, 380, 440, 84, { w: 2.2, p: seg(p, 0.7, 0.85), seed: 33 });
    T(ix, 'FITTED: ORPHEUS 703', 758, 433, 28, { p: seg(p, 0.78, 0.95), weight: 400 });
    BP.line(ix, 758, 452, 1010, 452, { w: 3, p: seg(p, 0.85, 1), seed: 34 });
    BP.leaderBy(ix, 'mj:bayTop', 0, -57, 'ENGINE BAY', { p: seg(p, 0.35, 0.7), seed: 15, side: 'l' });
    L(ix, 'GENERIC SILHOUETTE · NOT TO SCALE', 60, 622, 28, { p: seg(p, 0.85, 1), weight: 400 });
  } };

  // ================= SCENE 2 — IDEA 1 · SQUEEZE =================
  const engine = (ix, p, o) => BP.turbofan(ix, 84, 395, 1.08, Object.assign({ p, id: 'tf', seed: 300 }, o));
  const partLabels = (ix, p) => {
    [['tf:fan', 30, -70, 'FAN'], ['tf:compressor', 30, -125, 'COMPRESSOR'], ['tf:combustor', 30, -70, 'COMBUSTOR'],
      ['tf:turbine', 30, -125, 'TURBINE'], ['tf:nozzle', -30, -70, 'NOZZLE']].forEach(([a, dx, dy, txt], i) =>
      BP.leaderBy(ix, a, dx, dy, txt, { p: seg(p, 0.35 + i * 0.08, 0.6 + i * 0.08), seed: 20 + i * 2 }));
  };
  PANELS['2.1'] = { draw(ix, p) {
    engine(ix, seg(p, 0, 0.55), { flow: seg(p, 0.55, 1) });
    T(ix, 'IDEA 1 · SQUEEZE', 60, 160, 56, { p: seg(p, 0, 0.35) });
    partLabels(ix, p);
    L(ix, 'CONCEPTUAL · NOT TO SCALE', 60, 622, 28, { p: seg(p, 0.7, 1), weight: 400 });
  } };

  PANELS['2.2'] = { draw(ix, p) {
    engine(ix, 1, { flow: 1 });
    T(ix, 'IDEA 1 · SQUEEZE', 60, 160, 56, { p: 1 });
    partLabels(ix, 1);
    const r = H.rng(5);
    BP.rect(ix, 120, 520, 200, 90, { w: 2, p: seg(p, 0, 0.3), seed: 41 });
    BP.rect(ix, 700, 520, 200, 90, { w: 2, p: seg(p, 0.3, 0.55), seed: 42 });
    for (let i = 0; i < 14; i++) { const x = r.range(132, 308), y = r.range(532, 598); if (seg(p, 0.05, 0.3) > i / 14) BP.dot(ix, x, y, 2.6, C.ink, 0.9); }
    for (let i = 0; i < 70; i++) { const x = r.range(712, 888), y = r.range(532, 598); if (seg(p, 0.35, 0.8) > i / 70) BP.dot(ix, x, y, 2.6, C.ink, 0.9); }
    BP.arrow(ix, 340, 565, 680, 565, { w: 2.4, p: seg(p, 0.3, 0.6), seed: 43 });
    L(ix, 'STAGE AFTER STAGE', 510, 545, 28, { align: 'center', p: seg(p, 0.5, 0.8), weight: 400 });
    L(ix, 'AIR IN', 220, 640, 28, { align: 'center', p: seg(p, 0.15, 0.4), weight: 400 });
    L(ix, 'SQUEEZED', 800, 640, 28, { align: 'center', p: seg(p, 0.7, 1), weight: 400 });
  } };

  PANELS['2.3'] = { draw(ix, p) {
    head(ix, 'ONE FLAWED BLADE', seg(p, 0, 0.4), 160);
    const cascade = (x0, flawed, pp) => {
      BP.rect(ix, x0, 215, 500, 350, { w: 1.6, col: C.cyan, p: seg(pp, 0, 0.3), seed: x0, a: 0.8 });
      for (let b = 0; b < 4; b++) {
        const y = 270 + b * 80, bad = flawed && b === 1;
        BP.poly(ix, [[x0 + 230, y], [x0 + 262, y - 6], [x0 + 276, y + 30], [x0 + 246, y + 34]], { close: true, w: bad ? 1.4 : 2.2, dash: bad ? [6, 6] : null, col: bad ? C.red : C.ink, p: seg(pp, 0.1 + b * 0.05, 0.4 + b * 0.05), seed: 60 + b });
      }
      for (let b = 0; b < 5; b++) {
        const y = 245 + b * 80, q = seg(pp, 0.4 + b * 0.04, 0.8), stallY = flawed && b >= 1 && b <= 2;
        if (!stallY) BP.poly(ix, [[x0 + 14, y], [x0 + 200, y], [x0 + 300, y + 4], [x0 + 486, y + 4]], { w: 1.6, col: C.cyan, p: q, seed: 70 + b, j: 0 });
        else { // flow separates and curls into eddies
          BP.poly(ix, [[x0 + 14, y], [x0 + 200, y], [x0 + 232, y - 14]], { w: 1.6, col: C.cyan, p: q, seed: 70 + b, j: 0 });
          const ec = [x0 + 300, y + 36 * (b - 1.5)], sp = BP.now == null ? 0 : BP.now * 2.4 * (b === 1 ? 1 : -1); // eddies turn
          BP.arc(ix, ec[0], ec[1], 26, sp, sp + Math.PI * 1.5, { w: 1.8, col: C.cyan, p: seg(q, 0.4, 1), seed: 80 + b });
          BP.arc(ix, ec[0], ec[1], 14, sp + 1, sp + 1 + Math.PI * 1.4, { w: 1.4, col: C.cyan, p: seg(q, 0.5, 1), seed: 90 + b, a: 0.8 });
        }
      }
    };
    cascade(90, false, seg(p, 0.1, 0.6)); cascade(690, true, seg(p, 0.4, 0.95));
    L(ix, 'NORMAL', 340, 612, 28, { align: 'center', p: seg(p, 0.5, 0.7), weight: 400 });
    T(ix, 'STALL', 940, 612, 44, { align: 'center', p: seg(p, 0.85, 1), col: C.red });
  } };

  // ================= SCENE 3 — IDEA 2 · HEAT =================
  PANELS['3.1'] = { draw(ix, p) {
    engine(ix, 1, { flow: 1, heat: seg(p, 0.1, 0.5), a: 0.8 });
    T(ix, 'IDEA 2 · HEAT', 60, 160, 56, { p: seg(p, 0, 0.3) });
    BP.leaderBy(ix, 'tf:turbineBlade', 40, -130, 'TURBINE BLADE', { p: seg(p, 0.3, 0.6), seed: 22 });
    // two bars on one scale: what the metal can take, and the gas it sees
    L(ix, 'METAL LIMIT', 130, 508, 28, { p: seg(p, 0.5, 0.65), weight: 400, plate: false });
    BP.rect(ix, 400, 480, 360, 36, { w: 2, p: seg(p, 0.5, 0.7), seed: 51, col: C.cyan });
    L(ix, 'GAS', 130, 568, 28, { p: seg(p, 0.6, 0.75), weight: 400, plate: false });
    BP.rect(ix, 400, 540, 360, 36, { w: 2, p: seg(p, 0.6, 0.8), seed: 52, col: C.orange });
    BP.rect(ix, 760, 540, 150, 36, { w: 2, p: seg(p, 0.8, 1), seed: 53, col: C.orange });
    BP.line(ix, 760, 460, 760, 600, { w: 1.6, dash: [8, 6], col: C.ink, p: seg(p, 0.75, 0.95), seed: 54 });
    L(ix, 'HOTTER THAN MELTING', 400, 628, 28, { p: seg(p, 0.9, 1), weight: 400 });
  } };

  PANELS['3.2'] = { draw(ix, p) {
    BP.blade(ix, 420, 375, 1.6, { p: seg(p, 0, 0.45), crystal: seg(p, 0.35, 0.65), cool: seg(p, 0.7, 1), id: 'bl', seed: 500 });
    T(ix, 'SINGLE-CRYSTAL BLADE', 1190, 160, 44, { align: 'right', p: seg(p, 0.1, 0.45) });
    BP.micro(ix, 640, 250, 220, 190, { p: seg(p, 0.2, 0.5), kind: 'grains', seed: 7 });
    BP.micro(ix, 940, 250, 220, 190, { p: seg(p, 0.45, 0.75), kind: 'lattice', seed: 8, col: C.ink });
    L(ix, 'MANY GRAINS', 750, 490, 28, { align: 'center', p: seg(p, 0.35, 0.55), weight: 400 });
    L(ix, 'ONE CRYSTAL', 1050, 490, 28, { align: 'center', p: seg(p, 0.65, 0.85), weight: 400 });
    BP.leaderBy(ix, 'bl:hole1', -60, -40, 'COOLING AIR', { p: seg(p, 0.75, 1), seed: 26 });
    L(ix, 'CONCEPTUAL · NOT TO SCALE', 560, 600, 28, { p: seg(p, 0.5, 0.8), weight: 400 });
  } };

  // ================= SCENE 4 — IDEA 3 · PROOF =================
  PANELS['4.1'] = { draw(ix, p) {
    T(ix, 'IDEA 3 · PROOF', 60, 160, 56, { p: seg(p, 0, 0.35) });
    BP.stand(ix, 640, 390, 2.1, { p: seg(p, 0.1, 0.7), id: 'ts', seed: 600, bare: true });
    BP.turbofan(ix, 318, 392, 0.62, { p: seg(p, 0.3, 0.85), id: 'te', seed: 310, flow: seg(p, 0.85, 1) });
    BP.leaderBy(ix, 'te:combustor', 80, -130, 'ENGINE ON A STAND', { p: seg(p, 0.75, 1), seed: 28 });
  } };

  PANELS['4.2'] = { draw(ix, p) {
    T(ix, 'IDEA 3 · PROOF', 60, 160, 56, { p: 1 });
    const n = seg(p, 0.1, 0.85), hours = Math.floor(3217 * H.ease.inOut(n));
    for (let i = 0; i < 120; i++) { const c = i % 12, r = Math.floor(i / 12), on = i / 120 < n; BP.rect(ix, 90 + c * 29, 215 + r * 29, 22, 22, { w: on ? 1.8 : 1, a: on ? 1 : 0.28, col: on ? C.ink : C.cyan, seed: 900 + i, over: false, p: 1 }); }
    T(ix, hours.toLocaleString('en-US'), 520, 345, 120, { weight: 400, hot: 0.4 });
    L(ix, 'TEST HOURS · KAVERI', 520, 410, 28, { p: seg(p, 0.1, 0.4), weight: 400 });
    [['GROUND', 90], ['ALTITUDE', 490], ['FLYING TEST BED', 890]].forEach(([s, x], i) => {
      const q = seg(p, 0.5 + i * 0.15, 0.7 + i * 0.15);
      BP.rect(ix, x, 520, 300, 64, { w: 2, p: q, seed: 910 + i });
      T(ix, s, x + 150, 560, 28, { align: 'center', p: seg(q, 0.4, 1), weight: 400 });
      if (i < 2) BP.arrow(ix, x + 308, 552, x + 392, 552, { w: 2, p: q, seed: 920 + i });
    });
  } };

  // ================= SCENE 5 — INDIA =================
  const yx = (yr) => 100 + (yr - 1980) * 21.6;
  PANELS['5.1'] = { draw(ix, p) {
    T(ix, 'NOW, INDIA', 60, 160, 56, { p: seg(p, 0, 0.3) });
    BP.line(ix, 100, 390, 1180, 390, { w: 2.4, p: seg(p, 0, 0.4), seed: 71 });
    for (let y = 1980; y <= 2030; y += 5) {
      const big = y % 10 === 0;
      BP.line(ix, yx(y), 390 - (big ? 14 : 8), yx(y), 390, { w: 1.6, p: seg(p, 0.1, 0.4), seed: 72 + y });
      if (big) L(ix, String(y), yx(y), 358, 28, { align: 'center', p: seg(p, 0.2, 0.45), weight: 400, plate: false });
    }
    [1983, 1989, 2025, 2026].forEach((y) => BP.pt('y' + y, yx(y), 390));
    BP.leaderTo(ix, 'y1983', 190, 250, 'LCA SANCTIONED', { p: seg(p, 0.35, 0.6), seed: 30, side: 'r' });
    BP.leaderTo(ix, 'y1989', 330, 500, 'KAVERI SANCTIONED', { p: seg(p, 0.45, 0.7), seed: 32, side: 'r' });
    BP.leaderTo(ix, 'y2025', 1060, 300, 'DRY ENGINE SANCTIONED', { p: seg(p, 0.6, 0.85), seed: 34, side: 'l' });
    BP.leaderTo(ix, 'y2026', 1100, 230, 'AFTERBURNER TEST', { p: seg(p, 0.7, 0.95), seed: 36, side: 'l' });
    if (BP.now != null && p > 0.6) BP.dot(ix, 100 + ((BP.now * 70) % 1080), 390, 4, C.hot, 0.9, true);
    const [ax, ay] = BP.ref('y1983'), [bx] = BP.ref('y2026');
    BP.dim(ix, ax, ay, bx, ay, '43 YEARS', 200, { p: seg(p, 0.75, 1), seed: 38, size: 64, w: 1.8 });
  } };

  PANELS['5.2'] = { draw(ix, p) {
    T(ix, 'CAN', 90, 190, 96, { p: seg(p, 0, 0.3), hot: 0.6 });
    [['9 PROTOTYPE ENGINES', 290], ['3,217 TEST HOURS', 370], ['FLIGHT-TESTED ON A TEST AIRCRAFT', 450], ['DRY VERSION FOR AN UNMANNED JET', 530]].forEach(([s, y], i) => {
      const q = seg(p, 0.2 + i * 0.15, 0.45 + i * 0.15);
      tick(ix, 100, y - 8, seg(q, 0, 0.5), 940 + i, C.cyan);
      T(ix, s, 160, y, 36, { p: seg(q, 0.3, 1), weight: 400 });
    });
    BP.turbofan(ix, 760, 232, 0.4, { p: seg(p, 0.3, 0.8), id: 'kv', seed: 330, flow: seg(p, 0.8, 1) });
    L(ix, 'CONCEPTUAL ENGINE', 968, 312, 28, { align: 'center', p: seg(p, 0.7, 0.95), weight: 400 });
    L(ix, 'SOURCE: PIB, 2012 AND 2021', 60, 622, 28, { p: seg(p, 0.8, 1), weight: 400 });
  } };

  PANELS['5.3'] = { draw(ix, p) {
    T(ix, 'CANNOT YET', 90, 190, 96, { p: seg(p, 0, 0.3), hot: 0.6 });
    L(ix, 'TEJAS NEEDED', 90, 262, 28, { p: seg(p, 0.15, 0.3), weight: 400 });
    BP.rect(ix, 90, 280, 700, 40, { w: 2.2, p: seg(p, 0.15, 0.4), seed: 81 });
    L(ix, 'KAVERI', 90, 352, 28, { p: seg(p, 0.35, 0.5), weight: 400 });
    BP.rect(ix, 90, 370, 500, 40, { w: 2.2, p: seg(p, 0.35, 0.6), seed: 82, col: C.cyan });
    BP.dim(ix, 590, 410, 790, 410, 'SHORTFALL', 36, { p: seg(p, 0.55, 0.8), seed: 83, size: 28 });
    BP.jet(ix, 1000, 500, 1.7, 0, { p: seg(p, 0.65, 0.9), fill: true, id: 'tj', seed: 84 });
    BP.leaderTo(ix, 'tj:engine', 900, 590, 'GE F404 · USA', { p: seg(p, 0.85, 1), seed: 85, side: 'l' });
    L(ix, 'CONCEPTUAL · NOT TO SCALE', 60, 622, 28, { p: seg(p, 0.5, 0.8), weight: 400 });
  } };

  PANELS['5.4'] = { draw(ix, p) {
    BP.stamp(ix, 'WORK: NOT WASTED', 360, 300, 36, { p: seg(p, 0.05, 0.45), seed: 91 });
    BP.stamp(ix, 'GOAL: NOT REACHED', 920, 300, 36, { p: seg(p, 0.4, 0.8), seed: 92 });
    tick(ix, 346, 225, seg(p, 0.3, 0.5), 960, C.cyan);
    BP.circle(ix, 920, 212, 22, { w: 2.4, p: seg(p, 0.75, 0.95), seed: 961 });
    head(ix, 'BOTH CAN BE TRUE', seg(p, 0.75, 1), 500, 72);
  } };

  // ================= SCENE 6 — THE FIELD =================
  const STAGES = [ // bottom to top; India rows carry the accent
    ['1 BUY', 'F404 FOR TEJAS', true], ['2 LICENCE-BUILD', 'HAL KORAPUT · AL-31FP', true], ['3 CO-DEVELOP', 'SAFRAN + GTRE · ANNOUNCED', true],
    ['4 DESIGN + FLIGHT-TEST', 'KAVERI · INDIA', true], ['5 NEWER, AT SCALE', 'ENTERED LATER', false], ['6 MANY GENERATIONS', 'EJ200 · F135 · F414 · M88', false],
  ];
  const stageRows = (ix, p, hi) => {
    STAGES.forEach(([name, ex, india], i) => {
      const y = 566 - i * 62, q = seg(p, i * 0.13, i * 0.13 + 0.25), dim = hi ? (india ? 1 : 0.4) : 1;
      BP.line(ix, 90, y + 18, 1170, y + 18, { w: 1.2, col: C.cyan, a: 0.5 * dim, p: q, seed: 1000 + i });
      T(ix, name, 90, y, 28, { p: seg(q, 0.2, 1), weight: 600, col: india && hi ? C.cyan : C.ink, a: dim });
      T(ix, ex, 600, y, 28, { p: seg(q, 0.4, 1), weight: 400, col: india && hi ? C.cyan : C.ink, a: dim });
    });
  };
  PANELS['6.1'] = { draw(ix, p) {
    head(ix, 'NOT A LEAGUE TABLE', seg(p, 0, 0.2), 150);
    stageRows(ix, seg(p, 0.1, 1), false);
    L(ix, 'STAGES OF CAPABILITY · EXAMPLES ONLY', 60, 628, 28, { p: seg(p, 0.7, 1), weight: 400 });
  } };
  PANELS['6.2'] = { draw(ix, p) {
    head(ix, 'NOT A LEAGUE TABLE', 1, 150);
    stageRows(ix, 1, true);
    BP.arrow(ix, 1210, 590, 1210, 230, { w: 2.2, p: seg(p, 0, 0.6), seed: 1100, col: C.cyan });
    L(ix, 'STAGES OF CAPABILITY · EXAMPLES ONLY', 60, 628, 28, { p: 1, weight: 400 });
  } };

  // ================= SCENE 7 — WHAT IF =================
  PANELS['7.1'] = { draw(ix, p) {
    BP.stamp(ix, 'FICTIONAL SCENARIO', CX, 150, 44, { p: seg(p, 0, 0.35), seed: 95 });
    BP.line(ix, 100, 440, 1180, 440, { w: 2.4, p: seg(p, 0.1, 0.5), seed: 96 });
    BP.line(ix, 100, 540, 1180, 540, { w: 2.4, p: seg(p, 0.15, 0.55), seed: 97 });
    BP.line(ix, 100, 490, 1180, 490, { w: 1.4, dash: [28, 18], col: C.cyan, p: seg(p, 0.2, 0.6), seed: 98 });
    [300, 520, 740, 960].forEach((x, i) => BP.jet(ix, x, 490, 1.0, 0, { p: seg(p, 0.4 + i * 0.1, 0.65 + i * 0.1), fill: true, id: 'rj' + i, seed: 200 + i }));
    const r = seg(p, 0.6, 1);
    [24, 44, 64].forEach((rad, i) => BP.circle(ix, 1090, 290, rad * seg(r, i * 0.15, 0.7 + i * 0.1) * (BP.now == null ? 1 : 1 + 0.1 * Math.sin(BP.now * 3 + i)), { col: C.red, a: 0.8 - i * 0.2, w: 2, seed: 140 + i }));
    T(ix, 'ALERT', 1090, 395, 44, { align: 'center', p: seg(r, 0.5, 1), col: C.red });
  } };

  PANELS['7.2'] = { draw(ix, p) {
    BP.stamp(ix, 'FICTIONAL SCENARIO', CX, 150, 44, { p: 1, seed: 95 });
    const path = [[180, 470], [420, 370], [700, 290], [940, 330], [1100, 470]];
    BP.poly(ix, path, { w: 2.4, p: seg(p, 0, 0.8), seed: 110, j: 0, pen: true });
    BP.line(ix, 100, 500, 1180, 500, { w: 1.6, p: 1, seed: 111 });
    [[0, 'LAUNCH', 180, 470, 'r'], [2, 'PERFORM', 700, 290, 'l'], [4, 'RETURN', 1100, 470, 'l']].forEach(([i, txt, x, y, side], k) => {
      const q = seg(p, 0.15 + k * 0.28, 0.4 + k * 0.28);
      BP.circle(ix, x, y, 14, { w: 2.2, p: q, seed: 112 + k });
      BP.pt('ev' + k, x, y);
      BP.leaderBy(ix, 'ev' + k, side === 'r' ? 40 : -40, k === 1 ? -80 : 55, txt, { p: q, seed: 120 + k * 2, side });
    });
    head(ix, 'THE ENGINE DECIDES', seg(p, 0.7, 1), 625, 56);
  } };

  PANELS['7.3'] = { draw(ix, p) {
    BP.stamp(ix, 'FICTIONAL SCENARIO', CX, 150, 44, { p: 1, seed: 95 });
    for (let i = 0; i < 6; i++) BP.jet(ix, 200 + i * 170, 290, 0.9, 0, { p: seg(p, 0, 0.3), fill: i < 4, id: 'sj' + i, seed: 220 + i, a: i < 4 ? 1 : 0.35 });
    L(ix, 'READY TOMORROW', 90, 400, 28, { p: seg(p, 0.2, 0.45), weight: 400 });
    for (let i = 0; i < 6; i++) {
      const x = 130 + i * 170, q = seg(p, 0.35 + i * 0.06, 0.55 + i * 0.06);
      BP.rect(ix, x, 470, 120, 70, { w: 1.8, p: q, seed: 230 + i, col: i < 4 ? C.ink : C.cyan, a: i < 4 ? 1 : 0.45 });
      BP.circle(ix, x + 60, 505, 22, { w: 1.6, p: q, seed: 240 + i, col: i < 4 ? C.ink : C.cyan, a: i < 4 ? 1 : 0.45 });
    }
    head(ix, 'SPARES DECIDE TOMORROW', seg(p, 0.6, 1), 610, 44);
  } };

  // ================= SCENE 8 — SUNK COST =================
  PANELS['8.1'] = { draw(ix, p) {
    T(ix, 'SUNK COST', 60, 170, 80, { p: seg(p, 0, 0.35), hot: 0.5 });
    BP.coins(ix, 300, 560, 26, 5, { p: seg(p, 0.1, 0.6), id: 'pile' });
    BP.circle(ix, 820, 440, 22, { w: 2.4, p: seg(p, 0.5, 0.7), seed: 1200 });
    BP.pt('now', 820, 440); BP.pt('pileTop', ...BP.ref('pile:top'));
    BP.arrow(ix, 786, 470, 440, 530, { w: 2, dash: [10, 8], col: C.cyan, p: seg(p, 0.65, 0.9), seed: 1201 });
    L(ix, 'I ALREADY PAID', 760, 340, 28, { p: seg(p, 0.75, 1), weight: 400 });
    BP.leaderBy(ix, 'pile:top', 90, -70, 'THE PAST', { p: seg(p, 0.6, 0.85), seed: 1202 });
  } };

  PANELS['8.2'] = { draw(ix, p) {
    BP.coins(ix, 300, 560, 26, 5, { p: 1, id: 'pile', a: 0.8 });
    T(ix, 'ABOUT 2,000 CRORE RUPEES', 640, 200, 56, { align: 'center', p: seg(p, 0.1, 0.7), hot: 0.4 });
    L(ix, 'INTO KAVERI', 640, 270, 28, { align: 'center', p: seg(p, 0.6, 0.9), weight: 400 });
    L(ix, 'SOURCE: PIB, 2021', 60, 622, 28, { p: seg(p, 0.8, 1), weight: 400 });
  } };

  PANELS['8.3'] = { draw(ix, p) {
    BP.coins(ix, 300, 560, 26, 5, { p: 1, id: 'pile', a: 0.8 });
    BP.line(ix, 470, 250, 470, 610, { w: 4, p: seg(p, 0, 0.4), seed: 1300 });
    BP.pt('wall', 470, 430);
    BP.leaderTo(ix, 'wall', 560, 330, 'THE PAST', { p: seg(p, 0.3, 0.55), seed: 1301, side: 'r' });
    T(ix, 'NO REASON TO CONTINUE', 560, 470, 36, { p: seg(p, 0.5, 0.75), weight: 400 });
    T(ix, 'NOR TO STOP', 560, 530, 36, { p: seg(p, 0.75, 1), weight: 400 });
  } };

  PANELS['8.4'] = { draw(ix, p) {
    BP.pt('node', 360, 400); BP.circle(ix, 360, 400, 20, { w: 2.4, p: seg(p, 0, 0.2), seed: 1400 });
    T(ix, 'THE NEXT RUPEE', 360, 250, 44, { align: 'center', p: seg(p, 0.05, 0.4) });
    BP.pt('a', 780, 300); BP.pt('b', 780, 500);
    BP.poly(ix, [[380, 392], [560, 340], [760, 300]], { w: 2.4, p: seg(p, 0.25, 0.55), seed: 1401, j: 0 });
    BP.poly(ix, [[380, 408], [560, 460], [760, 500]], { w: 2.4, p: seg(p, 0.25, 0.55), seed: 1402, j: 0, col: C.cyan });
    BP.line(ix, 780, 270, 780, 330, { w: 5, p: seg(p, 0.55, 0.7), seed: 1403 });
    BP.arrow(ix, 800, 500, 960, 500, { w: 2.4, p: seg(p, 0.55, 0.8), seed: 1404, col: C.cyan });
    T(ix, 'TEJAS · NOT MET', 800, 310, 28, { p: seg(p, 0.65, 0.85), weight: 400 });
    T(ix, 'DRY ENGINE', 990, 510, 28, { p: seg(p, 0.75, 0.95), weight: 600, col: C.cyan });
    L(ix, 'TECHNOLOGY CARRIED FORWARD', 640, 580, 28, { p: seg(p, 0.85, 1), weight: 400 });
  } };

  // ================= SCENE 9 — THE QUESTION =================
  PANELS['9.1'] = { cam: (p) => ({ x: 640, y: 360, z: 1 + 0.03 * p }), draw(ix, p) {
    BP.jet(ix, 640, 400, 3.8, 0, { p: seg(p, 0, 0.6), constr: true, fill: true, id: 'jet', seed: 180, bay: true });
    head(ix, 'INDIA BUILT THE FIGHTER', seg(p, 0.2, 0.7));
    BP.leaderBy(ix, 'jet:bayTop', 0, -76, 'THE HARDER HALF', { p: seg(p, 0.65, 1), seed: 14, side: 'l' });
  } };

  PANELS['9.2'] = { cam: (p) => ({ x: 640, y: 360, z: 1.03 + 0.02 * p }), draw(ix, p) {
    BP.jet(ix, 640, 400, 3.8, 0, { p: 1, constr: true, fill: true, id: 'jet', seed: 180, a: 0.4 });
    BP.rect(ix, 427, 366, 182, 68, { w: 2, p: seg(p, 0, 0.35), seed: 1500, col: C.ink, dash: [10, 8], march: 14 }); // the engine bay, exactly
    BP.rect(ix, 458, 386, 120, 28, { w: 1.6, p: seg(p, 0.3, 0.6), seed: 1501, col: C.cyan });           // a blank nameplate
    head(ix, 'WHOSE NAME WILL BE ON IT?', seg(p, 0.15, 0.85), 160, 56);
  } };

  PANELS['9.3'] = { draw(ix, p) {
    T(ix, 'THE FIGHTER ENGINE', CX, 340, 80, { align: 'center', p: seg(p, 0, 0.5), hot: 0.6 });
    BP.line(ix, 240, 380, 1040, 380, { w: 2.4, p: seg(p, 0.3, 0.7), seed: 1600 });
    T(ix, 'EPISODE 02 · THE MACHINES THAT PROTECT INDIA', CX, 440, 28, { align: 'center', p: seg(p, 0.5, 1), weight: 400 });
  } };
})();
