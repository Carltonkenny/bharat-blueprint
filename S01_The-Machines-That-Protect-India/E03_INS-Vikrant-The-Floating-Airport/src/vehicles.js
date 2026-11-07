// Detailed, reusable blueprint vehicles: a fighter in side / top / front view (wheels, canopy, intake, wings, fin, hook, flame),
// a carrier in side view with its own idle motion (radar, wake, portholes) and an exploded oblique view.
// Units are drawing units; everything is a pure function of its arguments plus BP.now for idle motion.
(function () {
  const BP = window.BP, C = BP.C, seg = BP.seg, M = BP.M;
  const V = (BP.V = {});
  V.GEAR = 7;                                                       // wheel-centre drop below the belly
  V.GROUND = 6.2 + V.GEAR + 2.4;                                    // fuselage centre to the bottom of a fully lowered wheel
  const tf = (x, y, s, rot) => { const c = Math.cos(rot || 0), n = Math.sin(rot || 0); return (u, v) => [x + (u * c - v * n) * s, y + (u * n + v * c) * s]; };
  const fillOf = (o) => (o.fill === false ? null : 'rgba(238,246,255,0.14)');
  const wheel = (ix, P, s, u, v, o, seed) => {
    const [cx, cy] = P(u, v), r = 2.4 * s;
    BP.circle(ix, cx, cy, r, { w: 1.8, p: o.p, seed, a: o.a });
    if ((o.p == null || o.p >= 1) && r > 3) { const a = o.spin || 0; BP.line(ix, cx - Math.cos(a) * r * 0.8, cy - Math.sin(a) * r * 0.8, cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.8, { w: 1.2, seed: seed + 1, j: 0, a: o.a }); }
  };

  // ---------- fighter, side view (nose to +x). o: p, id, seed, rot, gear 0..1, hook 0..1, flame 0..1, spin (rad), a, dash, fill ----------
  V.jetSide = function (ix, x, y, s, o = {}) {
    const p = o.p == null ? 1 : o.p, id = o.id || 'js', sd = o.seed || 900, P = tf(x, y, s, o.rot), g = o.gear == null ? 1 : o.gear, hk = o.hook || 0, fl = o.flame || 0;
    const E = (w, k) => ({ w, a: o.a, dash: o.dash, p: seg(p, k[0], k[1]), seed: sd + k[0] * 10 });
    const fill = fillOf(o), pts = (a) => a.map(([u, v]) => P(u, v));
    const sm = (a, n = 2) => { let q = a; for (let k = 0; k < n; k++) { const r = [q[0]]; for (let i = 0; i < q.length - 1; i++) { const A = q[i], B = q[i + 1]; r.push([A[0] * 0.75 + B[0] * 0.25, A[1] * 0.75 + B[1] * 0.25], [A[0] * 0.25 + B[0] * 0.75, A[1] * 0.25 + B[1] * 0.75]); } r.push(q[q.length - 1]); q = r; } return q; };
    BP.poly(ix, pts([[10, 3.5], [-18, 10.5], [-30, 10.5], [-16, 4]]), Object.assign({ close: true, fill, j: 0.3 }, E(1.5, [0.1, 0.5])));                         // wing, thin delta
    BP.poly(ix, pts([[-34, 3], [-49, 8.5], [-44, 8.5], [-30, 4.5]]), Object.assign({ close: true, fill, j: 0.3 }, E(1.4, [0.2, 0.55])));                    // stabiliser
    BP.poly(ix, pts([[-24, -6.5], [-41, -25], [-34, -25], [-16, -6.5]]), Object.assign({ close: true, fill, j: 0.3 }, E(1.6, [0.2, 0.6])));                // fin
    const body = sm([[52, 1.5], [44, -1.2], [34, -4], [8, -6.4], [-30, -6.6], [-46, -4.6], [-50, -1.4], [-50, 1.4], [-46, 3.6], [-30, 5.4], [8, 6.4], [30, 4.4], [44, 3]], 2);
    BP.poly(ix, pts(body), Object.assign({ close: true, fill, j: 0.25 }, E(2, [0, 0.55])));                                                                  // fuselage, one smooth profile
    BP.poly(ix, pts(sm([[34, -4], [27, -8.6], [17, -10.4], [8, -8.2], [5, -6.3]], 2)), Object.assign({ j: 0.25, fill: 'rgba(134,220,255,0.10)' }, E(1.5, [0.45, 0.75])));   // bubble canopy
    BP.poly(ix, pts([[13, -2.4], [11.5, 1.5], [13, 5.8]]), Object.assign({}, E(1.2, [0.55, 0.8]), { j: 0 }));                                              // intake lip
    BP.poly(ix, pts([[-50, -3.4], [-54, -4.2], [-54, 4.2], [-50, 3.4]]), Object.assign({ close: true }, E(1.5, [0.6, 0.85])));                              // nozzle
    BP.line(ix, ...P(-20, -6.5), ...P(-20, 5.5), Object.assign(E(0.9, [0.65, 0.9]), { j: 0, col: C.cyan, a: 0.6 }));                                        // panel lines
    BP.circle(ix, ...P(-9, -1.5), 1.9 * s, { w: 1, p: seg(p, 0.7, 0.95), seed: sd + 40, a: o.a, col: C.cyan });                                              // roundel
    if (g > 0.08 && p >= 0.9) {                                                                                                                              // small tucked landing gear
      const ga = (o.a == null ? 1 : o.a) * Math.min(1, g * 1.4);
      [[-7, 0], [27, 1]].forEach(([u], i) => {
        const [bx, by] = P(u, 6.2), [wx, wy] = P(u, 6.2 + V.GEAR * g);
        BP.line(ix, bx, by, wx, wy, { w: 1.4, seed: sd + 50 + i, j: 0, a: ga });
        wheel(ix, P, s, u, 6.2 + V.GEAR * g, { p: 1, a: ga, spin: o.spin }, sd + 60 + i * 3);
      });
    }
    const ha = 1.0 * hk, hl = (V.GROUND - 3) / Math.sin(1.0) * Math.min(1, hk * 1.2), tip = P(-48 - hl * Math.cos(ha), 3 + hl * Math.sin(ha));
    BP.pt(id + ':hookTip', ...tip);
    if (hk > 0.02) BP.line(ix, ...P(-48, 3), ...tip, { w: 2, seed: sd + 70, j: 0, a: o.a, col: C.orange });                                               // arrester hook
    if (fl > 0.02) {                                                                                                                                         // afterburner
      const k = fl * (1 + 0.18 * Math.sin(M.clock() * 46));
      ix.save(); ix.fillStyle = 'rgba(255,155,61,0.55)'; ix.beginPath(); const q = pts([[-54, -3.2], [-54 - 24 * k, 0], [-54, 3.2]]); ix.moveTo(...q[0]); ix.lineTo(...q[1]); ix.lineTo(...q[2]); ix.closePath(); ix.fill(); ix.restore();
      M.particles(ix, { t: M.clock(), t0: 0, rate: 40, life: 0.45, from: () => P(-55, 0), vx: -170 * s, vy: 0, spread: 9 * s, size: 1.8, col: C.orange, a: 0.9, seed: sd });
    }
    BP.pt(id + ':hook', ...P(-48, 3)); BP.pt(id + ':nose', ...P(52, 1.5)); BP.pt(id + ':engine', ...P(-26, 0)); BP.pt(id + ':top', ...P(0, -10.4)); BP.pt(id + ':wheel', ...P(-7, 6.2 + V.GEAR * g));
  };

  // ---------- fighter, plan view (nose to +x) ----------
  V.jetTop = function (ix, x, y, s, o = {}) {
    const p = o.p == null ? 1 : o.p, id = o.id || 'jt', sd = o.seed || 950, P = tf(x, y, s, o.rot), fill = fillOf(o), pts = (a) => a.map(([u, v]) => P(u, v));
    const E = (w, k) => ({ w, a: o.a, dash: o.dash, p: seg(p, k[0], k[1]), seed: sd + Math.round(k[0] * 10) });
    [-1, 1].forEach((m, i) => {
      BP.poly(ix, pts([[16, 4.5 * m], [-12, 34 * m], [-26, 34 * m], [-24, 4.5 * m]]), Object.assign({ close: true, fill }, E(1.8, [0.1, 0.55]), { seed: sd + i }));            // wing
      BP.poly(ix, pts([[-34, 4 * m], [-46, 15 * m], [-47, 11 * m], [-42, 4 * m]]), Object.assign({ close: true, fill }, E(1.6, [0.3, 0.6]), { seed: sd + 3 + i }));          // tail plane
      BP.line(ix, ...P(-4, 20 * m), ...P(-18, 26 * m), Object.assign(E(1, [0.6, 0.85]), { j: 0, col: C.cyan, seed: sd + 6 + i }));                                           // flap line
      BP.poly(ix, pts([[10, 5 * m], [4, 9 * m], [-2, 9 * m], [-2, 5 * m]]), Object.assign({ close: true }, E(1.4, [0.5, 0.75]), { seed: sd + 8 + i }));                       // intake
      BP.line(ix, ...P(-14, 34 * m), ...P(-24, 34 * m), Object.assign(E(3, [0.55, 0.8]), { seed: sd + 10 + i, j: 0 }));                                                      // missile rail
      BP.rect(ix, ...P(-7, 8.5 * m).map((v, k) => v - (k ? 2 : 3) * s), 6 * s, 4 * s, Object.assign({ over: false }, E(1.2, [0.75, 0.95]), { dash: [4, 3], seed: sd + 12 + i })); // hidden gear bay
    });
    BP.poly(ix, pts([[48, 0], [40, -3.2], [28, -4.6], [-30, -4.6], [-42, -3.2], [-46, 0], [-42, 3.2], [-30, 4.6], [28, 4.6], [40, 3.2]]), Object.assign({ close: true, fill }, E(2.2, [0, 0.5])));
    BP.poly(ix, pts([[30, 0], [22, -2.6], [13, -2.2], [13, 2.2], [22, 2.6]]), Object.assign({ close: true }, E(1.6, [0.5, 0.8])));                                              // canopy
    BP.poly(ix, pts([[-46, -2.4], [-51, -2.8], [-51, 2.8], [-46, 2.4]]), Object.assign({ close: true }, E(1.6, [0.6, 0.85])));                                                 // nozzle
    BP.line(ix, ...P(-56, 0), ...P(56, 0), { w: 1, p: seg(p, 0.5, 1), seed: sd + 20, col: C.cyan, dash: [14, 8, 3, 8], j: 0, a: 0.8 });                                         // centre line
    BP.pt(id + ':nose', ...P(48, 0)); BP.pt(id + ':tail', ...P(-51, 0)); BP.pt(id + ':wing', ...P(-14, -34)); BP.pt(id + ':wingtipL', ...P(-20, -34)); BP.pt(id + ':wingtipR', ...P(-20, 34));
  };

  // ---------- fighter, front view ----------
  V.jetFront = function (ix, x, y, s, o = {}) {
    const p = o.p == null ? 1 : o.p, id = o.id || 'jf', sd = o.seed || 980, P = tf(x, y, s, 0), fill = fillOf(o), pts = (a) => a.map(([u, v]) => P(u, v));
    const E = (w, k) => ({ w, a: o.a, p: seg(p, k[0], k[1]), seed: sd + Math.round(k[0] * 10) });
    const el = Array.from({ length: 24 }, (_, i) => [Math.cos(i / 24 * 6.2832) * 7, Math.sin(i / 24 * 6.2832) * 7.5]);
    [-1, 1].forEach((m, i) => {
      BP.poly(ix, pts([[6 * m, 1], [34 * m, 5], [34 * m, 7.5], [6 * m, 5]]), Object.assign({ close: true, fill }, E(1.8, [0.1, 0.5]), { seed: sd + i }));
      BP.poly(ix, pts([[6 * m, 2.5], [14 * m, 4], [14 * m, 5.6], [6 * m, 4.6]]), Object.assign({ close: true }, E(1.4, [0.3, 0.6]), { seed: sd + 3 + i }));
      BP.rect(ix, ...P(m > 0 ? 6.5 : -11.5, -2), 5 * s, 8 * s, Object.assign({ over: false }, E(1.5, [0.5, 0.8]), { seed: sd + 6 + i }));                               // intake
    });
    BP.poly(ix, pts([[-1.6, -7], [-1.2, -26], [1.2, -26], [1.6, -7]]), Object.assign({ close: true, fill }, E(1.8, [0.2, 0.6])));                                              // fin
    BP.poly(ix, pts(el), Object.assign({ close: true, fill }, E(2.2, [0, 0.5])));
    BP.arc(ix, ...P(0, -4), 4.6 * s, Math.PI, 2 * Math.PI, Object.assign({}, E(1.6, [0.45, 0.8])));                                                                           // canopy
    if (o.gear !== 0) { [[-9, 'l'], [9, 'r'], [0, 'n']].forEach(([u], i) => { BP.line(ix, ...P(u, 6), ...P(u, 16.6), { w: 1.8, p: seg(p, 0.7, 0.9), seed: sd + 20 + i, j: 0, a: o.a }); BP.rect(ix, ...P(u - 1.3, 16.6), 2.6 * s, 7 * s, { w: 1.6, p: seg(p, 0.75, 1), seed: sd + 24 + i, over: false, a: o.a }); }); }
    BP.pt(id + ':top', ...P(0, -26)); BP.pt(id + ':wingtip', ...P(34, 6));
  };

  // ---------- carrier, side view with idle motion. o: p, id, seed, a, jets:[{u, ...jetSide opts}], bob ----------
  V.carrier = function (ix, x, y, s, o = {}) {
    const p = o.p == null ? 1 : o.p, id = o.id || 'ship', sd = o.seed || 700, a = o.a, t = M.clock();
    const by = o.bob ? Math.sin(t * 1.3) * o.bob : 0, P = (u, v) => [x + u * s, y + by + v * s];
    const hull = [[-130, 0], [62, 0], [96, -7], [124, -20], [134, -20], [122, 12], [100, 33], [-112, 40], [-132, 22]].map(([u, v]) => P(u, v));
    BP.poly(ix, hull, { close: true, w: 2.4, p: seg(p, 0, 0.55), seed: sd, fill: 'rgba(238,246,255,0.10)', a });
    BP.poly(ix, [P(100, 33), P(112, 28), P(124, 27), P(118, 20)], { w: 1.6, p: seg(p, 0.3, 0.6), seed: sd + 5, a });                       // bulbous bow
    BP.line(ix, ...P(-128, -2.4), ...P(60, -2.4), { w: 1.2, p: seg(p, 0.35, 0.7), seed: sd + 6, a, col: C.cyan, j: 0 });                       // flight-deck edge
    if (p >= 0.6) {
      for (let u = -110; u <= 90; u += 14) BP.line(ix, ...P(u, 6), ...P(u, 34 - (u > 70 ? (u - 70) * 0.9 : 0)), { w: 0.8, seed: sd + 8, a: 0.35, j: 0 });  // hull plates
      for (let u = -104, i = 0; u <= 70; u += 12, i++) { const lit = M.hash(i, 3) > 0.35 || Math.sin(t * 2 + i) > 0.7; BP.circle(ix, ...P(u, 17), 1.5 * s, { w: 1.2, seed: sd + 9, a: lit ? 0.9 : 0.35 }); }
    }
    BP.poly(ix, [P(-40, 0), P(-40, -30), P(-30, -34), P(2, -34), P(8, -28), P(8, 0)], { close: true, w: 2, p: seg(p, 0.45, 0.8), seed: sd + 1, a, fill: 'rgba(238,246,255,0.08)' });   // island
    if (p >= 0.8) {
      [-34, -26, -18, -10, -2].forEach((u, i) => BP.rect(ix, ...P(u, -29), 5 * s, 3.4 * s, { w: 1, seed: sd + 20 + i, over: false, a: 0.8 }));
      BP.line(ix, ...P(-16, -34), ...P(-16, -52), { w: 1.8, seed: sd + 2, a });
      BP.line(ix, ...P(-24, -46), ...P(-8, -46), { w: 1.4, seed: sd + 3, a });
      const w = Math.abs(Math.cos(t * 2.6)) * 11;                                                                                                 // spinning radar dish
      BP.line(ix, ...P(-16 - w, -55), ...P(-16 + w, -55), { w: 2.6, seed: sd + 4, a, j: 0, col: C.cyan });
      BP.line(ix, ...P(-16, -52), ...P(-16, -55), { w: 1.4, seed: sd + 4, j: 0, a });
      [-112, -100, -88].forEach((u, i) => BP.poly(ix, [P(u - 2.5, 0), P(u, -1.6), P(u + 2.5, 0)], { w: 1.2, seed: sd + 30 + i, col: C.cyan, j: 0, a }));  // arrester wires
      BP.rect(ix, ...P(24, -0.1), 18 * s, 1.4 * s, { w: 1.2, seed: sd + 33, over: false, a, col: C.cyan });                                       // deck lift
    }
    BP.poly(ix, [P(-124, 14), P(100, 14)], { w: 1.1, col: C.cyan, p: seg(p, 0.6, 0.9), seed: sd + 4, j: 0, a: (a == null ? 1 : a) * 0.5, dash: [10, 8] });
    (o.jets || []).forEach((j, i) => V.jetSide(ix, ...P(j.u, -V.GROUND * (o.jetScale || 0.36) - 0.5), s * (o.jetScale || 0.36), Object.assign({ p: seg(p, 0.6, 1), id: id + 'j' + i, seed: sd + 100 + i * 7, a }, j)));
    if (o.wake !== false && BP.now != null && p >= 0.9) {                                                                                         // wake and bow spray
      M.particles(ix, { t, t0: 0, rate: 16, life: 2.2, from: () => P(-132, 36), vx: -38, vy: 0, spread: 8, size: 2.2, grow: 1.5, col: C.cyan, a: 0.55, seed: 4 });
      M.particles(ix, { t, t0: 0, rate: 10, life: 0.8, from: () => P(126, 22), vx: 22, vy: -34, spread: 8, size: 1.6, g: 90, col: C.cyan, a: 0.6, seed: 7 });
      const sp = t * 9;
      BP.line(ix, ...P(-134, 32 + Math.sin(sp) * 3), ...P(-134, 32 - Math.sin(sp) * 3), { w: 2, seed: sd + 50, j: 0, a });                           // propeller blur
    }
    BP.pt(id + ':ramp', ...P(110, -17)); BP.pt(id + ':stern', ...P(-130, 0)); BP.pt(id + ':bow', ...P(134, -20)); BP.pt(id + ':deck', ...P(-50, 0));
    BP.pt(id + ':wires', ...P(-100, 0)); BP.pt(id + ':island', ...P(-16, -52)); BP.pt(id + ':lift', ...P(33, 0)); BP.pt(id + ':hangar', ...P(-40, 24)); BP.pt(id + ':keel', ...P(-20, 40));
    return P;
  };

  // ---------- exploded oblique view of the carrier: decks lift apart, dashed alignment lines join them ----------
  V.slab = (ix, x, y, w, th, o = {}) => {
    const p = o.p == null ? 1 : o.p, k = o.k || 70, h = o.h || 40, sd = o.seed || 1200;
    BP.poly(ix, [[x, y], [x + w, y], [x + w + k, y - h], [x + k, y - h]], { close: true, w: 2, p: seg(p, 0, 0.5), seed: sd, fill: 'rgba(238,246,255,0.12)', col: o.col });
    BP.poly(ix, [[x, y], [x + w, y], [x + w, y + th], [x, y + th]], { close: true, w: 2, p: seg(p, 0.2, 0.7), seed: sd + 1, fill: 'rgba(238,246,255,0.06)', col: o.col });
    BP.poly(ix, [[x + w, y], [x + w + k, y - h], [x + w + k, y - h + th], [x + w, y + th]], { close: true, w: 2, p: seg(p, 0.4, 0.9), seed: sd + 2, col: o.col });
  };
})();
