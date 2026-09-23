// מנוע ההחלטות — פונקציות טהורות, ללא DOM.
(function (AM) {
  const fxOf = (opt, settings) => (typeof opt.fx === 'function' ? opt.fx(settings || {}) : opt.fx) || [];

  function kMarks(sp, answers, settings) {
    const marks = {};
    for (const q of AM.species[sp].questions) {
      if (q.stage !== 'k' || (q.show && !q.show(answers, settings || {})) || !(q.id in answers)) continue;
      const opt = q.opts.find(o => o.v === answers[q.id]);
      if (!opt) continue;
      for (const f of fxOf(opt, settings)) if (f[0][0] === 'H') marks[f[1]] = f[0][1];
    }
    return marks;
  }

  // השאלות הרלוונטיות לשלב, לפי התשובות עד כה
  function visible(sp, stage, answers, settings) {
    const pre = stage === 'h' ? kMarks(sp, answers, settings) : {};
    return AM.species[sp].questions.filter(q =>
      q.stage === stage && (!q.show || q.show(answers, settings || {})) && !(q.hk && q.hk in pre));
  }

  function progress(sp, stage, answers, settings) {
    const list = visible(sp, stage, answers, settings);
    const idx = list.findIndex(q => !(q.id in answers));
    return { list, idx, done: idx === -1, current: idx === -1 ? null : list[idx] };
  }

  function evaluate(sp, answers, settings) {
    const out = { bad: [], doubt: [], warn: [], ok: [], notes: [], marks: {}, day1: false };
    for (const stage of ['k', 'h']) {
      for (const q of visible(sp, stage, answers, settings)) {
        if (!(q.id in answers)) continue;
        const opt = q.opts.find(o => o.v === answers[q.id]);
        if (!opt) continue;
        for (const f of fxOf(opt, settings)) {
          const [kind, ref, msg] = f;
          if (kind[0] === 'H') { out.marks[ref] = kind[1]; continue; }
          const item = { rule: ref, msg, q: q.id };
          if (kind === 'P') { out.bad.push(item); if (AM.ruleById[ref] && AM.ruleById[ref].day1) out.day1 = true; }
          else if (kind === 'S') out.doubt.push(item);
          else if (kind === 'W') out.warn.push(item);
          else if (kind === 'N') out.notes.push(item);
          else out.ok.push(item);
        }
      }
    }
    // יום א' — רלוונטי רק כשכל הפסולים הם מסוג "יום א' בלבד"
    out.day1 = out.bad.length > 0 && out.bad.every(b => AM.ruleById[b.rule] && AM.ruleById[b.rule].day1);
    out.verdict = out.bad.length ? 'P' : out.doubt.length ? 'S' : 'K';
    return out;
  }

  // מאפייני הידור עם edah נספרים רק במנהג הזה
  function score(sp, marks, settings) {
    const edah = (settings || {}).edah || '';
    const items = AM.species[sp].hiddur.filter(h => !h.edah || h.edah === edah).map(h => ({ ...h, st: marks[h.id] || null }));
    const plus = items.filter(i => i.st === '+').length;
    const minus = items.filter(i => i.st === '-').length;
    const unknown = items.filter(i => i.st === '?').length;
    const na = items.filter(i => !i.st).length;
    const determined = plus + minus;
    const pct = determined ? plus / determined : null;
    const stars = pct === 1 ? 5 : pct !== null && pct >= 0.6 ? 4 : 3;
    return { items, plus, minus, unknown, na, determined, pct, stars };
  }

  const STAR_LABEL = { 3: 'כשר', 4: 'מהודר', 5: 'מהודר מאוד' };

  AM.engine = { visible, progress, evaluate, score, STAR_LABEL, kMarks };
})(typeof window !== 'undefined' ? (window.AM = window.AM || {}) : (globalThis.AM = globalThis.AM || {}));
