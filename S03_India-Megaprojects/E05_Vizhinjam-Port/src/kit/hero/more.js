// kit-v2: the heroes for E02 to E06. Same blueprint-hologram language as the E01 set:
// primitives only, edges plus a translucent fill, no textures and no realistic lighting.
(function () {
  const BB = (window.BB = window.BB || {});
  const H = BB.hero;
  const T3 = () => window.THREE;
  const geoCache = new Map();
  function cached(key, make) {
    if (!geoCache.has(key)) geoCache.set(key, make());
    return geoCache.get(key);
  }

  // ---------- E02: the PARAM machine ----------
  // rack-node-mesh: a board of processor nodes, then a rack, then an interconnect mesh.
  H.rackNodeMesh = function (opts = {}) {
    const THREE = T3();
    const group = new THREE.Group();
    const parts = {};
    const board = H.mesh(H.box('pBoard', 420, 26, 300), { color: opts.color || 0x8fe4ff });
    group.add(board); parts.board = board;

    const nodes = new THREE.Group();
    const nodeGeo = cached('pNode', () => new THREE.BoxGeometry(46, 18, 46));
    const n = opts.nodes || 12;
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / 4), c = i % 4;
      const m = H.mesh(nodeGeo, { color: opts.accent || 0xff9b3d, edgeOpacity: 0.8, rim: false });
      m.position.set(-150 + c * 100, 22, -100 + r * 70);
      nodes.add(m);
    }
    group.add(nodes); parts.nodes = nodes;

    // the interconnect: lines between the nodes
    const links = new THREE.Group();
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / 4), c = i % 4;
      const a = new THREE.Vector3(-150 + c * 100, 34, -100 + r * 70);
      const j = (i + 1) % n;
      const r2 = Math.floor(j / 4), c2 = j % 4;
      const b = new THREE.Vector3(-150 + c2 * 100, 34, -100 + r2 * 70);
      const g = new THREE.BufferGeometry().setFromPoints([a, b]);
      links.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: opts.accent || 0xff9b3d, transparent: true, opacity: 0.75 })));
    }
    group.add(links); parts.links = links;

    return {
      group, parts,
      update(t, c) {
        const p = c ? c.p : 1;
        links.children.forEach((l, i) => { l.material.opacity = 0.25 + 0.6 * Math.max(0, Math.min(1, p * n - i)); });
        if (opts.slowLink != null) {
          // one link stays dim: the slow connection
          const l = links.children[opts.slowLink % links.children.length];
          if (l) l.material.opacity = 0.18;
        }
      },
    };
  };

  // ---------- E03: the navigation set ----------
  // earth-wire: a stylised wireframe globe with a soft region glow (never a border).
  H.earthWire = function (opts = {}) {
    const THREE = T3();
    const group = new THREE.Group();
    const parts = {};
    const R = opts.r || 320;
    const globe = new THREE.Group();
    const shell = H.mesh(H.sphere('earthShell', R), { color: opts.color || 0x8fe4ff, opacity: 0.10, rim: false, edge: false, threshold: 40 });
    globe.add(shell);
    // latitude rings
    for (let i = 1; i < 6; i++) {
      const lat = -Math.PI / 2 + (Math.PI * i) / 6;
      const rr = R * Math.cos(lat);
      const g = cached('earthLat' + i, () => new THREE.TorusGeometry(1, 0.006, 8, 96));
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: opts.color || 0x8fe4ff, transparent: true, opacity: 0.55 }));
      m.scale.set(rr, rr, rr * 0.02);
      m.rotation.x = Math.PI / 2;
      m.position.y = R * Math.sin(lat);
      globe.add(m);
    }
    // longitude rings
    for (let i = 0; i < 6; i++) {
      const g = cached('earthLon' + i, () => new THREE.TorusGeometry(1, 0.006, 8, 96));
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: opts.color || 0x8fe4ff, transparent: true, opacity: 0.45 }));
      m.scale.set(R, R, R);
      m.rotation.y = (i / 6) * Math.PI;
      globe.add(m);
    }
    // the region glow: a soft patch, not an outline
    const patch = new THREE.Mesh(new THREE.SphereGeometry(R * 0.34, 32, 24, 0, Math.PI * 1.1, 0.5, 1.2),
      new THREE.MeshBasicMaterial({ color: opts.accent || 0xffcf5c, transparent: true, opacity: 0.30 }));
    patch.position.set(-R * 0.30, R * 0.42, R * 0.62);
    globe.add(patch);
    parts.patch = patch;
    group.add(globe); parts.globe = globe;
    return {
      group, parts,
      update(t, c) {
        globe.rotation.y = t * 0.06;
        patch.material.opacity = 0.22 + 0.10 * Math.sin(t * 1.2);
      },
    };
  };

  // sat-constellation: schematic satellites on their orbits.
  H.satConstellation = function (opts = {}) {
    const THREE = T3();
    const group = new THREE.Group();
    const parts = {};
    const R = opts.r || 480;
    const sats = new THREE.Group();
    const count = opts.count || 3;
    const bodyGeo = cached('satBody', () => new THREE.BoxGeometry(46, 34, 34));
    const panelGeo = cached('satPanel', () => new THREE.BoxGeometry(96, 4, 40));
    for (let i = 0; i < count; i++) {
      const sat = new THREE.Group();
      const b = H.mesh(bodyGeo, { color: opts.color || 0x8fe4ff });
      sat.add(b);
      const p1 = H.mesh(panelGeo, { color: opts.accent || 0xffcf5c, edgeOpacity: 0.8, rim: false });
      p1.position.x = -76; sat.add(p1);
      const p2 = H.mesh(panelGeo, { color: opts.accent || 0xffcf5c, edgeOpacity: 0.8, rim: false });
      p2.position.x = 76; sat.add(p2);
      const a = (i / count) * Math.PI * 2;
      sat.position.set(Math.cos(a) * R, 60 + i * 40, Math.sin(a) * R);
      sats.add(sat);
    }
    group.add(sats); parts.sats = sats;
    return {
      group, parts,
      update(t) {
        sats.children.forEach((sat, i) => {
          const a = (i / count) * Math.PI * 2 + t * 0.12;
          sat.position.set(Math.cos(a) * R, 60 + i * 40, Math.sin(a) * R);
          sat.rotation.y = -a;
        });
      },
    };
  };

  // range-spheres: the distance shells around the satellites.
  H.rangeSpheres = function (opts = {}) {
    const THREE = T3();
    const group = new THREE.Group();
    const parts = {};
    const shells = new THREE.Group();
    const R = opts.r || 300;
    for (let i = 0; i < (opts.count || 3); i++) {
      const m = new THREE.Mesh(H.sphere('rangeShell', R),
        new THREE.MeshBasicMaterial({ color: opts.color || 0x8fe4ff, transparent: true, opacity: 0.08, wireframe: true }));
      const a = (i / (opts.count || 3)) * Math.PI * 2;
      m.position.set(Math.cos(a) * 420, 60 + i * 40, Math.sin(a) * 420);
      shells.add(m);
    }
    group.add(shells); parts.shells = shells;
    return {
      group, parts,
      update(t, c) {
        const p = c ? c.p : 1;
        shells.children.forEach((m, i) => { m.material.opacity = 0.05 + 0.07 * Math.max(0, Math.min(1, p * 3 - i)); });
      },
    };
  };

  // phone-dot: the small receiver with its position dot.
  H.phoneDot = function (opts = {}) {
    const THREE = T3();
    const group = new THREE.Group();
    const parts = {};
    const body = H.mesh(H.box('phoneBody', 60, 110, 10), { color: opts.color || 0x8fe4ff });
    group.add(body); parts.body = body;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(9, 16, 12),
      new THREE.MeshBasicMaterial({ color: opts.accent || 0xffcf5c }));
    dot.position.set(0, 18, 9);
    group.add(dot); parts.dot = dot;
    return {
      group, parts,
      update(t) {
        const pulse = 0.6 + 0.4 * Math.sin(t * 3);
        dot.scale.setScalar(0.8 + 0.4 * pulse);
      },
    };
  };

  // ---------- E04: the staged programme ----------
  // staged-platform: three steps, the third faint.
  H.stagedPlatform = function (opts = {}) {
    const THREE = T3();
    const group = new THREE.Group();
    const parts = {};
    const steps = new THREE.Group();
    const colors = [opts.color || 0x8fe4ff, opts.accent || 0xff9b3d, opts.color || 0x8fe4ff];
    for (let i = 0; i < 3; i++) {
      const w = 620 - i * 60;
      const m = H.mesh(H.box('step' + i, w, 70, 300), { color: colors[i], edgeOpacity: 0.9, rim: false });
      m.position.set(0, -180 + i * 80, -i * 90);
      if (i === 2) m.userData.parts.mesh.material.opacity = 0.08;
      steps.add(m);
      parts['step' + i] = m;
    }
    group.add(steps); parts.steps = steps;
    return {
      group, parts,
      update(t, c) {
        const p = c ? c.p : 1;
        parts.step0.userData.parts.mesh.material.opacity = 0.10 + 0.14 * Math.min(1, p * 3);
        parts.step1.userData.parts.mesh.material.opacity = 0.10 + 0.20 * Math.max(0, Math.min(1, p * 3 - 1));
        parts.step2.userData.parts.mesh.material.opacity = 0.04 + 0.08 * Math.max(0, Math.min(1, p * 3 - 2));
      },
    };
  };

  // loop-heat-to-power: heat, steam, turbine, generator. No core detail.
  H.heatToPower = function (opts = {}) {
    const THREE = T3();
    const group = new THREE.Group();
    const parts = {};
    const heat = H.mesh(H.lathe('heatCore', [[0, 90], [40, 90], [52, 40], [52, -40], [40, -90], [0, -90]], 40), { color: opts.accent || 0xff9b3d, edgeOpacity: 0.9 });
    heat.position.set(-260, 0, 0);
    group.add(heat); parts.heat = heat;

    const pipe = H.mesh(H.cylinder('heatPipe', 14, 14, 150, 16), { color: opts.color || 0x8fe4ff, rim: false });
    pipe.rotation.z = Math.PI / 2; pipe.position.set(-120, 60, 0);
    group.add(pipe); parts.pipe = pipe;

    const turbine = H.mesh(H.lathe('turbine', [[0, 60], [26, 60], [34, 20], [46, -20], [54, -60], [44, -60], [36, -20], [26, 20], [0, 20]], 36), { color: opts.color || 0x8fe4ff });
    turbine.position.set(40, 60, 0); turbine.rotation.z = -Math.PI / 2;
    group.add(turbine); parts.turbine = turbine;

    const gen = H.mesh(H.cylinder('generator', 54, 54, 130, 32), { color: opts.color || 0x8fe4ff });
    gen.rotation.z = Math.PI / 2; gen.position.set(230, 60, 0);
    group.add(gen); parts.gen = gen;

    return {
      group, parts,
      update(t, c) {
        turbine.rotation.x = t * 2.2;
        gen.rotation.x = t * 2.2;
        heat.userData.parts.mesh.material.opacity = 0.16 + 0.10 * Math.sin(t * 1.6);
      },
    };
  };

  // ---------- E05: the chip world ----------
  // wafer-die: a disc with a die grid.
  H.waferDie = function (opts = {}) {
    const THREE = T3();
    const group = new THREE.Group();
    const parts = {};
    const R = opts.r || 300;
    const wafer = H.mesh(H.cylinder('wafer', R, R, 22, 64), { color: opts.color || 0x8fe4ff, edgeOpacity: 0.9 });
    group.add(wafer); parts.wafer = wafer;
    const grid = new THREE.Group();
    for (let i = -3; i <= 3; i++) {
      for (let j = -3; j <= 3; j++) {
        if (Math.abs(i) + Math.abs(j) > 5) continue;
        const m = H.mesh(H.box('die', 58, 6, 58), { color: opts.accent || 0xc39bff, edgeOpacity: 0.7, rim: false });
        m.position.set(i * 78, 14, j * 78);
        grid.add(m);
      }
    }
    group.add(grid); parts.grid = grid;
    return {
      group, parts,
      update(t, c) {
        const p = c ? c.p : 1;
        grid.children.forEach((m, i) => { m.visible = p * grid.children.length > i; });
      },
    };
  };

  // litho-stack: light, mask, resist, wafer.
  H.lithoStack = function (opts = {}) {
    const THREE = T3();
    const group = new THREE.Group();
    const parts = {};
    const layers = new THREE.Group();
    const names = ['light', 'mask', 'resist', 'wafer'];
    for (let i = 0; i < 4; i++) {
      const m = H.mesh(H.box('litho' + i, 420 - i * 30, 12, 420 - i * 30), {
        color: i === 0 ? (opts.accent || 0xc39bff) : (opts.color || 0x8fe4ff), edgeOpacity: 0.85, rim: false,
      });
      m.position.y = 160 - i * 70;
      layers.add(m);
      parts[names[i]] = m;
    }
    group.add(layers); parts.layers = layers;
    // the light beam
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(60, 180, 190, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: opts.accent || 0xc39bff, transparent: true, opacity: 0.10, side: THREE.DoubleSide }));
    beam.position.y = 90;
    group.add(beam); parts.beam = beam;
    return {
      group, parts,
      update(t, c) {
        beam.material.opacity = 0.06 + 0.08 * Math.abs(Math.sin(t * 1.4));
      },
    };
  };

  // layer-city: the chip as a city of levels.
  H.layerCity = function (opts = {}) {
    const THREE = T3();
    const group = new THREE.Group();
    const parts = {};
    const levels = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const m = H.mesh(H.box('cityL' + i, 520 - i * 40, 10, 380 - i * 30), { color: opts.color || 0x8fe4ff, edgeOpacity: 0.8, rim: false });
      m.position.y = -150 + i * 100;
      levels.add(m);
      parts['level' + i] = m;
    }
    group.add(levels); parts.levels = levels;
    // the wires between the levels
    const wires = new THREE.Group();
    for (let i = 0; i < 14; i++) {
      const g = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-220 + i * 34, -150, -120), new THREE.Vector3(-220 + i * 34, 150, -120),
      ]);
      wires.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: opts.accent || 0xc39bff, transparent: true, opacity: 0.6 })));
    }
    group.add(wires); parts.wires = wires;
    return {
      group, parts,
      update(t, c) {
        const p = c ? c.p : 1;
        levels.children.forEach((m, i) => { m.visible = p * 5 > i; });
      },
    };
  };

  // package-chip: the chip in its package, with leads.
  H.packageChip = function (opts = {}) {
    const THREE = T3();
    const group = new THREE.Group();
    const parts = {};
    const body = H.mesh(H.box('pkgBody', 200, 50, 200), { color: opts.color || 0x8fe4ff });
    group.add(body); parts.body = body;
    const die = H.mesh(H.box('pkgDie', 90, 12, 90), { color: opts.accent || 0xc39bff, edgeOpacity: 0.8, rim: false });
    die.position.y = 32;
    group.add(die); parts.die = die;
    const leads = new THREE.Group();
    for (let i = 0; i < 10; i++) {
      const m = H.mesh(H.box('lead', 6, 30, 6), { color: opts.color || 0x8fe4ff, edgeOpacity: 0.6, rim: false });
      m.position.set(-90 + i * 20, -38, 100);
      leads.add(m);
    }
    group.add(leads); parts.leads = leads;
    return { group, parts, update() {} };
  };

  // ---------- E06: the tunnelling machine ----------
  // tbm-slurry: cutterhead, bulkhead, slurry lines, erector, lining ring.
  H.tbmSlurry = function (opts = {}) {
    const THREE = T3();
    const group = new THREE.Group();
    const parts = {};
    const head = new THREE.Group();
    const R = opts.r || 260;
    const disc = H.mesh(H.cylinder('tbmDisc', R, R, 40, 48), { color: opts.color || 0x8fe4ff, edgeOpacity: 0.9 });
    disc.rotation.x = Math.PI / 2;
    head.add(disc);
    // the disc cutters
    const cutters = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const m = H.mesh(H.box('cutter', 34, 34, 34), { color: opts.accent || 0xff9b3d, edgeOpacity: 0.8, rim: false });
      m.position.set(Math.cos(a) * R * 0.72, Math.sin(a) * R * 0.72, 24);
      cutters.add(m);
    }
    head.add(cutters);
    group.add(head); parts.head = head; parts.cutters = cutters;

    // the bulkhead chamber behind the head
    const chamber = H.mesh(H.cylinder('tbmChamber', R * 0.86, R * 0.86, 220, 40, true), { color: opts.color || 0x8fe4ff, edgeOpacity: 0.8, rim: false });
    chamber.rotation.x = Math.PI / 2; chamber.position.z = -150;
    group.add(chamber); parts.chamber = chamber;

    // the slurry lines
    const lines = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const g = cached('tbmLine' + i, () => new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([new THREE.Vector3(-60 + i * 60, -R * 0.7, -220), new THREE.Vector3(-60 + i * 60, R * 0.6, -420)]), 24, 12, 8, false));
      const m = H.mesh(g, { color: opts.accent || 0xff9b3d, edgeOpacity: 0.6, rim: false });
      lines.add(m);
    }
    group.add(lines); parts.lines = lines;

    // the lining ring behind
    const ring = H.mesh(H.ring('tbmRing', R * 0.92, 26, 10), { color: opts.color || 0x8fe4ff, edgeOpacity: 0.9, rim: false });
    ring.position.z = -330;
    group.add(ring); parts.ring = ring;

    return {
      group, parts,
      update(t, c) {
        const rate = opts.rate == null ? 0.6 : opts.rate;
        head.rotation.z = t * rate;
        const p = c ? c.p : 1;
        ring.userData.parts.mesh.material.opacity = 0.08 + 0.16 * Math.max(0, Math.min(1, p * 2 - 1));
      },
    };
  };

  // city-slice: the ground under a city, with the tunnel below.
  H.citySlice = function (opts = {}) {
    const THREE = T3();
    const group = new THREE.Group();
    const parts = {};
    const ground = H.mesh(H.box('cityGround', 1400, 120, 700), { color: opts.color || 0x8fe4ff, opacity: 0.10, edgeOpacity: 0.8, rim: false });
    ground.position.y = -120;
    group.add(ground); parts.ground = ground;
    // the buildings on top
    const b = new THREE.Group();
    const heights = [220, 320, 180, 260, 150, 300, 200];
    heights.forEach((h, i) => {
      const m = H.mesh(H.box('bld' + i, 110, h, 110), { color: opts.color || 0x8fe4ff, edgeOpacity: 0.7, rim: false });
      m.position.set(-540 + i * 180, -60 + h / 2, 120);
      b.add(m);
    });
    group.add(b); parts.buildings = b;
    // the tunnel bore
    const bore = H.mesh(H.cylinder('cityBore', 150, 150, 1400, 32, true), { color: opts.accent || 0xff9b3d, edgeOpacity: 0.7, rim: false });
    bore.rotation.z = Math.PI / 2; bore.position.y = -300;
    group.add(bore); parts.bore = bore;
    return { group, parts, update() {} };
  };

  // register the new builders with the factory
  H.builders = Object.assign(H.builders || {}, {
    'rack-node-mesh': H.rackNodeMesh,
    'earth-wire': H.earthWire,
    'sat-constellation': H.satConstellation,
    'range-spheres': H.rangeSpheres,
    'phone-dot': H.phoneDot,
    'staged-platform': H.stagedPlatform,
    'loop-heat-to-power': H.heatToPower,
    'wafer-die': H.waferDie,
    'litho-stack': H.lithoStack,
    'layer-city': H.layerCity,
    'package-chip': H.packageChip,
    'tbm-slurry': H.tbmSlurry,
    'city-slice': H.citySlice,
  });
})();
