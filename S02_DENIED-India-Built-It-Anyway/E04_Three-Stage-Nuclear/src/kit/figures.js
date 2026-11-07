// kit-v2: line figures. Anonymous, faceless, 7 joints (head, torso, two arms with elbow,
// two legs with knee). The rig is built by forward kinematics from fixed segment
// lengths, so every pose keeps the same limb lengths (QC: limb lengths constant to
// 0.1 px across a pose sweep).
//
// Authority: 00_SERIES/VISUAL_DIRECTION_S02.md section 1 (line figures).
(function () {
  const BB = (window.BB = window.BB || {});
  const F = (BB.figure = {});
  const lerp = (a, b, t) => a + (b - a) * t;
  const rad = (deg) => (deg * Math.PI) / 180;

  // fixed segment lengths, in rig units. The rig is a pictogram: a large head and a
  // wide body, 1.8 head widths across the shoulders.
  const LEN = {
    torso: 46,      // hip to shoulder
    neck: 16,        // shoulder to head centre
    head: 26,       // head radius
    shoulder: 47,   // half the shoulder width (1.8 head widths overall)
    upperArm: 26,
    foreArm: 24,
    thigh: 32,
    shin: 30,
  };
  F.LEN = LEN;

  // direction for a limb angle: 0 = straight down, 90 = forward, 180 = straight up.
  // Angles are absolute (not mirrored), so both arms can reach the same way.
  function dir(deg) { return [Math.sin(rad(deg)), -Math.cos(rad(deg))]; }

  // A pose is a set of joint angles. Angles are in degrees.
  //   armL/armR: { sh: shoulder angle, el: elbow bend }
  //   legL/legR: { hip: hip angle, knee: knee bend }
  //   head: { tilt: head angle }
  const POSES = {
    stand: {
      armL: { sh: -4, el: 6 }, armR: { sh: 4, el: 6 },
      legL: { hip: 3, knee: 2 }, legR: { hip: -3, knee: 2 }, head: { tilt: 0 },
    },
    reach: {
      armL: { sh: -6, el: 8 }, armR: { sh: 88, el: -8 },
      legL: { hip: 4, knee: 2 }, legR: { hip: -4, knee: 2 }, head: { tilt: 6 },
    },
    push: {
      armL: { sh: 78, el: 4 }, armR: { sh: 78, el: 4 },
      legL: { hip: 16, knee: 6 }, legR: { hip: -12, knee: 4 }, head: { tilt: 5 },
    },
    pump: {
      armL: { sh: 22, el: 68 }, armR: { sh: 22, el: 68 },
      legL: { hip: 4, knee: 3 }, legR: { hip: -4, knee: 3 }, head: { tilt: 0 },
    },
    carry: {
      armL: { sh: 42, el: 40 }, armR: { sh: 42, el: 40 },
      legL: { hip: 5, knee: 3 }, legR: { hip: -5, knee: 3 }, head: { tilt: 0 },
    },
    point: {
      armL: { sh: -5, el: 6 }, armR: { sh: 86, el: 0 },
      legL: { hip: 3, knee: 2 }, legR: { hip: -3, knee: 2 }, head: { tilt: 5 },
    },
    sort: {
      armL: { sh: 50, el: 38 }, armR: { sh: 50, el: 38 },
      legL: { hip: 5, knee: 3 }, legR: { hip: -5, knee: 3 }, head: { tilt: 8 },
    },
    pass: {
      armL: { sh: -12, el: 10 }, armR: { sh: 76, el: 10 },
      legL: { hip: 20, knee: 8 }, legR: { hip: -12, knee: 4 }, head: { tilt: 3 },
    },
    'look-up': {
      armL: { sh: 14, el: 26 }, armR: { sh: 14, el: 26 },
      legL: { hip: 4, knee: 3 }, legR: { hip: -4, knee: 3 }, head: { tilt: -18 },
    },
    walk: {
      armL: { sh: -24, el: 12 }, armR: { sh: 26, el: 10 },
      legL: { hip: 22, knee: -16 }, legR: { hip: -20, knee: 24 }, head: { tilt: 0 },
    },
  };
  F.POSES = POSES;

  // forward kinematics: pose -> joint positions
  function build(pose) {
    const hip = { x: 0, y: 0 };
    const shoulder = { x: 0, y: LEN.torso };
    const head = { x: 0, y: LEN.torso + LEN.neck, r: LEN.head };
    const j = { hip, torso: shoulder, head };

    const arm = (side, spec, sign) => {
      const sh = { x: sign * LEN.shoulder, y: LEN.torso };
      const d1 = dir(spec.sh);
      const elbow = { x: sh.x + d1[0] * LEN.upperArm, y: sh.y + d1[1] * LEN.upperArm };
      const d2 = dir(spec.sh + spec.el);
      const hand = { x: elbow.x + d2[0] * LEN.foreArm, y: elbow.y + d2[1] * LEN.foreArm };
      j['arm' + side] = sh; j['elbow' + side] = elbow; j['hand' + side] = hand;
    };
    arm('L', pose.armL, -1);
    arm('R', pose.armR, 1);

    const leg = (side, spec, sign) => {
      const d1 = dir(spec.hip);
      const knee = { x: hip.x + d1[0] * LEN.thigh, y: hip.y + d1[1] * LEN.thigh };
      const d2 = dir(spec.hip + spec.knee);
      const foot = { x: knee.x + d2[0] * LEN.shin, y: knee.y + d2[1] * LEN.shin };
      j['knee' + side] = knee; j['foot' + side] = foot;
    };
    leg('L', pose.legL, -1);
    leg('R', pose.legR, 1);

    if (pose.head && pose.head.tilt) {
      const a = rad(pose.head.tilt);
      head.x = Math.sin(a) * 6;
      head.y = LEN.torso + LEN.neck + Math.cos(a) * 2;
    }
    return j;
  }
  F.build = build;

  // Blend two poses. The angles are interpolated and the rig is rebuilt, so the limb
  // lengths stay exactly constant.
  F.blend = function (a, b, u) {
    const mix = (p, q) => ({
      armL: { sh: lerp(p.armL.sh, q.armL.sh, u), el: lerp(p.armL.el, q.armL.el, u) },
      armR: { sh: lerp(p.armR.sh, q.armR.sh, u), el: lerp(p.armR.el, q.armR.el, u) },
      legL: { hip: lerp(p.legL.hip, q.legL.hip, u), knee: lerp(p.legL.knee, q.legL.knee, u) },
      legR: { hip: lerp(p.legR.hip, q.legR.hip, u), knee: lerp(p.legR.knee, q.legR.knee, u) },
      head: { tilt: lerp(p.head.tilt, q.head.tilt, u) },
    });
    return build(mix(a, b));
  };

  F.pose = function (name, t, o = {}) {
    const p = POSES[name] || POSES.stand;
    let pose = p;
    if (o.phase != null) {
      // a small analytic motion so a held figure still moves
      const s = Math.sin((t + o.phase) * (o.speed || 2.2));
      const amp = o.amp == null ? 8 : o.amp;
      pose = {
        armL: { sh: p.armL.sh, el: p.armL.el + s * amp * 0.5 },
        armR: { sh: p.armR.sh, el: p.armR.el - s * amp * 0.5 },
        legL: p.legL, legR: p.legR, head: p.head,
      };
    }
    return build(pose);
  };

  // Draw a figure at (x, y) with a scale, one accent body part.
  F.draw = function (ctx, T, o) {
    const j = o.pose || F.pose('stand', o.t || 0);
    const s = o.scale == null ? 1 : o.scale;
    const ox = o.x || 0, oy = o.y || 0;
    const P = (x, y) => `${(ox + x * s).toFixed(2)},${(oy - y * s).toFixed(2)}`;
    const limb = (a, b) => `M ${P(a.x, a.y)} L ${P(b.x, b.y)}`;
    const parts = [
      limb(j.armL, j.elbowL), limb(j.elbowL, j.handL),
      limb(j.armR, j.elbowR), limb(j.elbowR, j.handR),
      limb(j.hip, j.kneeL), limb(j.kneeL, j.footL),
      limb(j.hip, j.kneeR), limb(j.kneeR, j.footR),
      limb(j.hip, j.torso),
    ];
    const r = j.head.r;
    const headPath = `M ${(ox + (j.head.x - r) * s).toFixed(2)},${(oy - j.head.y * s).toFixed(2)} a ${(r * s).toFixed(2)},${(r * s).toFixed(2)} 0 1,0 ${(2 * r * s).toFixed(2)},0 a ${(r * s).toFixed(2)},${(r * s).toFixed(2)} 0 1,0 ${(-2 * r * s).toFixed(2)},0`;

    const col = o.col || T.ink;
    ctx.save();
    ctx.strokeStyle = col;
    ctx.lineWidth = (o.w || T.line * 1.15);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.globalAlpha = o.a == null ? 1 : o.a;
    for (const d of parts) ctx.stroke(new Path2D(d));
    ctx.stroke(new Path2D(headPath));
    ctx.restore();

    if (o.accentPart) {
      const A = o.accentPart, c = o.accentCol || T.accent;
      ctx.save();
      ctx.globalAlpha = o.a == null ? 1 : o.a;
      ctx.strokeStyle = c; ctx.lineWidth = (o.w || T.line * 1.15) * 1.3;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (A === 'armR') ctx.stroke(new Path2D([limb(j.armR, j.elbowR), limb(j.elbowR, j.handR)].join(' ')));
      else if (A === 'armL') ctx.stroke(new Path2D([limb(j.armL, j.elbowL), limb(j.elbowL, j.handL)].join(' ')));
      else if (A === 'head') ctx.stroke(new Path2D(headPath));
      ctx.restore();
    }

    const minX = Math.min(j.handL.x, j.handR.x, j.footL.x, j.footR.x, j.head.x - r);
    const maxX = Math.max(j.handL.x, j.handR.x, j.footL.x, j.footR.x, j.head.x + r);
    const box = {
      kind: 'figure', id: o.id || null, text: '',
      x0: ox + (minX - 6) * s, x1: ox + (maxX + 6) * s,
      y0: oy - (j.head.y + r + 6) * s, y1: oy + 6 * s,
      color: col, opacity: o.a == null ? 1 : o.a, layer: 'C',
    };
    if (BB.report) BB.report.add(box);
    return box;
  };

  // the hand position of a pose, so props can be placed in the hand
  F.hand = function (j, side) { return j['hand' + side]; };
})();

