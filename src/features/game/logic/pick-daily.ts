import { DAILY_BANDS } from './rules';
import { hashString, mulberry32 } from './random';
import type { Band, Pool, Question } from './types';

export function toQuestion(a: number, b: number, band: Band, rnd: () => number): Question {
  return rnd() < 0.5 ? { left: a, right: b, band } : { left: b, right: a, band };
}

export function pickDaily(pool: Pool, date: string): Question[] | null {
  const rnd = mulberry32(hashString(`${date}|${pool.poolVersion}`));
  const used = new Set<number>();
  const out: Question[] = [];
  for (const band of DAILY_BANDS) {
    const list = pool.pairs[band];
    for (let tries = 0; tries < 500 && list.length > 0; tries++) {
      const [a, b] = list[Math.floor(rnd() * list.length)];
      if (used.has(a) || used.has(b)) continue;
      used.add(a);
      used.add(b);
      out.push(toQuestion(a, b, band, rnd));
      break;
    }
  }
  return out.length === DAILY_BANDS.length ? out : null;
}
