// kit-v2: props for the line-figure scenes. Same stroke language as everything else.
(function () {
  const BB = (window.BB = window.BB || {});
  const P = (BB.props = {});
  const D = () => BB.draw;

  // Each prop draws in a local box anchored at (x, y) = the ground contact point.
  P.gasStove = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, s = o.scale || 1;
    const w = 90 * s, h = 34 * s;
    d.rect(ctx, x - w / 2, y - h, w, h, { p: o.p, col: o.col || T.ink, w: T.line, seed: 11 });
    for (let i = -1; i <= 1; i += 2) {
      const bx = x + i * 22 * s;
      d.circle(ctx, bx, y - h - 5 * s, 12 * s, { p: o.p, col: o.col || T.ink, w: T.line, seed: 20 + i });
      // flame
      const f = o.flame == null ? 1 : o.flame;
      ctx.save();
      ctx.globalAlpha = f;
      ctx.strokeStyle = T.accent2; ctx.lineWidth = T.line;
      const hh = (14 + 8 * Math.sin((o.t || 0) * 7 + i)) * s * f;
      ctx.beginPath();
      ctx.moveTo(bx - 5 * s, y - h - 15 * s);
      ctx.quadraticCurveTo(bx, y - h - 15 * s - hh, bx + 5 * s, y - h - 15 * s);
      ctx.stroke(); ctx.restore();
    }
  };

  P.pot = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, s = o.scale || 1;
    const w = 62 * s, h = 40 * s;
    d.poly(ctx, [[x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2 - 6 * s, y], [x - w / 2 + 6 * s, y]], { p: o.p, col: o.col || T.ink, w: T.line, seed: 31, close: true });
    d.line(ctx, x - w / 2 - 8 * s, y - h + 8 * s, x - w / 2, y - h + 4 * s, { p: o.p, col: o.col || T.ink, w: T.line, seed: 32 });
    d.line(ctx, x + w / 2 + 8 * s, y - h + 8 * s, x + w / 2, y - h + 4 * s, { p: o.p, col: o.col || T.ink, w: T.line, seed: 33 });
  };

  P.bicyclePump = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, s = o.scale || 1;
    const H = 110 * s;
    d.line(ctx, x, y, x, y - H, { p: o.p, col: o.col || T.ink, w: T.line * 1.2, seed: 41 });
    d.line(ctx, x - 13 * s, y, x + 13 * s, y, { p: o.p, col: o.col || T.ink, w: T.line, seed: 42 });
    d.line(ctx, x, y - H, x + 16 * s, y - H, { p: o.p, col: o.col || T.ink, w: T.line, seed: 43 });
    const hy = y - H - 10 * s;
    d.line(ctx, x, hy, x + 16 * s, hy - 8 * s, { p: o.p, col: o.col || T.ink, w: T.line, seed: 44 });
  };

  P.tyre = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, r = (o.r || 60) * (o.scale || 1);
    d.circle(ctx, x, y - r, r, { p: o.p, col: o.col || T.ink, w: T.line * 1.2, seed: 51 });
    d.circle(ctx, x, y - r, r * 0.72, { p: o.p, col: o.dim || T.dim, w: T.hair, seed: 52 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      d.line(ctx, x + Math.cos(a) * r * 0.28, y - r + Math.sin(a) * r * 0.28, x + Math.cos(a) * r * 0.68, y - r + Math.sin(a) * r * 0.68, { p: o.p, col: o.col || T.ink, w: T.hair, seed: 60 + i });
    }
  };

  P.pressureCooker = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, s = o.scale || 1;
    const w = 78 * s, h = 58 * s;
    d.rect(ctx, x - w / 2, y - h, w, h, { p: o.p, col: o.col || T.ink, w: T.line, seed: 71 });
    d.line(ctx, x - w / 2, y - h, x + w / 2, y - h, { p: o.p, col: o.col || T.ink, w: T.line * 1.3, seed: 72 });
    d.line(ctx, x, y - h, x, y - h - 12 * s, { p: o.p, col: o.col || T.ink, w: T.line, seed: 73 });
    if (o.steam) {
      ctx.save();
      ctx.globalAlpha = o.steam;
      ctx.strokeStyle = T.accent; ctx.lineWidth = T.hair * 1.6;
      for (let i = 0; i < 3; i++) {
        const off = ((o.t || 0) * 40 + i * 26) % 90;
        const xx = x + (i - 1) * 16 * s, yy = y - h - 14 * s - off;
        ctx.beginPath();
        ctx.moveTo(xx, yy);
        ctx.quadraticCurveTo(xx + 8 * s, yy - 10 * s, xx, yy - 20 * s);
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  P.desk = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, s = o.scale || 1;
    d.line(ctx, x - 110 * s, y, x + 110 * s, y, { p: o.p, col: o.col || T.ink, w: T.line * 1.4, seed: 81 });
    d.line(ctx, x - 100 * s, y, x - 100 * s, y + 46 * s, { p: o.p, col: o.col || T.ink, w: T.line, seed: 82 });
    d.line(ctx, x + 100 * s, y, x + 100 * s, y + 46 * s, { p: o.p, col: o.col || T.ink, w: T.line, seed: 83 });
  };

  P.papers = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, s = o.scale || 1, n = o.n || 7;
    for (let i = 0; i < n; i++) {
      const off = i * 4 * s;
      d.rect(ctx, x - 34 * s + i * 2 * s, y - 6 * s - off, 34 * s, 24 * s, { p: o.p, col: o.col || T.ink, w: T.hair * 1.6, seed: 90 + i, overshoot: 2 });
    }
  };

  P.knife = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, s = o.scale || 1;
    d.poly(ctx, [[x, y], [x + 58 * s, y - 6 * s], [x + 58 * s, y + 4 * s], [x + 12 * s, y + 10 * s]], { p: o.p, col: o.col || T.ink, w: T.line, seed: 95, close: true });
  };

  P.baton = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, s = o.scale || 1;
    d.line(ctx, x - 26 * s, y, x + 26 * s, y, { p: o.p, col: o.col || T.accent, w: T.line * 1.6, seed: 96 });
  };

  P.spoonBowl = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, s = o.scale || 1;
    d.arc(ctx, x, y - 12 * s, 62 * s, 0, Math.PI, { p: o.p, col: o.col || T.ink, w: T.line * 1.3, seed: 97 });
    d.line(ctx, x - 62 * s, y - 12 * s, x + 62 * s, y - 12 * s, { p: o.p, col: o.col || T.dim, w: T.hair, seed: 98 });
    if (o.scoop) {
      d.line(ctx, x - 30 * s, y - 40 * s, x + 26 * s, y - 26 * s, { p: o.p, col: o.col || T.ink, w: T.line, seed: 99 });
      d.arc(ctx, x - 36 * s, y - 44 * s, 14 * s, 0, Math.PI * 2, { p: o.p, col: o.col || T.ink, w: T.line, seed: 100 });
    }
  };

  P.door = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, s = o.scale || 1, w = 74 * s, h = 150 * s;
    d.rect(ctx, x - w / 2, y - h, w, h, { p: o.p, col: o.col || T.ink, w: T.line * 1.3, seed: 101 });
    d.dot(ctx, x + w / 2 - 14 * s, y - h * 0.5, 4 * s, o.col || T.ink, 1);
    if (o.push) {
      ctx.save();
      ctx.strokeStyle = o.pushCol || T.accent; ctx.lineWidth = T.line * 1.4;
      const px = x + (o.push > 0 ? 1 : -1) * (20 + 18 * Math.sin((o.t || 0) * 3));
      ctx.beginPath();
      ctx.moveTo(px, y - h * 0.62); ctx.lineTo(px + (o.push > 0 ? 40 : -40) * s, y - h * 0.62);
      ctx.moveTo(px + (o.push > 0 ? 40 : -40) * s, y - h * 0.62);
      ctx.lineTo(px + (o.push > 0 ? 26 : -26) * s, y - h * 0.62 - 12 * s);
      ctx.moveTo(px + (o.push > 0 ? 40 : -40) * s, y - h * 0.62);
      ctx.lineTo(px + (o.push > 0 ? 26 : -26) * s, y - h * 0.62 + 12 * s);
      ctx.stroke(); ctx.restore();
    }
  };

  P.bell = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, s = o.scale || 1;
    d.poly(ctx, [[x - 22 * s, y - 40 * s], [x - 14 * s, y - 62 * s], [x + 14 * s, y - 62 * s], [x + 22 * s, y - 40 * s]], { p: o.p, col: o.col || T.ink, w: T.line, seed: 111, close: true });
    d.line(ctx, x - 26 * s, y - 40 * s, x + 26 * s, y - 40 * s, { p: o.p, col: o.col || T.ink, w: T.line, seed: 112 });
    d.dot(ctx, x, y - 30 * s, 5 * s, o.col || T.accent, 1);
    if (o.ring) {
      ctx.save();
      ctx.globalAlpha = o.ring * 0.8;
      ctx.strokeStyle = T.accent; ctx.lineWidth = T.line;
      for (let i = 0; i < 3; i++) {
        const r = (26 + ((o.t || 0) * 90 + i * 34) % 110) * s;
        ctx.beginPath(); ctx.arc(x, y - 50 * s, r, -2.2, -0.9); ctx.stroke();
      }
      ctx.restore();
    }
  };

  P.boat = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, s = o.scale || 1;
    d.poly(ctx, [[x - 120 * s, y - 16 * s], [x + 120 * s, y - 16 * s], [x + 84 * s, y + 12 * s], [x - 84 * s, y + 12 * s]], { p: o.p, col: o.col || T.ink, w: T.line * 1.3, seed: 121, close: true });
    d.line(ctx, x - 10 * s, y - 16 * s, x - 10 * s, y - 78 * s, { p: o.p, col: o.col || T.ink, w: T.line, seed: 122 });
    if (o.receiver) {
      d.rect(ctx, x + 22 * s, y - 54 * s, 30 * s, 22 * s, { p: o.p, col: o.col || T.ink, w: T.hair * 1.6, seed: 123, overshoot: 2 });
      if (o.ping) {
        ctx.save();
        ctx.globalAlpha = o.ping;
        ctx.strokeStyle = T.accent; ctx.lineWidth = T.line;
        ctx.beginPath(); ctx.arc(x + 37 * s, y - 43 * s, 26 * s, -2.4, -0.7); ctx.stroke();
        ctx.restore();
      }
    }
  };

  P.phone = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, s = o.scale || 1, w = 44 * s, h = 84 * s;
    d.rect(ctx, x - w / 2, y - h, w, h, { p: o.p, col: o.col || T.ink, w: T.line, seed: 131 });
    if (o.dot) {
      d.dot(ctx, x, y - h * 0.52, 7 * s, T.accent, 1, true);
    }
  };

  P.chip = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, s = o.scale || 1, r = 20 * s;
    d.rect(ctx, x - r, y - r, r * 2, r * 2, { p: o.p, col: o.col || T.ink, w: T.line, seed: 141, overshoot: 2 });
    for (let i = 1; i < 4; i++) {
      d.line(ctx, x - r + (r * 2 * i) / 4, y - r, x - r + (r * 2 * i) / 4, y + r, { p: o.p, col: o.col || T.dim, w: T.hair, seed: 142 + i });
      d.line(ctx, x - r, y - r + (r * 2 * i) / 4, x + r, y - r + (r * 2 * i) / 4, { p: o.p, col: o.col || T.dim, w: T.hair, seed: 150 + i });
    }
  };

  P.palette = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, s = o.scale || 1;
    d.rect(ctx, x - 26 * s, y - 30 * s, 52 * s, 36 * s, { p: o.p, col: o.col || T.ink, w: T.line, seed: 161 });
    d.dot(ctx, x - 12 * s, y - 12 * s, 5 * s, T.accent, 1);
    d.dot(ctx, x + 12 * s, y - 12 * s, 5 * s, T.accent2, 1);
    d.line(ctx, x, y - 30 * s, x + 40 * s, y - 46 * s, { p: o.p, col: o.col || T.ink, w: T.line, seed: 162 });
  };

  P.clock = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, r = (o.r || 46) * (o.scale || 1);
    d.circle(ctx, x, y, r, { p: o.p, col: o.col || T.ink, w: T.line * 1.2, seed: 171 });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      d.line(ctx, x + Math.cos(a) * r * 0.86, y + Math.sin(a) * r * 0.86, x + Math.cos(a) * r * 0.96, y + Math.sin(a) * r * 0.96, { p: o.p, col: o.col || T.dim, w: T.hair, seed: 172 + i });
    }
    const ang = o.angle == null ? -Math.PI / 2 : o.angle;
    d.line(ctx, x, y, x + Math.cos(ang) * r * 0.66, y + Math.sin(ang) * r * 0.66, { p: o.p, col: o.col || T.accent, w: T.line * 1.2, seed: 190 });
    d.line(ctx, x, y, x + Math.cos(ang + 2.1) * r * 0.42, y + Math.sin(ang + 2.1) * r * 0.42, { p: o.p, col: o.col || T.accent, w: T.line, seed: 191 });
  };

  P.bellJar = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, s = o.scale || 1;
    d.arc(ctx, x, y - 30 * s, 26 * s, Math.PI, 0, { p: o.p, col: o.col || T.ink, w: T.line, seed: 201 });
    d.line(ctx, x - 26 * s, y - 30 * s, x - 26 * s, y, { p: o.p, col: o.col || T.ink, w: T.line, seed: 202 });
    d.line(ctx, x + 26 * s, y - 30 * s, x + 26 * s, y, { p: o.p, col: o.col || T.ink, w: T.line, seed: 203 });
    d.line(ctx, x - 26 * s, y, x + 26 * s, y, { p: o.p, col: o.col || T.ink, w: T.line, seed: 204 });
  };

  P.log = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, s = o.scale || 1;
    d.line(ctx, x - 40 * s, y - 6 * s, x + 40 * s, y - 6 * s, { p: o.p, col: o.col || T.ink, w: T.line * 1.6, seed: 211 });
    if (o.fire) {
      ctx.save();
      ctx.globalAlpha = o.fire;
      ctx.strokeStyle = T.accent2; ctx.lineWidth = T.line;
      for (let i = -1; i <= 1; i++) {
        const hh = (16 + 10 * Math.sin((o.t || 0) * 6 + i)) * s;
        ctx.beginPath();
        ctx.moveTo(x + i * 18 * s, y - 12 * s);
        ctx.quadraticCurveTo(x + i * 18 * s, y - 12 * s - hh, x + i * 18 * s + 5 * s, y - 12 * s - hh * 1.3);
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  P.fieldRows = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, s = o.scale || 1;
    for (let i = 0; i < 7; i++) {
      d.line(ctx, x - 160 * s + i * 6 * s, y, x - 160 * s + i * 6 * s, y - 26 * s, { p: o.p, col: o.col || T.dim, w: T.hair * 1.6, seed: 220 + i });
    }
    d.line(ctx, x - 170 * s, y, x + 170 * s, y, { p: o.p, col: o.col || T.dim, w: T.hair, seed: 230 });
  };

  P.seedBag = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, s = o.scale || 1;
    d.poly(ctx, [[x - 20 * s, y], [x - 16 * s, y - 34 * s], [x + 16 * s, y - 34 * s], [x + 20 * s, y]], { p: o.p, col: o.col || T.ink, w: T.line, seed: 231, close: true });
    d.line(ctx, x - 12 * s, y - 34 * s, x - 8 * s, y - 44 * s, { p: o.p, col: o.col || T.ink, w: T.line, seed: 232 });
    d.line(ctx, x + 12 * s, y - 34 * s, x + 8 * s, y - 44 * s, { p: o.p, col: o.col || T.ink, w: T.line, seed: 233 });
  };

  P.lockedCabinet = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, s = o.scale || 1, w = 150 * s, h = 190 * s;
    d.rect(ctx, x - w / 2, y - h, w, h, { p: o.p, col: o.col || T.ink, w: T.line * 1.4, seed: 241 });
    d.line(ctx, x, y - h, x, y, { p: o.p, col: o.col || T.dim, w: T.hair, seed: 242 });
    // padlock
    const lx = x + w * 0.22, ly = y - h * 0.52;
    ctx.save();
    ctx.strokeStyle = o.locked === false ? T.accent : T.accent2;
    ctx.lineWidth = T.line * 1.4;
    ctx.beginPath();
    ctx.arc(lx, ly - 12 * s, 13 * s, Math.PI, 0);
    ctx.stroke();
    ctx.strokeRect(lx - 15 * s, ly - 12 * s, 30 * s, 24 * s);
    ctx.restore();
    if (o.closed != null) {
      d.text(ctx, o.closed ? 'CLOSED' : 'OPEN', x, y + 30 * s, T.type.small, { align: 'center', col: T.dim, layer: 'B' });
    }
  };

  P.pin = function (ctx, T, o) {
    const d = D(), x = o.x, y = o.y, s = o.scale || 1;
    d.circle(ctx, x, y, 9 * s, { p: o.p, col: o.col || T.accent, w: T.line, seed: 251 });
    d.circle(ctx, x, y, 20 * s, { p: o.p, col: o.col || T.dim, w: T.hair, seed: 252 });
  };

  P.NAMES = Object.keys(P).filter((k) => k !== 'NAMES');
})();
