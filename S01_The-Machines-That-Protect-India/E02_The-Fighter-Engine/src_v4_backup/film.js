// The film: explainer(ctx, W, H_, t) draws the episode as a pure function of t.
// Beat start times come from TIMING (src/timing.js): each beat is anchored to the first word of a narration clip.
(function () {
  const lerp = H.lerp;
  const BP = window.BP, PANELS = window.PANELS, TM = window.TIMING, clamp = H.clamp, ease = H.ease;
  const W0 = 1280, H0 = 720;
  const at = TM.at;
  const DURATION = (window.DURATION = TM.DURATION);

  // id, start time, frac (share of the beat spent inking in), tr/d (arrival: fade or plotter-line sweep)
  const B = (id, t0, o) => Object.assign({ id, t0, frac: 0.75 }, o);
  // keys: [clipId, seconds after the clip starts, panel progress p]: pins panel events to the words that cause them
  const K = (clip, off, p) => [at(clip) + off, p];
  const D = (clip) => TM.byId[clip].dur;
  const BEATS = (window.BEATS = [
    B('1.1', 0, { frac: 0.7 }),
    B('1.2', at('c02'), { tr: 'fade', d: 0.5 }),
    B('1.3', at('c03'), { tr: 'fade', d: 0.5 }),
    B('2.1', at('c04'), { tr: 'wipe', d: 0.9, frac: 0.7 }),
    B('2.2', at('c05'), { tr: 'fade', d: 0.5, frac: 0.7 }),
    B('2.3', at('c06'), { tr: 'fade', d: 0.5 }),
    B('3.1', at('c07'), { tr: 'wipe', d: 0.9, keys: [K('c07', 0, 0), K('c08', 0, 0.4), K('c08', D('c08') * 0.9, 1)] }),
    B('3.2', at('c09'), { tr: 'fade', d: 0.5 }),
    B('4.1', at('c10'), { tr: 'wipe', d: 0.9 }),
    B('4.2', at('c11'), { tr: 'fade', d: 0.5 }),
    B('5.1', at('c12'), { tr: 'wipe', d: 0.9 }),
    B('5.2', at('c13'), { tr: 'fade', d: 0.5 }),
    B('5.3', at('c14'), { tr: 'fade', d: 0.5, keys: [K('c14', 0, 0), K('c15', 0, 0.3), K('c15', 3.2, 0.68), K('c15', D('c15'), 1)] }),
    B('5.4', at('c16'), { tr: 'fade', d: 0.5, keys: [K('c16', 0, 0), K('c17', 0, 0.4), K('c18', 0, 0.78), K('c18', D('c18') + 0.5, 1)] }),
    B('6.1', at('c19'), { tr: 'wipe', d: 0.9, keys: [K('c19', 0, 0), K('c20', 0, 0.45), K('c20', D('c20'), 0.85), K('c21', D('c21'), 1)] }),
    B('6.2', at('c22'), { tr: 'fade', d: 0.5, frac: 0.6 }),
    B('7.1', at('c24'), { tr: 'wipe', d: 0.9 }),
    B('7.2', at('c25'), { tr: 'fade', d: 0.5 }),
    B('7.3', at('c26'), { tr: 'fade', d: 0.5 }),
    B('8.1', at('c27'), { tr: 'wipe', d: 0.9 }),
    B('8.2', at('c28'), { tr: 'fade', d: 0.5 }),
    B('8.3', at('c29'), { tr: 'fade', d: 0.5 }),
    B('8.4', at('c30'), { tr: 'fade', d: 0.5 }),
    B('9.1', at('c31'), { tr: 'wipe', d: 0.9, keys: [K('c31', 0, 0), K('c31', D('c31') + 0.6, 0.6), K('c32', 0, 0.62), K('c32', D('c32'), 1)] }),
    B('9.2', at('c33'), { tr: 'fade', d: 0.5, frac: 0.7 }),
    B('9.3', TM.TITLE_AT, { tr: 'fade', d: 0.6, frac: 0.5 }),
  ]);
  BEATS.forEach((b, i) => { b.scene = +b.id.split('.')[0]; b.t1 = i + 1 < BEATS.length ? BEATS[i + 1].t0 : DURATION; });

  const PREROLL = 0.2; // a beat starts inking this long before its anchor word
  const visFrom = (b) => (b.tr === 'wipe' ? b.t0 - 0.3 : b.t0 - 0.25);
  const mmss = (t) => { const s = Math.floor(t); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const beatAt = (t) => { for (let i = BEATS.length - 1; i > 0; i--) if (t >= visFrom(BEATS[i])) return i; return 0; };
  // ink-in eases out, so something is on the sheet early and the rest settles in
  const keyed = (keys, t) => { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], (t - keys[i - 1][0]) / Math.max(1e-6, keys[i][0] - keys[i - 1][0])); return keys[keys.length - 1][1]; };
  const progress = (b, t) => { if (b.keys) return keyed(b.keys, t); const p = clamp((t - (b.t0 - PREROLL)) / ((b.t1 - b.t0) * b.frac)); return 1 - Math.pow(1 - p, 1.5); };
  const camOf = (b, t) => {
    const pan = PANELS[b.id], pc = clamp((t - b.t0) / (b.t1 - b.t0)); // camera keeps drifting through the hold
    return pan.cam ? pan.cam(pc) : { x: 640, y: 360, z: 1 + 0.02 * pc };
  };
  const layerFor = (b, t) => ({ draw: (x) => PANELS[b.id].draw(x, progress(b, t)), cam: camOf(b, t) });

  // vertical construction line that sweeps across the sheet, revealing the next beat behind it
  const sweepOverlay = (u) => (ix) => {
    const x = W0 * u;
    BP.line(ix, x, 30, x, H0 - 30, { w: 2.2, col: BP.C.cyan, seed: 901, bleed: true, hot: 0.5 });
    for (let y = 60; y < H0 - 40; y += 60) BP.line(ix, x - 10, y, x + 10, y, { w: 1.4, col: BP.C.cyan, seed: 902 + y, a: 0.8 });
    BP.pen(ix, [x, 40 + (H0 - 80) * ((u * 3) % 1)]);
  };

  function explainer(ctx, W, H_, t) {
    t = clamp(t, 0, DURATION - 1e-6);
    BP.now = t;
    const i = beatAt(t), b = BEATS[i], prev = BEATS[i - 1], since = t - visFrom(b);
    const o = { header: `SC.${b.scene} · ${TM.sceneName(b.scene)}`, block: `EP02 · ${mmss(t)}`, seed: 11, grainSeed: 1 + Math.floor(t * 24) };
    if (prev && since < b.d) {
      const u = clamp(since / b.d), pl = layerFor(prev, t), cl = layerFor(b, t);
      if (b.tr === 'wipe') {
        const r = ease.inOut(u);
        o.layers = [Object.assign(pl, { from: r }), Object.assign(cl, { reveal: r })]; o.overlay = sweepOverlay(r);
        o.gridCam = r > 0.5 ? cl.cam : pl.cam;
        if (r <= 0.5) o.header = `SC.${prev.scene} · ${TM.sceneName(prev.scene)}`;
      } else {
        const a = ease.inOut(u);
        o.layers = [Object.assign(pl, { alpha: 1 - a }), Object.assign(cl, { alpha: a })];
        o.gridCam = cl.cam;
      }
    } else {
      o.cam = camOf(b, t);
    }
    BP.frame(ctx, W, H_, (x) => PANELS[b.id].draw(x, progress(b, t)), o);
  }

  window.explainer = explainer;
  window.seek = (t) => {
    const c = document.getElementById('c'), ctx = c.getContext('2d', { willReadFrequently: true });
    explainer(ctx, W0, H0, t);
  };
})();
