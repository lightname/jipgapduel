import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DAILY_BANDS,
  initialState,
  loadPool,
  pickDaily,
  pickInfinite,
  reducer,
  resetPoolCache,
  stageFor,
  type Pool,
} from '@/features/game';

const samplePool = JSON.parse(
  readFileSync(join(process.cwd(), 'public/data/pool.json'), 'utf8'),
) as Pool;

describe('game picking logic (C-13, C-14, C-15)', () => {
  it('picks deterministic 10 daily questions with no duplicate trades and exact band order', () => {
    const d1 = pickDaily(samplePool, '2026-12-01');
    const d1Again = pickDaily(samplePool, '2026-12-01');
    const d2 = pickDaily(samplePool, '2026-12-02');

    expect(d1).not.toBeNull();
    expect(d1).toEqual(d1Again);
    expect(d1).not.toEqual(d2);

    const qs = d1!;
    expect(qs).toHaveLength(10);
    expect(qs.map((q) => q.band)).toEqual([...DAILY_BANDS]);

    const used = new Set<number>();
    for (const q of qs) {
      expect(used.has(q.left)).toBe(false);
      expect(used.has(q.right)).toBe(false);
      used.add(q.left);
      used.add(q.right);
    }
  });

  it('evaluates stageFor boundaries accurately (R-11)', () => {
    expect(stageFor(0)).toMatchObject({ band: 'easy', min: 0.3 });
    expect(stageFor(2)).toMatchObject({ band: 'easy', min: 0.3 });
    expect(stageFor(3)).toMatchObject({ band: 'medium', min: 0.2, max: 0.3 });
    expect(stageFor(5)).toMatchObject({ band: 'medium', min: 0.2, max: 0.3 });
    expect(stageFor(6)).toMatchObject({ band: 'medium', min: 0.1, max: 0.2 });
    expect(stageFor(9)).toMatchObject({ band: 'medium', min: 0.1, max: 0.2 });
    expect(stageFor(10)).toMatchObject({ band: 'hard', min: 0.05, max: 0.1 });
    expect(stageFor(14)).toMatchObject({ band: 'hard', min: 0.05, max: 0.1 });
    expect(stageFor(15)).toMatchObject({ band: 'hard', min: 0.02, max: 0.05 });
  });

  it('never picks already-used trades in pickInfinite', () => {
    const used = new Set<number>();
    for (let step = 0; step < 20; step++) {
      const q = pickInfinite(samplePool, step, used);
      expect(q).not.toBeNull();
      expect(used.has(q!.left)).toBe(false);
      expect(used.has(q!.right)).toBe(false);
      used.add(q!.left);
      used.add(q!.right);
    }
  });
});

describe('game reducer (C-16)', () => {
  const qs = pickDaily(samplePool, '2026-12-01')!;

  it('ignores double SELECT and finishes daily on 10th NEXT', () => {
    let st = reducer(initialState('daily'), { type: 'LOADED', pool: samplePool, questions: qs });
    expect(st.phase).toBe('question');

    st = reducer(st, { type: 'SELECT', side: 'left' });
    expect(st.phase).toBe('revealed');
    expect(st.answers).toHaveLength(1);

    const dup = reducer(st, { type: 'SELECT', side: 'right' });
    expect(dup).toBe(st);

    for (let i = 1; i < 10; i++) {
      st = reducer(st, { type: 'NEXT' });
      expect(st.phase).toBe('question');
      expect(st.index).toBe(i);
      st = reducer(st, { type: 'SELECT', side: 'left' });
    }
    st = reducer(st, { type: 'NEXT' });
    expect(st.phase).toBe('finished');
  });

  it('finishes infinite immediately after wrong answer NEXT and tracks streak/maxStreak', () => {
    const q0 = qs[0];
    const rightSide = samplePool.trades[q0.left].price > samplePool.trades[q0.right].price ? 'left' : 'right';
    const wrongSide = rightSide === 'left' ? 'right' : 'left';

    let st = reducer(initialState('infinite'), { type: 'LOADED', pool: samplePool, questions: [q0] });
    st = reducer(st, { type: 'SELECT', side: rightSide });
    expect(st.streak).toBe(1);
    expect(st.maxStreak).toBe(1);

    const q1 = qs[1];
    const wrongSide1 = samplePool.trades[q1.left].price > samplePool.trades[q1.right].price ? 'right' : 'left';
    st = reducer(st, { type: 'NEXT', next: q1 });
    st = reducer(st, { type: 'SELECT', side: wrongSide1 });
    expect(st.streak).toBe(0);
    expect(st.maxStreak).toBe(1);

    st = reducer(st, { type: 'NEXT', next: qs[2] });
    expect(st.phase).toBe('finished');
    expect(wrongSide).not.toBe(rightSide);
  });

  it('restores finished daily when LOADED receives 10 answers', () => {
    const answers = [true, true, false, true, true, true, false, true, true, false];
    const st = reducer(initialState('daily'), {
      type: 'LOADED',
      pool: samplePool,
      questions: qs,
      answers,
    });
    expect(st.phase).toBe('finished');
    expect(st.maxStreak).toBe(3);
    expect(st.streak).toBe(0);
  });
});

describe('loadPool (C-17)', () => {
  beforeEach(() => resetPoolCache());

  it('handles 404, schema mismatch, empty pairs, and success', async () => {
    const f404 = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response('', { status: 404 }));
    const r1 = await loadPool('v1', f404);
    expect(r1.ok).toBe(false);
    if (!r1.ok) expect(r1.error.code).toBe('POOL_FETCH_FAILED');

    const fSchema = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ ...samplePool, schemaVersion: 2 }), { status: 200 }));
    const r2 = await loadPool('v2', fSchema);
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.error.code).toBe('POOL_SCHEMA_MISMATCH');

    const fEmpty = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(JSON.stringify({ ...samplePool, pairs: { ...samplePool.pairs, hard: [] } }), { status: 200 }),
    );
    const r3 = await loadPool('v3', fEmpty);
    expect(r3.ok).toBe(false);
    if (!r3.ok) expect(r3.error.code).toBe('POOL_EMPTY');

    const fOk = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(JSON.stringify(samplePool), { status: 200 }));
    const r4 = await loadPool(samplePool.poolVersion, fOk);
    expect(r4.ok).toBe(true);
  });
});
