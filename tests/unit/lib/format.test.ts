import { describe, expect, it } from 'vitest';
import {
  diffPct,
  formatArea,
  formatCount,
  formatDateKo,
  formatDiff,
  formatDotDate,
  formatPrice,
  formatYm,
} from '@/lib/format';

describe('format helpers', () => {
  it('formats prices in 억 and 만원', () => {
    expect(formatPrice(123000)).toBe('12억 3,000만원');
    expect(formatPrice(120000)).toBe('12억원');
    expect(formatPrice(29500)).toBe('2억 9,500만원');
    expect(formatPrice(8500)).toBe('8,500만원');
  });

  it('formats area with pyeong conversion', () => {
    expect(formatArea(84.97)).toBe('전용 84.97㎡ (25.7평)');
  });

  it('computes diff percentage and formatted diff', () => {
    expect(diffPct(123500, 145000)).toBeCloseTo(21500 / 123500, 5);
    expect(formatDiff(123500, 145000)).toBe('+2억 1,500만원 (17.4%)');
  });

  it('formats dates and counts', () => {
    expect(formatYm('2026-10')).toBe('2026년 10월');
    expect(formatDateKo('2026-11-21')).toBe('2026년 11월 21일');
    expect(formatDotDate('2026-11-21')).toBe('2026.11.21');
    expect(formatCount(7842)).toBe('7,842');
  });
});
