'use client';

import Link from 'next/link';
import { t } from '@/lib/i18n/t';
import { track } from '@/lib/analytics/track';

export type DataSourceVariant = 'footer' | 'reveal' | 'guide' | 'landing';

export type DataSourceProps = {
  variant: DataSourceVariant;
  generatedAt?: string | null;
  linkable: boolean;
  from?: string;
};

const DEFAULT_FROM: Record<DataSourceVariant, string> = {
  footer: 'footer',
  reveal: 'S-04',
  guide: 'S-06',
  landing: 'S-01',
};

export function DataSource({ variant, generatedAt, linkable, from }: DataSourceProps) {
  const date = generatedAt ? generatedAt.slice(0, 10) : null;
  const screenFrom = from ?? DEFAULT_FROM[variant];

  const onLinkClick = () => {
    track('internal_link_click', { from: screenFrom, to: 'CT-01' });
  };

  if (variant === 'footer') {
    return (
      <p className="type-small text-text-muted">
        {date ? t('common.source.footer', { date }) : t('common.source.footerNoDate')}
      </p>
    );
  }

  if (variant === 'guide') {
    return (
      <p className="type-small text-text-muted">
        {date ? t('common.source.guide', { date }) : t('common.source.guideNoDate')}
      </p>
    );
  }

  if (variant === 'reveal') {
    return (
      <p className="type-small text-text-muted">
        <span>{t('common.source.reveal')}</span>
        {linkable ? (
          <>
            <span> · </span>
            <Link
              href="/guide/data-source"
              onClick={onLinkClick}
              className="btn-text type-small h-auto px-0"
            >
              {t('common.source.revealLink')}
            </Link>
          </>
        ) : null}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <p className="type-body text-text">{t('common.source.landing')}</p>
      {linkable ? (
        <Link href="/guide/data-source" onClick={onLinkClick} className="btn-text">
          {t('common.source.landingLink')}
        </Link>
      ) : null}
    </div>
  );
}
