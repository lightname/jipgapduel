import type { Metadata } from 'next';
import { site } from '@config';
import { isIndexable, type PageInput } from './index-policy';

export function buildMetadata(o: {
  path: string;
  title: string;
  description: string;
  og: string;
  page: PageInput;
}): Metadata {
  const url = `${site.SITE_URL}${o.path === '/' ? '' : o.path}` || site.SITE_URL;
  const index = isIndexable(o.page);
  return {
    metadataBase: new URL(site.SITE_URL),
    title: o.title,
    description: o.description,
    alternates: {
      canonical: url,
      ...(index ? { languages: { ko: url, 'x-default': url } } : {}),
    },
    robots: { index, follow: true },
    openGraph: {
      type: 'website',
      url,
      title: o.title,
      description: o.description,
      siteName: site.name,
      locale: 'ko_KR',
      images: [{ url: `/og/${o.og}.png`, width: 1200, height: 630, alt: o.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: o.title,
      description: o.description,
      images: [`/og/${o.og}.png`],
    },
  };
}
