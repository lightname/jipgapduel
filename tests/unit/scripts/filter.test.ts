import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { RawTradeItem } from '../../../scripts/data/collect';
import { excludeReason, filterTrades, outlierCheck } from '../../../scripts/data/filter';
import { normalizeItem, normalizeTrades, type NormalizedTrade } from '../../../scripts/data/normalize';

function makeTrade(over: Partial<NormalizedTrade> = {}): NormalizedTrade {
  return {
    id: 'C1-20261015-10-84-100000',
    complexId: 'C1',
    complexName: '테스트단지',
    lawdCode: '11680',
    umdName: '삼성동',
    jibun: '1-1',
    roadAddr: '테헤란로 1',
    buildYear: 2010,
    areaM2: 84,
    floor: 10,
    dealDate: '2026-10-15',
    dealYm: '2026-10',
    price: 100000,
    dealingGbn: '중개거래',
    cancelled: false,
    buyerGbn: '개인',
    slerGbn: '개인',
    landLeasehold: false,
    ...over,
  };
}

describe('normalize and filter (C-19)', () => {
  it('normalizes all 412 fixture items and matches measured filter counts', () => {
    const file = join(process.cwd(), 'tests/fixtures/rtms-005-202610.json');
    const raw = (JSON.parse(readFileSync(file, 'utf8')) as { items: RawTradeItem[] }).items;
    expect(raw).toHaveLength(412);
    expect(raw.every((item) => normalizeItem(item) !== null)).toBe(true);

    const normalized = normalizeTrades(raw);
    expect(normalized).toHaveLength(408);

    const strict = filterTrades(normalized, { fetchedCount: raw.length });
    expect(strict.counts).toEqual({
      fetched: 412,
      afterCancel: 406,
      afterDirect: 395,
      afterNonIndividual: 390,
      afterLeasehold: 388,
      afterOutlier: 30,
    });
    expect(strict.trades).toHaveLength(30);

    const sample = filterTrades(normalized, { sample: true, fetchedCount: raw.length });
    expect(sample.counts.afterOutlier).toBe(388);
    expect(sample.trades).toHaveLength(388);
  });

  it('classifies each R-03 exclusion reason in order', () => {
    expect(excludeReason(makeTrade({ cancelled: true }))).toBe('cancel');
    expect(excludeReason(makeTrade({ dealingGbn: '직거래' }))).toBe('direct');
    expect(excludeReason(makeTrade({ buyerGbn: '법인' }))).toBe('nonIndividual');
    expect(excludeReason(makeTrade({ slerGbn: '법인' }))).toBe('nonIndividual');
    expect(excludeReason(makeTrade({ landLeasehold: true }))).toBe('leasehold');
    expect(excludeReason(makeTrade())).toBeNull();
  });

  it('checks outlier ±40% boundary, min comps, lookback window, and area tolerance', () => {
    const comp1 = makeTrade({ id: 'comp-1', dealDate: '2026-09-01', price: 100000, areaM2: 84 });
    const comp2 = makeTrade({ id: 'comp-2', dealDate: '2026-08-01', price: 100000, areaM2: 84 });

    expect(outlierCheck(makeTrade({ price: 140000 }), [comp1, comp2])).toBe('pass');
    expect(outlierCheck(makeTrade({ price: 140100 }), [comp1, comp2])).toBe('outlier');
    expect(outlierCheck(makeTrade({ price: 100000 }), [comp1])).toBe('insufficient');

    const exact12m = makeTrade({ id: 'exact-12m', dealDate: '2025-10-15', price: 100000 });
    const over12m = makeTrade({ id: 'over-12m', dealDate: '2025-10-14', price: 100000 });
    expect(outlierCheck(makeTrade(), [comp1, exact12m])).toBe('pass');
    expect(outlierCheck(makeTrade(), [comp1, over12m])).toBe('insufficient');

    const area30 = makeTrade({ id: 'area-30', dealDate: '2026-07-01', areaM2: 87, price: 103571 });
    const area301 = makeTrade({ id: 'area-301', dealDate: '2026-07-01', areaM2: 87.01, price: 103583 });
    expect(outlierCheck(makeTrade(), [comp1, area30])).toBe('pass');
    expect(outlierCheck(makeTrade(), [comp1, area301])).toBe('insufficient');
  });
});
