// kit-v2: 3D heroes. Blueprint-hologram look: crisp edge lines plus a translucent fill
// with a fresnel rim, depth fog toward the paper colour, and a faint ground grid.
// Built from primitives only. Every builder caches its geometry; nothing is created per frame.
(function () {
  const BB = (window.BB = window.BB || {});
  const H = (BB.hero = {});

  const geoCache = new Map();
  function cached(key, make) {
    if (!geoCache.has(key)) geoCache.set(key, make());
    return geoCache.get(key);
  }

  function T3() { return window.THREE; }

  // ---------- the blueprint hologram material ----------
  H.hologramMaterial = function (opts = {}) {
    const THREE = T3();
    const col = new THREE.Color(opts.color || 0x8fe4ff);
    const fill = new THREE.MeshBasicMaterial({
      color: col, transparent: true, opacity: opts.opacity == null ? 0.16 : opts.opacity,
      depthWrite: false, side: THREE.DoubleSide,
    });
    const edge = new THREE.LineBasicMaterial({
      color: opts.edge || 0xeef6ff, transparent: true, opacity: opts.edgeOpacity == null ? 0.92 : opts.edgeOpacity,
    });
    return { fill, edge };
  };

  // a fresnel rim shell drawn additively over the fill
  H.rimMaterial = function (opts = {}) {
    const THREE = T3();
    const col = new THREE.Color(opts.color || 0x8fe4ff);
    const cut = opts.cut || null;
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: col },
        uPower: { value: opts.power == null ? 2.6 : opts.power },
        uIntensity: { value: opts.intensity == null ? 0.5 : opts.intensity },
        uCut: cut || { value: 1e9 },
      },
      vertexShader: [
        'varying vec3 vN;',
        'varying vec3 vV;',
        'varying float vLocalZ;',
        'void main() {',
        '  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
        '  vN = normalize(normalMatrix * normal);',
        '  vV = normalize(-mvPosition.xyz);',
        '  vLocalZ = position.z;',
        '  gl_Position = projectionMatrix * mvPosition;',
        '}',
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 uColor; uniform float uPower; uniform float uIntensity; uniform float uCut;',
        'varying vec3 vN; varying vec3 vV; varying float vLocalZ;',
        'void main() {',
        '  if ( vLocalZ > uCut ) discard;',
        '  float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPower);',
        '  gl_FragColor = vec4(uColor, f * uIntensity);',
        '}',
      ].join('\n'),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.FrontSide,
    });
  };

  // A cutaway that does not depend on the camera: fragments whose local z is above the
  // cut are discarded. The threshold sweeps to reveal the interior.
  H.cutUniform = function () { return { value: 1e9 }; };

  H.makeCuttable = function (material, cutUniform) {
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uCut = cutUniform;
      shader.vertexShader = 'varying float vLocalZ;\n' + shader.vertexShader.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\n\tvLocalZ = position.z;');
      shader.fragmentShader = 'uniform float uCut;\nvarying float vLocalZ;\n' + shader.fragmentShader.replace(
        '#include <clipping_planes_fragment>',
        '#include <clipping_planes_fragment>\n\tif ( vLocalZ > uCut ) discard;');
    };
    material.customProgramCacheKey = () => 'bb-cuttable';
    material.needsUpdate = true;
    return material;
  };

  // Build a mesh with an edge overlay and a rim shell.
  H.mesh = function (geometry, opts = {}) {
    const THREE = T3();
    const group = new THREE.Group();
    const cut = opts.cut || null;
    const mats = H.hologramMaterial(opts);
    if (cut) { H.makeCuttable(mats.fill, cut); H.makeCuttable(mats.edge, cut); }
    const mesh = new THREE.Mesh(geometry, mats.fill);
    mesh.renderOrder = 1;
    group.add(mesh);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, opts.threshold == null ? 25 : opts.threshold), mats.edge);
    edges.renderOrder = 2;
    group.add(edges);
    if (opts.rim !== false) {
      const rim = new THREE.Mesh(geometry, H.rimMaterial({ color: opts.rimColor || opts.color || 0x8fe4ff, intensity: opts.rimIntensity == null ? 0.45 : opts.rimIntensity, cut }));
      rim.renderOrder = 0;
      rim.scale.multiplyScalar(1.012);
      group.add(rim);
    }
    group.userData.parts = { mesh, edges };
    return group;
  };

  // ---------- geometry helpers (cached) ----------
  H.lathe = function (key, points, segments, opts) {
    return cached('lathe:' + key, () => {
      const THREE = T3();
      const pts = points.map((p) => new THREE.Vector2(p[0], p[1]));
      return new THREE.LatheGeometry(pts, segments || 48);
    });
  };
  H.tube = function (key, path, radius, tubular, radial) {
    return cached('tube:' + key, () => {
      const THREE = T3();
      const curve = new THREE.CatmullRomCurve3(path.map((p) => new THREE.Vector3(p[0], p[1], p[2] || 0)));
      return new THREE.TubeGeometry(curve, tubular || 64, radius, radial || 10, false);
    });
  };
  H.ring = function (key, r, tube, radial) {
    return cached('ring:' + key, () => {
      const THREE = T3();
      return new THREE.TorusGeometry(r, tube, radial || 10, 72);
    });
  };
  H.cylinder = function (key, rt, rb, h, seg, open) {
    return cached('cyl:' + key, () => {
      const THREE = T3();
      return new THREE.CylinderGeometry(rt, rb, h, seg || 40, 1, !!open);
    });
  };
  H.box = function (key, w, h, d) {
    return cached('box:' + key, () => {
      const THREE = T3();
      return new THREE.BoxGeometry(w, h, d);
    });
  };
  H.sphere = function (key, r) {
    return cached('sph:' + key, () => {
      const THREE = T3();
      return new THREE.SphereGeometry(r, 32, 20);
    });
  };
  H.torusKnotish = null;

  // ---------- a faint ground grid for scale ----------
  H.groundGrid = function (opts = {}) {
    const THREE = T3();
    const size = opts.size || 1400, div = opts.div || 20;
    const g = new THREE.BufferGeometry();
    const pts = [];
    for (let i = 0; i <= div; i++) {
      const p = -size / 2 + (size * i) / div;
      pts.push(p, 0, -size / 2, p, 0, size / 2);
      pts.push(-size / 2, 0, p, size / 2, 0, p);
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const m = new THREE.LineBasicMaterial({ color: opts.color || 0x8fe4ff, transparent: true, opacity: opts.opacity == null ? 0.10 : opts.opacity });
    return new THREE.LineSegments(g, m);
  };

  // ---------- builders ----------
  // Each builder returns { group, parts, update(t) }.

  // tank: a cryogenic propellant tank (sphere with cylindrical ends), frosted look.
  H.tank = function (opts = {}) {
    const THREE = T3();
    const group = new THREE.Group();
    const parts = {};
    const R = opts.r || 100, L = opts.len || 300;
    const body = H.mesh(cached('tankBody', () => {
      const THREE2 = T3();
      const pts = [];
      for (let i = 0; i <= 24; i++) {
        const a = (i / 24) * Math.PI;
        pts.push(new THREE2.Vector2(Math.sin(a) * R, -Math.cos(a) * (L / 2)));
      }
      const g = new THREE2.LatheGeometry(pts, 48);
      g.rotateZ(Math.PI / 2);
      return g;
    }), { color: opts.color || 0x8fe4ff });
    group.add(body);
    parts.body = body;

    const band = H.mesh(H.ring('tankBand', R * 1.01, 4, 8), { color: opts.accent || 0xff9b3d, edgeOpacity: 0.8 });
    band.rotation.y = Math.PI / 2;
    group.add(band);
    parts.band = band;

    const frost = H.mesh(H.sphere('frost', R * 1.03), { color: 0x9fe9ff, opacity: 0.07, rim: false, edge: false });
    group.add(frost);
    parts.frost = frost;

    return {
      group, parts,
      update(t, c) {
        const pulse = 0.6 + 0.4 * Math.sin(t * 1.6);
        if (opts.frostOn) {
          frost.visible = true;
          frost.userData.parts.mesh.material.opacity = 0.05 + 0.05 * pulse;
        } else frost.visible = false;
      },
    };
  };

  // pipe-network: a run of pipes with joints and a flow pulse.
  H.pipeNetwork = function (opts = {}) {
    const THREE = T3();
    const group = new THREE.Group();
    const parts = {};
    const paths = opts.paths || [
      [[-220, -60, 0], [-60, -60, 0], [0, 0, 0]],
      [[0, 0, 0], [80, 60, 0], [220, 60, 0]],
    ];
    paths.forEach((path, i) => {
      const g = H.tube('pipe' + i + ':' + path.length, path, opts.r || 9, 72, 10);
      const m = H.mesh(g, { color: opts.color || 0x8fe4ff, edgeOpacity: 0.7 });
      group.add(m);
      parts['pipe' + i] = m;
    });
    // a pulse that travels along the pipes
    const pulseMat = new THREE.MeshBasicMaterial({ color: opts.accent || 0xff9b3d, transparent: true, opacity: 0.9 });
    const pulse = new THREE.Mesh(new THREE.SphereGeometry(12, 16, 12), pulseMat);
    group.add(pulse);
    parts.pulse = pulse;

    return {
      group, parts,
      update(t) {
        const u = (t * 0.22) % 1;
        const path = paths[0];
        const seg = u * (path.length - 1);
        const i = Math.min(path.length - 2, Math.floor(seg));
        const f = seg - i;
        const a = path[i], b = path[i + 1];
        pulse.position.set(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f);
        pulse.visible = opts.flow !== false;
      },
    };
  };

  // turbopump: impeller in a volute.
  H.turbopump = function (opts = {}) {
    const THREE = T3();
    const group = new THREE.Group();
    const parts = {};
    const volute = H.mesh(H.lathe('volute', [[0, -70], [46, -66], [62, -40], [66, 0], [62, 40], [46, 66], [0, 70]], 48), { color: opts.color || 0x8fe4ff });
    group.add(volute); parts.volute = volute;

    const impeller = new THREE.Group();
    const hub = H.mesh(H.cylinder('impHub', 16, 16, 40, 24), { color: opts.accent || 0xff9b3d });
    hub.rotation.z = Math.PI / 2;
    impeller.add(hub);
    const bladeCount = opts.blades || 10;
    const bladeGeo = cached('impBlade', () => {
      const THREE2 = T3();
      const g = new THREE2.BoxGeometry(6, 52, 14);
      g.translate(0, 26, 0);
      return g;
    });
    const blades = new THREE.InstancedMesh(bladeGeo, new THREE.MeshBasicMaterial({ color: opts.accent || 0xff9b3d, transparent: true, opacity: 0.30 }), bladeCount);
    const edges = new THREE.InstancedMesh(bladeGeo, new THREE.MeshBasicMaterial({ color: 0xeef6ff, wireframe: true, transparent: true, opacity: 0.55 }), bladeCount);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < bladeCount; i++) {
      e.set(0, 0, (i / bladeCount) * Math.PI * 2);
      q.setFromEuler(e);
      v.set(0, 0, 0);
      m4.compose(v, q, s);
      blades.setMatrixAt(i, m4);
      edges.setMatrixAt(i, m4);
    }
    impeller.add(blades); impeller.add(edges);
    impeller.rotation.y = Math.PI / 2;
    group.add(impeller);
    parts.impeller = impeller;
    parts.blades = blades;

    const shaft = H.mesh(H.cylinder('pumpShaft', 8, 8, 160, 16), { color: opts.color || 0x8fe4ff, edgeOpacity: 0.6 });
    shaft.rotation.z = Math.PI / 2;
    group.add(shaft); parts.shaft = shaft;

    return {
      group, parts,
      update(t) {
        const rate = opts.rate == null ? 3.4 : opts.rate;
        impeller.rotation.x = t * rate;
      },
    };
  };

  // chamber-nozzle: a combustion chamber and bell nozzle, with a cutaway that sweeps
  // the near half away to reveal the interior.
  H.chamberNozzle = function (opts = {}) {
    const THREE = T3();
    const group = new THREE.Group();
    const parts = {};
    const cut = H.cutUniform();
    const R = opts.r || 140;
    const chamber = H.mesh(H.lathe('chamber', [[0, 150], [46, 150], [50, 120], [50, -40], [70, -60], [70, -80], [0, -80]], 48), { color: opts.color || 0x8fe4ff, cut });
    group.add(chamber); parts.chamber = chamber;

    const nozzle = H.mesh(H.lathe('nozzle', [[0, -80], [70, -80], [74, -100], [96, -160], [124, -210], [136, -232], [132, -236], [120, -214], [92, -162], [70, -104], [64, -86], [0, -86]], 56), { color: opts.color || 0x8fe4ff, cut });
    group.add(nozzle); parts.nozzle = nozzle;

    // throat glow
    const flame = H.mesh(H.sphere('flame', 40), { color: opts.accent || 0xff9b3d, opacity: 0.30, rim: true, rimIntensity: 0.9, edge: false, cut });
    flame.position.set(0, -20, 0);
    group.add(flame); parts.flame = flame;

    // cooling passages (concept only)
    const cool = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const path = [[Math.cos(a) * 74, 100, Math.sin(a) * 74], [Math.cos(a) * 80, 0, Math.sin(a) * 80], [Math.cos(a) * 96, -70, Math.sin(a) * 96]];
      const m = H.mesh(H.tube('cool' + i, path, 5, 40, 8), { color: 0x9fe9ff, edgeOpacity: 0.5, rim: false, cut });
      cool.add(m);
    }
    group.add(cool); parts.cooling = cool;

    return {
      group, parts, cut, cutRange: R,
      update(t, c) {
        const p = opts.clipProgress == null ? (c ? c.p : 0) : opts.clipProgress;
        // the cut sweeps from clear of the whole part (R) to the mid plane (0),
        // so the near half is removed and the interior is revealed
        cut.value = R * (1 - p);
        const fl = opts.flamePulse ? (0.55 + 0.45 * Math.sin(t * 3)) : (opts.flame == null ? 1 : opts.flame);
        flame.visible = fl > 0.02;
        flame.userData.parts.mesh.material.opacity = 0.30 * fl;
        flame.scale.setScalar(0.85 + 0.2 * fl);
        flame.position.y = -20 + 12 * fl;
      },
    };
  };

  // rocket-stack: a stack of stages with an upper stage that can be highlighted.
  H.rocketStack = function (opts = {}) {
    const THREE = T3();
    const group = new THREE.Group();
    const parts = {};
    const body = H.mesh(H.cylinder('rocketBody', 62, 66, 420, 40), { color: opts.color || 0x8fe4ff });
    body.position.y = -40;
    group.add(body); parts.body = body;

    const upper = H.mesh(H.cylinder('rocketUpper', 52, 60, 240, 40), { color: opts.accent || 0xff9b3d, edgeOpacity: 0.9 });
    upper.position.y = 180;
    group.add(upper); parts.upper = upper;

    const nose = H.mesh(H.lathe('nose', [[0, 260], [26, 250], [44, 220], [54, 180], [56, 160]], 40), { color: opts.color || 0x8fe4ff });
    nose.position.y = 190;
    group.add(nose); parts.nose = nose;

    // a nozzle bell at the bottom
    const bell = H.mesh(H.lathe('rocketBell', [[0, 0], [34, 0], [44, -30], [52, -70], [54, -80], [46, -80], [38, -30], [30, -6], [0, -6]], 36), { color: opts.color || 0x8fe4ff });
    bell.position.y = -250;
    group.add(bell); parts.bell = bell;

    // four thin fins
    const fins = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const g = cached('fin', () => {
        const THREE2 = T3();
        const g2 = new THREE2.BoxGeometry(8, 120, 90);
        g2.translate(0, -60, 50);
        return g2;
      });
      const m = H.mesh(g, { color: opts.color || 0x8fe4ff, edgeOpacity: 0.6 });
      m.rotation.y = a;
      fins.add(m);
    }
    fins.position.y = -190;
    group.add(fins); parts.fins = fins;

    return {
      group, parts,
      update(t, c) {
        const lit = opts.upperLit == null ? 1 : opts.upperLit;
        upper.userData.parts.mesh.material.opacity = 0.14 + 0.20 * lit;
        upper.userData.parts.edges.material.opacity = 0.92;
        body.userData.parts.mesh.material.opacity = 0.14 - 0.06 * lit;
      },
    };
  };

  // ---------- explode ----------
  H.explode = function (hero, amount, axis) {
    const ax = axis || new (T3().Vector3)(0, 1, 0);
    const parts = hero.parts || {};
    let i = 0;
    const keys = Object.keys(parts);
    keys.forEach((k) => {
      const p = parts[k];
      if (!p || !p.position) return;
      const d = (i % 2 === 0 ? 1 : -1) * amount * (40 + 30 * (i % 3));
      p.position.set(ax.x * d, ax.y * d, ax.z * d);
      i++;
    });
    return hero;
  };

  // ---------- factory ----------
  const BUILDERS = {
    tank: H.tank,
    'pipe-network': H.pipeNetwork,
    turbopump: H.turbopump,
    'chamber-nozzle': H.chamberNozzle,
    'rocket-stack': H.rocketStack,
  };
  H.builders = BUILDERS;

  H.create = function (kind, opts = {}) {
    const make = BUILDERS[kind];
    if (!make) throw new Error('unknown hero: ' + kind);
    const hero = make(opts);
    hero.kind = kind;
    return hero;
  };
})();
