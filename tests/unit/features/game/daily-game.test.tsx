import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DailyGame, resetPoolCache, type Pool } from '@/features/game';

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

describe('DailyGame (S-02)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetPoolCache();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('로딩 스켈레톤을 먼저 표시한 뒤 카드 2장과 진행 막대를 렌더한다', async () => {
    let resolveFetch!: (value: unknown) => void;
    const pendingFetch = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    ) as unknown as typeof fetch;

    render(
      <DailyGame
        poolVersion={samplePool.poolVersion}
        dataSourceLinkable={false}
        medianPriceLinkable={false}
        fetchImpl={pendingFetch}
      />,
    );

    expect(screen.getByTestId('game-loading')).toBeTruthy();

    resolveFetch({
      ok: true,
      status: 200,
      json: async () => samplePool,
    });

    await waitFor(() => {
      expect(screen.getByTestId('question-card-left')).toBeTruthy();
      expect(screen.getByTestId('question-card-right')).toBeTruthy();
    });

    expect(screen.getByText('더 비싼 집을 골라요')).toBeTruthy();
    expect(screen.getByText('카드를 눌러 선택해요')).toBeTruthy();
    expect(screen.getByText('1/10')).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: '10문제 중 0문제 풀이' })).toBeTruthy();
  });

  it('카드 선택 및 키보드 화살표로 10문제를 완료하면 S-05 결과로 전환하고 저장한다', async () => {
    render(
      <DailyGame
        poolVersion={samplePool.poolVersion}
        dataSourceLinkable={false}
        medianPriceLinkable={false}
        fetchImpl={okFetch()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('question-card-left')).toBeTruthy();
    });

    for (let i = 0; i < 10; i++) {
      if (i === 0) {
        fireEvent.keyDown(window, { key: 'ArrowLeft' });
      } else {
        fireEvent.click(screen.getByTestId('question-card-right'));
      }
      const btnText = i === 9 ? '결과 보기' : '다음 문제';
      await waitFor(() => {
        expect(screen.getByRole('button', { name: btnText })).toBeTruthy();
      });
      fireEvent.click(screen.getByRole('button', { name: btnText }));
    }

    await waitFor(() => {
      expect(screen.getByText('오늘의 결과')).toBeTruthy();
    });

    const keys = Object.keys(window.localStorage).filter((k) => k.startsWith('pd:v1:daily:'));
    expect(keys.length).toBe(1);
    const saved = JSON.parse(window.localStorage.getItem(keys[0])!) as {
      done: boolean;
      answers: boolean[];
    };
    expect(saved.done).toBe(true);
    expect(saved.answers.length).toBe(10);
  });

  it('같은 날 완료 기록이 있으면 S-05 결과를 바로 표시한다', async () => {
    vi.setSystemTime(new Date('2026-12-05T03:00:00Z'));
    window.localStorage.setItem(
      'pd:v1:daily:2026-12-05',
      JSON.stringify({
        poolVersion: 'older-version',
        answers: [true, true, true, true, true, true, true, false, false, false],
        maxStreak: 7,
        done: true,
      }),
    );

    render(
      <DailyGame
        poolVersion={samplePool.poolVersion}
        dataSourceLinkable={false}
        medianPriceLinkable={false}
        fetchImpl={okFetch()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('오늘의 결과')).toBeTruthy();
      expect(screen.getByText('10문제 중 7개')).toBeTruthy();
      expect(screen.getByText('2026년 12월 5일 · 데일리 #5')).toBeTruthy();
    });
  });

  it('UTC 15:00은 KST 다음 날로 계산해 데일리 날짜와 회차를 결정한다', async () => {
    vi.setSystemTime(new Date('2026-12-01T15:00:00Z'));

    render(
      <DailyGame
        poolVersion={samplePool.poolVersion}
        dataSourceLinkable={false}
        medianPriceLinkable={false}
        fetchImpl={okFetch()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('데일리 #2')).toBeTruthy();
    });
  });

  it('로드 실패 시 에러 화면을 표시하고 다시 시도하면 재요청한다', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => samplePool,
      }) as unknown as typeof fetch;

    render(
      <DailyGame
        poolVersion={samplePool.poolVersion}
        dataSourceLinkable={false}
        medianPriceLinkable={false}
        fetchImpl={fetchMock}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('문제를 불러오지 못했어요')).toBeTruthy();
      expect(screen.getByText('네트워크를 확인하고 다시 시도해 주세요')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: '다시 시도하기' }));

    await waitFor(() => {
      expect(screen.getByTestId('question-card-left')).toBeTruthy();
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
