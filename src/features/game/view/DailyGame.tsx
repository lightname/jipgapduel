'use client';

import { site } from '@config';
import { t } from '@/lib/i18n/t';
import { dailyNumber } from '../logic/random';
import { DAILY_BANDS } from '../logic/rules';
import { GameArena } from './GameArena';
import { GameError } from './GameError';
import { GameLoading } from './GameLoading';
import { HeaderStatusPortal } from './HeaderStatusPortal';
import { ResultView } from './ResultView';
import { useGame } from './useGame';

export type DailyGameProps = {
  poolVersion: string;
  dataSourceLinkable: boolean;
  medianPriceLinkable: boolean;
  fetchImpl?: typeof fetch;
};

export function DailyGame({
  poolVersion,
  dataSourceLinkable,
  medianPriceLinkable,
  fetchImpl,
}: DailyGameProps) {
  const { state, date, emitGameEnd, select, next, retry } = useGame({
    mode: 'daily',
    poolVersion,
    fetchImpl,
  });

  const no = dailyNumber(date, site.launchDate);
  const total = DAILY_BANDS.length;

  if (state.phase === 'loading') {
    return <GameLoading showProgress />;
  }

  if (state.phase === 'error') {
    return <GameError errorCode={state.errorCode} onRetry={retry} />;
  }

  if (state.phase === 'finished') {
    return (
      <ResultView
        mode="daily"
        date={date}
        answers={state.answers}
        maxStreak={state.maxStreak}
        bestRecord={0}
        medianPriceLinkable={medianPriceLinkable}
        emitGameEnd={emitGameEnd}
      />
    );
  }

  const progressBar = (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={state.answers.length}
      aria-label={t('s02.progress.ariaLabel', { done: state.answers.length })}
      className="mb-[var(--space-6)] grid grid-cols-10 gap-[var(--space-1)]"
    >
      {Array.from({ length: total }, (_, idx) => {
        const solved = idx < state.answers.length;
        const color = solved ? (state.answers[idx] ? 'bg-success' : 'bg-danger') : 'bg-border';
        return <span key={idx} className={`h-1.5 rounded-[var(--radius-full)] ${color}`} />;
      })}
    </div>
  );

  return (
    <>
      <HeaderStatusPortal>
        <span className="type-small text-text-muted">{t('s02.header.label', { no })}</span>
        <span className="type-h4 tabular-nums text-text">
          {t('s02.header.progress', { current: Math.min(state.index + 1, total) })}
        </span>
      </HeaderStatusPortal>

      <GameArena
        state={state}
        hint={t('s02.question.hint')}
        dataSourceLinkable={dataSourceLinkable}
        onSelect={select}
        onNext={next}
        progressBar={progressBar}
      />
    </>
  );
}
