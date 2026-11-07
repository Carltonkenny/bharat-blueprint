// Engineering Blueprint (hand-drawn cyanotype) drawing kit, built on the unchanged H library.
// Every function is a pure function of its arguments: wobble and texture come from H.makeNoise / H.rng.
(function () {
  const BP = (window.BP = {});
  const clamp = H.clamp;
  const C = (BP.C = {
    paper: '#0b3763', ink: '#eef6ff', cyan: '#86dcff', dim: 'rgba(134,220,255,0.38)',
    red: '#ff5b4a', orange: '#ff9b3d', plate: 'rgba(9,44,86,0.9)',
  });
  BP.FONT = "'IBM Plex Mono','Space Mono',Consolas,'Courier New',monospace";
  BP.W = 1280; BP.H = 720;
  // sub-progress: 0 before a, 1 after b
  BP.seg = (p, a, b) => clamp((p - a) / (b - a));

  const nzCache = {};
  const nz = (s) => nzCache[s] || (nzCache[s] = H.makeNoise(s));

  // ---------- hand-drawn line quality ----------
  function wobble(pts, seed, amp) {
    const n = nz(seed), out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
      const len = Math.hypot(x2 - x1, y2 - y1), k = Math.max(1, Math.round(len / 22));
      const nx = -(y2 - y1) / (len || 1), ny = (x2 - x1) / (len || 1);
      for (let j = 0; j < k; j++) {
        const t = j / k, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
        const o = n.n2(x * 0.05 + i * 3.1, y * 0.05) * amp;
        out.push([x + nx * o, y + ny * o]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  function partial(pts, p) {
    if (p >= 1) return pts;
    if (p <= 0) return pts.slice(0, 1);
    let tot = 0; const L = [];
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
    let want = tot * p; const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      if (want >= L[i - 1]) { out.push(pts[i]); want -= L[i - 1]; }
      else { const t = want / (L[i - 1] || 1); out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]); break; }
    }
    return out;
  }

  // ink stroke: soft cyan bleed underneath, crisp white line on top
  BP.stroke = function (ctx, pts, o = {}) {
    if (pts.length < 2) return;
    const w = o.w || 2, col = o.col || C.ink, a = o.a == null ? 1 : o.a;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (o.dash) ctx.setLineDash(o.dash);
    const path = () => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); };
    if (o.bleed !== false) { ctx.globalAlpha = a * 0.16; ctx.strokeStyle = C.cyan; ctx.lineWidth = w + 3.2; path(); ctx.stroke(); }
    ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = w; path(); ctx.stroke();
    ctx.restore();
  };
  // plotter head
  BP.pen = function (ctx, pt) {
    if (!pt) return;
    ctx.save(); ctx.strokeStyle = C.cyan; ctx.globalAlpha = 0.9; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(pt[0], pt[1], 6, 0, Math.PI * 2); ctx.moveTo(pt[0] - 12, pt[1]); ctx.lineTo(pt[0] + 12, pt[1]); ctx.moveTo(pt[0], pt[1] - 12); ctx.lineTo(pt[0], pt[1] + 12); ctx.stroke();
    ctx.restore();
  };
  BP.poly = function (ctx, pts, o = {}) {
    const p = o.p == null ? 1 : o.p;
    if (p <= 0) return null;
    const q = wobble(o.close ? pts.concat([pts[0]]) : pts, o.seed || 1, o.j == null ? 0.7 : o.j);
    const part = partial(q, p);
    if (o.fill && p >= 1) {
      ctx.save(); ctx.fillStyle = o.fill; ctx.beginPath();
      part.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
    BP.stroke(ctx, part, o);
    if (o.pen && p < 1) BP.pen(ctx, part[part.length - 1]);
    return part[part.length - 1];
  };
  BP.line = (ctx, x1, y1, x2, y2, o) => BP.poly(ctx, [[x1, y1], [x2, y2]], o);
  BP.rect = (ctx, x, y, w, h, o = {}) => BP.poly(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], Object.assign({ close: true }, o));
  BP.arc = function (ctx, cx, cy, r, a0, a1, o = {}) {
    const n = Math.max(10, Math.round(Math.abs(a1 - a0) * r / 9)), pts = [];
    const k = nz(o.seed || 3);
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n, rr = r + k.n2(Math.cos(a) * 2 + (o.seed || 3), Math.sin(a) * 2) * 0.9; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    return BP.poly(ctx, pts, Object.assign({ j: 0 }, o));
  };
  BP.circle = (ctx, cx, cy, r, o = {}) => BP.arc(ctx, cx, cy, r, o.a0 == null ? -Math.PI / 2 : o.a0, (o.a0 == null ? -Math.PI / 2 : o.a0) + Math.PI * 2, o);
  BP.dot = function (ctx, x, y, r, col, a = 1) {
    ctx.save(); ctx.globalAlpha = a * 0.25; ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(x, y, r + 3, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = a; ctx.fillStyle = col || C.ink; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  };

  // ---------- lettering ----------
  BP.tw = function (ctx, s, size, o = {}) {
    ctx.save(); ctx.font = `${o.weight || 600} ${size}px ${BP.FONT}`; ctx.letterSpacing = (o.ls == null ? size * 0.04 : o.ls) + 'px';
    const w = ctx.measureText(s).width; ctx.restore(); return w;
  };
  BP.text = function (ctx, s, x, y, size, o = {}) {
    const p = o.p == null ? 1 : clamp(o.p), n = Math.ceil(s.length * p);
    if (n <= 0) return;
    let align = o.align || 'left';
    if (p < 1 && align !== 'left') { const w = BP.tw(ctx, s, size, o); x = align === 'center' ? x - w / 2 : x - w; align = 'left'; }
    ctx.save(); ctx.font = `${o.weight || 600} ${size}px ${BP.FONT}`; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    ctx.letterSpacing = (o.ls == null ? size * 0.04 : o.ls) + 'px';
    const a = o.a == null ? 1 : o.a, str = s.slice(0, n);
    ctx.globalAlpha = a * 0.22; ctx.fillStyle = C.cyan; ctx.fillText(str, x + 1, y + 1); ctx.fillText(str, x - 0.6, y);
    ctx.globalAlpha = a; ctx.fillStyle = o.col || C.ink; ctx.fillText(str, x, y);
    ctx.restore();
  };
  // label on a paper-coloured plate so it stays legible over linework
  BP.label = function (ctx, s, x, y, size, o = {}) {
    const p = o.p == null ? 1 : o.p; if (p <= 0) return;
    const w = BP.tw(ctx, s, size, o), pad = 8, al = o.align || 'left';
    const x0 = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x;
    if (o.plate !== false) { ctx.save(); ctx.globalAlpha = 0.9 * clamp(p * 3); ctx.fillStyle = C.plate; ctx.fillRect(x0 - pad, y - size * 0.86, w + pad * 2, size * 1.2); ctx.restore(); }
    BP.text(ctx, s, x0, y, size, Object.assign({}, o, { align: 'left' }));
  };

  // ---------- drafting furniture ----------
  BP.arrowhead = function (ctx, x, y, ang, size, o = {}) {
    const s = size || 14;
    ctx.save(); ctx.globalAlpha = o.a == null ? 1 : o.a; ctx.fillStyle = o.col || C.ink; ctx.translate(x, y); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-s, -s * 0.36); ctx.lineTo(-s, s * 0.36); ctx.closePath(); ctx.fill(); ctx.restore();
  };
  BP.arrow = function (ctx, x1, y1, x2, y2, o = {}) {
    const p = o.p == null ? 1 : o.p; if (p <= 0) return;
    BP.line(ctx, x1, y1, x2, y2, Object.assign({}, o, { p: clamp(p / 0.85) }));
    if (p > 0.85) BP.arrowhead(ctx, x2, y2, Math.atan2(y2 - y1, x2 - x1), o.h || 16, o);
  };
  // dimension: extension lines, offset dimension line with two arrowheads, centred text
  BP.dim = function (ctx, x1, y1, x2, y2, txt, off, o = {}) {
    const p = o.p == null ? 1 : o.p; if (p <= 0) return;
    const len = Math.hypot(x2 - x1, y2 - y1), dx = (x2 - x1) / len, dy = (y2 - y1) / len, nx = -dy, ny = dx;
    const a = [x1 + nx * off, y1 + ny * off], b = [x2 + nx * off, y2 + ny * off], w = o.w || 1.5;
    const e = { w, seed: o.seed || 2, a: o.a };
    BP.line(ctx, x1 + nx * 6, y1 + ny * 6, a[0] + nx * 10, a[1] + ny * 10, Object.assign({}, e, { p: BP.seg(p, 0, 0.4) }));
    BP.line(ctx, x2 + nx * 6, y2 + ny * 6, b[0] + nx * 10, b[1] + ny * 10, Object.assign({}, e, { p: BP.seg(p, 0, 0.4) }));
    BP.line(ctx, a[0], a[1], b[0], b[1], Object.assign({}, e, { p: BP.seg(p, 0.2, 0.8) }));
    if (p > 0.7) { BP.arrowhead(ctx, a[0], a[1], Math.atan2(-dy, -dx), 11, o); BP.arrowhead(ctx, b[0], b[1], Math.atan2(dy, dx), 11, o); }
    if (txt) BP.label(ctx, txt, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + (o.size || 28) * 0.35, o.size || 28, { align: 'center', p: BP.seg(p, 0.6, 1), weight: 400 });
  };
  // leader: dot on the target, straight line to an elbow, shelf under the text
  BP.leader = function (ctx, tx, ty, ex, ey, txt, o = {}) {
    const p = o.p == null ? 1 : o.p; if (p <= 0) return;
    const size = o.size || 28, right = (o.side || (ex >= tx ? 'r' : 'l')) === 'r';
    BP.dot(ctx, tx, ty, 4, o.col, clamp(p * 4));
    BP.line(ctx, tx, ty, ex, ey, { w: 1.6, seed: o.seed || 4, p: BP.seg(p, 0, 0.5), col: o.col });
    const w = BP.tw(ctx, txt, size);
    const sx = right ? ex + w + 16 : ex - w - 16;
    BP.line(ctx, ex, ey, sx, ey, { w: 1.6, seed: (o.seed || 4) + 1, p: BP.seg(p, 0.4, 0.8), col: o.col });
    BP.text(ctx, txt, right ? ex + 8 : ex - 8 - w, ey - 9, size, { p: BP.seg(p, 0.5, 1), col: o.col, weight: 600 });
  };
  BP.hatch = function (ctx, poly, ang, gap, o = {}) {
    const p = o.p == null ? 1 : o.p; if (p <= 0) return;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    poly.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
    ctx.save(); ctx.beginPath(); poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip();
    ctx.strokeStyle = o.col || C.cyan; ctx.globalAlpha = o.a == null ? 0.75 : o.a; ctx.lineWidth = o.w || 1.3;
    const c = Math.cos(ang), s = Math.sin(ang), R = Math.hypot(x1 - x0, y1 - y0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const n = Math.ceil(R / gap), shown = Math.ceil(n * p);
    ctx.beginPath();
    for (let i = -n / 2; i < -n / 2 + shown; i++) {
      const ox = cx - s * i * gap, oy = cy + c * i * gap;
      ctx.moveTo(ox - c * R, oy - s * R); ctx.lineTo(ox + c * R, oy + s * R);
    }
    ctx.stroke(); ctx.restore();
  };
  // tracking marker: corner brackets + cross ticks
  BP.track = function (ctx, x, y, r, o = {}) {
    const p = o.p == null ? 1 : o.p; if (p <= 0) return;
    const col = o.col || C.ink, k = r * 0.38, e = { w: o.w || 2.4, col, seed: 9, a: o.a };
    const q = BP.seg(p, 0, 1);
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy], i) => {
      BP.poly(ctx, [[x + sx * r, y + sy * (r - k)], [x + sx * r, y + sy * r], [x + sx * (r - k), y + sy * r]], Object.assign({}, e, { seed: 9 + i, p: q }));
    });
    BP.line(ctx, x - r * 0.3, y, x - r * 0.08, y, Object.assign({}, e, { w: 1.6, p: q }));
    BP.line(ctx, x + r * 0.08, y, x + r * 0.3, y, Object.assign({}, e, { w: 1.6, p: q }));
    BP.line(ctx, x, y - r * 0.3, x, y - r * 0.08, Object.assign({}, e, { w: 1.6, p: q }));
    BP.line(ctx, x, y + r * 0.08, x, y + r * 0.3, Object.assign({}, e, { w: 1.6, p: q }));
  };
  // radiating arcs (radio waves). radii array, direction a0..a1, fades with distance
  BP.waves = function (ctx, cx, cy, radii, a0, a1, o = {}) {
    const p = o.p == null ? 1 : o.p;
    radii.forEach((r, i) => {
      const q = BP.seg(p, i / radii.length * 0.7, i / radii.length * 0.7 + 0.3);
      BP.arc(ctx, cx, cy, r, a0, a1, { w: o.w || 2, col: o.col || C.cyan, a: (o.a == null ? 1 : o.a) * (1 - i / (radii.length + 1) * 0.6), p: q, seed: 20 + i, dash: o.dash });
    });
  };

  // ---------- India (abstract outline, equirectangular, for illustration only) ----------
  const INDIA = [[74.5, 37.0], [77.8, 35.5], [79.0, 34.3], [78.8, 32.5], [79.5, 31.0], [81.0, 30.2], [80.1, 28.8], [82.0, 27.8], [84.0, 27.3], [86.0, 26.6], [88.1, 26.5], [88.6, 27.8], [89.8, 26.9], [92.0, 26.9], [94.0, 28.2], [96.2, 29.0], [97.2, 27.9], [95.5, 26.3], [95.1, 25.2], [94.3, 23.8], [93.3, 22.0], [92.3, 23.6], [91.4, 24.2], [91.1, 25.2], [89.8, 25.3], [89.0, 26.2], [88.7, 22.0], [87.0, 21.5], [86.8, 20.2], [85.0, 19.3], [83.0, 17.5], [80.3, 15.5], [80.2, 13.0], [79.8, 10.3], [78.2, 8.9], [77.5, 8.1], [76.4, 9.6], [75.0, 12.5], [73.8, 15.5], [72.8, 19.0], [72.6, 21.0], [70.5, 20.8], [69.0, 22.3], [70.0, 23.0], [68.2, 23.6], [70.0, 24.5], [71.0, 25.7], [70.5, 27.5], [70.8, 28.5], [72.6, 31.0], [74.5, 32.0], [74.8, 34.0]];
  BP.india = function (ctx, cx, cy, hgt, o = {}) {
    const k = hgt / 29.4, X = (lo) => cx + (lo - 82.5) * k * 0.9, Y = (la) => cy - (la - 22.5) * k;
    const pts = INDIA.map(([lo, la]) => [X(lo), Y(la)]);
    if (o.fill) { ctx.save(); ctx.fillStyle = o.fill; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill(); ctx.restore(); }
    BP.poly(ctx, pts, Object.assign({ close: true, w: 2.4, seed: 31 }, o));
    return { X, Y, pts };
  };

  // ---------- sheet: paper, creases, grid, border ----------
  const paperCache = {};
  function paperLayer(W, Hh, seed) {
    const key = W + 'x' + Hh + ':' + seed;
    if (paperCache[key]) return paperCache[key];
    const c = H.layer(W, Hh), x = c.getContext('2d');
    H.paper(x, W, Hh, C.paper, seed, 0.1);
    const r = H.rng(seed + 1);
    for (let i = 0; i < 16; i++) { // sun-faded blotches
      const bx = r() * W, by = r() * Hh, rad = r.range(120, 380), g = x.createRadialGradient(bx, by, 0, bx, by, rad);
      const lite = r() < 0.5; g.addColorStop(0, lite ? 'rgba(46,106,168,0.10)' : 'rgba(3,20,44,0.12)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(bx - rad, by - rad, rad * 2, rad * 2);
    }
    x.strokeStyle = 'rgba(150,210,255,0.05)'; x.lineWidth = 1; // paper fibres
    for (let i = 0; i < 700; i++) { const fx = r() * W, fy = r() * Hh, a = r() * Math.PI, l = r.range(6, 22); x.beginPath(); x.moveTo(fx, fy); x.lineTo(fx + Math.cos(a) * l, fy + Math.sin(a) * l); x.stroke(); }
    const n = H.makeNoise(seed + 2); // fold creases: two vertical, one horizontal
    const crease = (horiz, at) => {
      const pts = []; const len = horiz ? W : Hh;
      for (let t = 0; t <= len; t += 8) pts.push(horiz ? [t, at + n.n2(t * 0.02, at) * 2.5] : [at + n.n2(at, t * 0.02) * 2.5, t]);
      [['rgba(2,14,32,0.30)', 0], ['rgba(140,200,255,0.13)', 2.2]].forEach(([col, off]) => {
        x.strokeStyle = col; x.lineWidth = 1.8; x.beginPath();
        pts.forEach(([px, py], i) => { const qx = horiz ? px : px + off, qy = horiz ? py + off : py; i ? x.lineTo(qx, qy) : x.moveTo(qx, qy); });
        x.stroke();
      });
    };
    crease(false, Math.round(W / 3)); crease(false, Math.round(W * 2 / 3)); crease(true, Math.round(Hh / 2));
    return (paperCache[key] = c);
  }
  BP.grid = function (ctx, W, Hh) {
    ctx.save(); ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 20) { ctx.strokeStyle = x % 100 === 0 ? 'rgba(134,220,255,0.15)' : 'rgba(134,220,255,0.06)'; ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, Hh); ctx.stroke(); }
    for (let y = 0; y <= Hh; y += 20) { ctx.strokeStyle = y % 100 === 0 ? 'rgba(134,220,255,0.15)' : 'rgba(134,220,255,0.06)'; ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke(); }
    ctx.restore();
  };
  // zoned drafting border; header (corner label) and title block both >= 28px
  BP.border = function (ctx, W, Hh, o = {}) {
    const e = { w: 2, seed: 61, a: 0.95 };
    BP.rect(ctx, 14, 14, W - 28, Hh - 28, e);
    BP.rect(ctx, 26, 26, W - 52, Hh - 52, { w: 1.2, seed: 62, a: 0.7 });
    ctx.save(); ctx.strokeStyle = C.ink; ctx.globalAlpha = 0.7; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let x = 26 + 120; x < W - 26; x += 160) { ctx.moveTo(x, 14); ctx.lineTo(x, 26); ctx.moveTo(x, Hh - 26); ctx.lineTo(x, Hh - 14); }
    for (let y = 26 + 90; y < Hh - 26; y += 150) { ctx.moveTo(14, y); ctx.lineTo(26, y); ctx.moveTo(W - 26, y); ctx.lineTo(W - 14, y); }
    ctx.stroke(); ctx.restore();
    if (o.header) BP.label(ctx, o.header, 44, 70, 28, { weight: 600, col: C.cyan, plate: true });
    if (o.block) {
      const w = BP.tw(ctx, o.block, 28) + 28, x = W - 26 - w, y = Hh - 26 - 46;
      ctx.save(); ctx.fillStyle = C.plate; ctx.fillRect(x, y, w, 46); ctx.restore();
      BP.rect(ctx, x, y, w, 46, { w: 1.6, seed: 63 });
      BP.text(ctx, o.block, x + 14, y + 33, 28, { col: C.ink, weight: 400 });
    }
  };

  // ---------- full frame: paper -> ink layer (grid + content) -> bleed/glow/misregistration -> scanlines/vignette/grain ----------
  let inkL = null;
  const tmpLayers = [];
  const tmpLayer = (i, W, Hh) => tmpLayers[i] || (tmpLayers[i] = H.layer(W, Hh));
  BP.now = null; // film clock (seconds); null in the storyboard so stills are static
  BP.frame = function (ctx, W, Hh, fn, o = {}) {
    const seed = o.seed || 11;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
    ctx.drawImage(paperLayer(W, Hh, seed), 0, 0);
    inkL = inkL || H.layer(W, Hh);
    const ix = inkL.getContext('2d'); ix.setTransform(1, 0, 0, 1, 0, 0); ix.globalAlpha = 1; ix.clearRect(0, 0, W, Hh);
    const applyCam = (x, cam) => { if (cam) { x.translate(W / 2, Hh / 2); x.scale(cam.z || 1, cam.z || 1); x.translate(-(cam.x == null ? W / 2 : cam.x), -(cam.y == null ? Hh / 2 : cam.y)); } };
    ix.save();
    applyCam(ix, o.gridCam || o.cam);
    BP.grid(ix, W, Hh);
    ix.restore();
    if (o.layers) { // transitions: each layer is drawn alone, then faded in or revealed by a left-to-right sweep
      o.layers.forEach((L, i) => {
        const c = tmpLayer(i, W, Hh), x = c.getContext('2d');
        x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.clearRect(0, 0, W, Hh);
        x.save(); applyCam(x, L.cam); L.draw(x); x.restore();
        ix.save(); ix.globalAlpha = L.alpha == null ? 1 : L.alpha;
        if (L.reveal != null) { ix.beginPath(); ix.rect(0, 0, W * L.reveal, Hh); ix.clip(); }
        if (L.from != null) { ix.beginPath(); ix.rect(W * L.from, 0, W * (1 - L.from), Hh); ix.clip(); }
        ix.drawImage(c, 0, 0); ix.restore();
      });
    } else { ix.save(); applyCam(ix, o.cam); fn(ix); ix.restore(); }
    if (o.overlay) o.overlay(ix);
    BP.border(ix, W, Hh, o);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.filter = 'blur(5px)'; ctx.globalAlpha = 0.5; ctx.drawImage(inkL, 0, 0);          // glow
    ctx.filter = 'blur(0.7px)'; ctx.globalAlpha = 0.14; ctx.drawImage(inkL, 1.6, 1.0);    // misregistration ghost
    ctx.restore();
    ctx.drawImage(inkL, 0, 0);
    ctx.save(); ctx.fillStyle = 'rgba(0,10,28,0.07)';                                      // scanlines
    for (let y = 0; y < Hh; y += 3) ctx.fillRect(0, y, W, 1);
    ctx.restore();
    H.vignette(ctx, W, Hh, 0.55, '2,10,25');
    H.grain(ctx, W, Hh, 0.05, o.grainSeed || seed);
  };
})();
