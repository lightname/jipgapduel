import type { Metadata } from 'next';
import { site } from '@config';
import { AdSlot } from '@/components/AdSlot';
import { JsonLd } from '@/components/JsonLd';
import {
  DataSummarySection,
  HeroSection,
  HowToSection,
  StickyCtaBar,
} from '@/features/landing';
import { isGuideLinkable } from '@/lib/content/load';
import { t } from '@/lib/i18n/t';
import { buildMetadata } from '@/lib/seo/build-metadata';
import { loadStats } from '@/lib/stats';

export const metadata: Metadata = buildMetadata({
  path: '/',
  title: t('meta.s01.title'),
  description: t('meta.s01.description'),
  og: 'S-01',
  page: { kind: 'landing' },
});

export default function HomePage() {
  const stats = loadStats();
  const dataSourceLinkable = isGuideLinkable('data-source');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.SITE_URL,
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <HeroSection />
      <HowToSection />
      <DataSummarySection stats={stats} dataSourceLinkable={dataSourceLinkable} />
      <div className="mx-auto w-full max-w-[1120px] px-5 md:px-8">
        <AdSlot slot="landingBottom" />
      </div>
      <StickyCtaBar />
    </>
  );
}
