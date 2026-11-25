import { hashString, mulberry32 } from '../../src/features/game/logic/random';
import { diffPct } from '../../src/lib/format';
import type { GeocodedComplex } from './geocode';
import type { NormalizedTrade } from './normalize';
import type { SggOutput } from './boundary';
import { PAIRS, POOL } from './rules';

export type PoolComplex = {
  id: string;
  name: string;
  sggCode: string;
  umd: string;
  buildYear: number;
  lat: number;
  lng: number;
  coordSource: 'parcel' | 'road' | 'dong' | 'sgg';
};

export type PoolTrade = {
  id: string;
  complexId: string;
  areaM2: number;
  floor: number;
  dealYm: string;
  price: number;
};

export type PoolData = {
  schemaVersion: 1;
  poolVersion: string;
  generatedAt: string;
  period: { from: string; to: string };
  sgg: SggOutput[];
  complexes: PoolComplex[];
  trades: PoolTrade[];
  pairs: {
    easy: [number, number][];
    medium: [number, number][];
    hard: [number, number][];
  };
};

export function quotas(countBySgg: Map<string, number>, max: number, min: number): Map<string, number> {
  const total = [...countBySgg.values()].reduce((a, b) => a + b, 0);
  if (total === 0) return new Map();
  const q = new Map(
    [...countBySgg].map(([k, n]) => [k, Math.min(n, Math.max(min, Math.floor((max * n) / total)))]),
  );
  const sum = [...q.values()].reduce((a, b) => a + b, 0);
  if (sum > max) {
    const over = [...q].filter(([, v]) => v > min);
    const extra = over.reduce((a, [, v]) => a + v - min, 0);
    if (extra > 0) {
      const f = (extra - (sum - max)) / extra;
      for (const [k, v] of over) q.set(k, min + Math.floor((v - min) * f));
    }
  }
  return q;
}

export function makePairs(
  trades: { complexId: string; price: number }[],
  band: { min: number; max: number },
  target: number,
  seed: string,
): [number, number][] {
  const rnd = mulberry32(hashString(`${seed}|${band.min}`));
  const seen = new Set<string>();
  const out: [number, number][] = [];
  for (let tries = 0; out.length < target && tries < target * 200; tries++) {
    const a = Math.floor(rnd() * trades.length);
    const b = Math.floor(rnd() * trades.length);
    const [i, j] = a < b ? [a, b] : [b, a];
    const key = `${i}-${j}`;
    if (
      i === j ||
      seen.has(key) ||
      trades[i].complexId === trades[j].complexId ||
      trades[i].price === trades[j].price
    ) {
      continue;
    }
    const p = diffPct(trades[i].price, trades[j].price);
    if (p < band.min || p >= band.max) continue;
    seen.add(key);
    out.push([i, j]);
  }
  return out;
}

export type EnrichedTrade = NormalizedTrade & { sggCode: string; sggName: string };

function shuffleSeeded<T>(arr: T[], seed: string): T[] {
  const copy = [...arr];
  const rnd = mulberry32(hashString(seed));
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildPool(opts: {
  trades: EnrichedTrade[];
  geoMap: Map<string, GeocodedComplex>;
  sgg: SggOutput[];
  poolVersion: string;
  generatedAt: string;
  period: { from: string; to: string };
  sample?: boolean;
}): PoolData {
  const bySgg = new Map<string, EnrichedTrade[]>();
  for (const t of opts.trades) {
    const list = bySgg.get(t.sggCode);
    if (list) list.push(t);
    else bySgg.set(t.sggCode, [t]);
  }

  const counts = new Map([...bySgg].map(([k, v]) => [k, v.length]));
  const quotaMap = quotas(counts, POOL.maxTrades, POOL.minPerSgg);
  const picked: EnrichedTrade[] = [];

  for (const sggCode of [...bySgg.keys()].sort()) {
    const limit = quotaMap.get(sggCode) ?? 0;
    const shuffled = shuffleSeeded(bySgg.get(sggCode) ?? [], `${opts.poolVersion}${sggCode}`);
    const perComplex = new Map<string, number>();
    let added = 0;
    for (const t of shuffled) {
      if (added >= limit) break;
      const used = perComplex.get(t.complexId) ?? 0;
      if (used >= POOL.maxPerComplex) continue;
      perComplex.set(t.complexId, used + 1);
      picked.push(t);
      added += 1;
    }
  }

  picked.sort((a, b) => a.sggCode.localeCompare(b.sggCode) || b.dealYm.localeCompare(a.dealYm) || a.id.localeCompare(b.id));

  const complexMap = new Map<string, PoolComplex>();
  for (const t of picked) {
    if (complexMap.has(t.complexId)) continue;
    const g = opts.geoMap.get(t.complexId);
    if (!g) continue;
    complexMap.set(t.complexId, {
      id: t.complexId,
      name: t.complexName,
      sggCode: g.sggCode,
      umd: t.umdName,
      buildYear: t.buildYear,
      lat: g.lat,
      lng: g.lng,
      coordSource: g.coordSource,
    });
  }

  const trades: PoolTrade[] = picked.map((t) => ({
    id: t.id,
    complexId: t.complexId,
    areaM2: t.areaM2,
    floor: t.floor,
    dealYm: t.dealYm,
    price: t.price,
  }));

  const target = opts.sample ? PAIRS.sampleTargetPerBand : PAIRS.targetPerBand;
  const pairs = {
    easy: makePairs(trades, PAIRS.bands.easy, target, opts.poolVersion),
    medium: makePairs(trades, PAIRS.bands.medium, target, opts.poolVersion),
    hard: makePairs(trades, PAIRS.bands.hard, target, opts.poolVersion),
  };

  return {
    schemaVersion: 1,
    poolVersion: opts.poolVersion,
    generatedAt: opts.generatedAt,
    period: opts.period,
    sgg: [...opts.sgg].sort((a, b) => a.code.localeCompare(b.code)),
    complexes: [...complexMap.values()].sort((a, b) => a.id.localeCompare(b.id)),
    trades,
    pairs,
  };
}
