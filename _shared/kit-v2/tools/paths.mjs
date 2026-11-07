// kit-v2: path helpers. No hard-coded user paths: everything is derived from the
// environment or from the location of this file.
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { existsSync, readdirSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));

export const KIT_ROOT = resolve(here, '..');
export const WORKSPACE = resolve(KIT_ROOT, '..', '..');

// RENDER_ROOT: %LOCALAPPDATA%\BharatBlueprint\render\S02  (never inside OneDrive)
export const RENDER_ROOT = process.env.BB_RENDER_ROOT
  || join(process.env.LOCALAPPDATA || process.env.USERPROFILE || '.', 'BharatBlueprint', 'render', 'S02');

// Pinned build dependencies live under RENDER_ROOT so OneDrive never syncs them.
export const DEPS_ROOT = process.env.BB_DEPS
  || join(RENDER_ROOT, 'deps', 'node_modules');

export const HYPERFRAMES_BIN = join(DEPS_ROOT, 'hyperframes', 'bin', 'hyperframes.mjs');

export function depsAvailable() {
  return existsSync(join(DEPS_ROOT, 'hyperframes', 'bin', 'hyperframes.mjs'));
}

// Chrome used by the QC driver: prefer the one HyperFrames already downloaded.
export function chromePath() {
  if (process.env.BB_CHROME && existsSync(process.env.BB_CHROME)) return process.env.BB_CHROME;
  const roots = [
    join(process.env.USERPROFILE || '', '.cache', 'hyperframes', 'chrome'),
    join(process.env.USERPROFILE || '', '.cache', 'puppeteer'),
  ];
  for (const root of roots) {
    const hit = findExe(root);
    if (hit) return hit;
  }
  return null;
}

function findExe(dir) {
  let entries = [];
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return null; }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const p = join(dir, e.name);
    const direct = join(p, 'chrome-headless-shell.exe');
    if (existsSync(direct)) return direct;
    const hit = findExe(p);
    if (hit) return hit;
  }
  return null;
}
