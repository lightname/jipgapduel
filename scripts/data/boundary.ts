import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { secrets } from '../../config';
import { project } from '../../src/features/map/logic/projection';
import { formatSggDisplayName } from './lawd-codes';

const VWORLD_DATA_URL = 'https://api.vworld.kr/req/data';
const CACHE_TTL_MS = 30 * 86400 * 1000;

export type Ring = [number, number][];

export type BoundaryFeature = {
  code: string;
  sigKorNm: string;
  name: string;
  rings: Ring[];
  centroid: { lat: number; lng: number };
  path: string;
};

export type SggOutput = { code: string; name: string; path: string };

export type BoundaryResult =
  | { ok: true; data: BoundaryFeature[] }
  | { ok: false; error: { code: 'BOUNDARY_FAILED'; message: string } };

export function simplify(pts: [number, number][], tol = 0.002): [number, number][] {
  if (pts.length < 3) return pts;
  const a = pts[0];
  const b = pts[pts.length - 1];
  let idx = 0;
  let max = 0;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const denom = Math.hypot(dx, dy) || 1;

  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const d =
      dx === 0 && dy === 0
        ? Math.hypot(x - a[0], y - a[1])
        : Math.abs(dy * x - dx * y + b[0] * a[1] - b[1] * a[0]) / denom;
    if (d > max) {
      max = d;
      idx = i;
    }
  }
  if (max <= tol) return [a, b];
  return [
    ...simplify(pts.slice(0, idx + 1), tol).slice(0, -1),
    ...simplify(pts.slice(idx), tol),
  ];
}

export function pointInRing(lng: number, lat: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

export function toPath(polygons: Ring[][]): string {
  const parts: string[] = [];
  for (const poly of polygons) {
    const outer = poly[0];
    if (!outer) continue;
    const simp = simplify(outer);
    if (simp.length < 4) continue;
    const coords = simp.map(([lng, lat]) => project(lng, lat));
    const d = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
    parts.push(`${d} Z`);
  }
  return parts.join(' ');
}

function calcCentroid(rings: Ring[]): { lat: number; lng: number } {
  let sumLng = 0;
  let sumLat = 0;
  let count = 0;
  for (const ring of rings) {
    for (const [lng, lat] of ring) {
      sumLng += lng;
      sumLat += lat;
      count += 1;
    }
  }
  return count > 0 ? { lat: sumLat / count, lng: sumLng / count } : { lat: 0, lng: 0 };
}

type RawVworldFeature = {
  properties?: { sig_cd?: string; sig_kor_nm?: string };
  geometry?: { type?: string; coordinates?: unknown };
};

function parseFeature(f: RawVworldFeature): BoundaryFeature | null {
  const code = (f.properties?.sig_cd ?? '').trim();
  const sigKorNm = (f.properties?.sig_kor_nm ?? '').trim();
  if (!code || !f.geometry?.coordinates) return null;
  const polygons: Ring[][] =
    f.geometry.type === 'Polygon'
      ? [f.geometry.coordinates as Ring[]]
      : (f.geometry.coordinates as Ring[][]);
  const rings = polygons.map((p) => p[0]).filter((r): r is Ring => Array.isArray(r) && r.length > 0);
  return {
    code,
    sigKorNm,
    name: formatSggDisplayName(code, sigKorNm),
    rings,
    centroid: calcCentroid(rings),
    path: toPath(polygons),
  };
}

export async function fetchBoundaries(
  f: typeof fetch = fetch,
  cacheFile = 'data/cache/sgg-boundary.json',
): Promise<BoundaryResult> {
  if (existsSync(cacheFile) && Date.now() - statSync(cacheFile).mtimeMs < CACHE_TTL_MS) {
    const cached = JSON.parse(readFileSync(cacheFile, 'utf8')) as BoundaryFeature[];
    return { ok: true, data: cached };
  }

  const all: BoundaryFeature[] = [];
  for (const sido of ['11', '28', '41']) {
    const q = new URLSearchParams({
      service: 'data',
      request: 'GetFeature',
      data: 'LT_C_ADSIGG_INFO',
      attrFilter: `sig_cd:like:${sido}`,
      geometry: 'true',
      crs: 'EPSG:4326',
      size: '1000',
      page: '1',
      format: 'json',
      key: secrets.vworldKey,
    });
    let res: Response;
    try {
      res = await f(`${VWORLD_DATA_URL}?${q}`);
    } catch (e) {
      return { ok: false, error: { code: 'BOUNDARY_FAILED', message: String(e) } };
    }
    if (!res.ok) {
      return { ok: false, error: { code: 'BOUNDARY_FAILED', message: `HTTP ${res.status}` } };
    }
    const json = (await res.json()) as {
      response?: { status?: string; result?: { featureCollection?: { features?: RawVworldFeature[] } } };
    };
    if (json?.response?.status !== 'OK') {
      return {
        ok: false,
        error: { code: 'BOUNDARY_FAILED', message: `status=${json?.response?.status ?? 'UNKNOWN'}` },
      };
    }
    const features = json.response.result?.featureCollection?.features ?? [];
    for (const feat of features) {
      const parsed = parseFeature(feat);
      if (parsed) all.push(parsed);
    }
  }

  all.sort((a, b) => a.code.localeCompare(b.code));
  mkdirSync(dirname(cacheFile), { recursive: true });
  writeFileSync(cacheFile, JSON.stringify(all));
  return { ok: true, data: all };
}

export function findContainingSgg(
  lng: number,
  lat: number,
  boundaries: BoundaryFeature[],
): BoundaryFeature | null {
  for (const b of boundaries) {
    if (b.rings.some((ring) => pointInRing(lng, lat, ring))) return b;
  }
  return null;
}

export function toSggList(boundaries: BoundaryFeature[]): SggOutput[] {
  return [...boundaries]
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((b) => ({ code: b.code, name: b.name, path: b.path }));
}
