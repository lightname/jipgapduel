import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { site } from '@config';
import { DataSource } from '@/components/DataSource';
import { Img } from '@/components/Img';
import { JsonLd } from '@/components/JsonLd';
import { GuideBody, GuideStickyBar, RelatedGuide } from '@/features/guide';
import { getGuide, isGuideLinkable, listGuides } from '@/lib/content/load';
import { t } from '@/lib/i18n/t';
import { buildMetadata } from '@/lib/seo/build-metadata';
import { loadStats } from '@/lib/stats';

export const dynamicParams = false;

export function generateStaticParams() {
  return listGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return buildMetadata({
    path: `/guide/${guide.slug}`,
    title: `${guide.title} | ${site.name}`,
    description: guide.description,
    og: `guide-${guide.slug}`,
    page: { kind: 'guide', reviewed: guide.reviewed, hasBody: guide.hasBody },
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const stats = loadStats();
  if (!stats) {
    throw new Error('stats.json is required for guide pages');
  }

  const otherSlug =
    slug === 'data-source' ? 'median-price' : slug === 'median-price' ? 'data-source' : null;
  const related = otherSlug && isGuideLinkable(otherSlug) ? getGuide(otherSlug) : null;
  const fromId = slug === 'data-source' ? 'CT-01' : 'CT-02';
  const toId = slug === 'data-source' ? 'CT-02' : 'CT-01';

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    dateModified: guide.updatedAt,
    author: { '@type': 'Organization', name: site.name },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: t('s06.breadcrumb.home'),
        item: site.SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: guide.title,
        item: `${site.SITE_URL}/guide/${guide.slug}`,
      },
    ],
  };

  const datasetLd =
    slug === 'median-price'
      ? {
          '@context': 'https://schema.org',
          '@type': 'Dataset',
          name: guide.title,
          description: guide.description,
          temporalCoverage: `${stats.period.from}/${stats.period.to}`,
          creator: { '@type': 'Organization', name: t('s06.dataset.creator') },
        }
      : null;

  return (
    <article className="mx-auto w-full max-w-[720px] px-5 py-[var(--space-8)] md:px-0 xl:pt-[var(--space-16)]">
      <JsonLd data={articleLd} />
      <JsonLd data={breadcrumbLd} />
      {datasetLd ? <JsonLd data={datasetLd} /> : null}

      <nav aria-label="breadcrumb" className="type-small flex items-center gap-[var(--space-2)] text-text-muted">
        <Link href="/" className="hover:text-primary hover:underline">
          {t('s06.breadcrumb.home')}
        </Link>
        <span aria-hidden="true">{t('s06.breadcrumb.sep')}</span>
        <span className="truncate text-text-muted">{guide.title}</span>
      </nav>

      <header className="mt-[var(--space-4)]">
        <h1 className="type-h1 text-text">{guide.title}</h1>
        <div className="type-small mt-[var(--space-3)] flex flex-wrap items-center gap-x-[var(--space-2)] text-text-muted">
          <DataSource variant="guide" generatedAt={stats.generatedAt} linkable={false} />
          <span>{t('s06.meta.updated', { date: guide.updatedAt })}</span>
        </div>
      </header>

      <Img
        id="IMG-12"
        priority
        className="mt-[var(--space-6)] aspect-video w-full rounded-[var(--radius-lg)] object-cover"
      />

      <GuideBody body={guide.body} stats={stats} />

      <RelatedGuide fromId={fromId} toId={toId} guide={related} />

      <GuideStickyBar />
    </article>
  );
}
