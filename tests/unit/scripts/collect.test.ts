import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { collectMonth, fetchMonth } from '../../../scripts/data/collect';
import { collectMonths } from '../../../scripts/data/months';

function xmlResp(resultCode: string, totalCount: number, itemsXml: string): Response {
  const body = `<?xml version="1.0" encoding="UTF-8"?><response><header><resultCode>${resultCode}</resultCode><resultMsg>OK</resultMsg></header><body><items>${itemsXml}</items><totalCount>${totalCount}</totalCount></body></response>`;
  return new Response(body, { status: 200, headers: { 'Content-Type': 'application/xml' } });
}

describe('collectMonths (R-01)', () => {
  it('returns 24 months backwards from previous KST month with 3 recent', () => {
    const res = collectMonths(new Date('2026-11-21T03:00:00Z'));
    expect(res).toHaveLength(24);
    expect(res[0]).toEqual({ ym: '202610', recent: true });
    expect(res[1]).toEqual({ ym: '202609', recent: true });
    expect(res[2]).toEqual({ ym: '202608', recent: true });
    expect(res[3]).toEqual({ ym: '202607', recent: false });
    expect(res[23]).toEqual({ ym: '202411', recent: false });
  });
});

describe('collect script (C-18)', () => {
  let tmp: string;

  beforeEach(() => {
    vi.useFakeTimers();
    tmp = mkdtempSync(join(tmpdir(), 'pd-collect-'));
  });

  afterEach(() => {
    vi.useRealTimers();
    rmSync(tmp, { recursive: true, force: true });
  });

  it('paginates across 2 pages until totalCount is reached', async () => {
    const f = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        xmlResp('000', 2, '<item><aptSeq>A1</aptSeq><dealAmount>10,000</dealAmount></item>'),
      )
      .mockResolvedValueOnce(
        xmlResp('000', 2, '<item><aptSeq>A2</aptSeq><dealAmount>20,000</dealAmount></item>'),
      );

    const p = fetchMonth('11680', '202610', f);
    await vi.runAllTimersAsync();
    const res = await p;

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data).toHaveLength(2);
      expect(res.data.map((d) => d.aptSeq)).toEqual(['A1', 'A2']);
    }
    expect(f).toHaveBeenCalledTimes(2);
  });

  it('normalizes single item object to array', async () => {
    const f = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(xmlResp('00', 1, '<item><aptSeq>ONLY</aptSeq></item>'));

    const p = fetchMonth('11680', '202610', f);
    await vi.runAllTimersAsync();
    const res = await p;

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data).toHaveLength(1);
      expect(res.data[0].aptSeq).toBe('ONLY');
    }
  });

  it('returns COLLECT_API when resultCode is 03', async () => {
    const f = vi.fn<typeof fetch>().mockImplementation(async () => xmlResp('03', 0, ''));
    const p = fetchMonth('11680', '202610', f);
    await vi.runAllTimersAsync();
    const res = await p;

    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe('COLLECT_API');
    expect(f).toHaveBeenCalledTimes(4);
  });

  it('falls back to cache after 3 retries on HTTP 500', async () => {
    const dir = join(tmp, '11680');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, '202610.json'), JSON.stringify([{ aptSeq: 'CACHED' }]));

    const f = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => new Response('err', { status: 500 }));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const p = collectMonth('11680', '202610', true, f, tmp);
    await vi.runAllTimersAsync();
    const res = await p;

    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data[0].aptSeq).toBe('CACHED');
    expect(f).toHaveBeenCalledTimes(4);
    warn.mockRestore();
  });

  it('returns COLLECT_NO_CACHE when retries fail and no cache exists', async () => {
    const f = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => new Response('err', { status: 500 }));

    const p = collectMonth('11680', '202610', true, f, tmp);
    await vi.runAllTimersAsync();
    const res = await p;

    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe('COLLECT_NO_CACHE');
  });

  it('uses cache without calling fetch for non-recent months', async () => {
    const dir = join(tmp, '11680');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, '202501.json'), JSON.stringify([{ aptSeq: 'OLD' }]));

    const f = vi.fn<typeof fetch>();
    const res = await collectMonth('11680', '202501', false, f, tmp);

    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data[0].aptSeq).toBe('OLD');
    expect(f).not.toHaveBeenCalled();
  });
});
