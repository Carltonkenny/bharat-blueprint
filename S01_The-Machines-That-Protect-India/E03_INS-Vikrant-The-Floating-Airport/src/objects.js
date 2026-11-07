// Conceptual engineering drawings for Episode 2 (BP.* kit). Generic, publicly describable layouts only: no
// dimensions, stage counts, temperatures or thrust values. Each object takes o.p (0..1 ink-in progress) and registers
// named anchors (BP.pt) so labels and leaders can only attach to real points on the drawing.
(function () {
  const BP = window.BP, C = BP.C, seg = BP.seg, lerp = H.lerp;
  const mk = (x, y, s, rot) => {
    const c = Math.cos(rot || 0), sn = Math.sin(rot || 0);
    return { P: (a, b) => [x + (a * c - b * sn) * s, y + (a * sn + b * c) * s] };
  };
  const mir = (arr) => arr.map(([a, b]) => [a, -b]);
  const E = (o, extra) => Object.assign({ seed: o.seed || 1, col: o.col, a: o.a, w: o.w || 2 }, extra);
  const PL = (ctx, m, pts, o, extra) => BP.poly(ctx, pts.map(([a, b]) => m.P(a, b)), E(o, extra));

  // ---------- generic fighter, plan view (no markings). rot = 0 points along +x ----------
  BP.jet = function (ctx, x, y, s, rot, o = {}) {
    const p = o.p == null ? 1 : o.p, m = mk(x, y, s, rot), id = o.id || 'jet';
    const half = [[64, 0], [44, -4], [18, -7], [-30, -8], [-52, -5], [-58, 0]];
    const body = half.concat(mir(half).slice(1, -1).reverse());
    const wing = [[18, -6], [-22, -50], [-36, -50], [-20, -8]], tail = [[-38, -6], [-56, -22], [-64, -22], [-54, -5]];
    const fill = o.fill ? 'rgba(238,246,255,0.14)' : null;
    PL(ctx, m, wing, o, { close: true, p: seg(p, 0, 0.4), seed: 61, fill });
    PL(ctx, m, mir(wing), o, { close: true, p: seg(p, 0, 0.4), seed: 62, fill });
    PL(ctx, m, body, o, { close: true, p: seg(p, 0.3, 0.8), seed: 63, fill });
    PL(ctx, m, tail, o, { close: true, p: seg(p, 0.6, 1), seed: 64, fill });
    PL(ctx, m, mir(tail), o, { close: true, p: seg(p, 0.6, 1), seed: 65, fill });
    if (o.constr) BP.line(ctx, ...m.P(-110, 0), ...m.P(150, 0), E(o, { w: 1.1, dash: [14, 8, 3, 8], march: 20, p: seg(p, 0.5, 1), seed: 66, col: C.cyan }));
    // engine bay: boxed region of the rear fuselage
    if (o.bay) PL(ctx, m, [[-56, -9], [-8, -9], [-8, 9], [-56, 9]], o, { close: true, p: seg(p, 0.7, 1), seed: 67, w: 1.8, col: o.bayCol || C.cyan, dash: o.bayDash, march: o.bayDash ? 14 : 0 });
    BP.pt(id + ':nose', ...m.P(64, 0)); BP.pt(id + ':engine', ...m.P(-32, 0)); BP.pt(id + ':tail', ...m.P(-58, 0));
    BP.pt(id + ':wing', ...m.P(-4, -30));
    BP.pt(id + ':bayTop', ...m.P(-32, -9)); // top edge of the engine bay: the only gap between tail fin and wing root where a leader can leave without crossing the drawing
    return m;
  };

  // ---------- turbofan, side-view cutaway (conceptual, not to scale, no real internals) ----------
  // local x 0..1040, axis at y = 0. h = casing half-height, hr = hub radius.
  const HX = [0, 70, 180, 400, 440, 580, 620, 760, 900, 990, 1040];
  const HH = [36, 62, 62, 42, 50, 50, 42, 46, 40, 26, 30];
  const HR = [0, 14, 14, 30, 26, 26, 26, 22, 10, 6, 0];
  const interp = (xs, ys, x) => { for (let i = 1; i < xs.length; i++) if (x <= xs[i]) return lerp(ys[i - 1], ys[i], (x - xs[i - 1]) / (xs[i] - xs[i - 1])); return ys[ys.length - 1]; };
  const hOf = (x) => interp(HX, HH, x), hrOf = (x) => interp(HX, HR, x);
  BP.turbofan = function (ctx, x, y, s, o = {}) {
    const p = o.p == null ? 1 : o.p, m = mk(x, y, s), id = o.id || 'tf', a = o.a;
    const top = HX.map((xx, i) => [xx, -HH[i]]), bot = mir(top);
    PL(ctx, m, top, o, { p: seg(p, 0, 0.35), seed: 301, w: 2.4 });
    PL(ctx, m, bot, o, { p: seg(p, 0, 0.35), seed: 302, w: 2.4 });
    const hubT = HX.map((xx, i) => [xx, -HR[i]]).filter(([xx]) => xx >= 70 && xx <= 900);
    PL(ctx, m, hubT, o, { p: seg(p, 0.15, 0.5), seed: 303, w: 1.6 });
    PL(ctx, m, mir(hubT), o, { p: seg(p, 0.15, 0.5), seed: 304, w: 1.6 });
    PL(ctx, m, [[0, 0], [30, -9], [70, -14]], o, { p: seg(p, 0.2, 0.45), seed: 305, w: 1.6 });          // spinner
    PL(ctx, m, [[0, 0], [30, 9], [70, 14]], o, { p: seg(p, 0.2, 0.45), seed: 306, w: 1.6 });
    PL(ctx, m, [[900, -10], [980, 0], [900, 10]], o, { p: seg(p, 0.3, 0.5), seed: 307, w: 1.6 });          // tail cone
    BP.line(ctx, ...m.P(-60, 0), ...m.P(1100, 0), E(o, { w: 1, dash: [16, 8, 3, 8], col: C.cyan, a: 0.7 * (a == null ? 1 : a), p: seg(p, 0.1, 0.4), seed: 308 }));

    const row = (i, xx, len, side, ps, pe, w1, lean) => { // a blade row at local x, from hub to casing (side -1 top, +1 bottom)
      const r0 = hrOf(xx), r1 = hOf(xx) - 3;
      BP.line(ctx, ...m.P(xx, side * r0), ...m.P(xx + (lean || 5), side * (r0 + (r1 - r0) * len)), E(o, { w: w1 || 1.5, p: seg(p, ps, pe), seed: 320 + i * 2 + (side > 0 ? 1 : 0) }));
    };
    let k = 0;
    [100, 128].forEach((xx) => { [-1, 1].forEach((sd) => row(k, xx, 1, sd, 0.4, 0.65, 2, 7)); k++; });               // fan
    for (let i = 0; i < 6; i++) { const xx = 200 + i * 33; [-1, 1].forEach((sd) => { row(k, xx, 1, sd, 0.5 + i * 0.03, 0.7 + i * 0.03, 1.5, 6); row(k + 40, xx + 16, 0.62, sd, 0.5 + i * 0.03, 0.7 + i * 0.03, 1.2, -4); }); k++; } // compressor
    for (let i = 0; i < 2; i++) { const xx = 640 + i * 52; [-1, 1].forEach((sd) => { row(k + 80, xx, 1, sd, 0.7 + i * 0.05, 0.9, 1.8, 6); row(k + 90, xx + 26, 0.7, sd, 0.7 + i * 0.05, 0.9, 1.3, -4); }); k++; } // turbine
    // combustor liner and fuel injectors
    PL(ctx, m, [[450, -38], [575, -38]], o, { p: seg(p, 0.65, 0.85), seed: 360, w: 1.6 });
    PL(ctx, m, [[450, 38], [575, 38]], o, { p: seg(p, 0.65, 0.85), seed: 361, w: 1.6 });
    [-1, 1].forEach((sd, i) => BP.line(ctx, ...m.P(458, sd * 49), ...m.P(458, sd * 34), E(o, { w: 2, p: seg(p, 0.8, 0.95), seed: 362 + i })));
    // afterburner spray bars and nozzle
    [820, 850].forEach((xx, i) => [-1, 1].forEach((sd) => BP.line(ctx, ...m.P(xx, sd * (hOf(xx) - 2)), ...m.P(xx, sd * (hOf(xx) - 16)), E(o, { w: 1.5, p: seg(p, 0.85, 1), seed: 370 + i * 2 + (sd > 0) }))));
    [-1, 1].forEach((sd, i) => BP.line(ctx, ...m.P(990, sd * 26), ...m.P(1040, sd * 30), E(o, { w: 2, p: seg(p, 0.85, 1), seed: 380 + i })));

    // anchors on the top casing (leaders attach here)
    BP.pt(id + ':fan', ...m.P(115, -62)); BP.pt(id + ':compressor', ...m.P(290, -52)); BP.pt(id + ':combustor', ...m.P(510, -50));
    BP.pt(id + ':turbine', ...m.P(665, -44)); BP.pt(id + ':nozzle', ...m.P(1010, -28)); BP.pt(id + ':axisIn', ...m.P(-60, 0)); BP.pt(id + ':axisOut', ...m.P(1100, 0));
    BP.pt(id + ':turbineBlade', ...m.P(692, -32)); BP.pt(id + ':compBlade', ...m.P(398, -20));
    BP.pt(id + ':compTop', ...m.P(290, -hOf(290)));

    // airflow: streamlines squeeze through the compressor (concept); dots travel along them
    const fl = o.flow == null ? 0 : o.flow;
    if (fl > 0) {
      [0.18, 0.4, 0.62, 0.84].forEach((f, i) => [-1, 1].forEach((sd, j) => {
        const pts = []; for (let xx = -60; xx <= 1100; xx += 20) { const xe = Math.max(0, Math.min(xx, 1040)); pts.push(m.P(xx, sd * (hrOf(xe) + (hOf(xe) - hrOf(xe)) * f * (xx > 1040 ? 1 + (xx - 1040) / 80 : 1)))); }
        BP.poly(ctx, pts, { j: 0, w: 1.3, col: C.cyan, a: 0.55 * (a == null ? 1 : a), p: fl, seed: 400 + i * 2 + j, bleed: false });
        if (fl >= 1 && BP.now != null) { const ph = (BP.now * 0.22 + i * 0.23 + j * 0.11) % 1, idx = Math.min(pts.length - 1, Math.floor(ph * (pts.length - 1))); BP.dot(ctx, pts[idx][0], pts[idx][1], 3.2, C.ink, 0.9 * (a == null ? 1 : a)); }
      }));
    }
    // heat: combustor and turbine glow (orange is reserved for heat)
    const ht = o.heat == null ? 0 : o.heat;
    if (ht > 0) {
      const g = ctx.createLinearGradient(...m.P(440, 0), ...m.P(780, 0));
      g.addColorStop(0, `rgba(255,155,61,${0.40 * ht})`); g.addColorStop(0.5, `rgba(255,91,74,${0.30 * ht})`); g.addColorStop(1, `rgba(255,155,61,${0.10 * ht})`);
      ctx.save(); ctx.fillStyle = g; ctx.beginPath();
      [[440, -50], [580, -50], [620, -42], [760, -46], [760, 46], [620, 42], [580, 50], [440, 50]].forEach(([a1, b1], i) => { const q = m.P(a1, b1); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); });
      ctx.closePath(); ctx.fill(); ctx.restore();
      for (let i = 0; i < 4; i++) { const wob = BP.now == null ? 0 : Math.sin(BP.now * 6 + i * 1.7) * 4;
        BP.poly(ctx, [m.P(470, -22 + i * 14), m.P(500, -26 + i * 14 + wob), m.P(530, -18 + i * 14 - wob), m.P(560, -22 + i * 14)], { j: 0, w: 1.8, col: C.orange, p: ht, seed: 410 + i, bleed: false });
      }
    }
    return m;
  };

  // ---------- turbine blade with optional crystal structure and cooling holes (conceptual) ----------
  BP.blade = function (ctx, x, y, s, o = {}) {
    const p = o.p == null ? 1 : o.p, m = mk(x, y, s), id = o.id || 'bl';
    const air = [[-30, 112], [-22, -110], [-4, -150], [26, -150], [30, -100], [30, 112]];
    const root = [[-34, 120], [-24, 128], [-34, 136], [-24, 144], [-34, 152], [34, 152], [24, 144], [34, 136], [24, 128], [34, 120]];
    const plat = [[-46, 112], [46, 112], [46, 120], [-46, 120]];
    PL(ctx, m, air, o, { p: seg(p, 0, 0.5), seed: 501, w: 2.4 });
    PL(ctx, m, plat, o, { close: true, p: seg(p, 0.4, 0.6), seed: 502, w: 2 });
    PL(ctx, m, root, o, { close: true, p: seg(p, 0.5, 0.75), seed: 503, w: 1.8 });
    const poly = air.map(([a, b]) => m.P(a, b));
    const cr = o.crystal == null ? 0 : o.crystal; // 0 = many grains, 1 = one crystal
    if (p > 0.5) {
      const r = H.rng(77), q = seg(p, 0.5, 1);
      ctx.save(); ctx.beginPath(); poly.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath(); ctx.clip();
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.3; ctx.globalAlpha = 0.7 * (1 - cr) * q; ctx.beginPath();
      for (let i = 0; i < 46; i++) { // grain boundaries: short random polylines
        const a0 = r.range(-40, 40), b0 = r.range(-150, 112), ang = r.range(0, Math.PI * 2), l = r.range(14, 34);
        const p0 = m.P(a0, b0), p1 = m.P(a0 + Math.cos(ang) * l, b0 + Math.sin(ang) * l), p2 = m.P(a0 + Math.cos(ang + 1.9) * l * 1.2, b0 + Math.sin(ang + 1.9) * l * 1.2);
        ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]);
      }
      ctx.stroke(); ctx.restore();
      BP.hatch(ctx, poly, -Math.PI / 3, 9 * s, { a: 0.55 * cr * q, p: 1, col: C.ink, w: 1.1 }); // one aligned lattice
    }
    // cooling holes along the leading edge, drawn as exact circles, with air streaming out along the surface
    const ch = o.cool == null ? 0 : o.cool;
    for (let i = 0; i < 6; i++) {
      const by = -118 + i * 30, bx = -23 + (i % 2) * 1.5 + (by < -100 ? 8 : 0), c = m.P(bx, by);
      BP.pt(id + ':hole' + i, c[0], c[1]);
      BP.circle(ctx, c[0], c[1], 3.2 * s, { w: 1.4, p: seg(p, 0.7, 1), seed: 510 + i, col: C.ink });
      if (ch > 0) BP.arc(ctx, c[0] - 8 * s, c[1], 16 * s, Math.PI * 0.85, Math.PI * 1.3, { w: 1.4, col: C.cyan, p: seg(ch, i / 8, i / 8 + 0.5), seed: 520 + i, a: 0.8 });
    }
    BP.pt(id + ':tip', ...m.P(8, -150)); BP.pt(id + ':root', ...m.P(0, 152)); BP.pt(id + ':surface', ...m.P(30, -20)); BP.pt(id + ':edge', ...m.P(-26, -60));
    return m;
  };

  // ---------- metal micro-structure swatch: irregular grains, or one aligned crystal lattice ----------
  BP.micro = function (ctx, x, y, w, h, o = {}) {
    const p = o.p == null ? 1 : o.p; if (p <= 0) return;
    BP.rect(ctx, x, y, w, h, { w: 1.8, p: seg(p, 0, 0.3), seed: o.seed || 1, col: o.col });
    const q = seg(p, 0.3, 1); if (q <= 0) return;
    ctx.save(); ctx.beginPath(); ctx.rect(x + 2, y + 2, w - 4, h - 4); ctx.clip();
    ctx.strokeStyle = o.col || C.cyan; ctx.globalAlpha = 0.85 * q; ctx.lineWidth = 1.4; ctx.beginPath();
    if (o.kind === 'grains') {
      const r = H.rng(o.seed || 3), nx = 6, ny = 6, V = [];
      for (let j = 0; j <= ny; j++) { V.push([]); for (let i = 0; i <= nx; i++) V[j].push([x + (i + (i && i < nx ? r.range(-0.35, 0.35) : 0)) * w / nx, y + (j + (j && j < ny ? r.range(-0.35, 0.35) : 0)) * h / ny]); }
      for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
        if (i < nx) { ctx.moveTo(...V[j][i]); ctx.lineTo(...V[j][i + 1]); }
        if (j < ny) { ctx.moveTo(...V[j][i]); ctx.lineTo(...V[j + 1][i]); }
      }
    } else {
      for (let i = 1; i < 8; i++) { ctx.moveTo(x + (i * w) / 8, y); ctx.lineTo(x + (i * w) / 8, y + h); }
      for (let j = 1; j < 8; j++) { ctx.moveTo(x, y + (j * h) / 8); ctx.lineTo(x + w, y + (j * h) / 8); }
    }
    ctx.stroke(); ctx.restore();
  };

  // ---------- engine test cell: engine on a stand, intake and exhaust ducts, instrumentation cabinet ----------
  BP.stand = function (ctx, x, y, s, o = {}) {
    const p = o.p == null ? 1 : o.p, m = mk(x, y, s), id = o.id || 'ts';
    PL(ctx, m, [[-200, 100], [-200, -100], [200, -100], [200, 100]], o, { close: true, p: seg(p, 0, 0.4), seed: 601, w: 2 });
    if (!o.bare) PL(ctx, m, [[-140, 20], [-80, 6], [90, 6], [130, 14], [130, -14], [90, -6], [-80, -6], [-140, -20]], o, { close: true, p: seg(p, 0.3, 0.7), seed: 602, w: 2.2 });
    PL(ctx, m, [[-200, 30], [-140, 20]], o, { p: seg(p, 0.6, 0.8), seed: 603, w: 1.6 });
    PL(ctx, m, [[-200, -30], [-140, -20]], o, { p: seg(p, 0.6, 0.8), seed: 604, w: 1.6 });
    PL(ctx, m, [[130, 14], [200, 40]], o, { p: seg(p, 0.6, 0.8), seed: 605, w: 1.6 });
    PL(ctx, m, [[130, -14], [200, -40]], o, { p: seg(p, 0.6, 0.8), seed: 606, w: 1.6 });
    PL(ctx, m, [[-60, 6], [-60, 40], [60, 40], [60, 6]], o, { p: seg(p, 0.5, 0.8), seed: 607, w: 1.6 });       // stand
    PL(ctx, m, [[-200, 100], [-200, 70], [-120, 70], [-120, 100]], o, { close: true, p: seg(p, 0.7, 0.9), seed: 608, w: 1.6 }); // cabinet
    [[-30, 6], [20, 6], [70, 6]].forEach(([a, b], i) => { const c = m.P(a, b - (o.bare ? 40 : 12)); BP.circle(ctx, c[0], c[1], 4 * s, { w: 1.3, p: seg(p, 0.8, 1), seed: 610 + i }); BP.pt(id + ':sensor' + i, c[0], c[1]);
      if (o.bare) BP.line(ctx, c[0], c[1] + 4 * s, ...m.P(a, b - 21), { w: 1.2, p: seg(p, 0.85, 1), seed: 620 + i }); // sensor lead down to the engine casing
    });
    BP.pt(id + ':engine', ...m.P(0, 0)); BP.pt(id + ':cabinet', ...m.P(-160, 70)); BP.pt(id + ':room', ...m.P(-200, -100));
    return m;
  };

  // ---------- pile of coins (exact circles, hexagonal packing) ----------
  BP.coins = function (ctx, x, y, r, rows, o = {}) {
    const p = o.p == null ? 1 : o.p; let n = 0, total = rows * (rows + 1) / 2;
    for (let row = 0; row < rows; row++) for (let i = 0; i <= row; i++) {
      const cx = x + (i - row / 2) * r * 2.1, cy = y + (row - rows + 1) * r * 1.82;
      const q = seg(p, n / total * 0.8, n / total * 0.8 + 0.2); n++;
      if (q <= 0) continue;
      BP.circle(ctx, cx, cy, r, { w: 2, p: q, seed: 700 + n, col: o.col, a: o.a });
      BP.circle(ctx, cx, cy, r * 0.62, { w: 1.2, p: q, seed: 800 + n, col: o.col, a: (o.a == null ? 1 : o.a) * 0.8 });
    }
    BP.pt((o.id || 'coins') + ':top', x, y - (rows - 1) * r * 1.82 - r); BP.pt((o.id || 'coins') + ':base', x, y + r);
  };
})();
