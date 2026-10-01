import { describe, it, expect } from 'vitest';
import { tokenize, matchKeyword, applyFilters, type Card } from '../src/lib/filter.js';

const cards: Card[] = [
  {
    id: 1, kind: '狗', variety: '混種犬', sex: '公', bodytype: '中型', age: '成年',
    sterilization: '已絕育', colour: '黑色', county: '台北市', shelter: '台北市動物之家',
    shelterId: 'PS01', openDate: '2026-10-01', longTermOpen: true, photo: '', subId: 'S1',
    foundPlace: '信義路', remark: '親人',
  },
  {
    id: 2, kind: '貓', variety: '米克斯', sex: '母', bodytype: '小型', age: '幼年',
    sterilization: '未絕育', colour: '白色', county: '新北市', shelter: '板橋收容所',
    shelterId: null, openDate: '2026-09-01', longTermOpen: false, photo: '', subId: 'S2',
    foundPlace: '公園', remark: '害羞',
  },
];

describe('tokenize', () => {
  it('cjk bigram + alnum lower', () => {
    expect(tokenize('混種犬')).toContain('混種');
    expect(tokenize('S151001')).toContain('s151001');
  });
});

describe('matchKeyword', () => {
  it('matches subId/variety/colour/foundPlace/remark', () => {
    expect(matchKeyword(cards[0], 's1')).toBe(true);
    expect(matchKeyword(cards[0], '黑色')).toBe(true);
    expect(matchKeyword(cards[0], '信義')).toBe(true);
    expect(matchKeyword(cards[1], '黑色')).toBe(false);
  });
});

describe('applyFilters', () => {
  it('filters by kind + county + keyword', () => {
    expect(applyFilters(cards, { kind: '貓' })).toHaveLength(1);
    expect(applyFilters(cards, { county: '台北市' })[0].id).toBe(1);
    expect(applyFilters(cards, { keyword: '害羞' })[0].id).toBe(2);
    expect(applyFilters(cards, {})).toHaveLength(2);
  });
});
