'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { site } from '@config';
import { AdSlot } from '@/components/AdSlot';
import { Button, LinkButton } from '@/components/Button';
import { CheckIcon, XIcon } from '@/components/icons';
import { Img } from '@/components/Img';
import { ShareBlock, type ShareImageInput } from '@/features/share';
import { track } from '@/lib/analytics/track';
import { formatDateKo } from '@/lib/format';
import { t } from '@/lib/i18n/t';
import { dailyNumber } from '../logic/random';

export type ResultViewProps = {
  mode: 'daily' | 'infinite';
  date: string;
  answers: boolean[];
  maxStreak: number;
  bestRecord: number;
  isNewBest?: boolean;
  medianPriceLinkable: boolean;
  emitGameEnd?: boolean;
  onRestart?: () => void;
  imageRenderer?: (input: ShareImageInput) => Promise<Blob | null>;
};

export function ResultView({
  mode,
  date,
  answers,
  maxStreak,
  bestRecord,
  isNewBest = false,
  medianPriceLinkable,
  emitGameEnd = false,
  onRestart,
  imageRenderer,
}: ResultViewProps) {
  const sentRef = useRef(false);
  const correctCount = answers.filter(Boolean).length;
  const wrongCount = answers.length - correctCount;
  const score = mode === 'daily' ? correctCount : maxStreak;
  const no = dailyNumber(date, site.launchDate);
  const best = Math.max(bestRecord, score);
  const visible = answers.slice(0, 30);
  const overflow = answers.length > 30 ? answers.length - 30 : 0;

  useEffect(() => {
    if (!emitGameEnd || sentRef.current) return;
    sentRef.current = true;
    track('game_end', { mode, score, maxStreak });
  }, [emitGameEnd, mode, score, maxStreak]);

  return (
    <section className="mx-auto flex w-full max-w-[560px] flex-col items-center px-5 py-[var(--space-8)] md:px-0">
      <div className="reveal-fade flex w-full flex-col items-center rounded-[var(--radius-lg)] bg-surface p-[var(--space-6)] text-center shadow-[var(--shadow-card)] md:p-[var(--space-8)]">
        <Img
          id="IMG-11"
          className="h-[120px] w-[180px] object-contain md:h-[160px] md:w-[240px]"
        />

        {mode === 'daily' ? (
          <>
            <h2 className="type-h2 mt-[var(--space-4)] text-text">{t('s05.daily.title')}</h2>
            <p className="type-small mt-[var(--space-1)] text-text-muted">
              {t('s05.daily.meta', { date: formatDateKo(date), no })}
            </p>
            <p className="type-score mt-[var(--space-4)] text-text">
              {t('s05.daily.score', { score })}
            </p>
            <p className="type-body mt-[var(--space-1)] tabular-nums text-text">
              {t('s05.daily.maxStreak', { maxStreak })}
            </p>
          </>
        ) : (
          <>
            <h2 className="type-h2 mt-[var(--space-4)] text-text">{t('s05.infinite.title')}</h2>
            {isNewBest ? (
              <span className="mt-[var(--space-3)] inline-block rounded-[var(--radius-sm)] bg-primary-soft px-[var(--space-2)] py-[var(--space-1)] text-[13px] leading-[20px] font-bold text-primary">
                {t('s05.infinite.newBest')}
              </span>
            ) : null}
            <p className="type-score mt-[var(--space-3)] text-text">
              {t('s05.infinite.score', { score })}
            </p>
            <p className="type-body mt-[var(--space-1)] tabular-nums text-text">
              {t('s05.infinite.best', { best })}
            </p>
          </>
        )}

        <div
          aria-label={t('s05.grid.ariaLabel', { correct: correctCount, wrong: wrongCount })}
          className="mt-[var(--space-5)] grid max-w-[374px] grid-cols-10 gap-[6px]"
        >
          {visible.map((ok, idx) => (
            <span
              key={idx}
              aria-hidden="true"
              className={`flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-white md:h-8 md:w-8 ${
                ok ? 'bg-success' : 'bg-danger'
              }`}
            >
              {ok ? (
                <CheckIcon className="h-[18px] w-[18px]" />
              ) : (
                <XIcon className="h-[18px] w-[18px]" />
              )}
            </span>
          ))}
          {overflow > 0 ? (
            <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-bg text-[13px] font-bold text-text-muted md:h-8 md:w-8">
              +{overflow}
            </span>
          ) : null}
        </div>

        {mode === 'daily' ? (
          <p className="type-body mt-[var(--space-5)] text-text-muted">
            {t('s05.daily.message')}
          </p>
        ) : null}
      </div>

      <ShareBlock
        mode={mode}
        date={date}
        no={no}
        score={score}
        maxStreak={maxStreak}
        best={best}
        answers={answers}
        imageRenderer={imageRenderer}
      />

      {mode === 'daily' ? (
        <p className="type-small mt-[var(--space-4)] text-center text-text-muted">
          {t('s05.daily.revisit')}
        </p>
      ) : null}

      <div className="mt-[var(--space-6)] w-full">
        {mode === 'daily' ? (
          <LinkButton
            href="/infinite"
            variant="secondary"
            className="w-full md:w-full"
            onClick={() => {
              track('cta_click', {
                screen: 'S-05',
                cta: 'secondary',
                label_key: 's05.cta.toInfinite',
              });
              track('mode_switch', { from: 'S-05', to: 'infinite' });
            }}
          >
            {t('s05.cta.toInfinite')}
          </LinkButton>
        ) : (
          <Button
            variant="secondary"
            className="w-full md:w-full"
            onClick={() => {
              track('cta_click', {
                screen: 'S-05',
                cta: 'secondary',
                label_key: 's05.cta.replay',
              });
              track('replay_click', { mode: 'infinite' });
              onRestart?.();
            }}
          >
            {t('s05.cta.replay')}
          </Button>
        )}
      </div>

      {medianPriceLinkable ? (
        <div className="mt-[var(--space-8)] text-center">
          <Link
            href="/guide/median-price"
            className="btn-text"
            onClick={() => track('internal_link_click', { from: 'S-05', to: 'CT-02' })}
          >
            {t('s05.link.medianPrice')}
          </Link>
        </div>
      ) : null}

      <AdSlot slot="resultBottom" />
    </section>
  );
}
