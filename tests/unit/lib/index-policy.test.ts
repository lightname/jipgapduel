import { describe, expect, it } from 'vitest';
import { assertLevel, isIndexable, type PageInput } from '@/lib/seo/index-policy';

describe('isIndexable policy', () => {
  const cases: Array<{ name: string; input: PageInput; expected: [boolean, boolean, boolean, boolean] }> = [
    { name: 'landing', input: { kind: 'landing' }, expected: [true, true, true, true] },
    { name: 'game', input: { kind: 'game' }, expected: [true, true, true, true] },
    {
      name: 'guide reviewed with body',
      input: { kind: 'guide', reviewed: true, hasBody: true },
      expected: [false, true, true, true],
    },
    {
      name: 'guide unreviewed',
      input: { kind: 'guide', reviewed: false, hasBody: true },
      expected: [false, false, false, false],
    },
    {
      name: 'guide empty body',
      input: { kind: 'guide', reviewed: true, hasBody: false },
      expected: [false, false, false, false],
    },
    {
      name: 'complexDetail qualified',
      input: { kind: 'complexDetail', uniqueItems: { trades: 5, months: 3, coordOk: true } },
      expected: [false, false, true, true],
    },
    {
      name: 'complexDetail under threshold',
      input: { kind: 'complexDetail', uniqueItems: { trades: 4, months: 3, coordOk: true } },
      expected: [false, false, false, false],
    },
    {
      name: 'localized reviewed with body',
      input: { kind: 'localized', reviewed: true, hasBody: true },
      expected: [false, false, false, true],
    },
    { name: 'legal', input: { kind: 'legal' }, expected: [false, false, false, false] },
    { name: 'notFound', input: { kind: 'notFound' }, expected: [false, false, false, false] },
  ];

  for (const c of cases) {
    it(`evaluates ${c.name} across levels 1-4`, () => {
      expect([1, 2, 3, 4].map((lvl) => isIndexable(c.input, lvl))).toEqual(c.expected);
    });
  }

  it('blocks query, empty result, filter combo, and internal search', () => {
    expect(isIndexable({ kind: 'landing', hasQuery: true }, 4)).toBe(false);
    expect(isIndexable({ kind: 'landing', isEmptyResult: true }, 4)).toBe(false);
    expect(isIndexable({ kind: 'landing', isFilterCombo: true }, 4)).toBe(false);
    expect(isIndexable({ kind: 'landing', isInternalSearch: true }, 4)).toBe(false);
  });

  it('throws on out-of-range indexLevel', () => {
    expect(() => assertLevel(0)).toThrow();
    expect(() => assertLevel(5)).toThrow();
  });
});
