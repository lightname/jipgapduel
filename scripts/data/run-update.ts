import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { project } from '../../src/features/map/logic/projection';
import { fetchBoundaries, toSggList, type SggOutput } from './boundary';
import { buildPool, type EnrichedTrade } from './build-pool';
import { collectAll, type RawTradeItem } from './collect';
import { filterTrades } from './filter';
import { geocodeComplexes, type ComplexInput, type GeocodedComplex } from './geocode';
import { BASE_LAWD_CODES, formatSggDisplayName } from './lawd-codes';
import { collectMonths } from './months';
import { normalizeTrades } from './normalize';
import { buildStats } from './stats';
import { verifyAndWrite } from './verify-pool';

type ExecFn = (cmd: string, args: string[]) => string;
const defaultExec: ExecFn = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8' }).trim();

export function kstPoolVersion(now: Date = new Date()): string {
  const k = new Date(now.getTime() + 9 * 3600 * 1000).toISOString();
  return `${k.slice(0, 4)}${k.slice(5, 7)}${k.slice(8, 10)}-${k.slice(11, 13)}${k.slice(14, 16)}`;
}

export function checkMainBranch(execFn: ExecFn = defaultExec): { ok: true } | { ok: false; error: { code: 'BRANCH_NOT_MAIN'; message: string } } {
  const branch = execFn('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  if (branch !== 'main') {
    return { ok: false, error: { code: 'BRANCH_NOT_MAIN', message: `current branch is ${branch}` } };
  }
  return { ok: true };
}

export function commitAndPush(poolVersion: string, execFn: ExecFn = defaultExec): { ok: true } | { ok: false; error: { code: 'BRANCH_NOT_MAIN' | 'GIT_FAILED'; message: string } } {
  const br = checkMainBranch(execFn);
  if (!br.ok) return br;
  try {
    execFn('git', ['add', 'public/data/pool.json', 'src/generated/stats.json']);
    execFn('git', ['commit', '-m', `data: pool ${poolVersion}`]);
    execFn('git', ['push']);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: { code: 'GIT_FAILED', message: String(e) } };
  }
}

type SampleSgg = { code: string; name: string; lat: number; lng: number };

function sampleSquarePath(lng: number, lat: number): string {
  const d = 0.03;
  const pts = [
    project(lng - d, lat - d),
    project(lng + d, lat - d),
    project(lng + d, lat + d),
    project(lng - d, lat + d),
  ];
  return `${pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')} Z`;
}

export async function runUpdate(opts: { sample: boolean }): Promise<void> {
  const now = new Date();
  const poolVersion = kstPoolVersion(now);
  const generatedAt = now.toISOString();
  let rawItems: RawTradeItem[];
  let sggList: SggOutput[];
  let geoMap: Map<string, GeocodedComplex>;

  if (opts.sample) {
    const fixture = JSON.parse(readFileSync('tests/fixtures/rtms-005-202610.json', 'utf8')) as {
      items: RawTradeItem[];
    };
    rawItems = fixture.items;
    console.log(`[sample] OK ${rawItems.length}건`);

    const sampleSggs = JSON.parse(readFileSync('tests/fixtures/sample-sgg.json', 'utf8')) as SampleSgg[];
    const sampleMap = new Map(sampleSggs.map((s) => [s.code, s]));
    sggList = sampleSggs
      .map((s) => ({ code: s.code, name: s.name, path: sampleSquarePath(s.lng, s.lat) }))
      .sort((a, b) => a.code.localeCompare(b.code));

    const norm = normalizeTrades(rawItems);
    const filtered = filterTrades(norm, { sample: true, fetchedCount: rawItems.length });
    console.log(`[filter] OK ${filtered.trades.length}건`);

    geoMap = new Map();
    for (const t of filtered.trades) {
      if (geoMap.has(t.complexId)) continue;
      const s = sampleMap.get(t.lawdCode);
      if (!s) continue;
      geoMap.set(t.complexId, {
        lat: s.lat,
        lng: s.lng,
        coordSource: 'sgg',
        sggCode: s.code,
        sggName: s.name,
      });
    }

    const enriched: EnrichedTrade[] = filtered.trades
      .filter((t) => geoMap.has(t.complexId))
      .map((t) => {
        const g = geoMap.get(t.complexId)!;
        return { ...t, sggCode: g.sggCode, sggName: g.sggName };
      });
    const yms = enriched.map((t) => t.dealYm).sort();
    const period = { from: yms[0] ?? '2026-10', to: yms[yms.length - 1] ?? '2026-10' };
    const pool = buildPool({ trades: enriched, geoMap, sgg: sggList, poolVersion, generatedAt, period, sample: true });
    const stats = buildStats({ allFilteredTrades: enriched, filterCounts: filtered.counts, pool });
    const v = verifyAndWrite({ pool, stats, sample: true });
    if (!v.ok) process.exit(1);
    return;
  }

  const bnd = await fetchBoundaries();
  if (!bnd.ok) {
    console.error(`[boundary] FAIL ${bnd.error.code}: ${bnd.error.message}`);
    process.exit(1);
  }
  sggList = toSggList(bnd.data);
  const codeSet = new Set([...BASE_LAWD_CODES.map((c) => c.code), ...bnd.data.map((b) => b.code)]);
  const months = collectMonths(now);
  const collected = await collectAll([...codeSet].sort(), months);
  if (!collected.ok) {
    console.error(`[collect] FAIL ${collected.error.code}: ${collected.error.message}`);
    process.exit(1);
  }
  const norm = normalizeTrades(collected.data);
  const filtered = filterTrades(norm, { fetchedCount: collected.data.length });
  console.log(`[filter] OK ${filtered.trades.length}건`);

  const complexMap = new Map<string, ComplexInput>();
  for (const t of filtered.trades) {
    if (!complexMap.has(t.complexId)) {
      complexMap.set(t.complexId, {
        complexId: t.complexId,
        complexName: t.complexName,
        lawdCode: t.lawdCode,
        umdName: t.umdName,
        jibun: t.jibun,
        roadAddr: t.roadAddr,
      });
    }
  }
  const geo = await geocodeComplexes([...complexMap.values()], bnd.data);
  if (!geo.ok) {
    console.error(`[geocode] FAIL ${geo.error.code}: ${geo.error.message}`);
    process.exit(1);
  }
  geoMap = geo.data;
  const enriched: EnrichedTrade[] = filtered.trades
    .filter((t) => geoMap.has(t.complexId))
    .map((t) => {
      const g = geoMap.get(t.complexId)!;
      return { ...t, sggCode: g.sggCode, sggName: g.sggName || formatSggDisplayName(g.sggCode) };
    });

  const filteredSggCount = new Set(enriched.map((t) => t.sggCode)).size;
  const yms = enriched.map((t) => t.dealYm).sort();
  const period = { from: yms[0] ?? '', to: yms[yms.length - 1] ?? '' };
  const pool = buildPool({ trades: enriched, geoMap, sgg: sggList, poolVersion, generatedAt, period });
  const stats = buildStats({ allFilteredTrades: enriched, filterCounts: filtered.counts, pool });
  const v = verifyAndWrite({ pool, stats, filteredSggCount });
  if (!v.ok) process.exit(1);

  try {
    defaultExec('npm', ['run', 'verify']);
  } catch (e) {
    console.error(`[verify] FAIL VERIFY_FAILED: ${String(e)}`);
    process.exit(1);
  }
  const pub = commitAndPush(poolVersion);
  if (!pub.ok) {
    console.error(`[git] FAIL ${pub.error.code}: ${pub.error.message}`);
    process.exit(1);
  }
  console.log(`[update] OK ${poolVersion}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runUpdate({ sample: process.argv.includes('--sample') }).catch((e) => {
    console.error(`[update] FAIL: ${String(e)}`);
    process.exit(1);
  });
}
