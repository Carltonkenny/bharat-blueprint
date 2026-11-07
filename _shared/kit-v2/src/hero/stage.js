// kit-v2: the 3D stage. One WebGLRenderer per page, preserveDrawingBuffer, pixelRatio 1,
// and a single analytic renderAt(t). No incremental physics, no wall clock.
(function () {
  const BB = (window.BB = window.BB || {});
  const S = (BB.stage = {});

  let renderer = null, scene = null, camera = null, canvas = null;
  let W = 1920, H = 1080, dpr = 1;

  S.init = function (canvasEl, opts = {}) {
    const THREE = window.THREE;
    canvas = canvasEl;
    W = opts.W || 1920; H = opts.H || 1080; dpr = opts.dpr || 1;
    renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: opts.antialias !== false,
      preserveDrawingBuffer: true, powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000000, 0);
    renderer.localClippingEnabled = true;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 4000);
    camera.position.set(0, 0, 620);
    camera.lookAt(0, 0, 0);
    S.THREE = THREE;
    S.renderer = renderer;
    S.scene = scene;
    S.camera = camera;
    return S;
  };

  S.resize = function (w, h) {
    W = w; H = h;
    if (renderer) { renderer.setSize(W, H, false); }
    if (camera) { camera.aspect = W / H; camera.updateProjectionMatrix(); }
  };

  S.clearScene = function () {
    if (!scene) return;
    // geometry is owned by the hero module's cache: never dispose it here
    for (let i = scene.children.length - 1; i >= 0; i--) scene.remove(scene.children[i]);
  };

  // camera from an analytic description
  S.setCamera3d = function (c, target) {
    if (!camera) return;
    const az = c.az || 0, el = c.el || 0, dist = (c.dist == null ? 1 : c.dist);
    const r = 900 * dist;
    camera.position.set(
      Math.sin(az) * Math.cos(el) * r,
      Math.sin(el) * r + (c.y || 0),
      Math.cos(az) * Math.cos(el) * r + (c.x || 0));
    camera.lookAt(0, 0, 0);
    if (target) { camera.lookAt(target.x || 0, target.y || 0, target.z || 0); }
  };

  S.render = function () {
    if (renderer && scene && camera) renderer.render(scene, camera);
  };

  // Screen-space bounding box of an object, in authoring units (W x H).
  S.bbox = function (obj) {
    if (!obj || !camera) return null;
    const THREE = window.THREE;
    const box = new THREE.Box3().setFromObject(obj);
    if (box.isEmpty()) return null;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const v = new THREE.Vector3();
    for (let i = 0; i < 8; i++) {
      v.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z);
      v.project(camera);
      const sx = (v.x * 0.5 + 0.5) * W;
      const sy = (-v.y * 0.5 + 0.5) * H;
      x0 = Math.min(x0, sx); x1 = Math.max(x1, sx);
      y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
    }
    const behind = box.max.z < -camera.near;
    return { x0, y0, x1, y1, behind, empty: !isFinite(x0) };
  };
})();
