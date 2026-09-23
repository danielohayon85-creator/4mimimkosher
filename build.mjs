// Inlines everything into one HTML file (the Artifact contract: no external files except fonts).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { loadSources } from './src/parse-sources.mjs';
const r = f => readFileSync(new URL('./src/' + f, import.meta.url), 'utf8');
const sources = loadSources(new URL('./src/sources', import.meta.url).pathname);
const js = [
  'window.AM = window.AM || {};',
  `AM.sources = ${JSON.stringify(sources)};`,
  r('data/rules.js'), r('data/questions.js'), r('data/quiz.js'), r('js/engine.js'), r('js/app.js'),
].join('\n').replace(/<\/script/gi, '<\\/script');
const html = r('index.html').replace('/*CSS*/', () => r('css/styles.css')).replace('/*JS*/', () => js);
mkdirSync(new URL('./dist', import.meta.url), { recursive: true });
writeFileSync(new URL('./dist/arba-minim.html', import.meta.url), html);
// Standalone version for GitHub Pages (repo root): full document + PWA (manifest + offline service worker).
const pwa = '<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" href="icon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="icon.svg">\n';
const register = "<script>if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));</script>\n";
const full = `<!doctype html>\n<html lang="he" dir="rtl">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${pwa}` +
  html.replace('<div dir="rtl"', '</head>\n<body>\n<div dir="rtl"') + `\n${register}</body>\n</html>\n`;
writeFileSync(new URL('./index.html', import.meta.url), full);
console.log('built', (html.length / 1024).toFixed(0) + 'KB');
