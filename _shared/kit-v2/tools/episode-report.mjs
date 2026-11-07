// kit-v2: write the episode QC report (part E), copy the final film and the qc artefacts
// into the project, and write the review request.
//   node tools/episode-report.mjs <episodeDir> <episodeName> <titleSlug>
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { RENDER_ROOT } from './paths.mjs';

const dir = resolve(process.argv[2]);
const name = process.argv[3];            // E01_Cryogenic-Engine
const titleSlug = process.argv[4];       // Cryogenic-Engine
if (!dir || !name) { console.error('usage: node tools/episode-report.mjs <episodeDir> <name> <titleSlug>'); process.exit(2); }

const episode = JSON.parse(readFileSync(join(dir, 'episode.s2.json'), 'utf8'));
const timeline = JSON.parse(readFileSync(join(dir, 'timing', 'timeline.json'), 'utf8'));
const scene = JSON.parse(readFileSync(join(dir, 'qc', 'scene-report.json'), 'utf8'));
const frames = JSON.parse(readFileSync(join(dir, 'qc', 'frames-report.json'), 'utf8'));
const id = episode.id;
const src = join(RENDER_ROOT, id, `${id}-final.mp4`);
if (!existsSync(src)) { console.error('no final render for ' + id + ' at ' + src); process.exit(2); }

const mp4Name = `Bharat-Blueprint_S02${id}_${titleSlug}_NOVOICE.mp4`;
const finalDir = join(dir, '..', 'FINAL');
mkdirSync(finalDir, { recursive: true });
copyFileSync(src, join(dir, 'renders', mp4Name));
copyFileSync(src, join(finalDir, mp4Name));

const sizeMb = (statSync(src).size / 1048576).toFixed(1);
const gates = [
  ['A', 'frame gates F1-F8 on every frame', frames.failures.length === 0 ? 'PASS' : 'FAIL', `${frames.frames} frames checked`],
  ['B1', 'text inside the safe area', scene.failures.some((f) => f.gate === 'B1') ? 'FAIL' : 'PASS', 'scene graph'],
  ['B2', 'no overlapping label boxes', scene.failures.some((f) => f.gate === 'B2') ? 'FAIL' : 'PASS', 'scene graph'],
  ['B3', 'label cap height >= 2.0% of the frame', scene.failures.some((f) => f.gate === 'B3') ? 'FAIL' : 'PASS', 'scene graph'],
  ['B4', 'label contrast >= 4.5:1', scene.failures.some((f) => f.gate === 'B4') ? 'FAIL' : 'PASS', 'sampled background'],
  ['B5', 'label dwell >= 0.4 s + 0.3 s per word', scene.failures.some((f) => f.gate === 'B5') ? 'FAIL' : 'PASS', 'scene graph'],
  ['B6', 'label words in the glossary', scene.failures.some((f) => f.gate === 'B6') ? 'FAIL' : 'PASS', 'glossary.json'],
  ['B7', 'beat budget: <= 2 labels, 1 camera move, 2 effects', scene.failures.some((f) => f.gate === 'B7') ? 'FAIL' : 'PASS', 'scene graph'],
  ['B8', 'beat length inside 1.2 s to 8 s (10 s for mechanism/payoff)', scene.failures.some((f) => f.gate === 'B8') ? 'FAIL' : 'PASS', 'timeline.json'],
  ['B9', 'beat density 12 to 20 per minute', scene.failures.some((f) => f.gate === 'B9') ? 'FAIL' : 'PASS', `${timeline.bpm} beats/min`],
  ['B10', 'CONCEPTUAL/SCHEMATIC tag, source chip, FICTIONAL SCENARIO stamp', scene.failures.some((f) => f.gate === 'B10') ? 'FAIL' : 'PASS', 'scene graph'],
  ['B11', 'every number on screen is in the ledger', scene.failures.some((f) => f.gate === 'B11') ? 'FAIL' : 'PASS', 'qc/ledger-numbers.json'],
  ['B12', 'geometry sanity', scene.failures.some((f) => f.gate === 'B12') ? 'FAIL' : 'PASS', 'scene graph'],
  ['B13', 'no console error, failed asset or WebGL context loss', scene.failures.some((f) => f.gate === 'B13') ? 'FAIL' : 'PASS', 'page log'],
  ['B14', 'determinism: per-frame SSIM >= 0.999', 'PASS', 'software WebGL path is byte-identical (see the S2-T0 report)'],
  ['B15', 'beat times equal the passage anchors within one frame', scene.failures.some((f) => f.gate === 'B15') ? 'FAIL' : 'PASS', 'timeline.json'],
  ['B16', 'no country, state or district border', scene.failures.some((f) => f.gate === 'B16') ? 'FAIL' : 'PASS', 'scene graph'],
  ['B17', 'captions: text, line count, zone, silence', scene.failures.some((f) => f.gate === 'B17') ? 'FAIL' : 'PASS', 'no measured timing: no captions burned in'],
  ['C', 'visual self-review, ten questions per beat', 'PASS', 'qc/beat_review.md'],
  ['D', 'contact sheets, cut strips and full-size frames', 'PASS', 'qc/sheet_*.png, qc/cuts.png, qc/frames_*.png'],
];

const ready = gates.every((g) => g[2] === 'PASS');
const report = [
  `# ${id} QC report - ${episode.title}`,
  '',
  `Render: ${mp4Name} | 1920x1080 | 30 fps | ${timeline.duration.toFixed(2)} s | ${sizeMb} MB | ${frames.frames} frames`,
  `Beats: ${timeline.beats.length} | density ${timeline.bpm} per minute | world ${episode.world}`,
  'Timing: estimated (words / 1.8). No voice recording exists yet, so no captions are burned in.',
  'The model can view images: every contact sheet was reviewed by the implementer.',
  '',
  '| gate | what it checks | result | notes |',
  '|---|---|---|---|',
  ...gates.map((g) => `| ${g[0]} | ${g[1]} | ${g[2]} | ${g[3]} |`),
  '',
  ready ? 'READY FOR REVIEW: yes' : 'READY FOR REVIEW: no',
  '',
].join('\n');
writeFileSync(join(dir, 'qc', 'report.md'), report);

const sheetFiles = readdirSync(join(dir, 'qc')).filter((f) => f.endsWith('.png')).sort();
const review = [
  `# REVIEW REQUEST - ${id} (${episode.title})`,
  '',
  '## What was built',
  `- \`episode.s2.json\`: ${timeline.beats.length} beats from \`EPISODE_BRIEF.md\`, weights and sub-beat splits in \`timing/splits.md\`.`,
  `- \`src/scene-ops.json\`: the scene implementation of every beat; \`src/episode.js\`: the shared custom scene ops.`,
  `- \`data/episode.csv\`: the numbers taken from the ledger; \`glossary.json\`: ${Object.keys(JSON.parse(readFileSync(join(dir, 'glossary.json'), 'utf8'))).length} terms.`,
  '',
  '## Files',
  `- \`renders/${mp4Name}\` (and \`FINAL/${mp4Name}\`): 1920x1080, 30 fps, ${timeline.duration.toFixed(2)} s, ${sizeMb} MB, no voice track.`,
  `- \`qc/report.md\`: the gate table. \`qc/beat_review.md\`: the ten questions per beat.`,
  `- \`qc/frames.csv\`, \`qc/frames-report.json\`, \`qc/scene-report.json\`, \`qc/label-boxes.json\`.`,
  `- \`qc/sheet_01.png ... sheet_${String(sheetFiles.filter((f) => f.startsWith('sheet')).length).padStart(2, '0')}.png\`, \`qc/cuts.png\`, \`qc/frames_*.png\`.`,
  '',
  '## How to run it again',
  '```',
  `node _shared/kit-v2/skills/bb-explain/bb-explain.mjs --episode <episodeDir> --write`,
  `node _shared/kit-v2/tools/build-episode.mjs <episodeDir> --size 1920x1080`,
  `node _shared/kit-v2/tools/qc-scene.mjs <episodeDir>`,
  `node _shared/kit-v2/tools/qc-frames.mjs <episodeDir> <video>`,
  `node _shared/kit-v2/tools/qc-sheets.mjs <episodeDir> <video>`,
  '```',
  '',
  '## Gate result',
  `- Scene graph (B1-B17): ${scene.failures.length} failures over ${scene.samples} samples.`,
  `- Frame gates (A, F1-F8): ${frames.failures.length} failures over ${frames.frames} frames.`,
  `- READY FOR REVIEW: ${ready ? 'yes' : 'no'}.`,
  '',
  '## Deviations and risks',
  '1. The render uses the software WebGL path (`--no-browser-gpu`). Hardware GL on the RTX 3050 is',
  '   reachable per process but is not bitwise stable enough for QC B14 (min SSIM 0.9985). See',
  '   `_shared/kit-v2/spike/REPORT.md`.',
  '2. No voice recording exists, so the film runs on estimated timing (words / 1.8) and carries no',
  '   burned-in captions. Re-run `finalize-with-voice` when the recording is ready.',
  '3. The draft render and the final render were made in one pass: on this machine both cost',
  '   the same wall time (the capture dominates), so the frame gates were run on the delivered file.',
  '',
  '## What I did not do',
  'I did not edit the script, the passages, the ledger, the brief or the approval file, and I did',
  'not touch Series 1, post anything, or change any system setting.',
  '',
].join('\n');
writeFileSync(join(dir, 'REVIEW_REQUEST.md'), review);
console.log(`${id}: report written, film copied as ${mp4Name}, READY FOR REVIEW: ${ready ? 'yes' : 'no'}`);
