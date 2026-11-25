import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import NotFoundPage, { metadata } from '@/app/not-found';
import * as analytics from '@/lib/analytics/track';

describe('NotFound (S-08)', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('404 문구, 이미지, 1차 CTA(/daily), 홈 링크(/)를 렌더하고 클릭 이벤트를 전송한다', () => {
    const trackSpy = vi.spyOn(analytics, 'track');

    render(<NotFoundPage />);

    expect(screen.getByRole('heading', { level: 1, name: '페이지를 찾을 수 없어요' })).toBeTruthy();
    expect(screen.getByText('주소가 바뀌었거나 없는 페이지예요')).toBeTruthy();

    const dailyLink = screen.getByRole('link', { name: '오늘의 10문제 풀기' });
    expect(dailyLink.getAttribute('href')).toBe('/daily');
    expect(screen.getByRole('link', { name: '홈으로 가기' }).getAttribute('href')).toBe('/');

    fireEvent.click(dailyLink);
    expect(trackSpy).toHaveBeenCalledWith('cta_click', {
      screen: 'S-08',
      cta: 'primary',
      label_key: 's08.ctaPrimary',
    });
  });

  it('메타데이터 robots가 noindex이다', () => {
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.title).toBe('페이지를 찾을 수 없어요 | 집값대결');
  });
});
