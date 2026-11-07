// S02 spike composition (ticket S2-T0). Four beat types in ten seconds:
//   a: a Three.js hero (lathe nozzle + chamber) with a moving clipping-plane cutaway
//      and a 2 s explode, and a glow on the throat
//   b: a line figure doing "pump" with a bicycle-pump prop
//   c: a flat beat with draw-on strokes and three labels
//   d: a glow on one path
(function () {
  const BB = window.BB;
  BB.customOps = BB.customOps || {};

  BB.customOps.heroReveal = function (ctx, op, p) {
    const T = ctx.T, t = ctx.t, b = ctx.beat;
    const since = t - b.t0;
    // a 2 s explode, starting 1 s into the beat
    const ex = Math.max(0, Math.min(1, (since - 1.0) / 2.0));
    const h = BB.scenes.heroOf(ctx, {
      kind: 'chamber-nozzle',
      opts: { color: 0x8fe4ff, accent: 0xff9b3d, flamePulse: true },
    });
    h.group.position.set(0, -20, 0);
    h.group.scale.setScalar(1.25);
    BB.hero.explode(h, ex * 0.8);
    if (h.update) h.update(t, ctx);
    ctx.threeHeroes.push(h);

    // the glow on the throat path, drawn on the blueprint canvas
    if (since > 2.4) {
      const g = Math.min(1, (since - 2.4) / 1.2);
      BB.draw.poly(ctx.ctx, [[860, 470], [960, 520], [1060, 640]], {
        p: 1, w: T.line * 1.6, col: T.accent2, seed: 3,
      });
      BB.fx.glow(ctx.ctx, () => {
        BB.draw.poly(ctx.ctx, [[860, 470], [960, 520], [1060, 640]], {
          p: 1, w: T.line * 1.6, col: T.accent2, seed: 3, bleed: false,
        });
      }, g * 0.8, T.accent2);
    }
  };

  BB.customOps.glowPath = function (ctx, op, p) {
    const T = ctx.T, t = ctx.t, b = ctx.beat;
    const since = t - b.t0;
    const pts = [[420, 720], [760, 720], [980, 560], [1240, 470], [1500, 470]];
    const g = Math.min(1, since / 1.4);
    BB.draw.poly(ctx.ctx, pts, { p: Math.min(1, since / 1.4), w: T.line * 1.8, col: T.accent, seed: 7 });
    BB.fx.glow(ctx.ctx, () => {
      BB.draw.poly(ctx.ctx, pts, { p: Math.min(1, since / 1.4), w: T.line * 1.8, col: T.accent, seed: 7, bleed: false });
    }, g * 0.9, T.accent);
    for (let i = 0; i < 4; i++) {
      const u = ((since * 0.35 + i * 0.25) % 1 + 1) % 1;
      const idx = u * (pts.length - 1);
      const k = Math.max(0, Math.min(pts.length - 2, Math.floor(idx)));
      const f = idx - k;
      const a = pts[k], bb = pts[k + 1];
      BB.draw.dot(ctx.ctx, a[0] + (bb[0] - a[0]) * f, a[1] + (bb[1] - a[1]) * f, 9, T.accent2, 1, true);
    }
  };
})();
