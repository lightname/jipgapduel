'use client';

import { useEffect, useState } from 'react';
import { LinkButton } from '@/components/Button';
import { track } from '@/lib/analytics/track';
import { t } from '@/lib/i18n/t';

export function GuideStickyBar() {
  const [scrolled, setScrolled] = useState(false);
  const [ctaInView, setCtaInView] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 800);
    window.addEventListener('scroll', onScroll, { passive: true });

    const targets = Array.from(document.querySelectorAll('[data-guide-cta="true"]'));
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && targets.length > 0) {
      const visibleSet = new Set<Element>();
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibleSet.add(entry.target);
          else visibleSet.delete(entry.target);
        }
        setCtaInView(visibleSet.size > 0);
      });
      for (const el of targets) observer.observe(el);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer?.disconnect();
    };
  }, []);

  if (!scrolled || ctaInView) return null;

  return (
    <div
      data-testid="guide-sticky-cta"
      className="bar-slide-up fixed inset-x-0 bottom-0 z-20 bg-surface px-[var(--space-5)] pt-[var(--space-3)] pb-[calc(var(--space-3)+env(safe-area-inset-bottom))] shadow-[var(--shadow-bar)] md:hidden"
    >
      <LinkButton
        href="/daily"
        variant="primary"
        className="w-full"
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
    </div>
  );
}
