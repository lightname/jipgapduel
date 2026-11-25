export type DailyRecord = {
  poolVersion: string;
  answers: boolean[];
  maxStreak: number;
  done: boolean;
};

const K = {
  daily: (d: string) => `pd:v1:daily:${d}`,
  best: 'pd:v1:best:infinite',
};

function read<T>(key: string): T | null {
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, v: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(v));
  } catch {
    // 저장 불가 무시
  }
}

export const storage = {
  getDaily: (date: string) => read<DailyRecord>(K.daily(date)),
  setDaily: (date: string, r: DailyRecord) => write(K.daily(date), r),
  getBest: () => read<number>(K.best) ?? 0,
  setBestIfHigher: (n: number) => {
    if (n > (read<number>(K.best) ?? 0)) write(K.best, n);
  },
};
