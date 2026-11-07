const fs = require('fs');
process.chdir('C:/Users/user/OneDrive/Desktop/films and ads/india-defence-series/ep03-ins-vikrant');
const clips = [
  [1, 'A runway is the one thing that is supposed to stay still.', 1],
  [1, 'So how do you build an airport that moves?', 1.5],
  [1, 'Think of a bus: you can walk around inside it while it drives.', 1.2],
  [1, 'INS Vikrant is the same idea, but the bus is a warship, and the passengers are fighter jets.', 2],
  [2, 'There is a reason to care that is not about engineering.', 1],
  [2, "About ninety-five percent of India's trade by volume, and about seventy percent by value, travels by sea.", 1.5],
  [2, 'Far from land, the only airfield is the one a ship carries with it.', 1.5],
  [2, 'And on the twenty-ninth of October twenty twenty-six, the Indian Navy said a French-built Rafale M jet landed on Vikrant on its first attempt.', 2],
  [3, 'Idea one: the ramp.', 0.8],
  [3, 'A jet needs a long run to reach flying speed, but this ship is only two hundred and sixty-two metres long.', 1.2],
  [3, 'So the front of the deck curves upward, like a ski jump.', 1.2],
  [3, 'Think of riding a bicycle fast up a ramp: the ramp does not push you, it points your speed upwards.', 1.5],
  [3, "The jet's own engines do the pushing, and the ramp turns that speed into a climb.", 2],
  [4, 'Idea two: the wire.', 0.8],
  [4, 'Landing is the harder half, because the deck is short and it is moving.', 1.2],
  [4, 'So the jet drops a hook at its tail, like a coat hook, and catches one of three wires stretched across the deck.', 1.5],
  [4, 'Think of running into a stretched elastic rope: you slow down smoothly, instead of crashing.', 1.5],
  [4, 'If the hook misses, the pilot opens the engines and flies off to try again.', 2],
  [5, 'Idea three: a floating town.', 0.8],
  [5, 'The ship is also a power station, a workshop, a fuel store and a home for about sixteen hundred people.', 1.5],
  [5, 'Four gas turbines make about eighty-eight megawatts, enough electricity for about five thousand households.', 1.5],
  [5, 'Lifts bring jets up from the hangar below, like a lift in a tall building bringing shopping up to your floor.', 2],
  [6, 'Now, the part that is not engineering.', 1],
  [6, 'The keel was laid in February two thousand nine, and the ship was delivered in July twenty twenty-two.', 1.2],
  [6, 'That is thirteen years and five months, across three separate contracts.', 1.5],
  [6, 'It cost close to twenty thousand crore rupees.', 1],
  [6, 'A crore is ten million, so that is about two hundred billion rupees.', 1.5],
  [6, 'About two thousand people built it directly, and twelve and a half thousand more worked on it indirectly.', 2],
  [7, 'What India can do: design and build a forty-five-thousand-tonne carrier, with seventy-six percent indigenous content, and land fighters on it.', 1.5],
  [7, 'What it cannot yet do: launch heavier aircraft with a catapult, or fly a carrier fighter of its own design.', 1.5],
  [7, 'So it ordered twenty-six Rafale M jets from France.', 2],
  [8, 'Think of a ball.', 0.6],
  [8, 'You can roll it up a slope, which is a ski jump.', 0.6],
  [8, 'You can hit it with a bat, which is a catapult.', 0.6],
  [8, 'Or you can throw it straight up, which is a vertical take-off.', 1.2],
  [8, 'The United States and France use catapults. Britain uses a ski jump with jets that land vertically. India uses a ski jump with arrested landing.', 1.5],
  [8, 'Different tools for different jobs, not a league table.', 2],
  [9, 'A fictional morning at sea: a cargo ship far from land calls for help.', 1.2],
  [9, 'A carrier brings aircraft that watch the sea, helicopters that rescue, and a control room that ties it together.', 1.5],
  [9, 'It is not a magic shield.', 0.8],
  [9, 'Everything runs on fuel, spare parts and trained crew, and all of it must be carried along.', 2],
  [10, 'One idea about people: the planning fallacy.', 1],
  [10, 'You say you will be ready in ten minutes, and it takes thirty, because you imagined nothing going wrong.', 1.5],
  [10, 'Big projects do the same.', 1],
  [10, 'This ship has about two thousand two hundred compartments, and every one of them had to work.', 2],
  [11, 'Three things to remember.', 1],
  [11, "Most of India's trade rides on the sea.", 1],
  [11, 'A carrier took thirteen years from keel to delivery.', 1],
  [11, 'And about fourteen and a half thousand jobs went into building it.', 2],
  [11, 'India built the ship.', 1.8],
  [11, 'Now the question is the aircraft: who will build the jets that land on it?', 0],
];
const id = (n) => 'e' + String(n).padStart(2, '0');
const rows = clips.map((c, i) => `    ['${id(i + 1)}', ${c[0]}, ${JSON.stringify(c[1])}, ${c[2]}],`).join('\n');
let t = fs.readFileSync('src/timing.js', 'utf8');
t = t.replace(/const CLIPS = \[[\s\S]*?\n  \];/, () => 'const CLIPS = [\n' + rows + '\n  ];');
t = t.replace(/const SCENE_NAMES = \[[^\]]*\];/, () => "const SCENE_NAMES = ['THE QUESTION', 'WHY IT MATTERS', 'IDEA 1 · THE RAMP', 'IDEA 2 · THE WIRE', 'IDEA 3 · THE TOWN', 'THE LONG BUILD', 'INDIA', 'THE FIELD', 'WHAT IF', 'PLANNING', 'THE CLOSE'];");
t = t.replace(/const TARGET = \d+;[^\n]*/, 'const TARGET = 290;     // about 4:50');
t = t.replace('Episode 2 timing (v6 narration, 51 sentence clips, text identical to narration_v6.txt)', 'Episode 3 timing (51 sentence clips, text identical to narration_v1.txt)');
fs.writeFileSync('src/timing.js', t);
let out = '', last = 0;
clips.forEach((c) => { if (last && c[0] !== last) out += '\n\n'; else if (last) out += ' '; out += c[1]; last = c[0]; });
fs.writeFileSync('narration_v1.txt', out + '\n');
const F = "{ tr: 'fade', d: 0.5 }", Wp = "{ tr: 'wipe', d: 0.9 }";
const A = (n) => `at('e${String(n).padStart(2, '0')}')`;
const beats = [
  ['1.1', '0', '{ frac: 0.7 }'], ['1.2', A(2), F], ['1.3', A(3), F], ['1.4', A(4), F],
  ['2.1', A(5), Wp], ['2.2', A(7), F], ['2.3', A(8), F],
  ['3.1', A(9), Wp], ['3.bike', A(12), F], ['3.2', A(13), F],
  ['4.1', A(14), Wp], ['4.2', A(16), F], ['4.rope', A(17), F], ['4.3', A(18), F],
  ['5.1', A(19), Wp], ['5.2', A(21), F], ['5.3', A(22), F],
  ['6.1', A(23), Wp], ['6.2', A(25), F], ['6.3', A(26), F], ['6.4', A(28), F],
  ['7.1', A(29), Wp], ['7.2', A(30), F],
  ['8.ball', A(32), "{ tr: 'wipe', d: 0.9, keys: [K('e32', 0, 0), K('e33', 0, 0.2), K('e34', 0, 0.45), K('e35', 0, 0.68), K('e35', D('e35'), 1)] }"],
  ['8.1', A(36), F], ['8.2', A(37), F],
  ['9.1', A(38), Wp], ['9.2', A(39), F], ['9.3', A(40), F],
  ['10.1', A(42), Wp], ['10.2', A(44), F],
  ['11.1', A(46), "{ tr: 'wipe', d: 0.9, keys: [K('e46', 0, 0), K('e47', 0, 0.28), K('e48', 0, 0.55), K('e49', 0, 0.8), K('e49', D('e49') * 0.9, 1)] }"],
  ['11.2', A(50), F], ['11.3', A(51), F], ['11.4', 'TM.TITLE_AT', "{ tr: 'fade', d: 0.6, frac: 0.5 }"],
];
const body = beats.map(([b, t0, o]) => `    B('${b}', ${t0}, ${o}),`).join('\n');
let f = fs.readFileSync('src/film.js', 'utf8');
f = f.replace(/const BEATS = \(window\.BEATS = \[[\s\S]*?\n  \]\);/, () => 'const BEATS = (window.BEATS = [\n' + body + '\n  ]);');
fs.writeFileSync('src/film.js', f);
let h = fs.readFileSync('index.html', 'utf8');
h = h.replace('<script src="src/panels.js"></script>\n<script src="src/examples.js"></script>', '<script src="src/ep3.js"></script>').replace(/data-duration="[\d.]+"/, 'data-duration="290"');
fs.writeFileSync('index.html', h);
fs.writeFileSync('narration/measured.js', 'window.MEASURED_CLIPS = {};\n');
let e = fs.readFileSync('build/test-engine.mjs', 'utf8');
e = e.replace(/narration_v6\.txt/g, 'narration_v1.txt').replace('TM.DURATION >= 240 && TM.DURATION <= 285', 'TM.DURATION >= 240 && TM.DURATION <= 305').replace('4:00-4:45', '4:00-5:05').replace('words >= 500 && words <= 700', 'words >= 500 && words <= 720');
fs.writeFileSync('build/test-engine.mjs', e);
let a = fs.readFileSync('build/make-audio.mjs', 'utf8');
a = a.replace(/\{ const d34 = [^\n]*\n/, '\n');
fs.writeFileSync('build/make-audio.mjs', a);
const P = [];
for (let i = 0, n = 1; i < clips.length; i += 3, n++) P.push(['P' + String(n).padStart(2, '0'), ...clips.slice(i, i + 3).map((_, k) => id(i + k + 1))]);
let s = fs.readFileSync('build/split-passages.mjs', 'utf8');
const pb = 'const PASSAGES = {\n' + P.map((r) => `  ${r[0]}: [${r.slice(1).map((x) => "'" + x + "'").join(', ')}],`).join('\n') + '\n};';
s = s.replace(/const PASSAGES = \{[\s\S]*?\n\};/, () => pb).split('(d\\d+)').join('(e\\d+)');
fs.writeFileSync('build/split-passages.mjs', s);
fs.writeFileSync('narration/passages.json', JSON.stringify(P.map((r) => ({ id: r[0], clips: r.slice(1), text: '[calm] ' + r.slice(1).map((c) => clips[+c.slice(1) - 1][1]).join(' [long pause] [long pause] ') })), null, 1));
console.log('done', clips.length, 'clips', P.length, 'passages');
