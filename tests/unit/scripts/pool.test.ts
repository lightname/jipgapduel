import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { diffPct } from '@/lib/format';
import { makePairs, quotas, type PoolData } from '../../../scripts/data/build-pool';
import { PAIRS } from '../../../scripts/data/rules';
import { checkMainBranch } from '../../../scripts/data/run-update';
import { verifyAndWrite } from '../../../scripts/data/verify-pool';
import type { Stats } from '@/lib/stats';

describe('pool sampling, pair generation, and verify (C-21, C-22, C-23)', () => {
  it('allocates quotas <= 8000 with min 30 per sgg when available', () => {
    const counts = new Map<string, number>();
    for (let i = 0; i < 80; i++) {
      counts.set(`11${String(i).padStart(3, '0')}`, i < 10 ? 25 : 200);
    }
    const q = quotas(counts, 8000, 30);
    const total = [...q.values()].reduce((a, b) => a + b, 0);
    expect(total).toBeLessThanOrEqual(8000);
    for (const [k, avail] of counts) {
      const assigned = q.get(k) ?? 0;
      if (avail >= 30) expect(assigned).toBeGreaterThanOrEqual(30);
      else expect(assigned).toBe(avail);
    }
  });

  it('generates deterministic pairs satisfying R-08 and R-09', () => {
    const trades = Array.from({ length: 120 }, (_, i) => ({
      complexId: `C${i % 40}`,
      price: 50000 + i * 2500,
    }));
    const p1 = makePairs(trades, PAIRS.bands.medium, 100, '20261121-0000');
    const p2 = makePairs(trades, PAIRS.bands.medium, 100, '20261121-0000');
    expect(p1).toEqual(p2);
    expect(p1.length).toBe(100);

    const seen = new Set<string>();
    for (const [i, j] of p1) {
      expect(trades[i].complexId).not.toBe(trades[j].complexId);
      expect(trades[i].price).not.toBe(trades[j].price);
      const pct = diffPct(trades[i].price, trades[j].price);
      expect(pct).toBeGreaterThanOrEqual(PAIRS.bands.medium.min);
      expect(pct).toBeLessThan(PAIRS.bands.medium.max);
      const key = `${Math.min(i, j)}-${Math.max(i, j)}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  it('keeps existing pool.json untouched when validation fails', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'pd-verify-'));
    try {
      const poolPath = join(tmp, 'pool.json');
      const statsPath = join(tmp, 'stats.json');
      writeFileSync(poolPath, '{"keep":true}');
      writeFileSync(statsPath, '{"keep":true}');

      const badPool: PoolData = {
        schemaVersion: 1,
        poolVersion: '20261121-0000',
        generatedAt: '2026-11-21T00:00:00Z',
        period: { from: '2026-10', to: '2026-10' },
        sgg: [],
        complexes: [],
        trades: [],
        pairs: { easy: [], medium: [], hard: [] },
      };
      const badStats = { schemaVersion: 1 } as Stats;

      const res = verifyAndWrite({ pool: badPool, stats: badStats, poolPath, statsPath, sample: true });
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.code).toBe('VALIDATE_FAILED');
      expect(readFileSync(poolPath, 'utf8')).toBe('{"keep":true}');
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('returns BRANCH_NOT_MAIN when current git branch is not main', () => {
    const res = checkMainBranch(() => 'develop');
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe('BRANCH_NOT_MAIN');
  });
});
