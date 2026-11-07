// The film: explainer(ctx, W, H_, t) draws the episode as a pure function of t.
// Every beat time lives in BEATS and is anchored to a measured word in the Ranbir Merchant narration (see
// narration/narration.json). A new voiceover take means editing OFFSETS / the sentence anchors below.
(function () {
  const BP = window.BP, PANELS = window.PANELS, clamp = H.clamp, ease = H.ease;
  const W0 = 1280, H0 = 720;

  // Section start times (s) on the film clock: clip lengths are measured from the ElevenLabs audio.
  const CLIP = { S1: 18.64, S2: 17.6, S3: 19.68, S4: 34.0, S5: 18.16, S6: 17.44 };
  const GAP = { S1: 0.6, S2: 0.6, S3: 0.6, S4: 0.6, S5: 4.0 }; // silence after each section (S5 -> S6 leaves room for the factory beat)
  const LEAD_IN = 0.8;
  const O = { S1: LEAD_IN };
  ['S1', 'S2', 'S3', 'S4', 'S5'].forEach((k, i) => { const n = 'S' + (i + 2); O[n] = O[k] + CLIP[k] + GAP[k]; });
  const END_VOICE = O.S6 + CLIP.S6;
  const DURATION = (window.DURATION = Math.round((END_VOICE + 0.5 + 3.3) * 30) / 30);
  window.NARRATION_OFFSETS = O;

  // id, start (word anchor), frac (share of the beat spent inking in), tr/d (arrival: fade or plotter-line sweep)
  const B = (id, t0, o) => Object.assign({ id, t0, frac: 0.9 }, o);
  const BEATS = (window.BEATS = [
    B('1.1', 0, { frac: 0.8 }),
    B('1.2', O.S1 + 3.6, { tr: 'fade', d: 0.5 }),        // "An unidentified aircraft"
    B('1.3', O.S1 + 7.53, { tr: 'fade', d: 0.5 }),       // "It's moving closer"
    B('1.4', O.S1 + 12.3, { tr: 'fade', d: 0.5, frac: 0.55 }), // "But here's the question" ... held through "Because protecting a country"
    B('2.1', O.S2 + 4.72, { tr: 'fade', d: 0.6 }),       // "First, something needs to detect it"
    B('2.2', O.S2 + 7.63, { tr: 'fade', d: 0.5 }),       // "Information needs to be analysed"
    B('2.3', O.S2 + 9.91, { tr: 'fade', d: 0.5 }),       // "And different defence systems"
    B('2.4', O.S2 + 13.3, { tr: 'fade', d: 0.5 }),       // "Modern air defence is an entire network"
    B('3.1', O.S3, { tr: 'wipe', d: 0.9, frac: 0.45 }),  // "One part of India's indigenous..."
    B('3.2', O.S3 + 8.09, { tr: 'fade', d: 0.5, frac: 1 }), // "It's not just a missile"
    B('3.3', O.S3 + 10.74, { tr: 'fade', d: 0.5 }),      // "It's an interconnected system involving radar..."
    B('3.4', O.S3 + 17.5, { tr: 'fade', d: 0.5, frac: 1 }), // "...and an interceptor" -> camera toward the radar
    B('4.1', O.S4, { tr: 'fade', d: 0.7 }),              // "Think of the radar as its eyes"
    B('4.2', O.S4 + 10.18, { tr: 'fade', d: 0.6 }),      // "Next comes the Command and Control Unit"
    B('4.3', O.S4 + 17.75, { tr: 'fade', d: 0.6 }),      // "And then there's the interceptor"
    B('4.4', O.S4 + 28.59, { tr: 'fade', d: 0.6 }),      // "Different technologies."
    B('5.1', O.S5, { tr: 'wipe', d: 0.9, frac: 0.6 }),   // "Countries such as the United States and France"
    B('5.2', O.S5 + 10.22, { tr: 'fade', d: 0.5, frac: 1 }), // "It's about developing the engineering, radar technology..."
    B('5.3', O.S5 + 16.34, { tr: 'fade', d: 0.5, frac: 1 }), // "to build its own systems"
    B('5.4', O.S5 + CLIP.S5 + 0.3, { tr: 'fade', d: 0.5 }),  // narration pause: the factory
    B('6.1', O.S6, { tr: 'wipe', d: 0.9, frac: 0.4 }),   // "In December 2025..."
    B('6.2', O.S6 + 9.4, { tr: 'fade', d: 0.5, frac: 0.85 }), // "The missile is only what you see"
    B('6.3', O.S6 + 13.55, { tr: 'fade', d: 0.5, frac: 0.8 }), // "The real engineering..."
    B('6.4', END_VOICE + 0.5, { tr: 'fade', d: 0.6, frac: 0.35 }),
  ]);
  BEATS.forEach((b, i) => { b.scene = +b.id[0]; b.t1 = i + 1 < BEATS.length ? BEATS[i + 1].t0 : DURATION; });

  const PREROLL = 0.2; // a beat starts inking this long before its anchor word
  const visFrom = (b) => (b.tr === 'wipe' ? b.t0 - 0.3 : b.t0 - 0.25);
  const mmss = (t) => { const s = Math.floor(t); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const beatAt = (t) => { for (let i = BEATS.length - 1; i > 0; i--) if (t >= visFrom(BEATS[i])) return i; return 0; };
  // ink-in eases out, so something is on the sheet early and the rest settles in
  const progress = (b, t) => { const p = clamp((t - (b.t0 - PREROLL)) / ((b.t1 - b.t0) * b.frac)); return 1 - Math.pow(1 - p, 1.5); };
  const camOf = (b, t) => {
    const pan = PANELS[b.id], pc = clamp((t - b.t0) / (b.t1 - b.t0)); // camera keeps drifting through the hold
    return pan.cam ? pan.cam(pc) : { x: 640, y: 360, z: 1 + 0.025 * pc };
  };
  const layerFor = (b, t) => ({ draw: (x) => PANELS[b.id].draw(x, progress(b, t)), cam: camOf(b, t) });

  // vertical construction line that sweeps across the sheet, revealing the next beat behind it
  const sweepOverlay = (u) => (ix) => {
    const x = W0 * u;
    BP.line(ix, x, 30, x, H0 - 30, { w: 2.2, col: BP.C.cyan, seed: 901, bleed: true });
    for (let y = 60; y < H0 - 40; y += 60) BP.line(ix, x - 10, y, x + 10, y, { w: 1.4, col: BP.C.cyan, seed: 902 + y, a: 0.8 });
    BP.pen(ix, [x, 40 + (H0 - 80) * ((u * 3) % 1)]);
  };

  function explainer(ctx, W, H_, t) {
    t = clamp(t, 0, DURATION - 1e-6);
    BP.now = t;
    const i = beatAt(t), b = BEATS[i], prev = BEATS[i - 1], since = t - visFrom(b);
    const sName = (n) => window.SB.sections[n - 1].name;
    const o = { header: `SC.${b.scene} · ${sName(b.scene)}`, block: `EP01 · ${mmss(t)}`, seed: 11, grainSeed: 1 + Math.floor(t * 24) };
    if (prev && since < b.d) {
      const u = clamp(since / b.d), pl = layerFor(prev, t), cl = layerFor(b, t);
      if (b.tr === 'wipe') {
        const r = ease.inOut(u);
        o.layers = [Object.assign(pl, { from: r }), Object.assign(cl, { reveal: r })]; o.overlay = sweepOverlay(r);
        o.gridCam = r > 0.5 ? cl.cam : pl.cam;
        if (r <= 0.5) o.header = `SC.${prev.scene} · ${sName(prev.scene)}`;
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
