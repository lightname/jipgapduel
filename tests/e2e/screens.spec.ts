import { test } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const VIEWPORTS = [
  { width: 375, height: 667 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
] as const;

function readPoolVersion(): string {
  const statsPath = join(process.cwd(), 'src/generated/stats.json');
  if (!existsSync(statsPath)) return 'sample';
  const stats = JSON.parse(readFileSync(statsPath, 'utf8')) as { poolVersion?: string };
  return stats.poolVersion ?? 'sample';
}

function kstToday(): string {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

test.describe('QA screenshots', () => {
  test.beforeAll(() => {
    mkdirSync(join(process.cwd(), 'qa/screens'), { recursive: true });
  });

  const staticTargets = [
    { id: 'S-01', path: '/' },
    { id: 'S-02', path: '/daily' },
    { id: 'S-03', path: '/infinite' },
    { id: 'S-06', path: '/guide/data-source' },
    { id: 'S-07', path: '/privacy' },
    { id: 'S-08', path: '/no-such-page' },
  ];

  for (const target of staticTargets) {
    for (const vp of VIEWPORTS) {
      test(`${target.id} ${vp.width}px`, async ({ page }) => {
        await page.setViewportSize(vp);
        await page.goto(target.path);
        await page.waitForLoadState('networkidle');
        await page.screenshot({
          path: `qa/screens/${target.id}-${vp.width}.png`,
          fullPage: true,
        });
      });
    }
  }

  for (const vp of VIEWPORTS) {
    test(`S-04 ${vp.width}px`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto('/daily');
      await page.waitForLoadState('networkidle');
      const card = page.locator('[data-testid="question-card-left"]');
      if ((await card.count()) > 0) {
        await card.first().click();
        await page.waitForTimeout(250);
      }
      await page.screenshot({
        path: `qa/screens/S-04-${vp.width}.png`,
        fullPage: true,
      });
    });

    test(`S-05 ${vp.width}px`, async ({ page }) => {
      const poolVersion = readPoolVersion();
      const today = kstToday();
      await page.addInitScript(
        ({ key, value }) => {
          window.localStorage.setItem(key, JSON.stringify(value));
        },
        {
          key: `pd:v1:daily:${today}`,
          value: {
            poolVersion,
            answers: [true, true, true, true, true, true, true, true, false, false],
            maxStreak: 8,
            done: true,
          },
        },
      );
      await page.setViewportSize(vp);
      await page.goto('/daily');
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: `qa/screens/S-05-${vp.width}.png`,
        fullPage: true,
      });
    });
  }
});
