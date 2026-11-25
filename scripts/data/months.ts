export type MonthTarget = {
  ym: string;
  recent: boolean;
};

export function collectMonths(now: Date = new Date(), count = 24, recentCount = 3): MonthTarget[] {
  const kst = new Date(now.getTime() + 9 * 3600 * 1000);
  let year = kst.getUTCFullYear();
  let month = kst.getUTCMonth(); // 0-indexed current month = 1-indexed previous month

  const out: MonthTarget[] = [];
  for (let i = 0; i < count; i++) {
    if (month === 0) {
      year -= 1;
      month = 12;
    }
    const ym = `${year}${String(month).padStart(2, '0')}`;
    out.push({ ym, recent: i < recentCount });
    month -= 1;
  }
  return out;
}
