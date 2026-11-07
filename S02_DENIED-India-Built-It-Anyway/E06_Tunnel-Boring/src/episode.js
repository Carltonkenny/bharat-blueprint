// E01 (The Rocket Engine They Wouldn't Transfer) - the scene implementations.
// The beats come from EPISODE_BRIEF.md through bb-explain; this file draws them.
//
// Custom ops:
//   x:hero   a 3D hero with a cutaway, an explode and a flame, all driven by the beat
//   x:draw   a list of 2D blueprint primitives, drawn progressively
//   x:people line figures with props
//   x:flow   arrows and seeded particles
(function () {
  const BB = window.BB;
  BB.customOps = BB.customOps || {};

  const clamp = (v, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
  const lerp = (a, b, t) => a + (b - a) * t;

  // ---------------------------------------------------------------- 3D hero
  BB.customOps.hero = function (ctx, op, p) {
    const T = ctx.T;
    const b = ctx.beat;
    const h = BB.scenes.heroOf(ctx, {
      kind: op.kind,
      opts: Object.assign({ color: 0x8fe4ff, accent: 0xff9b3d }, op.opts || {}),
    });
    const g = h.group;
    g.position.set(op.pos ? op.pos[0] : 0, op.pos ? op.pos[1] : 0, op.pos ? op.pos[2] : 0);
    if (op.rot) g.rotation.set(op.rot[0] || 0, op.rot[1] || 0, op.rot[2] || 0);
    const s = (op.scale == null ? 1 : op.scale) * (op.grow ? lerp(0.25, 1, clamp(p / (op.growDur || 0.6))) : 1);
    g.scale.setScalar(s);
    if (h.cut && op.cut !== false) {
      const cp = op.cutStart == null ? 0 : op.cutStart;
      const cw = op.cutDur == null ? 0.6 : op.cutDur;
      const cp2 = clamp((ctx.t - (b.t0 + cp)) / cw);
      h.cut.value = (h.cutRange || 140) * (1 - cp2);
    }
    if (op.explode) {
      const ep = clamp((ctx.t - (b.t0 + (op.explodeAt || 0.4))) / (op.explodeDur || 1.6));
      BB.hero.explode(h, ep * (op.explodeAmount || 0.7));
    }
    if (h.update) h.update(ctx.t, ctx);
    ctx.threeHeroes.push(h);

    // a conceptual tag on the first beat the hero appears on
    if (op.tag) BB.draw.tag(ctx.ctx, T.BASE_W, T.BASE_H, T, op.tag, { right: true, a: 1 });
  };

  // ---------------------------------------------------------------- 2D primitives
  function primProgress(op, prim, p) {
    if (prim.at == null) return p;
    const dur = prim.dur == null ? 0.35 : prim.dur;
    return clamp((p - prim.at) / dur);
  }

  BB.customOps.draw = function (ctx, op, p) {
    const T = ctx.T, d = BB.draw;
    const c = ctx.ctx;
    (op.prims || []).forEach((prim) => {
      const pp = primProgress(op, prim, p);
      if (pp <= 0) return;
      const col = prim.col || T.ink;
      // the stroke width is "lw" (or the legacy "w2"); "w" is the width of a shape
      const w = prim.lw != null ? prim.lw : (prim.w2 != null ? prim.w2 : T.line);
      switch (prim.k) {
        case 'rect':
          d.rect(c, prim.x, prim.y, prim.w, prim.h, { p: pp, col, w, seed: prim.seed || 5, fill: prim.fill, dash: prim.dash, march: prim.march, t: ctx.t });
          break;
        case 'circle':
          d.circle(c, prim.x, prim.y, prim.r, { p: pp, col, w, seed: prim.seed || 6, fill: prim.fill });
          break;
        case 'line':
          d.line(c, prim.x1, prim.y1, prim.x2, prim.y2, { p: pp, col, w, seed: prim.seed || 7, dash: prim.dash, march: prim.march, t: ctx.t });
          break;
        case 'poly':
          d.poly(c, prim.pts, { p: pp, col, w, seed: prim.seed || 8, close: prim.close, fill: prim.fill, dash: prim.dash, march: prim.march, t: ctx.t });
          break;
        case 'arc':
          d.arc(c, prim.x, prim.y, prim.r, prim.a0, prim.a1, { p: pp, col, w, seed: prim.seed || 9 });
          break;
        case 'dot':
          d.dot(c, prim.x, prim.y, prim.r || 7, col, pp, prim.glow);
          break;
        case 'text':
          d.text(c, prim.s, prim.x, prim.y, prim.size || T.type.body, { align: prim.align || 'left', col, p: pp, id: prim.id, layer: 'B', clamp: true });
          break;
        case 'arrow': {
          const x2 = lerp(prim.x1, prim.x2, pp), y2 = lerp(prim.y1, prim.y2, pp);
          d.line(c, prim.x1, prim.y1, x2, y2, { p: 1, col, w: w * 1.2, seed: prim.seed || 10 });
          if (pp > 0.9) {
            const a = Math.atan2(prim.y2 - prim.y1, prim.x2 - prim.x1), hl = prim.head || 18;
            d.line(c, x2 - Math.cos(a - 0.5) * hl, y2 - Math.sin(a - 0.5) * hl, x2, y2, { p: 1, col, w: w * 1.2, seed: prim.seed || 11 });
            d.line(c, x2 - Math.cos(a + 0.5) * hl, y2 - Math.sin(a + 0.5) * hl, x2, y2, { p: 1, col, w: w * 1.2, seed: prim.seed || 12 });
          }
          break;
        }
        case 'drop': {
          // a frost drop: a circle that falls onto the grid
          const y = lerp(prim.y0, prim.y, pp);
          d.circle(c, prim.x, y, prim.r, { p: 1, col: prim.col || T.cyan, w: w, seed: prim.seed || 13 });
          d.circle(c, prim.x - prim.r * 0.3, y - prim.r * 0.3, prim.r * 0.3, { p: 1, col: T.ink, w: T.hair, seed: prim.seed || 14 });
          break;
        }
        case 'gauge': {
          const r = prim.r || 70;
          d.arc(c, prim.x, prim.y, r, Math.PI * 0.8, Math.PI * 2.2, { p: 1, col: T.dim, w: w, seed: prim.seed || 15 });
          const v = prim.value == null ? 0.7 : prim.value;
          const a = Math.PI * 0.8 + v * Math.PI * 1.4;
          d.line(c, prim.x, prim.y, prim.x + Math.cos(a) * r * 0.82, prim.y + Math.sin(a) * r * 0.82, { p: 1, col: prim.low ? T.accent2 : T.accent, w: w * 1.4, seed: prim.seed || 16 });
          d.dot(c, prim.x, prim.y, 5, T.ink, 1);
          break;
        }
        case 'spark': {
          // a small cross mark, used as a build mark
          d.line(c, prim.x - prim.r, prim.y - prim.r, prim.x + prim.r, prim.y + prim.r, { p: pp, col, w: T.hair * 1.6, seed: prim.seed || 17 });
          d.line(c, prim.x - prim.r, prim.y + prim.r, prim.x + prim.r, prim.y - prim.r, { p: pp, col, w: T.hair * 1.6, seed: prim.seed || 18 });
          break;
        }
        case 'zigzag': {
          // a hand-drawn squiggle, used for vibration
          const pts = prim.pts || [];
          const n = Math.max(2, Math.round(pts.length * pp));
          d.poly(c, pts.slice(0, n), { p: 1, col, w, seed: prim.seed || 19, dash: prim.dash, march: prim.march, t: ctx.t });
          break;
        }
        default: break;
      }
    });
  };

  // ---------------------------------------------------------------- figures
  BB.customOps.people = function (ctx, op, p) {
    const T = ctx.T;
    (op.people || []).forEach((pp, i) => {
      const ip = pp.at == null ? p : clamp((p - pp.at) / (pp.dur == null ? 0.4 : pp.dur));
      if (ip <= 0) return;
      const pose = BB.figure.pose(pp.pose || 'stand', ctx.t, { phase: pp.phase == null ? i * 1.3 : pp.phase, amp: pp.amp, speed: pp.speed });
      BB.figure.draw(ctx.ctx, T, {
        x: pp.x, y: pp.y, scale: pp.scale == null ? 2.6 : pp.scale, pose, t: ctx.t,
        accentPart: pp.accentPart, accentCol: pp.accentCol, a: ip,
      });
      if (pp.prop) {
        const fn = BB.props[pp.prop];
        if (fn) fn(ctx.ctx, T, {
          x: pp.propX == null ? pp.x + (pp.propDX == null ? 70 : pp.propDX) : pp.propX,
          y: pp.propY == null ? pp.y : pp.propY,
          scale: pp.propScale == null ? 2.2 : pp.propScale, p: ip, t: ctx.t,
          flame: pp.flame, steam: pp.steam, ring: pp.ring, ping: pp.ping, scoop: pp.scoop,
          receiver: pp.receiver, closed: pp.closed, locked: pp.locked, dot: pp.dot, fire: pp.fire, n: pp.n,
        });
      }
    });
  };

  // ---------------------------------------------------------------- flow and particles
  BB.customOps.flow = function (ctx, op, p) {
    const T = ctx.T, d = BB.draw;
    const items = op.items || [];
    items.forEach((it, i) => {
      const ip = it.at == null ? p : clamp((p - it.at) / (it.dur == null ? 0.5 : it.dur));
      if (ip <= 0) return;
      if (it.k === 'arrow') {
        const x2 = lerp(it.x1, it.x2, ip), y2 = lerp(it.y1, it.y2, ip);
        const col = it.col || T.accent;
        d.line(ctx.ctx, it.x1, it.y1, x2, y2, { p: 1, col, w: T.line * 1.3, seed: 20 + i });
        if (ip > 0.9) {
          const a = Math.atan2(it.y2 - it.y1, it.x2 - it.x1), hl = 18;
          d.line(ctx.ctx, x2 - Math.cos(a - 0.5) * hl, y2 - Math.sin(a - 0.5) * hl, x2, y2, { p: 1, col, w: T.line * 1.3, seed: 30 + i });
          d.line(ctx.ctx, x2 - Math.cos(a + 0.5) * hl, y2 - Math.sin(a + 0.5) * hl, x2, y2, { p: 1, col, w: T.line * 1.3, seed: 40 + i });
        }
      } else if (it.k === 'dot') {
        // a packet travelling along a path
        const path = it.path || [];
        if (path.length < 2) return;
        const u = ((ctx.t * (it.speed || 0.5) + it.phase || 0) % 1 + 1) % 1;
        const idx = u * (path.length - 1);
        const k = Math.min(path.length - 2, Math.floor(idx));
        const f = idx - k;
        const a = path[k], b = path[k + 1];
        d.dot(ctx.ctx, lerp(a[0], b[0], f), lerp(a[1], b[1], f), it.r || 9, it.col || T.accent2, ip, true);
      }
    });
  };
})();
