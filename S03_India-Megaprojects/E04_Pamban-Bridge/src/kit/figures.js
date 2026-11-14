// kit-v2: line figures, round 2. Anonymous, faceless pictogram people in the blueprint
// line language: head height = 1/7.5 of the figure, a rounded torso, two-segment capsule
// limbs, hands and feet. Every limb starts exactly at its parent joint (QC R7), limb
// lengths are constant for every pose (the rig is forward kinematics), and a pose cycle
// animates the figure for the whole beat.
(function () {
  const BB = (window.BB = window.BB || {});
  const F = (BB.figure = {});
  const lerp = (a, b, t) => a + (b - a) * t;
  const rad = (deg) => (deg * Math.PI) / 180;

  // rig units; total height about 250 (hip to ankle 118, torso 70, neck+head 60)
  const LEN = { torso: 70, neck: 22, head: 19, shoulder: 23, upperArm: 44, foreArm: 40, thigh: 60, shin: 58 };
  const RAD = { torso: 21, upperArm: 9, foreArm: 8, thigh: 13, shin: 10.5, hand: 8, neck: 6 };
  F.LEN = LEN; F.RAD = RAD;
  F.HEIGHT = LEN.thigh + LEN.shin + LEN.torso + LEN.neck + LEN.head; // hip-to-top plus legs

  // 0 = straight down, 90 = forward (+x), 180 = straight up; absolute angles
  function dir(deg) { return [Math.sin(rad(deg)), -Math.cos(rad(deg))]; }

  const POSES = {
    stand: { armL: { sh: -4, el: 8 }, armR: { sh: 4, el: 8 }, legL: { hip: 3, knee: 2 }, legR: { hip: -3, knee: 2 }, head: { tilt: 0 } },
    reach: { armL: { sh: -8, el: 10 }, armR: { sh: 88, el: -8 }, legL: { hip: 5, knee: 2 }, legR: { hip: -5, knee: 2 }, head: { tilt: 6 } },
    push: { armL: { sh: 78, el: 4 }, armR: { sh: 78, el: 4 }, legL: { hip: 18, knee: 6 }, legR: { hip: -14, knee: 4 }, head: { tilt: 5 } },
    pumpUp: { armL: { sh: 118, el: 18 }, armR: { sh: 118, el: 18 }, legL: { hip: 4, knee: 3 }, legR: { hip: -4, knee: 3 }, head: { tilt: 0 } },
    pumpDown: { armL: { sh: 48, el: 52 }, armR: { sh: 48, el: 52 }, legL: { hip: 6, knee: 5 }, legR: { hip: -6, knee: 5 }, head: { tilt: 4 } },
    pump: { armL: { sh: 70, el: 40 }, armR: { sh: 70, el: 40 }, legL: { hip: 5, knee: 4 }, legR: { hip: -5, knee: 4 }, head: { tilt: 2 } },
    carry: { armL: { sh: 42, el: 40 }, armR: { sh: 42, el: 40 }, legL: { hip: 5, knee: 3 }, legR: { hip: -5, knee: 3 }, head: { tilt: 0 } },
    point: { armL: { sh: -5, el: 6 }, armR: { sh: 86, el: 0 }, legL: { hip: 3, knee: 2 }, legR: { hip: -3, knee: 2 }, head: { tilt: 5 } },
    pointUp: { armL: { sh: -5, el: 6 }, armR: { sh: 128, el: 0 }, legL: { hip: 3, knee: 2 }, legR: { hip: -3, knee: 2 }, head: { tilt: -10 } },
    sort: { armL: { sh: 52, el: 36 }, armR: { sh: 52, el: 36 }, legL: { hip: 5, knee: 3 }, legR: { hip: -5, knee: 3 }, head: { tilt: 8 } },
    sortB: { armL: { sh: 76, el: 20 }, armR: { sh: 30, el: 55 }, legL: { hip: 5, knee: 3 }, legR: { hip: -5, knee: 3 }, head: { tilt: 8 } },
    pass: { armL: { sh: -12, el: 10 }, armR: { sh: 76, el: 10 }, legL: { hip: 22, knee: 8 }, legR: { hip: -14, knee: 4 }, head: { tilt: 3 } },
    'look-up': { armL: { sh: 14, el: 26 }, armR: { sh: 14, el: 26 }, legL: { hip: 4, knee: 3 }, legR: { hip: -4, knee: 3 }, head: { tilt: -18 } },
    walk: { armL: { sh: -26, el: 12 }, armR: { sh: 28, el: 10 }, legL: { hip: 24, knee: -16 }, legR: { hip: -22, knee: 26 }, head: { tilt: 0 } },
    walkB: { armL: { sh: 28, el: 10 }, armR: { sh: -26, el: 12 }, legL: { hip: -22, knee: 26 }, legR: { hip: 24, knee: -16 }, head: { tilt: 0 } },
    wave: { armL: { sh: -6, el: 8 }, armR: { sh: 150, el: 30 }, legL: { hip: 3, knee: 2 }, legR: { hip: -3, knee: 2 }, head: { tilt: 4 } },
    hold: { armL: { sh: 64, el: 62 }, armR: { sh: 64, el: 62 }, legL: { hip: 4, knee: 2 }, legR: { hip: -4, knee: 2 }, head: { tilt: 3 } },
  };
  F.POSES = POSES;

  function build(pose) {
    const hip = { x: 0, y: 0 };
    const shoulder = { x: 0, y: LEN.torso };
    const head = { x: 0, y: LEN.torso + LEN.neck, r: LEN.head };
    const j = { hip, torso: shoulder, head };
    const arm = (side, spec, sign) => {
      const sh = { x: sign * LEN.shoulder, y: LEN.torso - 4 };
      const d1 = dir(spec.sh);
      const elbow = { x: sh.x + d1[0] * LEN.upperArm, y: sh.y + d1[1] * LEN.upperArm };
      const d2 = dir(spec.sh + spec.el);
      const hand = { x: elbow.x + d2[0] * LEN.foreArm, y: elbow.y + d2[1] * LEN.foreArm };
      j['arm' + side] = sh; j['elbow' + side] = elbow; j['hand' + side] = hand;
    };
    arm('L', pose.armL, -1);
    arm('R', pose.armR, 1);
    const leg = (side, spec, sign) => {
      const h = { x: sign * 11, y: 0 };
      const d1 = dir(spec.hip);
      const knee = { x: h.x + d1[0] * LEN.thigh, y: h.y + d1[1] * LEN.thigh };
      const d2 = dir(spec.hip + spec.knee);
      const foot = { x: knee.x + d2[0] * LEN.shin, y: knee.y + d2[1] * LEN.shin };
      j['hip' + side] = h; j['knee' + side] = knee; j['foot' + side] = foot;
    };
    leg('L', pose.legL, -1);
    leg('R', pose.legR, 1);
    if (pose.head && pose.head.tilt) {
      const a = rad(pose.head.tilt);
      head.x = Math.sin(a) * 5;
      head.y = LEN.torso + LEN.neck + Math.cos(a) * 1.5;
    }
    return j;
  }
  F.build = build;

  const mix = (p, q, u) => ({
    armL: { sh: lerp(p.armL.sh, q.armL.sh, u), el: lerp(p.armL.el, q.armL.el, u) },
    armR: { sh: lerp(p.armR.sh, q.armR.sh, u), el: lerp(p.armR.el, q.armR.el, u) },
    legL: { hip: lerp(p.legL.hip, q.legL.hip, u), knee: lerp(p.legL.knee, q.legL.knee, u) },
    legR: { hip: lerp(p.legR.hip, q.legR.hip, u), knee: lerp(p.legR.knee, q.legR.knee, u) },
    head: { tilt: lerp(p.head.tilt, q.head.tilt, u) },
  });
  F.blend = function (a, b, u) { return build(mix(a, b, u)); };

  // a single pose, with a small analytic motion
  F.pose = function (name, t, o = {}) {
    const p = POSES[name] || POSES.stand;
    if (o.phase == null) return build(p);
    const s = Math.sin((t + o.phase) * (o.speed || 2.2));
    const amp = o.amp == null ? 8 : o.amp;
    return build({
      armL: { sh: p.armL.sh + s * amp * 0.35, el: p.armL.el + s * amp * 0.5 },
      armR: { sh: p.armR.sh - s * amp * 0.35, el: p.armR.el - s * amp * 0.5 },
      legL: p.legL, legR: p.legR, head: p.head,
    });
  };

  // a pose cycle between two named poses, `hz` cycles per second: the figure acts for the whole beat
  F.cycle = function (a, b, t, hz, phase) {
    const u = 0.5 - 0.5 * Math.cos(2 * Math.PI * (hz || 0.6) * (t + (phase || 0)));
    return build(mix(POSES[a] || POSES.stand, POSES[b] || POSES.stand, u));
  };

  function capsule(ctx, ax, ay, bx, by, r, fill, stroke, lw) {
    const ang = Math.atan2(by - ay, bx - ax);
    ctx.beginPath();
    ctx.arc(ax, ay, r, ang + Math.PI / 2, ang + Math.PI * 1.5);
    ctx.arc(bx, by, r, ang - Math.PI / 2, ang + Math.PI / 2);
    ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke();
  }

  // Draw a figure. (x, y) is the hip point; use F.groundY(scale, ground) to stand on a floor.
  F.groundY = function (scale, ground) { return ground - (LEN.thigh + LEN.shin) * scale; };

  F.draw = function (ctx, T, o) {
    const j = o.pose || F.pose('stand', o.t || 0);
    const s = o.scale == null ? 1 : o.scale;
    const ox = o.x || 0, oy = o.y || 0;
    const FL = o.flip ? -1 : 1;
    const X = (x) => ox + FL * x * s, Y = (y) => oy - y * s;
    const col = o.col || T.ink;
    const fill = o.fill || 'rgba(7,30,62,0.96)';
    const acc = o.accentCol || T.accent;
    const lw = o.w || T.line * 1.1;
    const A = o.a == null ? 1 : o.a;
    const accentPart = o.accentPart;
    ctx.save();
    ctx.globalAlpha = A;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const limb = (p, q, r, isAcc) => capsule(ctx, X(p.x), Y(p.y), X(q.x), Y(q.y), r * s, fill, isAcc ? acc : col, isAcc ? lw * 1.4 : lw);
    const hand = (h, isAcc) => { ctx.beginPath(); ctx.arc(X(h.x), Y(h.y), RAD.hand * s, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = isAcc ? acc : col; ctx.lineWidth = lw; ctx.stroke(); };
    const foot = (k, f) => {
      ctx.beginPath();
      ctx.ellipse(X(f.x + 9), Y(f.y - 3), 17 * s, 7 * s, 0, 0, Math.PI * 2);
      ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke();
    };
    // back side first
    limb(j.hipL, j.kneeL, RAD.thigh); limb(j.kneeL, j.footL, RAD.shin); foot(j.kneeL, j.footL);
    limb(j.armL, j.elbowL, RAD.upperArm, accentPart === 'armL'); limb(j.elbowL, j.handL, RAD.foreArm, accentPart === 'armL'); hand(j.handL, accentPart === 'armL');
    // torso and neck
    capsule(ctx, X(0), Y(2), X(0), Y(LEN.torso - 6), RAD.torso * s, fill, col, lw);
    capsule(ctx, X(0), Y(LEN.torso), X(j.head.x), Y(j.head.y - 6), RAD.neck * s, fill, col, lw);
    // front side
    limb(j.hipR, j.kneeR, RAD.thigh); limb(j.kneeR, j.footR, RAD.shin); foot(j.kneeR, j.footR);
    // head
    ctx.beginPath(); ctx.arc(X(j.head.x), Y(j.head.y), j.head.r * s, 0, Math.PI * 2);
    ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = accentPart === 'head' ? acc : col; ctx.lineWidth = accentPart === 'head' ? lw * 1.4 : lw; ctx.stroke();
    limb(j.armR, j.elbowR, RAD.upperArm, accentPart === 'armR'); limb(j.elbowR, j.handR, RAD.foreArm, accentPart === 'armR'); hand(j.handR, accentPart === 'armR');
    ctx.restore();

    const r = j.head.r;
    const minX = Math.min(j.handL.x, j.handR.x, j.footL.x - 10, j.footR.x - 10, j.head.x - r, -RAD.torso);
    const maxX = Math.max(j.handL.x, j.handR.x, j.footL.x + 26, j.footR.x + 26, j.head.x + r, RAD.torso);
    const box = {
      kind: 'figure', id: o.id || null, text: '',
      x0: ox + (minX - 8) * s, x1: ox + (maxX + 8) * s,
      y0: oy - (j.head.y + r + 6) * s, y1: oy + (LEN.thigh + LEN.shin + 10) * s,
      color: col, opacity: A, layer: 'C',
    };
    if (BB.report) BB.report.add(box);
    return box;
  };

  F.hand = function (j, side) { return j['hand' + side]; };
})();
