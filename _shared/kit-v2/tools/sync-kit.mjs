// kit-v2: sync the browser modules, the vendored Three.js and the fonts into a project
// folder, so each episode is a self-contained HyperFrames project that also opens from
// file://.
// usage: node tools/sync-kit.mjs <projectDir> [<projectDir> ...]
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { KIT_ROOT } from './paths.mjs';

const BROWSER_FILES = [
  'prng.js', 'tokens.js', 'scenereport.js', 'draw.js', 'labels.js', 'fx.js', 'camera.js',
  'panels.js', 'props.js', 'figures.js', 'charts.js', 'maps.js', 'compose.js', 'scenes.js', 'film.js',
];

const FONT_DIR = join(KIT_ROOT, 'assets', 'fonts');

export function syncKit(projectDir) {
  const kit = join(projectDir, 'src', 'kit');
  mkdirSync(join(kit, 'hero'), { recursive: true });
  mkdirSync(join(kit, 'vendor'), { recursive: true });
  mkdirSync(join(kit, 'fonts'), { recursive: true });

  for (const f of BROWSER_FILES) {
    cpSync(join(KIT_ROOT, 'src', f), join(kit, f));
  }
  cpSync(join(KIT_ROOT, 'src', 'hero', 'stage.js'), join(kit, 'hero', 'stage.js'));
  cpSync(join(KIT_ROOT, 'src', 'hero', 'index.js'), join(kit, 'hero', 'index.js'));
  cpSync(join(KIT_ROOT, 'src', 'hero', 'more.js'), join(kit, 'hero', 'more.js'));
  if (existsSync(join(KIT_ROOT, 'src', 'hero', 's03.js'))) cpSync(join(KIT_ROOT, 'src', 'hero', 's03.js'), join(kit, 'hero', 's03.js'));
  cpSync(join(KIT_ROOT, 'vendor', 'three', 'three.iife.js'), join(kit, 'vendor', 'three.iife.js'));

  if (existsSync(FONT_DIR)) {
    for (const f of readdirSync(FONT_DIR)) {
      if (f.endsWith('.woff2')) cpSync(join(FONT_DIR, f), join(kit, 'fonts', f));
    }
  }
  return kit;
}

if (process.argv[1] && process.argv[1].endsWith('sync-kit.mjs')) {
  const targets = process.argv.slice(2);
  if (!targets.length) { console.error('usage: node tools/sync-kit.mjs <projectDir> [...]'); process.exit(2); }
  for (const t of targets) {
    const dir = resolve(t);
    syncKit(dir);
    console.log('synced kit ->', dir);
  }
}
