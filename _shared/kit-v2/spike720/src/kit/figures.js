// kit-v2: line figures. Anonymous, faceless, 7 joints (head, torso, two arms with elbow,
// two legs with knee). Poses are keyframed; the rig emits SVG path data so it can be drawn
// on the blueprint canvas with the same stroke language as everything else.
// Authority: 00_SERIES/VISUAL_DIRECTION_S02.md section 1 (line figures).
(function () {
  const BB = (window.BB = window.BB || {});
  const F = (BB.figure = {});
  const lerp = (a, b, t) => a + (b - a) * t;

  // A rig is expressed in a local space: 1.8 head-heights tall, origin at the feet.
  // Joint layout for a standing figure (x right, y up from the ground).
  function standing() {
    return {
      head: { x: 0, y: 168, r: 15 },
      torso: { x: 0, y: 150 },
      armL: { x: -8, y: 146 }, elbowL: { x: -20, y: 116 }, handL: { x: -24, y: 88 },
      armR: { x: 8, y: 146 }, elbowR: { x: 22, y: 118 }, handR: { x: 26, y: 92 },
      hip: { x: 0, y: 92 },
      kneeL: { x: -9, y: 48 }, footL: { x: -11, y: 4 },
      kneeR: { x: 9, y: 48 }, footR: { x: 12, y: 4 },
    };
  }

  const POSES = {
    stand: standing,
    reach: () => {
      const j = standing();
      j.armR = { x: 10, y: 148 }; j.elbowR = { x: 34, y: 140 }; j.handR = { x: 52, y: 146 };
      j.armL = { x: -8, y: 146 }; j.elbowL = { x: -16, y: 116 }; j.handL = { x: -18, y: 90 };
      j.head = { x: 4, y: 168, r: 15 };
      return j;
    },
    push: () => {
      const j = standing();
      j.armR = { x: 10, y: 146 }; j.elbowR = { x: 32, y: 132 }; j.handR = { x: 48, y: 124 };
      j.armL = { x: -10, y: 146 }; j.elbowL = { x: -30, y: 130 }; j.handL = { x: -46, y: 122 };
      j.hip = { x: -6, y: 92 }; j.kneeL = { x: -16, y: 48 }; j.footL = { x: -22, y: 4 };
      j.kneeR = { x: 8, y: 48 }; j.footR = { x: 14, y: 4 };
      return j;
    },
    pump: () => {
      const j = standing();
      j.armR = { x: 10, y: 146 }; j.elbowR = { x: 26, y: 116 }; j.handR = { x: 14, y: 96 };
      j.armL = { x: -10, y: 146 }; j.elbowL = { x: -26, y: 116 }; j.handL = { x: -14, y: 96 };
      j.hip = { x: 0, y: 92 };
      return j;
    },
    carry: () => {
      const j = standing();
      j.armR = { x: 10, y: 146 }; j.elbowR = { x: 26, y: 128 }; j.handR = { x: 30, y: 110 };
      j.armL = { x: -10, y: 146 }; j.elbowL = { x: -26, y: 128 }; j.handL = { x: -30, y: 110 };
      j.head = { x: 0, y: 168, r: 15 };
      return j;
    },
    point: () => {
      const j = standing();
      j.armR = { x: 10, y: 146 }; j.elbowR = { x: 30, y: 144 }; j.handR = { x: 52, y: 142 };
      j.armL = { x: -8, y: 146 }; j.elbowL = { x: -18, y: 116 }; j.handL = { x: -20, y: 90 };
      return j;
    },
    sort: () => {
      const j = standing();
      j.armR = { x: 10, y: 146 }; j.elbowR = { x: 30, y: 130 }; j.handR = { x: 34, y: 108 };
      j.armL = { x: -10, y: 146 }; j.elbowL = { x: -28, y: 128 }; j.handL = { x: -30, y: 106 };
      j.head = { x: 0, y: 166, r: 15 };
      return j;
    },
    pass: () => {
      const j = standing();
      j.armR = { x: 10, y: 146 }; j.elbowR = { x: 34, y: 138 }; j.handR = { x: 56, y: 132 };
      j.armL = { x: -10, y: 146 }; j.elbowL = { x: -28, y: 122 }; j.handL = { x: -34, y: 100 };
      j.hip = { x: -4, y: 92 };
      return j;
    },
    'look-up': () => {
      const j = standing();
      j.head = { x: 2, y: 172, r: 15 };
      j.armR = { x: 10, y: 148 }; j.elbowR = { x: 24, y: 126 }; j.handR = { x: 26, y: 104 };
      j.armL = { x: -10, y: 148 }; j.elbowL = { x: -22, y: 128 }; j.handL = { x: -20, y: 108 };
      return j;
    },
    walk: () => {
      const j = standing();
      j.kneeL = { x: -14, y: 46 }; j.footL = { x: -26, y: 6 };
      j.kneeR = { x: 14, y: 50 }; j.footR = { x: 26, y: 2 };
      j.armR = { x: 10, y: 146 }; j.elbowR = { x: 24, y: 118 }; j.handR = { x: 30, y: 96 };
      j.armL = { x: -10, y: 146 }; j.elbowL = { x: -22, y: 120 }; j.handL = { x: -28, y: 98 };
      return j;
    },
  };
  F.POSES = POSES;

  // Blend two poses. Limb lengths are preserved: we interpolate joint positions and
  // then re-normalise the limb lengths to the target pose's lengths.
  F.blend = function (a, b, u) {
    const out = {};
    const keys = Object.keys(a);
    for (const k of keys) {
      if (typeof a[k] === 'number') { out[k] = lerp(a[k], b[k] == null ? a[k] : b[k], u); continue; }
      const A = a[k], B = b[k] || A;
      if (A.r != null) { out[k] = { x: lerp(A.x, B.x, u), y: lerp(A.y, B.y, u), r: lerp(A.r, B.r == null ? A.r : B.r, u) }; continue; }
      out[k] = { x: lerp(A.x, B.x, u), y: lerp(A.y, B.y, u) };
    }
    return out;
  };

  F.pose = function (name, t, o = {}) {
    const mk = POSES[name] || POSES.stand;
    const j = mk();
    if (o.phase != null) {
      // a small analytic motion so a held figure still breathes and moves
      const s = Math.sin((t + o.phase) * (o.speed || 2.2));
      j.handR = { x: j.handR.x + s * (o.amp || 6), y: j.handR.y - s * (o.amp || 6) * 0.6 };
      j.head = { x: j.head.x, y: j.head.y + s * 1.2, r: j.head.r };
    }
    return j;
  };

  // SVG path data for the rig, in rig-local units (y up). Returns {d, limbs}.
  F.paths = function (j) {
    const P = (x, y) => `${x.toFixed(2)},${(-y).toFixed(2)}`;
    const limbs = [
      ['M', P(j.torso.x, j.torso.y), 'L', P(j.armL.x, j.armL.y), 'L', P(j.elbowL.x, j.elbowL.y), 'L', P(j.handL.x, j.handL.y)],
      ['M', P(j.torso.x, j.torso.y), 'L', P(j.armR.x, j.armR.y), 'L', P(j.elbowR.x, j.elbowR.y), 'L', P(j.handR.x, j.handR.y)],
      ['M', P(j.hip.x, j.hip.y), 'L', P(j.kneeL.x, j.kneeL.y), 'L', P(j.footL.x, j.footL.y)],
      ['M', P(j.hip.x, j.hip.y), 'L', P(j.kneeR.x, j.kneeR.y), 'L', P(j.footR.x, j.footR.y)],
      ['M', P(j.torso.x, j.torso.y), 'L', P(j.hip.x, j.hip.y)],
    ];
    const head = `M ${(j.head.x - j.head.r).toFixed(2)},${(-j.head.y).toFixed(2)} a ${j.head.r},${j.head.r} 0 1,0 ${(j.head.r * 2).toFixed(2)},0 a ${j.head.r},${j.head.r} 0 1,0 ${(-j.head.r * 2).toFixed(2)},0`;
    const d = limbs.map((l) => l.join(' ')).join(' ') + ' ' + head;
    return { d, limbs, head };
  };

  // Draw a figure at (x, y) with a scale, accent colour on the active body part.
  F.draw = function (ctx, T, o) {
    const j = o.pose || F.pose('stand', o.t || 0);
    const s = o.scale == null ? 1 : o.scale;
    const ox = o.x || 0, oy = o.y || 0;
    const P = (x, y) => `${(ox + x * s).toFixed(2)},${(oy - y * s).toFixed(2)}`;
    const parts = [];
    const push = (d) => parts.push(d);
    push(`M ${P(j.torso.x, j.torso.y)} L ${P(j.armL.x, j.armL.y)} L ${P(j.elbowL.x, j.elbowL.y)} L ${P(j.handL.x, j.handL.y)}`);
    push(`M ${P(j.torso.x, j.torso.y)} L ${P(j.armR.x, j.armR.y)} L ${P(j.elbowR.x, j.elbowR.y)} L ${P(j.handR.x, j.handR.y)}`);
    push(`M ${P(j.hip.x, j.hip.y)} L ${P(j.kneeL.x, j.kneeL.y)} L ${P(j.footL.x, j.footL.y)}`);
    push(`M ${P(j.hip.x, j.hip.y)} L ${P(j.kneeR.x, j.kneeR.y)} L ${P(j.footR.x, j.footR.y)}`);
    push(`M ${P(j.torso.x, j.torso.y)} L ${P(j.hip.x, j.hip.y)}`);
    const r = j.head.r;
    push(`M ${(ox + (j.head.x - r) * s).toFixed(2)},${(oy - j.head.y * s).toFixed(2)} a ${(r * s).toFixed(2)},${(r * s).toFixed(2)} 0 1,0 ${(2 * r * s).toFixed(2)},0 a ${(r * s).toFixed(2)},${(r * s).toFixed(2)} 0 1,0 ${(-2 * r * s).toFixed(2)},0`);

    const col = o.col || T.ink;
    ctx.save();
    ctx.strokeStyle = col;
    ctx.lineWidth = (o.w || T.line * 1.15);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.globalAlpha = o.a == null ? 1 : o.a;
    for (const d of parts) {
      const p = new Path2D(d);
      ctx.stroke(p);
    }
    ctx.restore();

    // the active body part gets one accent fill
    if (o.accentPart) {
      const A = o.accentPart, c = o.accentCol || T.accent;
      ctx.save();
      ctx.globalAlpha = o.a == null ? 1 : o.a;
      ctx.strokeStyle = c; ctx.lineWidth = (o.w || T.line * 1.15) * 1.25;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (A === 'armR') {
        const p = new Path2D(`M ${P(j.torso.x, j.torso.y)} L ${P(j.armR.x, j.armR.y)} L ${P(j.elbowR.x, j.elbowR.y)} L ${P(j.handR.x, j.handR.y)}`);
        ctx.stroke(p);
      } else if (A === 'armL') {
        const p = new Path2D(`M ${P(j.torso.x, j.torso.y)} L ${P(j.armL.x, j.armL.y)} L ${P(j.elbowL.x, j.elbowL.y)} L ${P(j.handL.x, j.handL.y)}`);
        ctx.stroke(p);
      } else if (A === 'head') {
        const p = new Path2D(`M ${(ox + (j.head.x - r) * s).toFixed(2)},${(oy - j.head.y * s).toFixed(2)} a ${(r * s).toFixed(2)},${(r * s).toFixed(2)} 0 1,0 ${(2 * r * s).toFixed(2)},0 a ${(r * s).toFixed(2)},${(r * s).toFixed(2)} 0 1,0 ${(-2 * r * s).toFixed(2)},0`);
        ctx.stroke(p);
      }
      ctx.restore();
    }

    const box = {
      kind: 'figure', id: o.id || null, text: '',
      x0: ox - 30 * s, x1: ox + 60 * s, y0: oy - (j.head.y + j.head.r + 6) * s, y1: oy + 6 * s,
      color: col, opacity: o.a == null ? 1 : o.a, layer: 'C',
    };
    if (BB.report) BB.report.add(box);
    return box;
  };
})();
