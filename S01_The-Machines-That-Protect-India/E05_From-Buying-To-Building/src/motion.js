// Motion toolkit shared by every episode. Everything here is a pure function of time, so a frame can be rendered in any order.
// BP.bt is "seconds since this beat started" (set by film.js each frame); in stills it is null and M.bt() returns 99, i.e. the finished state.
(function () {
  const BP = window.BP, C = BP.C, clamp = H.clamp;
  const M = (BP.M = {});
  M.bt = () => (BP.bt == null ? 99 : BP.bt);
  M.at = (id) => (window.TIMING ? window.TIMING.at(id) : 0) - (BP.bs || 0);        // clip start, in seconds from the start of this beat
  M.clock = () => (BP.now == null ? 0 : BP.now);                 // free-running seconds for idle motion (waves, radar, rotors)
  M.ease = {
    io: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    out: (t) => 1 - Math.pow(1 - t, 3),
    in: (t) => t * t * t,
    back: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    lin: (t) => t,
  };
  // keyframes [[t, value], ...] eased between neighbours (per-segment easing can be given as a third entry)
  M.tw = (t, keys, ez) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const [t0, v0] = keys[i - 1], [t1, v1] = keys[i], f = keys[i][2] || ez || M.ease.io;
        return v0 + (v1 - v0) * f(clamp((t - t0) / Math.max(1e-6, t1 - t0)));
      }
    }
    return keys[keys.length - 1][1];
  };
  // polyline path sampled by 0..1 -> {x, y, ang}
  M.path = (pts, smooth = 2) => {
    let q = pts;
    for (let k = 0; k < smooth; k++) { const n = [q[0]]; for (let i = 0; i < q.length - 1; i++) { const a = q[i], b = q[i + 1]; n.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); } n.push(q[q.length - 1]); q = n; }
    const L = [0]; for (let i = 1; i < q.length; i++) L.push(L[i - 1] + Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]));
    const tot = L[L.length - 1];
    return (u) => {
      const d = clamp(u) * tot; let i = 1; while (i < L.length - 1 && L[i] < d) i++;
      const a = q[i - 1], b = q[i], f = (d - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
      return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
    };
  };
  M.spring = (t, k = 16, d = 5) => (t < 0 ? 0 : Math.exp(-d * t) * Math.cos(k * t)); // 1 at t=0, rings down to 0
  M.shake = (t, hits, amp = 5) => hits.reduce((s, h) => (t >= h && t < h + 0.5 ? s + amp * Math.exp(-9 * (t - h)) * Math.sin(70 * (t - h)) : s), 0);
  M.counter = (t, t0, t1, v0, v1) => v0 + (v1 - v0) * M.ease.out(clamp((t - t0) / (t1 - t0)));
  M.hash = (i, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
  // camera helper for PANELS[id].cam(pc): glide from cam a to cam b between beat fractions f0 and f1
  M.cam = (a, b, f0 = 0, f1 = 1) => (pc) => { const u = M.ease.io(clamp((pc - f0) / (f1 - f0))); return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, z: a.z + (b.z - a.z) * u }; };

  // seeded particle stream. o: {t, t0, rate, life, from:(birth)=>[x,y], vx, vy, spread, size, grow, col, a, n, seed, g}
  M.particles = (ix, o) => {
    const n = o.n || Math.ceil(o.rate * o.life * 1.5) + 2, a0 = o.a == null ? 0.8 : o.a;
    ix.save();
    for (let i = 0; i < n; i++) {
      const birth = (o.t0 || 0) + i / o.rate, age = o.t - birth;
      if (age < 0 || age > o.life) continue;
      if (o.until != null && birth > o.until) continue;
      const [x0, y0] = o.from(birth), h1 = M.hash(i, o.seed || 1) - 0.5, h2 = M.hash(i + 99, o.seed || 1) - 0.5;
      const x = x0 + (o.vx || 0) * age + h1 * (o.spread || 0) * (0.3 + age), y = y0 + (o.vy || 0) * age + h2 * (o.spread || 0) * (0.3 + age) + 0.5 * (o.g || 0) * age * age;
      const k = age / o.life;
      ix.globalAlpha = a0 * (1 - k) * (1 - k);
      ix.fillStyle = o.col || C.ink;
      ix.beginPath(); ix.arc(x, y, (o.size || 2) * (1 + (o.grow || 0) * k), 0, 6.2832); ix.fill();
    }
    ix.restore();
  };

  // magnifier: re-draws drawFn zoomed around focus [fx, fy] inside a round window at (cx, cy); a thin leader joins window and focus
  M.inset = (ix, cx, cy, r, focus, zoom, drawFn, o = {}) => {
    const p = o.p == null ? 1 : o.p; if (p <= 0) return;
    BP.line(ix, focus[0], focus[1], cx - r * 0.7, cy + r * 0.7, { w: 1.2, col: C.cyan, p: BP.seg(p, 0, 0.4), seed: (o.seed || 5), a: 0.8 });
    BP.circle(ix, focus[0], focus[1], 14, { w: 1.6, col: C.cyan, p: BP.seg(p, 0, 0.4), seed: (o.seed || 5) + 1 });
    if (p < 0.4) return;
    ix.save();
    ix.beginPath(); ix.arc(cx, cy, r, 0, 6.2832); ix.clip();
    ix.fillStyle = C.plate; ix.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    ix.translate(cx, cy); ix.scale(zoom, zoom); ix.translate(-focus[0], -focus[1]);
    drawFn(ix);
    ix.restore();
    BP.circle(ix, cx, cy, r, { w: 2.4, col: C.cyan, p: BP.seg(p, 0.35, 1), seed: (o.seed || 5) + 2 });
    if (o.label) BP.label(ix, o.label, cx, cy + r + 34, 28, { align: 'center', p: BP.seg(p, 0.7, 1), weight: 400 });
  };
})();
