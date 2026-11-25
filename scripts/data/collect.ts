import { XMLParser } from 'fast-xml-parser';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { secrets } from '../../config';
import type { MonthTarget } from './months';

const API_URL = 'https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev';
const DELAYS = [1000, 3000, 9000];
const parser = new XMLParser({ parseTagValue: false, ignoreAttributes: true });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type RawTradeItem = Record<string, string>;
export type CollectResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; context?: Record<string, string> } };

async function fetchPage(
  lawd: string,
  ym: string,
  page: number,
  f: typeof fetch = fetch,
): Promise<CollectResult<{ items: RawTradeItem[]; total: number }>> {
  const q = new URLSearchParams({
    LAWD_CD: lawd,
    DEAL_YMD: ym,
    pageNo: String(page),
    numOfRows: '1000',
  });
  let res: Response;
  try {
    res = await f(`${API_URL}?serviceKey=${secrets.dataGoKrKey}&${q}`);
  } catch (e) {
    return {
      ok: false,
      error: { code: 'COLLECT_HTTP', message: String(e), context: { lawd, ym } },
    };
  }
  if (!res.ok) {
    return {
      ok: false,
      error: { code: 'COLLECT_HTTP', message: `HTTP ${res.status}`, context: { lawd, ym } },
    };
  }
  const x = parser.parse(await res.text())?.response;
  const code = String(x?.header?.resultCode ?? '');
  if (code !== '000' && code !== '00') {
    return {
      ok: false,
      error: {
        code: 'COLLECT_API',
        message: `${code} ${x?.header?.resultMsg ?? ''}`.trim(),
        context: { lawd, ym },
      },
    };
  }
  const raw = x?.body?.items?.item;
  const items: RawTradeItem[] = raw ? (Array.isArray(raw) ? raw : [raw]) : [];
  return { ok: true, data: { items, total: Number(x?.body?.totalCount ?? 0) } };
}

export async function fetchMonth(
  lawd: string,
  ym: string,
  f: typeof fetch = fetch,
): Promise<CollectResult<RawTradeItem[]>> {
  const all: RawTradeItem[] = [];
  for (let page = 1; ; page++) {
    let r: CollectResult<{ items: RawTradeItem[]; total: number }> | null = null;
    for (let i = 0; i <= DELAYS.length; i++) {
      r = await fetchPage(lawd, ym, page, f);
      if (r.ok) break;
      if (i < DELAYS.length) await sleep(DELAYS[i]);
    }
    if (!r || !r.ok) {
      return r ?? { ok: false, error: { code: 'COLLECT_HTTP', message: 'no response' } };
    }
    all.push(...r.data.items);
    await sleep(100);
    if (all.length >= r.data.total || r.data.items.length === 0) {
      return { ok: true, data: all };
    }
  }
}

export async function collectMonth(
  lawd: string,
  ym: string,
  recent: boolean,
  f: typeof fetch = fetch,
  baseDir = 'data/raw',
): Promise<CollectResult<RawTradeItem[]>> {
  const dir = join(baseDir, lawd);
  const file = join(dir, `${ym}.json`);
  if (!recent && existsSync(file)) {
    return { ok: true, data: JSON.parse(readFileSync(file, 'utf8')) as RawTradeItem[] };
  }
  const r = await fetchMonth(lawd, ym, f);
  if (r.ok) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, JSON.stringify(r.data));
    return r;
  }
  if (existsSync(file)) {
    console.warn(`[collect] WARN ${r.error.code}: ${lawd} ${ym} 캐시 사용`);
    return { ok: true, data: JSON.parse(readFileSync(file, 'utf8')) as RawTradeItem[] };
  }
  return {
    ok: false,
    error: { code: 'COLLECT_NO_CACHE', message: r.error.message, context: { lawd, ym } },
  };
}

export async function collectAll(
  codes: string[],
  months: MonthTarget[],
  f: typeof fetch = fetch,
  baseDir = 'data/raw',
): Promise<CollectResult<RawTradeItem[]>> {
  const all: RawTradeItem[] = [];
  for (const lawd of codes) {
    for (const { ym, recent } of months) {
      const r = await collectMonth(lawd, ym, recent, f, baseDir);
      if (!r.ok) return r;
      all.push(...r.data);
      console.log(`[collect] OK ${lawd} ${ym} ${r.data.length}건`);
    }
  }
  return { ok: true, data: all };
}
