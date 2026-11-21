<!-- CONVENTIONS.md -->
# CONVENTIONS

## 폴더 구조 (이 구조를 벗어나는 배치 금지)
```
config.ts                       사이트 설정 + 키 (CORE C-01)
src/app/                        라우트 파일만: layout.tsx, page.tsx(S-01), daily/page.tsx(S-02), infinite/page.tsx(S-03),
                                guide/[slug]/page.tsx(S-06), privacy/page.tsx(S-07), not-found.tsx(S-08), sitemap.ts, robots.ts, globals.css
src/features/{기능}/index.ts    기능의 공개 export. 다른 곳은 이 파일만 import
src/features/{기능}/logic/      순수 TS. React·next/* import 금지
src/features/{기능}/view/       React 컴포넌트
  기능 목록(추가 금지): game, map, share, landing, guide, legal
src/components/                 여러 기능이 쓰는 UI: Header, Footer, Button, AdSlot, DataSource, JsonLd, Img, icons.tsx
src/lib/                        공통 모듈: i18n/, format/, seo/, analytics/, ads/, storage/, content/, images.ts, stats.ts
src/messages/ko.json            화면 문구
src/generated/stats.json        데이터 파이프라인 생성물(수정 금지)
content/ko/guide/{slug}.md      가이드 본문(사람 작성)
scripts/data/                   수집·가공 파이프라인
scripts/                        check-secrets.ts, gen-placeholders.ts, gen-og.ts, gen-icons.ts, gen-ads-txt.ts
data/raw/, data/cache/          수집·지오코딩 캐시(.gitignore)
public/data/pool.json           출제 풀 생성물(수정 금지)
public/images/, public/og/, public/icons/
tests/unit/{features|lib|scripts}/   tests/e2e/   tests/fixtures/
qa/screens/                     스크린샷 출력(.gitignore)
```
- API 라우트·서버 로직 없음(유형 W, `output: 'export'`). `src/app/api/` 생성 금지
- 데이터 처리 서버 측 코드는 `scripts/`에만 둔다

## 레이어 규칙 (import 허용 방향)
| 위치 | import 가능 | import 금지 |
|---|---|---|
| src/app | features/*/index.ts, components, lib, messages | features 내부 경로, scripts |
| features/X/view | features/X/logic, 다른 기능 index.ts, components, lib | 다른 기능 내부 경로, scripts |
| features/X/logic | lib/format, 같은 기능 logic | React, next/*, components, view, window·document(예외: lib/storage 경유) |
| components | lib | features, scripts |
| lib | config의 `site` | features, components, scripts |
| scripts | src/features/*/logic, src/lib/format, config(`site`, `secrets`) | src/features/*/view, components |
- `config`의 `secrets`는 `scripts/`에서만 import. ESLint `no-restricted-imports`로 `src/**`에서 `importNames: ["secrets"]` 금지
- 기능 간 순환 import 금지

## 파일 크기
- 한 파일 200줄 초과 금지(JSON·메시지·생성물 제외)
- 분할 기준: logic은 함수 묶음 단위(예: `pick-daily.ts`, `pick-infinite.ts`), view는 컴포넌트 1개 = 파일 1개, 페이지는 섹션 컴포넌트로 분리

## 네이밍
- 파일: logic·lib·scripts `kebab-case.ts`, 컴포넌트 `PascalCase.tsx`, 테스트 `{대상}.test.ts(x)`, e2e `{대상}.spec.ts`
- 식별자: 함수·변수 camelCase, 타입·컴포넌트 PascalCase, 상수 UPPER_SNAKE_CASE
- 측정 이벤트 snake_case(GROWTH.md §6 이름만)
- 메시지 키: `common.*`(헤더·푸터·공통), `s01.*`~`s08.*`(화면), `meta.*`(title·description), `table.*`(가이드 표). 형식 `{범위}.{섹션}.{요소}` camelCase. 예 `s01.hero.title`
- IMG-ID `IMG-01`~`IMG-14`. 화면 ID `S-01`~`S-08`

## 에러 처리
- 형식: `Result<T> = { ok: true; data: T } | { ok: false; error: { code: ErrorCode; message: string; context?: Record<string, string | number> } }`
- 런타임(브라우저)·스크립트 모듈 경계는 Result로 반환. throw는 빌드 시 검증 실패(빌드 중단 목적)에만 사용
- ErrorCode 목록은 SPEC.md API 계약의 에러 코드만 사용
- 화면 에러 문구는 ErrorCode → 메시지 키 매핑(`common.error.{code}`)으로만 표시
- 스크립트 로그: `[단계] OK {n}건` / `[단계] WARN {code}: {message}` / `[단계] FAIL {code}: {message}`, 실패 시 `process.exit(1)`

## 상태 관리
- 게임 상태는 CORE C-16 reducer 하나(`useReducer`)로만 관리. 전역 store·Context·상태 라이브러리 금지
- 브라우저 저장은 CORE C-12 `lib/storage`로만. localStorage 직접 접근 금지
- 무작위 값은 reducer 밖에서 만들어 action으로 넘긴다

## 디자인 값
- 색·여백·폰트·버튼·라운드·그림자·전환 시간은 DESIGN.md §3 토큰만 쓴다. 임의 값 금지

## 이미지
- 매니페스트: `public/images/manifest.json`, 형식 `[{ "id": "IMG-01", "file": "/images/logo-symbol.svg", "width": 512, "height": 512, "alt": "", "status": "placeholder" | "final" }]`. width·height는 DESIGN.md §5 viewBox 크기
- 코드는 이미지 경로를 직접 쓰지 않는다. `src/components/Img.tsx`(CORE C-04)에 IMG-ID를 넘긴다. 예외: OG·아이콘 경로는 CORE C-07 메타 생성기만 쓴다
- 모든 `<Img>`는 width·height 속성 출력
- 플레이스홀더: DESIGN.md §2·§5와 같은 경로·파일명·크기. 단색 배경 #E2E0DA + 중앙에 IMG-ID와 `{w}×{h}` 텍스트. 생성은 CORE C-05. `status: "final"`인 파일은 덮어쓰지 않는다

## 테스트 기준 (Vitest + Testing Library: tests/unit, Playwright: tests/e2e)
| 화면 성격 | 최소 항목 |
|---|---|
| 순수 로직 | 경계값(구간 경계 0.02·0.05·0.10·0.20·0.30, ±40%) / 같은 입력 같은 출력(시드) / tests/fixtures 실제 샘플 사용 |
| 게임 화면(S-02·S-03, S-04·S-05 포함) | 정상 렌더(카드 2장, 카드 필드 7개) / 선택 시 공개 / 데일리 10문제 완료 / 무한 오답 종료 / 최고 기록 저장 / 데일리 재진입 결과 표시 / 로딩 스켈레톤 / 에러 문구와 다시 시도 |
| 랜딩(S-01) | 섹션 렌더(히어로·게임 방법·데이터 요약) / 1차 CTA href `/daily` / 2차 CTA href `/infinite` / stats 없음 시 데이터 요약 섹션 숨김 / 오늘 완료 배지 |
| 콘텐츠(S-06) | 토큰 렌더 / 알 수 없는 토큰 시 throw / `reviewed:false`·본문 없음 → robots noindex / 상대 글 미검수 시 관련 글 숨김 |
| 정적(S-07·S-08) | 렌더 / robots noindex |
| SEO 공통 | 레벨 1~4 × 페이지 종류 판정 표 / sitemap URL 목록 / canonical 값 |
| 스크립트 | 제외 사유별 1건 / 이상치 경계 / 쌍 규칙 위반 검출 / 검증 실패 시 파일 미교체 / 재시도 후 캐시 사용·중단 |
| e2e | 경로별 응답 200(S-08은 404), title, robots 메타 |

## 기술 SEO
- 렌더링: 전 페이지 SSG(`output: 'export'`). 색인 대상 HTML에 H1·본문·데이터 요약이 빌드 시 포함(CSR 단독 금지)
- title: `{페이지명} | 집값대결`. 예외 S-01: `집값대결 — 둘 중 더 비싼 집 고르기`
- description: 한글 70~120자. 페이지별 문구는 TICKETS 해당 티켓
- canonical: `site.SITE_URL + pathname`, 쿼리·해시 제거, 끝 슬래시 없음(`trailingSlash: false`)
- sitemap: `src/app/sitemap.ts`(`dynamic = 'force-static'`) → `/sitemap.xml`. CORE C-08
- robots.txt: `src/app/robots.ts` → 내용 `User-agent: *` / `Allow: /` / `Disallow: /data/` / `Sitemap: {SITE_URL}/sitemap.xml`
- noindex: CORE C-06 판정이 false인 모든 페이지(`<meta name="robots" content="noindex, follow">`)
- 메타 keywords 태그 사용 금지
- OG 필수: og:title, og:description, og:url, og:type=website, og:locale=ko_KR, og:site_name=집값대결, og:image(1200×630, 파일은 DESIGN.md §2), og:image:alt, twitter:card=summary_large_image
- 아이콘 link: `/favicon.ico`(sizes 48x48), `/icon.svg`(image/svg+xml), `/apple-touch-icon.png`, `/manifest.webmanifest`, theme-color #2447D8
- 소유 확인 메타: `site.searchConsoleVerification`, `site.naverSiteVerification`가 비어 있지 않을 때만 출력
- 구조화 데이터: S-01 WebSite, S-02·S-03 WebApplication, S-06 Article + BreadcrumbList, CT-02만 Dataset 추가(CORE C-07)
- 404: `src/app/not-found.tsx` → `out/404.html`(Cloudflare Pages가 404 상태로 응답). 301 규칙 없음(`_redirects` 파일 만들지 않음)
- 성능 기준: LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms
- 색인 대상 페이지 목록은 GROWTH.md §2·§4 G-02. 판정 구현 형식:
  - 색인 범위 레벨: `config.ts` `site.indexLevel`(1~4 정수, 기본 1, 범위 밖이면 빌드 실패)
  - 판정 함수: `src/lib/seo/index-policy.ts` `isIndexable()`(CORE C-06) 하나
  - 고유 데이터 항목 수: 단지 상세 = 필터 통과 거래 수 ≥ 5, 서로 다른 거래월 수 ≥ 3, coordSource가 parcel 또는 road
  - noindex 대상: 내부 검색 결과·필터 조합·빈 결과·기준 미달 데이터 페이지(이번 버전에는 존재하지 않음), S-07, S-08, 미검수·본문 없음 S-06
  - 데이터 출처·최종 갱신일 표시: `src/components/DataSource.tsx`(CORE C-29)

## 다국어
- 메시지 파일 `src/messages/{locale}.json`(현재 `ko.json`만), 중첩 객체, 키 규칙은 네이밍 절
- 화면 문구 하드코딩 금지. `t(key, vars)`(CORE C-02)로만 조회. 숫자·고유명사 데이터 값만 예외
- 날짜·숫자·통화: `src/lib/format/`(CORE C-03) 함수만 사용, `locale` 인자 기본 `'ko'`
- 언어 경로: ko는 접두사 없음(`/`). 추가 언어는 `src/app/{locale}/` 하위 경로(현재 없음)
- hreflang·x-default: CORE C-07이 색인 대상 페이지의 `alternates.languages`로 출력. sitemap 항목에도 같은 값(CORE C-08)
- 미지원 언어 경로: 정적 export에 없으므로 404
- IP·브라우저 언어 기반 자동 리다이렉트 금지. 언어 선택기는 두 번째 언어 추가 전까지 렌더링하지 않음
- 검수 전 번역 페이지: `kind: 'localized'`, `reviewed:false` → C-06이 noindex

## 콘텐츠
- 경로 `content/ko/guide/{slug}.md`. 언어는 경로의 `{언어}` 폴더로 판정
- 머리 메타(`---` 사이, `key: value` 한 줄씩): `title`(필수), `description`(필수, 70~120자), `reviewed`(`true`|`false`, 필수), `updatedAt`(`YYYY-MM-DD`, 필수). 누락 시 빌드 실패
- 본문 = 토큰 줄을 제외한 텍스트. 본문이 비었거나 `reviewed:false` → noindex + sitemap 제외 + 내부 링크 미표시
- md 파일이 없는 slug는 페이지를 생성하지 않는다(404)

## 측정
- GA4 스크립트: `src/app/layout.tsx`에서 `next/script` `afterInteractive`. 조건: `site.ga4Id` 비어 있지 않음 AND `process.env.NODE_ENV === 'production'` AND `location.hostname`이 `localhost`·`127.0.0.1`이 아님
- 전송은 `src/lib/analytics/track.ts` `track()`(CORE C-11) 하나로만. `window.gtag` 직접 호출 금지
- 파라미터에 이메일·이름·전화·주소·자유 입력값 금지. 허용 파라미터는 C-11 타입에 정의된 것만
- 테스트(`NODE_ENV=test`)·로컬 호스트에서는 전송하지 않는다
