'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { track } from '@/lib/analytics/track';
import { storage } from '@/lib/storage';
import { loadPool } from '../logic/load-pool';
import { pickDaily } from '../logic/pick-daily';
import { pickInfinite } from '../logic/pick-infinite';
import { kstDate } from '../logic/random';
import { initialState, isCorrect, reducer, type Mode } from '../logic/reducer';
import type { Question } from '../logic/types';

export type UseGameOptions = {
  mode: Mode;
  poolVersion: string;
  fetchImpl?: typeof fetch;
  rnd?: () => number;
};

function calcMaxStreak(ans: boolean[]): number {
  return ans.reduce(
    (acc, cur) => {
      const s = cur ? acc.s + 1 : 0;
      return { s, m: Math.max(acc.m, s) };
    },
    { s: 0, m: 0 },
  ).m;
}

export function useGame({ mode, poolVersion, fetchImpl, rnd }: UseGameOptions) {
  const [state, dispatch] = useReducer(reducer, mode, initialState);
  const [date] = useState(() => kstDate());
  const [bestRecord, setBestRecord] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [restoredDone, setRestoredDone] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const prevBestRef = useRef(0);

  useEffect(() => {
    let active = true;
    const screen = mode === 'daily' ? 'S-02' : 'S-03';

    (async () => {
      const res = await loadPool(poolVersion, fetchImpl);
      if (!active) return;

      if (!res.ok) {
        track('pool_load_error', { screen });
        dispatch({ type: 'LOAD_FAILED', code: res.error.code });
        return;
      }

      const pool = res.data;
      if (mode === 'daily') {
        const questions = pickDaily(pool, date);
        if (!questions) {
          track('pool_load_error', { screen });
          dispatch({ type: 'LOAD_FAILED', code: 'POOL_EMPTY' });
          return;
        }
        const saved = storage.getDaily(date);
        if (saved?.done) {
          setRestoredDone(true);
          dispatch({ type: 'LOADED', pool, questions, answers: saved.answers });
          return;
        }
        const resumeAnswers =
          saved && saved.poolVersion === pool.poolVersion ? saved.answers : [];
        const alreadyDone = resumeAnswers.length >= questions.length;
        setRestoredDone(alreadyDone);
        dispatch({ type: 'LOADED', pool, questions, answers: resumeAnswers });
        if (!alreadyDone) {
          track('game_start', { mode: 'daily' });
        }
        return;
      }

      const best = storage.getBest();
      prevBestRef.current = best;
      setBestRecord(best);

      const first = pickInfinite(pool, 0, new Set<number>(), rnd);
      if (!first) {
        track('pool_load_error', { screen });
        dispatch({ type: 'LOAD_FAILED', code: 'POOL_EMPTY' });
        return;
      }
      setRestoredDone(false);
      setIsNewBest(false);
      dispatch({ type: 'LOADED', pool, questions: [first] });
      track('game_start', { mode: 'infinite' });
    })();

    return () => {
      active = false;
    };
  }, [mode, poolVersion, date, retryCount, fetchImpl, rnd]);

  const select = useCallback(
    (side: 'left' | 'right') => {
      if (state.phase !== 'question' || !state.pool) return;
      const q = state.questions[state.index];
      const ok = isCorrect(state.pool, q, side);
      const nextAnswers = [...state.answers, ok];
      const nextMaxStreak = calcMaxStreak(nextAnswers);

      track('answer', { mode, idx: state.index, correct: ok, band: q.band });
      if (mode === 'daily') {
        storage.setDaily(date, {
          poolVersion: state.pool.poolVersion,
          answers: nextAnswers,
          maxStreak: nextMaxStreak,
          done: false,
        });
      }
      dispatch({ type: 'SELECT', side });
    },
    [state.phase, state.pool, state.questions, state.index, state.answers, mode, date],
  );

  const next = useCallback(() => {
    if (state.phase !== 'revealed' || !state.pool) return;
    if (mode === 'daily') {
      if (state.index >= state.questions.length - 1) {
        storage.setDaily(date, {
          poolVersion: state.pool.poolVersion,
          answers: state.answers,
          maxStreak: state.maxStreak,
          done: true,
        });
      }
      dispatch({ type: 'NEXT' });
      return;
    }

    const lastCorrect = state.answers[state.answers.length - 1];
    let nextQuestion: Question | null = null;
    if (lastCorrect) {
      const used = new Set<number>();
      for (const q of state.questions) {
        used.add(q.left);
        used.add(q.right);
      }
      nextQuestion = pickInfinite(state.pool, state.streak, used, rnd);
    }

    if (!lastCorrect || !nextQuestion) {
      const prevBest = prevBestRef.current;
      const exceeded = state.maxStreak > prevBest;
      storage.setBestIfHigher(state.maxStreak);
      const updated = Math.max(prevBest, state.maxStreak);
      prevBestRef.current = updated;
      setBestRecord(updated);
      setIsNewBest(exceeded);
    }

    dispatch({ type: 'NEXT', next: nextQuestion });
  }, [state, mode, date, rnd]);

  const retry = useCallback(() => {
    dispatch({ type: 'RETRY' });
    setRetryCount((c) => c + 1);
  }, []);

  const restart = useCallback(() => {
    if (!state.pool) return;
    const first = pickInfinite(state.pool, 0, new Set<number>(), rnd);
    if (!first) {
      track('pool_load_error', { screen: 'S-03' });
      dispatch({ type: 'LOAD_FAILED', code: 'POOL_EMPTY' });
      return;
    }
    const best = storage.getBest();
    prevBestRef.current = best;
    setBestRecord(best);
    setIsNewBest(false);
    setRestoredDone(false);
    dispatch({ type: 'RESTART', first });
    track('game_start', { mode: 'infinite' });
  }, [state.pool, rnd]);

  return {
    state,
    date,
    bestRecord,
    isNewBest,
    emitGameEnd: state.phase === 'finished' && !restoredDone,
    select,
    next,
    retry,
    restart,
  };
}
