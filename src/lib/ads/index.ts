import { site } from '@config';

export type SlotName = keyof typeof site.ads.slots;

export const adsScriptEnabled = (): boolean =>
  site.ads.enabled && site.ads.adsenseClientId.trim() !== '';

export const slotId = (s: SlotName): string | null =>
  adsScriptEnabled() && site.ads.slots[s].trim() ? site.ads.slots[s] : null;

export const adsTxtLine = (): string | null =>
  adsScriptEnabled()
    ? `google.com, ${site.ads.adsenseClientId.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0`
    : null;
