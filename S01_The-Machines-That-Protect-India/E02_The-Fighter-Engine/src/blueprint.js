// Engineering Blueprint drawing kit, v2, built on the unchanged H library (lib/harness.js).
// v2 changes over Episode 1: exact circles, leaders/links attach to named anchor points, whole-word text reveals,
// layered bloom from a bright-pass (paper never lifts), white-hot pen trail that cools to cyan, quieter grid and scanlines.
// Every function is a pure function of its arguments: wobble and texture come from H.makeNoise / H.rng.
(function () {
  const BP = (window.BP = {});
  const clamp = H.clamp;
  const C = (BP.C = {
    paper: '#0b3763', ink: '#eef6ff', cyan: '#86dcff', dim: 'rgba(134,220,255,0.38)',
    red: '#ff5b4a', orange: '#ff9b3d', plate: 'rgba(9,44,86,0.9)', hot: '#ffffff',
  });
  BP.FONT = "'IBM Plex Mono','Space Mono',Consolas,'Courier New',monospace";
  BP.W = 1280; BP.H = 720;
  BP.seg = (p, a, b) => clamp((p - a) / (b - a)); // 0 before a, 1 after b

  const nzCache = {};
  const nz = (s) => nzCache[s] || (nzCache[s] = H.makeNoise(s));

  // ---------- named anchor points: leaders and links can only attach to a point an object has registered ----------
  let anchors = {};
  BP.resetAnchors = () => { anchors = {}; };
  BP.pt = (name, x, y) => { anchors[name] = [x, y]; return anchors[name]; };
  BP.ref = (name) => {
    const a = anchors[name];
    if (!a) throw new Error('unknown anchor: ' + name);
    return a;
  };

  // ---------- hand-drawn line quality (straight lines wobble gently, curves do not) ----------
  function wobble(pts, seed, amp) {
    const n = nz(seed), out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
      const len = Math.hypot(x2 - x1, y2 - y1), k = Math.max(1, Math.round(len / 22));
      const nx = -(y2 - y1) / (len || 1), ny = (x2 - x1) / (len || 1);
      for (let j = 0; j < k; j++) {
        const t = j / k, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
        const o = j === 0 ? 0 : n.n2(x * 0.05 + i * 3.1, y * 0.05) * amp; // vertices stay exact so corners meet
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
  const pathLen = (pts) => { let s = 0; for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return s; };
  // deterministic +-8% line-weight variation per stroke seed
  const weightJitter = (seed) => 0.92 + 0.16 * (Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1);

  const tracePath = (c, pts) => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); };

  // ink stroke: faint cyan bleed underneath, crisp line on top. o.hot (0..1) also writes the stroke to the hot layer (bloom source)
  BP.stroke = function (ctx, pts, o = {}) {
    if (pts.length < 2) return;
    const w = o.w || 2, col = o.col || C.ink, a = o.a == null ? 1 : o.a;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (o.dash) { ctx.setLineDash(o.dash); ctx.lineDashOffset = o.march && BP.now != null ? -BP.now * o.march : 0; } // march: dashes crawl along the line so a held sheet still moves
    if (o.bleed !== false) { ctx.globalAlpha = a * 0.14; ctx.strokeStyle = C.cyan; ctx.lineWidth = w + 3; tracePath(ctx, pts); ctx.stroke(); }
    ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = w; tracePath(ctx, pts); ctx.stroke();
    ctx.restore();
    const hc = BP._hot;
    if (o.hot && hc) {
      hc.save(); hc.setTransform(ctx.getTransform()); hc.lineCap = 'round'; hc.lineJoin = 'round';
      hc.globalAlpha = o.hot * a; hc.strokeStyle = C.hot; hc.lineWidth = w + 1; tracePath(hc, pts); hc.stroke(); hc.restore();
    }
  };

  // plotter head with a white-hot centre
  BP.pen = function (ctx, pt) {
    if (!pt) return;
    ctx.save(); ctx.strokeStyle = C.cyan; ctx.globalAlpha = 0.9; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(pt[0], pt[1], 6, 0, Math.PI * 2); ctx.moveTo(pt[0] - 12, pt[1]); ctx.lineTo(pt[0] + 12, pt[1]); ctx.moveTo(pt[0], pt[1] - 12); ctx.lineTo(pt[0], pt[1] + 12); ctx.stroke();
    ctx.restore();
    BP.dot(ctx, pt[0], pt[1], 2.6, C.hot, 1, true);
  };

  // the freshly inked tail of a stroke: white-hot at the pen, cooling to the stroke colour over the trail length
  function hotTrail(ctx, part, o) {
    const total = pathLen(part), trail = Math.min(total, Math.max(34, total * 0.16));
    const tail = []; let acc = 0;
    for (let i = part.length - 1; i > 0 && acc < trail; i--) { tail.unshift(part[i]); acc += Math.hypot(part[i][0] - part[i - 1][0], part[i][1] - part[i - 1][1]); }
    if (tail.length < 2) return;
    const n = 6, per = Math.ceil(tail.length / n);
    for (let k = 0; k < n; k++) {
      const seg = tail.slice(Math.max(0, k * per - 1), (k + 1) * per + 1); if (seg.length < 2) continue;
      const heat = (k + 1) / n; // 1 at the pen
      BP.stroke(ctx, seg, { w: (o.w || 2) * (1 + 0.5 * heat), col: heat > 0.6 ? C.hot : o.col || C.ink, a: o.a, bleed: false, hot: heat });
    }
  }

  BP.poly = function (ctx, pts, o = {}) {
    const p = o.p == null ? 1 : o.p;
    if (p <= 0) return null;
    const closed = o.close ? pts.concat([pts[0]]) : pts;
    const q = o.j === 0 ? closed : wobble(closed, o.seed || 1, o.j == null ? 0.7 : o.j);
    const part = partial(q, p);
    if (o.fill && p >= 1) {
      ctx.save(); ctx.fillStyle = o.fill; ctx.beginPath();
      part.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
    const so = Object.assign({}, o, { w: (o.w || 2) * weightJitter(o.seed || 1) });
    BP.stroke(ctx, part, so);
    if (p < 1) { hotTrail(ctx, part, so); if (o.pen) BP.pen(ctx, part[part.length - 1]); }
    return part[part.length - 1];
  };
  BP.line = (ctx, x1, y1, x2, y2, o) => BP.poly(ctx, [[x1, y1], [x2, y2]], o);

  // rectangle drawn as four edges that overshoot their corners slightly, like a hand-drafted box
  BP.rect = function (ctx, x, y, w, h, o = {}) {
    const p = o.p == null ? 1 : o.p; if (p <= 0) return;
    if (o.over === false) return BP.poly(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], Object.assign({ close: true }, o));
    const ov = o.ov == null ? 3 : o.ov;
    const edges = [[x - ov, y, x + w + ov, y], [x + w, y - ov, x + w, y + h + ov], [x + w + ov, y + h, x - ov, y + h], [x, y + h + ov, x, y - ov]];
    edges.forEach((e, i) => BP.line(ctx, e[0], e[1], e[2], e[3], Object.assign({}, o, { seed: (o.seed || 1) + i, p: BP.seg(p, i / 4, (i + 1) / 4) })));
    return null;
  };

  // exact circle/arc: no wobble, no radius noise; dense points so the polygon is visually round
  BP.arc = function (ctx, cx, cy, r, a0, a1, o = {}) {
    const n = Math.max(32, Math.ceil(Math.abs(a1 - a0) * r / 2.5)), pts = [];
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    if (Math.abs(Math.abs(a1 - a0) - Math.PI * 2) < 1e-9) pts[n] = pts[0].slice(); // closes exactly
    return BP.poly(ctx, pts, Object.assign({}, o, { j: 0 }));
  };
  BP.circle = (ctx, cx, cy, r, o = {}) => BP.arc(ctx, cx, cy, r, o.a0 == null ? -Math.PI / 2 : o.a0, (o.a0 == null ? -Math.PI / 2 : o.a0) + Math.PI * 2, o);
  BP.dot = function (ctx, x, y, r, col, a = 1, hot) {
    ctx.save(); ctx.globalAlpha = a * 0.22; ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(x, y, r + 3, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = a; ctx.fillStyle = col || C.ink; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    if (hot && BP._hot) { const hc = BP._hot; hc.save(); hc.setTransform(ctx.getTransform()); hc.globalAlpha = a; hc.fillStyle = C.hot; hc.beginPath(); hc.arc(x, y, r + 1, 0, Math.PI * 2); hc.fill(); hc.restore(); }
  };

  // ---------- lettering: whole words, revealed one at a time by a quick left-to-right wipe ----------
  BP.tw = function (ctx, s, size, o = {}) {
    ctx.save(); ctx.font = `${o.weight || 600} ${size}px ${BP.FONT}`; ctx.letterSpacing = (o.ls == null ? size * 0.04 : o.ls) + 'px';
    const w = ctx.measureText(s).width; ctx.restore(); return w;
  };
  // word i of n wipes in while p moves through its slice; every word is complete by p = 1
  const wordProgress = (p, i, n) => clamp(p * (n * 0.8 + 0.4) - i * 0.8);
  BP.text = function (ctx, s, x, y, size, o = {}) {
    const p = o.p == null ? 1 : clamp(o.p);
    if (p <= 0) return;
    const full = BP.tw(ctx, s, size, o), align = o.align || 'left';
    const x0 = align === 'center' ? x - full / 2 : align === 'right' ? x - full : x;
    const a = o.a == null ? 1 : o.a;
    ctx.save(); ctx.font = `${o.weight || 600} ${size}px ${BP.FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.letterSpacing = (o.ls == null ? size * 0.04 : o.ls) + 'px'; ctx.fillStyle = o.col || C.ink; ctx.globalAlpha = a;
    const hc = BP._hot, drawWord = (c, str, wx) => c.fillText(str, wx, y);
    if (p >= 1) {
      ctx.fillText(s, x0, y);
      if (hc && o.hot) { hc.save(); hc.setTransform(ctx.getTransform()); hc.font = ctx.font; hc.letterSpacing = ctx.letterSpacing; hc.textBaseline = 'alphabetic'; hc.fillStyle = C.hot; hc.globalAlpha = o.hot * a; hc.fillText(s, x0, y); hc.restore(); }
    } else {
      const words = s.split(' ');
      words.forEach((wd, i) => {
        const wp = wordProgress(p, i, words.length); if (wp <= 0) return;
        const pre = i ? BP.tw(ctx, words.slice(0, i).join(' ') + ' ', size, o) : 0, ww = BP.tw(ctx, wd, size, o);
        ctx.save(); ctx.beginPath(); ctx.rect(x0 + pre - 3, y - size * 1.05, (ww + 6) * H.ease.out(wp), size * 1.4); ctx.clip();
        drawWord(ctx, wd, x0 + pre); ctx.restore();
        if (hc && wp < 1) { // the word being inked is white-hot
          hc.save(); hc.setTransform(ctx.getTransform()); hc.font = ctx.font; hc.letterSpacing = ctx.letterSpacing; hc.fillStyle = C.hot; hc.globalAlpha = a * 0.9;
          hc.beginPath(); hc.rect(x0 + pre - 3, y - size * 1.05, (ww + 6) * H.ease.out(wp), size * 1.4); hc.clip(); drawWord(hc, wd, x0 + pre); hc.restore();
        }
      });
    }
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
  // boxed stamp, e.g. FICTIONAL SCENARIO
  BP.stamp = function (ctx, s, x, y, size, o = {}) {
    const p = o.p == null ? 1 : o.p; if (p <= 0) return;
    const w = BP.tw(ctx, s, size, o), pad = 14, x0 = x - w / 2;
    BP.rect(ctx, x0 - pad, y - size * 0.95, w + pad * 2, size * 1.35, { w: 2.2, col: o.col, seed: o.seed || 5, p: BP.seg(p, 0, 0.5), a: o.a });
    BP.text(ctx, s, x0, y, size, { col: o.col, p: BP.seg(p, 0.3, 1), a: o.a, hot: 0.6 });
  };

  // ---------- drafting furniture ----------
  BP.arrowhead = function (ctx, x, y, ang, size, o = {}) {
    const s = size || 14;
    ctx.save(); ctx.globalAlpha = o.a == null ? 1 : o.a; ctx.fillStyle = o.col || C.ink; ctx.translate(x, y); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-s, -s * 0.36); ctx.lineTo(-s, s * 0.36); ctx.closePath(); ctx.fill(); ctx.restore();
  };
  // the tip of the head sits exactly on (x2, y2); the shaft stops at the head's base
  BP.arrow = function (ctx, x1, y1, x2, y2, o = {}) {
    const p = o.p == null ? 1 : o.p; if (p <= 0) return;
    const h = o.h || 16, len = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    BP.line(ctx, x1, y1, x2 - ux * h * 0.8, y2 - uy * h * 0.8, Object.assign({}, o, { p: clamp(p / 0.85) }));
    if (p > 0.85) BP.arrowhead(ctx, x2, y2, Math.atan2(uy, ux), h, o);
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
  // leader from a registered anchor: dot on the target, straight line to an elbow, shelf under the text
  BP.leaderTo = function (ctx, anchor, ex, ey, txt, o = {}) {
    const p = o.p == null ? 1 : o.p; if (p <= 0) return;
    const [tx, ty] = BP.ref(anchor);
    const size = o.size || 28, right = (o.side || (ex >= tx ? 'r' : 'l')) === 'r';
    BP.dot(ctx, tx, ty, BP.now == null ? 4 : 4 + 1.2 * Math.sin(BP.now * 4), o.col, clamp(p * 4));
    BP.line(ctx, tx, ty, ex, ey, { w: 1.6, seed: o.seed || 4, p: BP.seg(p, 0, 0.5), col: o.col });
    const w = BP.tw(ctx, txt, size);
    const sx = right ? ex + w + 16 : ex - w - 16;
    BP.line(ctx, ex, ey, sx, ey, { w: 1.6, seed: (o.seed || 4) + 1, p: BP.seg(p, 0.4, 0.8), col: o.col });
    BP.text(ctx, txt, right ? ex + 8 : ex - 8 - w, ey - 9, size, { p: BP.seg(p, 0.5, 1), col: o.col, weight: 600 });
  };
  // same, with the elbow placed relative to the anchor so the label follows the drawing if it is moved or rescaled
  BP.leaderBy = function (ctx, anchor, dx, dy, txt, o = {}) {
    const [tx, ty] = BP.ref(anchor);
    return BP.leaderTo(ctx, anchor, tx + dx, ty + dy, txt, Object.assign({ side: dx >= 0 ? 'r' : 'l' }, o));
  };
  // straight link between two registered anchors
  BP.link = function (ctx, from, to, o = {}) {
    const [x1, y1] = BP.ref(from), [x2, y2] = BP.ref(to);
    return o.arrow ? BP.arrow(ctx, x1, y1, x2, y2, o) : BP.line(ctx, x1, y1, x2, y2, o);
  };
  BP.hatch = function (ctx, poly, ang, gap, o = {}) {
    const p = o.p == null ? 1 : o.p; if (p <= 0) return;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    poly.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
    ctx.save(); ctx.beginPath(); poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip();
    ctx.strokeStyle = o.col || C.cyan; ctx.globalAlpha = o.a == null ? 0.6 : o.a; ctx.lineWidth = o.w || 1.1;
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
    x.strokeStyle = 'rgba(150,210,255,0.04)'; x.lineWidth = 1; // paper fibres
    for (let i = 0; i < 700; i++) { const fx = r() * W, fy = r() * Hh, a = r() * Math.PI, l = r.range(6, 22); x.beginPath(); x.moveTo(fx, fy); x.lineTo(fx + Math.cos(a) * l, fy + Math.sin(a) * l); x.stroke(); }
    const n = H.makeNoise(seed + 2); // fold creases: two vertical, one horizontal
    const crease = (horiz, at) => {
      const pts = []; const len = horiz ? W : Hh;
      for (let t = 0; t <= len; t += 8) pts.push(horiz ? [t, at + n.n2(t * 0.02, at) * 2.5] : [at + n.n2(at, t * 0.02) * 2.5, t]);
      [['rgba(2,14,32,0.26)', 0], ['rgba(140,200,255,0.10)', 2.2]].forEach(([col, off]) => {
        x.strokeStyle = col; x.lineWidth = 1.8; x.beginPath();
        pts.forEach(([px, py], i) => { const qx = horiz ? px : px + off, qy = horiz ? py + off : py; i ? x.lineTo(qx, qy) : x.moveTo(qx, qy); });
        x.stroke();
      });
    };
    crease(false, Math.round(W / 3)); crease(false, Math.round(W * 2 / 3)); crease(true, Math.round(Hh / 2));
    return (paperCache[key] = c);
  }
  BP.grid = function (ctx, W, Hh) { // quieter than Episode 1: the grid is a reference, not a texture
    ctx.save(); ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 20) { ctx.strokeStyle = x % 100 === 0 ? 'rgba(134,220,255,0.09)' : 'rgba(134,220,255,0.035)'; ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, Hh); ctx.stroke(); }
    for (let y = 0; y <= Hh; y += 20) { ctx.strokeStyle = y % 100 === 0 ? 'rgba(134,220,255,0.09)' : 'rgba(134,220,255,0.035)'; ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke(); }
    ctx.restore();
  };
  // zoned drafting border; header (corner label) and title block both >= 28px
  BP.border = function (ctx, W, Hh, o = {}) {
    const e = { w: 2, seed: 61, a: 0.95 };
    BP.rect(ctx, 14, 14, W - 28, Hh - 28, Object.assign({ over: false }, e));
    BP.rect(ctx, 26, 26, W - 52, Hh - 52, { w: 1.2, seed: 62, a: 0.7, over: false });
    ctx.save(); ctx.strokeStyle = C.ink; ctx.globalAlpha = 0.6; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let x = 26 + 120; x < W - 26; x += 160) { ctx.moveTo(x, 14); ctx.lineTo(x, 26); ctx.moveTo(x, Hh - 26); ctx.lineTo(x, Hh - 14); }
    for (let y = 26 + 90; y < Hh - 26; y += 150) { ctx.moveTo(14, y); ctx.lineTo(26, y); ctx.moveTo(W - 26, y); ctx.lineTo(W - 14, y); }
    ctx.stroke(); ctx.restore();
    if (o.header) BP.label(ctx, o.header, 44, 70, 28, { weight: 600, col: C.cyan, plate: true });
    if (o.block) {
      const w = BP.tw(ctx, o.block, 28) + 28, x = W - 26 - w, y = Hh - 26 - 46;
      ctx.save(); ctx.fillStyle = C.plate; ctx.fillRect(x, y, w, 46); ctx.restore();
      BP.rect(ctx, x, y, w, 46, { w: 1.6, seed: 63, over: false });
      BP.text(ctx, o.block, x + 14, y + 33, 28, { col: C.ink, weight: 400 });
    }
  };

  // ---------- bloom: bright-pass -> three blurs (tight, medium, wide); only the brightest ink glows ----------
  let halfL = null, midL = null, wideL = null;
  function brightPass(src, hot) {
    halfL = halfL || H.layer(640, 360);
    const hx = halfL.getContext('2d', { willReadFrequently: true });
    hx.setTransform(1, 0, 0, 1, 0, 0); hx.globalCompositeOperation = 'source-over'; hx.globalAlpha = 1; hx.clearRect(0, 0, 640, 360);
    hx.drawImage(src, 0, 0, 640, 360);
    const img = hx.getImageData(0, 0, 640, 360), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const al = d[i + 3] / 255; let wgt = 0;
      if (al > 0.5) {
        const r = d[i], g = d[i + 1], b = d[i + 2], luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if (luma > 215) wgt = clamp((luma - 215) / 35) * al;
        else if (r > 235 && g > 100 && g < 200 && b < 130) wgt = al * 0.85; // orange / red accents glow too
      }
      d[i + 3] = wgt * 255;
    }
    hx.putImageData(img, 0, 0);
    hx.globalCompositeOperation = 'lighter'; hx.drawImage(hot, 0, 0, 640, 360); hx.globalCompositeOperation = 'source-over';
    return halfL;
  }
  function bloom(ctx, W, Hh, src, hot) {
    const bp = brightPass(src, hot);
    midL = midL || H.layer(640, 360); wideL = wideL || H.layer(320, 180);
    const mx = midL.getContext('2d'), wx = wideL.getContext('2d');
    mx.setTransform(1, 0, 0, 1, 0, 0); mx.clearRect(0, 0, 640, 360); mx.filter = 'blur(3px)'; mx.drawImage(bp, 0, 0); mx.filter = 'none';
    wx.setTransform(1, 0, 0, 1, 0, 0); wx.clearRect(0, 0, 320, 180); wx.filter = 'blur(5px)'; wx.drawImage(bp, 0, 0, 320, 180); wx.filter = 'none';
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.34; ctx.drawImage(wideL, 0, 0, W, Hh);                                    // wide: atmosphere
    ctx.globalAlpha = 0.40; ctx.drawImage(midL, 0, 0, W, Hh);                                     // medium: lit lines
    ctx.filter = 'blur(1px) sepia(0.45) saturate(1.4)'; ctx.globalAlpha = 0.42; ctx.drawImage(bp, 0, 0, W, Hh); // tight, warmer core
    ctx.restore();
  }

  // ---------- full frame: paper -> ink layer (grid + content) -> bloom -> finish (scanlines, vignette, grade, grain) ----------
  let inkL = null, hotL = null;
  const tmpLayers = [];
  const tmpLayer = (i, W, Hh) => tmpLayers[i] || (tmpLayers[i] = H.layer(W, Hh));
  BP.now = null; // film clock (seconds); null in static stills
  BP.frame = function (ctx, W, Hh, fn, o = {}) {
    const seed = o.seed || 11;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
    ctx.drawImage(paperLayer(W, Hh, seed), 0, 0);
    inkL = inkL || H.layer(W, Hh); hotL = hotL || H.layer(W, Hh);
    const ix = inkL.getContext('2d'), hx = hotL.getContext('2d');
    [ix, hx].forEach((c) => { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, W, Hh); });
    const applyCam = (x, cam) => { if (cam) { x.translate(W / 2, Hh / 2); x.scale(cam.z || 1, cam.z || 1); x.translate(-(cam.x == null ? W / 2 : cam.x), -(cam.y == null ? Hh / 2 : cam.y)); } };
    ix.save(); applyCam(ix, o.gridCam || o.cam); BP.grid(ix, W, Hh); ix.restore();
    if (o.layers) { // transitions: each layer is drawn alone (ink + hot), then faded in or revealed by a left-to-right sweep
      o.layers.forEach((L, i) => {
        const c = tmpLayer(i, W, Hh), x = c.getContext('2d'), hc = tmpLayer(i + 2, W, Hh), hxx = hc.getContext('2d');
        [x, hxx].forEach((q) => { q.setTransform(1, 0, 0, 1, 0, 0); q.globalAlpha = 1; q.clearRect(0, 0, W, Hh); });
        BP._hot = hxx; BP.resetAnchors();
        x.save(); applyCam(x, L.cam); L.draw(x); x.restore();
        BP._hot = null;
        [[ix, c], [hx, hc]].forEach(([dst, srcL]) => {
          dst.save(); dst.globalAlpha = L.alpha == null ? 1 : L.alpha;
          if (L.reveal != null) { dst.beginPath(); dst.rect(0, 0, W * L.reveal, Hh); dst.clip(); }
          if (L.from != null) { dst.beginPath(); dst.rect(W * L.from, 0, W * (1 - L.from), Hh); dst.clip(); }
          dst.drawImage(srcL, 0, 0); dst.restore();
        });
      });
    } else { BP._hot = hx; BP.resetAnchors(); ix.save(); applyCam(ix, o.cam); fn(ix); ix.restore(); BP._hot = null; }
    if (o.overlay) o.overlay(ix);
    BP.border(ix, W, Hh, o);
    ctx.drawImage(inkL, 0, 0);
    bloom(ctx, W, Hh, inkL, hotL);
    ctx.save(); ctx.fillStyle = 'rgba(0,10,28,0.035)';                                      // scanlines, quieter than Episode 1
    for (let y = 0; y < Hh; y += 3) ctx.fillRect(0, y, W, 1);
    ctx.restore();
    H.vignette(ctx, W, Hh, 0.5, '2,10,25');
    ctx.save(); ctx.globalCompositeOperation = 'soft-light';                                 // grade: warmer highlights, deeper blue shadows
    const g = ctx.createLinearGradient(0, 0, W, Hh); g.addColorStop(0, 'rgba(255,214,170,0.10)'); g.addColorStop(1, 'rgba(10,40,130,0.20)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, Hh); ctx.restore();
    H.grain(ctx, W, Hh, 0.04, o.grainSeed || seed);
  };
})();
