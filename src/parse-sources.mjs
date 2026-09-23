// Parses the two verbatim source files into addressable sections.
// A: "סימן תרמה" + Hebrew-numeral paragraphs  -> key "תרמה ד"
// B: "א. לולב" + "1. אורך הלולב" subsections  -> key "לולב 1"
import { readFileSync } from 'node:fs';

export function hebNum(n) {
  const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע'];
  if (n === 15) return 'טו';
  if (n === 16) return 'טז';
  return tens[Math.floor(n / 10)] + ones[n % 10];
}
const NUM = new Map(Array.from({ length: 79 }, (_, i) => [hebNum(i + 1), i + 1]));

export function parseA(text) {
  const out = {};
  let siman = null, simanTitle = '', last = 0, cur = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const s = line.match(/^סימן (\S+) - (.+)$/);
    if (s) { siman = s[1]; simanTitle = s[2]; last = 0; cur = null; continue; }
    if (!siman) continue;
    const p = line.match(/^(\S{1,2}) (.+)$/);
    if (p && NUM.has(p[1]) && NUM.get(p[1]) > last) {
      last = NUM.get(p[1]);
      const key = `${siman} ${p[1]}`;
      cur = out[key] = { title: `סימן ${siman} (${simanTitle}), סעיף ${p[1]}`, text: p[2] };
    } else if (cur) {
      cur.text += ' ' + line; // continuation line
    }
  }
  return out;
}

export function parseB(text) {
  const out = {};
  let sp = null, last = 0, cur = null;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/ /g, ' ').trim();
    if (!line) continue;
    const h = line.match(/^[א-ת]\. (לולב|אתרוג|הדס|ערבה)$/);
    if (h) { sp = h[1]; last = 0; cur = null; continue; }
    if (!sp) continue;
    const s = line.match(/^(\d+)\. (.+)$/);
    if (s && Number(s[1]) === last + 1 && s[2].length < 60) {
      last = Number(s[1]);
      const key = `${sp} ${last}`;
      cur = out[key] = { title: `${sp} › ${last}. ${s[2].replace(/\[\d+\]/g, '').trim()}`, text: '' };
    } else if (cur) {
      cur.text += (cur.text ? '\n' : '') + line.replace(/\[\d+\]/g, '');
    }
  }
  return out;
}

export function loadSources(dir) {
  return {
    A: parseA(readFileSync(`${dir}/source-a.md`, 'utf8')),
    B: parseB(readFileSync(`${dir}/source-b.md`, 'utf8')),
  };
}
