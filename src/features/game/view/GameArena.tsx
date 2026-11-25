'use client';

import { useEffect, useRef } from 'react';
import { t } from '@/lib/i18n/t';
import type { GameState } from '../logic/reducer';
import { QuestionCard, type QuestionCardState } from './QuestionCard';
import { RevealPanel } from './RevealPanel';

export type GameArenaProps = {
  state: GameState;
  hint: string;
  dataSourceLinkable: boolean;
  onSelect: (side: 'left' | 'right') => void;
  onNext: () => void;
  progressBar?: React.ReactNode;
};

function cardStateFor(
  state: GameState,
  side: 'left' | 'right',
  lastCorrect: boolean,
): QuestionCardState {
  if (state.phase === 'question') return 'idle';
  if (state.selected === side) return lastCorrect ? 'correctPick' : 'wrongPick';
  return 'unpicked';
}

export function GameArena({
  state,
  hint,
  dataSourceLinkable,
  onSelect,
  onNext,
  progressBar,
}: GameArenaProps) {
  const questionRef = useRef<HTMLDivElement>(null);
  const revealed = state.phase === 'revealed';
  const current = state.questions[state.index];

  useEffect(() => {
    if (state.phase !== 'question') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onSelect('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onSelect('right');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state.phase, onSelect]);

  if (!state.pool || !current) return null;

  const leftPrice = state.pool.trades[current.left].price;
  const rightPrice = state.pool.trades[current.right].price;
  const lastCorrect = state.answers[state.answers.length - 1] ?? false;
  const isFinal =
    state.mode === 'daily'
      ? state.index >= state.questions.length - 1
      : !lastCorrect;

  const handleNext = () => {
    onNext();
    if (typeof window !== 'undefined' && typeof questionRef.current?.scrollIntoView === 'function') {
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      questionRef.current.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    }
  };

  return (
    <section className="mx-auto w-full max-w-[880px] px-5 py-[var(--space-6)] md:px-8">
      {progressBar}

      <div ref={questionRef} className="mb-[var(--space-5)] text-center">
        <h2 className="text-[20px] leading-[28px] font-bold text-text md:text-[28px] md:leading-[38px]">
          {t('s02.question.title')}
        </h2>
        {!revealed ? (
          <p className="type-small mt-[var(--space-1)] text-text-muted">{hint}</p>
        ) : null}
      </div>

      <div
        key={state.index}
        className="reveal-fade relative grid grid-cols-2 items-stretch gap-[var(--space-3)] md:gap-[var(--space-6)]"
      >
        <QuestionCard
          pool={state.pool}
          tradeIndex={current.left}
          side="left"
          state={cardStateFor(state, 'left', lastCorrect)}
          isHigher={leftPrice > rightPrice}
          revealed={revealed}
          onSelect={onSelect}
        />
        <QuestionCard
          pool={state.pool}
          tradeIndex={current.right}
          side="right"
          state={cardStateFor(state, 'right', lastCorrect)}
          isHigher={rightPrice > leftPrice}
          revealed={revealed}
          onSelect={onSelect}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[var(--radius-full)] bg-secondary text-[13px] leading-[20px] font-extrabold text-white shadow-[var(--shadow-card)] md:h-11 md:w-11"
        >
          {t('s02.vs')}
        </span>
      </div>

      {revealed ? (
        <RevealPanel
          correct={lastCorrect}
          leftPrice={leftPrice}
          rightPrice={rightPrice}
          isFinal={isFinal}
          dataSourceLinkable={dataSourceLinkable}
          onNext={handleNext}
        />
      ) : null}
    </section>
  );
}
