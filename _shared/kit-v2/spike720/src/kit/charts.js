// kit-v2: the bb-data chart renderer. Numbers on screen are a pure function of t and end
// exactly equal to the CSV value (QC B11). No value is invented here.
(function () {
  const BB = (window.BB = window.BB || {});
  const C = (BB.charts = {});
  const clamp = (v, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
  const ease = { out: (t) => 1 - Math.pow(1 - t, 3) };

  // deterministic number formatting: fixed locale, fixed decimals per row
  C.format = function (row, value) {
    if (row.display != null) return String(row.display);
    const dec = row.decimals == null ? 0 : row.decimals;
    const v = dec > 0 ? value.toFixed(dec) : String(Math.round(value));
    const sep = row.group ? ',' : '';
    if (!sep) return v;
    const parts = v.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  C.rows = function () { return (window.EPISODE && window.EPISODE.data) || []; };
  C.row = function (id) { return C.rows().find((r) => r.id === id); };

  C.draw = function (ctx, T, op, page) {
    const d = BB.draw;
    const row = op.row ? C.row(op.row) : null;
    const p = op.p == null ? ctx.p : op.p;
    const type = op.type || (row && row.kind) || 'counter';
    const dur = op.dur == null ? 1.4 : op.dur;
    const t0 = op.t0 == null ? (ctx.beat ? ctx.beat.t0 : 0) : op.t0;
    const u = ease.out(clamp((ctx.t - t0) / dur));

    if (type === 'counter') {
      const v = row ? Number(row.value) : Number(op.value || 0);
      const s = C.format(row || { decimals: op.decimals || 0 }, v * u);
      const size = op.size || T.type.title;
      const x = op.x == null ? T.BASE_W / 2 : op.x;
      const y = op.y == null ? T.BASE_H * 0.46 : op.y;
      d.text(ctx.ctx, s, x, y, size, { align: op.align || 'center', col: op.col || T.accent, p, id: op.id, layer: 'B' });
      if (row && row.label) d.text(ctx.ctx, row.label, x, y + size * 0.75, T.type.label, { align: 'center', col: T.ink, p, layer: 'B' });
      if (row && row.source) d.sourceChip(ctx.ctx, T.BASE_W, T.BASE_H, T, row.source, {});
      return;
    }

    if (type === 'bar') {
      const max = op.max || (row ? Number(row.value) : 1);
      const v = (row ? Number(row.value) : 1) * u;
      const x = op.x == null ? T.BASE_W * 0.30 : op.x;
      const base = op.base == null ? T.BASE_H * 0.66 : op.base;
      const h = (v / max) * (op.h || 260);
      const w = op.w || 140;
      d.rect(ctx.ctx, x, base - h, w, h, { p, w: T.line * 1.2, col: T.accent, fill: 'rgba(143,228,255,0.14)', seed: 611 });
      if (op.reference != null) {
        const rh = (op.reference / max) * (op.h || 260);
        d.line(ctx.ctx, x - 20, base - rh, x + w + 20, base - rh, { p, w: T.hair * 2, col: T.dim, seed: 612 });
        d.text(ctx.ctx, op.referenceLabel || String(op.reference), x + w + 28, base - rh + 6, T.type.micro, { col: T.dim, p, layer: 'B' });
      }
      if (row && row.label) d.text(ctx.ctx, row.label, x + w / 2, base + T.type.micro * 1.5, T.type.micro, { align: 'center', col: T.dim, p, layer: 'B' });
      if (row && row.source) d.sourceChip(ctx.ctx, T.BASE_W, T.BASE_H, T, row.source, {});
      return;
    }

    if (type === 'chain') {
      // a dimension chain: the honest number with its dimension chain
      const items = op.items || [];
      const y = op.y == null ? T.BASE_H * 0.62 : op.y;
      const x0 = op.x0 == null ? T.BASE_W * 0.16 : op.x0;
      const step = op.step || (T.BASE_W * 0.62) / Math.max(1, items.length - 1);
      d.line(ctx.ctx, x0, y, x0 + step * (items.length - 1), y, { p, w: T.hair * 2, col: T.accent, seed: 621 });
      items.forEach((it, i) => {
        const x = x0 + step * i;
        d.line(ctx.ctx, x, y - 12, x, y + 12, { p, w: T.hair * 2, col: T.accent, seed: 622 + i });
        d.text(ctx.ctx, it, x, y + 44, T.type.micro, { align: 'center', col: T.dim, p, layer: 'B' });
      });
      if (op.value) d.text(ctx.ctx, op.value, x0, y - 30, op.size || T.type.head, { col: T.accent, p, id: op.id, layer: 'B' });
      return;
    }

    if (type === 'ratio') {
      const n = op.total || 12;
      const filled = Math.round((row ? Number(row.value) : op.filled || 0) * u);
      BB.panels.dots(ctx.ctx, T, { total: n, filled, cx: op.cx, cy: op.cy, label: op.label, size: op.size, p, col: op.col });
      if (row && row.source) d.sourceChip(ctx.ctx, T.BASE_W, T.BASE_H, T, row.source, {});
      return;
    }

    if (type === 'timeline') {
      const items = op.items || [];
      const y = op.y == null ? T.BASE_H * 0.5 : op.y;
      const x0 = op.x0 == null ? T.BASE_W * 0.16 : op.x0;
      const x1 = op.x1 == null ? T.BASE_W * 0.84 : op.x1;
      d.line(ctx.ctx, x0, y, x1, y, { p, w: T.heavy, col: T.ink, seed: 631 });
      const per = 1 / Math.max(1, items.length);
      items.forEach((it, i) => {
        const ip = clamp((p - i * per) / per);
        if (ip <= 0) return;
        const x = x0 + ((x1 - x0) * i) / Math.max(1, items.length - 1);
        d.line(ctx.ctx, x, y - 26, x, y + 26, { p: ip, w: T.line * 1.2, col: T.accent, seed: 632 + i });
        d.text(ctx.ctx, it.label, x, y - 44, T.type.small, { align: 'center', col: T.accent, p: ip, layer: 'B' });
        if (it.note) d.text(ctx.ctx, it.note, x, y + 58, T.type.micro, { align: 'center', col: T.dim, p: ip, layer: 'B' });
      });
      return;
    }
  };
})();
