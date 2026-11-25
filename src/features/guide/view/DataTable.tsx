import { formatCount, formatPrice, formatYm } from '@/lib/format';
import { t } from '@/lib/i18n/t';
import type { Stats } from '@/lib/stats';
import type { TableTokenName } from '../logic/tokens';

export type DataTableProps = {
  name: TableTokenName;
  stats: Stats;
};

type TableModel = {
  headers: string[];
  numericCols: boolean[];
  rows: string[][];
};

function buildTable(name: TableTokenName, stats: Stats): TableModel {
  if (name === 'filterFunnel') {
    const steps: { key: keyof Stats['counts']; label: string }[] = [
      { key: 'fetched', label: t('table.funnel.fetched') },
      { key: 'afterCancel', label: t('table.funnel.afterCancel') },
      { key: 'afterDirect', label: t('table.funnel.afterDirect') },
      { key: 'afterNonIndividual', label: t('table.funnel.afterNonIndividual') },
      { key: 'afterLeasehold', label: t('table.funnel.afterLeasehold') },
      { key: 'afterOutlier', label: t('table.funnel.afterOutlier') },
      { key: 'poolTrades', label: t('table.funnel.poolTrades') },
    ];
    const rows = steps.map((step, idx) => {
      const remain = stats.counts[step.key];
      const excluded =
        idx === 0 ? t('table.funnel.none') : formatCount(stats.counts[steps[idx - 1].key] - remain);
      return [step.label, formatCount(remain), excluded];
    });
    return {
      headers: [t('table.funnel.colStep'), t('table.funnel.colRemain'), t('table.funnel.colExcluded')],
      numericCols: [false, true, true],
      rows,
    };
  }

  if (name === 'pairBands') {
    const bands: { key: 'easy' | 'medium' | 'hard'; label: string }[] = [
      { key: 'easy', label: t('table.bands.easy') },
      { key: 'medium', label: t('table.bands.medium') },
      { key: 'hard', label: t('table.bands.hard') },
    ];
    const rows = bands.map(({ key, label }) => {
      const b = stats.pairBands[key];
      const min = Math.round(b.minPct * 100);
      const range =
        b.maxPct === null
          ? t('table.bands.rangeOpen', { min })
          : t('table.bands.range', { min, max: Math.round(b.maxPct * 100) });
      return [label, range, formatCount(b.count)];
    });
    return {
      headers: [t('table.bands.colBand'), t('table.bands.colRange'), t('table.bands.colPairs')],
      numericCols: [false, false, true],
      rows,
    };
  }

  if (name === 'bySgg') {
    return {
      headers: [t('table.median.colSgg'), t('table.median.colPrice'), t('table.median.colCount')],
      numericCols: [false, true, true],
      rows: stats.bySgg.map((r) => [r.name, formatPrice(r.median), formatCount(r.count)]),
    };
  }

  if (name === 'byArea') {
    return {
      headers: [t('table.median.colArea'), t('table.median.colPrice'), t('table.median.colCount')],
      numericCols: [false, true, true],
      rows: stats.byArea.map((r) => [r.band, formatPrice(r.median), formatCount(r.count)]),
    };
  }

  return {
    headers: [t('table.median.colAge'), t('table.median.colPrice'), t('table.median.colCount')],
    numericCols: [false, true, true],
    rows: stats.byAge.map((r) => [r.band, formatPrice(r.median), formatCount(r.count)]),
  };
}

export function DataTable({ name, stats }: DataTableProps) {
  const model = buildTable(name, stats);
  const period = `${formatYm(stats.period.from)} ~ ${formatYm(stats.period.to)}`;

  return (
    <figure className="my-[var(--space-6)]" data-testid={`table-${name}`}>
      <div className="overflow-x-auto rounded-[var(--radius-md)] border border-border bg-surface">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="type-small bg-bg font-bold text-text">
              {model.headers.map((head, idx) => (
                <th
                  key={head}
                  scope="col"
                  className={`h-11 px-[var(--space-3)] whitespace-nowrap ${
                    idx === 0 ? 'sticky left-0 z-10 bg-bg' : ''
                  } ${model.numericCols[idx] ? 'text-right' : 'text-left'}`}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {model.rows.map((cells, rowIdx) => {
              const rowBg = rowIdx % 2 === 0 ? 'bg-surface' : 'bg-bg';
              return (
                <tr key={rowIdx} className={`h-11 border-t border-border ${rowBg}`}>
                  {cells.map((cell, colIdx) => (
                    <td
                      key={colIdx}
                      className={`type-body px-[var(--space-3)] whitespace-nowrap text-text ${
                        colIdx === 0 ? `sticky left-0 z-10 ${rowBg}` : ''
                      } ${model.numericCols[colIdx] ? 'text-right tabular-nums' : 'text-left'}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <figcaption className="mt-[var(--space-2)]">
        <p className="type-small text-text-muted">{t('table.caption', { period })}</p>
        {name === 'bySgg' ? (
          <p className="type-small mt-[var(--space-1)] text-warning">{t('table.bySggWarning')}</p>
        ) : null}
      </figcaption>
    </figure>
  );
}
