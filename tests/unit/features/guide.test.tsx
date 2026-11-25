import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { GuideBody, RelatedGuide, splitBody } from '@/features/guide';
import { getGuide } from '@/lib/content/load';
import { buildMetadata } from '@/lib/seo/build-metadata';
import type { Stats } from '@/lib/stats';

const mockStats: Stats = {
  schemaVersion: 1,
  generatedAt: '2026-11-25T15:27:02.622Z',
  poolVersion: '20261126-0027',
  period: { from: '2024-11', to: '2026-10' },
  sggCount: 5,
  counts: {
    fetched: 412,
    afterCancel: 406,
    afterDirect: 395,
    afterNonIndividual: 390,
    afterLeasehold: 388,
    afterOutlier: 388,
    poolTrades: 369,
  },
  pairBands: {
    easy: { count: 300, minPct: 0.3, maxPct: null },
    medium: { count: 300, minPct: 0.1, maxPct: 0.3 },
    hard: { count: 300, minPct: 0.02, maxPct: 0.1 },
  },
  bySgg: [{ code: '11680', name: '서울 강남구', median: 315000, count: 93 }],
  byArea: [{ band: '60㎡ 이하', median: 129750, count: 138 }],
  byAge: [{ band: '5년 이내', median: 240000, count: 23 }],
};

describe('Guide (S-06)', () => {
  afterEach(() => {
    cleanup();
  });

  it('허용 토큰을 표·메타·CTA로 렌더한다', () => {
    const body = [
      '{{meta:period}}',
      '{{table:filterFunnel}}',
      '{{table:pairBands}}',
      '{{table:bySgg}}',
      '{{cta:primary}}',
      '{{cta:secondary}}',
    ].join('\n\n');

    render(<GuideBody body={body} stats={mockStats} />);

    expect(screen.getByText('2024년 11월 ~ 2026년 10월')).toBeTruthy();
    expect(screen.getByTestId('table-filterFunnel')).toBeTruthy();
    expect(screen.getByTestId('table-pairBands')).toBeTruthy();
    expect(screen.getByTestId('table-bySgg')).toBeTruthy();
    expect(screen.getByText('거래 30건 미만 시군구는 표에서 뺐어요')).toBeTruthy();
    expect(screen.getByText('31억 5,000만원')).toBeTruthy();
    expect(screen.getByRole('link', { name: '오늘의 10문제 풀기' }).getAttribute('href')).toBe(
      '/daily',
    );
    expect(screen.getByRole('link', { name: '무한 모드 하기' }).getAttribute('href')).toBe(
      '/infinite',
    );
  });

  it('알 수 없는 토큰이나 줄 중간 토큰, stats 없음이면 throw한다', () => {
    expect(() => splitBody('{{table:unknown}}')).toThrow();
    expect(() => splitBody('앞 문장 {{meta:period}} 뒤 문장')).toThrow();
    expect(() => render(<GuideBody body="{{meta:period}}" stats={null} />)).toThrow();
  });

  it('미검수·본문 없는 가이드 파일은 robots noindex를 반환한다', () => {
    const g1 = getGuide('data-source');
    const g2 = getGuide('median-price');
    expect(g1).not.toBeNull();
    expect(g2).not.toBeNull();
    expect(g1!.reviewed).toBe(false);
    expect(g1!.hasBody).toBe(false);

    const meta = buildMetadata({
      path: `/guide/${g1!.slug}`,
      title: `${g1!.title} | 집값대결`,
      description: g1!.description,
      og: `guide-${g1!.slug}`,
      page: { kind: 'guide', reviewed: g1!.reviewed, hasBody: g1!.hasBody },
    });
    expect(meta.robots).toEqual({ index: false, follow: true });
  });

  it('상대 글이 미검수(null)이면 관련 글 섹션을 숨긴다', () => {
    const { rerender } = render(<RelatedGuide fromId="CT-01" toId="CT-02" guide={null} />);
    expect(screen.queryByTestId('related-guide')).toBeNull();

    rerender(
      <RelatedGuide
        fromId="CT-01"
        toId="CT-02"
        guide={{ slug: 'median-price', title: '중간 가격', description: '설명' }}
      />,
    );
    expect(screen.getByTestId('related-guide')).toBeTruthy();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/guide/median-price');
  });
});
