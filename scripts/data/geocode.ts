import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { secrets } from '../../config';
import { findContainingSgg, type BoundaryFeature } from './boundary';
import { formatSggDisplayName, getLawdEntry, SIDO_FULL_NAME } from './lawd-codes';

const VWORLD_ADDR_URL = 'https://api.vworld.kr/req/address';
const DELAYS = [1000, 3000, 9000];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type CoordSource = 'parcel' | 'road' | 'dong' | 'sgg';
export type ComplexInput = {
  complexId: string;
  complexName: string;
  lawdCode: string;
  umdName: string;
  jibun: string;
  roadAddr: string | null;
};
export type GeocodedComplex = {
  lat: number;
  lng: number;
  coordSource: CoordSource;
  sggCode: string;
  sggName: string;
};

type CacheEntry = { lat: number; lng: number; source: 'parcel' | 'road' };
type GeocodeCache = Record<string, CacheEntry>;
type SingleResult =
  | { kind: 'ok'; lat: number; lng: number }
  | { kind: 'not_found' }
  | { kind: 'key_error'; message: string };
export type GeocodeResult =
  | { ok: true; data: Map<string, GeocodedComplex> }
  | { ok: false; error: { code: 'GEOCODE_KEY' | 'GEOCODE_HTTP'; message: string } };

async function callAddressApi(
  type: 'parcel' | 'road',
  address: string,
  f: typeof fetch,
): Promise<SingleResult> {
  const q = new URLSearchParams({
    service: 'address',
    request: 'getcoord',
    version: '2.0',
    crs: 'epsg:4326',
    type,
    address,
    refine: 'true',
    simple: 'false',
    format: 'json',
    key: secrets.vworldKey,
  });

  for (let i = 0; i <= DELAYS.length; i++) {
    try {
      const res = await f(`${VWORLD_ADDR_URL}?${q}`);
      if (res.ok) {
        const json = (await res.json()) as {
          response?: {
            status?: string;
            result?: { point?: { x?: string; y?: string } };
            error?: { code?: string; text?: string };
          };
        };
        const status = json?.response?.status;
        if (status === 'OK') {
          const x = Number(json.response?.result?.point?.x);
          const y = Number(json.response?.result?.point?.y);
          return Number.isFinite(x) && Number.isFinite(y)
            ? { kind: 'ok', lat: y, lng: x }
            : { kind: 'not_found' };
        }
        if (status === 'NOT_FOUND') return { kind: 'not_found' };
        const errCode = json?.response?.error?.code ?? '';
        if (errCode === 'INCORRECT_KEY' || errCode === 'UNAVAILABLE_KEY') {
          return { kind: 'key_error', message: `${errCode} ${json.response?.error?.text ?? ''}`.trim() };
        }
      }
    } catch {
      // retryable
    }
    if (i < DELAYS.length) await sleep(DELAYS[i]);
  }
  return { kind: 'not_found' };
}

function buildPrefix(lawdCode: string, boundaryMap: Map<string, BoundaryFeature>): string {
  const sidoFull = SIDO_FULL_NAME[lawdCode.slice(0, 2)] ?? '';
  const sggShort = boundaryMap.get(lawdCode)?.sigKorNm ?? getLawdEntry(lawdCode)?.name ?? '';
  return `${sidoFull} ${sggShort}`.trim();
}

export async function geocodeComplexes(
  complexes: ComplexInput[],
  boundaries: BoundaryFeature[],
  f: typeof fetch = fetch,
  cacheFile = 'data/cache/geocode.json',
): Promise<GeocodeResult> {
  const cache: GeocodeCache = existsSync(cacheFile)
    ? (JSON.parse(readFileSync(cacheFile, 'utf8')) as GeocodeCache)
    : {};
  const boundaryMap = new Map(boundaries.map((b) => [b.code, b]));
  const direct = new Map<string, CacheEntry>();

  for (const c of complexes) {
    const hit = cache[c.complexId];
    if (hit) {
      direct.set(c.complexId, hit);
      continue;
    }
    const prefix = buildPrefix(c.lawdCode, boundaryMap);
    const r1 = await callAddressApi('parcel', `${prefix} ${c.umdName} ${c.jibun}`.trim(), f);
    await sleep(100);
    if (r1.kind === 'key_error') return { ok: false, error: { code: 'GEOCODE_KEY', message: r1.message } };
    if (r1.kind === 'ok') {
      const entry: CacheEntry = { lat: r1.lat, lng: r1.lng, source: 'parcel' };
      direct.set(c.complexId, entry);
      cache[c.complexId] = entry;
      continue;
    }
    if (c.roadAddr) {
      const r2 = await callAddressApi('road', `${prefix} ${c.roadAddr}`.trim(), f);
      await sleep(100);
      if (r2.kind === 'key_error') return { ok: false, error: { code: 'GEOCODE_KEY', message: r2.message } };
      if (r2.kind === 'ok') {
        const entry: CacheEntry = { lat: r2.lat, lng: r2.lng, source: 'road' };
        direct.set(c.complexId, entry);
        cache[c.complexId] = entry;
      }
    }
  }

  mkdirSync(dirname(cacheFile), { recursive: true });
  writeFileSync(cacheFile, JSON.stringify(cache));

  const dongAcc = new Map<string, { lat: number; lng: number; count: number }>();
  for (const c of complexes) {
    const entry = direct.get(c.complexId);
    if (!entry) continue;
    const key = `${c.lawdCode}|${c.umdName}`;
    const cur = dongAcc.get(key) ?? { lat: 0, lng: 0, count: 0 };
    cur.lat += entry.lat;
    cur.lng += entry.lng;
    cur.count += 1;
    dongAcc.set(key, cur);
  }

  const out = new Map<string, GeocodedComplex>();
  const stats = { parcel: 0, road: 0, dong: 0, sgg: 0, excluded: 0 };

  for (const c of complexes) {
    const d = direct.get(c.complexId);
    const dong = !d ? dongAcc.get(`${c.lawdCode}|${c.umdName}`) : undefined;
    const b = !d && !dong ? boundaryMap.get(c.lawdCode) : undefined;
    const resolved: { lat: number; lng: number; source: CoordSource } | null = d
      ? { lat: d.lat, lng: d.lng, source: d.source }
      : dong && dong.count > 0
        ? { lat: dong.lat / dong.count, lng: dong.lng / dong.count, source: 'dong' }
        : b && b.rings.length > 0
          ? { lat: b.centroid.lat, lng: b.centroid.lng, source: 'sgg' }
          : null;

    if (!resolved) {
      stats.excluded += 1;
      continue;
    }
    stats[resolved.source] += 1;
    const hit = findContainingSgg(resolved.lng, resolved.lat, boundaries);
    out.set(c.complexId, {
      lat: resolved.lat,
      lng: resolved.lng,
      coordSource: resolved.source,
      sggCode: hit ? hit.code : c.lawdCode,
      sggName: hit ? hit.name : formatSggDisplayName(c.lawdCode),
    });
  }

  console.log(
    `[geocode] OK parcel ${stats.parcel} road ${stats.road} dong ${stats.dong} sgg ${stats.sgg} 제외 ${stats.excluded}`,
  );
  return { ok: true, data: out };
}
