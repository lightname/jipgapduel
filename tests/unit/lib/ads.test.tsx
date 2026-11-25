import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockSite = vi.hoisted(() => ({
  ads: {
    enabled: false,
    adsenseClientId: '',
    slots: { resultBottom: '', landingBottom: '' },
  },
}));

vi.mock('@config', () => ({ site: mockSite }));

import { AdSlot } from '@/components/AdSlot';
import { adsTxtLine } from '@/lib/ads';

describe('AdSlot and ads.txt (C-25)', () => {
  afterEach(() => {
    cleanup();
    mockSite.ads.enabled = false;
    mockSite.ads.adsenseClientId = '';
    mockSite.ads.slots.resultBottom = '';
    mockSite.ads.slots.landingBottom = '';
  });

  it('renders nothing when ads disabled, clientId empty, or slot empty', () => {
    const r1 = render(<AdSlot slot="resultBottom" />);
    expect(r1.container.firstChild).toBeNull();

    mockSite.ads.enabled = true;
    const r2 = render(<AdSlot slot="resultBottom" />);
    expect(r2.container.firstChild).toBeNull();

    mockSite.ads.adsenseClientId = 'ca-pub-123';
    const r3 = render(<AdSlot slot="resultBottom" />);
    expect(r3.container.firstChild).toBeNull();
  });

  it('renders ins.adsbygoogle and label when all conditions are met', () => {
    mockSite.ads.enabled = true;
    mockSite.ads.adsenseClientId = 'ca-pub-123';
    mockSite.ads.slots.landingBottom = '999888';

    const { container, getByText } = render(<AdSlot slot="landingBottom" />);
    expect(getByText('광고')).toBeTruthy();
    const ins = container.querySelector('ins.adsbygoogle');
    expect(ins).not.toBeNull();
    expect(ins?.getAttribute('data-ad-client')).toBe('ca-pub-123');
    expect(ins?.getAttribute('data-ad-slot')).toBe('999888');
  });

  it('formats ads.txt line stripping ca- prefix', () => {
    mockSite.ads.enabled = true;
    mockSite.ads.adsenseClientId = 'ca-pub-123';
    expect(adsTxtLine()).toBe('google.com, pub-123, DIRECT, f08c47fec0942fa0');
  });
});
