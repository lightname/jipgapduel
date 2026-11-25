'use client';

import { LinkButton } from '@/components/Button';
import { HomeIcon } from '@/components/icons';
import { Img } from '@/components/Img';
import { track } from '@/lib/analytics/track';
import { t } from '@/lib/i18n/t';

export function NotFoundView() {
  return (
    <section className="mx-auto flex w-full max-w-[480px] flex-col items-center px-5 py-[var(--space-12)] text-center md:px-0 md:py-[var(--space-20)]">
      <Img
        id="IMG-14"
        priority
        className="h-[180px] w-[240px] object-contain md:h-[240px] md:w-[320px]"
      />
      <h1 className="type-h2 mt-[var(--space-6)] text-text">{t('s08.title')}</h1>
      <p className="type-body mt-[var(--space-2)] text-text-muted">{t('s08.desc')}</p>

      <div className="mt-[var(--space-6)] w-full md:w-auto">
        <LinkButton
          href="/daily"
          variant="primary"
          onClick={() =>
            track('cta_click', {
              screen: 'S-08',
              cta: 'primary',
              label_key: 's08.ctaPrimary',
            })
          }
        >
          {t('s08.ctaPrimary')}
        </LinkButton>
      </div>

      <div className="mt-[var(--space-3)]">
        <LinkButton href="/" variant="text" icon={<HomeIcon />}>
          {t('s08.ctaHome')}
        </LinkButton>
      </div>
    </section>
  );
}
