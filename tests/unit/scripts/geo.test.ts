import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { project } from '@/features/map/logic/projection';
import {
  fetchBoundaries,
  findContainingSgg,
  pointInRing,
  simplify,
  toPath,
  type BoundaryFeature,
} from '../../../scripts/data/boundary';
import { geocodeComplexes } from '../../../scripts/data/geocode';

describe('projection & boundary (C-20)', () => {
  it('projects origin (126.0, 38.3) to [0, 0]', () => {
    expect(project(126.0, 38.3)).toEqual([0, 0]);
  });

  it('simplifies collinear points', () => {
    const pts: [number, number][] = [
      [127.0, 37.5],
      [127.05, 37.5],
      [127.1, 37.5],
    ];
    expect(simplify(pts, 0.002)).toEqual([
      [127.0, 37.5],
      [127.1, 37.5],
    ]);
  });

  it('checks pointInRing inside, outside, and near boundary', () => {
    const square: [number, number][] = [
      [127.0, 37.5],
      [127.1, 37.5],
      [127.1, 37.6],
      [127.0, 37.6],
      [127.0, 37.5],
    ];
    expect(pointInRing(127.05, 37.55, square)).toBe(true);
    expect(pointInRing(127.2, 37.55, square)).toBe(false);
    expect(pointInRing(127.0001, 37.5001, square)).toBe(true);
    expect(pointInRing(126.9999, 37.55, square)).toBe(false);
  });

  it('builds SVG path and fetches boundaries with cache', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'pd-bnd-'));
    try {
      const square: [number, number][] = [
        [127.0, 37.5],
        [127.1, 37.5],
        [127.1, 37.6],
        [127.0, 37.6],
        [127.0, 37.5],
      ];
      expect(toPath([[square]])).toMatch(/^M .* Z$/);

      const f = vi.fn<typeof fetch>().mockImplementation(async (input) => {
        const url = String(input);
        const code = url.includes('like%3A11') ? '11680' : url.includes('like%3A28') ? '28110' : '41111';
        const nm = code === '11680' ? '강남구' : code === '28110' ? '중구' : '수원시 장안구';
        return new Response(
          JSON.stringify({
            response: {
              status: 'OK',
              result: {
                featureCollection: {
                  features: [
                    {
                      properties: { sig_cd: code, sig_kor_nm: nm },
                      geometry: { type: 'MultiPolygon', coordinates: [[square]] },
                    },
                  ],
                },
              },
            },
          }),
          { status: 200 },
        );
      });

      const cacheFile = join(tmp, 'sgg.json');
      const r = await fetchBoundaries(f, cacheFile);
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.data.map((d) => d.code)).toEqual(['11680', '28110', '41111']);
        expect(r.data[0].name).toBe('서울 강남구');
        expect(findContainingSgg(127.05, 37.55, r.data)?.code).toBe('11680');
      }
      expect(f).toHaveBeenCalledTimes(3);

      const r2 = await fetchBoundaries(f, cacheFile);
      expect(r2.ok).toBe(true);
      expect(f).toHaveBeenCalledTimes(3);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe('geocodeComplexes (C-20)', () => {
  let tmp: string;
  const square: [number, number][] = [
    [127.0, 37.5],
    [127.1, 37.5],
    [127.1, 37.6],
    [127.0, 37.6],
    [127.0, 37.5],
  ];
  const boundaries: BoundaryFeature[] = [
    {
      code: '11680',
      sigKorNm: '강남구',
      name: '서울 강남구',
      rings: [square],
      centroid: { lat: 37.55, lng: 127.05 },
      path: toPath([[square]]),
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
    tmp = mkdtempSync(join(tmpdir(), 'pd-geo-'));
  });

  afterEach(() => {
    vi.useRealTimers();
    rmSync(tmp, { recursive: true, force: true });
  });

  it('falls back from parcel NOT_FOUND to road and computes dong average', async () => {
    const f = vi
      .fn<typeof fetch>()
      // C1 parcel OK
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ response: { status: 'OK', result: { point: { x: '127.02', y: '37.52' } } } })),
      )
      // C2 parcel NOT_FOUND -> road OK
      .mockResolvedValueOnce(new Response(JSON.stringify({ response: { status: 'NOT_FOUND' } })))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ response: { status: 'OK', result: { point: { x: '127.06', y: '37.56' } } } })),
      )
      // C3 parcel NOT_FOUND (no roadAddr) -> dong average of C1 & C2 = (127.04, 37.54)
      .mockResolvedValueOnce(new Response(JSON.stringify({ response: { status: 'NOT_FOUND' } })));

    const p = geocodeComplexes(
      [
        { complexId: 'C1', complexName: 'A', lawdCode: '11680', umdName: '삼성동', jibun: '1', roadAddr: '길 1' },
        { complexId: 'C2', complexName: 'B', lawdCode: '11680', umdName: '삼성동', jibun: '2', roadAddr: '길 2' },
        { complexId: 'C3', complexName: 'C', lawdCode: '11680', umdName: '삼성동', jibun: '3', roadAddr: null },
      ],
      boundaries,
      f,
      join(tmp, 'geo.json'),
    );
    await vi.runAllTimersAsync();
    const res = await p;

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.get('C1')?.coordSource).toBe('parcel');
      expect(res.data.get('C2')?.coordSource).toBe('road');
      const c3 = res.data.get('C3');
      expect(c3?.coordSource).toBe('dong');
      expect(c3?.lat).toBeCloseTo(37.54, 5);
      expect(c3?.lng).toBeCloseTo(127.04, 5);
    }
    expect(f).toHaveBeenCalledTimes(4);
  });

  it('aborts with GEOCODE_KEY on INCORRECT_KEY', async () => {
    const f = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(JSON.stringify({ response: { status: 'ERROR', error: { code: 'INCORRECT_KEY', text: 'bad' } } })),
    );

    const p = geocodeComplexes(
      [{ complexId: 'C1', complexName: 'A', lawdCode: '11680', umdName: '삼성동', jibun: '1', roadAddr: null }],
      boundaries,
      f,
      join(tmp, 'geo.json'),
    );
    await vi.runAllTimersAsync();
    const res = await p;

    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe('GEOCODE_KEY');
  });

  it('skips fetch when cache hits', async () => {
    const cacheFile = join(tmp, 'geo.json');
    writeFileSync(cacheFile, JSON.stringify({ C1: { lat: 37.55, lng: 127.05, source: 'parcel' } }));

    const f = vi.fn<typeof fetch>();
    const res = await geocodeComplexes(
      [{ complexId: 'C1', complexName: 'A', lawdCode: '11680', umdName: '삼성동', jibun: '1', roadAddr: null }],
      boundaries,
      f,
      cacheFile,
    );

    expect(res.ok).toBe(true);
    expect(f).not.toHaveBeenCalled();
  });
});
