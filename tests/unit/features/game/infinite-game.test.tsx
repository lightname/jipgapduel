import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InfiniteGame, mulberry32, resetPoolCache, type Pool } from '@/features/game';
import * as analytics from '@/lib/analytics/track';

const samplePool = JSON.parse(
  readFileSync(join(process.cwd(), 'public/data/pool.json'), 'utf8'),
) as Pool;

function okFetch(pool: Pool = samplePool): typeof fetch {
  return vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => pool,
  })) as unknown as typeof fetch;
}

function pickSideByPrice(pool: Pool, wantHigher: boolean): 'left' | 'right' {
  const leftLabel = screen.getByTestId('question-card-left').getAttribute('aria-label') ?? '';
  const rightLabel = screen.getByTestId('question-card-right').getAttribute('aria-label') ?? '';
  const findPrice = (label: string) => {
    const complexName = label.split(',')[0];
    const trade = pool.trades.find((tr) => {
      const c = pool.complexes.find((cx) => cx.id === tr.complexId);
      return c?.name === complexName && label.includes(`${tr.floor}층`);
    });
    return trade?.price ?? 0;
  };
  const lp = findPrice(leftLabel);
  const rp = findPrice(rightLabel);
  if (wantHigher) return lp >= rp ? 'left' : 'right';
  return lp <= rp ? 'left' : 'right';
}

describe('InfiniteGame (S-03)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetPoolCache();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('연속 3에서 medium 구간이 출제되고 오답 시 종료되며 최고 기록을 저장·갱신한다', async () => {
    const trackSpy = vi.spyOn(analytics, 'track');
    const rnd = mulberry32(42);

    render(
      <InfiniteGame
        poolVersion={samplePool.poolVersion}
        dataSourceLinkable={false}
        medianPriceLinkable={false}
        fetchImpl={okFetch()}
        rnd={rnd}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('question-card-left')).toBeTruthy();
    });

    expect(screen.getByText('연속 0')).toBeTruthy();
    expect(screen.getByText('최고 0')).toBeTruthy();
    expect(screen.getByText('틀릴 때까지 계속 나와요')).toBeTruthy();

    for (let i = 0; i < 3; i++) {
      const side = pickSideByPrice(samplePool, true);
      fireEvent.click(screen.getByTestId(`question-card-${side}`));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '다음 문제' })).toBeTruthy();
      });
      fireEvent.click(screen.getByRole('button', { name: '다음 문제' }));
    }

    await waitFor(() => {
      expect(screen.getByText('연속 3')).toBeTruthy();
    });

    const wrongSide = pickSideByPrice(samplePool, false);
    fireEvent.click(screen.getByTestId(`question-card-${wrongSide}`));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '결과 보기' })).toBeTruthy();
    });

    const answerCalls = trackSpy.mock.calls.filter(([name]) => name === 'answer');
    expect(answerCalls[0][1]).toMatchObject({ mode: 'infinite', band: 'easy', correct: true });
    expect(answerCalls[3][1]).toMatchObject({ mode: 'infinite', band: 'medium', correct: false });

    fireEvent.click(screen.getByRole('button', { name: '결과 보기' }));

    await waitFor(() => {
      expect(screen.getByText('이번 기록')).toBeTruthy();
      expect(screen.getByText('연속 3개 정답')).toBeTruthy();
      expect(screen.getByText('최고 기록 3개')).toBeTruthy();
      expect(screen.getByText('최고 기록 경신')).toBeTruthy();
    });
    expect(window.localStorage.getItem('pd:v1:best:infinite')).toBe('3');

    fireEvent.click(screen.getByRole('button', { name: '다시 도전하기' }));

    await waitFor(() => {
      expect(screen.getByText('연속 0')).toBeTruthy();
      expect(screen.getByText('최고 3')).toBeTruthy();
    });

    const immediateWrong = pickSideByPrice(samplePool, false);
    fireEvent.click(screen.getByTestId(`question-card-${immediateWrong}`));
    fireEvent.click(await screen.findByRole('button', { name: '결과 보기' }));

    await waitFor(() => {
      expect(screen.getByText('연속 0개 정답')).toBeTruthy();
      expect(screen.getByText('최고 기록 3개')).toBeTruthy();
    });
    expect(screen.queryByText('최고 기록 경신')).toBeNull();
    expect(window.localStorage.getItem('pd:v1:best:infinite')).toBe('3');
  });

  it('로드 실패 시 에러 문구와 다시 시도 버튼을 표시한다', async () => {
    const fetchMock = vi.fn(async () => ({ ok: false, status: 500 })) as unknown as typeof fetch;

    render(
      <InfiniteGame
        poolVersion={samplePool.poolVersion}
        dataSourceLinkable={false}
        medianPriceLinkable={false}
        fetchImpl={fetchMock}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('문제를 불러오지 못했어요')).toBeTruthy();
      expect(screen.getByRole('button', { name: '다시 시도하기' })).toBeTruthy();
    });
  });
});
