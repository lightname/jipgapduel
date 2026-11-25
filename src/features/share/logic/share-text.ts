import { t } from '@/lib/i18n/t';

export type ShareMethod = 'webshare' | 'copy' | 'download';

export function grid(answers: boolean[], max = 30): string {
  const g = answers
    .slice(0, max)
    .map((a) => (a ? '🟩' : '🟥'))
    .join('');
  return answers.length > max ? `${g} +${answers.length - max}` : g;
}

export function shareUrl(siteUrl: string, method: ShareMethod): string {
  return `${siteUrl}/daily?utm_source=share&utm_medium=${method}`;
}

export function buildShareText(opts: {
  mode: 'daily' | 'infinite';
  no: number;
  score: number;
  maxStreak: number;
  best: number;
  answers: boolean[];
  siteUrl: string;
  method: ShareMethod;
}): string {
  const g = grid(opts.answers);
  const url = shareUrl(opts.siteUrl, opts.method);
  if (opts.mode === 'daily') {
    return t('s05.share.textDaily', {
      no: opts.no,
      score: opts.score,
      maxStreak: opts.maxStreak,
      grid: g,
      url,
    });
  }
  return t('s05.share.textInfinite', {
    streak: opts.score,
    best: opts.best,
    grid: g,
    url,
  });
}
