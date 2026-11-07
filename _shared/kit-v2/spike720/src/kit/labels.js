// kit-v2: labels. Placement inside the rails, collision avoidance, dwell computation
// (QC B5), and the glossary spelling check (QC B6).
(function () {
  const BB = (window.BB = window.BB || {});
  const L = (BB.labels = {});
  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

  // QC B5: a label must be visible at least 0.4 s + 0.3 s per word.
  L.dwell = (text) => {
    const words = String(text).trim().split(/\s+/).filter(Boolean).length;
    return 0.4 + 0.3 * words;
  };

  // QC B6: every word of a label must be in the glossary (script words + approved terms).
  L.checkGlossary = (text, glossary) => {
    const g = glossary || {};
    const unknown = [];
    String(text).toLowerCase().split(/[^a-z0-9'.-]+/).filter(Boolean).forEach((w) => {
      const key = w.replace(/[^a-z0-9]/g, '');
      if (!key) return;
      if (g[key] === undefined && g[w] === undefined) unknown.push(w);
    });
    return unknown;
  };

  // Normalise a glossary: array of terms -> map of token -> term.
  L.buildGlossary = (terms, extra) => {
    const map = {};
    (terms || []).forEach((t) => {
      const s = String(t).toLowerCase();
      map[s.replace(/[^a-z0-9]/g, '')] = s;
      s.split(/[^a-z0-9]+/).filter(Boolean).forEach((w) => { if (w.length > 1) map[w] = w; });
    });
    (extra || []).forEach((t) => {
      const s = String(t).toLowerCase();
      map[s.replace(/[^a-z0-9]/g, '')] = s;
      s.split(/[^a-z0-9]+/).filter(Boolean).forEach((w) => { if (w.length > 1) map[w] = w; });
    });
    return map;
  };

  const boxes = [];
  L.reset = () => { boxes.length = 0; };

  function overlaps(a, b) {
    const ix = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
    const iy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
    if (ix <= 0 || iy <= 0) return 0;
    const inter = ix * iy;
    const smaller = Math.min((a.x1 - a.x0) * (a.y1 - a.y0), (b.x1 - b.x0) * (b.y1 - b.y0)) || 1;
    return inter / smaller;
  }
  L.overlaps = overlaps;

  // Place a label in a rail. side: 'L' | 'R'. Returns {x, y, align}.
  // y is chosen to avoid the already-placed labels of this beat.
  L.place = function (ctx, T, o) {
    const size = o.size || T.type.label;
    const rail = T.zone(o.side === 'R' ? 'RAIL_R' : 'RAIL_L');
    const text = o.text || '';
    ctx.save();
    ctx.font = `400 ${size}px ${T.font}`;
    const w = ctx.measureText(text).width;
    ctx.restore();
    const align = o.side === 'R' ? 'right' : 'left';
    const inset = 12;
    const x = align === 'right' ? rail.x1 - inset : rail.x0 + inset;
    const step = size * 1.55;
    let y = o.y == null ? rail.y0 + size * 1.1 : o.y;
    // nudge down until the label does not collide with an already placed label
    for (let i = 0; i < 40; i++) {
      const cand = { x0: align === 'right' ? x - w : x, x1: align === 'right' ? x : x + w, y0: y - size * 0.74, y1: y + size * 0.18 };
      let bad = false;
      for (const b of boxes) if (overlaps(cand, b) > 0.02) { bad = true; break; }
      if (!bad) { y = cand.y0 + size * 0.74; break; }
      y += step;
      if (y > rail.y1 - size) { y = rail.y0 + size * 1.1; }
    }
    const box = { x0: align === 'right' ? x - w : x, x1: align === 'right' ? x : x + w, y0: y - size * 0.74, y1: y + size * 0.18 };
    boxes.push(box);
    return { x, y, align, size };
  };

  L.boxes = boxes;

  // Draw a label in a rail with a leader to its anchor. The label is in screen space,
  // so the anchor is projected through the active camera before the leader is drawn.
  L.railLabel = function (ctx, T, o) {
    const pos = L.place(ctx, T, o);
    if (o.anchor && BB.draw.hasAnchor(o.anchor)) {
      const a = BB.draw.project(o.anchor);
      const targetX = pos.align === 'right' ? pos.x + 12 : pos.x - 12;
      BB.draw.poly(ctx, [[a[0], a[1]], [targetX + (pos.align === 'right' ? -18 : 18), a[1]], [targetX, pos.y - T.type.label * 0.3]], {
        p: o.p == null ? 1 : o.p, w: T.hair * 1.4, col: o.col || T.dim, seed: o.seed || 77, bleed: false,
      });
      BB.draw.dot(ctx, a[0], a[1], 3, o.col || T.dim, 1);
    }
    BB.draw.text(ctx, o.text, pos.x, pos.y, pos.size, {
      p: o.p, col: o.col || T.ink, align: pos.align, id: o.id, a: o.a, layer: 'B',
    });
    return pos;
  };

  // A stack of short words, each on its own line (used for "STUBBORN. TESTED. REPEATED.").
  L.stack = function (ctx, T, words, o = {}) {
    const size = o.size || T.type.head;
    const x = o.x == null ? (T.BASE_W / 2) : o.x;
    let y = o.y == null ? (T.BASE_H / 2) : o.y;
    const list = Array.isArray(words) ? words : String(words).split(/\s+/);
    list.forEach((w, i) => {
      BB.draw.text(ctx, w, x, y + i * size * 1.35, size, { align: o.align || 'center', col: o.col || T.ink, p: o.p, id: o.id ? o.id + '-' + i : null, a: o.a, layer: 'B' });
    });
    return y + list.length * size * 1.35;
  };
})();
