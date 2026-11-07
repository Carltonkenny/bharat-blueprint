// Shared drawing kit for panels: headline, ticks, sea, spinning gear, stick figure, radar scope, cards, bars, strike-through lines.
// Everything is a pure function of its arguments plus M.clock() / M.bt() for motion.
(function () {
  const BP = window.BP, C = BP.C, seg = BP.seg, T = BP.text, L = BP.label, M = BP.M, clamp = H.clamp;
  const K = (BP.K = {});
  const CX = (K.CX = 640);
  K.head = (ix, s, p, y = 150, size = 56, o = {}) => T(ix, s, CX, y, size, Object.assign({ align: 'center', p, hot: 0.5 }, o));
  K.tick = (ix, x, y, p, seed, col) => BP.poly(ix, [[x, y], [x + 11, y + 12], [x + 32, y - 14]], { w: 3, p, seed, col, j: 0 });
  K.FIX = { cam: () => ({ x: 640, y: 360, z: 1 }) };                       // fixed camera: identical drawings cross-fade without ghosting
  K.sine = (x0, x1, y, amp, ph, n = 60) => Array.from({ length: n + 1 }, (_, i) => { const x = x0 + (x1 - x0) * i / n; return [x, y + Math.sin(x / 38 + ph) * amp]; });
  K.waves = (ix, x0, x1, y, p, seed, a = 1) => BP.poly(ix, K.sine(x0, x1, y, 5, M.clock() * 1.2), { w: 1.8, col: C.cyan, p, seed, j: 0, a });
  K.sea = (ix, y, p, seed) => { K.waves(ix, 60, 1220, y, seg(p, 0.3, 0.7), seed); K.waves(ix, 60, 1220, y + 28, seg(p, 0.35, 0.75), seed + 1, 0.55); };
  K.dashPath = (ix, f, p, seed) => BP.poly(ix, Array.from({ length: 41 }, (_, i) => { const q = f(i / 40); return [q.x, q.y]; }), { w: 1.4, col: C.cyan, p, seed, j: 0, dash: [10, 8], a: 0.7 });
  K.gear = (ix, cx, cy, r, ang, seed, a = 1) => {                          // spinning gear / rotor / wheel
    BP.circle(ix, cx, cy, r, { w: 1.8, seed, a });
    for (let i = 0; i < 3; i++) { const q = ang + i * Math.PI / 3; BP.line(ix, cx - Math.cos(q) * r, cy - Math.sin(q) * r, cx + Math.cos(q) * r, cy + Math.sin(q) * r, { w: 1.6, seed: seed + 1 + i, j: 0, a }); }
  };
  // stick figure: (x, y) = feet. o: s scale, ph walk phase, arms 0..1 (0 down, 1 raised), face -1/+1, speed 0..1 swing amplitude
  K.person = (ix, x, y, o = {}) => {
    const s = o.s || 1, ph = o.ph || 0, sp = o.speed == null ? 1 : o.speed, f = o.face || 1, p = o.p == null ? 1 : o.p, a = o.a, sd = o.seed || 1;
    const hy = y - 60 * s, sw = Math.sin(ph) * 14 * s * sp, ar = (o.arms || 0) * 38 * s;
    BP.circle(ix, x, hy - 8 * s, 8 * s, { w: 2, p, seed: sd, a });
    BP.line(ix, x, hy, x, y - 28 * s, { w: 2.4, p, seed: sd + 1, a, j: 0 });
    BP.line(ix, x, y - 28 * s, x + sw * f, y, { w: 2.4, p, seed: sd + 2, a, j: 0 }); BP.line(ix, x, y - 28 * s, x - sw * f, y, { w: 2.4, p, seed: sd + 3, a, j: 0 });
    BP.line(ix, x, hy + 6 * s, x + (14 * s + sw * 0.4) * f, hy + 22 * s - ar, { w: 2.2, p, seed: sd + 4, a, j: 0 }); BP.line(ix, x, hy + 6 * s, x - (6 * s + sw * 0.4) * f, hy + 22 * s - ar, { w: 2.2, p, seed: sd + 5, a, j: 0 });
    BP.pt(o.id || 'person', x, hy - 8 * s);
  };
  // radar scope: rings, sweep line with fading trail, blips [{x,y,t0}] (x, y in -1..1), north tick
  K.scope = (ix, cx, cy, r, o = {}) => {
    const p = o.p == null ? 1 : o.p, t = M.clock(), sw = (t * 1.5) % (2 * Math.PI), sd = o.seed || 1;
    BP.circle(ix, cx, cy, r, { w: 2.4, p, seed: sd });
    [0.66, 0.33].forEach((k, i) => BP.circle(ix, cx, cy, r * k, { w: 1.2, p: seg(p, 0.2, 0.8), seed: sd + 1 + i, a: 0.6, col: C.cyan }));
    BP.line(ix, cx - r, cy, cx + r, cy, { w: 1, p: seg(p, 0.2, 0.8), seed: sd + 3, j: 0, a: 0.4, col: C.cyan }); BP.line(ix, cx, cy - r, cx, cy + r, { w: 1, p: seg(p, 0.2, 0.8), seed: sd + 4, j: 0, a: 0.4, col: C.cyan });
    if (p < 0.5) return;
    for (let k = 0; k < 14; k++) { const a = sw - k * 0.06; BP.line(ix, cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r, { w: 3, seed: sd + 5, j: 0, a: (1 - k / 14) * 0.5, col: C.cyan }); }
    BP.line(ix, cx, cy, cx + Math.cos(sw) * r, cy + Math.sin(sw) * r, { w: 2.4, seed: sd + 6, j: 0, col: C.ink });
    (o.blips || []).forEach((b, i) => {
      const ang = Math.atan2(b.y, b.x), da = ((sw - ang) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI), glow = Math.max(0, 1 - da / 4.5);
      if (M.bt() >= (b.t0 || 0)) { BP.dot(ix, cx + b.x * r, cy + b.y * r, 6, b.col || C.ink, 0.25 + 0.75 * glow, true); if (b.ring) BP.circle(ix, cx + b.x * r, cy + b.y * r, 12 + 3 * Math.sin(t * 4), { w: 1.4, seed: sd + 20 + i, col: b.col || C.ink, a: glow }); }
    });
  };
  // outlined card with a big line and a small line
  K.card = (ix, x, y, w, h, big, small, p, seed, o = {}) => {
    BP.rect(ix, x, y, w, h, { w: 2.2, p: seg(p, 0, 0.5), seed, over: false, col: o.col, a: o.a });
    T(ix, big, x + w / 2, y + h * 0.5, o.size || 36, { align: 'center', p: seg(p, 0.3, 0.8), weight: 600 });
    if (small) L(ix, small, x + w / 2, y + h * 0.5 + 40, 28, { align: 'center', p: seg(p, 0.5, 1), weight: 400 });
  };
  // horizontal bar: outline of full width, filled to frac
  K.bar = (ix, x, y, w, h, frac, p, seed, o = {}) => {
    BP.rect(ix, x, y, w, h, { w: 1.6, p: seg(p, 0, 0.4), seed, over: false, dash: [10, 8], col: C.cyan });
    BP.poly(ix, [[x, y], [x + w * frac, y], [x + w * frac, y + h], [x, y + h]], { close: true, w: 2.4, p: seg(p, 0.2, 0.6), seed: seed + 1, fill: o.fill || 'rgba(238,246,255,0.22)', col: o.col, j: 0.3 });
  };
  K.strike = (ix, x0, x1, y, u, seed) => { if (u > 0) BP.line(ix, x0, y, x0 + (x1 - x0) * clamp(u), y, { w: 3, col: C.red, seed, j: 0.4 }); };
  K.fmt = (n) => Math.round(n).toLocaleString('en-US');
  K.source = (ix, s, p, x = 60, y = 640) => L(ix, s, x, y, 28, { p: seg(p, 0.85, 1), weight: 400 });
  K.label = (ix, s, x, y, p, o = {}) => L(ix, s, x, y, o.size || 28, Object.assign({ align: 'center', p, weight: 400 }, o));
})();
