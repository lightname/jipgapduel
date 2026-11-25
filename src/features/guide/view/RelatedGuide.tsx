'use client';

import Link from 'next/link';
import { ArrowRightIcon } from '@/components/icons';
import { track } from '@/lib/analytics/track';
import { t } from '@/lib/i18n/t';

export type RelatedGuideProps = {
  fromId: string;
  toId: string;
  guide: { slug: string; title: string; description: string } | null;
};

export function RelatedGuide({ fromId, toId, guide }: RelatedGuideProps) {
  if (!guide) return null;

  return (
    <section className="mt-[var(--space-12)]" data-testid="related-guide">
      <h3 className="type-h3 text-text">{t('s06.related.title')}</h3>
      <Link
        href={`/guide/${guide.slug}`}
        onClick={() => track('internal_link_click', { from: fromId, to: toId })}
        className="mt-[var(--space-4)] flex items-center justify-between gap-[var(--space-4)] rounded-[var(--radius-lg)] bg-surface p-[var(--space-6)] shadow-[var(--shadow-card)] transition-shadow duration-[var(--duration-fast)] hover:shadow-[var(--shadow-raised)] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
      >
        <div className="min-w-0">
          <h4 className="type-h4 text-text">{guide.title}</h4>
          <p className="type-small mt-[var(--space-1)] text-text-muted">{guide.description}</p>
        </div>
        <ArrowRightIcon className="h-5 w-5 shrink-0 text-primary" />
      </Link>
    </section>
  );
}
