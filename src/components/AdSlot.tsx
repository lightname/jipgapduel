'use client';

import { useEffect, useRef } from 'react';
import { site } from '@config';
import { slotId, type SlotName } from '@/lib/ads';
import { t } from '@/lib/i18n/t';

export type AdSlotProps = {
  slot: SlotName;
};

export function AdSlot({ slot }: AdSlotProps) {
  const id = slotId(slot);
  const pushed = useRef(false);

  useEffect(() => {
    if (!id || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // 광고 스크립트 미로드 시 무시
    }
  }, [id]);

  if (!id) return null;

  return (
    <aside aria-label={t('common.ad.label')} className="mx-auto my-[var(--space-8)] w-full text-center">
      <p className="type-small mb-[var(--space-2)] text-text-muted">{t('common.ad.label')}</p>
      <div className="mx-auto min-h-[280px] w-full">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={site.ads.adsenseClientId}
          data-ad-slot={id}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}
