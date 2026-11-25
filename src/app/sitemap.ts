import type { MetadataRoute } from 'next';
import { site } from '@config';
import { allPages } from '@/lib/seo/pages';
import { isIndexable } from '@/lib/seo/index-policy';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return allPages()
    .filter((e) => isIndexable(e.page))
    .map((e) => {
      const url = e.path === '/' ? site.SITE_URL : `${site.SITE_URL}${e.path}`;
      return {
        url,
        lastModified: e.lastModified,
        alternates: {
          languages: {
            ko: url,
            'x-default': url,
          },
        },
      };
    });
}
