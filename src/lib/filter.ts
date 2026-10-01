export interface Card {
  id: number;
  kind: string;
  variety: string;
  sex: string;
  bodytype: string;
  age: string;
  sterilization: string;
  colour: string;
  county: string;
  shelter: string;
  shelterId: string | null;
  openDate: string;
  longTermOpen: boolean;
  photo: string;
  subId: string;
  foundPlace: string;
  remark: string;
}

export interface Filters {
  kind?: string;
  sex?: string;
  bodytype?: string;
  age?: string;
  sterilization?: string;
  county?: string;
  shelter?: string;
  keyword?: string;
}

export function tokenize(q: string): string[] {
  const s = q.toLowerCase().trim();
  if (!s) return [];
  const out: string[] = [];
  const compact = s.replace(/\s+/g, '');
  if (/^[a-z0-9]+$/.test(compact)) out.push(compact);
  for (let i = 0; i < compact.length; i++) {
    const ch = compact[i];
    if (ch.charCodeAt(0) > 127) {
      if (i + 1 < compact.length) out.push(compact.slice(i, i + 2));
      else out.push(ch);
    } else {
      let j = i;
      while (j < compact.length && compact.charCodeAt(j) <= 127) j++;
      const word = compact.slice(i, j);
      if (word.length > 1 && !out.includes(word)) out.push(word);
      i = j - 1;
    }
  }
  return [...new Set(out)];
}

const keywordFields = (c: Card): string =>
  `${c.subId} ${c.variety} ${c.colour} ${c.foundPlace} ${c.remark}`.toLowerCase();

export function matchKeyword(card: Card, keyword: string): boolean {
  const tokens = tokenize(keyword);
  if (tokens.length === 0) return true;
  const hay = keywordFields(card);
  return tokens.every((t) => hay.includes(t));
}

export function applyFilters(cards: Card[], f: Filters): Card[] {
  return cards.filter((c) => {
    if (f.kind && c.kind !== f.kind) return false;
    if (f.sex && c.sex !== f.sex) return false;
    if (f.bodytype && c.bodytype !== f.bodytype) return false;
    if (f.age && c.age !== f.age) return false;
    if (f.sterilization && c.sterilization !== f.sterilization) return false;
    if (f.county && c.county !== f.county) return false;
    if (f.shelter && c.shelter !== f.shelter) return false;
    if (f.keyword && !matchKeyword(c, f.keyword)) return false;
    return true;
  });
}
