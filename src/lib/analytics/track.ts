import { site } from '@config';

type Mode = 'daily' | 'infinite';

export type EventMap = {
  cta_click: {
    screen: 'S-01' | 'S-04' | 'S-05' | 'S-06' | 'S-08';
    cta: 'primary' | 'secondary';
    label_key: string;
  };
  game_start: { mode: Mode };
  answer: { mode: Mode; idx: number; correct: boolean; band: 'easy' | 'medium' | 'hard' };
  game_end: { mode: Mode; score: number; maxStreak: number };
  share_click: { method: 'webshare' | 'copy' | 'download' };
  share_done: { method: 'webshare' | 'copy' | 'download' };
  replay_click: { mode: Mode };
  mode_switch: { from: string; to: Mode };
  internal_link_click: { from: string; to: string };
  pool_load_error: { screen: 'S-02' | 'S-03' };
};

declare global {
  interface Window {
    gtag?: (...a: unknown[]) => void;
    adsbygoogle?: unknown[];
  }
}

export function canSend(): boolean {
  if (process.env.NODE_ENV !== 'production' || !site.ga4Id || typeof window === 'undefined') {
    return false;
  }
  return (
    !['localhost', '127.0.0.1'].includes(window.location.hostname) &&
    typeof window.gtag === 'function'
  );
}

export function track<K extends keyof EventMap>(name: K, params: EventMap[K]): void {
  if (!canSend()) return;
  window.gtag!('event', name, params);
}
