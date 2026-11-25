'use client';

import { useSyncExternalStore } from 'react';
import { LinkButton } from '@/components/Button';
import { Img } from '@/components/Img';
import { kstDate } from '@/features/game';
import { track } from '@/lib/analytics/track';
import { t } from '@/lib/i18n/t';
import { storage } from '@/lib/storage';

const emptySubscribe = () => () => {};

function getTodayDoneScore(): number | null {
  const rec = storage.getDaily(kstDate());
  if (!rec || !rec.done) return null;
  return rec.answers.filter(Boolean).length;
}

export function HeroSection() {
  const doneScore = useSyncExternalStore(emptySubscribe, getTodayDoneScore, () => null);

  const badge =
    doneScore !== null ? (
      <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-success-soft px-[var(--space-2)] py-[var(--space-1)] text-[13px] leading-[20px] font-semibold text-success">
        {t('s01.hero.doneBadge', { score: doneScore })}
      </span>
    ) : null;

  return (
    <section className="mx-auto w-full max-w-[1120px] px-5 pt-[var(--space-8)] md:px-8 md:pt-[var(--space-12)] xl:pt-[var(--space-20)]">
      <div className="grid grid-cols-1 items-center gap-[var(--space-8)] md:grid-cols-8 xl:grid-cols-12">
        <div className="md:col-span-5 xl:col-span-6">
          <h1 className="type-h1 text-text">{t('s01.hero.title')}</h1>
          <p className="type-body mt-[var(--space-3)] text-text-muted">{t('s01.hero.sub')}</p>
          <p className="type-small mt-[var(--space-4)] text-text">{t('s01.hero.message')}</p>

          <div className="mt-[var(--space-6)]">
            {badge ? <div className="mb-[var(--space-2)] md:hidden">{badge}</div> : null}

            <div className="flex flex-col gap-[var(--space-3)] md:flex-row md:flex-wrap md:items-center">
              <LinkButton
                href="/daily"
                variant="primary"
                onClick={() =>
                  track('cta_click', {
                    screen: 'S-01',
                    cta: 'primary',
                    label_key: 's01.hero.ctaPrimary',
                  })
                }
              >
                {t('s01.hero.ctaPrimary')}
              </LinkButton>

              {badge ? <div className="hidden md:inline-flex">{badge}</div> : null}

              <LinkButton
                href="/infinite"
                variant="secondary"
                onClick={() => {
                  track('cta_click', {
                    screen: 'S-01',
                    cta: 'secondary',
                    label_key: 's01.hero.ctaSecondary',
                  });
                  track('mode_switch', { from: 'S-01', to: 'infinite' });
                }}
              >
                {t('s01.hero.ctaSecondary')}
              </LinkButton>
            </div>

            <p className="type-small mt-[var(--space-3)] text-text-muted">
              {t('s01.hero.noSignup')}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center md:col-span-3 xl:col-span-6">
          <Img
            id="IMG-03"
            priority
            className="h-auto max-h-[220px] w-full object-contain md:max-h-none md:max-w-[560px]"
          />
        </div>
      </div>
    </section>
  );
}
