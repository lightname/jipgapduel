import { diffPct } from '@/lib/format';
import { INFINITE_STAGES, type InfiniteStage } from './rules';
import { toQuestion } from './pick-daily';
import type { Pool, Question } from './types';

export function stageFor(streak: number): InfiniteStage {
  return [...INFINITE_STAGES].reverse().find((s) => streak >= s.minStreak)!;
}

export function pickInfinite(
  pool: Pool,
  streak: number,
  used: ReadonlySet<number>,
  rnd: () => number = Math.random,
): Question | null {
  const s = stageFor(streak);
  const list = pool.pairs[s.band];
  const ok = (a: number, b: number, strictRange: boolean) => {
    if (used.has(a) || used.has(b)) return false;
    if (!strictRange) return true;
    const p = diffPct(pool.trades[a].price, pool.trades[b].price);
    return p >= s.min && p < s.max;
  };
  for (const strict of [true, false]) {
    for (let tries = 0; tries < 800 && list.length > 0; tries++) {
      const [a, b] = list[Math.floor(rnd() * list.length)];
      if (ok(a, b, strict)) return toQuestion(a, b, s.band, rnd);
    }
  }
  return null;
}
