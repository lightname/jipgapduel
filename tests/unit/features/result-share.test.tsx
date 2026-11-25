import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ResultView } from '@/features/game';
import { buildShareText, grid } from '@/features/share';

describe('ResultView and ShareBlock (T-10, S-05)', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders daily result copy, grid, revisit notice, and guide link', () => {
    const answers = [true, true, true, true, true, false, true, true, true, false];
    const { getByText } = render(
      <ResultView
        mode="daily"
        date="2026-12-12"
        answers={answers}
        maxStreak={5}
        bestRecord={0}
        medianPriceLinkable={true}
      />,
    );

    expect(getByText('오늘의 결과')).toBeTruthy();
    expect(getByText('2026년 12월 12일 · 데일리 #12')).toBeTruthy();
    expect(getByText('10문제 중 8개')).toBeTruthy();
    expect(getByText('최고 연속 5개')).toBeTruthy();
    expect(getByText('내일 0시에 새 10문제')).toBeTruthy();
    expect(getByText('결과 공유하기')).toBeTruthy();
    expect(getByText('무한 모드로 더 풀기')).toBeTruthy();
    expect(getByText('조건별 중간 가격 보기')).toBeTruthy();
  });

  it('renders infinite result with new best badge and 31-answer overflow (+1)', () => {
    const answers = [...Array.from({ length: 30 }, () => true), false];
    const { getByText } = render(
      <ResultView
        mode="infinite"
        date="2026-12-12"
        answers={answers}
        maxStreak={30}
        bestRecord={10}
        isNewBest={true}
        medianPriceLinkable={false}
      />,
    );

    expect(getByText('이번 기록')).toBeTruthy();
    expect(getByText('최고 기록 경신')).toBeTruthy();
    expect(getByText('연속 30개 정답')).toBeTruthy();
    expect(getByText('최고 기록 30개')).toBeTruthy();
    expect(getByText('+1')).toBeTruthy();
    expect(grid(answers)).toBe(`${'🟩'.repeat(30)} +1`);
  });

  it('excludes price strings from share text', () => {
    const dailyText = buildShareText({
      mode: 'daily',
      no: 12,
      score: 8,
      maxStreak: 5,
      best: 0,
      answers: [true, false],
      siteUrl: 'https://price-duel.pages.dev',
      method: 'copy',
    });
    const infText = buildShareText({
      mode: 'infinite',
      no: 12,
      score: 7,
      maxStreak: 7,
      best: 12,
      answers: [true, true, false],
      siteUrl: 'https://price-duel.pages.dev',
      method: 'webshare',
    });

    expect(dailyText).not.toContain('억');
    expect(dailyText).not.toContain('만원');
    expect(infText).not.toContain('억');
    expect(infText).not.toContain('만원');
    expect(dailyText).toContain('utm_source=share&utm_medium=copy');
  });

  it('does not show fallback buttons when Web Share throws AbortError', async () => {
    const abortErr = new DOMException('cancelled', 'AbortError');
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: vi.fn().mockRejectedValue(abortErr),
    });

    const { getByRole, queryByRole } = render(
      <ResultView
        mode="daily"
        date="2026-12-12"
        answers={[true, false]}
        maxStreak={1}
        bestRecord={0}
        medianPriceLinkable={false}
        imageRenderer={async () => new Blob(['png'], { type: 'image/png' })}
      />,
    );

    fireEvent.click(getByRole('button', { name: '결과 공유하기' }));
    await waitFor(() => {
      expect(navigator.share).toHaveBeenCalledTimes(1);
    });
    expect(queryByRole('button', { name: '텍스트 복사하기' })).toBeNull();
  });

  it('shows copy and download fallback buttons when Web Share is unavailable', async () => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    });

    const { getByRole, findByRole } = render(
      <ResultView
        mode="infinite"
        date="2026-12-12"
        answers={[true, false]}
        maxStreak={1}
        bestRecord={1}
        medianPriceLinkable={false}
        imageRenderer={async () => new Blob(['png'], { type: 'image/png' })}
      />,
    );

    fireEvent.click(getByRole('button', { name: '기록 공유하기' }));
    expect(await findByRole('button', { name: '텍스트 복사하기' })).toBeTruthy();
    expect(await findByRole('button', { name: '이미지 저장하기' })).toBeTruthy();
  });
});
