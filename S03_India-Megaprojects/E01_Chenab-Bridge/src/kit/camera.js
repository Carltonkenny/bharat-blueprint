// kit-v2: the camera. Every move is an analytic function of t (no wall clock).
// Authority: 00_SERIES/CAMERA_AND_ZONES_S02.md section 2.
(function () {
  const BB = (window.BB = window.BB || {});
  const C = (BB.camera = {});
  const clamp = (v, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = { inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), out: (t) => 1 - Math.pow(1 - t, 3), linear: (t) => t };

  const base = () => ({ x: 0, y: 0, scale: 1, rot: 0, az: 0, el: 0, dolly: 0, parallax: { bg: 0, mg: 0, fg: 0 } });

  // move: 'hold' | 'push-in' | 'pull-back' | 'orbit' | 'dolly' | 'parallax'
  // u is the progress inside the beat (0..1).
  C.for = function (move, u, o = {}) {
    const c = base();
    const e = (o.easing || ease.inOut)(clamp(u));
    switch (move) {
      case 'push-in': {
        const max = o.amount == null ? 0.18 : o.amount; // <= 25% per second
        c.scale = 1 + max * e;
        break;
      }
      case 'pull-back': {
        const max = o.amount == null ? 0.18 : o.amount;
        c.scale = 1 + max * (1 - e);
        break;
      }
      case 'orbit': {
        const az = (o.az == null ? 30 : o.az) * Math.PI / 180;
        const el = (o.el == null ? 8 : o.el) * Math.PI / 180;
        c.az = az * e;
        c.el = el * e;
        break;
      }
      case 'dolly': {
        const d = (o.amount == null ? 0.18 : o.amount) * e;
        c.dolly = o.reverse ? -d : d;
        break;
      }
      case 'parallax': {
        const shift = (o.amount == null ? 0.03 : o.amount) * e; // <= 4% of W
        c.parallax = { bg: shift * 0.3, mg: shift * 0.7, fg: shift * 1.0 };
        break;
      }
      default: break; // hold
    }
    if (o.x) c.x = o.x * e;
    if (o.y) c.y = o.y * e;
    return c;
  };

  // Interpolate between two camera states (the continuous camera track).
  C.lerp = function (a, b, u) {
    const e = (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
    return {
      x: lerp(a.x || 0, b.x || 0, e), y: lerp(a.y || 0, b.y || 0, e),
      scale: lerp(a.scale == null ? 1 : a.scale, b.scale == null ? 1 : b.scale, e),
      rot: lerp(a.rot || 0, b.rot || 0, e),
      az: lerp(a.az || 0, b.az || 0, e), el: lerp(a.el || 0, b.el || 0, e),
      dist: lerp(a.dist == null ? 1 : a.dist, b.dist == null ? 1 : b.dist, e),
      dolly: 0, parallax: { bg: 0, mg: 0, fg: 0 },
    };
  };

  // Apply a 2D camera to a canvas context: translate to the frame centre, scale, rotate.
  C.apply2d = function (ctx, W, H, c) {
    ctx.save();
    ctx.translate(W / 2 + (c.x || 0), H / 2 + (c.y || 0));
    if (c.scale && c.scale !== 1) ctx.scale(c.scale, c.scale);
    if (c.rot) ctx.rotate(c.rot);
    ctx.translate(-W / 2, -H / 2);
    return c;
  };

  // A 3D camera description for the hero layer.
  C.for3d = function (move, u, o = {}) {
    const e = (o.easing || ease.inOut)(clamp(u));
    const base = o.base == null ? 1 : o.base;
    const c = { az: 0, el: 0, dist: base, x: 0, y: 0 };
    switch (move) {
      case 'orbit':
        c.az = (o.az == null ? 30 : o.az) * Math.PI / 180 * e;
        c.el = (o.el == null ? 8 : o.el) * Math.PI / 180 * e;
        break;
      case 'push-in': c.dist = base * (1 - (o.amount == null ? 0.18 : o.amount) * e); break;
      case 'pull-back': c.dist = base * (1 + (o.amount == null ? 0.18 : o.amount) * e); break;
      case 'dolly': c.dist = base * (1 - (o.amount == null ? 0.15 : o.amount) * e); break;
      default: break;
    }
    return c;
  };
})();
