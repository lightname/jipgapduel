import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { diffPct } from '../../src/lib/format';
import type { Stats } from '../../src/lib/stats';
import type { PoolData } from './build-pool';
import { PAIRS, VERIFY } from './rules';

export type VerifyResult =
  | { ok: true }
  | { ok: false; error: { code: 'VALIDATE_FAILED'; message: string } };

export function validatePoolData(
  pool: PoolData,
  rawSizeBytes: number,
  opts: { sample?: boolean; filteredSggCount?: number } = {},
): VerifyResult {
  const fail = (message: string): VerifyResult => ({
    ok: false,
    error: { code: 'VALIDATE_FAILED', message },
  });

  if (pool.schemaVersion !== VERIFY.schemaVersion) return fail(`schemaVersion=${pool.schemaVersion}`);
  if (rawSizeBytes > VERIFY.maxBytes) return fail(`size=${rawSizeBytes} > ${VERIFY.maxBytes}`);

  const minTrades = opts.sample ? VERIFY.sampleMinPoolTrades : VERIFY.minPoolTrades;
  if (pool.trades.length < minTrades) return fail(`trades=${pool.trades.length} < ${minTrades}`);

  if (!opts.sample && opts.filteredSggCount && opts.filteredSggCount > 0) {
    const complexSgg = new Map(pool.complexes.map((c) => [c.id, c.sggCode]));
    const poolSggs = new Set(pool.trades.map((t) => complexSgg.get(t.complexId)).filter(Boolean));
    const coverage = poolSggs.size / opts.filteredSggCount;
    if (coverage < VERIFY.minSggCoverage) return fail(`coverage=${coverage.toFixed(3)} < ${VERIFY.minSggCoverage}`);
  }

  const minPairs = opts.sample ? PAIRS.sampleMinPerBand : PAIRS.targetPerBand;
  for (const bandName of ['easy', 'medium', 'hard'] as const) {
    const list = pool.pairs[bandName];
    const range = PAIRS.bands[bandName];
    if (!Array.isArray(list) || list.length < minPairs) {
      return fail(`pairs.${bandName}=${list?.length ?? 0} < ${minPairs}`);
    }
    const seen = new Set<string>();
    for (const [i, j] of list) {
      if (
        !Number.isInteger(i) ||
        !Number.isInteger(j) ||
        i < 0 ||
        j < 0 ||
        i >= pool.trades.length ||
        j >= pool.trades.length ||
        i === j
      ) {
        return fail(`pair index invalid in ${bandName}: [${i},${j}]`);
      }
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) return fail(`duplicate pair in ${bandName}: ${key}`);
      seen.add(key);

      const a = pool.trades[i];
      const b = pool.trades[j];
      if (a.complexId === b.complexId) return fail(`same complex in ${bandName}: ${a.complexId}`);
      if (a.price === b.price) return fail(`same price in ${bandName}: ${a.price}`);

      const pct = diffPct(a.price, b.price);
      if (pct < range.min || pct >= range.max) {
        return fail(`pct=${pct.toFixed(4)} out of ${bandName} range`);
      }
    }
  }

  return { ok: true };
}

export function verifyAndWrite(opts: {
  pool: PoolData;
  stats: Stats;
  poolPath?: string;
  statsPath?: string;
  sample?: boolean;
  filteredSggCount?: number;
}): VerifyResult {
  const poolPath = opts.poolPath ?? 'public/data/pool.json';
  const statsPath = opts.statsPath ?? 'src/generated/stats.json';
  const poolTmp = `${poolPath}.tmp`;
  const statsTmp = `${statsPath}.tmp`;

  mkdirSync(dirname(poolPath), { recursive: true });
  mkdirSync(dirname(statsPath), { recursive: true });

  writeFileSync(poolTmp, JSON.stringify(opts.pool));
  writeFileSync(statsTmp, JSON.stringify(opts.stats, null, 2));

  const rawPool = readFileSync(poolTmp, 'utf8');
  const parsed = JSON.parse(rawPool) as PoolData;
  const check = validatePoolData(parsed, Buffer.byteLength(rawPool, 'utf8'), {
    sample: opts.sample,
    filteredSggCount: opts.filteredSggCount,
  });

  if (!check.ok) {
    rmSync(poolTmp, { force: true });
    rmSync(statsTmp, { force: true });
    console.error(`[verify] FAIL ${check.error.code}: ${check.error.message}`);
    return check;
  }

  renameSync(poolTmp, poolPath);
  renameSync(statsTmp, statsPath);
  console.log(`[verify] OK ${parsed.trades.length}건`);
  return { ok: true };
}
