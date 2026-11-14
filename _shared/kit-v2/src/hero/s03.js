// kit-v2 / Series 3 heroes: the megaproject structures (conceptual, primitives only).
// Same contract as hero/index.js: each builder returns { group, parts, update(t, ctx) }.
// Everything is a pure function of t and the beat start; no state is kept between frames.
(function () {
  const BB = (window.BB = window.BB || {});
  const H = BB.hero;
  const THREE_ = () => window.THREE;
  const clamp = (v, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (u) => 1 - Math.pow(1 - clamp(u), 2.2);
  const beatT0 = (c) => (c && c.beat && c.beat.t0 != null ? c.beat.t0 : 0);

  // a straight arrow from the origin along +y, rotated to `dir` by the caller
  function arrow(len, color, w) {
    const THREE = THREE_();
    const g = new THREE.Group();
    const shaft = H.mesh(new THREE.CylinderGeometry(w * 0.35, w * 0.35, len * 0.72, 10), { color, rim: false, opacity: 0.55, edgeOpacity: 0.9 });
    shaft.position.y = len * 0.36;
    const head = H.mesh(new THREE.ConeGeometry(w, len * 0.28, 12), { color, rim: false, opacity: 0.7, edgeOpacity: 0.95 });
    head.position.y = len * 0.86;
    g.add(shaft); g.add(head);
    return g;
  }
  function aim(group, dx, dy, dz) {
    const THREE = THREE_();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx, dy, dz).normalize());
    group.quaternion.copy(q);
  }
  function seg(a, b, thick, depth, opts) {
    const THREE = THREE_();
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    const m = H.mesh(new THREE.BoxGeometry(len + 1.5, thick, depth), Object.assign({ rim: false, threshold: 40 }, opts || {}));
    m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0);
    m.rotation.z = Math.atan2(dy, dx);
    return m;
  }

  // ---------------------------------------------------------------- arch-gorge (E01)
  // opts.stage: 'gap' (gorge only) | 'halves' (two half-arches grow inward) | 'full'
  // opts.thrust: sideways arrows into the rock; opts.wind: wind arrows; opts.load: down arrows on the deck
  H.archGorge = function (opts = {}) {
    const THREE = THREE_();
    const group = new THREE.Group();
    const parts = {};
    const stage = opts.stage || 'full';
    const col = opts.color || 0x8fe4ff, acc = opts.accent || 0xff9b3d;

    // rock: two walls with sloped inner faces, extruded along z
    const mkWall = (sx) => {
      const s = new THREE.Shape();
      s.moveTo(sx * 470, 230); s.lineTo(sx * 300, 230); s.lineTo(sx * 118, -210); s.lineTo(sx * 470, -210); s.closePath();
      const g = new THREE.ExtrudeGeometry(s, { depth: 150, bevelEnabled: false });
      g.translate(0, 0, -75);
      return H.mesh(g, { color: 0xd9b27c, opacity: 0.14, edgeOpacity: 0.55, rim: false, threshold: 20 });
    };
    const wl = mkWall(-1), wr = mkWall(1);
    group.add(wl); group.add(wr); parts.rockL = wl; parts.rockR = wr;

    // river: a thin slab far below
    const river = H.mesh(new THREE.BoxGeometry(236, 4, 150), { color: 0x6ecbff, opacity: 0.26, edgeOpacity: 0.7, rim: false });
    river.position.set(0, -208, 0);
    group.add(river); parts.river = river;

    // arch curve: parabola through the abutments (+-182, -62) with the crown at y = 150
    const yArch = (x) => 150 - (150 + 62) * Math.pow(x / 182, 2);
    const N = 26;
    const pts = [];
    for (let i = 0; i <= N; i++) { const x = lerp(-182, 182, i / N); pts.push([x, yArch(x)]); }
    const ribs = [];
    const braces = [];
    for (let i = 0; i < N; i++) {
      [-30, 30].forEach((z) => {
        const s = seg(pts[i], pts[i + 1], 11, 9, { color: col, edgeOpacity: 0.95, opacity: 0.22 });
        s.position.z = z;
        s.userData.idx = i;
        group.add(s); ribs.push(s);
      });
      if (i % 3 === 1) {
        const mid = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
        const b = H.mesh(new THREE.BoxGeometry(6, 6, 60), { color: col, rim: false, edgeOpacity: 0.7, opacity: 0.16 });
        b.position.set(mid[0], mid[1], 0);
        b.userData.idx = i;
        group.add(b); braces.push(b);
      }
    }
    parts.ribs = ribs;

    // spandrel columns and the deck
    const cols = [];
    for (let x = -144; x <= 144; x += 36) {
      const top = 226, bot = yArch(x), h = top - bot;
      [-30, 30].forEach((z) => {
        const c = H.mesh(new THREE.BoxGeometry(7, h, 7), { color: col, rim: false, edgeOpacity: 0.8, opacity: 0.16 });
        c.position.set(x, bot + h / 2, z);
        group.add(c); cols.push(c);
      });
    }
    parts.columns = cols;
    const deck = H.mesh(new THREE.BoxGeometry(960, 14, 80), { color: 0xeef6ff, edgeOpacity: 0.95, opacity: 0.2, rim: false, threshold: 40 });
    deck.position.set(0, 233, 0);
    if (stage !== 'gap') { group.add(deck); }
    parts.deck = deck;

    // backstay lines (halves stage): from the growing tips back to anchors in the rock
    let stays = null, stayGeo = null;
    if (stage === 'halves') {
      const arr = new Float32Array(4 * 2 * 3);
      stayGeo = new THREE.BufferGeometry();
      stayGeo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      stays = new THREE.LineSegments(stayGeo, new THREE.LineBasicMaterial({ color: acc, transparent: true, opacity: 0.9 }));
      group.add(stays);
    }

    // thrust arrows: the arch pushes sideways into the abutments
    const thrust = [];
    if (opts.thrust) {
      [[-1, -182], [1, 182]].forEach(([sx, x]) => {
        [-30, 30].forEach((z) => {
          const a = arrow(78, acc, 9);
          aim(a, sx, -0.12, 0);
          a.position.set(x - sx * 8, yArch(x) - 4, z);
          group.add(a); thrust.push(a);
        });
      });
    }
    // load arrows on the deck
    const loads = [];
    if (opts.load) {
      for (let x = -150; x <= 150; x += 75) {
        const a = arrow(70, acc, 8);
        aim(a, 0, -1, 0);
        a.position.set(x, 330, 0);
        group.add(a); loads.push(a);
      }
    }
    // wind arrows crossing the span
    const wind = [];
    if (opts.wind) {
      for (let k = 0; k < 6; k++) {
        const a = arrow(90, 0xeef6ff, 6);
        aim(a, 1, 0, 0);
        group.add(a); wind.push({ a, k });
      }
    }

    return {
      group, parts,
      update(t, c) {
        const u = clamp((t - beatT0(c)) / (opts.growDur || 3.2));
        const g = stage === 'halves' ? ease(u) : 1;
        const shown = stage === 'gap' ? 0 : (stage === 'halves' ? Math.floor(g * (N / 2 + 0.01)) : N);
        ribs.forEach((r) => {
          const i = r.userData.idx;
          r.visible = stage === 'full' || (stage === 'halves' && Math.min(i, N - 1 - i) < shown);
        });
        braces.forEach((r) => {
          const i = r.userData.idx;
          r.visible = stage === 'full' || (stage === 'halves' && Math.min(i, N - 1 - i) < shown);
        });
        cols.forEach((cc) => { cc.visible = stage === 'full' || (stage === 'halves' && g > 0.98); });
        if (stays) {
          const a = stayGeo.attributes.position.array;
          const tipX = shown > 0 ? pts[Math.min(shown, N)][0] : pts[0][0];
          const tipY = shown > 0 ? pts[Math.min(shown, N)][1] : pts[0][1];
          const tipXR = -tipX, tipYR = tipY;
          const set = (n, x1, y1, z1, x2, y2, z2) => { a.set([x1, y1, z1, x2, y2, z2], n * 6); };
          set(0, tipX, tipY, -30, -330, 233, -30); set(1, tipX, tipY, 30, -330, 233, 30);
          set(2, tipXR, tipYR, -30, 330, 233, -30); set(3, tipXR, tipYR, 30, 330, 233, 30);
          stayGeo.attributes.position.needsUpdate = true;
        }
        const pulse = 0.5 + 0.5 * Math.sin(t * 3.2);
        thrust.forEach((a) => { a.traverse((o) => { if (o.material && o.material.opacity != null && o.userData.base == null) o.userData.base = o.material.opacity; if (o.material && o.userData.base != null) o.material.opacity = Math.min(1, o.userData.base * (0.7 + 0.5 * pulse)); }); });
        loads.forEach((a, i) => { a.position.y = 330 - 22 * ((t * 1.2 + i * 0.25) % 1); });
        wind.forEach(({ a, k }) => {
          const v = ((t * 0.35 + k / 6) % 1);
          a.position.set(lerp(-480, 380, v), 280 + 30 * (k % 3), -70 + 30 * (k % 5));
        });
        if (opts.sway) { group.rotation.z = 0.012 * Math.sin(t * 2.4); }
      },
    };
  };

  // ---------------------------------------------------------------- pass-profile (E02)
  // A mountain with a pass, a road over it and a tunnel beneath.
  // opts.snow: snow settles over the pass; opts.dig: the tunnel advances 0..1 over growDur;
  // opts.layers: soft and hard rock layers with one hard nugget; opts.noTunnel: omit the tunnel.
  H.passProfile = function (opts = {}) {
    const THREE = THREE_();
    const group = new THREE.Group();
    const parts = {};
    const acc = opts.accent || 0xff9b3d;
    const P = [[-620, -210], [-620, 0], [-450, 150], [-290, 350], [-140, 300], [0, 262], [140, 300], [290, 380], [450, 150], [620, 0], [620, -210]];
    const s = new THREE.Shape();
    s.moveTo(P[0][0], P[0][1]);
    P.slice(1).forEach((p) => s.lineTo(p[0], p[1]));
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 130, bevelEnabled: false });
    g.translate(0, 0, -65);
    const mtn = H.mesh(g, { color: 0xd9b27c, opacity: 0.12, edgeOpacity: 0.6, rim: false, threshold: 18 });
    group.add(mtn); parts.mountain = mtn;

    // the road over the pass, drawn on the front face
    const roadPts = P.slice(1, 10).map((p) => new THREE.Vector3(p[0], p[1] + 6, 68));
    const rg = new THREE.BufferGeometry().setFromPoints(roadPts);
    const road = new THREE.Line(rg, new THREE.LineBasicMaterial({ color: 0xeef6ff, transparent: true, opacity: 0.95 }));
    group.add(road); parts.road = road;

    // snow over the pass
    let snow = null;
    if (opts.snow) {
      const top = [[-290, 350], [-140, 300], [0, 262], [140, 300], [290, 380]];
      const sh = new THREE.Shape();
      sh.moveTo(top[0][0], top[0][1]);
      top.slice(1).forEach((p) => sh.lineTo(p[0], p[1]));
      top.slice().reverse().forEach((p) => sh.lineTo(p[0], p[1] - 46));
      sh.closePath();
      const sg = new THREE.ExtrudeGeometry(sh, { depth: 138, bevelEnabled: false });
      sg.translate(0, 0, -69);
      snow = H.mesh(sg, { color: 0xffffff, opacity: 0.34, edgeOpacity: 0.9, rim: false, threshold: 18 });
      group.add(snow); parts.snow = snow;
    }

    // rock layers and a hard nugget
    if (opts.layers) {
      [[-170, -120, 0xffd28a], [-120, -50, 0x8fe4ff], [-50, 10, 0xd9b27c]].forEach((l) => {
        const b = H.mesh(new THREE.BoxGeometry(1100, l[1] - l[0], 120), { color: l[2], opacity: 0.2, edgeOpacity: 0.5, rim: false });
        b.position.set(0, (l[0] + l[1]) / 2, 0);
        group.add(b);
      });
      const nut = H.mesh(new THREE.SphereGeometry(30, 18, 12), { color: acc, opacity: 0.45, edgeOpacity: 0.95, rim: false });
      nut.position.set(150, -80, 0);
      group.add(nut); parts.nugget = nut;
    }

    // the tunnel
    let tunnel = null;
    if (!opts.noTunnel) {
      tunnel = H.mesh(new THREE.CylinderGeometry(24, 24, 1240, 24), { color: 0x9ff0ff, opacity: 0.4, edgeOpacity: 1, rim: false, threshold: 30 });
      tunnel.rotation.z = Math.PI / 2;
      tunnel.position.set(0, -70, 0);
      group.add(tunnel); parts.tunnel = tunnel;
    }
    return {
      group, parts,
      update(t, c) {
        const u = clamp((t - beatT0(c)) / (opts.growDur || 3.5));
        if (tunnel) {
          const k = opts.dig ? Math.max(0.03, ease(u)) : 1;
          tunnel.scale.y = k;
          tunnel.position.x = -620 + 620 * k;
        }
        if (snow) { snow.userData.parts.mesh.material.opacity = 0.34 * ease(u * 1.4); }
        road.material.opacity = opts.snow ? 0.95 - 0.55 * ease(u) : 0.95;
      },
    };
  };

  // ---------------------------------------------------------------- tunnel-section (E02)
  // A cross-section of a road tunnel, extruded along z, with fans, signs and service points.
  // opts.air: air arrows run along the tunnel; opts.services: wall service points; opts.signs: exit signs.
  H.tunnelSection = function (opts = {}) {
    const THREE = THREE_();
    const group = new THREE.Group();
    const parts = {};
    const acc = opts.accent || 0xff9b3d;
    const outer = new THREE.Shape();
    outer.moveTo(-100, -80); outer.lineTo(100, -80); outer.lineTo(100, 40); outer.absarc(0, 40, 100, 0, Math.PI, false); outer.lineTo(-100, -80);
    const hole = new THREE.Path();
    hole.moveTo(-84, -80); hole.lineTo(84, -80); hole.lineTo(84, 40); hole.absarc(0, 40, 84, 0, Math.PI, false); hole.lineTo(-84, -80);
    outer.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(outer, { depth: 320, bevelEnabled: false, curveSegments: 24 });
    g.translate(0, 0, -160);
    const lining = H.mesh(g, { color: 0xd9b27c, opacity: 0.16, edgeOpacity: 0.85, rim: false, threshold: 20 });
    group.add(lining); parts.lining = lining;
    const road = H.mesh(new THREE.BoxGeometry(168, 8, 320), { color: 0xeef6ff, opacity: 0.22, edgeOpacity: 0.9, rim: false });
    road.position.set(0, -76, 0);
    group.add(road); parts.road = road;
    // lane line
    const lane = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -71, -160), new THREE.Vector3(0, -71, 160)]), new THREE.LineDashedMaterial({ color: 0xeef6ff, dashSize: 14, gapSize: 12, transparent: true, opacity: 0.8 }));
    lane.computeLineDistances();
    group.add(lane);
    // fans in the crown
    [-110, 0, 110].forEach((z) => {
      const f = H.mesh(new THREE.CylinderGeometry(15, 15, 46, 20), { color: 0x8fe4ff, opacity: 0.3, edgeOpacity: 0.95, rim: false });
      f.rotation.x = Math.PI / 2;
      f.position.set(0, 112, z);
      group.add(f);
    });
    // exit signs along the left wall
    if (opts.signs) {
      for (let z = -128; z <= 128; z += 64) {
        const sgn = H.mesh(new THREE.BoxGeometry(5, 16, 22), { color: acc, opacity: 0.55, edgeOpacity: 1, rim: false });
        sgn.position.set(-80, -20, z);
        group.add(sgn);
      }
    }
    // service points along the right wall
    if (opts.services) {
      [[-130, 0x8fe4ff], [-30, acc], [70, 0xeef6ff], [150, 0x8fe4ff]].forEach(([z, col]) => {
        const b = H.mesh(new THREE.BoxGeometry(6, 18, 18), { color: col, opacity: 0.5, edgeOpacity: 1, rim: false });
        b.position.set(80, -10, z);
        group.add(b);
      });
    }
    // air arrows
    const air = [];
    if (opts.air) {
      for (let k = 0; k < 5; k++) {
        const a = arrow(70, 0xeef6ff, 5);
        aim(a, 0, 0, 1);
        a.position.set(k % 2 ? 40 : -40, 80, 0);
        group.add(a); air.push({ a, k });
      }
    }
    return {
      group, parts,
      update(t) {
        air.forEach(({ a, k }) => { a.position.z = -150 + ((t * 0.4 + k / 5) % 1) * 230; });
      },
    };
  };

  // a travelling brightness wave over every part of a hero (the hologram breathes): continuous motion without moving geometry
  H.breathe = function (group, t) {
    group.children.forEach((o) => {
      const p = o.userData && o.userData.parts;
      if (!p || !p.mesh || !p.mesh.material) return;
      const m = p.mesh.material, e = p.edges && p.edges.material;
      if (m.userData.base == null) m.userData.base = m.opacity;
      if (e && e.userData.base == null) e.userData.base = e.opacity;
      const ph = Math.sin(t * 5.4 - (o.position.x * 0.016 + o.position.y * 0.01));
      m.opacity = Math.max(0.03, m.userData.base * (1 + 1.1 * ph));
      if (e) e.opacity = Math.min(1, e.userData.base * (0.7 + 0.3 * ph));
    });
  };

  H.builders = Object.assign(H.builders || {}, { 'arch-gorge': H.archGorge, 'pass-profile': H.passProfile, 'tunnel-section': H.tunnelSection });
  // ---------------------------------------------------------------- sea-bridge (E03)
  // Side view: seabed, water, piers on piles, a deck. opts.piles highlights the piles, opts.ribs shows deck ribs,
  // opts.salt tints the splash zone, opts.growDur controls the pile drive.
  H.seaBridge = function (opts = {}) {
    const THREE = THREE_();
    const group = new THREE.Group(); const parts = {};
    const acc = opts.accent || 0xff9b3d, col = opts.color || 0x8fe4ff;
    const bed = H.mesh(new THREE.BoxGeometry(1200, 150, 140), { color: 0xd9b27c, opacity: 0.14, edgeOpacity: 0.55, rim: false });
    bed.position.set(0, -235, 0); group.add(bed); parts.bed = bed;
    const water = H.mesh(new THREE.BoxGeometry(1200, 80, 140), { color: 0x6ecbff, opacity: 0.12, edgeOpacity: 0.4, rim: false });
    water.position.set(0, -120, 0); group.add(water); parts.water = water;
    const xs = [-440, -220, 0, 220, 440];
    const piles = [];
    xs.forEach((x) => {
      const pier = H.mesh(new THREE.CylinderGeometry(20, 24, 190, 20), { color: col, opacity: 0.22, edgeOpacity: 0.95, rim: false });
      pier.position.set(x, -35, 0); group.add(pier);
      [-30, 30].forEach((z) => {
        const pl = H.mesh(new THREE.CylinderGeometry(9, 9, 130, 12), { color: opts.piles ? acc : col, opacity: opts.piles ? 0.5 : 0.18, edgeOpacity: opts.piles ? 1 : 0.7, rim: false });
        pl.position.set(x, -250, z); pl.userData.x = x; group.add(pl); piles.push(pl);
      });
    });
    const deck = H.mesh(new THREE.BoxGeometry(1200, 16, 90), { color: 0xeef6ff, opacity: 0.2, edgeOpacity: 0.95, rim: false, threshold: 40 });
    deck.position.set(0, 68, 0); group.add(deck); parts.deck = deck;
    const ribs = [];
    if (opts.ribs) {
      for (let x = -540; x <= 540; x += 36) {
        const r = H.mesh(new THREE.BoxGeometry(6, 30, 84), { color: acc, opacity: 0.4, edgeOpacity: 1, rim: false });
        r.position.set(x, 46, 0); group.add(r); ribs.push(r);
      }
    }
    return { group, parts, update(t, c) {
      const u = clamp((t - beatT0(c)) / (opts.growDur || 3));
      piles.forEach((p, i) => { const k = opts.piles ? Math.max(0.05, ease(u)) : 1; p.scale.y = k; p.position.y = -185 - 65 * k; });
      ribs.forEach((r, i) => { r.visible = i / ribs.length < ease(u * 1.2); });
    } };
  };

  // ---------------------------------------------------------------- deck-plate (E03)
  // A steel plate: flat (it bends) or with ribs beneath (it is stiff).
  H.deckPlate = function (opts = {}) {
    const THREE = THREE_();
    const group = new THREE.Group(); const parts = {};
    const acc = opts.accent || 0xff9b3d;
    const plate = H.mesh(new THREE.BoxGeometry(620, 12, 260), { color: 0xeef6ff, opacity: 0.22, edgeOpacity: 1, rim: false });
    group.add(plate); parts.plate = plate;
    const ribs = [];
    for (let x = -270; x <= 270; x += 60) {
      const r = H.mesh(new THREE.BoxGeometry(10, 46, 250), { color: acc, opacity: 0.35, edgeOpacity: 1, rim: false });
      r.position.set(x, -28, 0); group.add(r); ribs.push(r);
    }
    for (let z = -90; z <= 90; z += 90) {
      const r = H.mesh(new THREE.BoxGeometry(600, 10, 10), { color: acc, opacity: 0.35, edgeOpacity: 1, rim: false });
      r.position.set(0, -50, z); group.add(r); ribs.push(r);
    }
    return { group, parts, update(t, c) {
      const u = clamp((t - beatT0(c)) / (opts.growDur || 2.5));
      const showRibs = opts.ribs ? ease(u) : 0;
      ribs.forEach((r, i) => { r.visible = opts.ribs && (i / ribs.length) < showRibs + 0.01; });
      plate.rotation.z = opts.ribs ? 0 : 0.07 * Math.sin(t * 2.2);
      plate.rotation.x = opts.ribs ? 0 : 0.05 * Math.sin(t * 1.7 + 1);
    } };
  };

  // ---------------------------------------------------------------- lift-span (E04)
  // Towers with counterweights, a lifting span, fixed spans, water and a ship. opts.lift: animate the lift (0..1 over growDur).
  H.liftSpan = function (opts = {}) {
    const THREE = THREE_();
    const group = new THREE.Group(); const parts = {};
    const col = opts.color || 0x8fe4ff, acc = opts.accent || 0xff9b3d;
    const water = H.mesh(new THREE.BoxGeometry(1300, 6, 160), { color: 0x6ecbff, opacity: 0.2, edgeOpacity: 0.6, rim: false });
    water.position.set(0, -70, 0); group.add(water);
    [-1, 1].forEach((sx) => {
      const fixed = H.mesh(new THREE.BoxGeometry(520, 14, 56), { color: 0xeef6ff, opacity: 0.2, edgeOpacity: 0.95, rim: false });
      fixed.position.set(sx * 430, 20, 0); group.add(fixed);
      [-1, 1].forEach((z) => {
        const tw = H.mesh(new THREE.BoxGeometry(34, 330, 30), { color: col, opacity: 0.2, edgeOpacity: 0.95, rim: false });
        tw.position.set(sx * 178, 90, z * 34); group.add(tw);
      });
      for (let k = 0; k < 3; k++) {
        const pr = H.mesh(new THREE.CylinderGeometry(14, 16, 90, 14), { color: col, opacity: 0.16, edgeOpacity: 0.7, rim: false });
        pr.position.set(sx * (330 + k * 150), -30, 0); group.add(pr);
      }
    });
    const span = H.mesh(new THREE.BoxGeometry(322, 14, 56), { color: acc, opacity: 0.32, edgeOpacity: 1, rim: false });
    group.add(span); parts.span = span;
    const cw = [-1, 1].map((sx) => { const m = H.mesh(new THREE.BoxGeometry(22, 70, 22), { color: 0xeef6ff, opacity: 0.35, edgeOpacity: 1, rim: false }); m.position.set(sx * 178, 100, 0); group.add(m); return m; });
    const cableGeo = new THREE.BufferGeometry(); cableGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(4 * 2 * 6), 3));
    const cables = new THREE.LineSegments(cableGeo, new THREE.LineBasicMaterial({ color: 0xeef6ff, transparent: true, opacity: 0.9 })); group.add(cables);
    const ship = H.mesh(new THREE.BoxGeometry(150, 34, 46), { color: 0xeef6ff, opacity: 0.22, edgeOpacity: 0.95, rim: false });
    const mast = H.mesh(new THREE.BoxGeometry(10, 110, 10), { color: 0xeef6ff, opacity: 0.22, edgeOpacity: 0.95, rim: false });
    ship.add(mast); mast.position.set(20, 70, 0);
    if (opts.ship) { group.add(ship); }
    return { group, parts, update(t, c) {
      const u = clamp((t - beatT0(c)) / (opts.growDur || 4));
      const lift = opts.lift ? (u < 0.5 ? ease(u * 2) : 1 - ease((u - 0.5) * 2) * (opts.hold ? 0 : 1)) : 0;
      const yS = 20 + 210 * lift;
      span.position.set(0, yS, 0);
      cw.forEach((m, i) => { m.position.y = 230 - 150 * lift; });
      const a = cableGeo.attributes.position.array; let n = 0;
      [-1, 1].forEach((sx) => { [-1, 1].forEach((z) => {
        a.set([sx * 160, yS + 7, z * 24, sx * 178, 262, z * 24], n); n += 6;
        a.set([sx * 178, 262, z * 24, sx * 178, 230 - 150 * lift + 35, z * 24], n); n += 6;
      }); });
      cableGeo.attributes.position.needsUpdate = true;
      if (opts.ship) { ship.position.set(lerp(-520, 520, (t * 0.12) % 1), -45 + 10, 0); }
    } };
  };

  // ---------------------------------------------------------------- port-hub (E05)
  // opts.mode: 'hub' (one big ship, many small), 'quay' (deep water, a loaded giant ship), 'shallow' (a shallow bay).
  H.portHub = function (opts = {}) {
    const THREE = THREE_();
    const group = new THREE.Group(); const parts = {};
    const mode = opts.mode || 'hub';
    const col = opts.color || 0x8fe4ff, acc = opts.accent || 0xff9b3d;
    const mkShip = (len, hull, color, loaded) => {
      const g = new THREE.Group();
      const h = H.mesh(new THREE.BoxGeometry(len, hull, len * 0.24), { color, opacity: 0.25, edgeOpacity: 0.95, rim: false });
      g.add(h);
      if (loaded) {
        for (let i = 0; i < 7; i++) for (let j = 0; j < 2; j++) {
          const b = H.mesh(new THREE.BoxGeometry(len * 0.1, hull * 0.5, len * 0.09), { color: acc, opacity: 0.4, edgeOpacity: 1, rim: false });
          b.position.set(-len * 0.36 + i * len * 0.12, hull * 0.75 + j * hull * 0.5, 0); g.add(b);
        }
      }
      return g;
    };
    if (mode === 'hub') {
      const sea = H.mesh(new THREE.BoxGeometry(1100, 6, 700), { color: 0x6ecbff, opacity: 0.1, edgeOpacity: 0.35, rim: false });
      sea.position.y = -30; group.add(sea);
      const big = mkShip(300, 40, 0xeef6ff, true); big.position.set(0, 0, 0); group.add(big); parts.big = big;
      const smalls = [];
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2, s = mkShip(110, 18, col, false);
        s.position.set(Math.cos(a) * 380, -6, Math.sin(a) * 250); s.rotation.y = -a + Math.PI / 2; group.add(s); smalls.push({ s, a });
      }
      const boxes = [];
      for (let k = 0; k < 6; k++) { const b = H.mesh(new THREE.BoxGeometry(22, 14, 14), { color: acc, opacity: 0.6, edgeOpacity: 1, rim: false }); group.add(b); boxes.push(b); }
      return { group, parts, update(t) {
        boxes.forEach((b, i) => { const u = ((t * 0.3 + i / 6) % 1); const a = smalls[i].a; b.position.set(lerp(0, Math.cos(a) * 380, u), 30 + 70 * Math.sin(u * Math.PI), lerp(0, Math.sin(a) * 250, u)); });
      } };
    }
    // quay and shallow: a side-view cross-section
    const deepY = mode === 'quay' ? -250 : -110;
    const bed = H.mesh(new THREE.BoxGeometry(1100, 40, 160), { color: 0xd9b27c, opacity: 0.16, edgeOpacity: 0.55, rim: false });
    bed.position.set(60, deepY - 20, 0); group.add(bed);
    const water = H.mesh(new THREE.BoxGeometry(900, Math.abs(deepY) + 20, 160), { color: 0x6ecbff, opacity: 0.1, edgeOpacity: 0.4, rim: false });
    water.position.set(110, deepY / 2 + 10, 0); group.add(water);
    const quay = H.mesh(new THREE.BoxGeometry(260, 80, 160), { color: 0xd9b27c, opacity: 0.2, edgeOpacity: 0.8, rim: false });
    quay.position.set(-440, 0, 0); group.add(quay);
    [[-470, 1], [-410, 1]].forEach(([x]) => { const cr = H.mesh(new THREE.BoxGeometry(10, 200, 10), { color: col, opacity: 0.3, edgeOpacity: 1, rim: false }); cr.position.set(x, 140, 0); group.add(cr); });
    const boom = H.mesh(new THREE.BoxGeometry(260, 10, 10), { color: col, opacity: 0.3, edgeOpacity: 1, rim: false }); boom.position.set(-360, 240, 0); group.add(boom);
    const hullH = mode === 'quay' ? 150 : 150;
    const ship = mkShip(520, hullH, 0xeef6ff, true); ship.position.set(10, -hullH / 2 + 40, 0); group.add(ship);
    const keel = H.mesh(new THREE.BoxGeometry(520, 4, 40), { color: acc, opacity: 0.6, edgeOpacity: 1, rim: false }); keel.position.set(10, -hullH + 38, 0); group.add(keel);
    return { group, parts, update(t) { ship.position.y = -hullH / 2 + 40 + 3 * Math.sin(t * 1.4); } };
  };

  // ---------------------------------------------------------------- rail-corridor (E06)
  // Tracks, sleepers, a gantry with a wire, and a wagon carrying one or two layers of boxes.
  // opts.layers 1|2, opts.second (a second, passenger track), opts.axle (an axle-load arrow).
  H.railCorridor = function (opts = {}) {
    const THREE = THREE_();
    const group = new THREE.Group(); const parts = {};
    const col = opts.color || 0x8fe4ff, acc = opts.accent || 0xff9b3d;
    const tracks = opts.second ? [-70, 70] : [0];
    tracks.forEach((z, ti) => {
      [-14, 14].forEach((dz) => { const r = H.mesh(new THREE.BoxGeometry(1200, 6, 5), { color: 0xeef6ff, opacity: 0.3, edgeOpacity: 1, rim: false }); r.position.set(0, 0, z + dz); group.add(r); });
      for (let x = -560; x <= 560; x += 40) { const s = H.mesh(new THREE.BoxGeometry(8, 4, 50), { color: 0xd9b27c, opacity: 0.2, edgeOpacity: 0.6, rim: false }); s.position.set(x, -5, z); group.add(s); }
    });
    for (let x = -400; x <= 400; x += 400) {
      [-1, 1].forEach((sx) => { const p = H.mesh(new THREE.BoxGeometry(8, 190, 8), { color: col, opacity: 0.2, edgeOpacity: 0.9, rim: false }); p.position.set(x, 90, sx * (opts.second ? 130 : 60)); group.add(p); });
      const bm = H.mesh(new THREE.BoxGeometry(8, 8, opts.second ? 270 : 130), { color: col, opacity: 0.2, edgeOpacity: 0.9, rim: false }); bm.position.set(x, 185, 0); group.add(bm);
    }
    const wire = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-600, 160, tracks[0]), new THREE.Vector3(600, 160, tracks[0])]), new THREE.LineBasicMaterial({ color: acc, transparent: true, opacity: 0.9 }));
    group.add(wire);
    const wagon = new THREE.Group();
    const bed = H.mesh(new THREE.BoxGeometry(300, 12, 46), { color: 0xeef6ff, opacity: 0.25, edgeOpacity: 1, rim: false }); bed.position.y = 14; wagon.add(bed);
    const L = opts.layers || 1;
    for (let l = 0; l < L; l++) for (let i = 0; i < 3; i++) {
      const b = H.mesh(new THREE.BoxGeometry(88, 40, 40), { color: l ? acc : col, opacity: 0.32, edgeOpacity: 1, rim: false }); b.position.set(-100 + i * 100, 40 + l * 42, 0); wagon.add(b);
    }
    wagon.position.z = tracks[0]; group.add(wagon); parts.wagon = wagon;
    let ax = null;
    if (opts.axle) { ax = arrow(90, acc, 10); aim(ax, 0, -1, 0); ax.position.set(-110, 150, tracks[0]); group.add(ax); }
    let fast = null;
    if (opts.second) { fast = H.mesh(new THREE.BoxGeometry(220, 34, 40), { color: 0x8fe4ff, opacity: 0.3, edgeOpacity: 1, rim: false }); fast.position.set(0, 26, 70); group.add(fast); }
    return { group, parts, update(t) {
      wagon.position.x = lerp(-300, 300, (t * 0.12) % 1);
      if (ax) { ax.position.x = wagon.position.x - 110; ax.position.y = 118 + 10 * Math.sin(t * 3); }
      if (fast) fast.position.x = lerp(-450, 450, (t * 0.25) % 1);
    } };
  };

  H.builders = Object.assign(H.builders || {}, { 'sea-bridge': H.seaBridge, 'deck-plate': H.deckPlate, 'lift-span': H.liftSpan, 'port-hub': H.portHub, 'rail-corridor': H.railCorridor });
})();
