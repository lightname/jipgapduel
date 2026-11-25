import type { Pool } from './types';

export type PoolErrorCode = 'POOL_FETCH_FAILED' | 'POOL_SCHEMA_MISMATCH' | 'POOL_EMPTY';

export type PoolResult =
  | { ok: true; data: Pool }
  | { ok: false; error: { code: PoolErrorCode; message: string } };

let cache: Pool | null = null;

export function resetPoolCache(): void {
  cache = null;
}

export async function loadPool(
  version: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PoolResult> {
  if (cache?.poolVersion === version) return { ok: true, data: cache };
  let json: unknown;
  try {
    const res = await fetchImpl(`/data/pool.json?v=${encodeURIComponent(version)}`);
    if (!res.ok) {
      return { ok: false, error: { code: 'POOL_FETCH_FAILED', message: `HTTP ${res.status}` } };
    }
    json = await res.json();
  } catch (e) {
    return { ok: false, error: { code: 'POOL_FETCH_FAILED', message: String(e) } };
  }

  const p = json as Pool;
  if (p?.schemaVersion !== 1 || !Array.isArray(p.trades) || !p.pairs) {
    return { ok: false, error: { code: 'POOL_SCHEMA_MISMATCH', message: 'schema' } };
  }
  if (
    p.trades.length === 0 ||
    (['easy', 'medium', 'hard'] as const).some((b) => !Array.isArray(p.pairs[b]) || p.pairs[b].length === 0)
  ) {
    return { ok: false, error: { code: 'POOL_EMPTY', message: 'empty' } };
  }

  cache = p;
  return { ok: true, data: p };
}
