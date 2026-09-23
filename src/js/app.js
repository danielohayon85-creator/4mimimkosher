// ממשק "בודק ארבעת המינים"
(function (AM) {
  const E = AM.engine;
  const $app = document.getElementById('app');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
  };

  // ───────────── אייקונים ─────────────
  const hadasNode = y => `<path d="M12 ${y}c-1.7-1.7-3.7-2-5.2-1.2.9 1.6 3 2.1 5.2 1.2z"/><path d="M12 ${y}c1.7-1.7 3.7-2 5.2-1.2-.9 1.6-3 2.1-5.2 1.2z"/>`;
  const I = {
    etrog: '<path d="M12 5.5c3.8 0 6.3 3.9 6.3 8.3S15.5 21 12 21s-6.3-2.8-6.3-7.2S8.2 5.5 12 5.5z"/><path d="M12 5.5V3"/><path d="M12 4.2c1.1-1.5 2.7-2.1 4.3-1.8-.6 1.5-2 2.3-4.3 2.3"/>',
    lulav: '<path d="M12 22V2.5"/><path d="M12 8.5 9 3.5M12 8.5l3-5M12 13.5 8.5 7.5M12 13.5l3.5-6M12 18.5 8.3 12.5M12 18.5l3.7-6"/>',
    hadas: `<path d="M12 22V3"/>${hadasNode(7)}${hadasNode(12)}${hadasNode(17)}`,
    arava: '<path d="M12 20.5C8.4 15.8 8.4 8.3 12 3c3.6 5.3 3.6 12.8 0 17.5z"/><path d="M12 7v15"/>',
    bundle: '<path d="M8.5 22V8M12 22V2.5M15.5 22V8.5"/><path d="M7 15.5h10"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v14H6.5A2.5 2.5 0 0 0 4 19.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6h.01"/>',
    close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    back: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    go: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    chev: '<path d="M14.5 6l-6 6 6 6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    alert: '<path d="M12 6.5v7.5M12 17.6h.01"/>',
    x: '<path d="M7 7l10 10M17 7 7 17"/>',
    cal: '<rect x="4" y="5" width="16" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M4 10h16"/>',
    doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
    hand: '<path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V11M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V5.5a1.5 1.5 0 0 1 3 0V12M16 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5a6 6 0 0 1-5-2.7L4 14.5a1.5 1.5 0 0 1 2.5-1.7L7 13.5"/>',
    spark: '<path d="M12 3l2.2 5.3L20 10l-5.8 1.7L12 17l-2.2-5.3L4 10l5.8-1.7z"/>',
  };
  const ic = (n, cls = 'ic') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;
  const SPI = { etrog: 'etrog', lulav: 'lulav', hadas: 'hadas', arava: 'arava', set: 'bundle' };
  const badge = (sp, cls = '') => `<span class="badge t-${sp} ${cls}">${ic(SPI[sp])}</span>`;
  const LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><ellipse cx="13" cy="19" rx="8" ry="9" fill="var(--citrus)" stroke="var(--ink)" stroke-width="1.6"/><path d="M20 29C16.5 21 18 11 26.5 4c2.2 8.5-1 18.5-6.5 25z" fill="var(--leaf)" stroke="var(--ink)" stroke-width="1.6"/><path d="M20.5 27.5c1.2-7 2.6-13.5 5.3-21" fill="none" stroke="var(--ink)" stroke-width="1.1"/></svg>';

  // ───────────── איורים ─────────────
  const svg = (vb, label, body) => `<svg viewBox="${vb}" role="img" aria-label="${esc(label)}">${body}</svg>`;
  const T = (x, y, t, cls = 'i-lbl') => `<text class="${cls}" x="${x}" y="${y}" text-anchor="middle">${t}</text>`;
  const etrogPath = 'M160,60 C188,66 214,102 214,150 C214,198 190,230 160,230 C130,230 106,198 106,150 C106,102 132,66 160,60 Z';
  function lulavLeaves(x, from, to, step = 19) {
    let s = '';
    for (let y = from; y >= to; y -= step) s += `<path class="i-leafline" d="M${x},${y} Q${x - 13},${y - 40} ${x - 16},${y - 78}"/><path class="i-leafline" d="M${x},${y} Q${x + 13},${y - 40} ${x + 16},${y - 78}"/>`;
    return s;
  }
  function serrated(cx, cy, rx, ry, n) {
    const pts = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, k = i % 2 ? 0.9 : 1; pts.push(`${(cx + Math.cos(a) * rx * k).toFixed(1)},${(cy + Math.sin(a) * ry * k).toFixed(1)}`); }
    return `M${pts.join(' L')} Z`;
  }
  const ILL = {
    etrog: () => svg('0 0 320 252', 'חלקי האתרוג: שושנתא, דד, חוטם ועוקץ',
      `<defs><clipPath id="cpE"><path d="${etrogPath}"/></clipPath></defs>
      <path class="i-citrus" d="${etrogPath}"/>
      <rect class="i-nose" x="100" y="50" width="120" height="52" clip-path="url(#cpE)"/>
      <line class="i-dash" x1="112" y1="102" x2="208" y2="102"/>
      <rect class="i-wood" x="157" y="38" width="6" height="24" rx="2"/>
      <circle cx="160" cy="33" r="7" fill="var(--gold)" stroke="var(--ink)" stroke-width="1.5"/>
      <rect class="i-wood" x="157" y="228" width="6" height="16" rx="2"/>
      <line class="i-thin" x1="96" y1="30" x2="151" y2="33"/>${T(58, 34, 'שושנתא')}
      <line class="i-thin" x1="96" y1="58" x2="155" y2="50"/>${T(58, 62, 'דד (פיטם)')}
      <line class="i-thin" x1="200" y1="82" x2="234" y2="72"/>${T(270, 68, 'חוטם')}${T(270, 84, 'עד הקו המקווקו')}
      <line class="i-thin" x1="214" y1="160" x2="234" y2="160"/>${T(272, 164, 'שאר האתרוג')}
      <line class="i-thin" x1="166" y1="238" x2="234" y2="238"/>${T(264, 242, 'עוקץ')}`),
    etrogLayers: () => svg('0 0 320 160', 'שכבות האתרוג: קליפה ירוקה דקה, קליפה עבה ובשר לבן',
      `<rect class="i-l3" x="20" y="72" width="130" height="72" rx="8"/>
      <rect class="i-l2" x="20" y="34" width="130" height="40"/>
      <rect class="i-l1" x="20" y="24" width="130" height="10" rx="3"/>
      <line class="i-thin" x1="150" y1="29" x2="170" y2="29"/>${T(240, 26, 'קליפה ירוקה דקה')}${T(240, 42, 'פגיעה רק בה — אינה חסר', 'i-ok')}
      <line class="i-thin" x1="150" y1="60" x2="170" y2="66"/>${T(240, 70, 'קליפה עבה')}
      <line class="i-thin" x1="150" y1="108" x2="170" y2="108"/>${T(240, 104, 'בשר לבן')}${T(240, 122, 'נחשף — "חסר", פסול', 'i-no')}`),
    etrogSpots: () => svg('0 0 320 180', 'כתמים באותו צד מול כתמים שמקיפים את רוב האתרוג',
      `<ellipse class="i-citrus" cx="235" cy="78" rx="60" ry="46"/>
      <circle class="i-spot" cx="270" cy="60" r="4.5"/><circle class="i-spot" cx="280" cy="80" r="4.5"/><circle class="i-spot" cx="268" cy="98" r="4.5"/>
      <ellipse class="i-citrus" cx="85" cy="78" rx="60" ry="46"/>
      <polygon points="55,52 122,70 72,112" class="i-bad" stroke-dasharray="5 4"/>
      <circle class="i-spot" cx="55" cy="52" r="4.5"/><circle class="i-spot" cx="122" cy="70" r="4.5"/><circle class="i-spot" cx="72" cy="112" r="4.5"/>
      ${T(235, 150, 'כולם באותו צד')}${T(235, 168, 'כשר', 'i-ok')}
      ${T(85, 150, 'מקיפים את רוב האתרוג')}${T(85, 168, "פסול (ביום א')", 'i-no')}`),
    lulav: () => svg('0 0 320 310', 'מבנה הלולב: שדרה, עלה אמצעי והחלק החשוף שאינו נמדד',
      `<line class="i-spine" x1="150" y1="298" x2="150" y2="86"/>
      ${lulavLeaves(150, 252, 100)}
      <path d="M147,88 L150,12 L153,88" fill="var(--leaf)" stroke="var(--ink)" stroke-width="1.4" stroke-linejoin="round"/>
      <line class="i-thin" x1="100" y1="22" x2="145" y2="26"/>${T(62, 20, 'עלה אמצעי')}${T(62, 36, '(התיומת)')}
      <line class="i-thin" x1="98" y1="276" x2="144" y2="276"/>${T(62, 272, 'אופתא — חשוף')}${T(62, 288, 'לא נמדד')}
      <line class="i-ink" x1="236" y1="252" x2="236" y2="88" stroke-width="1.6"/>
      <line class="i-ink" x1="228" y1="252" x2="244" y2="252" stroke-width="1.6"/><line class="i-ink" x1="228" y1="88" x2="244" y2="88" stroke-width="1.6"/>
      ${T(282, 164, 'השדרה')}${T(282, 180, 'הנמדדת')}
      <line class="i-dash" x1="160" y1="252" x2="226" y2="252"/><line class="i-dash" x1="160" y1="88" x2="226" y2="88"/>`),
    // עקמומיות: הקו החום = השדרה (הגב), הקו הירוק = העלים (הפנים)
    lulavCurve: () => {
      const p = (spine, leaf, x, c1, c2, cls) => `<path class="i-spine" d="${spine}"/><path class="i-leafline" d="${leaf}"/>${T(x, 196, c1, cls)}${T(x, 212, c2)}`;
      return svg('0 0 320 220', 'כיווני עקמומיות של שדרת הלולב',
        `<line class="i-spine" x1="206" y1="14" x2="224" y2="14" stroke-width="4"/>${T(262, 18, 'שדרה (גב)')}
         <line class="i-leafline" x1="96" y1="14" x2="114" y2="14" stroke-width="4"/>${T(154, 18, 'עלים (פנים)')}
         ${p('M286,176 L286,40', 'M278,176 L278,40', 282, 'ישרה', 'הידור', 'i-ok')}
         ${p('M204,176 Q214,108 204,40', 'M196,176 Q206,108 196,40', 200, 'עקומה מעט', 'כשר', 'i-ok')}
         ${p('M124,176 Q148,108 124,40', 'M116,176 Q140,108 116,40', 120, 'לצד הגב', 'כשר', 'i-ok')}
         ${p('M52,176 Q8,108 52,40', 'M44,176 Q0,108 44,40', 42, 'כמגל לפנים', 'או לצד: פסול', 'i-no')}`);
    },
    tiyomet: () => svg('0 0 320 214', 'עלה אמצעי סגור, פתוח מעט, ופתוח ברוב אורכו',
      `<line class="i-spine" x1="265" y1="185" x2="265" y2="112"/>${lulavLeaves(265, 170, 150, 20)}
       <path d="M262,114 L265,16 L268,114" fill="var(--leaf)" stroke="var(--ink)" stroke-width="1.4" stroke-linejoin="round"/>
       <line class="i-spine" x1="160" y1="185" x2="160" y2="112"/>${lulavLeaves(160, 170, 150, 20)}
       <path d="M157,114 L159,62 L151,18 M163,114 L161,62 L169,18" fill="none" stroke="var(--leaf)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
       <line class="i-spine" x1="55" y1="185" x2="55" y2="112"/>${lulavLeaves(55, 170, 150, 20)}
       <path d="M52,114 L40,18 M58,114 L70,18" fill="none" stroke="var(--leaf)" stroke-width="4.5" stroke-linecap="round"/>
       ${T(265, 196, 'סגור')}${T(265, 211, 'מהודר', 'i-ok')}${T(160, 196, 'פתוח מעט')}${T(160, 211, 'כשר', 'i-ok')}${T(55, 196, 'ברוב אורכו')}${T(55, 211, 'פסול', 'i-no')}`),
    agmon: () => svg('0 0 320 200', 'שדרה כפופה כאגמון מול עלים כפופים בלבד',
      `<line class="i-spine" x1="235" y1="190" x2="235" y2="50"/>${lulavLeaves(235, 176, 130, 22)}
       <path d="M235,52 Q236,26 252,20" fill="none" stroke="var(--leaf)" stroke-width="4.5" stroke-linecap="round"/>
       <path d="M235,52 Q226,30 214,28" fill="none" stroke="var(--leaf)" stroke-width="4.5" stroke-linecap="round"/>
       <path class="i-spine" d="M85,190 L85,62 Q85,24 58,30"/>${lulavLeaves(85, 176, 130, 22)}
       ${T(235, 12, 'רק העלים כפופים')}${T(235, 198, 'כשר', 'i-ok')}
       ${T(85, 12, 'השדרה כפופה כוו')}${T(85, 198, 'פסול', 'i-no')}`),
    kora: () => svg('0 0 320 190', 'קור"א — קליפה אדומה המחברת את ראש הלולב',
      `<line class="i-spine" x1="160" y1="185" x2="160" y2="100"/>${lulavLeaves(160, 170, 140, 20)}
       <path d="M157,102 L160,12 L163,102" fill="var(--leaf)" stroke="var(--ink)" stroke-width="1.4" stroke-linejoin="round"/>
       <path class="i-kora" d="M160,96 L160,24"/>
       <line class="i-thin" x1="170" y1="54" x2="214" y2="54"/>${T(262, 50, 'קור"א')}${T(262, 66, 'קליפה אדומה')}
       ${T(70, 50, 'לא למשש')}${T(70, 66, 'כדי לבדוק')}`),
    himnik: () => svg('0 0 320 180', 'ראש לולב תקין מול ראש מפוצל כמזלג',
      `<line class="i-spine" x1="235" y1="160" x2="235" y2="72"/>
      <path class="i-leafline" d="M233,74 L234,14"/><path class="i-leafline" d="M237,74 L236,14"/>
      <line class="i-spine" x1="85" y1="160" x2="85" y2="72"/>
      <path class="i-leafline" d="M83,74 L60,16"/><path class="i-leafline" d="M87,74 L110,16"/>
      ${T(235, 178, 'נוגעים זה בזה — כשר', 'i-ok')}${T(85, 178, 'צורת V ("הימניק") — פסול', 'i-no')}`),
    hadas: () => {
      const leaf = (cx, cy, rot) => `<ellipse class="i-leaf" cx="${cx}" cy="${cy}" rx="16" ry="6.5" transform="rotate(${rot} ${cx} ${cy})"/>`;
      let a = '', b = '';
      for (const y of [175, 125, 75]) {
        a += leaf(219, y, -28) + leaf(251, y, 28) + `<ellipse class="i-leaf" cx="235" cy="${y - 8}" rx="6.5" ry="15"/>`;
        b += leaf(69, y, -28) + leaf(101, y, 28) + `<ellipse class="i-leaf" cx="85" cy="${y - 28}" rx="6.5" ry="15"/>`;
      }
      return svg('0 0 320 250', 'הדס עבות — שלושה עלים באותו גובה — מול הדס שוטה',
        `<line class="i-spine" x1="235" y1="215" x2="235" y2="30" stroke-width="3"/>${a}
        <line class="i-spine" x1="85" y1="215" x2="85" y2="30" stroke-width="3"/>${b}
        <line class="i-dash" x1="118" y1="175" x2="150" y2="175"/><line class="i-dash" x1="100" y1="147" x2="150" y2="147"/>
        <path class="i-bad" d="M146,176 L146,146"/>${T(160, 138, 'הפרש', 'i-no')}
        <line class="i-dash" x1="170" y1="171" x2="205" y2="171"/>${T(188, 164, 'שווה', 'i-ok')}
        ${T(235, 232, 'עבות — כשר', 'i-ok')}${T(235, 248, '3 עלים באותו גובה')}
        ${T(85, 232, 'שוטה — פסול', 'i-no')}${T(85, 248, 'העלה השלישי גבוה מהשניים')}`);
    },
    arava: () => svg('0 0 320 240', 'עלה ערבה מול עלה צפצפה',
      `<line x1="235" y1="205" x2="235" y2="160" stroke="#B5322A" stroke-width="4" stroke-linecap="round"/>
      <path class="i-leaf" d="M235,162 C220,122 222,60 235,14 C248,60 250,122 235,162 Z"/>
      <line x1="85" y1="205" x2="85" y2="150" stroke="var(--card-2)" stroke-width="6" stroke-linecap="round"/>
      <line x1="85" y1="205" x2="85" y2="150" class="i-thin"/>
      <path class="i-leaf" d="${serrated(85, 96, 44, 56, 44)}"/>
      ${T(235, 222, 'ערבה — עלה משוך, שפה חלקה', 'i-ok')}${T(235, 238, 'קנה אדום (או ירוק)')}
      ${T(85, 222, 'צפצפה — פסולה', 'i-no')}${T(85, 238, 'עלה עגול, שפה כמסור, קנה לבן')}`),
  };

  // ───────────── מצב ─────────────
  const S = {
    screen: 'home', mode: 'single', queue: [], qi: 0, sp: null, stage: 'k', cur: null,
    answers: {}, sheets: [], learnSp: 'etrog', quiz: null, reviewing: false,
    settings: { edah: store.get('am.edah') || '' },
  };
  const EDAH = { sefardi: 'ספרדי', ashkenazi: 'אשכנזי', '': 'לא צוין' };
  const VERDICT = {
    K: { t: 'כשר לפי הנתונים שהוזנו וההלכות שבמקורות', lead: 'לא נמצא פסול או ספק בנתונים שהזנת.', icon: 'check' },
    S: { t: 'ספק — דורש שאלת רב', lead: 'יש כאן נקודה שהמקורות אינם מכריעים בה, או שחסר מידע. אל תכריע לבד — הצג את הפרטים לרב.', icon: 'alert' },
    P: { t: 'פסול לפי ההלכות שבמקורות', lead: 'נמצא לפחות מאפיין אחד שפוסל לפי המקורות.', icon: 'x' },
  };
  const PILL = { K: 'כשר', S: 'שאלת רב', P: 'פסול' };
  const spDef = sp => AM.species[sp];
  const ans = () => (S.answers[S.sp] = S.answers[S.sp] || {});

  // ───────────── רכיבים ─────────────
  const srcLabel = s => (s === 'B' ? "מקור ב'" : "מקור א'");
  const srcChip = ([s, k]) => {
    const sec = AM.sources[s][k];
    const short = s === 'B' ? sec.title.replace(/^(\S+) › \d+\. /, '$1 · ') : k;
    return `<button class="src" data-act="src" data-s="${s}" data-k="${esc(k)}"><b>${srcLabel(s)}</b> · ${esc(short)}</button>`;
  };
  const srcChips = src => `<div class="srcs">${src.map(srcChip).join('')}</div>`;
  const LV = { must: 'תנאי כשרות', pasul: 'פוסל', safek: 'מחלוקת / בירור', hiddur: 'הידור', info: 'הקלה / מידע' };
  const lvChip = lv => `<span class="lv ${lv}">${LV[lv]}</span>`;
  const chev = ic('chev', 'ic chev');

  function appbar({ title, crumb, pct, close }) {
    return `<header class="appbar"><div class="appbar-row">
        <button class="iconbtn" data-act="back" aria-label="חזרה">${ic('back')}</button>
        <div class="appbar-title">${title}</div>
        ${close ? `<button class="iconbtn" data-act="home" aria-label="למסך הראשי">${ic('close')}</button>` : '<span></span>'}
      </div>
      ${pct == null ? '' : `<div class="progress" role="progressbar" aria-valuenow="${Math.round(pct * 100)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.max(3, pct * 100)}%"></i></div>`}
      ${crumb ? `<p class="crumb">${crumb}</p>` : ''}</header>`;
  }
  const setPrefix = () => (S.mode === 'set' ? `סט מלא ${S.qi + 1}/${S.queue.length} · ` : '');
  const rrow = (item, cls) => {
    const r = AM.ruleById[item.rule];
    return `<button class="rrow" data-act="rule" data-r="${r.id}"><span class="dot ${cls}"></span>
      <span><span class="t">${esc(item.msg)}</span><br><span class="s">${esc(r.t)}</span></span>${chev}</button>`;
  };
  const infoBox = (n, icon) => `<div class="info">${ic(icon)}<div><b>${esc(n.t)}</b>${esc(n.d)}${srcChips(n.src)}</div></div>`;

  // ───────────── מסכים ─────────────
  function home() {
    const count = sp => E.visible(sp, 'k', {}, S.settings).length;
    const steps = [...AM.order, 'set'].map((sp, i) => `${i ? '<span class="ln"></span>' : ''}<span class="st">${ic(SPI[sp])}</span>`).join('');
    return `<div class="home-top"><span class="logo">${LOGO}ארבעת המינים</span>
        <button class="edah" data-act="edah">מנהג: <b>${EDAH[S.settings.edah]}</b></button></div>
      <header class="hero"><h1>בודק ארבעת המינים</h1>
        <p>כשרות קודם, הידור אחר כך — שאלה אחר שאלה, לפי ההלכות שבמקורות בלבד.</p></header>
      <button class="setcard" data-act="startSet">
        <span class="go">${ic('go')}</span>
        <span><span class="t">בדיקת סט מלא</span><br><span class="s">אתרוג, לולב, הדס, ערבה והאגד — ברצף אחד</span></span>
        <span class="steps5" aria-hidden="true">${steps}</span>
      </button>
      <h2 class="label">בדיקת מין בודד</h2>
      <div class="grid4">${AM.order.map(sp => `<button class="tile" data-act="start" data-sp="${sp}">${badge(sp)}
        <span><span class="n">${spDef(sp).name}</span><br><span class="m">${count(sp)} שאלות כשרות</span></span></button>`).join('')}</div>
      <h2 class="label">לימוד ותרגול</h2>
      <div class="list">
        <button class="row" data-act="learn">${badge('set').replace(ic('bundle'), ic('book'))}<span><span class="t">למד אותי לבדוק</span><br><span class="s">מה בודקים, באיזה סדר, ומה מעכב</span></span>${chev}</button>
        <button class="row" data-act="quiz">${badge('set').replace(ic('bundle'), ic('target'))}<span><span class="t">בחן אותי</span><br><span class="s">10 תרחישים: כשר, פסול או ספק?</span></span>${chev}</button>
        <button class="row" data-act="sources">${badge('set').replace(ic('bundle'), ic('doc'))}<span><span class="t">המקורות</span><br><span class="s">הטקסטים המלאים, מילה במילה</span></span>${chev}</button>
      </div>
      <div class="fine"><p>כל תשובה נגזרת משני המקורות שהוזנו בלבד. מקור ב' הוא העיקר; מקור א' משלים נושאים שמקור ב' אינו דן בהם, ומכריע כשמקור ב' מביא דעות בלי הכרעה. האפליקציה אינה תחליף לשאלת רב.</p></div>`;
  }

  function markOf(label) {
    if (label.startsWith('✓')) return ['yes', '✓', label.slice(1).trim()];
    if (label.startsWith('✕')) return ['no', '✕', label.slice(1).trim()];
    if (label.startsWith('?')) return ['unk', '?', label.slice(1).trim()];
    return ['opt', '', label];
  }

  function question() {
    const def = spDef(S.sp);
    const p = E.visible(S.sp, S.stage, ans(), S.settings);
    const i = Math.max(0, p.findIndex(q => q.id === S.cur));
    const q = p[i];
    const sel = ans()[q.id];
    const stageName = S.stage === 'k' ? 'בדיקת כשרות' : 'בדיקת הידור';
    const banner = S.mode === 'set' && def.setHint && S.stage === 'k' && i === 0 ? `<div class="banner">${ic('info')}<span>${esc(def.setHint)}</span></div>` : '';
    return appbar({ title: `<b>${def.name}</b> · ${S.stage === 'k' ? 'כשרות' : 'הידור'}`, pct: i / p.length, close: true,
      crumb: `${setPrefix()}${def.name} ← ${stageName} ← ${i + 1} מתוך ${p.length}` }) +
      `<section class="qcard">${banner}
        <span class="kind ${S.stage}"><i></i>${S.stage === 'k' ? 'כשרות — חובה' : 'הידור — לא מעכב'}</span>
        <h2 class="qtitle" id="qt">${esc(q.q)}</h2>
        ${q.hint ? `<p class="hint">${esc(q.hint)}</p>` : ''}
        ${q.img && ILL[q.img] ? `<div class="ill">${ILL[q.img]()}</div>` : ''}
        <button class="whybtn" data-act="why" data-q="${q.id}">${ic('info')}למה בודקים את זה?</button>
      </section>
      <div class="answers" role="group" aria-labelledby="qt">
        ${q.opts.map(o => { const [cls, sym, txt] = markOf(o.label);
          return `<button class="ans${sel === o.v ? ' sel' : ''}" data-act="answer" data-v="${esc(o.v)}"><span class="mk ${cls}">${sym}</span><span>${esc(txt)}</span></button>`; }).join('')}
      </div>`;
  }

  function nextLabel() {
    if (S.mode !== 'set') return 'למסך הראשי';
    const n = S.queue[S.qi + 1];
    return n ? `המשך ל${spDef(n).name}` : 'לסיכום הסט';
  }

  function result() {
    const def = spDef(S.sp);
    const r = E.evaluate(S.sp, ans(), S.settings);
    const v = VERDICT[r.verdict];
    let body = `<section class="status ${r.verdict}"><span class="ring">${ic(v.icon)}</span><h2>${v.t}</h2><p>${v.lead}</p></section>`;
    const group = (h, items, cls) => items.length ? `<div class="sect"><h3>${h}</h3><div class="list">${items.map(b => rrow(b, cls)).join('')}</div></div>` : '';
    body += group('מה פסל', r.bad, 'P');
    body += group(r.bad.length ? 'נקודות נוספות לבירור' : 'מה דורש בירור', r.doubt, 'S');
    body += group('שים לב', r.warn, 'W');
    body += group('לפני הנטילה', r.notes, 'N');
    if (r.verdict === 'P') body += `<div class="sect">${r.day1 ? infoBox(AM.notes.day1, 'cal') : ''}${infoBox(AM.notes.duress, 'hand')}</div>`;
    if (r.ok.length) body += `<div class="sect"><details class="fold"${r.verdict === 'K' ? ' open' : ''}>
      <summary><span class="dot K"></span>${r.verdict === 'K' ? 'למה כשר? ' : ''}נבדקו ונמצאו תקינים · ${r.ok.length}${chev}</summary>
      ${r.ok.map(o => rrow(o, 'K')).join('')}</details></div>`;
    let acts = '';
    if (r.verdict !== 'P') acts += `<button class="btn primary" data-act="toHiddur">${ic('spark')}${r.verdict === 'S' ? 'בדיקת הידור (הכשרות בספק)' : 'המשך לבדיקת ההידור'}</button>`;
    if (S.mode === 'set') acts += `<button class="btn ${r.verdict === 'P' ? 'primary' : 'text'}" data-act="next">${r.verdict === 'P' ? nextLabel() : 'דלג על ההידור — ' + nextLabel()}</button>`;
    else acts += `<button class="btn ${r.verdict === 'P' ? 'primary' : 'text'}" data-act="home">בדוק מין אחר</button>`;
    return appbar({ title: `<b>${def.name}</b> · תוצאת כשרות`, crumb: setPrefix() ? setPrefix().replace(/ · $/, '') : '' }) + body + `<div class="cta">${acts}</div>`;
  }

  function donut(pct, text) {
    const C = 2 * Math.PI * 50, off = pct == null ? C : C * (1 - pct);
    return `<div class="donut"><svg viewBox="0 0 116 116" aria-hidden="true"><circle class="trk" cx="58" cy="58" r="50" fill="none" stroke-width="10"/>
      <circle class="val" cx="58" cy="58" r="50" fill="none" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/></svg><span>${text}</span></div>`;
  }
  const starRow = n => `<div class="stars" aria-label="${n} מתוך 5 כוכבים">${Array.from({ length: 5 }, (_, i) => `<b class="${i < n ? '' : 'off'}" style="animation-delay:${i * 70}ms">★</b>`).join('')}</div>`;

  function hresult() {
    const def = spDef(S.sp);
    const r = E.evaluate(S.sp, ans(), S.settings);
    const sc = E.score(S.sp, r.marks);
    const pct = sc.pct === null ? null : Math.round(sc.pct * 100);
    const lead = sc.determined === 0
      ? 'לא נקבע אף מאפיין הידור, ולכן הדירוג הוא הבסיסי: כשר.'
      : `התקיימו ${sc.plus} מתוך ${sc.determined} מאפייני הידור שנקבעו.${sc.unknown ? ` ${sc.unknown} לא ניתן לקבוע, ולא נספרו.` : ''}`;
    const groups = [['+', 'התקיימו', 'plus', '✓'], ['-', 'לא התקיימו — אינם פוסלים', 'minus', '○'], ['?', 'לא ניתן לקבוע', 'unk', '?'], [null, 'לא רלוונטי למין זה', 'na', '—']];
    const lists = groups.map(([st, h, cls, sym]) => {
      const items = sc.items.filter(it => it.st === st);
      return items.length ? `<div class="sect"><h3>${h}</h3><div class="list">${items.map(it =>
        `<button class="hrow ${cls}" data-act="rule" data-r="${it.rule}"><span class="hmk ${cls}">${sym}</span><span class="t">${esc(it.label)}</span>${chev}</button>`).join('')}</div></div>` : '';
    }).join('');
    const warn = r.verdict === 'S' ? `<div class="sect"><div class="info">${ic('alert')}<div><b>הכשרות עדיין בספק</b>רמת ההידור רלוונטית רק אחרי בירור הכשרות אצל רב.</div></div></div>` : '';
    const acts = S.mode === 'set'
      ? `<button class="btn primary" data-act="next">${nextLabel()}</button>`
      : `<button class="btn primary" data-act="home">למסך הראשי</button><button class="btn text" data-act="start" data-sp="${S.sp}">בדוק ${def.name} נוסף</button>`;
    return appbar({ title: `<b>${def.name}</b> · רמת הידור`, crumb: setPrefix() ? setPrefix().replace(/ · $/, '') : '' }) + `
      <section class="cert">${donut(sc.pct, pct === null ? '—' : pct + '%')}${starRow(sc.stars)}
        <h2>${E.STAR_LABEL[sc.stars]}</h2><p class="lead">${lead}</p>
        <p class="formula">הדירוג מחושב רק ממאפייני ההידור שבמקורות, במשקל שווה: 100% ← ★★★★★ מהודר מאוד · 60% ומעלה ← ★★★★ מהודר · פחות ← ★★★ כשר. חוסר הידור לעולם אינו פוסל.</p></section>
      ${warn}${lists}<div class="cta">${acts}</div>`;
  }

  function summary() {
    const rows = S.queue.map(sp => {
      const r = E.evaluate(sp, S.answers[sp] || {}, S.settings);
      const sc = E.score(sp, r.marks);
      const st = r.verdict === 'P' ? 'ללא דירוג הידור' : `${'★'.repeat(sc.stars)} ${E.STAR_LABEL[sc.stars]}`;
      return { r, html: `<button class="tlrow" data-act="review" data-sp="${sp}">${badge(sp)}
        <span><span class="t">${spDef(sp).name}</span><br><span class="s">${st}</span></span><span class="pill ${r.verdict}">${PILL[r.verdict]}</span></button>` };
    });
    const worst = rows.some(x => x.r.verdict === 'P') ? 'P' : rows.some(x => x.r.verdict === 'S') ? 'S' : 'K';
    const lead = { K: 'כל המינים והאגד תקינים לפי הנתונים שהוזנו.', S: 'לפחות שלב אחד דורש בירור אצל רב. לחץ עליו לפרטים.', P: 'לפחות מין אחד פסול. החלף אותו ובדוק שוב.' }[worst];
    const title = { K: 'הסט כשר לפי הנתונים שהוזנו', S: 'הסט דורש שאלת רב', P: 'בסט יש מין פסול' }[worst];
    return appbar({ title: '<b>סט מלא</b> · סיכום', pct: 1 }) + `
      <section class="status ${worst}"><span class="ring">${ic(VERDICT[worst].icon)}</span><h2>${title}</h2><p>${lead}</p></section>
      <div class="sect"><h3>לפי שלב — לחץ לפרטים</h3><div class="tl">${rows.map(x => x.html).join('')}</div></div>
      <div class="cta"><button class="btn primary" data-act="home">למסך הראשי</button><button class="btn text" data-act="startSet">בדיקת סט חדש</button></div>`;
  }

  const LEARN_FIRST = { etrog: ['E23', 'E19', 'E22'], lulav: ['L01'], hadas: ['H01', 'H03'], arava: ['A01', 'A02', 'A03'] };
  const ruleCard = r => `<details class="rule"><summary>${lvChip(r.lv)}<span>${esc(r.t)}</span>${chev}</summary>
    <div class="rb"><p>${esc(r.d)}</p>${r.dis ? `<p class="dis">${esc(r.dis)}</p>` : ''}${srcChips(r.src)}</div></details>`;
  function learn() {
    const sp = S.learnSp, def = spDef(sp);
    const first = LEARN_FIRST[sp];
    const seen = new Set(first);
    const then = [];
    for (const q of def.questions) if (q.stage === 'k') for (const id of q.rules) {
      const r = AM.ruleById[id];
      if (!seen.has(id) && r.lv !== 'hiddur' && r.lv !== 'info') { seen.add(id); then.push(r); }
    }
    const mine = AM.rules.filter(r => r.sp === sp);
    const stops = mine.filter(r => r.lv === 'pasul' || r.lv === 'safek');
    const step = (n, cls, t, inner) => `<section class="lstep ${cls}"><span class="num">${n}</span><div><h3>${t}</h3><div class="body">${inner}</div></div></section>`;
    return appbar({ title: '<b>למד אותי לבדוק</b>' }) + `
      <header class="page-h"><h2>איך בודקים ${def.name}</h2><p>הסדר המומלץ לבדיקה, כפי שהוא עולה מהמקורות. לחץ על כלל לפרטים ולמקור.</p></header>
      <div class="seg" role="tablist">${AM.order.map(s => `<button role="tab" aria-selected="${s === sp}" class="${s === sp ? 'on' : ''}" data-act="learnSp" data-sp="${s}">${ic(SPI[s])}${spDef(s).name}</button>`).join('')}</div>
      <div class="lsteps">
        ${step(1, '', 'מה בודקים קודם', first.map(id => ruleCard(AM.ruleById[id])).join(''))}
        ${step(2, '', 'מה בודקים אחר כך', then.map(ruleCard).join(''))}
        ${step(3, 'stop', 'מה מעכב — סיכום מהיר', `<div class="chips">${stops.map(r => `<span class="chipx${r.lv === 'safek' ? ' S' : ''}">${esc(r.t)}</span>`).join('')}</div><p class="legend">אדום — פוסל · כתום — מחלוקת או חשש, שאלת רב</p>`)}
        ${step(4, 'gold', 'מה רק הידור — לא מעכב', mine.filter(r => r.lv === 'hiddur').map(ruleCard).join(''))}
        ${step('+', 'plus', 'הקלות וטיפים', mine.filter(r => r.lv === 'info').map(ruleCard).join(''))}
      </div>
      <div class="cta"><button class="btn primary" data-act="start" data-sp="${sp}">בדוק ${def.name} עכשיו</button></div>`;
  }

  function newQuiz() {
    const idx = AM.quiz.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    S.quiz = { order: idx.slice(0, 10), i: 0, picked: null, right: 0, log: [] };
  }
  function quiz() {
    const z = S.quiz, n = z.order.length;
    const dots = `<div class="qdots" aria-hidden="true">${z.order.map((_, k) => `<i class="${k < z.log.length ? (z.log[k] ? 'done' : 'miss') : k === z.i ? 'now' : ''}"></i>`).join('')}</div>`;
    if (z.i >= n) {
      const msg = z.right === n ? 'מושלם. אתה בודק מצוין.' : z.right >= 7 ? 'טוב מאוד. כדאי לעבור על מה שטעית בו במצב "למד אותי".' : 'כדאי לעבור על "למד אותי" ולנסות שוב.';
      return appbar({ title: '<b>בחן אותי</b> · סיום' }) + dots + `<section class="cert">${donut(z.right / n, `${z.right}/${n}`)}<h2>${z.right} תשובות נכונות</h2><p class="lead">${msg}</p></section>
        <div class="cta"><button class="btn primary" data-act="quizAgain">סבב נוסף</button><button class="btn text" data-act="home">למסך הראשי</button></div>`;
    }
    const item = AM.quiz[z.order[z.i]];
    const names = { K: 'כשר', P: 'פסול', S: 'ספק' };
    const btn = k => {
      let cls = `qb ${k}`;
      if (z.picked) { if (k === item.ans) cls += ' right'; else if (k === z.picked) cls += ' wrong'; }
      return `<button class="${cls}" data-act="pick" data-v="${k}"${z.picked ? ' disabled' : ''}><span class="d"></span>${names[k]}</button>`;
    };
    let fb = '';
    if (z.picked) {
      const good = z.picked === item.ans;
      fb = `<div class="fb ${good ? 'good' : 'badf'}"><p class="h">${good ? 'נכון!' : `התשובה: ${names[item.ans]}`}</p><p>${esc(item.ex)}</p>
        ${item.rules.map(id => srcChips(AM.ruleById[id].src)).join('')}</div>
        <div class="cta"><button class="btn primary" data-act="quizNext">${z.i + 1 < n ? 'לתרחיש הבא' : 'לתוצאה'}</button></div>`;
    }
    return appbar({ title: '<b>בחן אותי</b>', crumb: `תרחיש ${z.i + 1} מתוך ${n}` }) + dots + `
      <section class="scard">${badge(item.sp)}<p class="q">${esc(item.text)}</p><p class="ask">מה הדין ביום טוב ראשון?</p></section>
      <div class="qbtns">${['K', 'P', 'S'].map(btn).join('')}</div>${fb}`;
  }

  function sources() {
    const block = (s, title, sub) => `<div class="sect"><h3>${title}</h3><p class="legend" style="padding-inline:4px">${sub}</p>
      ${Object.values(AM.sources[s]).map(sec => `<details class="rule"><summary><span>${esc(sec.title)}</span>${chev}</summary><div class="rb"><p class="quote">${esc(sec.text)}</p></div></details>`).join('')}</div>`;
    return appbar({ title: '<b>המקורות</b>' }) + `<header class="page-h"><h2>המקורות</h2><p>הטקסטים המלאים שעליהם בנויה האפליקציה, מילה במילה.</p></header>
      ${block('B', "מקור ב' — העיקר", 'לולב, אתרוג, הדס וערבה. ההערות הממוספרות שבמקור לא נמסרו, ולכן הושמטו.')}
      ${block('A', "מקור א' — משלים", 'הלכות לולב, סימנים תרמה–תרנ. בסימן תרמח אין סעיף כד במקור.')}`;
  }

  // ───────────── גיליונות ─────────────
  function sheetHTML(sh) {
    if (sh.type === 'why') {
      const q = spDef(sh.sp).questions.find(x => x.id === sh.q);
      return `<p class="eyebrow">למה בודקים את זה?</p><h3>${esc(q.q)}</h3>
        <span class="kind ${q.stage}"><i></i>${q.stage === 'k' ? 'כשרות — חובה' : 'הידור — לא מעכב'}</span>
        <p class="body">${esc(q.why)}</p>
        <div class="list">${q.rules.map(id => { const r = AM.ruleById[id]; return `<button class="rrow" data-act="rule" data-r="${id}"><span class="dot ${r.lv === 'pasul' ? 'P' : r.lv === 'safek' ? 'S' : 'K'}"></span><span><span class="t">${esc(r.t)}</span><br><span class="s">${LV[r.lv]} · מקור וטקסט מלא</span></span>${chev}</button>`; }).join('')}</div>`;
    }
    if (sh.type === 'rule') {
      const r = AM.ruleById[sh.r];
      return `<p class="eyebrow">${lvChip(r.lv)}</p><h3>${esc(r.t)}</h3><p class="body">${esc(r.d)}</p>
        ${r.dis ? `<p class="dis">${esc(r.dis)}</p>` : ''}<p class="eyebrow">מקורות — לחץ לטקסט המלא</p>${srcChips(r.src)}`;
    }
    if (sh.type === 'src') {
      const sec = AM.sources[sh.s][sh.k];
      return `<p class="eyebrow">${srcLabel(sh.s)} — ${sh.s === 'B' ? 'העיקר' : 'משלים'}</p><h3>${esc(sec.title)}</h3><p class="quote">${esc(sec.text)}</p>`;
    }
    if (sh.type === 'edah') {
      return `<p class="eyebrow">הגדרה</p><h3>המנהג שלך</h3><p class="body">משפיע על מאפיין הידור אחד בלבד: לולב עם קור"א (קליפה אדומה). ספרדים נהגו להדר בו; לאשכנזים עדיף לולב שתיומתו סגורה וגלויה, בלי קור"א.</p>
        ${srcChips([['B', 'לולב 4']])}
        <div class="opts">${Object.entries(EDAH).map(([k, v]) => `<button class="ans${S.settings.edah === k ? ' sel' : ''}" data-act="setEdah" data-v="${k}"><span class="mk opt"></span><span>${v}</span></button>`).join('')}</div>`;
    }
    return '';
  }
  function renderSheet() {
    const old = document.getElementById('scrim');
    if (old) old.remove();
    const sh = S.sheets[S.sheets.length - 1];
    if (!sh) return;
    const el = document.createElement('div');
    el.id = 'scrim'; el.className = 'scrim';
    el.innerHTML = `<div class="sheet" dir="rtl" lang="he" role="dialog" aria-modal="true"><span class="grab" aria-hidden="true"></span>${sheetHTML(sh)}
      <button class="btn ghost close" data-act="closeSheet">${S.sheets.length > 1 ? 'חזרה' : 'סגירה'}</button></div>`;
    document.body.appendChild(el);
    el.querySelector('.close').focus({ preventScroll: true });
  }

  // ───────────── ניווט ─────────────
  let lastScreen = null;
  function render(scrollTop = true) {
    const view = { home, q: question, result, hresult, summary, learn, quiz, sources }[S.screen];
    $app.innerHTML = `<div class="screen${S.screen !== lastScreen ? ' enter' : ''}">${view()}</div>`;
    lastScreen = S.screen;
    if (scrollTop) window.scrollTo(0, 0);
    const h = $app.querySelector('.qtitle, .status h2, .cert h2, .page-h h2');
    if (h && S.screen !== 'home') { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }
  function startSpecies(sp) {
    S.sp = sp; S.stage = 'k'; S.answers[sp] = {};
    S.cur = E.visible(sp, 'k', {}, S.settings)[0].id; S.screen = 'q';
  }
  function startHiddur() {
    S.stage = 'h';
    const list = E.visible(S.sp, 'h', ans(), S.settings);
    if (list.length) { S.cur = list[0].id; S.screen = 'q'; } else S.screen = 'hresult';
  }
  function answer(v) {
    ans()[S.cur] = v;
    const list = E.visible(S.sp, S.stage, ans(), S.settings);
    const i = list.findIndex(q => q.id === S.cur);
    const next = list[i + 1];
    if (next) S.cur = next.id;
    else S.screen = S.stage === 'k' ? 'result' : 'hresult';
  }
  function nextInSet() {
    if (S.mode !== 'set') { S.screen = 'home'; return; }
    S.qi++;
    if (S.qi >= S.queue.length) { S.screen = 'summary'; return; }
    const sp = S.queue[S.qi];
    if (S.reviewing && S.answers[sp] && Object.keys(S.answers[sp]).length) { S.sp = sp; S.stage = 'k'; S.screen = 'result'; return; }
    startSpecies(sp);
  }
  function back() {
    if (S.screen === 'q') {
      const list = E.visible(S.sp, S.stage, ans(), S.settings);
      const i = list.findIndex(q => q.id === S.cur);
      if (i > 0) { S.cur = list[i - 1].id; return; }
      if (S.stage === 'h') { S.stage = 'k'; S.screen = 'result'; return; }
      if (S.mode === 'set' && S.qi > 0) { S.qi--; S.sp = S.queue[S.qi]; S.screen = 'result'; return; }
      S.screen = 'home'; return;
    }
    if (S.screen === 'result') {
      S.stage = 'k';
      const list = E.visible(S.sp, 'k', ans(), S.settings);
      S.cur = list[list.length - 1].id; S.screen = 'q'; return;
    }
    if (S.screen === 'hresult') {
      const list = E.visible(S.sp, 'h', ans(), S.settings);
      if (list.length) { S.stage = 'h'; S.cur = list[list.length - 1].id; S.screen = 'q'; } else { S.stage = 'k'; S.screen = 'result'; }
      return;
    }
    if (S.screen === 'summary') { S.qi = S.queue.length - 1; S.sp = S.queue[S.qi]; S.screen = 'hresult'; return; }
    S.screen = 'home';
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) { if (e.target.id === 'scrim') { S.sheets = []; renderSheet(); } return; }
    const d = b.dataset;
    switch (d.act) {
      case 'start': S.sheets = []; renderSheet(); S.mode = 'single'; S.queue = []; S.qi = 0; startSpecies(d.sp); break;
      case 'startSet': S.mode = 'set'; S.queue = [...AM.order, 'set']; S.qi = 0; S.reviewing = false; startSpecies('etrog'); break;
      case 'answer': answer(d.v); break;
      case 'toHiddur': startHiddur(); break;
      case 'next': nextInSet(); break;
      case 'home': S.screen = 'home'; break;
      case 'back': back(); break;
      case 'review': S.reviewing = true; S.qi = S.queue.indexOf(d.sp); S.sp = d.sp; S.stage = 'k'; S.screen = 'result'; break;
      case 'learn': S.screen = 'learn'; break;
      case 'learnSp': S.learnSp = d.sp; render(false); return;
      case 'quiz': newQuiz(); S.screen = 'quiz'; break;
      case 'quizAgain': newQuiz(); break;
      case 'pick': if (!S.quiz.picked) { const ok = d.v === AM.quiz[S.quiz.order[S.quiz.i]].ans; S.quiz.picked = d.v; S.quiz.log.push(ok); if (ok) S.quiz.right++; } render(false); return;
      case 'quizNext': S.quiz.i++; S.quiz.picked = null; break;
      case 'sources': S.screen = 'sources'; break;
      case 'why': S.sheets.push({ type: 'why', sp: S.sp, q: d.q }); renderSheet(); return;
      case 'rule': S.sheets.push({ type: 'rule', r: d.r }); renderSheet(); return;
      case 'src': S.sheets.push({ type: 'src', s: d.s, k: d.k }); renderSheet(); return;
      case 'edah': S.sheets = [{ type: 'edah' }]; renderSheet(); return;
      case 'setEdah': S.settings.edah = d.v; store.set('am.edah', d.v); S.sheets = []; renderSheet(); render(false); return;
      case 'closeSheet': S.sheets.pop(); renderSheet(); return;
      default: return;
    }
    render();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && S.sheets.length) { S.sheets.pop(); renderSheet(); } });

  render();
})(window.AM);
