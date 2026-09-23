import { load } from './load.mjs';
import assert from 'node:assert/strict';
const AM = load(); const E = AM.engine;
// the cleanest option: no P/S/W effect, most H+ marks
function clean(q, settings) {
  const rank = o => { const fx = typeof o.fx === 'function' ? o.fx(settings) : o.fx;
    if (fx.some(f => ['P', 'S', 'W'].includes(f[0]))) return -1;
    return fx.filter(f => f[0] === 'H+').length - fx.filter(f => f[0] === 'H-' || f[0] === 'H?').length; };
  return q.opts.reduce((b, o) => (rank(o) > rank(b) ? o : b)).v;
}
function run(sp, overrides, settings = {}) {
  const a = {};
  for (let i = 0; i < 60; i++) {
    const p = E.progress(sp, 'k', a, settings); if (p.done) break;
    const q = p.current; a[q.id] = q.id in overrides ? overrides[q.id] : clean(q, settings);
  }
  for (let i = 0; i < 60; i++) {
    const p = E.progress(sp, 'h', a, settings); if (p.done) break;
    const q = p.current; a[q.id] = q.id in overrides ? overrides[q.id] : clean(q, settings);
  }
  return { a, r: E.evaluate(sp, a, settings) };
}
let n = 0; const t = (name, fn) => { fn(); n++; console.log('✓', name); };
t('lulav clean → K', () => assert.equal(run('lulav', {}).r.verdict, 'K'));
t('lulav 30cm (<33) → P, day1', () => { const { r } = run('lulav', { l_len: 'lt33' }); assert.equal(r.verdict, 'P'); assert.ok(r.day1); });
t('lulav unmeasured → S', () => assert.equal(run('lulav', { l_len: 'unk' }).r.verdict, 'S'));
t('lulav back-curved → K, hiddur minus', () => { const { r } = run('lulav', { l_bend: 'back' }); assert.equal(r.verdict, 'K'); assert.equal(r.marks.LH_straight, '-'); });
t('lulav himnik → P', () => assert.equal(run('lulav', { l_fork: 'fork' }).r.verdict, 'P'));
t('lulav thorn cut → K', () => assert.equal(run('lulav', { l_cut: 'thorn' }).r.verdict, 'K'));
t('lulav two mid leaves, one slightly open → S', () => assert.equal(run('lulav', { l_split: 'little', l_two: 'yes' }).r.verdict, 'S'));
t('l_two hidden when closed', () => { const { a } = run('lulav', {}); assert.ok(!('l_two' in a)); });
t('lulav most leaves bent → K with warning', () => { const { r } = run('lulav', { l_leafbend: 'most' }); assert.equal(r.verdict, 'K'); assert.equal(r.warn.length, 1); });
t('lulav leaves apart + hardened → S', () => assert.equal(run('lulav', { l_droop: 'apart', l_hard: 'yes' }).r.verdict, 'S'));
t('lulav leaves apart, not hardened → K', () => assert.equal(run('lulav', { l_droop: 'apart', l_hard: 'no' }).r.verdict, 'K'));
t('kora: sefardi yes → +, ashkenazi yes → -, none → ?', () => {
  assert.equal(run('lulav', { lh_kora: 'yes' }, { edah: 'sefardi' }).r.marks.LH_kora, '+');
  assert.equal(run('lulav', { lh_kora: 'yes' }, { edah: 'ashkenazi' }).r.marks.LH_kora, '-');
  assert.equal(run('lulav', { lh_kora: 'yes' }, {}).r.marks.LH_kora, '?');
});
t('etrog clean → K and 5 stars', () => { const { r } = run('etrog', {}); assert.equal(r.verdict, 'K'); assert.equal(E.score('etrog', r.marks).stars, 5); });
t('etrog spots same side → K', () => assert.equal(run('etrog', { e_body: 'side' }).r.verdict, 'K'));
t('etrog spots around → P', () => assert.equal(run('etrog', { e_body: 'around' }).r.verdict, 'P'));
t('etrog nose spot → P', () => assert.equal(run('etrog', { e_nose: 'yes' }).r.verdict, 'P'));
t('etrog no dad, cannot tell → K', () => assert.equal(run('etrog', { e_dad: 'none', e_dad3: 'unk' }).r.verdict, 'K'));
t('etrog dad flush → P day1', () => { const { r } = run('etrog', { e_dad: 'broken', e_dad2: 'flush' }); assert.equal(r.verdict, 'P'); assert.ok(r.day1); });
t('etrog no dad → shoshanta hiddur not asked, marked n/a', () => { const { a, r } = run('etrog', { e_dad: 'none', e_dad3: 'no' }); assert.ok(!('eh_shosh' in a)); assert.equal(E.score('etrog', r.marks).na, 2); });
t('etrog grafted → P, not day1', () => { const { r } = run('etrog', { e_graft: 'grafted' }); assert.equal(r.verdict, 'P'); assert.ok(!r.day1); });
t('etrog no graft testimony → S', () => assert.equal(run('etrog', { e_graft: 'unk' }).r.verdict, 'S'));
t('etrog orla unknown → K', () => assert.equal(run('etrog', { e_orla: 'no' }).r.verdict, 'K'));
t('etrog green will yellow → K, hiddur -', () => { const { r } = run('etrog', { e_green: 'green' }); assert.equal(r.verdict, 'K'); assert.equal(r.marks.EH_yellow, '-'); });
t('etrog doubtful missing → K', () => assert.equal(run('etrog', { e_miss: 'unsure' }).r.verdict, 'K'));
t('P beats S', () => assert.equal(run('etrog', { e_graft: 'unk', e_nose: 'yes' }).r.verdict, 'P'));
t('hadas tip cut → P', () => assert.equal(run('hadas', { h_tip: 'cut' }).r.verdict, 'P'));
t('hadas most avot non-contiguous → K', () => assert.equal(run('hadas', { h_avot: 'most' }).r.verdict, 'K'));
t('hadas big leaves → S', () => assert.equal(run('hadas', { h_size: 'big' }).r.verdict, 'S'));
t('hadas dry but top node moist → K', () => assert.equal(run('hadas', { h_dry: 'white', h_dry2: 'yes' }).r.verdict, 'K'));
t('arava levluv cut → K', () => assert.equal(run('arava', { a_tip: 'leaf' }).r.verdict, 'K'));
t('arava tsaftsafa → P', () => assert.equal(run('arava', { a_id: 'tsaf' }).r.verdict, 'P'));
t('arava levluv mark from k-stage', () => assert.equal(run('arava', { a_tip: 'leaf' }).r.marks.AH_levluv, '-'));
t('set not bound yet → K with note', () => { const { r } = run('set', { g_height: 'notyet' }); assert.equal(r.verdict, 'K'); assert.equal(r.notes.length, 1); });
t('stars: 3/5 plus → 4 stars', () => assert.equal(E.score('etrog', { EH_yellow: '+', EH_size: '+', EH_dad: '+', EH_shosh: '-', EH_orla: '-' }).stars, 4));
t('stars: 2/5 → 3 stars', () => assert.equal(E.score('etrog', { EH_yellow: '+', EH_size: '+', EH_dad: '-', EH_shosh: '-', EH_orla: '-' }).stars, 3));
// ── מנהג חב"ד (מקור ג') ──
const C = { edah: 'chabad' };
t('chabad clean etrog → K, e_nose/e_body hidden', () => { const { a, r } = run('etrog', {}, C); assert.equal(r.verdict, 'K'); assert.ok(!('e_nose' in a) && !('e_body' in a) && 'e_spots_c' in a); });
t('chabad top spot → P day1', () => { const { r } = run('etrog', { e_spots_c: 'top' }, C); assert.equal(r.verdict, 'P'); assert.ok(r.day1); });
t('chabad one lower spot → K', () => assert.equal(run('etrog', { e_spots_c: 'one' }, C).r.verdict, 'K'));
t('chabad mottled lower → S', () => assert.equal(run('etrog', { e_spots_c: 'two' }, C).r.verdict, 'S'));
t('chabad spots around okets → K', () => assert.equal(run('etrog', { e_spots_c: 'okets' }, C).r.verdict, 'K'));
t('chabad raised blettlach → K, EH_clean -', () => { const { r } = run('etrog', { e_blat: 'raised' }, C); assert.equal(r.verdict, 'K'); assert.equal(r.marks.EH_clean, '-'); });
t('chabad suspected hole → P', () => assert.equal(run('etrog', { e_miss: 'unsure' }, C).r.verdict, 'P'));
t('chabad no pitam, doubt → S', () => assert.equal(run('etrog', { e_dad: 'none', e_dad3: 'unk' }, C).r.verdict, 'S'));
t('chabad green → K with warning', () => { const { r } = run('etrog', { e_green: 'green' }, C); assert.equal(r.verdict, 'K'); assert.ok(r.warn.length >= 1); });
t('chabad lulav slightly open → K with warning', () => { const { r } = run('lulav', { l_split: 'little', l_two: 'no' }, C); assert.equal(r.verdict, 'K'); assert.ok(r.warn.length >= 1); });
t('chabad kora yes → +', () => assert.equal(run('lulav', { lh_kora: 'yes' }, C).r.marks.LH_kora, '+'));
t('chabad hiddur items counted only in chabad', () => {
  const { r } = run('etrog', {}, C); assert.equal(r.marks.EH_calabria, '+');
  assert.ok(E.score('etrog', r.marks, C).items.length > E.score('etrog', r.marks, {}).items.length);
});
t('chabad bundle uses 8cm question', () => { const { a } = run('set', {}, C); assert.ok('g_height_c' in a && !('g_height' in a)); });
console.log(`\n${n} tests passed`);
