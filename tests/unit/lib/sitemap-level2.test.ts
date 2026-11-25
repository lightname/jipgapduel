import { describe, expect, it, vi } from 'vitest';

const MOCK_FILES: Record<string, string> = {
  'data-source.md': `---
title: 실거래가 데이터 출처와 제외 기준
description: 집값대결이 쓰는 국토교통부 아파트 매매 실거래 자료의 수집 범위와 해제·직거래·이상치 제외 기준, 단계별 남은 거래 수를 정리했어요.
reviewed: true
updatedAt: 2026-11-26
---
데이터 출처와 제외 기준 본문입니다.

{{table:filterFunnel}}
`,
  'median-price.md': `---
title: 수도권 아파트 실거래 중간 가격: 시군구·면적·연식별
description: 필터를 통과한 수도권 아파트 매매 실거래로 시군구별·전용면적대별·연식대별 중간 가격과 거래 수를 표로 정리했어요.
reviewed: true
updatedAt: 2026-11-26
---
시군구별 중간 가격 본문입니다.

{{table:bySgg}}
`,
};

vi.mock('@config', async () => {
  const actual = await vi.importActual<typeof import('@config')>('@config');
  return {
    ...actual,
    site: {
      ...actual.site,
      indexLevel: 2 as const,
    },
  };
});

vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs');
  return {
    ...actual,
    existsSync: (p: string) => {
      if (String(p).includes('content/ko/guide')) return true;
      return actual.existsSync(p);
    },
    readdirSync: (p: string) => {
      if (String(p).includes('content/ko/guide')) return Object.keys(MOCK_FILES);
      return actual.readdirSync(p);
    },
    readFileSync: (p: string, enc?: BufferEncoding) => {
      const s = String(p);
      for (const [name, content] of Object.entries(MOCK_FILES)) {
        if (s.endsWith(name)) return content;
      }
      return actual.readFileSync(p, enc);
    },
  };
});

describe('SEO sitemap level 2 with reviewed guides (T-18)', () => {
  it('indexLevel 2에서 reviewed:true + 본문 있는 가이드 2개가 sitemap에 포함된다', async () => {
    const { default: sitemap } = await import('@/app/sitemap');
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toEqual([
      'https://price-duel.pages.dev',
      'https://price-duel.pages.dev/daily',
      'https://price-duel.pages.dev/infinite',
      'https://price-duel.pages.dev/guide/data-source',
      'https://price-duel.pages.dev/guide/median-price',
    ]);
  });
});
