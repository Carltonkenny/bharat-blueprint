// Single source of truth for Episode 2 timing (v6 narration, 51 sentence clips, text identical to narration_v6.txt).
// Each clip is one sentence group generated and measured on its own, so the drawings can breathe between sentences.
// Clip lengths are ESTIMATED from word counts (WPS) until measured: narration/measured.js (clip id -> seconds) overrides them.
// Gaps are weights: they are rescaled so the film lands on TARGET seconds whatever the voice speed turns out to be.
(function () {
  const WPS = 2.69;       // spoken words per second after the 1.12x tempo-up (the voice reads about 2.4)
  const TARGET = 265;     // 4:25: "4 minutes and longer"
  const LEAD_IN = 0.8, TAIL_AFTER_QUESTION = 1.4, TITLE_HOLD = 4.2, MIN_GAP = 0.35;
  const MEASURED = window.MEASURED_CLIPS || {}; // clip id -> seconds, from narration/measured.js

  // [id, scene, text, gap weight (seconds of silence wanted after the clip, before scaling)]
  const CLIPS = [
    ['d01', 1, 'Here is a question. India can design and build a fighter jet.', 1],
    ['d02', 1, 'So why is the engine inside it so hard to build?', 1.5],
    ['d03', 1, 'Think of a car: a beautiful body is useless without a motor, and a fighter jet is the same.', 1.5],
    ['d04', 1, 'An engine does one simple thing. It throws air backwards, very fast, so the aircraft moves forward, like a balloon you let go.', 2],
    ['d05', 2, 'There is also a reason beyond engineering.', 1],
    ['d06', 2, 'A country that cannot build its own engines must ask someone else for them, and for repairs, and for delivery dates.', 1.5],
    ['d07', 2, "In November twenty twenty-five, India's HAL signed for one hundred and thirteen more American engines for the Tejas, arriving between twenty twenty-seven and twenty thirty-two.", 1.5],
    ['d08', 2, 'A fighter order is also an engine order.', 2],
    ['d09', 3, 'India tried this before.', 0.8],
    ['d10', 3, 'Its first home-built fighter, the Marut, flew in nineteen sixty-one, led by a German designer, Kurt Tank.', 1],
    ['d11', 3, 'But it never got the more powerful engine it was designed for.', 2],
    ['d12', 4, 'Idea one: squeeze.', 0.8],
    ['d13', 4, 'First, the engine pulls in air. Then it squeezes it.', 1.2],
    ['d14', 4, 'Think of a bicycle pump: the more you press, the harder the air pushes back.', 1.5],
    ['d15', 4, 'Rows of spinning blades do this, stage after stage.', 1.5],
    ['d16', 4, 'The catch: imagine a crowd squeezing through a door. If one person stumbles, everyone jams.', 1.5],
    ['d17', 4, 'One flawed blade does the same to the airflow, and the engine stalls.', 2],
    ['d18', 5, 'Idea two: heat.', 0.8],
    ['d19', 5, 'Next, fuel is sprayed into the squeezed air and burned, like a gas stove, only fiercer.', 1.5],
    ['d20', 5, 'The hot gas rushes past more blades, which spin the engine.', 1.5],
    ['d21', 5, 'But this gas is hotter than the metal would survive, like a spoon left in a candle flame.', 1.5],
    ['d22', 5, 'Two tricks help.', 0.8],
    ['d23', 5, 'Each blade is grown as a single crystal, like a chocolate bar in one piece, with no joins where cracks begin.', 1.5],
    ['d24', 5, 'And cool air flows from tiny holes, wrapping each blade in a cool blanket.', 2],
    ['d25', 6, 'Idea three: proof.', 0.8],
    ['d26', 6, 'You would not trust a new bicycle brake after one try.', 1.2],
    ['d27', 6, 'An engine runs on a test stand, then in a chamber that copies thin air, then on a flying test aircraft.', 1.5],
    ['d28', 6, 'Only after thousands of hours does anyone trust it with a pilot.', 2],
    ['d29', 7, 'Now, India.', 0.8],
    ['d30', 7, 'In nineteen eighty-nine, India began building its own fighter engine, Kaveri.', 1.5],
    ['d31', 7, 'It built nine prototypes, ran over three thousand test hours, and flew one on a test aircraft, a first for India.', 1.5],
    ['d32', 7, 'But it fell short of the thrust the Tejas needed, like a kite built for a lighter wind, so the Tejas flies on American F404 engines.', 1.5],
    ['d33', 7, 'Was the work wasted? No: its lessons now feed a version of the engine for an unmanned jet.', 1],
    ['d34', 7, 'Was the goal reached? Also no. Both are true.', 2],
    ['d35', 8, 'Think of baking a cake.', 0.6],
    ['d36', 8, 'Some countries buy the cake.', 0.6],
    ['d37', 8, "Some bake from someone else's recipe, called licence-building.", 0.6],
    ['d38', 8, 'Some write a recipe together. A few have written their own for decades.', 1.2],
    ['d39', 8, 'India has done the first three: it buys the F404, builds the AL-31FP under licence, and has announced a joint engine with France.', 1.5],
    ['d40', 8, 'These are stages of one climb, not a league table.', 2],
    ['d41', 9, 'A fictional morning: an alert sounds, and fighters wait on a runway.', 1.2],
    ['d42', 9, 'The engines must start, perform, and bring the aircraft home.', 1.2],
    ['d43', 9, 'Spares matter too. If only four of six aircraft have working engines, only four fly tomorrow.', 2],
    ['d44', 10, 'One idea about people: sunk cost.', 1],
    ['d45', 10, 'You paid for a movie ticket, the film is boring, and you stay because you paid.', 1.2],
    ['d46', 10, 'The money is gone either way.', 1.2],
    ['d47', 10, 'About two thousand crore rupees went into Kaveri. A crore is ten million, so that is about twenty billion rupees.', 1.5],
    ['d48', 10, 'It cannot decide the next step.', 1.2],
    ['d49', 10, 'Only what the next rupee buys matters.', 2],
    ['d50', 11, 'India built the fighter. The engine is the harder half.', 1.2],
    ['d51', 11, 'Whose name will be on it?', 0],
  ];
  const SCENE_NAMES = ['THE QUESTION', 'WHY IT MATTERS', 'THE MARUT', 'IDEA 1 · SQUEEZE', 'IDEA 2 · HEAT', 'IDEA 3 · PROOF', 'INDIA', 'THE FIELD', 'WHAT IF', 'SUNK COST', 'THE CLOSE'];

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
