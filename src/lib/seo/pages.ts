import { listGuides } from '@/lib/content/load';
import { loadStats } from '@/lib/stats';
import type { PageInput } from './index-policy';

export type PageEntry = { path: string; page: PageInput; lastModified: string };

export function allPages(): PageEntry[] {
  const gen = loadStats()?.generatedAt ?? new Date().toISOString();
  return [
    { path: '/', page: { kind: 'landing' }, lastModified: gen },
    { path: '/daily', page: { kind: 'game' }, lastModified: gen },
    { path: '/infinite', page: { kind: 'game' }, lastModified: gen },
    ...listGuides().map((g) => ({
      path: `/guide/${g.slug}`,
      lastModified: g.updatedAt,
      page: { kind: 'guide' as const, reviewed: g.reviewed, hasBody: g.hasBody },
    })),
    { path: '/privacy', page: { kind: 'legal' }, lastModified: gen },
  ];
}
