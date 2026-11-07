// kit-v2: the scene interpreter. A beat is a list of scene ops; this turns them into
// drawing calls on the blueprint canvas and the 3D stage.
(function () {
  const BB = (window.BB = window.BB || {});
  const S = (BB.scenes = {});
  const D = () => BB.draw;

  function heroOf(ctx, op) {
    const key = ctx.beat.id + '|' + op.kind + '|' + (op.slot || 0);
    let h = ctx.heroes.get(key);
    if (!h) {
      h = BB.hero.create(op.kind, op.opts || {});
      h.group.userData.key = key;
      ctx.heroes.set(key, h);
    }
    return h;
  }

  // position/scale a hero from its op description
  function placeHero(h, op, ctx) {
    const g = h.group;
    g.position.set(op.pos ? op.pos[0] : 0, op.pos ? op.pos[1] : 0, op.pos ? op.pos[2] : 0);
    if (op.rot) g.rotation.set(op.rot[0] || 0, op.rot[1] || 0, op.rot[2] || 0);
    const s = op.scale == null ? 1 : op.scale;
    g.scale.setScalar(s);
    if (op.explode) BB.hero.explode(h, op.explode, op.explodeAxis);
    if (h.update) h.update(ctx.t, ctx);
  }

  // One op. ctx: {T, t, p, beat, W, H, heroes, dpr}
  S.op = function (ctx, op) {
    const d = D(), T = ctx.T;
    const p = op.p == null ? ctx.p : op.p;
    // custom op, registered by the episode script: op "x:name"
    if (op.op && op.op.indexOf('x:') === 0) {
      const fn = BB.customOps && BB.customOps[op.op.slice(2)];
      if (fn) fn(ctx, op, p);
      return;
    }
    switch (op.op) {
      case 'hero': {
        const h = heroOf(ctx, op);
        placeHero(h, op, ctx);
        ctx.threeHeroes.push(h);
        return;
      }
      case 'figure': {
        const pose = BB.figure.pose(op.pose || 'stand', ctx.t, { phase: op.phase == null ? 0 : op.phase, amp: op.amp, speed: op.speed });
        BB.figure.draw(ctx.ctx, T, {
          x: op.x == null ? T.BASE_W / 2 : op.x, y: op.y == null ? T.BASE_H * 0.8 : op.y,
          scale: op.scale == null ? 1 : op.scale, pose, t: ctx.t, a: op.a == null ? 1 : op.a,
          accentPart: op.accentPart, accentCol: op.accentCol, id: op.id,
        });
        if (op.prop) {
          const prop = BB.props[op.prop];
          if (prop) prop(ctx.ctx, T, {
            x: op.propX == null ? (op.x == null ? T.BASE_W / 2 : op.x) + (op.propDX || 0) : op.propX,
            y: op.propY == null ? (op.y == null ? T.BASE_H * 0.8 : op.y) : op.propY,
            scale: op.propScale == null ? 1 : op.propScale, p, t: ctx.t, col: op.propCol,
            flame: op.flame, steam: op.steam, ring: op.ring, ping: op.ping, push: op.push,
            scoop: op.scoop, receiver: op.receiver, closed: op.closed, locked: op.locked,
            dot: op.dot, lit: op.lit, fire: op.fire, n: op.n,
          });
        }
        return;
      }
      case 'text': {
        d.text(ctx.ctx, op.text, op.x == null ? T.BASE_W / 2 : op.x, op.y == null ? T.BASE_H * 0.5 : op.y,
          op.size || T.type.head, { align: op.align || 'center', col: op.col || T.ink, p, id: op.id, a: op.a, layer: 'B' });
        return;
      }
      case 'stack': {
        BB.labels.stack(ctx.ctx, T, op.words, { x: op.x, y: op.y, size: op.size || T.type.head, col: op.col, p, align: op.align, id: op.id, a: op.a });
        return;
      }
      case 'panel': {
        const fn = BB.panels[op.name];
        if (!fn) throw new Error('unknown panel: ' + op.name);
        fn(ctx.ctx, T, Object.assign({}, op.params || {}, { t: ctx.t, p }));
        return;
      }
      case 'stamp': {
        d.stamp(ctx.ctx, ctx.W, ctx.H, T, op.a == null ? 1 : op.a);
        return;
      }
      case 'tag': {
        d.tag(ctx.ctx, ctx.W, ctx.H, T, op.text, { left: op.left, a: op.a, col: op.col });
        return;
      }
      case 'numberCard': {
        d.numberCard(ctx.ctx, ctx.W, ctx.H, T, {
          value: op.value, sub: op.sub, source: op.source, p, a: op.a, id: op.id, col: op.col, size: op.size,
        });
        return;
      }
      case 'titleCard': {
        d.titleCard(ctx.ctx, ctx.W, ctx.H, T, op.title, op.sub, { a: op.a, size: op.size, col: op.col });
        return;
      }
      case 'sourceChip': {
        d.sourceChip(ctx.ctx, ctx.W, ctx.H, T, op.source, { right: op.right });
        return;
      }
      case 'railLabel': {
        BB.labels.railLabel(ctx.ctx, T, { text: op.text, side: op.side || 'L', size: op.size, p, anchor: op.anchor, col: op.col, id: op.id, seed: op.seed, a: op.a });
        return;
      }
      case 'leader': {
        d.leaderTo(ctx.ctx, op.anchor, op.x, op.y, op.text, { p, size: op.size, id: op.id, col: op.col, textCol: op.textCol, a: op.a, w: op.w });
        return;
      }
      case 'chart': {
        if (BB.charts) BB.charts.draw(ctx.ctx, T, op, ctx);
        return;
      }
      case 'map': {
        if (BB.map) BB.map.draw(ctx.ctx, T, op, ctx);
        return;
      }
      default:
        return;
    }
  };

  S.drawOps = function (ctx, ops) {
    (ops || []).forEach((op) => S.op(ctx, op));
  };

  S.heroOf = heroOf;
})();
