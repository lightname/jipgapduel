'use client';

import { useEffect, useRef, useState } from 'react';
import { site } from '@config';
import { Button } from '@/components/Button';
import { CopyIcon, DownloadIcon, ShareIcon } from '@/components/icons';
import { track } from '@/lib/analytics/track';
import { formatDotDate } from '@/lib/format';
import { t } from '@/lib/i18n/t';
import { copyShareText, doShare, downloadShareImage } from '../logic/do-share';
import { renderShareImage, type ShareImageInput } from '../logic/share-image';
import { buildShareText } from '../logic/share-text';

export type ShareBlockProps = {
  mode: 'daily' | 'infinite';
  date: string;
  no: number;
  score: number;
  maxStreak: number;
  best: number;
  answers: boolean[];
  imageRenderer?: (input: ShareImageInput) => Promise<Blob | null>;
};

export function ShareBlock({
  mode,
  date,
  no,
  score,
  maxStreak,
  best,
  answers,
  imageRenderer = renderShareImage,
}: ShareBlockProps) {
  const [fallback, setFallback] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blobRef = useRef<Blob | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const host = new URL(site.SITE_URL).host;
  const labelKey = mode === 'daily' ? 's05.share.ctaDaily' : 's05.share.ctaInfinite';

  const makeBlob = async (): Promise<Blob | null> => {
    if (blobRef.current) return blobRef.current;
    const blob = await imageRenderer({
      mode,
      dateDot: formatDotDate(date),
      no,
      score,
      maxStreak,
      best,
      answers,
      host,
    });
    if (blob) blobRef.current = blob;
    else setImageError(true);
    return blob;
  };

  const handlePrimaryShare = async () => {
    track('cta_click', { screen: 'S-05', cta: 'primary', label_key: labelKey });
    track('share_click', { method: 'webshare' });

    const text = buildShareText({
      mode,
      no,
      score,
      maxStreak,
      best,
      answers,
      siteUrl: site.SITE_URL,
      method: 'webshare',
    });
    const blob = await makeBlob();
    const file = blob ? new File([blob], `jipgapduel-${date}.png`, { type: 'image/png' }) : null;
    const outcome = await doShare(text, file);

    if (outcome === 'shared') {
      track('share_done', { method: 'webshare' });
    } else if (outcome === 'fallback') {
      setFallback(true);
    }
  };

  const handleCopy = async () => {
    track('share_click', { method: 'copy' });
    const text = buildShareText({
      mode,
      no,
      score,
      maxStreak,
      best,
      answers,
      siteUrl: site.SITE_URL,
      method: 'copy',
    });
    const ok = await copyShareText(text);
    if (ok) {
      setCopied(true);
      track('share_done', { method: 'copy' });
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    track('share_click', { method: 'download' });
    const blob = await makeBlob();
    if (!blob) return;
    downloadShareImage(blob, date);
    track('share_done', { method: 'download' });
  };

  return (
    <div className="mt-[var(--space-6)] flex w-full flex-col items-center gap-[var(--space-2)]">
      <p className="type-small text-center text-text-muted">{t('s05.share.noPriceNotice')}</p>

      {!fallback ? (
        <Button
          variant="primary"
          icon={<ShareIcon />}
          onClick={handlePrimaryShare}
          className="w-full md:w-full"
        >
          {t(labelKey)}
        </Button>
      ) : (
        <div className="flex w-full flex-col gap-[var(--space-3)] md:flex-row">
          <Button
            variant="secondary"
            icon={<CopyIcon />}
            onClick={handleCopy}
            className="w-full md:min-w-0 md:flex-1"
          >
            {t('s05.share.copy')}
          </Button>
          <Button
            variant="secondary"
            icon={<DownloadIcon />}
            onClick={handleDownload}
            className="w-full md:min-w-0 md:flex-1"
          >
            {t('s05.share.download')}
          </Button>
        </div>
      )}

      {copied ? (
        <p className="type-small text-success" role="status">
          {t('s05.share.copied')}
        </p>
      ) : null}

      {imageError ? (
        <p className="type-small text-center text-text-muted">{t('s05.share.imageError')}</p>
      ) : null}
    </div>
  );
}
