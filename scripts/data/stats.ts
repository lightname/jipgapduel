import type { Stats } from '../../src/lib/stats';
import type { EnrichedTrade, PoolData } from './build-pool';
import type { FilterCounts } from './filter';
import { PAIRS, STATS_BANDS } from './rules';

function medianInt(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  const raw = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return Math.round(raw);
}

export function buildStats(opts: {
  allFilteredTrades: EnrichedTrade[];
  filterCounts: FilterCounts;
  pool: PoolData;
}): Stats {
  const { allFilteredTrades, filterCounts, pool } = opts;

  const sggBuckets = new Map<string, { name: string; prices: number[] }>();
  for (const t of allFilteredTrades) {
    const cur = sggBuckets.get(t.sggCode) ?? { name: t.sggName, prices: [] };
    cur.prices.push(t.price);
    sggBuckets.set(t.sggCode, cur);
  }

  const bySgg = [...sggBuckets.entries()]
    .filter(([, v]) => v.prices.length >= STATS_BANDS.minSggCount)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, v]) => ({
      code,
      name: v.name,
      median: medianInt(v.prices),
      count: v.prices.length,
    }));

  const byArea = STATS_BANDS.area.map((b) => {
    const prices = allFilteredTrades
      .filter((t) => t.areaM2 > b.min && t.areaM2 <= b.max)
      .map((t) => t.price);
    return { band: b.band, median: medianInt(prices), count: prices.length };
  });

  const byAge = STATS_BANDS.age.map((b) => {
    const prices = allFilteredTrades
      .filter((t) => {
        const age = Number(t.dealYm.slice(0, 4)) - t.buildYear;
        return age >= b.min && age <= b.max;
      })
      .map((t) => t.price);
    return { band: b.band, median: medianInt(prices), count: prices.length };
  });

  return {
    schemaVersion: 1,
    generatedAt: pool.generatedAt,
    poolVersion: pool.poolVersion,
    period: pool.period,
    sggCount: pool.sgg.length,
    counts: {
      ...filterCounts,
      poolTrades: pool.trades.length,
    },
    pairBands: {
      easy: { count: pool.pairs.easy.length, minPct: PAIRS.bands.easy.min, maxPct: null },
      medium: {
        count: pool.pairs.medium.length,
        minPct: PAIRS.bands.medium.min,
        maxPct: PAIRS.bands.medium.max,
      },
      hard: {
        count: pool.pairs.hard.length,
        minPct: PAIRS.bands.hard.min,
        maxPct: PAIRS.bands.hard.max,
      },
    },
    bySgg,
    byArea,
    byAge,
  };
}
