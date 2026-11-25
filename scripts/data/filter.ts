import type { NormalizedTrade } from './normalize';
import { OUTLIER } from './rules';

export type Reason = 'cancel' | 'direct' | 'nonIndividual' | 'leasehold';

export type FilterCounts = {
  fetched: number;
  afterCancel: number;
  afterDirect: number;
  afterNonIndividual: number;
  afterLeasehold: number;
  afterOutlier: number;
};

export function excludeReason(t: NormalizedTrade): Reason | null {
  if (t.cancelled) return 'cancel';
  if (t.dealingGbn.trim() === '직거래') return 'direct';
  if (t.buyerGbn.trim() !== '개인' || t.slerGbn.trim() !== '개인') return 'nonIndividual';
  if (t.landLeasehold) return 'leasehold';
  return null;
}

const median = (a: number[]) => {
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const minusMonths = (d: string, n: number) => {
  const x = new Date(`${d}T00:00:00Z`);
  x.setUTCMonth(x.getUTCMonth() - n);
  return x.toISOString().slice(0, 10);
};

export type OutlierResult = 'pass' | 'outlier' | 'insufficient';

export function outlierCheck(t: NormalizedTrade, sameComplex: NormalizedTrade[]): OutlierResult {
  const from = minusMonths(t.dealDate, OUTLIER.lookbackMonths);
  const comps = sameComplex
    .filter(
      (c) =>
        c.id !== t.id &&
        Math.abs(c.areaM2 - t.areaM2) <= OUTLIER.areaTolM2 + 1e-9 &&
        c.dealDate < t.dealDate &&
        c.dealDate >= from,
    )
    .sort((a, b) => b.dealDate.localeCompare(a.dealDate))
    .slice(0, OUTLIER.recentN);
  if (comps.length < OUTLIER.minComps) return 'insufficient';
  const ref = median(comps.map((c) => c.price / c.areaM2));
  return Math.abs(t.price / t.areaM2 / ref - 1) > OUTLIER.maxDev + 1e-9 ? 'outlier' : 'pass';
}

export function filterTrades(
  trades: NormalizedTrade[],
  opts: { sample?: boolean; fetchedCount?: number } = {},
): { trades: NormalizedTrade[]; counts: FilterCounts } {
  const fetched = opts.fetchedCount ?? trades.length;
  const step1 = trades.filter((t) => !t.cancelled);
  const step2 = step1.filter((t) => t.dealingGbn.trim() !== '직거래');
  const step3 = step2.filter(
    (t) => t.buyerGbn.trim() === '개인' && t.slerGbn.trim() === '개인',
  );
  const step4 = step3.filter((t) => !t.landLeasehold);

  const byComplex = new Map<string, NormalizedTrade[]>();
  for (const t of step4) {
    const list = byComplex.get(t.complexId);
    if (list) list.push(t);
    else byComplex.set(t.complexId, [t]);
  }

  const passed: NormalizedTrade[] = [];
  for (const t of step4) {
    const res = outlierCheck(t, byComplex.get(t.complexId) ?? []);
    if (res === 'pass' || (opts.sample && res === 'insufficient')) {
      passed.push(t);
    }
  }

  return {
    trades: passed,
    counts: {
      fetched,
      afterCancel: step1.length,
      afterDirect: step2.length,
      afterNonIndividual: step3.length,
      afterLeasehold: step4.length,
      afterOutlier: passed.length,
    },
  };
}
