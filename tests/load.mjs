import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { loadSources } from '../src/parse-sources.mjs';
const root = new URL('..', import.meta.url).pathname;
export function load() {
  globalThis.AM = {};
  for (const f of ['data/rules.js', 'data/questions.js', 'data/quiz.js', 'js/engine.js'])
    vm.runInThisContext(readFileSync(root + 'src/' + f, 'utf8'), { filename: f });
  globalThis.AM.sources = loadSources(root + 'src/sources');
  return globalThis.AM;
}
