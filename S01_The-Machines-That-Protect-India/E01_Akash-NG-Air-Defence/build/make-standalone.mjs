// Inlines the storyboard's local scripts into one file: dist/storyboard-standalone.html (no external URLs).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

let html = readFileSync('storyboard.html', 'utf8');
html = html.replace(/<script src="([^"]+)"><\/script>/g, (_, src) => `<script>\n${readFileSync(src, 'utf8').replace(/<\/script>/g, '<\\/script>')}\n</script>`);
mkdirSync('dist', { recursive: true });
writeFileSync('dist/storyboard-standalone.html', html);
console.log('wrote dist/storyboard-standalone.html', (html.length / 1024).toFixed(0) + ' KB', 'external refs:', (html.match(/https?:\/\//g) || []).length);
