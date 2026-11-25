import type { RawTradeItem } from './collect';

export type NormalizedTrade = {
  id: string;
  complexId: string;
  complexName: string;
  lawdCode: string;
  umdName: string;
  jibun: string;
  roadAddr: string | null;
  buildYear: number;
  areaM2: number;
  floor: number;
  dealDate: string;
  dealYm: string;
  price: number;
  dealingGbn: string;
  cancelled: boolean;
  buyerGbn: string;
  slerGbn: string;
  landLeasehold: boolean;
};

const pad2 = (v: string | number) => String(v).trim().padStart(2, '0');

export function normalizeItem(raw: RawTradeItem): NormalizedTrade | null {
  const complexId = (raw.aptSeq ?? '').trim();
  if (!complexId) return null;

  const dealYear = (raw.dealYear ?? '').trim();
  const dealMonth = pad2(raw.dealMonth ?? '');
  const dealDay = pad2(raw.dealDay ?? '');
  const dealYm = `${dealYear}-${dealMonth}`;
  const dealDate = `${dealYm}-${dealDay}`;

  const floor = Number((raw.floor ?? '').trim());
  const areaM2 = Number((raw.excluUseAr ?? '').trim());
  const price = Number((raw.dealAmount ?? '').trim().replaceAll(',', ''));
  const buildYear = Number((raw.buildYear ?? '').trim());

  const roadNm = (raw.roadNm ?? '').trim();
  const bonbun = Number((raw.roadNmBonbun ?? '').trim() || '0');
  const bubun = Number((raw.roadNmBubun ?? '').trim() || '0');
  const roadAddr = roadNm ? `${roadNm} ${bonbun}${bubun > 0 ? `-${bubun}` : ''}` : null;

  const yyyymmdd = `${dealYear}${dealMonth}${dealDay}`;
  const id = `${complexId}-${yyyymmdd}-${floor}-${areaM2}-${price}`;

  return {
    id,
    complexId,
    complexName: (raw.aptNm ?? '').trim(),
    lawdCode: (raw.sggCd ?? '').trim(),
    umdName: (raw.umdNm ?? '').trim(),
    jibun: (raw.jibun ?? '').trim(),
    roadAddr,
    buildYear,
    areaM2,
    floor,
    dealDate,
    dealYm,
    price,
    dealingGbn: (raw.dealingGbn ?? '').trim(),
    cancelled: Boolean((raw.cdealType ?? '').trim() || (raw.cdealDay ?? '').trim()),
    buyerGbn: (raw.buyerGbn ?? '').trim(),
    slerGbn: (raw.slerGbn ?? '').trim(),
    landLeasehold: (raw.landLeaseholdGbn ?? '').trim() === 'Y',
  };
}

export function normalizeTrades(items: RawTradeItem[]): NormalizedTrade[] {
  const seen = new Set<string>();
  const out: NormalizedTrade[] = [];
  for (const raw of items) {
    const trade = normalizeItem(raw);
    if (!trade || seen.has(trade.id)) continue;
    seen.add(trade.id);
    out.push(trade);
  }
  return out;
}
