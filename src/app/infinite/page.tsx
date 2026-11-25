import type { Metadata } from 'next';
import { site } from '@config';
import { JsonLd } from '@/components/JsonLd';
import { InfiniteGame } from '@/features/game';
import { isGuideLinkable } from '@/lib/content/load';
import { t } from '@/lib/i18n/t';
import { buildMetadata } from '@/lib/seo/build-metadata';
import { loadStats } from '@/lib/stats';

export const metadata: Metadata = buildMetadata({
  path: '/infinite',
  title: t('meta.s03.title'),
  description: t('meta.s03.description'),
  og: 'S-03',
  page: { kind: 'game' },
});

export default function InfinitePage() {
  const stats = loadStats();
  const poolVersion = stats?.poolVersion ?? 'sample';
  const dataSourceLinkable = isGuideLinkable('data-source');
  const medianPriceLinkable = isGuideLinkable('median-price');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t('meta.s03.title'),
    url: `${site.SITE_URL}/infinite`,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'KRW' },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <h1 className="sr-only">{t('s03.seo.h1')}</h1>
      <InfiniteGame
        poolVersion={poolVersion}
        dataSourceLinkable={dataSourceLinkable}
        medianPriceLinkable={medianPriceLinkable}
      />
    </>
  );
}
