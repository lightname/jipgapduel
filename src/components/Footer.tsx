'use client';

import Link from 'next/link';
import { DataSource } from '@/components/DataSource';
import { t } from '@/lib/i18n/t';
import { track } from '@/lib/analytics/track';

export type FooterProps = {
  generatedAt?: string | null;
  showDataSource: boolean;
  showMedianPrice: boolean;
};

export function Footer({ generatedAt, showDataSource, showMedianPrice }: FooterProps) {
  const links: Array<{ href: string; label: string; to: string }> = [
    { href: '/', label: t('common.footer.home'), to: 'S-01' },
    { href: '/daily', label: t('common.footer.daily'), to: 'S-02' },
    { href: '/infinite', label: t('common.footer.infinite'), to: 'S-03' },
  ];

  if (showDataSource) {
    links.push({
      href: '/guide/data-source',
      label: t('common.footer.guideDataSource'),
      to: 'CT-01',
    });
  }
  if (showMedianPrice) {
    links.push({
      href: '/guide/median-price',
      label: t('common.footer.guideMedianPrice'),
      to: 'CT-02',
    });
  }
  links.push({ href: '/privacy', label: t('common.footer.privacy'), to: 'S-07' });

  return (
    <footer className="border-t border-border bg-bg py-[var(--space-10)]">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-[var(--space-4)] px-5 md:px-8">
        <DataSource variant="footer" generatedAt={generatedAt} linkable={false} />
        <nav aria-label={t('common.brand.name')} className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[var(--space-1)]">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => track('internal_link_click', { from: 'footer', to: item.to })}
              className="btn-text !px-0"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="type-small text-text-muted">{t('common.footer.copyright')}</p>
      </div>
    </footer>
  );
}
