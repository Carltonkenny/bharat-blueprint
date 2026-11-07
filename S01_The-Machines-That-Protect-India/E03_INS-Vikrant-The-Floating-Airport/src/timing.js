// Single source of truth for Episode 3 timing (51 sentence clips, text identical to narration_v1.txt).
// Each clip is one sentence group generated and measured on its own, so the drawings can breathe between sentences.
// Clip lengths are ESTIMATED from word counts (WPS) until measured: narration/measured.js (clip id -> seconds) overrides them.
// Gaps are weights: they are rescaled so the film lands on TARGET seconds whatever the voice speed turns out to be.
(function () {
  const WPS = 2.69;       // spoken words per second after the 1.12x tempo-up (the voice reads about 2.4)
  const TARGET = 290;     // about 4:50
  const LEAD_IN = 0.8, TAIL_AFTER_QUESTION = 1.4, TITLE_HOLD = 4.2, MIN_GAP = 0.35;
  const MEASURED = window.MEASURED_CLIPS || {}; // clip id -> seconds, from narration/measured.js

  // [id, scene, text, gap weight (seconds of silence wanted after the clip, before scaling)]
  const CLIPS = [
    ['e01', 1, "A runway is the one thing that is supposed to stay still.", 1],
    ['e02', 1, "So how do you build an airport that moves?", 1.5],
    ['e03', 1, "Think of a bus: you can walk around inside it while it drives.", 1.2],
    ['e04', 1, "INS Vikrant is the same idea, but the bus is a warship, and the passengers are fighter jets.", 2],
    ['e05', 2, "There is a reason to care that is not about engineering.", 1],
    ['e06', 2, "About ninety-five percent of India's trade by volume, and about seventy percent by value, travels by sea.", 1.5],
    ['e07', 2, "Far from land, the only airfield is the one a ship carries with it.", 1.5],
    ['e08', 2, "And on the twenty-ninth of October twenty twenty-six, the Indian Navy said a French-built Rafale M jet landed on Vikrant on its first attempt.", 2],
    ['e09', 3, "Idea one: the ramp.", 0.8],
    ['e10', 3, "A jet needs a long run to reach flying speed, but this ship is only two hundred and sixty-two metres long.", 1.2],
    ['e11', 3, "So the front of the deck curves upward, like a ski jump.", 1.2],
    ['e12', 3, "Think of riding a bicycle fast up a ramp: the ramp does not push you, it points your speed upwards.", 1.5],
    ['e13', 3, "The jet's own engines do the pushing, and the ramp turns that speed into a climb.", 2],
    ['e14', 4, "Idea two: the wire.", 0.8],
    ['e15', 4, "Landing is the harder half, because the deck is short and it is moving.", 1.2],
    ['e16', 4, "So the jet drops a hook at its tail, like a coat hook, and catches one of three wires stretched across the deck.", 1.5],
    ['e17', 4, "Think of running into a stretched elastic rope: you slow down smoothly, instead of crashing.", 1.5],
    ['e18', 4, "If the hook misses, the pilot opens the engines and flies off to try again.", 2],
    ['e19', 5, "Idea three: a floating town.", 0.8],
    ['e20', 5, "The ship is also a power station, a workshop, a fuel store and a home for about sixteen hundred people.", 1.5],
    ['e21', 5, "Four gas turbines make about eighty-eight megawatts, enough electricity for about five thousand households.", 1.5],
    ['e22', 5, "Lifts bring jets up from the hangar below, like a lift in a tall building bringing shopping up to your floor.", 2],
    ['e23', 6, "Now, the part that is not engineering.", 1],
    ['e24', 6, "The keel was laid in February two thousand nine, and the ship was delivered in July twenty twenty-two.", 1.2],
    ['e25', 6, "That is thirteen years and five months, across three separate contracts.", 1.5],
    ['e26', 6, "It cost close to twenty thousand crore rupees.", 1],
    ['e27', 6, "A crore is ten million, so that is about two hundred billion rupees.", 1.5],
    ['e28', 6, "About two thousand people built it directly, and twelve and a half thousand more worked on it indirectly.", 2],
    ['e29', 7, "What India can do: design and build a forty-five-thousand-tonne carrier, with seventy-six percent indigenous content, and land fighters on it.", 1.5],
    ['e30', 7, "What it cannot yet do: launch heavier aircraft with a catapult, or fly a carrier fighter of its own design.", 1.5],
    ['e31', 7, "So it ordered twenty-six Rafale M jets from France.", 2],
    ['e32', 8, "Think of a ball.", 0.6],
    ['e33', 8, "You can roll it up a slope, which is a ski jump.", 0.6],
    ['e34', 8, "You can hit it with a bat, which is a catapult.", 0.6],
    ['e35', 8, "Or you can throw it straight up, which is a vertical take-off.", 1.2],
    ['e36', 8, "The United States and France use catapults. Britain uses a ski jump with jets that land vertically. India uses a ski jump with arrested landing.", 1.5],
    ['e37', 8, "Different tools for different jobs, not a league table.", 2],
    ['e38', 9, "A fictional morning at sea: a cargo ship far from land calls for help.", 1.2],
    ['e39', 9, "A carrier brings aircraft that watch the sea, helicopters that rescue, and a control room that ties it together.", 1.5],
    ['e40', 9, "It is not a magic shield.", 0.8],
    ['e41', 9, "Everything runs on fuel, spare parts and trained crew, and all of it must be carried along.", 2],
    ['e42', 10, "One idea about people: the planning fallacy.", 1],
    ['e43', 10, "You say you will be ready in ten minutes, and it takes thirty, because you imagined nothing going wrong.", 1.5],
    ['e44', 10, "Big projects do the same.", 1],
    ['e45', 10, "This ship has about two thousand two hundred compartments, and every one of them had to work.", 2],
    ['e46', 11, "Three things to remember.", 1],
    ['e47', 11, "Most of India's trade rides on the sea.", 1],
    ['e48', 11, "A carrier took thirteen years from keel to delivery.", 1],
    ['e49', 11, "And about fourteen and a half thousand jobs went into building it.", 2],
    ['e50', 11, "India built the ship.", 1],
    ['e51', 11, "Now the question is the aircraft: who will build the jets that land on it?", 0],
  ];
  const SCENE_NAMES = ['THE QUESTION', 'WHY IT MATTERS', 'IDEA 1 · THE RAMP', 'IDEA 2 · THE WIRE', 'IDEA 3 · THE TOWN', 'THE LONG BUILD', 'INDIA', 'THE FIELD', 'WHAT IF', 'PLANNING', 'THE CLOSE'];

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
