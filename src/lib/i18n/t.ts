import ko from '@/messages/ko.json';

type Messages = typeof ko;
type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

export type MessageKey = Leaves<Messages>;
export type Locale = 'ko';

const DICT: Record<Locale, Messages> = { ko };

export function t(
  key: MessageKey,
  vars?: Record<string, string | number>,
  locale: Locale = 'ko',
): string {
  const raw = key
    .split('.')
    .reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], DICT[locale]);
  if (typeof raw !== 'string') throw new Error(`missing message: ${key}`);
  return raw.replace(/\{(\w+)\}/g, (_, n: string) =>
    vars && n in vars ? String(vars[n]) : `{${n}}`,
  );
}
