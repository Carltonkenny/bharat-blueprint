// kit-v2: build an episode project from episode.s2.json.
//   node tools/build-episode.mjs <episodeDir> [--size 1920x1080] [--timing estimate|measured]
// Writes: index.html, episode-data.js, timing/timeline.json, and syncs the browser kit.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { KIT_ROOT } from './paths.mjs';
import { syncKit } from './sync-kit.mjs';
import { buildTimeline, estimateDurations, measuredDurations } from '../engine/beats.mjs';

const args = process.argv.slice(2);
const dir = resolve(args[0]);
if (!args[0]) { console.error('usage: node tools/build-episode.mjs <episodeDir>'); process.exit(2); }

function flag(name, dflt) {
  const i = args.indexOf('--' + name);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
}

const episode = JSON.parse(readFileSync(join(dir, 'episode.s2.json'), 'utf8'));
const size = flag('size', '1920x1080').split('x').map(Number);
const timingMode = flag('timing', 'estimate');

const measuredPath = join(dir, 'timing', 'measured.json');
const measured = timingMode === 'measured' && existsSync(measuredPath)
  ? JSON.parse(readFileSync(measuredPath, 'utf8'))
  : null;

const durations = measured ? measuredDurations(episode, measured) : estimateDurations(episode);
const timeline = buildTimeline(episode, durations);

mkdirSync(join(dir, 'timing'), { recursive: true });
writeFileSync(join(dir, 'timing', 'timeline.json'), JSON.stringify(timeline, null, 2));

// glossary
let glossary = {};
const gPath = join(dir, 'glossary.json');
if (existsSync(gPath)) glossary = JSON.parse(readFileSync(gPath, 'utf8'));

// data rows
let data = [];
const dPath = join(dir, 'data', `${episode.id}.csv`);
if (existsSync(dPath)) {
  const raw = readFileSync(dPath, 'utf8').split(/\r?\n/).filter((l) => l.trim());
  const head = raw[0].split(',').map((h) => h.trim());
  data = raw.slice(1).map((line) => {
    const cells = line.split(',');
    const o = {};
    head.forEach((h, i) => { o[h] = (cells[i] == null ? '' : cells[i].trim()); });
    return o;
  });
}

// map config
let map = null;
const mPath = join(dir, 'map.config.json');
if (existsSync(mPath)) map = JSON.parse(readFileSync(mPath, 'utf8'));

const payload = {
  id: episode.id,
  title: episode.title,
  seriesTitle: episode.seriesTitle || 'INDIA BUILT IT ANYWAY',
  world: episode.world,
  size,
  fps: episode.fps || 30,
  seed: episode.seed || episode.id,
  timeline,
  passages: episode.passages || [],
  glossary,
  data,
  map,
};
writeFileSync(join(dir, 'episode-data.js'), 'window.EPISODE = ' + JSON.stringify(payload) + ';\n');

// index.html from the template
const tpl = readFileSync(join(KIT_ROOT, 'templates', 'index.template.html'), 'utf8');
const world = episode.world || 'ice';
const PAPER = { ice: '#0a2f5c', network: '#071c38', orbit: '#050d21', graphite: '#123043', cleanroom: '#0c3b47', strata: '#112430' }[world] || '#0a2f5c';
const html = tpl
  .replaceAll('{{TITLE}}', episode.title)
  .replaceAll('{{PAPER}}', PAPER)
  .replaceAll('{{W}}', String(size[0]))
  .replaceAll('{{H}}', String(size[1]))
  .replaceAll('{{FPS}}', String(episode.fps || 30))
  .replaceAll('{{DURATION}}', String(timeline.duration))
  .replaceAll('{{COMPOSITION_ID}}', 's02-' + episode.id.toLowerCase());
writeFileSync(join(dir, 'index.html'), html);

syncKit(dir);

console.log(`built ${episode.id}: ${timeline.beats.length} beats, ${timeline.duration.toFixed(2)} s, ${timeline.bpm} beats/min`);
if (timeline.clampReport.length) {
  console.log(`  clamps: ${timeline.clampReport.length}`);
  for (const c of timeline.clampReport) console.log(`   - ${c.beat}: ${c.from}s -> ${c.to}s (${c.reason})`);
}
