// kit-v2: generic blueprint panels (layer B). Reusable visual sentences that the
// episodes compose into beats. Each panel draws with the shared stroke language and
// registers its text with the scene report.
(function () {
  const BB = (window.BB = window.BB || {});
  const P = (BB.panels = {});
  const D = () => BB.draw;
  const clamp = (v, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);

  // fraction of the panel that is drawn at time t
  function prog(t, o) {
    const p = o.p == null ? 1 : o.p;
    return p;
  }

  // ---- a timeline with dated ticks ------------------------------------------------
  P.timeline = function (ctx, T, o) {
    const d = D(), W = T.BASE_W, H = T.BASE_H;
    const y = o.y == null ? H * 0.52 : o.y;
    const x0 = o.x0 == null ? W * 0.12 : o.x0, x1 = o.x1 == null ? W * 0.88 : o.x1;
    const p = prog(o.t, o);
    const ticks = o.ticks || [];
    d.line(ctx, x0, y, x1, y, { p, w: T.heavy, col: T.ink, seed: 301 });
    const n = Math.max(1, ticks.length - 1);
    ticks.forEach((tk, i) => {
      if (i / n > p) return;
      const x = x0 + ((x1 - x0) * i) / n;
      d.line(ctx, x, y - 26, x, y + 26, { p: 1, w: T.line * 1.2, col: tk.accent ? T.accent : T.ink, seed: 310 + i });
      d.text(ctx, tk.label, x, y - 44, T.type.small, { align: 'center', col: tk.accent ? T.accent : T.dim, id: tk.id, layer: 'B' });
      if (tk.note) d.text(ctx, tk.note, x, y + 56, T.type.micro, { align: 'center', col: T.dim, layer: 'B' });
    });
    return { y, x0, x1 };
  };

  // ---- a gate drawn across a pipeline ---------------------------------------------
  P.gate = function (ctx, T, o) {
    const d = D(), W = T.BASE_W, H = T.BASE_H;
    const y = o.y == null ? H * 0.5 : o.y;
    const p = prog(o.t, o);
    const x0 = o.x0 == null ? W * 0.18 : o.x0, x1 = o.x1 == null ? W * 0.82 : o.x1;
    d.line(ctx, x0, y, x1, y, { p, w: T.heavy, col: T.dim, seed: 321 });
    const gx = (x0 + x1) / 2, gh = o.h == null ? 150 : o.h;
    d.line(ctx, gx, y - gh / 2, gx, y + gh / 2, { p: clamp(p * 1.4), w: T.heavy * 1.2, col: T.accent2, seed: 322 });
    for (let i = 0; i < 5; i++) {
      const yy = y - gh / 2 + (gh * i) / 5;
      d.line(ctx, gx, yy, gx - 26, yy - gh / 10, { p: clamp(p * 1.4), w: T.line, col: T.accent2, seed: 323 + i });
      d.line(ctx, gx, yy, gx + 26, yy - gh / 10, { p: clamp(p * 1.4), w: T.line, col: T.accent2, seed: 330 + i });
    }
    if (o.label) d.text(ctx, o.label, gx, y - gh / 2 - 26, T.type.label, { align: 'center', col: T.accent2, id: o.id, layer: 'B' });
    return { gx };
  };

  // ---- a big question --------------------------------------------------------------
  P.question = function (ctx, T, o) {
    const d = D(), W = T.BASE_W, H = T.BASE_H;
    const lines = Array.isArray(o.lines) ? o.lines : [o.text];
    const size = o.size || T.type.head;
    const y0 = o.y == null ? H * 0.42 : o.y;
    const lh = size * 1.30;
    const p = prog(o.t, o);
    const per = 1 / lines.length;
    lines.forEach((ln, i) => {
      const lp = clamp((p - i * per) / per);
      d.text(ctx, ln, o.x == null ? W / 2 : o.x, y0 + i * lh, size, { align: 'center', col: o.col || T.ink, p: lp, id: o.id ? o.id + '-' + i : null, layer: 'B' });
    });
    return { lines: lines.length };
  };

  // ---- a stroke title ---------------------------------------------------------------
  P.title = function (ctx, T, o) {
    const d = D(), W = T.BASE_W, H = T.BASE_H;
    const size = o.size || T.type.head;
    const lines = Array.isArray(o.lines) ? o.lines : [o.text];
    const y0 = o.y == null ? H * 0.48 : o.y;
    const p = prog(o.t, o);
    const lh = size * 1.28;
    lines.forEach((ln, i) => {
      const lp = clamp((p - i * 0.34) / 0.66);
      d.text(ctx, ln, o.x == null ? W / 2 : o.x, y0 + i * lh, size, { align: o.align || 'center', col: o.col || T.ink, p: lp, id: o.id ? o.id + '-' + i : null, layer: 'B' });
    });
    return { lines: lines.length };
  };

  // ---- empty boxes drawn one by one ------------------------------------------------
  P.boxes = function (ctx, T, o) {
    const d = D(), W = T.BASE_W, H = T.BASE_H;
    const items = o.items || [];
    const cols = o.cols || Math.min(4, items.length);
    const rows = Math.ceil(items.length / cols);
    const bw = o.bw || 210, bh = o.bh || 130;
    const gapX = o.gapX || 60, gapY = o.gapY || 70;
    const totalW = cols * bw + (cols - 1) * gapX;
    const x0 = (o.cx == null ? W / 2 : o.cx) - totalW / 2;
    const y0 = (o.cy == null ? H * 0.44 : o.cy) - ((rows - 1) * (bh + gapY)) / 2;
    const p = prog(o.t, o);
    const per = 1 / Math.max(1, items.length);
    items.forEach((it, i) => {
      const ip = clamp((p - i * per) / per);
      if (ip <= 0) return;
      const r = Math.floor(i / cols), c = i % cols;
      const x = x0 + c * (bw + gapX), y = y0 + r * (bh + gapY);
      d.rect(ctx, x, y, bw, bh, { p: ip, w: T.line * 1.2, col: T.ink, seed: 341 + i });
      if (it) {
        d.text(ctx, it, x + bw / 2, y + bh / 2 + T.type.small * 0.36, T.type.small, { align: 'center', col: o.col || T.accent, p: ip, layer: 'B' });
      }
    });
    return { x0, y0 };
  };

  // ---- a checklist ------------------------------------------------------------------
  P.checklist = function (ctx, T, o) {
    const d = D(), W = T.BASE_W, H = T.BASE_H;
    const items = o.items || [];
    const size = o.size || T.type.label;
    const x = o.x == null ? W * 0.30 : o.x;
    const y0 = o.y == null ? H * 0.28 : o.y;
    const p = prog(o.t, o);
    const per = 1 / Math.max(1, items.length);
    items.forEach((it, i) => {
      const ip = clamp((p - i * per) / per);
      if (ip <= 0) return;
      const y = y0 + i * size * 2.1;
      d.rect(ctx, x, y - size * 0.82, size * 0.86, size * 0.86, { p: ip, w: T.line, col: T.dim, seed: 351 + i, overshoot: 2 });
      d.line(ctx, x + size * 0.14, y - size * 0.42, x + size * 0.34, y - size * 0.18, { p: ip, w: T.line * 1.3, col: T.accent, seed: 361 + i });
      d.line(ctx, x + size * 0.34, y - size * 0.18, x + size * 0.66, y - size * 0.66, { p: ip, w: T.line * 1.3, col: T.accent, seed: 371 + i });
      d.text(ctx, it, x + size * 1.35, y, size, { p: ip, col: o.col || T.ink, layer: 'B' });
    });
    return { items: items.length };
  };

  // ---- spokes around a hub ----------------------------------------------------------
  P.spokes = function (ctx, T, o) {
    const d = D(), W = T.BASE_W, H = T.BASE_H;
    const cx = o.cx == null ? W / 2 : o.cx, cy = o.cy == null ? H * 0.46 : o.cy;
    const r = o.r || 150;
    const items = o.items || [];
    const p = prog(o.t, o);
    const per = 1 / Math.max(1, items.length);
    d.circle(ctx, cx, cy, 46, { p: clamp(p * 1.6), w: T.line * 1.3, col: T.ink, seed: 381 });
    items.forEach((it, i) => {
      const ip = clamp((p - i * per) / per);
      if (ip <= 0) return;
      const a = -Math.PI / 2 + (i / items.length) * Math.PI * 2;
      const ex = cx + Math.cos(a) * r, ey = cy + Math.sin(a) * r;
      d.line(ctx, cx + Math.cos(a) * 46, cy + Math.sin(a) * 46, ex, ey, { p: ip, w: T.line, col: T.dim, seed: 391 + i });
      d.text(ctx, it, ex, ey + (Math.sin(a) > 0 ? 34 : -18), T.type.small, { align: 'center', col: o.col || T.accent, p: ip, layer: 'B' });
    });
    return { cx, cy };
  };

  // ---- a chain of stages -------------------------------------------------------------
  P.chain = function (ctx, T, o) {
    const d = D(), W = T.BASE_W, H = T.BASE_H;
    const items = o.items || [];
    const size = o.size || T.type.small;
    const y = o.y == null ? H * 0.5 : o.y;
    const p = prog(o.t, o);
    const step = o.step || 260;
    const x0 = (o.cx == null ? W / 2 : o.cx) - (step * (items.length - 1)) / 2;
    const per = 1 / Math.max(1, items.length);
    items.forEach((it, i) => {
      const ip = clamp((p - i * per) / per);
      if (ip <= 0) return;
      const x = x0 + i * step;
      d.rect(ctx, x - step * 0.40, y - size * 0.9, step * 0.80, size * 1.8, { p: ip, w: T.line, col: i === (o.highlight == null ? -1 : o.highlight) ? T.accent : T.ink, seed: 401 + i, overshoot: 3 });
      d.text(ctx, it, x, y + size * 0.36, size, { align: 'center', col: o.col || T.ink, p: ip, layer: 'B' });
      if (i < items.length - 1) {
        const ap = clamp((p - (i + 1) * per) / per);
        if (ap > 0) {
          d.line(ctx, x + step * 0.42, y, x + step * 0.56, y, { p: ap, w: T.line, col: T.dim, seed: 411 + i });
          d.line(ctx, x + step * 0.50, y - 7, x + step * 0.58, y, { p: ap, w: T.line, col: T.dim, seed: 421 + i });
          d.line(ctx, x + step * 0.50, y + 7, x + step * 0.58, y, { p: ap, w: T.line, col: T.dim, seed: 431 + i });
        }
      }
    });
    return { items: items.length };
  };

  // ---- two columns compared ----------------------------------------------------------
  P.compare = function (ctx, T, o) {
    const d = D(), W = T.BASE_W, H = T.BASE_H;
    const size = o.size || T.type.label;
    const gap = o.gap || 120;
    const cx = o.cx == null ? W / 2 : o.cx;
    const y = o.y == null ? H * 0.5 : o.y;
    const p = prog(o.t, o);
    const cols = o.columns || [];
    const w = o.w || 340;
    cols.forEach((c, i) => {
      const ip = clamp(p * cols.length - i);
      if (ip <= 0) return;
      const x = cx + (i - (cols.length - 1) / 2) * (w + gap) - w / 2;
      const h = o.h || 210;
      d.rect(ctx, x, y - h / 2, w, h, { p: ip, w: T.line, col: c.accent ? T.accent : T.ink, seed: 441 + i, overshoot: 3 });
      d.text(ctx, c.title, x + w / 2, y - h / 2 + size * 1.1, size, { align: 'center', col: c.accent ? T.accent : T.ink, p: ip, layer: 'B' });
      if (c.body) {
        const lines = Array.isArray(c.body) ? c.body : [c.body];
        lines.forEach((ln, k) => d.text(ctx, ln, x + w / 2, y - h / 2 + size * 2.1 + k * size * 1.5, T.type.small, { align: 'center', col: T.dim, p: ip, layer: 'B' }));
      }
      if (c.ghost) {
        d.rect(ctx, x + 6, y - h / 2 + 6, w - 12, h - 12, { p: ip, w: T.hair, col: T.dim, dash: [9, 9], march: 18, t: o.t, seed: 451 + i, overshoot: 2 });
      }
    });
    return { cols: cols.length };
  };

  // ---- a dimension chain (the honest number) -----------------------------------------
  P.dimensionChain = function (ctx, T, o) {
    const d = D(), W = T.BASE_W, H = T.BASE_H;
    const size = o.size || T.type.body;
    const y = o.y == null ? H * 0.72 : o.y;
    const x0 = o.x0 == null ? W * 0.14 : o.x0, x1 = o.x1 == null ? W * 0.42 : o.x1;
    const p = prog(o.t, o);
    d.line(ctx, x0, y, x1, y, { p, w: T.hair * 2, col: T.accent, seed: 461 });
    d.line(ctx, x0, y - 9, x0, y + 9, { p, w: T.hair * 2, col: T.accent, seed: 462 });
    d.line(ctx, x1, y - 9, x1, y + 9, { p, w: T.hair * 2, col: T.accent, seed: 463 });
    if (o.left) d.text(ctx, o.left, x0, y + size * 1.6, T.type.micro, { align: 'left', col: T.dim, p, layer: 'B' });
    if (o.right) d.text(ctx, o.right, x1, y + size * 1.6, T.type.micro, { align: 'right', col: T.dim, p, layer: 'B' });
  };

  // ---- flow arrows -------------------------------------------------------------------
  P.arrows = function (ctx, T, o) {
    const d = D();
    const p = prog(o.t, o);
    const arrows = o.arrows || [];
    const per = 1 / Math.max(1, arrows.length);
    arrows.forEach((a, i) => {
      const ip = clamp((p - i * per) / per);
      if (ip <= 0) return;
      const x1 = a.x1, y1 = a.y1, x2 = a.x2, y2 = a.y2;
      const len = Math.hypot(x2 - x1, y2 - y1);
      const ex = x1 + ((x2 - x1) * ip), ey = y1 + ((y2 - y1) * ip);
      d.line(ctx, x1, y1, ex, ey, { p: 1, w: a.w || T.line * 1.3, col: a.col || T.accent, seed: 471 + i });
      if (ip > 0.85) {
        const ang = Math.atan2(y2 - y1, x2 - x1);
        const hl = a.head || 16;
        d.line(ctx, ex - Math.cos(ang - 0.5) * hl, ey - Math.sin(ang - 0.5) * hl, ex, ey, { p: 1, w: a.w || T.line * 1.3, col: a.col || T.accent, seed: 481 + i });
        d.line(ctx, ex - Math.cos(ang + 0.5) * hl, ey - Math.sin(ang + 0.5) * hl, ex, ey, { p: 1, w: a.w || T.line * 1.3, col: a.col || T.accent, seed: 491 + i });
      }
    });
  };

  // ---- a row of slots (for the 12 units) ------------------------------------------------
  P.slots = function (ctx, T, o) {
    const d = D(), W = T.BASE_W, H = T.BASE_H;
    const items = o.items || [];
    const cols = o.cols || 6;
    const rows = Math.ceil(items.length / cols);
    const bw = o.bw || 150, bh = o.bh || 92, gapX = o.gapX || 34, gapY = o.gapY || 44;
    const totalW = cols * bw + (cols - 1) * gapX;
    const x0 = (o.cx == null ? W / 2 : o.cx) - totalW / 2;
    const y0 = (o.cy == null ? H * 0.46 : o.cy) - ((rows - 1) * (bh + gapY)) / 2;
    const p = prog(o.t, o);
    const per = 1 / Math.max(1, items.length);
    items.forEach((it, i) => {
      const ip = clamp((p - i * per * 0.6) / (per * 2));
      if (ip <= 0) return;
      const r = Math.floor(i / cols), c = i % cols;
      const x = x0 + c * (bw + gapX), y = y0 + r * (bh + gapY);
      const lit = it && it.lit;
      d.rect(ctx, x, y, bw, bh, { p: ip, w: T.line, col: lit ? T.accent : T.dim, fill: lit ? 'rgba(255,155,61,0.16)' : null, seed: 501 + i });
      if (it && it.label) d.text(ctx, it.label, x + bw / 2, y + bh / 2 + T.type.micro * 0.36, T.type.micro, { align: 'center', col: lit ? T.accent : T.dim, p: ip, layer: 'B' });
    });
    return { x0, y0 };
  };

  // ---- dots of a ratio -----------------------------------------------------------------
  P.dots = function (ctx, T, o) {
    const d = D(), W = T.BASE_W, H = T.BASE_H;
    const n = o.total || 4, filled = o.filled || 0;
    const size = o.size || 26;
    const gap = o.gap || 54;
    const cx = o.cx == null ? W / 2 : o.cx, cy = o.cy == null ? H * 0.48 : o.cy;
    const p = prog(o.t, o);
    const totalW = (n - 1) * gap;
    for (let i = 0; i < n; i++) {
      const ip = clamp(p * n - i);
      if (ip <= 0) continue;
      const x = cx - totalW / 2 + i * gap;
      const on = i < filled;
      d.circle(ctx, x, cy, size * 0.42, { p: ip, w: T.line, col: on ? T.accent : T.dim, fill: on ? 'rgba(255,155,61,0.18)' : null, seed: 511 + i });
    }
    if (o.label) d.text(ctx, o.label, cx, cy + size * 1.9, T.type.label, { align: 'center', col: o.col || T.ink, p, layer: 'B' });
  };

  // ---- a five-part wheel ----------------------------------------------------------------
  P.wheel = function (ctx, T, o) {
    const d = D(), W = T.BASE_W, H = T.BASE_H;
    const cx = o.cx == null ? W / 2 : o.cx, cy = o.cy == null ? H * 0.46 : o.cy;
    const r = o.r || 190;
    const items = o.items || [];
    const p = prog(o.t, o);
    const per = 1 / Math.max(1, items.length);
    d.circle(ctx, cx, cy, r * 0.30, { p: clamp(p * 1.6), w: T.line * 1.3, col: T.ink, seed: 521 });
    items.forEach((it, i) => {
      const ip = clamp((p - i * per) / per);
      if (ip <= 0) return;
      const a = -Math.PI / 2 + (i / items.length) * Math.PI * 2;
      const ex = cx + Math.cos(a) * r, ey = cy + Math.sin(a) * r;
      d.line(ctx, cx + Math.cos(a) * r * 0.30, cy + Math.sin(a) * r * 0.30, ex, ey, { p: ip, w: T.line, col: T.accent, seed: 531 + i });
      d.circle(ctx, ex, ey, 16, { p: ip, w: T.line, col: T.accent, seed: 541 + i });
      d.text(ctx, it, ex + Math.cos(a) * 66, ey + Math.sin(a) * 66 + 8, T.type.small, { align: 'center', col: T.ink, p: ip, layer: 'B' });
    });
    if (o.hub) d.text(ctx, o.hub, cx, cy + 8, T.type.label, { align: 'center', col: T.dim, p, layer: 'B' });
  };

  // ---- a looping arrow (a test loop) ------------------------------------------------------
  P.loop = function (ctx, T, o) {
    const d = D(), W = T.BASE_W, H = T.BASE_H;
    const cx = o.cx == null ? W / 2 : o.cx, cy = o.cy == null ? H * 0.48 : o.cy;
    const r = o.r || 160;
    const p = prog(o.t, o);
    const turns = o.turns || 2;
    const total = turns * Math.PI * 2;
    const pts = [];
    const n = 96;
    for (let i = 0; i <= n; i++) {
      const a = -Math.PI / 2 + (total * i) / n;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    d.poly(ctx, pts, { p, w: T.line * 1.4, col: T.accent, seed: 551 });
    const last = pts[Math.floor((p * n))];
    if (last) d.pen(ctx, last, T.accent);
  };

  // ---- a bar against a reference ------------------------------------------------------------
  P.bars = function (ctx, T, o) {
    const d = D(), W = T.BASE_W, H = T.BASE_H;
    const bars = o.bars || [];
    const x = o.x == null ? W * 0.24 : o.x;
    const base = o.base == null ? H * 0.66 : o.base;
    const maxH = o.maxH || 220;
    const bw = o.bw || 58, gap = o.gap || 34;
    const p = prog(o.t, o);
    bars.forEach((b, i) => {
      const ip = clamp(p * bars.length - i);
      if (ip <= 0) return;
      const h = (b.value / (o.max || 1)) * maxH * ip;
      const bx = x + i * (bw + gap);
      d.rect(ctx, bx, base - h, bw, h, { p: 1, w: T.line, col: b.accent ? T.accent : T.ink, fill: b.accent ? 'rgba(143,228,255,0.14)' : null, seed: 561 + i });
      d.text(ctx, b.label, bx + bw / 2, base + T.type.micro * 1.4, T.type.micro, { align: 'center', col: T.dim, p: ip, layer: 'B' });
    });
    d.line(ctx, x - 20, base, x + bars.length * (bw + gap), base, { p: 1, w: T.hair * 2, col: T.dim, seed: 571 });
  };

  // ---- a ghosted machine behind a barrier ----------------------------------------------------
  P.ghosts = function (ctx, T, o) {
    const d = D();
    const p = prog(o.t, o);
    (o.items || []).forEach((it, i) => {
      const ip = clamp(p * (o.items.length) - i);
      if (ip <= 0) return;
      d.rect(ctx, it.x, it.y, it.w, it.h, { p: ip, w: T.hair * 1.6, col: T.dim, dash: [10, 10], march: 14, t: o.t, seed: 581 + i, overshoot: 2 });
    });
  };
})();
