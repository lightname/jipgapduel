<!-- CORE.md -->
# CORE

판정 기준: "이 문장만 읽은 서로 다른 두 개발자가 다른 코드를 쓸 수 있으면 코드로, 아니면 텍스트로 쓴다"
규칙 값(R-xx)은 SPEC.md 데이터 규칙에만 있다. 코드는 `src/features/game/logic/rules.ts`(클라이언트 R-08·R-10·R-11)와 `scripts/data/rules.ts`(R-01~R-13 나머지)의 상수로 참조한다.

### C-01 config.ts 형태
- 쓰는 곳: T-01, 전 티켓
- 파일 위치: `config.ts`(저장소 루트), tsconfig paths `"@config": ["./config.ts"]`
- 형식: 코드
- 내용:
```ts
export const site = {
  name: '집값대결',
  SITE_URL: 'https://price-duel.pages.dev',
  indexLevel: 1 as 1 | 2 | 3 | 4,
  launchDate: '2026-12-01',          // 데일리 #1 날짜(KST, YYYY-MM-DD)
  ga4Id: '',                         // 'G-XXXX'
  searchConsoleVerification: '',
  naverSiteVerification: '',
  contactEmail: '',
  privacyEffectiveDate: '2026-12-01',
  ads: { enabled: false, adsenseClientId: '', slots: { resultBottom: '', landingBottom: '' } },
} as const;
export const secrets = { dataGoKrKey: '', vworldKey: '' } as const; // scripts/ 전용
```
- 지키지 않으면 생기는 문제: 키가 정적 번들에 포함되어 공개된다

### C-02 메시지 조회 t()
- 쓰는 곳: 전 화면
- 파일 위치: `src/lib/i18n/t.ts`
- 형식: 코드
- 내용:
```ts
import ko from '@/messages/ko.json';
type Messages = typeof ko;
type Leaves<T, P extends string = ''> = { [K in keyof T & string]: T[K] extends string
  ? `${P}${K}` : Leaves<T[K], `${P}${K}.`> }[keyof T & string];
export type MessageKey = Leaves<Messages>;
export type Locale = 'ko';
const DICT: Record<Locale, Messages> = { ko };
export function t(key: MessageKey, vars?: Record<string, string | number>, locale: Locale = 'ko'): string {
  const raw = key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], DICT[locale]);
  if (typeof raw !== 'string') throw new Error(`missing message: ${key}`);
  return raw.replace(/\{(\w+)\}/g, (_, n: string) => (vars && n in vars ? String(vars[n]) : `{${n}}`));
}
```
- 지키지 않으면 생기는 문제: 하드코딩 문구가 남아 언어 추가 시 누락된다

### C-03 표기 형식 함수
- 쓰는 곳: S-01~S-06, share
- 파일 위치: `src/lib/format/index.ts`
- 형식: 코드
- 내용:
```ts
const n = (v: number) => v.toLocaleString('ko-KR');
export function formatPrice(manwon: number, _l: 'ko' = 'ko'): string {
  const eok = Math.floor(manwon / 10000), rest = manwon % 10000;
  if (eok === 0) return `${n(rest)}만원`;
  return rest === 0 ? `${eok}억원` : `${eok}억 ${n(rest)}만원`;
}
export function diffPct(a: number, b: number): number { return (Math.max(a, b) - Math.min(a, b)) / Math.min(a, b); }
export function formatDiff(a: number, b: number): string {           // "+2억 1,500만원 (17.4%)"
  return `+${formatPrice(Math.abs(a - b))} (${(diffPct(a, b) * 100).toFixed(1)}%)`;
}
export function formatArea(m2: number): string {                      // "전용 84.97㎡ (25.7평)"
  return `전용 ${Number(m2.toFixed(2))}㎡ (${(m2 / 3.3058).toFixed(1)}평)`;
}
export function formatYm(ym: string): string { const [y, m] = ym.split('-'); return `${y}년 ${Number(m)}월`; }
export function formatDateKo(d: string): string { const [y, m, dd] = d.split('-'); return `${y}년 ${Number(m)}월 ${Number(dd)}일`; }
export function formatDotDate(d: string): string { return d.replaceAll('-', '.'); }
export function formatCount(v: number): string { return n(v); }
```
- 지키지 않으면 생기는 문제: 화면마다 가격·면적 표기가 달라진다

### C-04 이미지 매니페스트와 Img
- 쓰는 곳: 이미지를 쓰는 모든 화면
- 파일 위치: `src/lib/images.ts`, `src/components/Img.tsx`
- 형식: 코드
- 내용:
```ts
// src/lib/images.ts
import manifest from '../../public/images/manifest.json';
export type ImageId = `IMG-${string}`;
export type ImageEntry = { id: string; file: string; width: number; height: number; alt: string; status: 'placeholder' | 'final' };
export function getImage(id: ImageId): ImageEntry {
  const e = (manifest as ImageEntry[]).find((m) => m.id === id);
  if (!e) throw new Error(`unknown image ${id}`);
  return e;
}
// src/components/Img.tsx: props { id: ImageId; className?: string; priority?: boolean }
// next/image <Image src={e.file} width={e.width} height={e.height} alt={e.alt} priority={priority} className={className} />
// next.config: images.unoptimized = true. 표시 크기는 className(DESIGN §4 px)으로만 정한다
```
- 지키지 않으면 생기는 문제: 경로 하드코딩으로 최종 이미지 교체 시 누락·CLS 발생

### C-05 플레이스홀더 생성
- 쓰는 곳: T-01
- 파일 위치: `scripts/gen-placeholders.ts`, 실행 `npm run gen:placeholders`
- 형식: 코드
- 내용:
```ts
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
type E = { id: string; file: string; width: number; height: number; status: string };
const list = JSON.parse(readFileSync('public/images/manifest.json', 'utf8')) as E[];
for (const e of list) {
  if (e.status === 'final') continue;
  const out = join('public', e.file);
  if (existsSync(out) && e.status !== 'placeholder') continue;
  mkdirSync(dirname(out), { recursive: true });
  const fs = Math.max(10, Math.round(Math.min(e.width, e.height) / 8));
  writeFileSync(out, `<svg xmlns="http://www.w3.org/2000/svg" width="${e.width}" height="${e.height}" viewBox="0 0 ${e.width} ${e.height}">` +
    `<rect width="100%" height="100%" fill="#E2E0DA"/>` +
    `<text x="50%" y="46%" text-anchor="middle" font-family="sans-serif" font-size="${fs}" fill="#5B5F6A">${e.id}</text>` +
    `<text x="50%" y="${46 + 14}%" text-anchor="middle" font-family="sans-serif" font-size="${Math.round(fs * 0.6)}" fill="#5B5F6A">${e.width}×${e.height}</text></svg>`);
  console.log(`[placeholder] OK ${e.file}`);
}
```
- 지키지 않으면 생기는 문제: 경로·비율이 다른 임시 이미지로 레이아웃 QA가 무의미해진다

### C-06 색인 대상 판정 함수
- 쓰는 곳: C-07, C-08, 전 페이지
- 파일 위치: `src/lib/seo/index-policy.ts`
- 형식: 코드
- 내용:
```ts
import { site } from '@config';
export type PageKind = 'landing' | 'game' | 'guide' | 'complexDetail' | 'localized' | 'legal' | 'notFound';
export interface PageInput {
  kind: PageKind; reviewed?: boolean; hasBody?: boolean;
  uniqueItems?: { trades: number; months: number; coordOk: boolean };
  hasQuery?: boolean; isEmptyResult?: boolean; isFilterCombo?: boolean; isInternalSearch?: boolean;
}
const MIN_LEVEL: Record<PageKind, number | null> = {
  landing: 1, game: 1, guide: 2, complexDetail: 3, localized: 4, legal: null, notFound: null };
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
```
- 지키지 않으면 생기는 문제: robots 메타와 sitemap이 서로 다른 판정을 해 미검수 페이지가 색인된다

### C-07 SEO 메타 생성
- 쓰는 곳: 모든 page.tsx의 `generateMetadata`/`metadata`
- 파일 위치: `src/lib/seo/build-metadata.ts`, `src/components/JsonLd.tsx`
- 형식: 코드
- 내용:
```ts
import type { Metadata } from 'next';
import { site } from '@config';
import { isIndexable, type PageInput } from './index-policy';
export function buildMetadata(o: { path: string; title: string; description: string; og: string; page: PageInput }): Metadata {
  const url = `${site.SITE_URL}${o.path === '/' ? '' : o.path}` || site.SITE_URL;
  const index = isIndexable(o.page);
  return {
    metadataBase: new URL(site.SITE_URL), title: o.title, description: o.description,
    alternates: { canonical: url, ...(index ? { languages: { ko: url, 'x-default': url } } : {}) },
    robots: { index, follow: true },
    openGraph: { type: 'website', url, title: o.title, description: o.description, siteName: site.name, locale: 'ko_KR',
      images: [{ url: `/og/${o.og}.png`, width: 1200, height: 630, alt: o.title }] },
    twitter: { card: 'summary_large_image', title: o.title, description: o.description, images: [`/og/${o.og}.png`] },
  };
}
// og 값: 'S-01' | 'S-02' | 'S-03' | `guide-${slug}`. S-07·S-08은 'S-01'
// JsonLd: <script type="application/ld+json">{JSON.stringify(data)}</script>, page.tsx 본문 최상단에 둔다
// S-01 {"@type":"WebSite",name,url} / S-02·S-03 {"@type":"WebApplication",name,url,applicationCategory:"GameApplication",
//   operatingSystem:"Web",offers:{"@type":"Offer",price:0,priceCurrency:"KRW"}} / S-06 Article{headline,dateModified:updatedAt,
//   author:{"@type":"Organization",name:site.name}} + BreadcrumbList[홈, 글] / CT-02만 Dataset{name,description,temporalCoverage:"{from}/{to}",
//   creator:{"@type":"Organization",name:"국토교통부"}}
```
- 지키지 않으면 생기는 문제: canonical·hreflang·OG가 페이지마다 다르게 출력된다

### C-08 sitemap·robots
- 쓰는 곳: T-01
- 파일 위치: `src/lib/seo/pages.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`
- 형식: 코드
- 내용:
```ts
// src/lib/seo/pages.ts
import { listGuides } from '@/lib/content/load';
import { loadStats } from '@/lib/stats';
import type { PageInput } from './index-policy';
export type PageEntry = { path: string; page: PageInput; lastModified: string };
export function allPages(): PageEntry[] {
  const gen = loadStats()?.generatedAt ?? new Date().toISOString();
  return [
    { path: '/', page: { kind: 'landing' }, lastModified: gen },
    { path: '/daily', page: { kind: 'game' }, lastModified: gen },
    { path: '/infinite', page: { kind: 'game' }, lastModified: gen },
    ...listGuides().map((g) => ({ path: `/guide/${g.slug}`, lastModified: g.updatedAt,
      page: { kind: 'guide' as const, reviewed: g.reviewed, hasBody: g.hasBody } })),
    { path: '/privacy', page: { kind: 'legal' }, lastModified: gen },
  ];
}
// src/app/sitemap.ts: export const dynamic = 'force-static';
// allPages().filter(e => isIndexable(e.page)).map(e => ({ url: SITE_URL+path(루트는 SITE_URL), lastModified: e.lastModified,
//   alternates: { languages: { ko: url, 'x-default': url } } }))
// src/app/robots.ts: export const dynamic = 'force-static'; rules [{ userAgent:'*', allow:'/', disallow:'/data/' }], sitemap
```
- 지키지 않으면 생기는 문제: noindex 페이지가 sitemap에 들어가 서치 콘솔 오류가 생긴다

### C-09 콘텐츠 로더
- 쓰는 곳: T-01(sitemap·푸터 링크), T-13, T-14
- 파일 위치: `src/lib/content/load.ts`
- 형식: 코드
- 내용:
```ts
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
export type Guide = { slug: string; title: string; description: string; reviewed: boolean; updatedAt: string; body: string; hasBody: boolean };
const DIR = join(process.cwd(), 'content/ko/guide');
const TOKEN_LINE = /^\{\{(table|meta|cta):[A-Za-z]+\}\}$/;
export function parseGuide(slug: string, raw: string): Guide {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`frontmatter missing: ${slug}`);
  const meta = Object.fromEntries(m[1].split('\n').map((l) => { const i = l.indexOf(':'); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
  for (const k of ['title', 'description', 'reviewed', 'updatedAt']) if (!meta[k]) throw new Error(`${slug}: ${k} missing`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.updatedAt)) throw new Error(`${slug}: updatedAt format`);
  const body = m[2];
  const prose = body.split('\n').filter((l) => !TOKEN_LINE.test(l.trim())).join('').trim();
  return { slug, title: meta.title, description: meta.description, reviewed: meta.reviewed === 'true',
    updatedAt: meta.updatedAt, body, hasBody: prose.length > 0 };
}
export function listGuides(): Guide[] {
  if (!existsSync(DIR)) return [];
  return readdirSync(DIR).filter((f) => f.endsWith('.md')).sort()
    .map((f) => parseGuide(f.slice(0, -3), readFileSync(join(DIR, f), 'utf8')));
}
export function getGuide(slug: string): Guide | null { return listGuides().find((g) => g.slug === slug) ?? null; }
export function isGuideLinkable(slug: string): boolean { const g = getGuide(slug); return !!g && g.reviewed && g.hasBody; }
```
- 지키지 않으면 생기는 문제: 미검수·빈 글이 링크·색인된다

### C-10 가이드 토큰 렌더
- 쓰는 곳: T-14
- 파일 위치: `src/features/guide/logic/tokens.ts`, `src/features/guide/view/GuideBody.tsx`
- 형식: 텍스트
- 내용:
  1. 허용 토큰: `table:filterFunnel|pairBands|bySgg|byArea|byAge`, `meta:period|generatedAt`, `cta:primary|secondary`. 그 외 `{{...}}`가 본문에 있으면 throw(빌드 실패)
  2. `splitBody(body)`: 줄 단위로 토큰 줄(앞뒤 공백 제거 후 전체가 토큰)과 텍스트 덩어리를 순서대로 배열 `[{type:'md',text}|{type:'token',kind,name}]`로 반환. 줄 중간의 토큰도 throw
  3. md 덩어리는 `marked.parse(text, { async: false })` 결과를 `dangerouslySetInnerHTML`로 출력(빌드 시 서버 컴포넌트)
  4. `meta:period` → `formatYm(from) ~ formatYm(to)`, `meta:generatedAt` → `YYYY-MM-DD`(generatedAt 앞 10자)
  5. 표 열(메시지 키 `table.*`): filterFunnel = 단계 | 남은 거래 | 제외된 거래(직전 단계 − 현재). 단계 순서 fetched, afterCancel, afterDirect, afterNonIndividual, afterLeasehold, afterOutlier, poolTrades / pairBands = 난이도 | 가격 차이 범위(`{min×100}% 이상 {max×100}% 미만`, easy는 `30% 이상`) | 문제 쌍 수 / bySgg = 시군구 | 중간 가격 | 거래 수 / byArea = 전용면적 | 중간 가격 | 거래 수 / byAge = 연식(거래 시점) | 중간 가격 | 거래 수
  6. 가격은 `formatPrice`, 건수는 `formatCount`
  7. stats가 null이면 throw(빌드 실패)
- 지키지 않으면 생기는 문제: 표 형식·위치가 글마다 달라지고 오타 토큰이 그대로 노출된다

### C-11 측정 전송 함수
- 쓰는 곳: 이벤트를 보내는 모든 화면
- 파일 위치: `src/lib/analytics/track.ts`
- 형식: 코드
- 내용:
```ts
import { site } from '@config';
type Mode = 'daily' | 'infinite';
export type EventMap = {
  cta_click: { screen: 'S-01' | 'S-04' | 'S-05' | 'S-06' | 'S-08'; cta: 'primary' | 'secondary'; label_key: string };
  game_start: { mode: Mode };
  answer: { mode: Mode; idx: number; correct: boolean; band: 'easy' | 'medium' | 'hard' };
  game_end: { mode: Mode; score: number; maxStreak: number };
  share_click: { method: 'webshare' | 'copy' | 'download' };
  share_done: { method: 'webshare' | 'copy' | 'download' };
  replay_click: { mode: Mode };
  mode_switch: { from: string; to: Mode };
  internal_link_click: { from: string; to: string };
  pool_load_error: { screen: 'S-02' | 'S-03' };
};
declare global { interface Window { gtag?: (...a: unknown[]) => void } }
export function canSend(): boolean {
  if (process.env.NODE_ENV !== 'production' || !site.ga4Id || typeof window === 'undefined') return false;
  return !['localhost', '127.0.0.1'].includes(window.location.hostname) && typeof window.gtag === 'function';
}
export function track<K extends keyof EventMap>(name: K, params: EventMap[K]): void {
  if (!canSend()) return;
  window.gtag!('event', name, params);
}
```
- 지키지 않으면 생기는 문제: 이벤트 이름·파라미터가 흩어져 퍼널 측정이 불가능해진다

### C-12 브라우저 저장
- 쓰는 곳: T-06, T-10, T-11, T-12, T-13
- 파일 위치: `src/lib/storage/index.ts`
- 형식: 코드
- 내용:
```ts
export type DailyRecord = { poolVersion: string; answers: boolean[]; maxStreak: number; done: boolean };
const K = { daily: (d: string) => `pd:v1:daily:${d}`, best: 'pd:v1:best:infinite' };
function read<T>(key: string): T | null {
  try { const v = window.localStorage.getItem(key); return v ? (JSON.parse(v) as T) : null; } catch { return null; }
}
function write(key: string, v: unknown): void { try { window.localStorage.setItem(key, JSON.stringify(v)); } catch { /* 저장 불가 무시 */ } }
export const storage = {
  getDaily: (date: string) => read<DailyRecord>(K.daily(date)),
  setDaily: (date: string, r: DailyRecord) => write(K.daily(date), r),
  getBest: () => read<number>(K.best) ?? 0,
  setBestIfHigher: (n: number) => { if (n > (read<number>(K.best) ?? 0)) write(K.best, n); },
};
```
- 지키지 않으면 생기는 문제: 사파리 사생활 보호 모드 등에서 예외로 화면이 멈춘다

### C-13 시드 난수·KST 날짜
- 쓰는 곳: T-05, T-06
- 파일 위치: `src/features/game/logic/random.ts`
- 형식: 코드
- 내용:
```ts
export function hashString(s: string): number {          // FNV-1a 32bit
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0; let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function kstDate(now: Date = new Date()): string {
  return new Date(now.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}
export function dailyNumber(date: string, launchDate: string): number {
  return Math.max(1, Math.floor((Date.parse(date) - Date.parse(launchDate)) / 86400000) + 1);
}
export function msUntilNextKstMidnight(now: Date = new Date()): number {
  const k = now.getTime() + 9 * 3600 * 1000; return 86400000 - (k % 86400000);
}
```
- 지키지 않으면 생기는 문제: 사용자마다 데일리 문제가 달라진다

### C-14 데일리 문제 선택
- 쓰는 곳: T-06, T-11
- 파일 위치: `src/features/game/logic/pick-daily.ts`, 타입 `src/features/game/logic/types.ts`
- 형식: 코드
- 내용:
```ts
import { DAILY_BANDS } from './rules';          // R-10 순서 배열
import { hashString, mulberry32 } from './random';
import type { Pool, Question, Band } from './types';
// Question = { left: number; right: number; band: Band }  (trades 인덱스)
export function toQuestion(a: number, b: number, band: Band, rnd: () => number): Question {
  return rnd() < 0.5 ? { left: a, right: b, band } : { left: b, right: a, band };
}
export function pickDaily(pool: Pool, date: string): Question[] | null {
  const rnd = mulberry32(hashString(`${date}|${pool.poolVersion}`));
  const used = new Set<number>(); const out: Question[] = [];
  for (const band of DAILY_BANDS) {
    const list = pool.pairs[band];
    for (let tries = 0; tries < 500 && list.length > 0; tries++) {
      const [a, b] = list[Math.floor(rnd() * list.length)];
      if (used.has(a) || used.has(b)) continue;
      used.add(a); used.add(b); out.push(toQuestion(a, b, band, rnd)); break;
    }
  }
  return out.length === DAILY_BANDS.length ? out : null;   // null → POOL_EMPTY
}
```
- 지키지 않으면 생기는 문제: 같은 날 같은 풀에서 문제가 달라지거나 같은 거래가 반복된다

### C-15 무한 모드 문제 선택
- 쓰는 곳: T-06, T-12
- 파일 위치: `src/features/game/logic/pick-infinite.ts`
- 형식: 코드
- 내용:
```ts
import { INFINITE_STAGES } from './rules';     // R-11: [{ minStreak, band, min, max }], minStreak 오름차순
import { diffPct } from '@/lib/format';
import { toQuestion } from './pick-daily';
import type { Pool, Question } from './types';
export function stageFor(streak: number) {
  return [...INFINITE_STAGES].reverse().find((s) => streak >= s.minStreak)!;
}
export function pickInfinite(pool: Pool, streak: number, used: ReadonlySet<number>, rnd: () => number = Math.random): Question | null {
  const s = stageFor(streak); const list = pool.pairs[s.band];
  const ok = (a: number, b: number, strictRange: boolean) => {
    if (used.has(a) || used.has(b)) return false;
    if (!strictRange) return true;
    const p = diffPct(pool.trades[a].price, pool.trades[b].price);
    return p >= s.min && p < s.max;
  };
  for (const strict of [true, false]) {
    for (let tries = 0; tries < 800 && list.length > 0; tries++) {
      const [a, b] = list[Math.floor(rnd() * list.length)];
      if (ok(a, b, strict)) return toQuestion(a, b, s.band, rnd);
    }
  }
  return null;   // null → 게임 종료 처리(C-16 EXHAUSTED)
}
```
- 지키지 않으면 생기는 문제: 진행할수록 차이가 좁혀지지 않거나 무한 루프가 생긴다

### C-16 게임 상태 기계
- 쓰는 곳: T-09, T-10, T-11, T-12
- 파일 위치: `src/features/game/logic/reducer.ts`
- 형식: 코드(완성에 가까운 코드)
- 내용:
```ts
import type { Pool, Question } from './types';
export type Mode = 'daily' | 'infinite';
export type Phase = 'loading' | 'error' | 'question' | 'revealed' | 'finished';
export type GameState = { mode: Mode; phase: Phase; pool: Pool | null; questions: Question[]; index: number;
  answers: boolean[]; streak: number; maxStreak: number; selected: 'left' | 'right' | null; errorCode: string | null };
export type Action =
  | { type: 'LOADED'; pool: Pool; questions: Question[]; answers?: boolean[] }   // answers: 데일리 이어하기·완료 복원
  | { type: 'LOAD_FAILED'; code: string } | { type: 'RETRY' }
  | { type: 'SELECT'; side: 'left' | 'right' }
  | { type: 'NEXT'; next?: Question | null }                                    // 무한: 호출부가 pickInfinite 결과 전달
  | { type: 'RESTART'; first: Question };
export const initialState = (mode: Mode): GameState => ({ mode, phase: 'loading', pool: null, questions: [], index: 0,
  answers: [], streak: 0, maxStreak: 0, selected: null, errorCode: null });
const streaks = (ans: boolean[]) => ans.reduce((a, c) => { const s = c ? a.s + 1 : 0; return { s, m: Math.max(a.m, s) }; }, { s: 0, m: 0 });
export function isCorrect(pool: Pool, q: Question, side: 'left' | 'right'): boolean {
  const l = pool.trades[q.left].price, r = pool.trades[q.right].price; return side === 'left' ? l > r : r > l;
}
export function reducer(st: GameState, a: Action): GameState {
  switch (a.type) {
    case 'LOADED': { const ans = a.answers ?? []; const { s, m } = streaks(ans);
      const done = st.mode === 'daily' && ans.length >= a.questions.length;
      return { ...st, pool: a.pool, questions: a.questions, answers: ans, index: Math.min(ans.length, a.questions.length - 1),
        streak: s, maxStreak: m, phase: done ? 'finished' : 'question', selected: null, errorCode: null }; }
    case 'LOAD_FAILED': return { ...st, phase: 'error', errorCode: a.code };
    case 'RETRY': return { ...st, phase: 'loading', errorCode: null };
    case 'SELECT': { if (st.phase !== 'question' || !st.pool) return st;
      const ok = isCorrect(st.pool, st.questions[st.index], a.side); const answers = [...st.answers, ok];
      const { s, m } = streaks(answers);
      return { ...st, phase: 'revealed', selected: a.side, answers, streak: s, maxStreak: m }; }
    case 'NEXT': { if (st.phase !== 'revealed') return st;
      const last = st.answers[st.answers.length - 1];
      if (st.mode === 'daily') return st.index >= st.questions.length - 1 ? { ...st, phase: 'finished' }
        : { ...st, index: st.index + 1, phase: 'question', selected: null };
      if (!last || !a.next) return { ...st, phase: 'finished' };
      return { ...st, questions: [...st.questions, a.next], index: st.index + 1, phase: 'question', selected: null }; }
    case 'RESTART': return { ...initialState(st.mode), pool: st.pool, questions: [a.first], phase: 'question' };
  }
}
```
- 부수 효과(뷰 훅 `useGame`, `src/features/game/view/useGame.ts`): ① mount·RETRY 시 C-17 로드 → 데일리는 C-14, 무한은 C-15로 첫 문제 → LOADED ② 데일리: SELECT 후마다 `storage.setDaily(date,{poolVersion,answers,maxStreak,done:false})`, finished 시 done:true ③ 무한: finished 시 `storage.setBestIfHigher(streak 직전 최대 = maxStreak)` ④ 데일리 복원: 기록 done이면 poolVersion 무관하게 answers로 finished, done 아님 + 같은 poolVersion이면 이어하기, 다르면 새로 시작 ⑤ 무한 used = questions의 left·right 전체
- 지키지 않으면 생기는 문제: 중복 선택·연속 수 오계산·복원 실패가 생긴다

### C-17 출제 풀 로더
- 쓰는 곳: T-06, T-11, T-12
- 파일 위치: `src/features/game/logic/load-pool.ts`
- 형식: 코드
- 내용:
```ts
import type { Pool } from './types';
export type PoolResult = { ok: true; data: Pool } | { ok: false; error: { code: 'POOL_FETCH_FAILED' | 'POOL_SCHEMA_MISMATCH' | 'POOL_EMPTY'; message: string } };
let cache: Pool | null = null;
export async function loadPool(version: string, fetchImpl: typeof fetch = fetch): Promise<PoolResult> {
  if (cache?.poolVersion === version) return { ok: true, data: cache };
  let json: unknown;
  try {
    const res = await fetchImpl(`/data/pool.json?v=${encodeURIComponent(version)}`);
    if (!res.ok) return { ok: false, error: { code: 'POOL_FETCH_FAILED', message: `HTTP ${res.status}` } };
    json = await res.json();
  } catch (e) { return { ok: false, error: { code: 'POOL_FETCH_FAILED', message: String(e) } }; }
  const p = json as Pool;
  if (p?.schemaVersion !== 1 || !Array.isArray(p.trades) || !p.pairs) return { ok: false, error: { code: 'POOL_SCHEMA_MISMATCH', message: 'schema' } };
  if (p.trades.length === 0 || ['easy', 'medium', 'hard'].some((b) => !(p.pairs as Record<string, unknown[]>)[b]?.length))
    return { ok: false, error: { code: 'POOL_EMPTY', message: 'empty' } };
  cache = p; return { ok: true, data: p };
}
```
- version: 페이지 서버 컴포넌트가 `loadStats().poolVersion`을 prop으로 클라이언트에 전달
- 지키지 않으면 생기는 문제: 배포 직후 캐시된 옛 풀이 섞이거나 깨진 파일로 화면이 멈춘다

### C-18 실거래 수집 클라이언트
- 쓰는 곳: T-02
- 파일 위치: `scripts/data/collect.ts`
- 형식: 코드(완성에 가까운 코드, 비동기)
- 내용:
```ts
import { XMLParser } from 'fast-xml-parser';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { secrets } from '../../config';
const URL_ = 'https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev';
const DELAYS = [1000, 3000, 9000];
const parser = new XMLParser({ parseTagValue: false, ignoreAttributes: true });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
type Item = Record<string, string>;
type R<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string; context?: Record<string, string> } };
async function fetchPage(lawd: string, ym: string, page: number, f = fetch): Promise<R<{ items: Item[]; total: number }>> {
  const q = new URLSearchParams({ LAWD_CD: lawd, DEAL_YMD: ym, pageNo: String(page), numOfRows: '1000' });
  const res = await f(`${URL_}?serviceKey=${secrets.dataGoKrKey}&${q}`);   // serviceKey는 인코딩 키 그대로
  if (!res.ok) return { ok: false, error: { code: 'COLLECT_HTTP', message: `HTTP ${res.status}`, context: { lawd, ym } } };
  const x = parser.parse(await res.text())?.response;
  const code = String(x?.header?.resultCode ?? '');
  if (code !== '000' && code !== '00') return { ok: false, error: { code: 'COLLECT_API', message: `${code} ${x?.header?.resultMsg ?? ''}`, context: { lawd, ym } } };
  const raw = x?.body?.items?.item; const items: Item[] = raw ? (Array.isArray(raw) ? raw : [raw]) : [];
  return { ok: true, data: { items, total: Number(x?.body?.totalCount ?? 0) } };
}
export async function fetchMonth(lawd: string, ym: string, f = fetch): Promise<R<Item[]>> {
  const all: Item[] = [];
  for (let page = 1; ; page++) {
    let r: R<{ items: Item[]; total: number }> | null = null;
    for (let i = 0; i <= DELAYS.length; i++) {
      r = await fetchPage(lawd, ym, page, f); if (r.ok) break;
      if (i < DELAYS.length) await sleep(DELAYS[i]);
    }
    if (!r || !r.ok) return r ?? { ok: false, error: { code: 'COLLECT_HTTP', message: 'no response' } };
    all.push(...r.data.items); await sleep(100);
    if (all.length >= r.data.total || r.data.items.length === 0) return { ok: true, data: all };
  }
}
export async function collectMonth(lawd: string, ym: string, recent: boolean, f = fetch): Promise<R<Item[]>> {
  const file = `data/raw/${lawd}/${ym}.json`;
  if (!recent && existsSync(file)) return { ok: true, data: JSON.parse(readFileSync(file, 'utf8')) };
  const r = await fetchMonth(lawd, ym, f);
  if (r.ok) { mkdirSync(`data/raw/${lawd}`, { recursive: true }); writeFileSync(file, JSON.stringify(r.data)); return r; }
  if (existsSync(file)) { console.warn(`[collect] WARN ${r.error.code}: ${lawd} ${ym} 캐시 사용`); return { ok: true, data: JSON.parse(readFileSync(file, 'utf8')) }; }
  return { ok: false, error: { code: 'COLLECT_NO_CACHE', message: r.error.message, context: { lawd, ym } } };
}
```
- 호출 순서: 코드 목록 × 월 목록을 순차 실행(병렬 금지). COLLECT_NO_CACHE 1건이라도 나오면 전체 중단
- 지키지 않으면 생기는 문제: 100건 잘림·일부 누락 데이터가 배포된다

### C-19 정규화·필터·이상치
- 쓰는 곳: T-03
- 파일 위치: `scripts/data/normalize.ts`, `scripts/data/filter.ts`
- 형식: 코드
- 내용:
```ts
// normalize.ts: RawTradeItem → NormalizedTrade (SPEC 데이터 모델). 숫자 필드 trim 후 변환, dealAmount는 ',' 제거
//   dealDate = `${dealYear}-${pad2(dealMonth)}-${pad2(dealDay)}`, cancelled = !!cdealType?.trim() || !!cdealDay?.trim()
//   roadAddr = roadNm ? `${roadNm} ${Number(roadNmBonbun)}${Number(roadNmBubun) > 0 ? '-' + Number(roadNmBubun) : ''}` : null
//   aptSeq 비어 있으면 버린다. id 중복은 첫 건만 남긴다
export type Reason = 'cancel' | 'direct' | 'nonIndividual' | 'leasehold';
export function excludeReason(t: NormalizedTrade): Reason | null {
  if (t.cancelled) return 'cancel';
  if (t.dealingGbn.trim() === '직거래') return 'direct';
  if (t.buyerGbn.trim() !== '개인' || t.slerGbn.trim() !== '개인') return 'nonIndividual';
  if (t.landLeasehold) return 'leasehold';
  return null;
}
const median = (a: number[]) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const minusMonths = (d: string, n: number) => { const x = new Date(`${d}T00:00:00Z`); x.setUTCMonth(x.getUTCMonth() - n); return x.toISOString().slice(0, 10); };
export type OutlierResult = 'pass' | 'outlier' | 'insufficient';
export function outlierCheck(t: NormalizedTrade, sameComplex: NormalizedTrade[]): OutlierResult {
  const from = minusMonths(t.dealDate, OUTLIER.lookbackMonths);
  const comps = sameComplex
    .filter((c) => c.id !== t.id && Math.abs(c.areaM2 - t.areaM2) <= OUTLIER.areaTolM2 && c.dealDate < t.dealDate && c.dealDate >= from)
    .sort((a, b) => b.dealDate.localeCompare(a.dealDate)).slice(0, OUTLIER.recentN);
  if (comps.length < OUTLIER.minComps) return 'insufficient';
  const ref = median(comps.map((c) => c.price / c.areaM2));
  return Math.abs(t.price / t.areaM2 / ref - 1) > OUTLIER.maxDev ? 'outlier' : 'pass';
}
// 실행: excludeReason 단계별 카운트 → stats.counts.afterCancel..afterLeasehold
// 남은 거래를 complexId로 묶어 outlierCheck. 'pass'만 통과(--sample이면 'insufficient'도 통과) → counts.afterOutlier
// 비교 대상(sameComplex)은 R-03 필터를 통과한 거래만 쓴다
```
- 지키지 않으면 생기는 문제: 특수 거래가 출제되어 정답이 상식과 어긋난다

### C-20 좌표·시군구 경계
- 쓰는 곳: T-04
- 파일 위치: `scripts/data/geocode.ts`, `scripts/data/boundary.ts`, `src/features/map/logic/projection.ts`
- 형식: 코드
- 내용:
```ts
// projection.ts (스크립트·클라이언트 공용)
export const FRAME = { minLng: 126.0, maxLat: 38.3, cosLat: 0.7934, k: 1000 } as const;
export const project = (lng: number, lat: number): [number, number] =>
  [Math.round((lng - FRAME.minLng) * FRAME.cosLat * FRAME.k * 10) / 10, Math.round((FRAME.maxLat - lat) * FRAME.k * 10) / 10];
// boundary.ts
export function simplify(pts: [number, number][], tol = 0.002): [number, number][] {   // Douglas-Peucker(경위도)
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]]; let idx = 0, max = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i], dx = b[0] - a[0], dy = b[1] - a[1];
    const d = Math.abs(dy * x - dx * y + b[0] * a[1] - b[1] * a[0]) / (Math.hypot(dx, dy) || 1);
    if (d > max) { max = d; idx = i; }
  }
  if (max <= tol) return [a, b];
  return [...simplify(pts.slice(0, idx + 1), tol).slice(0, -1), ...simplify(pts.slice(idx), tol)];
}
export function pointInRing(lng: number, lat: number, ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
// toPath(polygons): 각 폴리곤 외곽 링만 simplify → project → `M x y L x y ... Z` 이어 붙임(링 꼭짓점 4개 미만 링 제외)
```
- geocode.ts 순서(텍스트): ① 캐시 `data/cache/geocode.json`(complexId → {lat,lng,source}) 확인 ② 없으면 parcel 주소 `{시도전체} {시군구명} {umdName} {jibun}` 요청 ③ NOT_FOUND면 road 주소 `{시도전체} {시군구명} {roadAddr}` ④ HTTP 오류·status ERROR는 1s/3s/9s 재시도 후 NOT_FOUND로 처리, 응답 error.code가 인증 오류(INCORRECT_KEY·UNAVAILABLE_KEY)면 GEOCODE_KEY로 전체 중단 ⑤ 요청 사이 100ms ⑥ 전부 끝난 뒤 R-05 dong·sgg 폴백 계산 ⑦ 캐시에는 parcel·road 결과만 저장
- boundary.ts 순서(텍스트): sido 11·28·41 각각 요청 → `data/cache/sgg-boundary.json`(수정 후 30일 이내면 재사용) → R-06 재배정에 원본 좌표, pool.sgg.path에는 toPath 결과
- 지키지 않으면 생기는 문제: 미니맵 위치가 틀리거나 행정구역 개편 지역이 누락된다

### C-21 풀 샘플링·쌍 생성
- 쓰는 곳: T-05
- 파일 위치: `scripts/data/build-pool.ts`
- 형식: 코드
- 내용:
```ts
import { mulberry32, hashString } from '../../src/features/game/logic/random';
import { diffPct } from '../../src/lib/format';
export function quotas(countBySgg: Map<string, number>, max: number, min: number): Map<string, number> {
  const total = [...countBySgg.values()].reduce((a, b) => a + b, 0);
  const q = new Map([...countBySgg].map(([k, n]) => [k, Math.min(n, Math.max(min, Math.floor((max * n) / total)))]));
  const sum = [...q.values()].reduce((a, b) => a + b, 0);
  if (sum > max) { const over = [...q].filter(([, v]) => v > min); const extra = over.reduce((a, [, v]) => a + v - min, 0);
    const f = (extra - (sum - max)) / extra; for (const [k, v] of over) q.set(k, min + Math.floor((v - min) * f)); }
  return q;
}
export function makePairs(trades: { complexId: string; price: number }[], band: { min: number; max: number }, target: number, seed: string): [number, number][] {
  const rnd = mulberry32(hashString(`${seed}|${band.min}`)); const seen = new Set<string>(); const out: [number, number][] = [];
  for (let tries = 0; out.length < target && tries < target * 200; tries++) {
    const a = Math.floor(rnd() * trades.length), b = Math.floor(rnd() * trades.length);
    const [i, j] = a < b ? [a, b] : [b, a]; const key = `${i}-${j}`;
    if (i === j || seen.has(key) || trades[i].complexId === trades[j].complexId || trades[i].price === trades[j].price) continue;
    const p = diffPct(trades[i].price, trades[j].price);
    if (p < band.min || p >= band.max) continue;
    seen.add(key); out.push([i, j]);
  }
  return out;
}
// 샘플링: 시군구별로 거래를 시드 셔플(mulberry32(hashString(poolVersion+sgg))) → 단지당 5건 상한 적용하며 할당량만큼 선택
// trades 배열은 sggCode 오름차순 → dealYm 내림차순으로 정렬해 저장. complexes는 trades가 참조하는 것만
```
- 지키지 않으면 생기는 문제: 난이도 구간 쌍이 부족하거나 같은 단지끼리 출제된다

### C-22 검증·원자적 교체
- 쓰는 곳: T-05
- 파일 위치: `scripts/data/verify-pool.ts`
- 형식: 텍스트
- 내용: ① `public/data/pool.json.tmp`, `src/generated/stats.json.tmp`에 먼저 쓴다 ② tmp를 다시 읽어 R-12 전 항목 검사(쌍마다 인덱스 범위·같은 단지·동일가·구간 범위, schemaVersion 1, 파일 크기) ③ 하나라도 실패하면 tmp 삭제, `[verify] FAIL VALIDATE_FAILED: {항목}` 출력 후 exit 1(기존 파일 유지) ④ 통과하면 두 파일을 `renameSync`로 교체 ⑤ stats.counts·pairBands는 같은 실행 결과로 채운다
- 지키지 않으면 생기는 문제: 반쯤 깨진 풀이 배포된다

### C-23 npm run update 순서
- 쓰는 곳: T-05
- 파일 위치: `scripts/data/run-update.ts`
- 형식: 텍스트
- 내용: 인자 `--sample`이면 ②⑥⑦⑬⑭ 대신 픽스처 사용·생략
  ① lawd-codes 기본 목록 로드 ② VWorld 경계 받아 현재 sig_cd 합집합(R-02) ③ 월 목록(R-01) × 코드 순차 수집(C-18) ④ 정규화·중복 제거(C-19) ⑤ 필터·이상치(C-19) ⑥ 경계 경로 생성(C-20) ⑦ 지오코딩(C-20) ⑧ 시군구 재배정(R-06) ⑨ 풀 샘플링(C-21) ⑩ 쌍 생성(C-21) ⑪ stats 계산(R-13 중앙값) ⑫ 검증·교체(C-22) ⑬ `npm run verify` 실행, 실패 시 VERIFY_FAILED exit 1 ⑭ `git rev-parse --abbrev-ref HEAD`가 `main`이 아니면 BRANCH_NOT_MAIN exit 1 → `git add public/data/pool.json src/generated/stats.json` → `git commit -m "data: pool {poolVersion}"` → `git push`, 실패 시 GIT_FAILED
  - `--sample` 입력: `tests/fixtures/rtms-005-202610.json`(items 배열), 경계·좌표는 `tests/fixtures/sample-sgg.json`(`[{code,name,lat,lng}]` 서울 5개 구, path는 중심점 ±0.03도 사각형), coordSource "sgg"
  - 각 단계 시작·끝 로그 CONVENTIONS 형식
- 지키지 않으면 생기는 문제: 검증 안 된 데이터가 커밋·배포된다

### C-24 공유
- 쓰는 곳: T-10
- 파일 위치: `src/features/share/logic/share-text.ts`, `src/features/share/logic/share-image.ts`, `src/features/share/logic/do-share.ts`
- 형식: 코드
- 내용:
```ts
// share-text.ts — 문구 원형은 메시지 키 s05.share.text*, 격자만 여기서 생성
export function grid(answers: boolean[], max = 30): string {
  const g = answers.slice(0, max).map((a) => (a ? '🟩' : '🟥')).join('');
  return answers.length > max ? `${g} +${answers.length - max}` : g;
}
export function shareUrl(siteUrl: string, method: 'webshare' | 'copy' | 'download'): string {
  return `${siteUrl}/daily?utm_source=share&utm_medium=${method}`;
}
// do-share.ts
export type ShareOutcome = 'shared' | 'cancelled' | 'fallback';
export async function doShare(text: string, file: File | null): Promise<ShareOutcome> {
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  try {
    if (file && nav.canShare?.({ files: [file] })) { await nav.share({ text, files: [file] }); return 'shared'; }
    if (typeof nav.share === 'function') { await nav.share({ text }); return 'shared'; }
    return 'fallback';
  } catch (e) { return (e as DOMException)?.name === 'AbortError' ? 'cancelled' : 'fallback'; }
}
// 복사: navigator.clipboard.writeText(text) 성공 → share_done{copy}. 저장: URL.createObjectURL(blob) + <a download="jipgapduel-{date}.png">
// share-image.ts: renderShareImage(o:{mode,dateDot,no,score,maxStreak,best,answers,host}) → Promise<Blob|null>
//   canvas 1080×1080, await document.fonts.ready, 좌표(px): 배경 #F6F5F1 전체 / 카드 x70 y70 w940 h940 r40 #FFFFFF
//   로고 IMG-01 x130 y130 96×96 / "집값대결" 56px 800 x246 y196 / 날짜·회차 36px 500 #5B5F6A x130 y300
//   점수 88px 800 #17181C x130 y420 / 둘째 줄 44px 600 x130 y500 / 격자 시작 x130 y580, 칸 72 간격 12, 10칸/줄
//   칸 색 #15803D·#C62828 + 흰 ✓·✗ 40px 중앙 / 하단 "집값대결 · {host}" 32px 500 #5B5F6A x130 y950
//   실패(로고 로드 실패·toBlob null) 시 null 반환 → 텍스트만 공유
```
- 지키지 않으면 생기는 문제: 공유 취소를 실패로 처리하거나 가격이 공유된다

### C-25 광고 조건과 AdSlot
- 쓰는 곳: T-07, T-10, T-13
- 파일 위치: `src/lib/ads/index.ts`, `src/components/AdSlot.tsx`
- 형식: 코드
- 내용:
```ts
import { site } from '@config';
export type SlotName = keyof typeof site.ads.slots;
export const adsScriptEnabled = (): boolean => site.ads.enabled && site.ads.adsenseClientId.trim() !== '';
export const slotId = (s: SlotName): string | null => (adsScriptEnabled() && site.ads.slots[s].trim() ? site.ads.slots[s] : null);
export const adsTxtLine = (): string | null =>
  adsScriptEnabled() ? `google.com, ${site.ads.adsenseClientId.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0` : null;
// AdSlot({ slot }): slotId(slot)가 null이면 return null(DOM 없음)
//   아니면 라벨 t('common.ad.label') + <ins className="adsbygoogle" style={{display:'block'}} data-ad-client data-ad-slot
//   data-ad-format="auto" data-full-width-responsive="true"> + useEffect에서 (window.adsbygoogle ||= []).push({}) 1회
// layout.tsx: adsScriptEnabled()일 때만 next/script afterInteractive
//   src=`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}` crossOrigin="anonymous"
```
- 지키지 않으면 생기는 문제: ID가 비었는데 빈 광고 영역이 생기거나 문제 화면에 광고가 뜬다

### C-26 키 노출 검사
- 쓰는 곳: T-01
- 파일 위치: `scripts/check-secrets.ts`
- 형식: 텍스트
- 내용: `secrets`의 값 중 길이 8 이상인 것을 모아 `out/` 아래 전 파일(재귀, 텍스트로 읽기)에서 포함 여부 검사 → 발견 시 `[secrets] FAIL {파일}` 출력 후 exit 1, 없으면 `[secrets] OK`. `out/`이 없으면 FAIL
- 지키지 않으면 생기는 문제: API 키가 공개 사이트에 배포된다

### C-27 QA 스크린샷
- 쓰는 곳: T-01
- 파일 위치: `playwright.config.ts`, `tests/e2e/screens.spec.ts`
- 형식: 텍스트
- 내용: ① config: `testDir: 'tests/e2e'`, projects chromium만, `webServer: { command: 'npm run preview', url: 'http://localhost:8788', reuseExistingServer: true, timeout: 120000 }`, `use.baseURL` 동일 ② 대상: S-01 `/`, S-02 `/daily`, S-03 `/infinite`, S-04 `/daily`에서 왼쪽 카드 클릭 후, S-05 `/daily` 진입 전 `addInitScript`로 오늘(KST) DailyRecord `{poolVersion: stats.poolVersion, answers: [true×8, false×2], maxStreak: 5, done: true}` 주입, S-06 `/guide/data-source`, S-07 `/privacy`, S-08 `/no-such-page` ③ 뷰포트 375×667, 768×1024, 1440×900 ④ `page.screenshot({ path: 'qa/screens/{S-ID}-{폭}.png', fullPage: true })` ⑤ `waitForLoadState('networkidle')` 후 촬영 ⑥ 실행 `npm run qa:screens`
- 브라우저 실행 불가 환경: `npm run verify` 통과 + `qa/MANUAL.md`에 사람 확인 항목(화면별 3개 폭 확인) 기록
- 지키지 않으면 생기는 문제: QA가 같은 조건으로 화면을 비교할 수 없다

### C-28 OG·아이콘 생성
- 쓰는 곳: T-17
- 파일 위치: `scripts/gen-og.ts`, `scripts/gen-icons.ts`
- 형식: 텍스트
- 내용: ① Playwright `chromium.launch()` ② OG: 대상 S-01·S-02·S-03(제목/보조는 메시지 키 `og.*`), 가이드 slug마다(제목 = md title, 보조 `og.guide.sub`) ③ HTML은 DESIGN.md §2 OG 합성 규칙 그대로, IMG-04·IMG-01은 파일을 base64 data URL로, 폰트는 `node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2`를 @font-face로 ④ viewport 1200×630 → `public/og/{이름}.png` ⑤ 아이콘: IMG-01을 흰 배경 위 폭 70%로 192·512·180 렌더 → `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/apple-touch-icon.png` ⑥ IMG-02를 16·32·48 PNG로 렌더 후 ICO 컨테이너(헤더 6바이트 + 디렉터리 16바이트×3 + PNG 데이터)로 묶어 `public/favicon.ico`, IMG-02를 `public/icon.svg`로 복사 ⑦ 결과 파일은 커밋한다
- 지키지 않으면 생기는 문제: OG·파비콘이 없어 공유 미리보기가 빈 카드로 나온다

### C-29 데이터 출처·갱신일 표시
- 쓰는 곳: T-01(푸터), T-09, T-13, T-14
- 파일 위치: `src/components/DataSource.tsx`, `src/lib/stats.ts`
- 형식: 텍스트
- 내용: ① `loadStats()`는 `src/generated/stats.json`을 `fs`로 읽어 Stats 또는 null 반환(서버 전용) ② `DataSource` props `{ variant: 'footer' | 'reveal' | 'guide' | 'landing'; generatedAt?: string; linkable: boolean }` ③ 문구 키 `common.source.{variant}`, 날짜는 generatedAt 앞 10자 ④ generatedAt 없음(null)이면 출처 문구만 표시하고 갱신일 부분 생략 ⑤ `linkable`이 true일 때만 CT-01 링크(`/guide/data-source`) 출력, 클릭 시 `internal_link_click{from: 화면ID, to:'CT-01'}`
- 지키지 않으면 생기는 문제: 화면마다 출처 표기가 달라 신뢰 장치가 깨진다

### C-30 미니맵 viewBox
- 쓰는 곳: T-08
- 파일 위치: `src/features/map/logic/viewbox.ts`
- 형식: 코드
- 내용:
```ts
import { project } from './projection';
type Box = { x: number; y: number; w: number; h: number };
const bboxCache = new Map<string, Box>();
export function pathBox(path: string): Box {
  const hit = bboxCache.get(path); if (hit) return hit;
  const nums = path.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) { x0 = Math.min(x0, nums[i]); x1 = Math.max(x1, nums[i]); y0 = Math.min(y0, nums[i + 1]); y1 = Math.max(y1, nums[i + 1]); }
  const b = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; bboxCache.set(path, b); return b;
}
export function union(boxes: Box[]): Box {
  const x0 = Math.min(...boxes.map((b) => b.x)), y0 = Math.min(...boxes.map((b) => b.y));
  const x1 = Math.max(...boxes.map((b) => b.x + b.w)), y1 = Math.max(...boxes.map((b) => b.y + b.h));
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
export function viewBoxFor(sgg: { code: string; path: string }[], sggCode: string): string {
  const scope = sggCode.startsWith('11') ? sgg.filter((s) => s.code.startsWith('11')) : sgg;
  const b = union(scope.map((s) => pathBox(s.path))); const pad = sggCode.startsWith('11') ? 0.1 : 0.05;
  const w = Math.max(b.w, (b.h * 4) / 3), h = (w * 3) / 4;                           // 4:3 고정
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  return `${cx - (w * (1 + pad)) / 2} ${cy - (h * (1 + pad)) / 2} ${w * (1 + pad)} ${h * (1 + pad)}`;
}
export const dot = (lng: number, lat: number) => project(lng, lat);
```
- 지키지 않으면 생기는 문제: 서울 단지가 수도권 전체 지도에서 점 하나로 겹쳐 위치 구분이 안 된다
