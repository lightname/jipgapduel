const n = (v: number) => v.toLocaleString('ko-KR');

export function formatPrice(manwon: number, _l: 'ko' = 'ko'): string {
  void _l;
  const eok = Math.floor(manwon / 10000);
  const rest = manwon % 10000;
  if (eok === 0) return `${n(rest)}만원`;
  return rest === 0 ? `${eok}억원` : `${eok}억 ${n(rest)}만원`;
}

export function diffPct(a: number, b: number): number {
  return (Math.max(a, b) - Math.min(a, b)) / Math.min(a, b);
}

export function formatDiff(a: number, b: number): string {
  return `+${formatPrice(Math.abs(a - b))} (${(diffPct(a, b) * 100).toFixed(1)}%)`;
}

export function formatArea(m2: number): string {
  return `전용 ${Number(m2.toFixed(2))}㎡ (${(m2 / 3.3058).toFixed(1)}평)`;
}

export function formatYm(ym: string): string {
  const [y, m] = ym.split('-');
  return `${y}년 ${Number(m)}월`;
}

export function formatDateKo(d: string): string {
  const [y, m, dd] = d.split('-');
  return `${y}년 ${Number(m)}월 ${Number(dd)}일`;
}

export function formatDotDate(d: string): string {
  return d.replaceAll('-', '.');
}

export function formatCount(v: number): string {
  return n(v);
}
