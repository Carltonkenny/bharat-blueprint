// kit-v2: the blueprint drawing layer (2D canvas). Layer A of the visual direction.
// Every stroke is a pure function of (t, params). Nothing reads the wall clock.
// Every piece of text and every named shape is registered with the scene report so
// QC gates B1..B17 can be evaluated without reading pixels.
(function () {
  const BB = (window.BB = window.BB || {});
  const D = (BB.draw = {});

  const clamp = (v, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  D.clamp = clamp;
  D.lerp = lerp;

  // ---------- deterministic wobble (a value-noise field, not randomness) ----------
  const noiseCache = {};
  function noise(seed) {
    if (noiseCache[seed]) return noiseCache[seed];
    let a = (seed >>> 0) || 1;
    const r = () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const perm = new Uint8Array(512);
    for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const tmp = perm[i]; perm[i] = perm[j]; perm[j] = tmp; }
    for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];
    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const g2 = (h, x, y) => {
      switch (h & 3) {
        case 0: return x + y;
        case 1: return -x + y;
        case 2: return x - y;
        default: return -x - y;
      }
    };
    const n2 = (x, y) => {
      const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
      x -= Math.floor(x); y -= Math.floor(y);
      const u = fade(x), v = fade(y);
      const A = perm[X] + Y, AA = perm[A] + Y, AB = perm[A + 1] + Y, B = perm[X + 1] + Y, BA = perm[B + 1] + Y;
      return lerp(
        lerp(g2(perm[AA] & 15, x, y), g2(perm[BA] & 15, x - 1, y), u),
        lerp(g2(perm[AB] & 15, x, y - 1), g2(perm[BB] & 15, x - 1, y - 1), u), v);
    };
    noiseCache[seed] = n2;
    return n2;
  }
  D.noise = noise;

  function wobble(pts, seed, amp) {
    if (!amp) return pts;
    const n = noise(seed), out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
      const len = Math.hypot(x2 - x1, y2 - y1), k = Math.min(300, Math.max(1, Math.round(len / 26)));
      const nx = -(y2 - y1) / (len || 1), ny = (x2 - x1) / (len || 1);
      for (let j = 0; j < k; j++) {
        const t = j / k, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
        const o = j === 0 || j === k - 1 ? 0 : n(x * 0.03 + i * 2.7, y * 0.03) * amp;
        out.push([x + nx * o, y + ny * o]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  function partial(pts, p) {
    if (p >= 1) return pts;
    if (p <= 0) return pts.slice(0, 1);
    const L = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
    let want = tot * p; const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      if (want >= L[i - 1]) { out.push(pts[i]); want -= L[i - 1]; }
      else {
        const t = want / (L[i - 1] || 1);
        out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]);
        break;
      }
    }
    return out;
  }

  const pathLen = (pts) => { let s = 0; for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return s; };
  const weightJitter = (seed) => 0.93 + 0.14 * (Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1);

  function tracePath(c, pts) {
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
  }

  // ---------- named anchors: leaders and links attach only to a registered point ----------
  let anchors = {};
  D.resetAnchors = () => { anchors = {}; };
  D.pt = (name, x, y) => { anchors[name] = [x, y]; return anchors[name]; };
  D.ref = (name) => {
    const a = anchors[name];
    if (!a) throw new Error('unknown anchor: ' + name);
    return a;
  };
  D.hasAnchor = (name) => !!anchors[name];

  // ---------- strokes ----------
  D.stroke = function (ctx, pts, o = {}) {
    if (!pts || pts.length < 2) return;
    const w = o.w || 2, col = o.col || '#eef6ff', a = o.a == null ? 1 : o.a;
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (o.dash) { ctx.setLineDash(o.dash); ctx.lineDashOffset = o.march && o.t ? -o.t * o.march : 0; }
    if (o.bleed !== false) {
      ctx.globalAlpha = a * 0.13;
      ctx.strokeStyle = o.bleedCol || '#8fe4ff';
      ctx.lineWidth = w + 3 * (D.scaleOf ? D.scaleOf(ctx) : 1);
      tracePath(ctx, pts); ctx.stroke();
    }
    ctx.globalAlpha = a;
    ctx.strokeStyle = col;
    ctx.lineWidth = w;
    tracePath(ctx, pts); ctx.stroke();
    ctx.restore();
  };

  D.scaleOf = function (ctx) {
    const m = ctx.getTransform();
    return m && m.a ? m.a : 1;
  };

  // A polyline that can be drawn on progressively, with a hot pen trail.
  D.poly = function (ctx, pts, o = {}) {
    const p = o.p == null ? 1 : o.p;
    if (p <= 0) return null;
    for (let i = 0; i < pts.length; i++) { if (!isFinite(pts[i][0]) || !isFinite(pts[i][1]) || Math.abs(pts[i][0]) > 20000 || Math.abs(pts[i][1]) > 20000) return null; }
    const closed = o.close ? pts.concat([pts[0]]) : pts;
    const q = o.j === 0 ? closed : wobble(closed, o.seed || 1, o.j == null ? 0.8 : o.j);
    const part = partial(q, p);
    if (o.fill && p >= 1) {
      ctx.save();
      ctx.fillStyle = o.fill;
      ctx.beginPath();
      part.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
    const so = Object.assign({}, o, { w: (o.w || 2) * weightJitter(o.seed || 1) });
    D.stroke(ctx, part, so);
    // the plotter pen marker is opt-in: an appearing crosshair reads as a jump (QC F3)
    if (p < 1 && o.pen === true) D.pen(ctx, part[part.length - 1]);
    return part[part.length - 1];
  };
  D.line = (ctx, x1, y1, x2, y2, o) => D.poly(ctx, [[x1, y1], [x2, y2]], o);

  // rectangle drawn as four slightly overshooting edges, like a hand-drafted box
  D.rect = function (ctx, x, y, w, h, o = {}) {
    const ov = o.overshoot == null ? 4 : o.overshoot;
    const p = o.p == null ? 1 : o.p;
    const pts = [
      [x - ov, y], [x + w + ov, y], [x + w + ov, y + h], [x - ov, y + h], [x - ov, y],
    ];
    const per = p * 4;
    if (per <= 1) { D.poly(ctx, pts.slice(0, 2), o); }
    else if (per <= 2) { D.poly(ctx, pts.slice(0, 3), o); }
    else if (per <= 3) { D.poly(ctx, pts.slice(0, 4), o); }
    else D.poly(ctx, pts, o);
    return { x0: x, y0: y, x1: x + w, y1: y + h };
  };

  D.circle = function (ctx, cx, cy, r, o = {}) {
    const n = Math.max(24, Math.round(r / 2.2));
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    D.poly(ctx, pts, o);
    return { x0: cx - r, y0: cy - r, x1: cx + r, y1: cy + r };
  };

  D.arc = function (ctx, cx, cy, r, a0, a1, o = {}) {
    const n = Math.max(8, Math.round((Math.abs(a1 - a0) * r) / 4));
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * (i / n);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    D.poly(ctx, pts, o);
    return pts;
  };

  D.dot = function (ctx, x, y, r, col, a = 1, hot = false) {
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = col || '#ffffff';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    if (hot) {
      ctx.globalAlpha = a * 0.35; ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  // plotter head with a crosshair
  D.pen = function (ctx, pt, col) {
    if (!pt) return;
    ctx.save();
    ctx.strokeStyle = col || '#8fe4ff'; ctx.globalAlpha = 0.9; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(pt[0], pt[1], 6, 0, Math.PI * 2);
    ctx.moveTo(pt[0] - 12, pt[1]); ctx.lineTo(pt[0] + 12, pt[1]);
    ctx.moveTo(pt[0], pt[1] - 12); ctx.lineTo(pt[0], pt[1] + 12);
    ctx.stroke(); ctx.restore();
  };

  // ---------- text ----------
  // Draws whole words only as the reveal progresses (never a fragment of a word).
  // Registers the drawn box with the scene report.
  // Draws text. With clamp:true the box is kept inside the safe area by changing the
  // alignment, so a long label never leaves the frame.
  D.text = function (ctx, s, x, y, size, o = {}) {
    const p = o.p == null ? 1 : o.p;
    const words = String(s).split(/\s+/).filter(Boolean);
    // whole words only; the first word appears as soon as the reveal starts, so a
    // one-word label is never invisible
    const shown = p >= 1 ? words : (p > 0.12 ? words.slice(0, Math.max(1, Math.floor(p * words.length))) : []);
    const str = shown.join(' ');
    const col = o.col || '#eef6ff';
    const a = o.a == null ? 1 : o.a;
    let align = o.align || 'left';
    const weight = o.weight || 400;
    ctx.save();
    ctx.font = `${weight} ${size}px ${o.font || "'IBM Plex Mono','Space Mono',monospace"}`;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';
    let w = ctx.measureText(str).width;
    if (o.clamp) {
      const safe = o.safe || { x0: 0.05 * 1920, x1: 0.95 * 1920 };
      let x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
      let x1 = x0 + w;
      if (x0 < safe.x0) { align = 'left'; x = safe.x0; x0 = x; x1 = x + w; }
      if (x1 > safe.x1) { align = 'right'; x = safe.x1; x0 = x - w; x1 = x; }
      ctx.textAlign = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';
      w = ctx.measureText(str).width;
    }
    const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    if (o.plate) {
      ctx.globalAlpha = 0.86 * a;
      ctx.fillStyle = o.plate;
      const pad = size * 0.30;
      ctx.fillRect(x0 - pad, y - size * 0.86, w + pad * 2, size * 1.12);
      ctx.globalAlpha = a;
    }
    if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = size * 0.5; }
    ctx.globalAlpha = a;
    ctx.fillStyle = col;
    ctx.fillText(str, x, y);
    ctx.restore();

    if (a > 0.05 && str.length) {
      const box = {
        id: o.id || null, kind: 'text', text: str, full: str,
        x0, y0: y - size * 0.74, x1: x0 + w, y1: y + size * 0.18, ax: x, ay: y,
        color: col, opacity: a, size, weight, layer: o.layer || 'B', align,
        words: str.split(/\s+/).length,
      };
      if (BB.report) BB.report.add(box);
    }
    return { x0, w, text: str };
  };

  // multi-line text inside a zone
  D.textBlock = function (ctx, lines, x, y, size, o = {}) {
    const lh = o.lh || size * 1.42;
    let out = [];
    lines.forEach((ln, i) => { out.push(D.text(ctx, ln, x, y + i * lh, size, o)); });
    return out;
  };

  // leader from a registered anchor to a label, with an elbow
  D.leaderTo = function (ctx, anchor, x, y, label, o = {}) {
    const a = D.ref(anchor);
    const col = o.col || '#8fe4ff';
    const p = o.p == null ? 1 : o.p;
    const elbowX = o.elbowX == null ? (x < a[0] ? x + (a[0] - x) * 0.45 : x - (a[0] - x) * 0.45) : o.elbowX;
    const pts = [[a[0], a[1]], [elbowX, a[1]], [elbowX, y], [x, y]];
    D.poly(ctx, pts, { p, w: o.w || 1.4, col, seed: o.seed || 41, bleed: false });
    D.dot(ctx, a[0], a[1], o.dotR || 3, col, 1);
    if (label) {
      const size = o.size || 26;
      const align = x < a[0] ? 'left' : 'right';
      const lx = align === 'left' ? x + 8 : x - 8;
      D.text(ctx, label, lx, y + size * 0.34, size, { p, col: o.textCol || '#eef6ff', align, a: o.a, id: o.id, layer: o.layer || 'B' });
    }
  };

  // ---------- frame furniture ----------
  // Series 1 look: blueprint paper with a fixed fine grain and a soft vignette.
  // The grain is a deterministic tile (no randomness at render time) and it does not move,
  // so it adds richness without faking motion.
  let grainTile = null;
  function makeGrain() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const g = c.getContext('2d');
    const img = g.createImageData(256, 256);
    let a = 0x9e3779b9;
    const r = () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    for (let i = 0; i < 256 * 256; i++) {
      const v = 128 + Math.floor((r() - 0.5) * 70);
      img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c;
  }
  // The paper is identical every frame, so it is baked once into an offscreen canvas.
  let paperCache = null;
  function bakePaper(W, H, T) {
    const c = document.createElement('canvas');
    c.width = Math.round(W); c.height = Math.round(H);
    const ctx = c.getContext('2d');
    ctx.fillStyle = T.paper;
    ctx.fillRect(0, 0, W, H);
    if (!grainTile) grainTile = makeGrain();
    ctx.globalAlpha = 0.07;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ctx.createPattern(grainTile, 'repeat');
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createRadialGradient(W * 0.5, H * 0.46, H * 0.12, W * 0.5, H * 0.5, H * 0.95);
    g.addColorStop(0, 'rgba(255,255,255,0.045)');
    g.addColorStop(1, 'rgba(0,0,0,0.30)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    return c;
  }
  D.paper = function (ctx, W, H, T) {
    if (!paperCache || paperCache.w !== W || paperCache.h !== H || paperCache.col !== T.paper) {
      paperCache = { canvas: bakePaper(W, H, T), w: W, h: H, col: T.paper };
    }
    ctx.drawImage(paperCache.canvas, 0, 0, W, H);
  };

  // the blueprint grid, drawn inside the camera transform so a camera move is visible
  D.grid = function (ctx, W, H, T) {
    ctx.save();
    const step = 60 * T.scale;
    ctx.strokeStyle = T.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = step; x < W; x += step) { ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, H); }
    for (let y = step; y < H; y += step) { ctx.moveTo(0, Math.round(y) + 0.5); ctx.lineTo(W, Math.round(y) + 0.5); }
    ctx.stroke();
    ctx.restore();
  };

  // project a world anchor into screen (authoring) units, through the active camera
  D.project = function (name) {
    const a = D.ref(name);
    const c = BB.currentCamera || { scale: 1, x: 0, y: 0 };
    const W = BB.BASE_W, H = BB.BASE_H;
    return [
      (a[0] - W / 2) * (c.scale || 1) + W / 2 + (c.x || 0),
      (a[1] - H / 2) * (c.scale || 1) + H / 2 + (c.y || 0),
    ];
  };

  // The HUD layer lives in screen space; the camera never moves it.
  // Everything with text stays inside the safe area (QC B1).
  // The construction border marches continuously: a held sheet still moves (QC F2, F7).
  D.hud = function (ctx, W, H, T, o = {}) {
    const S = T.scale;
    ctx.save();
    // corner registration marks
    ctx.strokeStyle = T.dim; ctx.lineWidth = T.hair * 1.4;
    const m = 40 * S, len = 26 * S;
    [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(x, y + sy * len); ctx.lineTo(x, y); ctx.lineTo(x + sx * len, y);
      ctx.stroke();
    });
    // double construction border (Series 1 frame)
    ctx.strokeStyle = T.cyan; ctx.globalAlpha = 0.55;
    ctx.lineWidth = T.line * 1.1;
    ctx.strokeRect(22 * S, 22 * S, W - 44 * S, H - 44 * S);
    ctx.globalAlpha = 0.30; ctx.lineWidth = T.hair * 1.2;
    ctx.strokeRect(34 * S, 34 * S, W - 68 * S, H - 68 * S);
    ctx.globalAlpha = 1;
    // scene tag: boxed, top-left, in the safe area (e.g. "SC.3 - THE PUMP")
    if (o.scene) {
      const size = T.type.micro;
      ctx.font = `400 ${size}px ${T.font}`;
      const w = ctx.measureText(o.scene).width + size * 1.1;
      const x = W * 0.05, y = H * 0.06;
      ctx.fillStyle = 'rgba(4,20,44,0.55)';
      ctx.fillRect(x, y, w, size * 1.5);
      ctx.strokeStyle = T.cyan; ctx.globalAlpha = 0.7; ctx.lineWidth = T.hair * 1.4;
      ctx.strokeRect(x, y, w, size * 1.5);
      ctx.globalAlpha = 1;
      D.text(ctx, o.scene, x + size * 0.55, y + size * 1.08, size, { col: T.cyan, a: 0.95, layer: 'HUD' });
    }
    if (o.block) {
      const size = T.type.micro;
      ctx.font = `400 ${size}px ${T.font}`;
      const w = ctx.measureText(o.block).width + size * 1.1;
      const x = W * 0.95 - w, y = H * 0.94 - size * 1.5;
      ctx.fillStyle = 'rgba(4,20,44,0.55)';
      ctx.fillRect(x, y, w, size * 1.5);
      ctx.strokeStyle = T.cyan; ctx.globalAlpha = 0.7; ctx.lineWidth = T.hair * 1.4;
      ctx.strokeRect(x, y, w, size * 1.5);
      ctx.globalAlpha = 1;
      D.text(ctx, o.block, x + size * 0.55, y + size * 1.08, size, { col: T.cyan, a: 0.95, layer: 'HUD' });
    }
    ctx.restore();
  };

  // the FICTIONAL SCENARIO stamp, top band, left aligned
  D.stamp = function (ctx, W, H, T, alpha = 1) {
    const z = T.zone('TOP_BAND');
    const size = T.type.small;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = T.accent2; ctx.lineWidth = T.line;
    const w = size * 0.62 * 22;
    const x = (W - w) / 2, y = z.y0 + size * 1.05;
    ctx.fillStyle = 'rgba(40,18,4,0.55)'; ctx.fillRect(x, y - size * 0.86, w, size * 1.14);
    ctx.strokeRect(x, y - size * 0.86, w, size * 1.14);
    D.text(ctx, 'FICTIONAL SCENARIO', x + w / 2, y, size, { col: T.ink, align: 'center', layer: 'HUD' });
    ctx.restore();
  };

  // a tag such as CONCEPTUAL, NOT TO SCALE / SCHEMATIC / EXAGGERATED / ILLUSTRATIVE
  D.tag = function (ctx, W, H, T, text, o = {}) {
    const z = T.zone('TOP_BAND');
    const size = T.type.micro;
    const x = o.left ? z.x0 : z.x1;
    ctx.save();
    ctx.globalAlpha = o.a == null ? 1 : o.a;
    D.text(ctx, text, x, z.y0 + size * 1.05, size, { col: o.col || T.ink, align: o.left ? 'left' : 'right', layer: 'HUD' });
    ctx.restore();
  };

  // the honest number card plus its source chip
  D.numberCard = function (ctx, W, H, T, o = {}) {
    const z = T.zone('NUMBER_CARD');
    const pa = o.p == null ? 1 : Math.max(0, Math.min(1, o.p / 0.25));
    const size = o.size || T.type.sub;
    ctx.save();
    ctx.globalAlpha = (o.a == null ? 1 : o.a) * pa;
    ctx.fillStyle = T.panel;
    ctx.fillRect(z.x0 - 14, z.y0 - 16, (z.x1 - z.x0) + 28, (z.y1 - z.y0) + 32);
    ctx.strokeStyle = T.dim; ctx.lineWidth = T.hair * 2;
    ctx.strokeRect(z.x0 - 14, z.y0 - 16, (z.x1 - z.x0) + 28, (z.y1 - z.y0) + 32);
    ctx.restore();
    D.text(ctx, o.value, z.x0, z.y0 + size * 0.95, size, { col: o.col || T.accent, layer: 'B', id: o.id, a: (o.a == null ? 1 : o.a) * pa });
    if (o.sub) D.text(ctx, o.sub, z.x0, z.y0 + size * 1.95, T.type.small, { col: T.ink, layer: 'B', a: (o.a == null ? 1 : o.a) * pa });
    if (o.source) {
      const s = T.zone('SOURCE_CHIP');
      D.text(ctx, o.source, s.x0, s.y0 + T.type.micro * 0.9, T.type.micro, { col: T.dim, layer: 'B', a: (o.a == null ? 1 : o.a) * pa });
    }
  };

  // source chip alone (for numbers that are not a full card)
  D.sourceChip = function (ctx, W, H, T, source, o = {}) {
    const s = T.zone('SOURCE_CHIP');
    D.text(ctx, source, o.right ? s.x1 : s.x0, s.y0 + T.type.micro * 0.9, T.type.micro, { col: T.dim, align: o.right ? 'right' : 'left', layer: 'B' });
  };

  // title card text
  D.titleCard = function (ctx, W, H, T, title, sub, o = {}) {
    const z = T.zone('TITLE_CARD');
    const size = o.size || T.type.head;
    const cy = (z.y0 + z.y1) / 2;
    D.text(ctx, title, (z.x0 + z.x1) / 2, cy, size, { align: 'center', col: o.col || T.ink, a: o.a, layer: 'B' });
    if (sub) D.text(ctx, sub, (z.x0 + z.x1) / 2, cy + size * 0.95, T.type.label, { align: 'center', col: T.dim, a: o.a, layer: 'B' });
  };
})();
