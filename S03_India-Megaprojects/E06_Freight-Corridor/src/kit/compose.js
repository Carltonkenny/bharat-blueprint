// kit-v2 round 2: the scene composer. A beat is one template with a few parameters; the
// composer draws a full, annotated, moving blueprint page (Series 1 bar): a headline,
// the main drawing, leader-lined callouts and a motion element. World strokes are drawn
// in the world pass (under the camera); text, leaders and cards in the screen pass.
(function () {
  const BB = (window.BB = window.BB || {});
  const C = (BB.compose = {});
  const clamp = (v, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = (u) => 1 - Math.pow(1 - clamp(u), 3);
  const D = () => BB.draw;
  // an item revealed over [at, at+dur] of the beat progress p (p reaches 1 at ~36% of the beat)
  const rv = (p, at, dur = 0.22) => clamp((p - at) / dur);

  const FRAME = { x0: 400, y0: 310, x1: 1520, y1: 850 };
  BB.heroBox = BB.heroBox || {};
  const heroFit = new Map();
  BB.heroFit = heroFit;

  // ------------------------------------------------------------------ helpers
  function colOf(T, name, dflt) {
    if (!name) return dflt || T.ink;
    return { ink: T.ink, cyan: T.cyan, accent: T.accent, accent2: T.accent2, dim: T.dim }[name] || name;
  }

  function wrapLines(ctx, T, text, size, maxW) {
    return BB.labels.wrap(ctx, T, text, size, maxW);
  }

  function arrowHead(ctx, x, y, ang, col, s, w) {
    const d = D();
    const a1 = ang + Math.PI * 0.82, a2 = ang - Math.PI * 0.82;
    d.poly(ctx, [[x + Math.cos(a1) * s, y + Math.sin(a1) * s], [x, y], [x + Math.cos(a2) * s, y + Math.sin(a2) * s]], { p: 1, col, w, seed: 5, bleed: false, j: 0 });
  }

  function edgePt(n, tx, ty) {
    const dx = tx - n.cx, dy = ty - n.cy;
    if (n.kind === 'circle') { const r = Math.min(n.w, n.h) / 2; const L = Math.hypot(dx, dy) || 1; return [n.cx + dx / L * r, n.cy + dy / L * r]; }
    const k = Math.min(dx ? (n.w / 2) / Math.abs(dx) : 1e9, dy ? (n.h / 2) / Math.abs(dy) : 1e9);
    return [n.cx + dx * k, n.cy + dy * k];
  }

  // ------------------------------------------------------------------ layouts
  function layoutNodes(op) {
    const nodes = (op.nodes || []).map((n) => (typeof n === 'string' ? { t: n } : Object.assign({}, n)));
    const n = nodes.length, L = op.layout || 'row', out = [];
    if (L === 'row') {
      const gap = op.gap || 120, h = op.h || (n <= 3 ? 230 : 170);
      const w = op.w || Math.min(n <= 2 ? 600 : n === 3 ? 460 : 340, (1560 - gap * (n - 1)) / n);
      const x0 = (1920 - (w * n + gap * (n - 1))) / 2, cy = op.cy || 590;
      nodes.forEach((nd, i) => out.push(Object.assign(nd, { x: x0 + i * (w + gap), y: cy - h / 2, w, h })));
    } else if (L === 'col') {
      const gap = 30, h = Math.min(120, (500 - gap * (n - 1)) / n), w = op.w || 760;
      const y0 = 330 + (500 - (h * n + gap * (n - 1))) / 2;
      nodes.forEach((nd, i) => out.push(Object.assign(nd, { x: (1920 - w) / 2 + (op.dx || 0), y: y0 + i * (h + gap), w, h })));
    } else if (L === 'tri') {
      const pos = [[960, 440], [600, 740], [1320, 740]];
      nodes.forEach((nd, i) => out.push(Object.assign(nd, { x: pos[i][0] - 160, y: pos[i][1] - 70, w: 320, h: 140, kind: nd.kind || (i === 0 ? 'circle' : 'box') })));
    } else if (L === 'radial') {
      const R = op.R || 235, cx = 960, cy = 590;
      out.push(Object.assign(nodes[0], { x: cx - 150, y: cy - 150, w: 300, h: 300, kind: 'circle' }));
      for (let i = 1; i < n; i++) {
        const a = -Math.PI / 2 + ((i - 1) / (n - 1)) * Math.PI * 2;
        const x = cx + Math.cos(a) * R * 1.75, y = cy + Math.sin(a) * R * 1.05;
        out.push(Object.assign(nodes[i], { x: x - 150, y: y - 52, w: 300, h: 104 }));
      }
    } else if (L.indexOf('grid') === 0) {
      const cols = +L.split(':')[1] || 3, rows = Math.ceil(n / cols), gx = 44, gy = 44;
      const w = Math.min(430, (1560 - gx * (cols - 1)) / cols), h = Math.min(170, (500 - gy * (rows - 1)) / rows);
      const x0 = (1920 - (w * cols + gx * (cols - 1))) / 2, y0 = 590 - (h * rows + gy * (rows - 1)) / 2;
      nodes.forEach((nd, i) => out.push(Object.assign(nd, { x: x0 + (i % cols) * (w + gx), y: y0 + Math.floor(i / cols) * (h + gy), w, h })));
    } else if (L === 'two') {
      nodes.forEach((nd, i) => out.push(Object.assign(nd, { x: i ? 1020 : 280, y: 380, w: 620, h: 400 })));
    }
    out.forEach((o) => { o.cx = o.x + o.w / 2; o.cy = o.y + o.h / 2; });
    return out;
  }

  function linkList(op, nodes) {
    let ls = op.links;
    if (ls === undefined && op.layout === 'two') ls = [[0, 1, '']];
    if (ls === 'chain') { ls = []; for (let i = 0; i < nodes.length - 1; i++) ls.push([i, i + 1]); }
    else if (ls === 'cycle') { ls = []; for (let i = 0; i < nodes.length; i++) ls.push([i, (i + 1) % nodes.length]); }
    else if (ls === 'star') { ls = []; for (let i = 1; i < nodes.length; i++) ls.push([0, i]); }
    return ls || [];
  }

  // ------------------------------------------------------------------ world pass
  const world = {};

  function hold3d(ctx, op, b, ref) {
    const h = BB.scenes.heroOf(ctx, { kind: op.kind, opts: Object.assign({ color: 0x8fe4ff, accent: 0xff9b3d }, op.opts || {}), slot: op.slot || 0 });
    const g = h.group;
    const u = ref ? 0.5 : clamp((ctx.t - b.t0) / Math.max(1e-6, b.t1 - b.t0));
    g.position.set(0, 0, 0);
    g.rotation.set((op.rot && op.rot[0]) || 0, (op.rot && op.rot[1]) || 0, (op.rot && op.rot[2]) || 0);
    g.scale.setScalar(op.scale || 1);
    if (h.update) h.update(ref ? b.t0 + 0.5 * (b.t1 - b.t0) : ctx.t, ctx);
    if (BB.hero && BB.hero.breathe && !op.noBreathe) BB.hero.breathe(g, ref ? b.t0 : ctx.t);
    // the hero's own update resets its cut each frame, so the beat's cut is applied after it;
    // with no cut asked for, nothing is clipped
    if (h.cut) {
      if (op.cut) h.cut.value = (h.cutRange || 140) * (1 - (ref ? 1 : clamp((u - op.cut[0]) / Math.max(0.01, op.cut[1]))));
      else h.cut.value = 1e9;
    }
    if (op.explode) {
      const e = op.explode;
      BB.hero.explode(h, (ref ? 1 : clamp((u - (e.at == null ? 0.3 : e.at)) / (e.dur || 0.4))) * (e.amt || 0.7));
    }
    return h;
  }

  function fitHero(ctx, op, b) {
    const S = BB.stage, THREE = window.THREE;
    const key = b.id + '|' + (op.slot || 0);
    let fit = heroFit.get(key);
    const frame = op.frame ? { x0: op.frame[0], y0: op.frame[1], x1: op.frame[2], y1: op.frame[3] } : FRAME;
    if (!fit) {
      const h = hold3d(ctx, op, b, true);
      const g = h.group;
      const refCam = BB.camera.for3d(b.cam || 'hold', 0.5, { amount: b.camAmount, az: b.camAz, el: b.camEl, base: b.camDist });
      S.setCamera3d(refCam);
      const Hpx = BB.film.cfg.size[1];
      const dbg = [];
      for (let it = 0; it < 4; it++) {
        g.updateMatrixWorld(true);
        const bb = S.bbox(g);
        dbg.push({ it, bb: bb && [bb.x0, bb.y0, bb.x1, bb.y1, bb.behind], s: g.scale.x, pos: [g.position.x, g.position.y, g.position.z] });
        if (!bb || bb.empty) break;
        const k = clamp(Math.min((frame.x1 - frame.x0) / (bb.x1 - bb.x0), (frame.y1 - frame.y0) / (bb.y1 - bb.y0)), 0.15, 4);
        if (Math.abs(k - 1) > 0.01) g.scale.multiplyScalar(k);
        g.updateMatrixWorld(true);
        const b2 = S.bbox(g);
        if (!b2) break;
        const dx = (frame.x0 + frame.x1) / 2 - (b2.x0 + b2.x1) / 2, dy = (frame.y0 + frame.y1) / 2 - (b2.y0 + b2.y1) / 2;
        const cam = S.camera; cam.updateMatrixWorld(true);
        const d = cam.position.distanceTo(g.position);
        const ratio = (2 * d * Math.tan((cam.fov * Math.PI) / 360)) / Hpx;
        const e = cam.matrixWorld.elements;
        g.position.addScaledVector(new THREE.Vector3(e[0], e[1], e[2]), dx * ratio);
        g.position.addScaledVector(new THREE.Vector3(e[4], e[5], e[6]), -dy * ratio);
      }
      const okFit = isFinite(g.scale.x) && g.scale.x > 0.05 && g.scale.x < 20 && g.position.toArray().every((v) => isFinite(v) && Math.abs(v) < 5000);
      fit = okFit ? { s: g.scale.x, pos: [g.position.x, g.position.y, g.position.z], dbg, refCam } : { s: op.scale || 1, pos: [0, 0, 0], dbg, refCam, bad: true };
      heroFit.set(key, fit);
      try { S.setCamera3d(refCam); g.updateMatrixWorld(true); fit.refBox = okFit ? S.bbox(g) : null; } catch (e) { fit.refBox = null; }
      S.setCamera3d(BB.currentCam3d || refCam);
    }
    return fit;
  }

  world.hero = function (ctx, op, p) {
    const b = ctx.beat;
    const fit = fitHero(ctx, op, b);
    const h = hold3d(ctx, op, b, false);
    h.group.scale.setScalar(fit.s);
    h.group.position.set(fit.pos[0], fit.pos[1], fit.pos[2]);
    h.group.updateMatrixWorld(true);
    ctx.threeHeroes.push(h);
    BB.heroBox[b.id] = fit.refBox || BB.stage.bbox(h.group); // labels anchor to the reference box, so they stay still while the camera orbits
    // a faint ground line under the hero, for scale
    const bb = BB.heroBox[b.id];
    if (bb && !op.noGround) {
      const T = ctx.T, y = Math.min(bb.y1 + 18, 860);
      D().line(ctx.ctx, bb.x0 - 40, y, bb.x1 + 40, y, { p: rv(p, 0.05, 0.3), col: T.dim, w: T.hair * 1.4, seed: 12, bleed: false, dash: [18, 12], march: 30, t: ctx.t });
    }
  };

  world.flow = function (ctx, op, p) {
    const T = ctx.T, d = D(), c = ctx.ctx;
    const nodes = layoutNodes(op), n = nodes.length;
    nodes.forEach((nd, i) => {
      const at = 0.03 + (0.5 * i) / Math.max(1, n);
      const q = rv(p, at, 0.2);
      nd._q = q;
      d.pt('n' + i, nd.cx, nd.cy);
      if (q <= 0) return;
      const hot = op.hot === i || nd.hot;
      const col = hot ? T.accent : (nd.col ? colOf(T, nd.col) : T.ink);
      c.save(); c.globalAlpha = 0.9 * q; c.fillStyle = T.panel;
      if (nd.kind === 'circle') { c.beginPath(); c.arc(nd.cx, nd.cy, Math.min(nd.w, nd.h) / 2, 0, Math.PI * 2); c.fill(); }
      else c.fillRect(nd.x, nd.y, nd.w, nd.h);
      c.restore();
      if (nd.kind === 'circle') d.circle(c, nd.cx, nd.cy, Math.min(nd.w, nd.h) / 2, { p: q, col, w: hot ? T.heavy : T.line * 1.2, seed: 40 + i });
      else {
        d.rect(c, nd.x, nd.y, nd.w, nd.h, { p: q, col, w: hot ? T.heavy : T.line * 1.2, seed: 40 + i });
        if (q >= 1) { // drafting corner ticks
          const k = 16;
          [[nd.x, nd.y, 1, 1], [nd.x + nd.w, nd.y, -1, 1], [nd.x, nd.y + nd.h, 1, -1], [nd.x + nd.w, nd.y + nd.h, -1, -1]].forEach(([x, y, sx, sy]) => d.line(c, x - sx * 10, y - sy * 10, x - sx * 10 + sx * k, y - sy * 10, { p: 1, col: T.accent2, w: T.hair * 1.5, seed: 3, bleed: false, j: 0 }));
        }
      }
    });
    const ls = linkList(op, nodes);
    ls.forEach((lk, li) => {
      const a = nodes[lk[0]], bb = nodes[lk[1]];
      if (!a || !bb) return;
      const q = rv(p, 0.05 + 0.5 * Math.max(lk[0], lk[1]) / Math.max(1, n) + 0.08, 0.2);
      if (q <= 0) return;
      const [x1, y1] = edgePt(a, bb.cx, bb.cy), [x2, y2] = edgePt(bb, a.cx, a.cy);
      const col = lk[3] ? colOf(T, lk[3]) : T.cyan;
      d.line(c, x1, y1, x2, y2, { p: q, col, w: T.line * 1.3, seed: 70 + li, dash: [16, 10], march: 38, t: ctx.t, bleed: false });
      if (q >= 1) {
        arrowHead(c, x2, y2, Math.atan2(y2 - y1, x2 - x1), col, 26, T.line * 1.3);
        for (let k = 0; k < 3; k++) { // moving pulses along the link
          const u = ((ctx.t * 0.42 + k / 3 + li * 0.19) % 1);
          d.dot(c, lerp(x1, x2, u), lerp(y1, y2, u), 8, T.accent, 0.95, true);
        }
        d.pt('l' + li, (x1 + x2) / 2, (y1 + y2) / 2);
      }
    });
    op._nodes = nodes;
  };

  function figLayout(op) {
    const ground = op.ground || 840, sc = op.figScale || 2.5;
    const figX = op.figX == null ? 700 : op.figX;
    const list = (op.props || (op.prop ? [{ prop: op.prop }] : [])).map((pr) => {
      const ps = pr.scale || op.pscale || 3.2;
      return { name: pr.prop, x: pr.x == null ? figX + (op.pdx == null ? 360 : op.pdx) : pr.x, y: pr.y == null ? ground : pr.y, ps, ax: pr.ax || 0, ay: pr.ay == null ? 130 * ps / 3 : pr.ay, opts: pr.opts };
    });
    return { ground, sc, figX, props: list };
  }

  world.figure = function (ctx, op, p) {
    const T = ctx.T, d = D(), c = ctx.ctx, F = BB.figure;
    const L = figLayout(op);
    const ground = L.ground, sc = L.sc, figX = L.figX;
    // floor with hatching
    d.line(c, 200, ground, 1720, ground, { p: rv(p, 0, 0.25), col: T.ink, w: T.heavy, seed: 3, bleed: false });
    for (let x = 230; x < 1720; x += 42) d.line(c, x, ground, x - 22, ground + 22, { p: rv(p, 0.05, 0.3), col: T.dim, w: T.hair * 1.4, seed: 4, bleed: false, j: 0 });
    const drawFig = (spec, x) => {
      const j = spec.poseTo ? F.cycle(spec.pose || 'stand', spec.poseTo, ctx.t - ctx.beat.t0, spec.hz || 0.55, spec.phase || 0) : F.pose(spec.pose || 'stand', ctx.t, { phase: 0, amp: 9, speed: 2.4 });
      return F.draw(c, T, { x, y: F.groundY(sc, ground), scale: sc, pose: j, a: rv(p, 0.02, 0.2), accentPart: spec.accent, flip: !!spec.flip, id: spec.id || 'fig' });
    };
    drawFig(op, figX);
    if (op.fig2) drawFig(op.fig2, op.fig2.x);
    // props, anchored at their ground contact
    L.props.forEach((pr, i) => {
      const fn = BB.props[pr.name];
      if (!fn) return;
      const q = rv(p, 0.08 + i * 0.08, 0.25);
      if (q > 0) fn(c, T, Object.assign({ x: pr.x, y: pr.y, scale: pr.ps, p: q, t: ctx.t }, op.propOpts || {}, pr.opts || {}));
    });
    // a moving effect line (e.g. air or fuel flow)
    if (op.motion) {
      const m = op.motion;
      d.line(c, m.x1, m.y1, m.x2, m.y2, { p: rv(p, 0.2, 0.3), col: T.accent, w: T.line * 1.4, seed: 8, dash: [18, 12], march: 60, t: ctx.t, bleed: false });
      if (rv(p, 0.2, 0.3) >= 1) for (let k = 0; k < 4; k++) { const u = (ctx.t * 0.5 + k / 4) % 1; d.dot(c, lerp(m.x1, m.x2, u), lerp(m.y1, m.y2, u), 8, T.accent2, 0.95, true); }
    }
  };

  world.number = function (ctx, op, p) {
    const T = ctx.T, d = D(), c = ctx.ctx;
    // a dimension chain under the figure, plus optional bars drawn to scale
    const y = 858, x0 = 380, x1 = 1540;
    const q = rv(p, 0.05, 0.3);
    d.line(c, x0, y, x1, y, { p: q, col: T.cyan, w: T.line * 1.3, seed: 31, bleed: false });
    [x0, x1].forEach((x) => d.line(c, x, y - 26, x, y + 26, { p: q, col: T.cyan, w: T.line * 1.3, seed: 32, bleed: false }));
    if (q >= 1) { arrowHead(c, x0, y, Math.PI, T.cyan, 22, T.line); arrowHead(c, x1, y, 0, T.cyan, 22, T.line); }
    const bars = op.bars || [];
    const mx = op.max || Math.max(1, ...bars.map((b) => b.v));
    bars.forEach((bar, i) => {
      const by = 296 + i * 66, len = (1160 * bar.v) / mx * easeOut(rv(p, 0.1 + i * 0.1, 0.4));
      c.save(); c.globalAlpha = 0.85; c.fillStyle = bar.hot ? T.accent : T.cyan; c.fillRect(380, by, len, 40); c.restore();
      d.rect(c, 380, by, (1160 * bar.v) / mx, 40, { p: 1, col: T.ink, w: T.hair * 1.6, seed: 33 + i, bleed: false, j: 0 });
    });
  };

  world.timeline = function (ctx, op, p) {
    const T = ctx.T, d = D(), c = ctx.ctx;
    const y = op.y || 600, x0 = 240, x1 = 1680;
    d.line(c, x0, y, x1, y, { p: rv(p, 0, 0.3), col: T.ink, w: T.heavy, seed: 51, bleed: false });
    const items = op.items || [];
    items.forEach((it, i) => {
      const x = lerp(x0 + 80, x1 - 80, it.at == null ? i / Math.max(1, items.length - 1) : it.at);
      const q = rv(p, 0.12 + 0.4 * i / Math.max(1, items.length), 0.2);
      d.pt('i' + i, x, y);
      if (q <= 0) return;
      d.line(c, x, y - 40, x, y + 40, { p: q, col: it.hot ? T.accent : T.ink, w: T.line * 1.4, seed: 52 + i, bleed: false });
      d.dot(c, x, y, it.hot ? 13 : 9, it.hot ? T.accent : T.cyan, q, true);
    });
    // a marker sweeping along the line
    const u = (ctx.t * 0.12) % 1;
    d.dot(c, lerp(x0, x1, u), y, 6, T.accent2, 0.8, true);
  };

  function gridCells(op) {
    const groups = op.slots || [], out = [];
    const total = groups.reduce((a, g) => a + g.n, 0);
    const cols = op.cols || 6, rows = Math.ceil(total / cols), w = 190, h = 150, gx = 28, gy = 28;
    const x0 = (1920 - (cols * w + (cols - 1) * gx)) / 2, y0 = 520 - (rows * h + (rows - 1) * gy) / 2;
    let k = 0;
    groups.forEach((g, gi) => {
      for (let i = 0; i < g.n; i++, k++) {
        out.push({ k, gi, i, x: x0 + (k % cols) * (w + gx), y: y0 + Math.floor(k / cols) * (h + gy), w, h, lit: op.lit != null && k < op.lit, total });
      }
    });
    return out;
  }

  world.grid = function (ctx, op, p) {
    const T = ctx.T, d = D(), c = ctx.ctx;
    const groups = op.slots || [];
    gridCells(op).forEach((cl) => {
      const g = groups[cl.gi];
      const q = rv(p, 0.04 + 0.5 * cl.k / Math.max(1, cl.total), 0.14);
      if (q <= 0) return;
      const col = g.col ? colOf(T, g.col) : T.cyan;
      c.save(); c.globalAlpha = (cl.lit ? 0.5 : 0.22) * q; c.fillStyle = col; c.fillRect(cl.x, cl.y, cl.w, cl.h); c.restore();
      d.rect(c, cl.x, cl.y, cl.w, cl.h, { p: q, col, w: T.line * 1.2, seed: 60 + cl.k, bleed: false });
    });
  };

  world.route = function (ctx, op, p) {
    const T = ctx.T, d = D(), c = ctx.ctx;
    const y = 590, x0 = 260, x1 = 1660;
    const pts = op.pts || [];
    d.line(c, x0, y, x1, y, { p: rv(p, 0, 0.3), col: T.ink, w: T.heavy, seed: 71, bleed: false });
    (op.segs || []).forEach((s, i) => {
      const xa = lerp(x0, x1, s.from), xb = lerp(x0, x1, s.to);
      const q = rv(p, 0.2, 0.3);
      c.save(); c.globalAlpha = 0.35 * q; c.fillStyle = s.hot ? T.accent : T.cyan; c.fillRect(xa, y - 54, (xb - xa) * q, 108); c.restore();
      d.line(c, xa, y, lerp(xa, xb, q), y, { p: 1, col: s.hot ? T.accent : T.cyan, w: T.heavy * 1.6, seed: 72 + i, bleed: false });
      for (let w = 0; w < 6; w++) { // water waves over the creek segment
        const wx = lerp(xa, xb, (w + 0.5) / 6);
        d.arc(c, wx, y + 78, 26, Math.PI * 1.15, Math.PI * 1.85, { p: q, col: T.cyan, w: T.line, seed: 80 + w, bleed: false });
      }
    });
    pts.forEach((pt, i) => {
      const x = lerp(x0, x1, pt.x), q = rv(p, 0.1 + 0.3 * i / Math.max(1, pts.length), 0.2);
      d.pt('r' + i, x, y);
      if (q > 0) { d.line(c, x, y - 36, x, y + 36, { p: q, col: T.ink, w: T.line * 1.4, seed: 74 + i, bleed: false }); d.dot(c, x, y, 10, T.accent, q, true); }
    });
    const u = (ctx.t * 0.2) % 1; d.dot(c, lerp(x0, x1, u), y, 7, T.accent2, 0.9, true);
  };

  // the largest size at which every line fits the text column (so a prop or hero never collides with it)
  function fitStmt(c, T, op) {
    const lines = (op.lines || []).map((l) => (typeof l === 'string' ? l : l.t));
    let size = op.size || (op.hero ? 68 : 90);
    const maxW = op.align === 'center' ? 1560 : (op.hero || op.prop ? 840 : 1500);
    c.save();
    c.font = `600 ${size}px ${T.font}`;
    let mw = 0; lines.forEach((l) => { mw = Math.max(mw, c.measureText(l).width); });
    c.restore();
    if (mw > maxW) size = Math.max(40, Math.floor(size * maxW / mw));
    return size;
  }

  world.statement = function (ctx, op, p) {
    const T = ctx.T, d = D(), c = ctx.ctx;
    const center = op.align === 'center';
    const x = center ? 960 : (op.x == null ? (op.hero ? 150 : 200) : op.x);
    const lines = op.lines || [];
    const size = fitStmt(c, T, op);
    const y0 = (op.y == null ? 560 : op.y) - ((lines.length - 1) * size * 1.22) / 2;
    const top = y0 - size * 0.95, bot = y0 + (lines.length - 1) * size * 1.22 + size * 0.3;
    if (!center) d.line(c, x - 34, top, x - 34, bot, { p: rv(p, 0, 0.3), col: T.accent, w: T.heavy * 1.3, seed: 91, bleed: false });
    else d.line(c, 960 - 330, bot + 40, 960 + 330, bot + 40, { p: rv(p, 0.1, 0.4), col: T.accent, w: T.line * 1.6, seed: 91, bleed: false });
    if (op.hero) {
      world.hero(ctx, { tpl: 'hero', kind: op.hero, opts: op.heroOpts || op.opts, frame: op.hframe || [1010, 300, 1760, 850], slot: 7, scale: op.hscale, rot: op.hrot, cut: op.hcut, explode: op.hexplode, noGround: false }, p);
    }
    if (op.prop && BB.props[op.prop]) {
      BB.props[op.prop](c, T, Object.assign({ x: op.propX == null ? 1470 : op.propX, y: op.propY == null ? 760 : op.propY, scale: op.pscale || 3.4, p: rv(p, 0.1, 0.3), t: ctx.t }, op.propOpts || {}));
    }
  };

  C.world = function (ctx, op, p) {
    const fn = world[op.tpl];
    if (fn) fn(ctx, op, p);
  };

  // ------------------------------------------------------------------ screen pass
  function titleLines(ctx, T, op, p) {
    if (!op.title) return;
    const d = D(), size = 58, lines = String(op.title).split('|');
    ctx.save(); ctx.font = `600 ${size}px ${T.font}`;
    let mw = 0; lines.forEach((l) => { mw = Math.max(mw, ctx.measureText(l).width); });
    ctx.restore();
    lines.forEach((ln, i) => d.text(ctx, ln, 96, 205 + i * 66, size, { p: clamp(p / 0.4), col: T.ink, id: 'T' + i, layer: 'B', weight: 600 }));
    const uy = 205 + (lines.length - 1) * 66 + 24;
    d.line(ctx, 96, uy, 96 + mw, uy, { p: rv(p, 0.08, 0.3), col: T.accent, w: T.line * 1.5, seed: 9, bleed: false });
  }

  // callouts on the rails, with leader lines to target points
  function callouts(ctx, T, list, p, defaultTargets) {
    if (!list || !list.length) return;
    const d = D(), size = 40;
    const items = list.map((c, i) => {
      const tgt = c.target || (defaultTargets && defaultTargets(c, i));
      return { c, tgt, side: c.side || (tgt && tgt[0] < 960 ? 'L' : 'R') };
    }).filter((it) => it.tgt);
    ['L', 'R'].forEach((side) => {
      const grp = items.filter((it) => it.side === side).sort((a, b) => a.tgt[1] - b.tgt[1]);
      const railX = side === 'L' ? 100 : 1560;
      const maxW = 262;
      let lastY = 320;
      grp.forEach((it, gi) => {
        const wr = wrapLines(ctx, T, it.c.t, size, maxW);
        const hgt = wr.lines.length * size * 1.18;
        let y = Math.max(lastY + 28, clamp(it.tgt[1], 340, 800));
        y = Math.min(y, 830 - hgt);
        lastY = y + hgt;
        const q = rv(p, 0.12 + 0.12 * (gi + (side === 'R' ? 1 : 0)), 0.24);
        const ex = side === 'L' ? railX + maxW + 14 : railX - 14;
        const elbow = side === 'L' ? ex + 40 : ex - 40;
        d.poly(ctx, [[it.tgt[0], it.tgt[1]], [elbow, y + size * 0.3], [ex, y + size * 0.3]], { p: q, col: T.cyan, w: T.line, seed: 120 + gi, bleed: false });
        d.dot(ctx, it.tgt[0], it.tgt[1], 5, T.accent, q, true);
        wr.lines.forEach((ln, li) => d.text(ctx, ln, side === 'L' ? railX : railX + maxW, y + size * 0.86 + li * size * 1.18, wr.size, { p: q, col: T.ink, align: side === 'L' ? 'left' : 'right', id: 'CO:' + it.c.t + '#' + li, layer: 'B' }));
        // the rail label sits on a plate so it never merges with strokes
      });
    });
  }

  const screen = {};

  screen.hero = function (ctx, op, p, T, bctx) {
    const b = bctx.beat, d = D();
    titleLines(ctx, T, op, p);
    const bb = BB.heroBox[b.id];
    if (!bb) return;
    const w = bb.x1 - bb.x0, h = bb.y1 - bb.y0;
    callouts(ctx, T, op.callouts, p, (c) => [bb.x0 + (c.fx == null ? 0.5 : c.fx) * w, bb.y0 + (c.fy == null ? 0.5 : c.fy) * h]);
    // dimension chain under the hero
    if (op.chain) {
      const y = Math.min(bb.y1 + 52, 880), q = rv(p, 0.2, 0.3);
      d.line(ctx, bb.x0, y, bb.x1, y, { p: q, col: T.cyan, w: T.line, seed: 19, bleed: false });
      [bb.x0, bb.x1].forEach((x) => d.line(ctx, x, y - 16, x, y + 16, { p: q, col: T.cyan, w: T.line, seed: 20, bleed: false }));
      d.text(ctx, op.chain, (bb.x0 + bb.x1) / 2, y - 14, T.type.small, { p: q, col: T.cyan, align: 'center', id: 'CH', layer: 'B' });
    }
    // flow arrows drawn over the hero (fractions of its box)
    (op.flows || []).forEach((f, i) => {
      const ax = bb.x0 + f.a[0] * w, ay = bb.y0 + f.a[1] * h, bx = bb.x0 + f.b[0] * w, by = bb.y0 + f.b[1] * h;
      const q = rv(p, 0.15 + i * 0.1, 0.3);
      d.line(ctx, ax, ay, bx, by, { p: q, col: f.col ? colOf(T, f.col) : T.accent, w: T.line * 1.4, seed: 130 + i, dash: [16, 10], march: 55, t: ctx.t, bleed: false });
      if (q >= 1) { arrowHead(ctx, bx, by, Math.atan2(by - ay, bx - ax), f.col ? colOf(T, f.col) : T.accent, 24, T.line * 1.4); for (let k = 0; k < 3; k++) { const u = (ctx.t * 0.55 + k / 3 + i * 0.2) % 1; d.dot(ctx, lerp(ax, bx, u), lerp(ay, by, u), 7, T.accent2, 0.95, true); } }
    });
    if (op.tag) d.tag(ctx, T.BASE_W, T.BASE_H, T, op.tag, {});
  };

  screen.flow = function (ctx, op, p, T) {
    const d = D();
    titleLines(ctx, T, op, p);
    const nodes = layoutNodes(op);
    nodes.forEach((nd, i) => {
      const q = rv(p, 0.03 + (0.5 * i) / Math.max(1, nodes.length), 0.2);
      if (q <= 0) return;
      const pos = [nd.cx, nd.cy];
      let big = op.layout === 'two' || ((op.layout || 'row') === 'row' && (op.nodes || []).length <= 3);
      let tsz = nd.size || (big ? 56 : 46), ssz = big ? 42 : 36, wr, sub, total;
      for (let k = 0; k < 6; k++) {
        wr = wrapLines(ctx, T, nd.t || '', tsz, nd.w - 36);
        sub = nd.sub ? wrapLines(ctx, T, nd.sub, ssz, nd.w - 36) : null;
        total = wr.lines.length * wr.size * 1.2 + (sub ? sub.lines.length * ssz * 1.2 + 8 : 0);
        if (total <= nd.h - 24 || tsz <= 32) break;
        tsz = Math.max(32, tsz - 4); ssz = Math.max(30, ssz - 2);
      }
      let y = pos[1] - total / 2 + wr.size * 0.9;
      const col = (op.hot === i || nd.hot) ? T.accent : (nd.col ? colOf(T, nd.col) : T.ink);
      wr.lines.forEach((ln, li) => { d.text(ctx, ln, pos[0], y + li * wr.size * 1.2, wr.size, { p: clamp(q * 1.4), col, align: 'center', id: 'N' + i + '#' + li, layer: 'B' }); });
      if (sub) sub.lines.forEach((ln, li) => d.text(ctx, ln, pos[0], y + wr.lines.length * wr.size * 1.2 + 8 + li * ssz * 1.2, ssz, { p: clamp(q * 1.4), col: T.cyan, align: 'center', id: 'NS' + i + '#' + li, layer: 'B' }));
    });
    linkList(op, nodes).forEach((lk, li) => {
      const a = nodes[lk[0]], b2 = nodes[lk[1]];
      if (!lk[2] || !a || !b2) return;
      d.text(ctx, lk[2], (a.cx + b2.cx) / 2, (a.cy + b2.cy) / 2 - 22, T.type.small, { p: 1, col: T.accent2, align: 'center', id: 'LK' + li, layer: 'B', plate: T.panel, a: rv(p, 0.5, 0.2) });
    });
    callouts(ctx, T, op.callouts, p, (c) => (c.node != null && nodes[c.node] ? [nodes[c.node].cx, nodes[c.node].y + nodes[c.node].h / 2] : null));
    if (op.tag) d.tag(ctx, T.BASE_W, T.BASE_H, T, op.tag, {});
  };

  screen.figure = function (ctx, op, p, T) {
    const d = D();
    titleLines(ctx, T, op, p);
    const L = figLayout(op);
    callouts(ctx, T, op.callouts, p, (c) => {
      const pr = L.props[c.prop == null ? 0 : c.prop];
      return pr ? [pr.x + pr.ax + (c.dx || 0), pr.y - pr.ay + (c.dy || 0)] : null;
    });
    if (op.tag) d.tag(ctx, T.BASE_W, T.BASE_H, T, op.tag, {});
  };

  screen.number = function (ctx, op, p, T) {
    const d = D();
    titleLines(ctx, T, op, p);
    const q = rv(p, 0.05, 0.3), hasBars = (op.bars || []).length > 0;
    const yv = hasBars ? 628 : 570;
    if (op.value != null) d.text(ctx, String(op.value), 960, yv, op.size || 220, { p: 1, a: q, col: T.accent, align: 'center', id: 'NUM', layer: 'B', weight: 600 });
    if (op.unit) d.text(ctx, op.unit, 960, yv + 70, 58, { p: clamp(p / 0.4), col: T.ink, align: 'center', id: 'UNIT', layer: 'B' });
    if (op.note) d.text(ctx, op.note, 960, yv + 122, T.type.small, { p: clamp(p / 0.5), col: T.cyan, align: 'center', id: 'NOTE', layer: 'B' });
    (op.bars || []).forEach((bar, i) => d.text(ctx, bar.t, 396, 296 + i * 66 + 29, 32, { p: 1, col: T.paper, align: 'left', id: 'BAR' + i, layer: 'B', a: rv(p, 0.2 + i * 0.1, 0.2), weight: 600 }));
    if (op.chain) d.text(ctx, op.chain, 960, 828, T.type.small, { p: 1, col: T.cyan, align: 'center', id: 'CHN', layer: 'B', a: q });
    if (op.source) d.text(ctx, op.source, 96, 930, 36, { p: 1, col: T.cyan, id: 'SRC', layer: 'B', a: rv(p, 0.15, 0.2) });
    if (op.tag) d.tag(ctx, T.BASE_W, T.BASE_H, T, op.tag, {});
  };

  screen.timeline = function (ctx, op, p, T) {
    const d = D();
    titleLines(ctx, T, op, p);
    const items = op.items || [], y = op.y || 600;
    items.forEach((it, i) => {
      const x = lerp(240 + 80, 1680 - 80, it.at == null ? i / Math.max(1, items.length - 1) : it.at);
      const q = rv(p, 0.12 + 0.4 * i / Math.max(1, items.length), 0.2);
      d.text(ctx, it.t, x, y - 74, it.size || 66, { p: clamp(q * 1.5), col: it.hot ? T.accent : T.ink, align: 'center', id: 'IT' + i, layer: 'B', weight: 600, clamp: true });
      if (it.sub) { const wr = wrapLines(ctx, T, it.sub, 38, 330); wr.lines.forEach((ln, li) => d.text(ctx, ln, x, y + 92 + li * 46, wr.size, { p: clamp(q * 1.5), col: T.cyan, align: 'center', id: 'ITS' + i + '#' + li, layer: 'B', clamp: true })); }
    });
    if (op.tag) d.tag(ctx, T.BASE_W, T.BASE_H, T, op.tag, {});
  };

  screen.grid = function (ctx, op, p, T) {
    const d = D();
    titleLines(ctx, T, op, p);
    const groups = op.slots || [];
    gridCells(op).forEach((cl) => {
      const g = groups[cl.gi];
      if (!g || !g.cell) return;
      const label = typeof g.cell === 'string' ? g.cell : (g.cell[cl.i] || '');
      if (!label) return;
      const q = rv(p, 0.04 + 0.5 * cl.k / Math.max(1, cl.total), 0.14);
      d.text(ctx, label, cl.x + cl.w / 2, cl.y + cl.h / 2 + 14, 38, { p: 1, a: q, col: T.ink, align: 'center', id: 'C' + cl.k, layer: 'B' });
    });
    if (op.legend) op.legend.forEach((lg, i) => d.text(ctx, lg.t, 960, 800 + i * 52, 42, { p: clamp(p / 0.5), col: lg.col ? colOf(T, lg.col) : T.ink, align: 'center', id: 'LG' + i, layer: 'B' }));
    if (op.source) d.text(ctx, op.source, 96, 930, 36, { p: 1, col: T.cyan, id: 'SRC', layer: 'B', a: rv(p, 0.15, 0.2) });
    if (op.tag) d.tag(ctx, T.BASE_W, T.BASE_H, T, op.tag, {});
  };

  screen.route = function (ctx, op, p, T) {
    const d = D();
    titleLines(ctx, T, op, p);
    (op.pts || []).forEach((pt, i) => {
      const pos = [lerp(260, 1660, pt.x), 590], q = rv(p, 0.1 + 0.3 * i / Math.max(1, op.pts.length), 0.2);
      d.text(ctx, pt.t, pos[0], pos[1] + (i % 2 ? 100 : -56), 44, { p: clamp(q * 1.5), col: T.ink, align: 'center', id: 'R' + i, layer: 'B', clamp: true });
    });
    (op.segs || []).forEach((s, i) => d.text(ctx, s.t, 960, 470 - i * 0, 56, { p: clamp(p / 0.45), col: s.hot ? T.accent : T.cyan, align: 'center', id: 'SEG' + i, layer: 'B', weight: 600 }));
    if (op.source) d.text(ctx, op.source, 96, 930, 36, { p: 1, col: T.cyan, id: 'SRC', layer: 'B', a: rv(p, 0.15, 0.2) });
    if (op.tag) d.tag(ctx, T.BASE_W, T.BASE_H, T, op.tag, {});
  };

  screen.statement = function (ctx, op, p, T) {
    const d = D();
    const lines = op.lines || [];
    const center = op.align === 'center';
    const size = fitStmt(ctx, T, op);
    const x = center ? 960 : (op.x == null ? (op.hero ? 150 : 200) : op.x);
    const cy = op.y == null ? 560 : op.y;
    const y0 = cy - ((lines.length - 1) * size * 1.22) / 2;
    lines.forEach((ln, i) => {
      const t = typeof ln === 'string' ? ln : ln.t, col = typeof ln === 'string' ? T.ink : colOf(T, ln.col, T.ink);
      d.text(ctx, t, x, y0 + i * size * 1.22, size, { p: clamp(rv(p, i * 0.14, 0.4) * 1.05), col, id: 'S' + i, layer: 'B', weight: 600, align: center ? 'center' : 'left' });
    });
    if (op.sub) {
      const wr = wrapLines(ctx, T, op.sub, T.type.label, center ? 1300 : 860);
      wr.lines.forEach((ln, li) => d.text(ctx, ln, x, y0 + (lines.length - 1) * size * 1.22 + size * 0.95 + 48 + li * 52, wr.size, { p: clamp(rv(p, 0.45, 0.4)), col: T.cyan, id: 'SUB' + li, layer: 'B', align: center ? 'center' : 'left' }));
    }
    if (op.tag) d.tag(ctx, T.BASE_W, T.BASE_H, T, op.tag, {});
  };

  C.screen = function (ctx, op, p) {
    const fn = screen[op.tpl];
    const a = ctx.alpha == null ? 1 : ctx.alpha;
    if (!fn) return;
    ctx.ctx.save();
    ctx.ctx.globalAlpha = a;
    fn(ctx.ctx, Object.assign({}, op), p, ctx.T, ctx);
    ctx.ctx.restore();
  };
})();
