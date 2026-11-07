// Generates timing, beats, narration text, voice plan and wiring for one episode from its spec.cjs. usage: node build/gen-episode.cjs <episodeDir>
// spec: { ep, label, panels, prefix, target, sceneNames, clips: [[scene, text, gapWeight]], beats: [[id, anchorExpr, optionsExpr]], voice: {...} }
const fs = require('fs');
const path = require('path');
const dir = path.resolve(process.argv[2] || '.');
process.chdir(dir);
const spec = require(path.join(dir, 'spec.cjs'));
const id = (n) => spec.prefix + String(n).padStart(2, '0');
const read = (f) => fs.readFileSync(f, 'utf8');
const write = (f, s) => fs.writeFileSync(f, s);

// ---- timing.js ----
const rows = spec.clips.map((c, i) => `    ['${id(i + 1)}', ${c[0]}, ${JSON.stringify(c[1])}, ${c[2]}],`).join('\n');
let t = read('src/timing.js');
t = t.replace(/const CLIPS = \[[\s\S]*?\n  \];/, () => 'const CLIPS = [\n' + rows + '\n  ];')
  .replace(/const SCENE_NAMES = \[[^\]]*\];/, () => 'const SCENE_NAMES = ' + JSON.stringify(spec.sceneNames).replace(/"/g, "'").replace(/,'/g, ", '") + ';')
  .replace(/const TARGET = \d+;[^\n]*/, `const TARGET = ${spec.target};     // estimated until the voice is measured`)
  .replace(/Episode \d timing \([^)]*\)/, `Episode ${spec.ep} timing (${spec.clips.length} sentence clips, text identical to narration_v1.txt)`);
write('src/timing.js', t);

// ---- narration text: paragraph per scene ----
let out = '', last = 0;
spec.clips.forEach((c) => { if (last && c[0] !== last) out += '\n\n'; else if (last) out += ' '; out += c[1]; last = c[0]; });
write('narration_v1.txt', out + '\n');

// ---- beats ----
const body = spec.beats.map(([b, anchor, o]) => `    B('${b}', ${anchor}, ${o || "{ tr: 'fade', d: 0.5 }"}),`).join('\n');
let f = read('src/film.js');
f = f.replace(/const BEATS = \(window\.BEATS = \[[\s\S]*?\n  \]\);/, () => 'const BEATS = (window.BEATS = [\n' + body + '\n  ]);').replace(/EP0\d · /, `${spec.label} · `);
write('src/film.js', f);

// ---- index.html ----
let h = read('index.html');
h = h.replace(/<script src="src\/motion\.js"><\/script>[\s\S]*?<script src="narration\/measured\.js"><\/script>/, `<script src="src/motion.js"></script>\n<script src="src/vehicles.js"></script>\n<script src="src/kit.js"></script>\n<script src="src/${spec.panels}"></script>\n<script src="narration/measured.js"></script>`)
  .replace(/data-duration="[\d.]+"/, `data-duration="${spec.target}"`).replace(/machines-ep0\d/, `machines-ep0${spec.ep}`);
write('index.html', h);

// ---- test ranges ----
let e = read('build/test-engine.mjs');
e = e.replace(/words >= \d+ && words <= \d+/, `words >= ${spec.words[0]} && words <= ${spec.words[1]}`).replace(/TM\.DURATION >= \d+ && TM\.DURATION <= \d+/, `TM.DURATION >= ${spec.duration[0]} && TM.DURATION <= ${spec.duration[1]}`);
write('build/test-engine.mjs', e);

// ---- voice plan (no generation): passages of three clips, credit estimate from Episode 2 and 3 actuals (about 6.9 credits per word) ----
const passages = [];
for (let i = 0; i < spec.clips.length; i += 3) passages.push({ id: 'P' + String(passages.length + 1).padStart(2, '0'), clips: spec.clips.slice(i, i + 3).map((_, k) => id(i + k + 1)), text: '[calm] ' + spec.clips.slice(i, i + 3).map((c) => c[1]).join(' [long pause] [long pause] ') });
const words = out.split(/\s+/).filter(Boolean).length;
write('narration/voice-plan.json', JSON.stringify({ voice: 'Daniel htZQqY7WtacRNV7s62Iy', model: 'eleven_v4', tempo: 1.12, status: 'NOT GENERATED', words, passages: passages.length, estimatedCredits: Math.round(words * 6.9), takesPerPassage: 1, passagesDetail: passages }, null, 1));
console.log(`episode ${spec.ep}: ${spec.clips.length} clips, ${words} words, ${passages.length} passages, about ${Math.round(words * 6.9)} credits when you approve the voice`);
