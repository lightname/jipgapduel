import { site } from '@config';

export type PageKind =
  | 'landing'
  | 'game'
  | 'guide'
  | 'complexDetail'
  | 'localized'
  | 'legal'
  | 'notFound';

export interface PageInput {
  kind: PageKind;
  reviewed?: boolean;
  hasBody?: boolean;
  uniqueItems?: { trades: number; months: number; coordOk: boolean };
  hasQuery?: boolean;
  isEmptyResult?: boolean;
  isFilterCombo?: boolean;
  isInternalSearch?: boolean;
}

const MIN_LEVEL: Record<PageKind, number | null> = {
  landing: 1,
  game: 1,
  guide: 2,
  complexDetail: 3,
  localized: 4,
  legal: null,
  notFound: null,
};

export function assertLevel(l: number): asserts l is 1 | 2 | 3 | 4 {
  if (![1, 2, 3, 4].includes(l)) throw new Error(`site.indexLevel must be 1-4, got ${l}`);
}

export function isIndexable(p: PageInput, level: number = site.indexLevel): boolean {
  assertLevel(level);
  const min = MIN_LEVEL[p.kind];
  if (min === null || level < min) return false;
  if (p.hasQuery || p.isEmptyResult || p.isFilterCombo || p.isInternalSearch) return false;
  if ((p.kind === 'guide' || p.kind === 'localized') && (!p.hasBody || !p.reviewed)) return false;
  if (p.kind === 'complexDetail') {
    const u = p.uniqueItems;
    if (!u || u.trades < 5 || u.months < 3 || !u.coordOk) return false;
  }
  return true;
}
