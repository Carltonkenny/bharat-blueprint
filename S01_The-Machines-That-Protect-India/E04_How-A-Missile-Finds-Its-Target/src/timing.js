// Single source of truth for Episode 4 timing (42 sentence clips, text identical to narration_v1.txt).
// Each clip is one sentence group generated and measured on its own, so the drawings can breathe between sentences.
// Clip lengths are ESTIMATED from word counts (WPS) until measured: narration/measured.js (clip id -> seconds) overrides them.
// Gaps are weights: they are rescaled so the film lands on TARGET seconds whatever the voice speed turns out to be.
(function () {
  const WPS = 2.69;       // spoken words per second after the 1.12x tempo-up (the voice reads about 2.4)
  const TARGET = 293;     // estimated until the voice is measured
  const LEAD_IN = 0.8, TAIL_AFTER_QUESTION = 1.4, TITLE_HOLD = 4.2, MIN_GAP = 0.35;
  const MEASURED = window.MEASURED_CLIPS || {}; // clip id -> seconds, from narration/measured.js

  // [id, scene, text, gap weight (seconds of silence wanted after the clip, before scaling)]
  const CLIPS = [
    ['f01', 1, "We believe a missile is something a country simply buys.", 1],
    ['f02', 1, "It is not. A missile is a decision made in seconds, by a machine, that you will never see.", 1.5],
    ['f03', 1, "In Episode 3, a carrier carried the jets. This time, we look at the thing that keeps both of them safe.", 1.5],
    ['f04', 1, "How does a missile find its target?", 2],
    ['f05', 2, "There is a reason to care that is not about engineering.", 1],
    ['f06', 2, "In July nineteen eighty-three, India began a programme to build guided missiles of its own.", 1.2],
    ['f07', 2, "The Ministry of Defence itself lists denial of critical technologies and import embargoes among the reasons it ran late.", 1.5],
    ['f08', 2, "One of its missiles, Akash, was sanctioned at about ninety-five crore rupees in nineteen eighty-three. By two thousand seven, the sanction was five hundred and forty-eight crore.", 1.5],
    ['f09', 2, "That is more than five times the cost, and a completion date that slipped from nineteen ninety-five to two thousand seven.", 2],
    ['f10', 3, "To hit something, you must first know where it is. That is idea one: sense.", 0.8],
    ['f11', 3, "Think of shouting across a valley. You hear your own voice come back, and the delay tells you how far away the cliff is.", 1.5],
    ['f12', 3, "A radar does the same, with radio waves instead of a shout. It sends out a pulse, waits for the echo, and measures the time.", 1.5],
    ['f13', 3, "Before the echo, there is only empty sky. After it, there is a point on a screen: a place, and a direction.", 2],
    ['f14', 4, "But knowing is not enough. You must aim where it will be. That is idea two: decide.", 0.8],
    ['f15', 4, "Think of catching a ball. You do not reach for where the ball is. You move to where it will land.", 1.5],
    ['f16', 4, "A missile's computer does the same sum, again and again, many times a second, as the target moves.", 1.5],
    ['f17', 4, "Before the sum, the missile only knows the past. After it, it has a path through the future.", 2],
    ['f18', 5, "And a decision is useless until the body obeys. That is idea three: steer.", 0.8],
    ['f19', 5, "Think of steering a bicycle. A small turn of the handlebar, and the whole bike leans into the curve.", 1.5],
    ['f20', 5, "A missile also steers with small movements. Air pushes on them, and the whole missile turns.", 1.5],
    ['f21', 5, "Sense, decide, steer. Three jobs, repeated until the missile and its target meet.", 2],
    ['f22', 6, "Now, India. Under that same programme, India designed Trishul, Akash and Nag, three missiles for three different jobs.", 1.2],
    ['f23', 6, "That is what India can do: design, build and test missile families of its own.", 1.2],
    ['f24', 6, "What it cannot yet do is finish the shield. Mission Sudarshan Chakra, announced in August twenty twenty-five, aims at a national security shield by twenty thirty-five.", 1.5],
    ['f25', 6, "A government statement describes it as a multi-level system with three layers of protection. An aim is not an achievement. It is a deadline with a name.", 2],
    ['f26', 7, "Think of finding a friend in the dark.", 0.6],
    ['f27', 7, "You can call out and listen for the echo. That is how radar works.", 0.6],
    ['f28', 7, "You can look for their body heat. That is how a heat seeker works.", 0.6],
    ['f29', 7, "Or you can watch for a bright jacket. That is how a camera guides.", 1.2],
    ['f30', 7, "Each way works best in some conditions and worst in others. These are tools, not ranks.", 2],
    ['f31', 8, "A fictional afternoon: a radar screen shows a dot where no dot should be.", 1.2],
    ['f32', 8, "Within seconds the system must decide: friend, or not.", 1.2],
    ['f33', 8, "A shield is not one machine. It is a chain, and every link must answer in time.", 2],
    ['f34', 9, "One idea about people: hindsight bias.", 1],
    ['f35', 9, "After you know the answer, it always looks obvious. You say you knew it all along.", 1.2],
    ['f36', 9, "Looking back, the road from denial to design looks like a straight line. At the time, nobody could be sure it would reach the end.", 1.5],
    ['f37', 9, "So when you hear about a shield by twenty thirty-five, remember how uncertain the first road was.", 2],
    ['f38', 10, "Three things to remember.", 1],
    ['f39', 10, "A programme begun in nineteen eighty-three, under denial, is the base of today's shield.", 1],
    ['f40', 10, "A missile does three jobs: sense, decide, steer.", 1],
    ['f41', 10, "And a shield is a chain, so its weakest link sets its strength.", 2],
    ['f42', 10, "India built the missiles. Now the question is the chain: which link will be finished last?", 0],
  ];
  const SCENE_NAMES = ['THE QUESTION', 'WHY IT MATTERS', 'IDEA 1 · SENSE', 'IDEA 2 · DECIDE', 'IDEA 3 · STEER', 'INDIA', 'THE FIELD', 'WHAT IF', 'THE HABIT', 'THE CLOSE'];

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
