// kit-v2: the bb-map renderer. Abstract block terrain, pins, routes and coverage
// footprints. No country, state or district borders, ever (QC B16).
(function () {
  const BB = (window.BB = window.BB || {});
  const M = (BB.map = {});
  const clamp = (v, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);

  M.config = function () { return (window.EPISODE && window.EPISODE.map) || null; };

  // a block/grid terrain: squares in 2 to 3 tones of blueprint blue.
  M.terrain = function (ctx, T, o) {
    const d = BB.draw;
    const x0 = o.x0 == null ? T.BASE_W * 0.10 : o.x0;
    const y0 = o.y0 == null ? T.BASE_H * 0.20 : o.y0;
    const w = o.w == null ? T.BASE_W * 0.80 : o.w;
    const h = o.h == null ? T.BASE_H * 0.62 : o.h;
    const cols = o.cols || 12, rows = o.rows || 7;
    const p = o.p == null ? 1 : o.p;
    const bw = w / cols, bh = h / rows;
    const rnd = BB.mulberry32 ? BB.mulberry32(o.seed == null ? 7 : o.seed) : Math.random;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = rnd();
        if (v < 0.16) continue; // gaps make the terrain read as schematic, not geographic
        const tone = v > 0.78 ? T.cyan : v > 0.46 ? T.dim : T.grid;
        d.rect(ctx, x0 + c * bw + 2, y0 + r * bh + 2, bw - 4, bh - 4, {
          p, w: T.hair, col: tone, seed: 700 + r * 40 + c, overshoot: 0,
          fill: v > 0.78 ? 'rgba(143,228,255,0.10)' : null,
        });
      }
    }
    return { x0, y0, w, h, bw, bh };
  };

  M.draw = function (ctx, T, op, page) {
    const d = BB.draw;
    const cfg = M.config();
    const p = op.p == null ? ctx.p : op.p;
    const kind = op.kind || 'terrain';

    if (kind === 'terrain') {
      M.terrain(ctx, T, op);
      return;
    }

    if (kind === 'pins') {
      const items = (cfg && cfg.nodes) || op.items || [];
      const box = M.terrain(ctx, T, Object.assign({}, op, { p: 1 }));
      const per = 1 / Math.max(1, items.length);
      items.forEach((n, i) => {
        const ip = clamp((p - i * per) / per);
        if (ip <= 0) return;
        const x = box.x0 + n.x * box.w, y = box.y0 + n.y * box.h;
        d.dot(ctx, x, y, 9, T.accent, ip, true);
        d.circle(ctx, x, y, 20, { p: ip, w: T.hair, col: T.dim, seed: 720 + i });
        if (n.label) d.text(ctx, n.label, x, y - 34, T.type.small, { align: 'center', col: T.ink, p: ip, layer: 'B' });
      });
      return;
    }

    if (kind === 'route') {
      const route = (cfg && cfg.routes && cfg.routes[op.route]) || op.route;
      const pts = (route && route.nodes) || [];
      const box = M.terrain(ctx, T, Object.assign({}, op, { p: 1 }));
      const xy = pts.map((id) => {
        const n = ((cfg && cfg.nodes) || []).find((q) => q.id === id);
        return n ? [box.x0 + n.x * box.w, box.y0 + n.y * box.h] : null;
      }).filter(Boolean);
      if (xy.length < 2) return;
      const per = 1 / (xy.length - 1);
      for (let i = 0; i < xy.length - 1; i++) {
        const ip = clamp((p - i * per) / per);
        if (ip <= 0) continue;
        const a = xy[i], b = xy[i + 1];
        const ex = a[0] + (b[0] - a[0]) * ip, ey = a[1] + (b[1] - a[1]) * ip;
        d.line(ctx, a[0], a[1], ex, ey, { p: 1, w: T.line * 1.4, col: T.accent, seed: 730 + i });
        d.dot(ctx, a[0], a[1], 7, T.accent, 1);
      }
      return;
    }

    if (kind === 'footprint') {
      const cx = op.cx == null ? T.BASE_W / 2 : op.cx;
      const cy = op.cy == null ? T.BASE_H * 0.48 : op.cy;
      const r = (op.r || 200) * easeOut(p);
      ctx.save();
      ctx.globalAlpha = 0.16 * p;
      ctx.fillStyle = T.accent;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      d.circle(ctx, cx, cy, r, { p, w: T.line, col: T.accent, seed: 740 });
      if (op.label) d.text(ctx, op.label, cx, cy + r + 40, T.type.label, { align: 'center', col: T.ink, p, layer: 'B' });
      if (op.source) d.sourceChip(ctx, T.BASE_W, T.BASE_H, T, op.source, {});
      return;
    }
  };

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
})();
