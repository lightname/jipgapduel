import { expect, test } from '@playwright/test';

const SITE_URL = 'https://price-duel.pages.dev';

test.describe('SEO and routes verification (T-18)', () => {
  const indexablePages = [
    { path: '/', title: '집값대결 — 둘 중 더 비싼 집 고르기', canonical: SITE_URL },
    {
      path: '/daily',
      title: '오늘의 집값 퀴즈 10문제 | 집값대결',
      canonical: `${SITE_URL}/daily`,
    },
    {
      path: '/infinite',
      title: '어느 아파트가 더 비쌀까? 무한 모드 | 집값대결',
      canonical: `${SITE_URL}/infinite`,
    },
  ];

  for (const item of indexablePages) {
    test(`indexable route ${item.path} returns 200 with title canonical hreflang`, async ({
      page,
    }) => {
      const res = await page.goto(item.path);
      expect(res?.status()).toBe(200);
      await expect(page).toHaveTitle(item.title);

      const robots = await page.locator('meta[name="robots"]').getAttribute('content');
      expect(robots ?? '').not.toContain('noindex');

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe(item.canonical);

      const hrefKo = await page
        .locator('link[rel="alternate"][hreflang="ko"]')
        .getAttribute('href');
      const hrefDefault = await page
        .locator('link[rel="alternate"][hreflang="x-default"]')
        .getAttribute('href');
      expect(hrefKo).toBe(item.canonical);
      expect(hrefDefault).toBe(item.canonical);

      expect(await page.locator('meta[name="keywords"]').count()).toBe(0);
    });
  }

  const noindexPages = ['/guide/data-source', '/guide/median-price', '/privacy'];

  for (const path of noindexPages) {
    test(`noindex route ${path} returns 200 without hreflang`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);

      const robots = await page.locator('meta[name="robots"]').getAttribute('content');
      expect(robots ?? '').toContain('noindex');

      expect(await page.locator('link[rel="alternate"][hreflang]').count()).toBe(0);
      expect(await page.locator('meta[name="keywords"]').count()).toBe(0);
    });
  }

  test('missing route /no-such-page returns 404 with noindex', async ({ page }) => {
    const res = await page.goto('/no-such-page');
    expect(res?.status()).toBe(404);

    const robotsValues = await page
      .locator('meta[name="robots"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('content') ?? ''));
    expect(robotsValues.length).toBeGreaterThan(0);
    expect(robotsValues.every((v) => v.includes('noindex'))).toBe(true);

    expect(await page.locator('link[rel="alternate"][hreflang]').count()).toBe(0);
    expect(await page.locator('meta[name="keywords"]').count()).toBe(0);
  });

  test('/sitemap.xml lists only 3 indexable URLs', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();
    const locs = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g), (m) => m[1]);
    expect(locs).toEqual([SITE_URL, `${SITE_URL}/daily`, `${SITE_URL}/infinite`]);
  });

  test('/robots.txt outputs 4 directives', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const lines = (await res.text())
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    expect(lines.length).toBe(4);
    expect(lines[0].toLowerCase()).toBe('user-agent: *');
    expect(lines[1]).toBe('Allow: /');
    expect(lines[2]).toBe('Disallow: /data/');
    expect(lines[3]).toBe(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });
});
