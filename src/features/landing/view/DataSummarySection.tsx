import { DataSource } from '@/components/DataSource';
import { formatCount, formatYm } from '@/lib/format';
import { t } from '@/lib/i18n/t';
import type { Stats } from '@/lib/stats';

export type DataSummarySectionProps = {
  stats: Stats | null;
  dataSourceLinkable: boolean;
};

export function DataSummarySection({ stats, dataSourceLinkable }: DataSummarySectionProps) {
  if (!stats) return null;

  const tiles = [
    {
      label: t('s01.data.periodLabel'),
      value: t('s01.data.periodValue', {
        from: formatYm(stats.period.from),
        to: formatYm(stats.period.to),
      }),
    },
    {
      label: t('s01.data.tradesLabel'),
      value: t('s01.data.tradesValue', { count: formatCount(stats.counts.poolTrades) }),
    },
    {
      label: t('s01.data.regionLabel'),
      value: t('s01.data.regionValue', { count: stats.sggCount }),
    },
    {
      label: t('s01.data.updatedLabel'),
      value: stats.generatedAt.slice(0, 10),
    },
  ];

  return (
    <section
      data-testid="data-summary"
      className="mx-auto w-full max-w-[1120px] px-5 py-[var(--space-12)] md:px-8 md:py-[var(--space-16)]"
    >
      <h2 className="type-h2 text-text">{t('s01.data.title')}</h2>

      <dl className="mt-[var(--space-6)] grid grid-cols-2 gap-[var(--space-3)] md:grid-cols-4 md:gap-[var(--space-6)]">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-[var(--radius-lg)] border border-border bg-surface p-[var(--space-4)] md:p-[var(--space-5)]"
          >
            <dt className="type-small text-text-muted">{tile.label}</dt>
            <dd className="type-h3 mt-[var(--space-1)] font-extrabold tabular-nums text-text">
              {tile.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-[var(--space-6)]">
        <DataSource
          variant="landing"
          generatedAt={stats.generatedAt}
          linkable={dataSourceLinkable}
          from="S-01"
        />
      </div>
    </section>
  );
}
