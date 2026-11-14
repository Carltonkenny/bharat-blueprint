// kit-v2: the beat engine. Turns episode.s2.json (beats with weights) plus passage
// durations into an exact timeline, clamping beat lengths to the QC B8 limits and
// redistributing any difference to neighbouring beats.
//
// Rules (08_S02_VISUAL_ENGINE_SPEC.md section 4, QC_BAR_S02.md B8):
//   - beat duration = passage duration x w, weights per passage sum to 1
//   - a beat shorter than 1.2 s or longer than 8 s is clamped (10 s for mechanism/payoff)
//   - a clamp is reported, never hidden
export const LEAD_IN = 0.8;

export function buildTimeline(episode, passageDurations, opts = {}) {
  const clampReport = [];
  const beats = [];
  let t = LEAD_IN;
  const passages = episode.passages || [];
  const beatsByPassage = new Map();
  for (const b of episode.beats || []) {
    if (!beatsByPassage.has(b.p)) beatsByPassage.set(b.p, []);
    beatsByPassage.get(b.p).push(b);
  }

  for (const p of passages) {
    const list = beatsByPassage.get(p.id) || [];
    const dur = passageDurations[p.id];
    if (dur == null) throw new Error('no duration for passage ' + p.id);
    const sum = list.reduce((s, b) => s + (b.w || 0), 0) || 1;
    let durs = list.map((b) => (dur * (b.w || 0)) / sum);

    // clamp to B8
    const maxFor = (b) => (b.kind === 'mechanism' || b.kind === 'payoff' ? 10 : 8);
    for (let iter = 0; iter < 12; iter++) {
      let changed = false;
      for (let i = 0; i < list.length; i++) {
        const b = list[i], mx = maxFor(b);
        if (durs[i] > mx) { clampReport.push({ beat: b.id, from: +durs[i].toFixed(3), to: mx, reason: 'too long' }); durs[i] = mx; changed = true; }
        if (durs[i] < 1.2) { clampReport.push({ beat: b.id, from: +durs[i].toFixed(3), to: 1.2, reason: 'too short' }); durs[i] = 1.2; changed = true; }
      }
      if (!changed) break;
      // redistribute the difference to the neighbours inside the same passage
      const total = durs.reduce((s, v) => s + v, 0);
      const diff = dur - total;
      if (Math.abs(diff) < 1e-6) break;
      const free = list.map((b, i) => {
        const mx = maxFor(b);
        return durs[i] > 1.2 + 1e-6 && durs[i] < mx - 1e-6 ? i : -1;
      }).filter((i) => i >= 0);
      if (!free.length) break;
      const share = diff / free.length;
      free.forEach((i) => { durs[i] = Math.max(1.2, Math.min(maxFor(list[i]), durs[i] + share)); });
    }

    list.forEach((b, i) => {
      beats.push({
        id: b.id, p: b.p, kind: b.kind || 'hold', layer: b.layer || 'B',
        scene: b.scene || [], labels: b.labels || [], notes: b.notes || '',
        cam: b.cam || 'hold', camAmount: b.camAmount, camAz: b.camAz, camEl: b.camEl, camDist: b.camDist, fx: b.fx || [], at: b.at,
        tr: b.tr || 'fade', trDur: b.trDur, frac: b.frac, sceneTag: b.sceneTag || null,
        t0: +t.toFixed(4), t1: +(t + durs[i]).toFixed(4), dur: +durs[i].toFixed(4),
        passageStart: +(t - (t - t)).toFixed(4),
      });
      t += durs[i];
    });
  }

  const duration = Math.round(t * 30) / 30;
  const bpm = beats.length / (duration / 60);

  // Round 2: no accumulated camera track. Every beat carries its own explicit camera
  // (cam, camAz, camEl, camAmount); the old track added +el on every orbit beat and the
  // camera drifted to a steep top-down view by mid-film.

  return { duration, beats, clampReport, bpm: +bpm.toFixed(2), leadIn: LEAD_IN };
}

// passage durations from an estimate file: words / 1.8 (passages.md states this rate)
export function estimateDurations(episode, rate = 1.8) {
  const out = {};
  for (const p of episode.passages || []) {
    const words = (p.text || '').trim().split(/\s+/).filter(Boolean).length;
    out[p.id] = p.estSec != null ? Number(p.estSec) : words / rate;
  }
  return out;
}

// passage durations from measured timing (timing/measured.json)
export function measuredDurations(episode, measured) {
  const out = {};
  for (const p of episode.passages || []) {
    if (measured && measured[p.id] != null) out[p.id] = Number(measured[p.id]);
    else out[p.id] = Number(p.estSec);
  }
  return out;
}
