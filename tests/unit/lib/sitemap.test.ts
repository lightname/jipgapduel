import { describe, expect, it } from 'vitest';
import { site } from '@config';
import sitemap from '@/app/sitemap';
import { buildMetadata } from '@/lib/seo/build-metadata';

describe('SEO sitemap and metadata', () => {
  it('includes only level-1 indexable routes in sitemap', () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toEqual([
      site.SITE_URL,
      `${site.SITE_URL}/daily`,
      `${site.SITE_URL}/infinite`,
    ]);
  });

  it('sets canonical without trailing slash and includes hreflang when indexable', () => {
    const home = buildMetadata({
      path: '/',
      title: '집값대결 — 둘 중 더 비싼 집 고르기',
      description: '설명 문구',
      og: 'S-01',
      page: { kind: 'landing' },
    });
    expect(home.alternates?.canonical).toBe(site.SITE_URL);
    expect(home.alternates?.languages).toEqual({ ko: site.SITE_URL, 'x-default': site.SITE_URL });

    const privacy = buildMetadata({
      path: '/privacy',
      title: '개인정보처리방침 | 집값대결',
      description: '설명 문구',
      og: 'S-01',
      page: { kind: 'legal' },
    });
    expect(privacy.alternates?.canonical).toBe(`${site.SITE_URL}/privacy`);
    expect(privacy.robots).toEqual({ index: false, follow: true });
    expect(privacy.alternates?.languages).toBeUndefined();
  });
});
