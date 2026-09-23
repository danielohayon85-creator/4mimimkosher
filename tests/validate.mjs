import { load } from './load.mjs';
const AM = load();
const errs = [];
const refOk = ([s, k]) => AM.sources[s] && AM.sources[s][k];
for (const r of AM.rules) for (const s of r.src) if (!refOk(s)) errs.push(`rule ${r.id}: missing source ${s}`);
for (const n of Object.values(AM.notes)) for (const s of n.src) if (!refOk(s)) errs.push(`note: missing source ${s}`);
const used = new Set();
for (const [sp, def] of Object.entries(AM.species)) {
  const hids = new Set(def.hiddur.map(h => h.id));
  for (const h of def.hiddur) if (!AM.ruleById[h.rule]) errs.push(`${sp} hiddur ${h.id}: bad rule`);
  const qids = new Set();
  for (const q of def.questions) {
    if (qids.has(q.id)) errs.push(`dup q ${q.id}`); qids.add(q.id);
    for (const r of q.rules) { if (!AM.ruleById[r]) errs.push(`q ${q.id}: bad rule ${r}`); used.add(r); }
    if (!q.why) errs.push(`q ${q.id}: no why`);
    if (q.hk && !hids.has(q.hk)) errs.push(`q ${q.id}: bad hk`);
    for (const o of q.opts) {
      for (const settings of [{ edah: 'sefardi' }, { edah: 'ashkenazi' }, { edah: 'chabad' }, {}]) {
        const fx = typeof o.fx === 'function' ? o.fx(settings) : o.fx;
        for (const f of fx) {
          if (f[0][0] === 'H') { if (!hids.has(f[1])) errs.push(`q ${q.id}/${o.v}: bad hiddur ${f[1]}`); }
          else { if (!AM.ruleById[f[1]]) errs.push(`q ${q.id}/${o.v}: bad rule ${f[1]}`); if (!f[2]) errs.push(`q ${q.id}/${o.v}: no msg`); used.add(f[1]); }
        }
      }
    }
  }
}
for (const z of AM.quiz) for (const r of z.rules) if (!AM.ruleById[r]) errs.push(`quiz: bad rule ${r}`);
const unusedNonInfo = AM.rules.filter(r => !used.has(r.id) && r.lv !== 'info' && r.lv !== 'hiddur').map(r => r.id);
console.log('rules:', AM.rules.length, '| questions:', Object.values(AM.species).reduce((n, d) => n + d.questions.length, 0), '| quiz:', AM.quiz.length);
if (unusedNonInfo.length) console.log('rules not asked (ok if intentional):', unusedNonInfo.join(', '));
if (errs.length) { console.error(errs.join('\n')); process.exit(1); }
console.log('validate: OK');
