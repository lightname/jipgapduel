'use client';

import { t } from '@/lib/i18n/t';
import { GameArena } from './GameArena';
import { GameError } from './GameError';
import { GameLoading } from './GameLoading';
import { HeaderStatusPortal } from './HeaderStatusPortal';
import { ResultView } from './ResultView';
import { useGame } from './useGame';

export type InfiniteGameProps = {
  poolVersion: string;
  dataSourceLinkable: boolean;
  medianPriceLinkable: boolean;
  fetchImpl?: typeof fetch;
  rnd?: () => number;
};

export function InfiniteGame({
  poolVersion,
  dataSourceLinkable,
  medianPriceLinkable,
  fetchImpl,
  rnd,
}: InfiniteGameProps) {
  const { state, date, bestRecord, isNewBest, emitGameEnd, select, next, retry, restart } = useGame(
    {
      mode: 'infinite',
      poolVersion,
      fetchImpl,
      rnd,
    },
  );

  if (state.phase === 'loading') {
    return <GameLoading />;
  }

  if (state.phase === 'error') {
    return <GameError errorCode={state.errorCode} onRetry={retry} />;
  }

  if (state.phase === 'finished') {
    return (
      <ResultView
        mode="infinite"
        date={date}
        answers={state.answers}
        maxStreak={state.maxStreak}
        bestRecord={bestRecord}
        isNewBest={isNewBest}
        medianPriceLinkable={medianPriceLinkable}
        emitGameEnd={emitGameEnd}
        onRestart={restart}
      />
    );
  }

  return (
    <>
      <HeaderStatusPortal>
        <span className="type-h4 tabular-nums text-text">
          {t('s03.header.streak', { streak: state.streak })}
        </span>
        <span className="type-small tabular-nums text-text-muted">
          {t('s03.header.best', { best: bestRecord })}
        </span>
      </HeaderStatusPortal>

      <GameArena
        state={state}
        hint={t('s03.question.hint')}
        dataSourceLinkable={dataSourceLinkable}
        onSelect={select}
        onNext={next}
      />
    </>
  );
}
