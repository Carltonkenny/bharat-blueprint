// Conceptual engineering drawings of the Akash-NG system elements (BP.* kit).
// Generic, publicly-describable layouts only: no dimensions, internals, ranges or counts that are not public.
// Local units are drawn at scale s; ground is y=0, up is -y. Each object takes o.p (0..1 ink-in progress).
(function () {
  const BP = window.BP, C = BP.C, seg = BP.seg;
  const mk = (x, y, s, rot) => {
    const c = Math.cos(rot || 0), sn = Math.sin(rot || 0);
    const P = (a, b) => [x + (a * c - b * sn) * s, y + (a * sn + b * c) * s];
    return { P, pp: (arr) => arr.map(([a, b]) => P(a, b)) };
  };
  const mir = (arr) => arr.map(([a, b]) => [a, -b]);
  const E = (o, extra) => Object.assign({ seed: o.seed || 1, col: o.col, a: o.a, w: o.w || 2 }, extra);

  function truck(ctx, m, o, pa, pb, cab = true) {
    BP.poly(ctx, m.pp([[-74, -30], [52, -30], [52, -20], [-74, -20]]), E(o, { close: true, p: pa, pen: o.pen }));
    if (cab) {
      BP.poly(ctx, m.pp([[52, -30], [52, -66], [70, -66], [86, -46], [86, -30]]), E(o, { close: true, p: pb, seed: (o.seed || 1) + 1 }));
      BP.poly(ctx, m.pp([[58, -60], [69, -60], [79, -46], [58, -46]]), E(o, { close: true, p: pb, w: 1.4, seed: (o.seed || 1) + 2 }));
    }
    [-56, -26, 62].forEach((wx, i) => {
      const [cx, cy] = m.P(wx, -13);
      BP.circle(ctx, cx, cy, 13 * m.s, E(o, { p: pb, seed: (o.seed || 1) + 3 + i }));
      BP.circle(ctx, cx, cy, 4.5 * m.s, E(o, { p: pb, w: 1.3, seed: (o.seed || 1) + 8 + i }));
    });
  }

  // Multi-function radar: planar phased-array face on a pedestal (conceptual side view + optional front inset)
  BP.radar = function (ctx, x, y, s, o = {}) {
    const p = o.p == null ? 1 : o.p, m = mk(x, y, s); m.s = s;
    truck(ctx, m, o, seg(p, 0, 0.45), seg(p, 0.3, 0.65));
    BP.poly(ctx, m.pp([[-44, -38], [8, -38], [8, -30], [-44, -30]]), E(o, { close: true, p: seg(p, 0.45, 0.6), seed: 11 }));
    BP.poly(ctx, m.pp([[-30, -50], [-6, -50], [-6, -38], [-30, -38]]), E(o, { close: true, p: seg(p, 0.5, 0.65), seed: 12 }));
    BP.poly(ctx, m.pp([[-38, -52], [-22, -52], [-22, -150], [-38, -150]]), E(o, { close: true, p: seg(p, 0.6, 0.9), seed: 13 }));
    BP.line(ctx, ...m.P(-22, -52), ...m.P(8, -38), E(o, { w: 1.4, p: seg(p, 0.7, 0.9), seed: 14 }));
    for (let yy = -60; yy >= -142; yy -= 9) BP.line(ctx, ...m.P(-38, yy), ...m.P(-22, yy), E(o, { w: 1.1, p: seg(p, 0.85, 1), seed: 15 + yy }));
    const ins = m.P(128, -150);
    if (o.front) { // front view of the array face: element grid
      const q = seg(p, 0.7, 1), sz = 66 * s;
      BP.rect(ctx, ins[0] - sz / 2, ins[1] - sz / 2, sz, sz, E(o, { p: q, seed: 21, w: 1.6 }));
      for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
        if ((i * 6 + j) / 36 > q) continue;
        BP.dot(ctx, ins[0] - sz / 2 + sz * (i + 0.5) / 6, ins[1] - sz / 2 + sz * (j + 0.5) / 6, 2.2, o.col, o.a);
      }
    }
    return { face: m.P(-38, -100), top: m.P(-30, -150), inset: ins, P: m.P };
  };

  // Command and Control Unit: shelter on a truck with antennas (no console detail)
  BP.c2 = function (ctx, x, y, s, o = {}) {
    const p = o.p == null ? 1 : o.p, m = mk(x, y, s); m.s = s;
    truck(ctx, m, o, seg(p, 0, 0.4), seg(p, 0.25, 0.6));
    BP.poly(ctx, m.pp([[-72, -30], [-72, -100], [44, -100], [44, -30]]), E(o, { close: true, p: seg(p, 0.35, 0.7), seed: 31 }));
    BP.poly(ctx, m.pp([[-6, -92], [18, -92], [18, -34], [-6, -34]]), E(o, { close: true, p: seg(p, 0.65, 0.8), w: 1.5, seed: 32 }));
    [[-62, -44], [-34, -16]].forEach(([a, b], i) => BP.poly(ctx, m.pp([[a, -86], [b, -86], [b, -72], [a, -72]]), E(o, { close: true, p: seg(p, 0.7, 0.85), w: 1.3, seed: 33 + i })));
    BP.poly(ctx, m.pp([[-60, -100], [-60, -110], [-30, -110], [-30, -100]]), E(o, { close: true, p: seg(p, 0.75, 0.9), w: 1.5, seed: 36 }));
    BP.line(ctx, ...m.P(22, -100), ...m.P(22, -170), E(o, { p: seg(p, 0.8, 1), seed: 37 }));
    [[-150, 10], [-136, 7], [-122, 4]].forEach(([yy, hw], i) => BP.line(ctx, ...m.P(22 - hw, yy), ...m.P(22 + hw, yy), E(o, { w: 1.4, p: seg(p, 0.85, 1), seed: 38 + i })));
    BP.line(ctx, ...m.P(-46, -110), ...m.P(-46, -148), E(o, { w: 1.4, p: seg(p, 0.85, 1), seed: 42 }));
    return { top: m.P(22, -170), body: m.P(-14, -66), P: m.P };
  };

  // Missile Launch Vehicle: truck with an elevated canisterised launcher (canister count deliberately not shown)
  BP.launcher = function (ctx, x, y, s, o = {}) {
    const p = o.p == null ? 1 : o.p, m = mk(x, y, s); m.s = s;
    truck(ctx, m, o, seg(p, 0, 0.4), seg(p, 0.25, 0.55));
    const ang = -55 * Math.PI / 180, d = [Math.cos(ang), Math.sin(ang)], n = [-d[1], d[0]], B = [-58, -36], L = 138, t = 13;
    const at = (f, k) => [B[0] + d[0] * L * f + n[0] * t * k, B[1] + d[1] * L * f + n[1] * t * k];
    BP.poly(ctx, m.pp([at(0, -1), at(1, -1), at(1, 1), at(0, 1)]), E(o, { close: true, p: seg(p, 0.5, 0.9), seed: 51 }));
    [0.34, 0.67].forEach((f, i) => BP.line(ctx, ...m.P(...at(f, -1)), ...m.P(...at(f, 1)), E(o, { w: 1.3, p: seg(p, 0.85, 1), seed: 52 + i })));
    BP.line(ctx, ...m.P(...at(0.5, 0)), ...m.P(...at(0.98, 0)), E(o, { w: 1.1, p: seg(p, 0.85, 1), dash: [8, 6], seed: 55 }));
    BP.line(ctx, ...m.P(-12, -30), ...m.P(...at(0.45, 1)), E(o, { w: 1.6, p: seg(p, 0.6, 0.9), seed: 56 }));
    BP.line(ctx, ...m.P(-74, -20), ...m.P(-96, 0), E(o, { w: 1.6, p: seg(p, 0.8, 1), seed: 57 }));
    BP.line(ctx, ...m.P(-58, -20), ...m.P(-76, 0), E(o, { w: 1.6, p: seg(p, 0.8, 1), seed: 58 }));
    return { muzzle: m.P(...at(1, 0)), top: m.P(...at(1, 0)), P: m.P };
  };

  // Generic jet in plan view (no national markings). rot=0 points along +x.
  BP.aircraft = function (ctx, x, y, s, rot, o = {}) {
    const p = o.p == null ? 1 : o.p, m = mk(x, y, s, rot);
    const half = [[64, 0], [44, -4], [18, -7], [-30, -8], [-52, -5], [-58, 0]];
    const body = half.concat(mir(half).slice(1, -1).reverse());
    const wing = [[18, -6], [-22, -50], [-36, -50], [-20, -8]], tail = [[-38, -6], [-56, -22], [-64, -22], [-54, -5]];
    const fill = o.fill ? 'rgba(238,246,255,0.16)' : null;
    BP.poly(ctx, m.pp(wing), E(o, { close: true, p: seg(p, 0, 0.4), seed: 61, fill }));
    BP.poly(ctx, m.pp(mir(wing)), E(o, { close: true, p: seg(p, 0, 0.4), seed: 62, fill }));
    BP.poly(ctx, m.pp(body), E(o, { close: true, p: seg(p, 0.3, 0.8), seed: 63, fill }));
    BP.poly(ctx, m.pp(tail), E(o, { close: true, p: seg(p, 0.6, 1), seed: 64, fill }));
    BP.poly(ctx, m.pp(mir(tail)), E(o, { close: true, p: seg(p, 0.6, 1), seed: 65, fill }));
    if (o.constr) BP.line(ctx, ...m.P(-110, 0), ...m.P(150, 0), E(o, { w: 1.1, dash: [14, 8, 3, 8], p: seg(p, 0.5, 1), seed: 66, col: C.cyan }));
    return { nose: m.P(64, 0), P: m.P };
  };

  // Interceptor (exterior, optional conceptual section). Tail at local x=0, nose at x=200.
  BP.interceptor = function (ctx, x, y, s, o = {}) {
    const p = o.p == null ? 1 : o.p, m = mk(x, y, s, o.rot); m.s = s;
    const top = [[200, 0], [192, -3], [182, -5.5], [170, -7.6], [158, -8.8], [148, -9], [0, -9]];
    const outline = top.concat(mir(top).reverse().slice(1));
    BP.poly(ctx, m.pp(outline), E(o, { close: true, p: seg(p, 0, 0.55), seed: 71, pen: o.pen }));
    BP.poly(ctx, m.pp([[4, -6], [-9, -11], [-9, 11], [4, 6]]), E(o, { close: true, p: seg(p, 0.5, 0.65), seed: 72, w: 1.8 }));
    const mf = [[122, -9], [108, -23], [98, -23], [104, -9]], tf = [[24, -9], [9, -25], [0, -25], [7, -9]];
    [mf, mir(mf), tf, mir(tf)].forEach((f, i) => BP.poly(ctx, m.pp(f), E(o, { close: true, p: seg(p, 0.55, 0.9), seed: 73 + i, w: 1.8 })));
    [150, 42].forEach((xx, i) => BP.line(ctx, ...m.P(xx, -9), ...m.P(xx, 9), E(o, { w: 1.3, p: seg(p, 0.8, 1), seed: 77 + i })));
    BP.line(ctx, ...m.P(-30, 0), ...m.P(232, 0), E(o, { w: 1, dash: [14, 8, 3, 8], col: C.cyan, a: 0.8, p: seg(p, 0.7, 1), seed: 79 }));
    const sec = o.sec == null ? 0 : o.sec;
    if (sec > 0) { // generic cut-away: seeker region (nose), motor region (aft) - no real internals
      const q = sec;
      BP.poly(ctx, m.pp([[148, -7.2], [14, -7.2], [14, 7.2], [148, 7.2]]), E(o, { close: true, p: seg(q, 0, 0.4), w: 1.4, seed: 81 }));
      const grainU = [[22, -6.4], [140, -6.4], [140, -2.2], [22, -2.2]], grainL = mir(grainU);
      BP.hatch(ctx, m.pp(grainU), Math.PI / 4, 4.5, { p: seg(q, 0.3, 0.9), a: 0.7 });
      BP.hatch(ctx, m.pp(grainL), Math.PI / 4, 4.5, { p: seg(q, 0.3, 0.9), a: 0.7 });
      BP.line(ctx, ...m.P(22, -2.2), ...m.P(140, -2.2), E(o, { w: 1.2, p: seg(q, 0.3, 0.7), seed: 82 }));
      BP.line(ctx, ...m.P(22, 2.2), ...m.P(140, 2.2), E(o, { w: 1.2, p: seg(q, 0.3, 0.7), seed: 83 }));
      BP.arc(ctx, ...m.P(176, 0), 6.5 * s, Math.PI * 0.5, Math.PI * 1.5, E(o, { w: 1.6, p: seg(q, 0.6, 1), seed: 84 }));
      BP.line(ctx, ...m.P(172, -4), ...m.P(172, 4), E(o, { w: 1.2, p: seg(q, 0.7, 1), seed: 85 }));
      [-1, 1].forEach((sg, i) => BP.line(ctx, ...m.P(150, sg * 8.5), ...m.P(150, sg * 8.5), E(o, { p: 0, seed: 86 + i })));
    }
    return { seeker: m.P(176, 0), motor: m.P(80, -7), nozzle: m.P(-9, 0), tail: m.P(0, 0), nose: m.P(200, 0), P: m.P };
  };
})();
