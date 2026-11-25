'use client';

import { useSyncExternalStore } from 'react';
import { LinkButton } from '@/components/Button';
import { track } from '@/lib/analytics/track';
import { t } from '@/lib/i18n/t';

function subscribeScroll(cb: () => void) {
  window.addEventListener('scroll', cb, { passive: true });
  return () => window.removeEventListener('scroll', cb);
}

function getScrolledPast(): boolean {
  return typeof window !== 'undefined' && window.scrollY > 600;
}

export function StickyCtaBar() {
  const visible = useSyncExternalStore(subscribeScroll, getScrolledPast, () => false);

  if (!visible) return null;

  return (
    <div
      data-testid="landing-sticky-cta"
      className="bar-slide-up fixed inset-x-0 bottom-0 z-20 bg-surface px-[var(--space-5)] pt-[var(--space-3)] pb-[calc(var(--space-3)+env(safe-area-inset-bottom))] shadow-[var(--shadow-bar)] xl:hidden"
    >
      <LinkButton
        href="/daily"
        variant="primary"
        className="w-full md:w-full"
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
    </div>
  );
}
