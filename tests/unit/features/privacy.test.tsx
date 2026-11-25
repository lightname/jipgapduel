import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { metadata } from '@/app/privacy/page';
import { PrivacyBody } from '@/features/legal';

describe('Privacy (S-07)', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('기본 정책 절을 렌더하고 adsEnabled false일 때 광고 절을 숨긴다', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<PrivacyBody effectiveDate="2026-12-01" adsEnabled={false} contactEmail="" />);

    expect(screen.getByRole('heading', { level: 1, name: '개인정보처리방침' })).toBeTruthy();
    expect(screen.getByText('시행일 2026-12-01')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: '수집하지 않는 정보' })).toBeTruthy();
    expect(screen.queryByRole('heading', { level: 2, name: '광고' })).toBeNull();
    expect(screen.getByText('문의처는 준비 중이에요')).toBeTruthy();
    expect(warnSpy).toHaveBeenCalledWith('[privacy] WARN contactEmail empty');
  });

  it('adsEnabled true이고 contactEmail이 있으면 광고 절과 mailto 링크를 표시한다', () => {
    render(
      <PrivacyBody effectiveDate="2026-12-01" adsEnabled contactEmail="help@example.com" />,
    );

    expect(screen.getByRole('heading', { level: 2, name: '광고' })).toBeTruthy();
    const link = screen.getByRole('link', { name: 'help@example.com' });
    expect(link.getAttribute('href')).toBe('mailto:help@example.com');
  });

  it('메타데이터 robots가 noindex이다', () => {
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.title).toBe('개인정보처리방침 | 집값대결');
  });
});
