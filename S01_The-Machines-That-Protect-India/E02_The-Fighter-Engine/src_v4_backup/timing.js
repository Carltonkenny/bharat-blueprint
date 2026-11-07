// Single source of truth for Episode 2 timing. Each narration clip is one sentence group generated and measured on its
// own, so the drawings can breathe between sentences. Clip lengths are ESTIMATED from word counts (WPS) until the narrator
// is chosen: after the audition, put the measured seconds in MEASURED (clip id -> seconds) and nothing else needs editing.
// Gaps are weights: they are rescaled so the film lands on TARGET seconds whatever the voice speed turns out to be.
(function () {
  const WPS = 2.2;        // assumed spoken words per second for a slow, dry, older voice
  const TARGET = 208;     // 3:20, inside the 3:00-3:30 brief
  const LEAD_IN = 0.8, TAIL_AFTER_QUESTION = 1.4, TITLE_HOLD = 4.2, MIN_GAP = 0.6;
  const MEASURED = window.MEASURED_CLIPS || {}; // clip id -> seconds, from narration/measured.js

  // [id, scene, text, gap weight (seconds of silence wanted after the clip, before scaling)]
  const CLIPS = [
    ['c01', 1, 'A fighter is the part you photograph.', 1.5],
    ['c02', 1, 'The engine is the part you wait for.', 2],
    ['c03', 1, "India's Marut flew in nineteen sixty-one, and never got the engine it was designed for.", 1.5],
    ['c03b', 1, 'A handsome airframe, waiting politely for its heart.', 3],
    ['c04', 2, 'Idea one: squeeze.', 5],
    ['c05', 2, 'A compressor crushes air, stage after stage.', 3.5],
    ['c06', 2, 'One flawed blade, and it stalls. Physics is unsentimental.', 5],
    ['c07', 3, 'Idea two: heat.', 4.5],
    ['c08', 3, 'The gas burns hotter than the metal it strikes would melt.', 2],
    ['c09', 3, 'Single-crystal blades and a skin of cooling air keep them solid. Persuading metal to survive that is most of the job.', 5],
    ['c10', 4, 'Idea three: proof.', 4],
    ['c11', 4, 'An engine is thousands of test-stand hours before anyone trusts it in the sky.', 6],
    ['c12', 5, 'Now India.', 5],
    ['c13', 5, 'What it can do: Kaveri gave it nine prototype engines, over three thousand test hours, and a flight on a test aircraft.', 3],
    ['c14', 5, 'What it cannot yet do: power Tejas.', 2],
    ['c15', 5, 'Kaveri fell short of the thrust Tejas needed, so Tejas flies on American engines.', 3.5],
    ['c16', 5, 'Was the work wasted? No.', 1.5],
    ['c17', 5, 'Was the goal reached? Also no.', 1.5],
    ['c18', 5, 'Both can be true. Common in engineering. Rare in press releases.', 4],
    ['c19', 6, 'No league table, please.', 1.5],
    ['c20', 6, 'A few nations have built fighter engines across many generations.', 1.5],
    ['c21', 6, 'China joined them later.', 1],
    ['c22', 6, 'Others, India included, buy, licence-build, or co-develop.', 1.5],
    ['c23', 6, 'Different stages of one very long climb.', 5],
    ['c24', 7, 'A fiction: an alert, fighters on a runway.', 3],
    ['c25', 7, 'Engines decide who launches, who performs, who comes home.', 3],
    ['c26', 7, 'Spares decide who goes again tomorrow.', 5],
    ['c27', 8, 'One human habit: sunk cost, finishing a thing because you already paid for it.', 2],
    ['c28', 8, 'About two thousand crore rupees went into Kaveri.', 2],
    ['c29', 8, 'The past spend is no reason to continue, nor to stop.', 2],
    ['c30', 8, 'Only what the next rupee buys matters.', 5],
    ['c31', 9, 'India built the fighter.', 1],
    ['c32', 9, 'The engine is the harder half.', 2.5],
    ['c33', 9, 'Whose name will be on it?', 0],
  ];
  const SCENE_NAMES = ['THE FIGHTER', 'IDEA 1 · SQUEEZE', 'IDEA 2 · HEAT', 'IDEA 3 · PROOF', 'INDIA', 'THE FIELD', 'WHAT IF', 'SUNK COST', 'THE QUESTION'];

  const clips = CLIPS.map(([id, scene, text, gap]) => {
    const words = text.trim().split(/\s+/).length;
    return { id, scene, text, words, dur: MEASURED[id] || words / WPS, gapW: gap, gap: 0, start: 0 };
  });
  const voice = clips.reduce((s, c) => s + c.dur, 0);
  const gapBudget = TARGET - LEAD_IN - voice - TAIL_AFTER_QUESTION - TITLE_HOLD;
  const wsum = clips.reduce((s, c) => s + c.gapW, 0), k = gapBudget / wsum;
  let t = LEAD_IN;
  clips.forEach((c) => { c.gap = c.gapW ? Math.max(MIN_GAP, c.gapW * k) : 0; c.start = t; t += c.dur + c.gap; });

  const last = clips[clips.length - 1];
  const T = (window.TIMING = { WPS, TARGET, clips, SCENE_NAMES, gapScale: k, voiceSeconds: voice });
  T.byId = Object.fromEntries(clips.map((c) => [c.id, c]));
  T.END_VOICE = last.start + last.dur;
  T.TITLE_AT = T.END_VOICE + TAIL_AFTER_QUESTION;
  T.DURATION = Math.round((T.TITLE_AT + TITLE_HOLD) * 30) / 30;
  T.at = (id) => T.byId[id].start;
  T.sceneName = (n) => SCENE_NAMES[n - 1];
})();
