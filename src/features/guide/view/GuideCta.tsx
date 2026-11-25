'use client';

import { LinkButton } from '@/components/Button';
import { track } from '@/lib/analytics/track';
import { t } from '@/lib/i18n/t';
import type { CtaTokenName } from '../logic/tokens';

export type GuideCtaProps = {
  variant: CtaTokenName;
};

export function GuideCta({ variant }: GuideCtaProps) {
  const isPrimary = variant === 'primary';

  return (
    <aside
      data-guide-cta="true"
      className="my-[var(--space-6)] rounded-[var(--radius-lg)] bg-primary-soft p-[var(--space-5)] text-left md:p-[var(--space-6)]"
    >
      <h3 className="type-h3 text-text">
        {isPrimary ? t('s06.cta.primaryTitle') : t('s06.cta.secondaryTitle')}
      </h3>

      <div className="mt-[var(--space-4)]">
        {isPrimary ? (
          <LinkButton
            href="/daily"
            variant="primary"
            onClick={() =>
              track('cta_click', {
                screen: 'S-06',
                cta: 'primary',
                label_key: 's06.cta.primaryBtn',
              })
            }
          >
            {t('s06.cta.primaryBtn')}
          </LinkButton>
        ) : (
          <LinkButton
            href="/infinite"
            variant="secondary"
            onClick={() =>
              track('cta_click', {
                screen: 'S-06',
                cta: 'secondary',
                label_key: 's06.cta.secondaryBtn',
              })
            }
          >
            {t('s06.cta.secondaryBtn')}
          </LinkButton>
        )}
      </div>

      {isPrimary ? (
        <p className="type-small mt-[var(--space-2)] text-text-muted">{t('s06.cta.primaryHint')}</p>
      ) : null}
    </aside>
  );
}
