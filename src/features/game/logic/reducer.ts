import type { Pool, Question } from './types';

export type Mode = 'daily' | 'infinite';
export type Phase = 'loading' | 'error' | 'question' | 'revealed' | 'finished';

export type GameState = {
  mode: Mode;
  phase: Phase;
  pool: Pool | null;
  questions: Question[];
  index: number;
  answers: boolean[];
  streak: number;
  maxStreak: number;
  selected: 'left' | 'right' | null;
  errorCode: string | null;
};

export type Action =
  | { type: 'LOADED'; pool: Pool; questions: Question[]; answers?: boolean[] }
  | { type: 'LOAD_FAILED'; code: string }
  | { type: 'RETRY' }
  | { type: 'SELECT'; side: 'left' | 'right' }
  | { type: 'NEXT'; next?: Question | null }
  | { type: 'RESTART'; first: Question };

export const initialState = (mode: Mode): GameState => ({
  mode,
  phase: 'loading',
  pool: null,
  questions: [],
  index: 0,
  answers: [],
  streak: 0,
  maxStreak: 0,
  selected: null,
  errorCode: null,
});

const streaks = (ans: boolean[]) =>
  ans.reduce(
    (a, c) => {
      const s = c ? a.s + 1 : 0;
      return { s, m: Math.max(a.m, s) };
    },
    { s: 0, m: 0 },
  );

export function isCorrect(pool: Pool, q: Question, side: 'left' | 'right'): boolean {
  const l = pool.trades[q.left].price;
  const r = pool.trades[q.right].price;
  return side === 'left' ? l > r : r > l;
}

export function reducer(st: GameState, a: Action): GameState {
  switch (a.type) {
    case 'LOADED': {
      const ans = a.answers ?? [];
      const { s, m } = streaks(ans);
      const done = st.mode === 'daily' && ans.length >= a.questions.length;
      return {
        ...st,
        pool: a.pool,
        questions: a.questions,
        answers: ans,
        index: Math.min(ans.length, Math.max(0, a.questions.length - 1)),
        streak: s,
        maxStreak: m,
        phase: done ? 'finished' : 'question',
        selected: null,
        errorCode: null,
      };
    }
    case 'LOAD_FAILED':
      return { ...st, phase: 'error', errorCode: a.code };
    case 'RETRY':
      return { ...st, phase: 'loading', errorCode: null };
    case 'SELECT': {
      if (st.phase !== 'question' || !st.pool) return st;
      const ok = isCorrect(st.pool, st.questions[st.index], a.side);
      const answers = [...st.answers, ok];
      const { s, m } = streaks(answers);
      return { ...st, phase: 'revealed', selected: a.side, answers, streak: s, maxStreak: m };
    }
    case 'NEXT': {
      if (st.phase !== 'revealed') return st;
      const last = st.answers[st.answers.length - 1];
      if (st.mode === 'daily') {
        return st.index >= st.questions.length - 1
          ? { ...st, phase: 'finished' }
          : { ...st, index: st.index + 1, phase: 'question', selected: null };
      }
      if (!last || !a.next) return { ...st, phase: 'finished' };
      return {
        ...st,
        questions: [...st.questions, a.next],
        index: st.index + 1,
        phase: 'question',
        selected: null,
      };
    }
    case 'RESTART':
      return { ...initialState(st.mode), pool: st.pool, questions: [a.first], phase: 'question' };
  }
}
