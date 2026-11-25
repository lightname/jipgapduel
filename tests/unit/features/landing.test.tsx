import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DataSummarySection, HeroSection, HowToSection } from '@/features/landing';
import type { Stats } from '@/lib/stats';

const mockStats: Stats = {
  schemaVersion: 1,
  generatedAt: '2026-11-25T15:27:02.622Z',
  poolVersion: '20261126-0027',
  period: { from: '2024-11', to: '2026-10' },
  sggCount: 78,
  counts: {
    fetched: 10000,
    afterCancel: 9800,
    afterDirect: 9500,
    afterNonIndividual: 9200,
    afterLeasehold: 9100,
    afterOutlier: 8900,
    poolTrades: 7842,
  },
  pairBands: {
    easy: { count: 3000, minPct: 0.3, maxPct: null },
    medium: { count: 3000, minPct: 0.1, maxPct: 0.3 },
    hard: { count: 3000, minPct: 0.02, maxPct: 0.1 },
  },
  bySgg: [],
  byArea: [],
  byAge: [],
};

describe('Landing (S-01)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('히어로·게임 방법·데이터 요약 섹션과 1차·2차 CTA 경로를 렌더한다', () => {
    render(
      <>
        <HeroSection />
        <HowToSection />
        <DataSummarySection stats={mockStats} dataSourceLinkable />
      </>,
    );

    expect(screen.getByRole('heading', { level: 1, name: '둘 중 더 비싼 집은?' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '오늘의 10문제 풀기' }).getAttribute('href')).toBe(
      '/daily',
    );
    expect(screen.getByRole('link', { name: '무한 모드 하기' }).getAttribute('href')).toBe(
      '/infinite',
    );
    expect(screen.getByText('이렇게 풀어요')).toBeTruthy();
    expect(screen.getByText('이 게임의 데이터')).toBeTruthy();
    expect(screen.getByText('2024년 11월 ~ 2026년 10월')).toBeTruthy();
    expect(screen.getByText('7,842건')).toBeTruthy();
    expect(screen.getByText('수도권 78개 시군구')).toBeTruthy();
    expect(screen.getByText('2026-11-25')).toBeTruthy();
    expect(screen.getByRole('link', { name: '제외 기준 보기' }).getAttribute('href')).toBe(
      '/guide/data-source',
    );
  });

  it('stats가 null이면 데이터 요약 섹션을 숨기고 미검수 시 제외 기준 보기 링크를 숨긴다', () => {
    const { rerender } = render(
      <DataSummarySection stats={null} dataSourceLinkable={false} />,
    );
    expect(screen.queryByTestId('data-summary')).toBeNull();

    rerender(<DataSummarySection stats={mockStats} dataSourceLinkable={false} />);
    expect(screen.getByTestId('data-summary')).toBeTruthy();
    expect(screen.queryByRole('link', { name: '제외 기준 보기' })).toBeNull();
  });

  it('오늘 완료 기록이 있으면 오늘 완료 배지를 표시한다', () => {
    vi.setSystemTime(new Date('2026-12-03T03:00:00Z'));
    window.localStorage.setItem(
      'pd:v1:daily:2026-12-03',
      JSON.stringify({
        poolVersion: '20261126-0027',
        answers: [true, true, true, true, true, true, true, true, false, false],
        maxStreak: 8,
        done: true,
      }),
    );

    render(<HeroSection />);
    expect(screen.getAllByText('오늘 완료 · 8/10').length).toBeGreaterThan(0);
  });
});
