// kit-v2: the film runtime. window.__seek(t) puts the whole page into the exact state at
// time t. No wall clock, no requestAnimationFrame, no Date.now.
(function () {
  const BB = (window.BB = window.BB || {});
  const F = (BB.film = {});

  const clamp = (v, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
  const ease = { inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), out: (t) => 1 - Math.pow(1 - t, 3) };

  let cfg = null;         // { episode, timeline, glossary, size, fps }
  let c2 = null, x2 = null; // 2D canvas + context
  let heroCache = null;

  function beatIndexAt(t) {
    const bs = cfg.timeline.beats;
    for (let i = bs.length - 1; i >= 0; i--) if (t >= bs[i].t0 - 0.0001) return i;
    return 0;
  }

  // progress inside a beat: ink-in over the first `frac` of the beat, then hold
  function beatProgress(b, t) {
    const dur = b.t1 - b.t0;
    const frac = b.frac == null ? 0.72 : b.frac;
    const u = clamp((t - b.t0) / (dur * frac));
    return 1 - Math.pow(1 - u, 1.5);
  }

  F.init = function (options) {
    cfg = options;
    const S = BB.stage;
    c2 = document.getElementById('c2d');
    const c3 = document.getElementById('c3d');
    const W = cfg.size[0], H = cfg.size[1];
    for (const c of [c2, c3]) {
      c.width = W; c.height = H;
      c.style.width = W + 'px'; c.style.height = H + 'px';
    }
    x2 = c2.getContext('2d', { willReadFrequently: true });
    BB.stage.init(c3, { W, H, dpr: 1 });
    heroCache = new Map();
    F.cfg = cfg;
    F.tokens = cfg.tokens;
  };

  // Which ops are drawn in screen space (text must never leave the safe area, so the
  // camera never moves it). Everything else is world and moves with the camera.
  const SCREEN_OPS = new Set(['text', 'stack', 'railLabel', 'numberCard', 'titleCard', 'stamp', 'tag', 'sourceChip', 'leader', 'panel', 'chart', 'map']);

  function beatCtx(b, t, p, alpha) {
    return {
      T: F.tokens, t, p, beat: b, since: Math.max(0, t - b.t0), alpha,
      W: F.tokens.BASE_W, H: F.tokens.BASE_H,
      ctx: x2, heroes: heroCache, threeHeroes: [],
    };
  }

  // world pass: the drawing and the 3D hero, under the camera
  function drawWorld(b, t, opts = {}) {
    const p = opts.p == null ? beatProgress(b, t) : opts.p;
    const alpha = opts.alpha == null ? 1 : opts.alpha;
    if (alpha <= 0.01) return;
    const ctx = beatCtx(b, t, p, alpha);
    const world = (b.scene || []).filter((o) => !SCREEN_OPS.has(o.op) && o.op.indexOf('x:') !== 0);
    BB.scenes.drawOps(ctx, world);
    ctx.threeHeroes.forEach((h) => {
      BB.stage.scene.add(h.group);
      const box = BB.stage.bbox(h.group);
      if (!box || box.behind) return;
      const k = F.tokens.BASE_W / cfg.size[0];
      if (BB.report) BB.report.add({ kind: 'hero', id: b.id, hero: h.kind, text: '', x0: box.x0 * k, y0: box.y0 * k, x1: box.x1 * k, y1: box.y1 * k, color: F.tokens.accent, opacity: alpha, layer: 'H' });
    });
  }

  // screen pass: every label, card and diagram, never moved by the camera
  function drawScreen(b, t, opts = {}) {
    const p = opts.p == null ? beatProgress(b, t) : opts.p;
    const alpha = opts.alpha == null ? 1 : opts.alpha;
    if (alpha <= 0.01) return;
    const ctx = beatCtx(b, t, p, alpha);
    const screen = (b.scene || []).filter((o) => SCREEN_OPS.has(o.op));
    BB.scenes.drawOps(ctx, screen);
  }

  F.render = function (t) {
    if (!cfg) return;
    const T = cfg.tokens;
    const bs = cfg.timeline.beats;
    const dur = cfg.timeline.duration;
    t = clamp(t, 0, Math.max(0, dur - 1e-6));

    BB.report.begin(t, null);
    BB.draw.resetAnchors();
    BB.labels.reset();

    // 2D canvas: paper + camera
    const scale = cfg.size[0] / T.BASE_W;
    x2.setTransform(1, 0, 0, 1, 0, 0);
    x2.clearRect(0, 0, cfg.size[0], cfg.size[1]);
    x2.setTransform(scale, 0, 0, scale, 0, 0);
    BB.draw.paper(x2, T.BASE_W, T.BASE_H, T);

    const i = beatIndexAt(t);
    const b = bs[i];
    const nb = bs[i + 1];

    // camera for this beat (at most one move per beat)
    const u = clamp((t - b.t0) / Math.max(1e-6, b.t1 - b.t0));
    const cam = BB.camera.for(b.cam || 'hold', u, { amount: b.camAmount, az: b.camAz, el: b.camEl });
    BB.currentCamera = cam;

    // the 3D stage
    BB.stage.clearScene();
    const c3 = BB.camera.for3d(b.cam || 'hold', u, { amount: b.camAmount, az: b.camAz, el: b.camEl });
    BB.stage.setCamera3d(c3);

    // transition: fade or wipe into the next beat
    const trDur = b.tr === 'wipe' ? (b.trDur || 0.9) : (b.trDur || 0.55);
    const intoNext = nb && t >= nb.t0 - trDur && t < nb.t0 + 0.001;
    let trP = 0;

    // world pass: under the camera. The grid moves with it, so a camera move is
    // visible even on a flat beat, while no text ever leaves the safe area.
    x2.save();
    BB.camera.apply2d(x2, T.BASE_W, T.BASE_H, cam);
    BB.draw.grid(x2, T.BASE_W, T.BASE_H, T);
    if (intoNext) {
      trP = clamp((t - (nb.t0 - trDur)) / trDur);
      if (b.tr === 'wipe') {
        drawWorld(b, t, { alpha: 1 });
        drawWorld(nb, t, { p: 0.001, alpha: 1 });
        BB.fx.sectionSweep(x2, T.BASE_W, T.BASE_H, trP, T, { col: T.accent });
      } else {
        drawWorld(b, t, { alpha: 1 - trP });
        drawWorld(nb, t, { p: 0.001, alpha: trP });
      }
    } else {
      drawWorld(b, t, {});
    }
    x2.restore();

    // screen pass: never moved by the camera
    BB.currentCamera = null;
    if (intoNext) {
      if (b.tr === 'wipe') {
        drawScreen(b, t, { alpha: 1 });
        drawScreen(nb, t, { p: 0.001, alpha: 1 });
      } else {
        drawScreen(b, t, { alpha: 1 - trP });
        drawScreen(nb, t, { p: 0.001, alpha: trP });
      }
    } else {
      drawScreen(b, t, {});
    }

    // HUD (screen space, never moved by the camera)
    x2.setTransform(scale, 0, 0, scale, 0, 0);
    BB.draw.hud(x2, T.BASE_W, T.BASE_H, T, {
      scene: cfg.sceneLabel ? cfg.sceneLabel(b) : null,
      block: `${cfg.episode.id} · ${mmss(t)}`,
    });

    BB.stage.render();
    F.lastT = t;
  };

  const mmss = (t) => {
    const s = Math.floor(t);
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  };

  F.mmss = mmss;

  // ---- the public seek contract ----
  window.seek = function (t) {
    F.render(t);
  };
  window.__hf = {
    get duration() { return cfg ? cfg.timeline.duration : 0; },
    seek: (t) => window.seek(t),
  };
  window.addEventListener('hf-seek', (e) => {
    const d = e.detail || {};
    const t = d.time;
    if (typeof t !== 'number') return;
    if (typeof d.waitUntil === 'function' && window.__fontsReady) {
      d.waitUntil(window.__fontsReady.then(() => window.seek(t)));
    } else {
      window.seek(t);
    }
  });
  window.addEventListener('hf-ready', () => { window.seek(0); });
})();
