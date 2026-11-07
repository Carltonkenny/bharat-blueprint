// kit-v2: the effects kit. Allowed effects only (VISUAL_DIRECTION section 3).
// Each effect takes (t, params) and is pure.
(function () {
  const BB = (window.BB = window.BB || {});
  const F = (BB.fx = {});
  const clamp = (v, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
  const ease = {
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    out: (t) => 1 - Math.pow(1 - t, 3),
    in: (t) => t * t * t,
    linear: (t) => t,
  };
  F.ease = ease;

  // progress of a draw-on over [t0, t0+dur]
  F.drawOn = (t, t0, dur, easing) => clamp((t - t0) / Math.max(1e-6, dur), 0, 1);
  F.drawOnEased = (t, t0, dur) => ease.out(F.drawOn(t, t0, dur));

  // section / scanline sweep: a vertical sweep line revealing the content.
  F.sectionSweep = function (ctx, W, H, p, T, o = {}) {
    const x = W * p;
    ctx.save();
    ctx.strokeStyle = o.col || T.accent;
    ctx.globalAlpha = o.a == null ? 0.85 : o.a;
    ctx.lineWidth = T.line;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    ctx.globalAlpha = (o.a == null ? 0.85 : o.a) * 0.35;
    ctx.fillStyle = o.col || T.accent;
    ctx.fillRect(x - 26, 0, 26, H);
    ctx.restore();
    return x;
  };

  // glow on the active path only: draw the same path a second time with a bright, wide stroke.
  F.glow = function (ctx, drawFn, amount, col) {
    if (amount <= 0.01) { drawFn(); return; }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowColor = col || '#ffffff';
    ctx.shadowBlur = 26 * amount;
    ctx.globalAlpha = Math.min(1, amount);
    drawFn();
    ctx.restore();
  };

  // depth blur on the background layer only: simulated by drawing the background
  // with a reduced alpha and a soft double stroke.
  F.depthBlur = function (ctx, drawFn, amount) {
    if (amount <= 0.01) { drawFn(); return; }
    ctx.save();
    ctx.globalAlpha = 1 - 0.35 * amount;
    ctx.filter = 'blur(' + (1.2 * amount).toFixed(2) + 'px)';
    drawFn();
    ctx.restore();
  };

  // seeded particle flow. fn(i, u) -> {x, y, r, a} in authoring units.
  F.particles = function (n, seed, fn, t, o = {}) {
    const rnd = BB.mulberry32 ? BB.mulberry32(seed) : Math.random;
    const out = [];
    for (let i = 0; i < n; i++) {
      const u = (i + rnd()) / n;
      const p = fn(i, u, rnd);
      if (!p) continue;
      out.push(p);
    }
    return out;
  };

  // a number that counts up to its final value and then equals it exactly.
  F.counter = function (value, t, t0, dur, o = {}) {
    const p = ease.out(F.drawOn(t, t0, dur));
    const dec = o.decimals == null ? 0 : o.decimals;
    const v = value * p;
    const s = dec > 0 ? v.toFixed(dec) : String(Math.round(v));
    return o.text ? o.text.replace('#', s) : s;
  };

  // a ratio display: "n of m"
  F.ratio = function (t, t0, dur, n, m, o = {}) {
    const p = ease.out(F.drawOn(t, t0, dur));
    const filled = Math.round(n * p);
    return `${filled} OF ${m}`;
  };

  // match-cut morph: two shapes share a primitive, the transform between them is analytic.
  F.matchMorph = function (t, t0, dur, a, b, easing) {
    const p = (easing || ease.inOut)(F.drawOn(t, t0, dur));
    const lerp = (u, v) => u + (v - u) * p;
    return {
      x: lerp(a.x, b.x), y: lerp(a.y, b.y),
      r: lerp(a.r == null ? 0 : a.r, b.r == null ? 0 : b.r),
      rot: lerp(a.rot || 0, b.rot || 0),
      p,
    };
  };

  // a pulsing value used for "?" marks and status dots.
  F.pulse = (t, period, phase) => {
    const u = ((t / period) + (phase || 0)) % 1;
    return 0.5 + 0.5 * Math.cos(u * Math.PI * 2);
  };

  // marching dashes: a held sheet still moves.
  F.march = (t, speed) => -(t * (speed || 30));
})();
