'use client';

import { MiniMap } from '@/features/map';
import { formatArea, formatPrice, formatYm } from '@/lib/format';
import { t } from '@/lib/i18n/t';
import type { Pool } from '../logic/types';

export type QuestionCardState = 'idle' | 'disabled' | 'correctPick' | 'wrongPick' | 'unpicked';

export type QuestionCardProps = {
  pool: Pool;
  tradeIndex: number;
  side: 'left' | 'right';
  state: QuestionCardState;
  isHigher: boolean;
  revealed: boolean;
  onSelect: (side: 'left' | 'right') => void;
};

const STATE_CLASS: Record<QuestionCardState, string> = {
  idle: 'border border-border cursor-pointer [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-[var(--shadow-raised)] active:scale-[0.98]',
  disabled: 'border border-border cursor-default',
  correctPick: 'border-2 border-success cursor-default',
  wrongPick: 'border-2 border-danger cursor-default',
  unpicked: 'border border-border cursor-default',
};

export function QuestionCard({
  pool,
  tradeIndex,
  side,
  state,
  isHigher,
  revealed,
  onSelect,
}: QuestionCardProps) {
  const trade = pool.trades[tradeIndex];
  const complex = pool.complexes.find((c) => c.id === trade.complexId)!;
  const sgg = pool.sgg.find((s) => s.code === complex.sggCode);
  const region = sgg ? `${sgg.name} ${complex.umd}` : complex.umd;
  const ymLabel = formatYm(trade.dealYm);
  const interactive = state === 'idle';

  const ariaLabel = t('common.card.ariaLabel', {
    name: complex.name,
    region,
    areaM2: Number(trade.areaM2.toFixed(2)),
    floor: trade.floor,
    year: complex.buildYear,
    ym: ymLabel,
  });

  return (
    <button
      type="button"
      data-testid={`question-card-${side}`}
      disabled={!interactive}
      aria-label={ariaLabel}
      onClick={() => {
        if (interactive) onSelect(side);
      }}
      className={`relative flex h-full w-full flex-col justify-between gap-[var(--space-2)] rounded-[var(--radius-lg)] bg-surface p-[var(--space-3)] text-left shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-[var(--duration-fast)] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] md:p-[var(--space-4)] xl:p-[var(--space-6)] ${STATE_CLASS[state]}`}
    >
      {revealed && isHigher ? (
        <span className="absolute top-[var(--space-2)] right-[var(--space-2)] rounded-[var(--radius-sm)] bg-success px-[var(--space-2)] py-[var(--space-1)] text-[13px] leading-[20px] font-bold text-white">
          {t('common.card.correctBadge')}
        </span>
      ) : null}

      <div className="flex flex-col gap-[var(--space-2)]">
        <div className="pr-10">
          <h3 className="type-h4 line-clamp-2 text-text">{complex.name}</h3>
          <p className="type-small mt-[var(--space-1)] text-text-muted">{region}</p>
        </div>

        <ul className="flex flex-col text-[14px] leading-[20px] text-text md:text-[16px] md:leading-[26px]">
          <li>{formatArea(trade.areaM2)}</li>
          <li>{t('common.card.floor', { floor: trade.floor })}</li>
          <li>{t('common.card.buildYear', { year: complex.buildYear })}</li>
          <li>{t('common.card.dealYm', { ym: ymLabel })}</li>
        </ul>

        <MiniMap sgg={pool.sgg} complex={complex} />
      </div>

      <div className="mt-[var(--space-2)] flex h-12 items-center justify-center border-t border-border pt-[var(--space-2)] md:h-14">
        {revealed ? (
          <span className="type-price reveal-fade text-text">{formatPrice(trade.price)}</span>
        ) : (
          <span className="type-price text-text-muted">{t('common.card.hiddenPrice')}</span>
        )}
      </div>
    </button>
  );
}
