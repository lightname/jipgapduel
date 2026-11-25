'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/Button';
import { DataSource } from '@/components/DataSource';
import { Img } from '@/components/Img';
import { track } from '@/lib/analytics/track';
import { formatDiff } from '@/lib/format';
import { t } from '@/lib/i18n/t';

export type RevealPanelProps = {
  correct: boolean;
  leftPrice: number;
  rightPrice: number;
  isFinal: boolean;
  dataSourceLinkable: boolean;
  onNext: () => void;
};

export function RevealPanel({
  correct,
  leftPrice,
  rightPrice,
  isFinal,
  dataSourceLinkable,
  onNext,
}: RevealPanelProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const sourceRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    btnRef.current?.focus({ preventScroll: true });

    const barEl = barRef.current;
    const sourceEl = sourceRef.current;
    if (!barEl || !sourceEl || typeof window === 'undefined') return;
    if (window.getComputedStyle(barEl).position !== 'fixed') return;

    const barHeight = barEl.offsetHeight;
    if (barHeight <= 0) return;

    const barTop = window.innerHeight - barHeight;
    const sourceBottom = sourceEl.getBoundingClientRect().bottom;
    const overlap = sourceBottom + 12 - barTop;
    if (overlap > 0) {
      window.scrollBy({ top: overlap, behavior: 'auto' });
    }
  }, []);

  const labelKey = isFinal ? 's04.cta.result' : 's04.cta.next';
  const buttonLabel = t(labelKey);

  const handleNext = () => {
    track('cta_click', { screen: 'S-04', cta: 'primary', label_key: labelKey });
    onNext();
  };

  return (
    <div className="reveal-fade mt-[var(--space-6)] w-full">
      <div
        aria-live="polite"
        className={`flex items-center gap-[var(--space-4)] rounded-[var(--radius-lg)] p-[var(--space-3)] md:p-[var(--space-4)] ${
          correct ? 'bg-success-soft' : 'bg-danger-soft'
        }`}
      >
        <Img
          id={correct ? 'IMG-09' : 'IMG-10'}
          className="h-10 w-10 shrink-0 object-contain md:h-12 md:w-12"
        />
        <div className="min-w-0">
          <p className={`type-h3 ${correct ? 'text-success' : 'text-danger'}`}>
            {correct ? t('s04.verdict.correct') : t('s04.verdict.wrong')}
          </p>
          <p className="type-body tabular-nums text-text">
            {t('s04.verdict.diff', { diff: formatDiff(leftPrice, rightPrice) })}
          </p>
        </div>
      </div>

      <div ref={sourceRef} className="mt-[var(--space-3)]">
        <DataSource variant="reveal" linkable={dataSourceLinkable} from="S-04" />
      </div>

      <div
        ref={barRef}
        className="bar-slide-up fixed inset-x-0 bottom-0 z-20 bg-surface px-[var(--space-5)] pt-[var(--space-3)] pb-[calc(var(--space-3)+env(safe-area-inset-bottom))] shadow-[var(--shadow-bar)] md:static md:mt-[var(--space-6)] md:animate-none md:bg-transparent md:p-0 md:text-center md:shadow-none"
      >
        <Button ref={btnRef} variant="primary" onClick={handleNext} className="w-full md:w-[320px]">
          {buttonLabel}
        </Button>
      </div>

      <div className="h-24 md:hidden" aria-hidden="true" />
    </div>
  );
}
