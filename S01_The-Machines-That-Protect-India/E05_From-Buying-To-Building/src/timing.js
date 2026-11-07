// Single source of truth for Episode 5 timing (40 sentence clips, text identical to narration_v1.txt).
// Each clip is one sentence group generated and measured on its own, so the drawings can breathe between sentences.
// Clip lengths are ESTIMATED from word counts (WPS) until measured: narration/measured.js (clip id -> seconds) overrides them.
// Gaps are weights: they are rescaled so the film lands on TARGET seconds whatever the voice speed turns out to be.
(function () {
  const WPS = 2.69;       // spoken words per second after the 1.12x tempo-up (the voice reads about 2.4)
  const TARGET = 314;     // estimated until the voice is measured
  const LEAD_IN = 0.8, TAIL_AFTER_QUESTION = 1.4, TITLE_HOLD = 4.2, MIN_GAP = 0.35;
  const MEASURED = window.MEASURED_CLIPS || {}; // clip id -> seconds, from narration/measured.js

  // [id, scene, text, gap weight (seconds of silence wanted after the clip, before scaling)]
  const CLIPS = [
    ['g01', 1, "We believe India buys its weapons. Some of it does. But look at what is being made.", 1],
    ['g02', 1, "In Episode 4, we saw how a defence system senses, decides and steers. This time, we ask a plainer question: who makes the thing?", 1.5],
    ['g03', 1, "Not who designs it. Who makes the thousands of parts, in thousands of workshops, and makes them well enough to trust?", 1.5],
    ['g04', 1, "That is the story of how a country goes from buying to building.", 2],
    ['g05', 2, "There is a reason to care that is not about engineering.", 1],
    ['g06', 2, "In twenty fourteen to fifteen, India's defence production was about forty-six thousand crore rupees.", 1.2],
    ['g07', 2, "In twenty twenty-five to twenty-six, it was one point seven eight lakh crore.", 1.2],
    ['g08', 2, "A lakh crore is a trillion rupees. So that is one point seven eight trillion rupees, a record, the government said in June.", 2],
    ['g09', 3, "To see where that money goes, we need three ideas. Idea one: many small makers make one machine.", 0.8],
    ['g10', 3, "Think of a car. It is not built in one workshop. Hundreds of small shops make the seats, the glass and the screws, and one factory puts them together.", 1.5],
    ['g11', 3, "A defence machine is the same. About sixteen thousand small and medium businesses are part of India's defence industry.", 1.5],
    ['g12', 3, "Picture a web, with a big factory at the centre and small makers around it, each doing one thing well.", 2],
    ['g13', 4, "Idea two: nothing ships until it passes. We tell you this because a thousand parts are only as good as the worst one.", 0.8],
    ['g14', 4, "Think of school exams. You do not move up because you tried. You move up because you passed.", 1.5],
    ['g15', 4, "Every part is tested against a standard, and the whole machine is tested again. This is the proof idea from Episode 2, only now it runs in every workshop.", 2],
    ['g16', 5, "Idea three: making one is not the same as making a thousand. Why does that matter? Because a defence force needs thousands, on time.", 0.8],
    ['g17', 5, "Think of baking. One cake at home is a hobby. A thousand cakes a day is a bakery, with ovens, shifts and a steady supply of flour.", 1.5],
    ['g18', 5, "To scale, a country needs factories, trained workers and a steady flow of orders. In twenty twenty-four to twenty-five, the government signed a record one hundred and ninety-three defence contracts, worth more than two lakh crore rupees, and about ninety-two percent went to domestic industry.", 2],
    ['g19', 6, "Now, the part that is not engineering.", 1],
    ['g20', 6, "In twenty twenty-five to twenty-six, India's defence exports reached a record thirty-eight thousand four hundred and twenty-four crore rupees.", 1.2],
    ['g21', 6, "In twenty fourteen, the same exports were under two thousand crore. That is more than nineteen times as much.", 1.5],
    ['g22', 6, "Here the small-base effect matters. When you start from almost nothing, any growth looks enormous.", 1.5],
    ['g23', 6, "So hold two numbers together. Exports are about a fifth of what India produces. That is real growth from a small start, and still a long way from the whole.", 2],
    ['g24', 7, "What India can do: produce at a record level, with thousands of small makers, and, the Defence Minister says, reach more than eighty countries.", 1.5],
    ['g25', 7, "What it cannot yet do: reach its own targets. The aim for twenty twenty-nine is three lakh crore in production and fifty thousand crore in exports.", 1.5],
    ['g26', 7, "A target is not a result. Between today and that aim, there are about three years.", 2],
    ['g27', 8, "Think back to the cake in Episode 2.", 0.6],
    ['g28', 8, "A country can buy the cake, bake from someone else's recipe, write a recipe together, or write its own.", 0.6],
    ['g29', 8, "Countries often mix all four, for different parts, at different times.", 1.2],
    ['g30', 8, "Building more at home does not mean buying nothing. It means choosing what to buy, and why.", 2],
    ['g31', 9, "A fictional Sunday: a small part fails on a ship far from port.", 1.2],
    ['g32', 9, "If a workshop nearby makes that part, a replacement can arrive by morning. If not, it waits for a delivery.", 1.5],
    ['g33', 9, "A factory floor is part of the defence. It just does not look like one.", 2],
    ['g34', 10, "One idea about people: we trust big multiples.", 1],
    ['g35', 10, "Nineteen times sounds like a victory. The honest question is always: nineteen times what?", 1.5],
    ['g36', 10, "Ask it of every record you hear, including the ones in this series.", 2],
    ['g37', 11, "Five episodes, one chain.", 1],
    ['g38', 11, "An air defence system, a fighter engine, a floating airport, a defence that senses and decides, and the workshops under all of them.", 1.5],
    ['g39', 11, "In each one, India has built a great deal, and has something left to build.", 1.5],
    ['g40', 11, "India has learned to build. The question for the next decade: what will it choose never to buy again?", 0],
  ];
  const SCENE_NAMES = ['THE QUESTION', 'WHY IT MATTERS', 'IDEA 1 · MANY MAKERS', 'IDEA 2 · THE PASS', 'IDEA 3 · SCALE', 'THE NUMBERS', 'INDIA', 'THE FIELD', 'WHAT IF', 'THE HABIT', 'THE CLOSE'];

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
