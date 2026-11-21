<!-- TICKETS.md -->
실행 순서: T-01 → T-02 → T-03 → T-04 → T-05 → T-06 → T-07 → T-08 → T-09 → T-10 → T-11 → T-12 → T-13 → T-14 → T-15 → T-16 → T-17 → T-18 (참조하는 티켓은 참조 대상 뒤)
T-01은 공통 레이어다: 의존성 설치·버전 고정, 검증 명령 동작, DB 스키마·마이그레이션, CORE.md 공통 항목 구현, 레이아웃(헤더·푸터·사이트명·파비콘 link), DESIGN.md §3 토큰 적용, 이미지 매니페스트와 전체 플레이스홀더 생성, 테스트 셋업, QA 스크린샷 스크립트, SEO 공통 처리, 다국어 구조(메시지 파일·언어 경로·hreflang), 측정 이벤트 전송 함수, sitemap·robots 생성
T-01이 막히면 전체를 중단한다

# T-01 ~ T-10

## T-01 공통 레이어
- AGENTS.md 기술 스택의 버전을 `^` 없이 package.json에 고정하고 설치한다. scripts는 `dev`=`next dev`, `build`=`next build && tsx scripts/check-secrets.ts`, `prebuild`=`tsx scripts/gen-ads-txt.ts`, `typecheck`=`tsc --noEmit`, `lint`=`eslint .`, `test`=`vitest run`, `test:e2e`=`playwright test`, `qa:screens`=`npm run build && playwright test tests/e2e/screens.spec.ts`, `preview`=`wrangler pages dev out --port 8788`, `verify`=`npm run typecheck && npm run lint && npm test && npm run build`, `update`=`tsx scripts/data/run-update.ts`, `data:sample`=`tsx scripts/data/run-update.ts --sample`, `gen:placeholders`, `gen:og`(gen-og + gen-icons)다. `engines.node` `>=22`, `.nvmrc` `22`
- DB 스키마·마이그레이션은 없다(유형 W). `next.config.ts`는 `output: 'export'`, `trailingSlash: false`, `images.unoptimized: true`다. tsconfig는 `strict: true`, paths `@/*`→`src/*`, `@config`→`./config.ts`다
- ESLint 플랫 설정은 `eslint-config-next`(core-web-vitals, typescript)를 쓴다. `src/**`에서 `@config`의 `secrets` import와 `scripts/` 경로 import를 `no-restricted-imports`로 금지한다. `.gitignore`는 node_modules, .next, out, data/raw, data/cache, qa/screens, test-results, playwright-report다
- C-01 config.ts, C-02, C-03, C-04, C-06, C-07, C-08, C-09, C-11, C-12, C-25(lib 부분과 layout 스크립트), C-26, C-27, C-29를 구현한다. `scripts/gen-ads-txt.ts`는 T-07이 만들기 전까지 아무것도 하지 않는 파일로 둔다
- `src/app/globals.css`에 DESIGN.md §3 토큰을 `@theme`으로 선언하고 Tailwind breakpoint를 `md: 768px`, `xl: 1440px`로 바꾼다. Pretendard는 `next/font/local`로 로드한다
- `layout.tsx`: `<html lang="ko">`, Header·Footer(DESIGN.md §4.0), 아이콘·manifest link와 소유 확인 메타(CONVENTIONS 기술 SEO), GA4 조건부 로드(CONVENTIONS 측정)를 넣는다. 푸터 가이드 링크는 `isGuideLinkable(slug)`가 true일 때만 렌더링한다. `stats.json`이 없으면 푸터 갱신일 부분을 생략한다
- `src/messages/ko.json`에 `common.*`(헤더 aria-label "집값대결 홈", 푸터 3행 문구·링크 6개, `common.source.*`, `common.ad.label` "광고", `common.error.POOL_FETCH_FAILED|POOL_SCHEMA_MISMATCH|POOL_EMPTY` = "문제를 불러오지 못했어요")와 `og.*`(DESIGN.md §2 OG 표 제목·보조)를 넣는다
- `public/images/manifest.json`에 IMG-01~IMG-14(DESIGN.md §5 경로·viewBox·alt, status "placeholder")를 등록하고 `npm run gen:placeholders`로 전부 생성한다. `public/manifest.webmanifest`는 DESIGN.md §2 값으로 만든다
- `src/app/page.tsx`는 H1 `t('s01.hero.title')`만 가진 임시 페이지로 만든다(T-13이 완성). `src/app/not-found.tsx`는 H1 "페이지를 찾을 수 없어요"만 둔다(T-16이 완성)
- Vitest(`vitest.config.ts`: jsdom, `@vitejs/plugin-react`, include `tests/unit/**/*.test.{ts,tsx}`, alias 동일)와 Playwright(C-27, `npx playwright install chromium`)를 설정한다
- 단위 테스트: C-06 판정 표(레벨 1~4 × 7종 + 쿼리·빈 결과 차단), C-03 형식(예: 123000 → "12억 3,000만원", 120000 → "12억원", 29500 → "2억 9,500만원", 84.97 → "전용 84.97㎡ (25.7평)"), C-08 sitemap 경로(레벨 1이면 `/`, `/daily`, `/infinite`만), C-09 머리 메타 누락 시 throw를 작성한다
- 완료 조건: `npm run verify` 종료 코드 0, `out/sitemap.xml`과 `out/robots.txt`가 생성됨
참조: 디자인 DESIGN.md §2, §3, §4.0 / 코드 CORE.md C-01, C-02, C-03, C-04, C-05, C-06, C-07, C-08, C-09, C-11, C-12, C-25, C-26, C-27, C-29 / 성장 GROWTH.md G-01, G-02, G-04, G-05, §5, §6 / 테스트 CONVENTIONS.md 테스트 기준 'SEO 공통'

## T-02 실거래 수집 스크립트
- `scripts/data/lawd-codes.ts`에 SPEC.md의 시군구 기본 목록을 `{ code, sido: '서울'|'인천'|'경기', name }` 배열로 그대로 옮긴다. 시도 전체 표기 매핑(11 서울특별시, 28 인천광역시, 41 경기도)도 같은 파일에 둔다
- `scripts/data/months.ts`는 R-01에 따라 실행 시점 KST 전월부터 거꾸로 24개월의 `YYYYMM` 목록과, 그중 최근 3개월 여부를 반환한다. 예: 2026-11-21 실행 → 202411~202610, 최근 3개월 202608~202610
- `scripts/data/collect.ts`를 C-18대로 구현한다. 수집은 SPEC.md API 계약의 `GET(외부) apis.data.go.kr …/getRTMSDataSvcAptTradeDev` 행을 따른다. 한 번에 1,000건을 요청하고 totalCount에 도달할 때까지 페이지를 넘긴다
- 코드 × 월은 순차로 호출한다(병렬 금지). 진행 로그는 `[collect] OK {lawd} {ym} {n}건` 형식이다
- 만들지 않는 것: 병렬 호출, 호출 수 제한 우회, 106 API 호출
- 단위 테스트는 fetch 목으로 작성한다: 2페이지 이어 받기 / item 1건이 객체로 올 때 배열화 / resultCode "03"이면 COLLECT_API / HTTP 500이 3회 재시도 후 캐시 사용 / 캐시가 없으면 COLLECT_NO_CACHE / 최근 3개월이 아니고 캐시가 있으면 호출하지 않음. 재시도 지연은 테스트에서 `vi.useFakeTimers`로 넘긴다
참조: 코드 CORE.md C-18 / 테스트 CONVENTIONS.md 테스트 기준 '스크립트'

## T-03 정규화·필터·이상치
- `scripts/data/rules.ts`에 SPEC.md R-01·R-03·R-04·R-07·R-09·R-12·R-13 값을 상수(`OUTLIER`, `POOL`, `PAIRS`, `VERIFY`, `STATS_BANDS`)로 옮긴다
- `scripts/data/normalize.ts`와 `scripts/data/filter.ts`를 C-19대로 구현한다. 출력은 통과 거래 배열과 counts(fetched, afterCancel, afterDirect, afterNonIndividual, afterLeasehold, afterOutlier)다
- `--sample` 플래그가 있으면 이상치 'insufficient'도 통과시킨다
- `tests/fixtures/rtms-005-202610.json`(items 배열 412건)으로 정규화 결과를 검사한다: 412건 전부 정규화 / 필터 후 남는 건수를 테스트에 기록한 실측값으로 고정
- 테스트 대상 경계값: 제외 사유별 1건(cancel·direct·nonIndividual·leasehold) / ㎡당가 +40% 정확히 → pass, +40.1% → outlier / 비교 거래 1건 → insufficient / 12개월 1일 초과 이전 거래는 비교에서 제외 / 면적 차 3.0㎡ 포함, 3.01㎡ 제외
- 만들지 않는 것: 106 API 필드 대응, 단지명 정규화(문자열 그대로 사용)
참조: 코드 CORE.md C-19 / 테스트 CONVENTIONS.md 테스트 기준 '스크립트'

## T-04 좌표·시군구 경계
- `src/features/map/logic/projection.ts`와 `scripts/data/boundary.ts`, `scripts/data/geocode.ts`를 C-20대로 구현한다
- 경계 수집은 SPEC.md API 계약의 `GET(외부) api.vworld.kr/req/data` 행을 따른다. 시도 3개(11, 28, 41)를 1회씩, 각 최대 1,000건 받는다
- 지오코딩은 SPEC.md API 계약의 `GET(외부) api.vworld.kr/req/address` 행을 따른다. 단지 1개당 최대 2회(parcel, road)만 호출한다
- R-05 폴백과 R-06 재배정을 구현한다. 출력은 다음 두 가지다: complexId별 `{ lat, lng, coordSource, sggCode, sggName }` / `Sgg[]`(code 오름차순, name은 `{시도} {sig_kor_nm}` 예 "서울 강남구")
- 경계에 없는 수집 코드의 이름은 lawd-codes 기본 목록에서 가져온다
- 진행 로그는 `[geocode] OK parcel {n} road {n} dong {n} sgg {n} 제외 {n}`이다
- 단위 테스트(네트워크 목): simplify(직선 위 점 제거) / pointInRing(사각형 안·밖·경계 근처) / project(126.0, 38.3) → [0, 0] / parcel NOT_FOUND → road 호출 / INCORRECT_KEY → GEOCODE_KEY 중단 / dong 평균 계산 / 캐시 적중 시 미호출
- 만들지 않는 것: 카카오 API 호출, 지도 타일, 읍면동 경계
참조: 코드 CORE.md C-20 / 테스트 CONVENTIONS.md 테스트 기준 '스크립트'

## T-05 출제 풀·통계 생성과 npm run update
- `scripts/data/build-pool.ts`(C-21), `scripts/data/stats.ts`, `scripts/data/verify-pool.ts`(C-22), `scripts/data/run-update.ts`(C-23)를 구현한다
- 결과 파일은 SPEC.md API 계약의 `GET /data/pool.json` 행과 데이터 모델 Pool·Stats 형식을 따른다. 이 티켓이 `public/data/pool.json`과 `src/generated/stats.json`을 만드는 유일한 구현이다
- stats 구성: bySgg·byArea·byAge는 필터 통과 전체 거래의 가격 중앙값(정수 만원 반올림)으로, R-13 구간대로 만든다 / pairBands의 minPct·maxPct는 R-08 값이다(easy maxPct는 null)
- `tests/fixtures/sample-sgg.json`을 다음 값으로 만든다. path는 C-20 project로 변환한 중심점 ±0.03도 사각형이다: 11110 서울 종로구 37.5735,126.9790 / 11440 서울 마포구 37.5663,126.9019 / 11650 서울 서초구 37.4837,127.0324 / 11680 서울 강남구 37.5172,127.0473 / 11710 서울 송파구 37.5145,127.1059
- `npm run data:sample`을 실행해 생성된 두 파일을 커밋한다(쌍 목표 300, 최소 100)
- 코딩 세션은 `npm run update`(실수집·푸시)를 실행하지 않는다
- 단위 테스트: quotas 합계 ≤ 8,000이고 시군구 최소 30 / makePairs 결과가 R-08·R-09 위반 0건 / 같은 seed → 같은 결과 / 검증 실패 시 기존 pool.json 유지 / main이 아닌 브랜치에서 BRANCH_NOT_MAIN
- 만들지 않는 것: 수집 결과 diff 리포트, 슬랙·메일 알림, 원격 업로드
참조: 코드 CORE.md C-21, C-22, C-23, C-13 / 성장 GROWTH.md G-03, G-05 / 테스트 CONVENTIONS.md 테스트 기준 '스크립트'

## T-06 게임 로직
- `src/features/game/logic/`에 다음을 구현한다. React import는 금지다: `types.ts`(Pool·PoolTrade·Complex·Sgg·Question·Band. SPEC.md 데이터 모델) / `rules.ts`(R-08 `BANDS`, R-10 `DAILY_BANDS`, R-11 `INFINITE_STAGES`) / `random.ts`(C-13), `pick-daily.ts`(C-14), `pick-infinite.ts`(C-15), `reducer.ts`(C-16), `load-pool.ts`(C-17)
- `src/features/game/index.ts`에서 공개 export한다
- pool 로드는 SPEC.md API 계약의 `GET /data/pool.json` 행을 따른다. 한 번에 파일 1개(전체)를 받는다
- 단위 테스트는 `public/data/pool.json`(T-05 샘플)을 읽어 쓴다: 같은 날짜 → 같은 10문제 / 다른 날짜 → 다른 결과 / 10문제 안 거래 중복 0 / 구간 순서 E,E,E,M,M,M,M,H,H,H / stageFor 경계(2→easy, 3→medium, 5, 6, 9, 10, 14, 15) / pickInfinite가 used 거래를 내지 않음
- reducer 테스트: SELECT 두 번 무시 / 데일리 10번째 NEXT → finished / 무한 오답 NEXT → finished / LOADED에 answers 10개 → finished / 연속·최대 연속 계산
- load-pool 테스트: 404 → POOL_FETCH_FAILED, schemaVersion 2 → POOL_SCHEMA_MISMATCH, pairs.hard 빈 배열 → POOL_EMPTY
- 만들지 않는 것: 서버 시간 동기화, 난이도 수동 선택
참조: 코드 CORE.md C-13, C-14, C-15, C-16, C-17 / 테스트 CONVENTIONS.md 테스트 기준 '순수 로직'

## T-07 광고 슬롯과 ads.txt
- `src/components/AdSlot.tsx`를 C-25대로 구현한다. props `slot: 'resultBottom' | 'landingBottom'`이다
- 조건을 충족하지 않으면 DOM을 만들지 않는다
- 조건을 충족하면 렌더링하는 요소: 라벨 "광고"(small, text-muted) / 최소 높이 280px 영역 / 상하 여백 --space-8, 가운데 정렬
- `scripts/gen-ads-txt.ts`는 `adsTxtLine()`이 값이면 `public/ads.txt`에 그 한 줄을 쓰고, null이면 `public/ads.txt`가 있을 때 삭제한다. 형식은 SPEC.md API 계약의 `GET /ads.txt` 행을 따른다
- 만들지 않는 것: 문제 화면(S-02·S-03·S-04) 광고, 광고 새로고침, 광고 차단 감지 문구
- 단위 테스트: enabled false → null / clientId 빈 값 → null / 슬롯 ID 빈 값 → null / 세 값이 모두 있으면 `ins.adsbygoogle` 렌더 / adsTxtLine이 "ca-pub-123" → "google.com, pub-123, DIRECT, f08c47fec0942fa0"
참조: 디자인 DESIGN.md §4.0 / 코드 CORE.md C-25 / 테스트 CONVENTIONS.md 테스트 기준 '정적(S-07·S-08)'

## T-08 문제 카드와 미니맵
- `src/features/game/view/QuestionCard.tsx`와 `src/features/map/view/MiniMap.tsx`를 만든다
- 카드는 `<button>`이고, 보여주는 정보는 DESIGN.md §4.0 문제 카드의 7개 요소 순서를 따른다: 단지명 / 시군구·동: Sgg.name + umd, 예 "서울 강남구 대치동" / `formatArea` / "{n}층" / "{yyyy}년 준공" / `formatYm` + " 거래" / 미니맵
- 가격 영역 표시: 공개 전 "?" / 공개 후 `formatPrice`
- props: `{ pool, tradeIndex, side, state: 'idle' | 'disabled' | 'correctPick' | 'wrongPick' | 'unpicked', isHigher, revealed, onSelect }`
- 카드에 대한 aria-label 형식은 DESIGN.md §4.0을 따른다
- MiniMap은 SVG다: `viewBox`는 C-30 viewBoxFor / 시군구 경로 전체를 그리고 해당 시군구를 강조한다 / 점은 C-30 dot으로 찍는다 / 비율 4:3, `aria-hidden="true"` / 데이터 출처는 pool.sgg와 pool.complexes이며 추가 요청은 없다
- 반응형: 375px에서 카드 패딩 --space-3과 정보 글자 14px, 768px 이상에서 --space-4, 1440px에서 --space-6
- 만들지 않는 것: 지도 확대·이동, 지도 클릭 동작, 외부 지도 링크
- 컴포넌트 테스트: 7개 정보 렌더 / 공개 전 "?" / 공개 후 가격 문자열 / `isHigher`일 때 "정답" 배지(revealed일 때만) / disabled에서 클릭 무시 / 서울 시군구일 때 viewBox 폭이 수도권 전체보다 작음
참조: 디자인 DESIGN.md §4.0, S-02 / 코드 CORE.md C-03, C-30 / 테스트 CONVENTIONS.md 테스트 기준 '게임 화면(S-02·S-03, S-04·S-05 포함)'

## T-09 S-04 정답 공개 패널
- `src/features/game/view/RevealPanel.tsx`를 만든다. reducer phase가 'revealed'일 때 카드 영역 아래에 나타난다
- 판정 행: 정답이면 IMG-09와 "정답이에요"(success 색, 배경 success-soft) / 오답이면 IMG-10과 "오답이에요"(danger 색, 배경 danger-soft) / 둘째 줄은 "가격 차이 {formatDiff}" / `aria-live="polite"`
- 출처 행: DataSource variant 'reveal'("국토교통부 실거래 자료 · " + 링크 "데이터 기준 보기"). 링크는 `isGuideLinkable('data-source')`일 때만 출력한다
- 진행 버튼(btn-primary): 문구는 "다음 문제". 데일리 10번째 문제와 무한 모드 오답일 때만 "결과 보기"다 / 공개 직후 자동 포커스하고 Enter로 실행한다
- 반응형: 768px 이상: 버튼은 인라인 가운데 정렬, 폭 320px / 375px: 하단 고정 바(배경 surface, --shadow-bar, safe-area 패딩, 등장 --duration-slow). 페이지 하단에 바 높이만큼 패딩을 추가한다
- 클릭 동작: 다음 문제 렌더 또는 S-05 전환. 이벤트는 `cta_click{screen:'S-04',cta:'primary',label_key}`다
- 만들지 않는 것: 2차 버튼, 공유 버튼, 광고, 자동 다음 문제 넘김
- 상태: 로딩·빈·에러 없음
- 테스트: 정답·오답 문구와 IMG-ID / 차이 문구 "+2억 1,500만원 (17.4%)" 형식 / 마지막 문제 버튼 문구 / 미검수일 때 출처 링크 없음
참조: 디자인 DESIGN.md S-04 / CTA DESIGN.md §6 S-04 / 성장 GROWTH.md G-04, G-05 / 코드 CORE.md C-16, C-29, C-11 / 테스트 CONVENTIONS.md 테스트 기준 '게임 화면(S-02·S-03, S-04·S-05 포함)'

## T-10 S-05 결과·공유
- `src/features/share/`(logic: C-24, view: `ShareBlock.tsx`)와 `src/features/game/view/ResultView.tsx`를 만든다
- 데일리 결과에 보여주는 것: IMG-11 / "오늘의 결과" / "{formatDateKo} · 데일리 #{dailyNumber}" / "10문제 중 {n}개" / "최고 연속 {m}개" / 정답 격자(10칸) / "오늘의 10문제, 모두가 같은 문제를 풀어요"
- 무한 결과에 보여주는 것: IMG-11 / "이번 기록" / "연속 {n}개 정답" / "최고 기록 {best}개" / 이번 기록이 최고 기록을 넘으면 배지 "최고 기록 경신" / 정답 격자(최대 30칸, 이후 "+{n}")
- 공유 블록: 위에 "가격은 공유되지 않아요" / 1차 버튼: 데일리 "결과 공유하기" / 무한 "기록 공유하기" / 누르면 `share_click{webshare}`. C-24 doShare 결과가 'shared'면 `share_done{webshare}`, 'cancelled'면 아무것도 하지 않고, 'fallback'이면 "텍스트 복사하기"·"이미지 저장하기" 버튼을 노출한다 / 복사 성공 시 "복사했어요"를 2초 표시하고 `share_done{copy}`를 보낸다. 저장 시 `share_done{download}` / 이미지 생성이 실패하면 "이미지를 만들지 못해 텍스트만 공유했어요"를 표시한다
- 공유 텍스트(메시지 키 `s05.share.*`): 데일리: "집값대결 데일리 #{no}\n10문제 중 {score}개 · 최고 연속 {maxStreak}\n{grid}\n{url}" / 무한: "집값대결 무한 모드\n연속 {streak}개 정답 · 최고 기록 {best}\n{grid}\n{url}" / url은 C-24 shareUrl이다
- 데일리 결과 아래 순서: "내일 0시에 새 10문제" / btn-secondary "무한 모드로 더 풀기" → `/infinite` (`mode_switch`, `cta_click secondary`) / btn-text "조건별 중간 가격 보기" → `/guide/median-price`. `isGuideLinkable('median-price')`일 때만 표시하고 `internal_link_click{from:'S-05',to:'CT-02'}`를 보낸다 / `<AdSlot slot="resultBottom"/>`
- 무한 결과 아래: 2차 "다시 도전하기"(`replay_click`, `cta_click secondary`, 새 판). 내부 링크와 광고는 데일리와 같다
- 반응형: 폭 최대 560px 가운데 정렬 / 375px에서 IMG-11 180×120, score 40px, 버튼 폭 100%
- 상태: 로딩·빈 없음. 에러는 이미지 생성 실패 문구만 있다
- 이벤트: 이번 방문에서 게임이 finished로 바뀐 순간 `game_end{mode,score,maxStreak}`를 1회 보낸다(저장된 결과 복원 표시에는 보내지 않는다)
- 만들지 않는 것: 결과별 공유 URL, 카카오 SDK, 결과 저장 목록, 다른 사람 결과 비교
- 테스트: 데일리·무한 문구 / 격자 칸 수(31개 → 30칸 + "+1") / 공유 텍스트에 가격 문자열("억", "만원") 없음 / AbortError → fallback 미노출 / fallback 버튼 노출
참조: 디자인 DESIGN.md S-05 / CTA DESIGN.md §6 S-05 / 성장 GROWTH.md G-06, G-07, G-04 / 코드 CORE.md C-24, C-25, C-11, C-12, C-13 / 테스트 CONVENTIONS.md 테스트 기준 '게임 화면(S-02·S-03, S-04·S-05 포함)'

# T-11 ~ T-18

## T-11 S-02 데일리 문제 화면 (/daily)
- `src/app/daily/page.tsx`(서버)는 `loadStats().poolVersion`을 `DailyGame`(클라이언트, `src/features/game/view/DailyGame.tsx`)에 넘긴다. `useGame`(C-16 부수 효과)을 구현한다
- 데이터: SPEC.md API 계약의 `GET /data/pool.json` 행을 따르고, C-14로 KST 오늘 10문제를 만든다
- 헤더 우측 영역: "데일리 #{n}"과 "{index+1}/10"
- 헤더 아래 진행 막대 10칸: 미풀이 border, 정답 success, 오답 danger. aria-label "10문제 중 {k}문제 풀이"
- 질문: "더 비싼 집을 골라요", 보조 문구 "카드를 눌러 선택해요"(공개 상태에서는 숨김)
- 카드 영역: T-08 카드 2장을 2열로 배치, 사이에 VS 배지 / 키보드 ←·→로 선택 / 선택하면 `answer{mode:'daily',idx,correct,band}` / 첫 문제 표시 때 `game_start{mode:'daily'}`
- 공개 후 T-09 패널, 완료 후 T-10 데일리 결과를 보여준다
- 같은 날 완료 기록이 있으면 S-05를 바로 보여준다. 완료하지 않은 기록에 같은 poolVersion이면 이어서 진행한다
- 상태: 로딩: 스켈레톤 카드 2장 + 회색 진행 막대(opacity 0.6↔1, 1200ms) / 에러·빈 상태: IMG-08 + "문제를 불러오지 못했어요" + "네트워크를 확인하고 다시 시도해 주세요" + btn-primary "다시 시도하기"(RETRY). `pool_load_error{screen:'S-02'}`를 보낸다
- 반응형: 카드는 모든 폭에서 2열 / 열 간격: 375px --space-3, 768px 이상 --space-6 / 1440px: 게임 컨테이너 880px
- 메타(색인 대상, kind 'game', og 'S-02'): title "오늘의 집값 퀴즈 10문제 | 집값대결" / description "매일 모두가 같은 10문제를 풀어요. 수도권 아파트 실거래 두 건 중 더 비싼 쪽을 고르고 결과를 가격 없이 공유해요." / JSON-LD WebApplication
- 만들지 않는 것: 광고, 모드 전환 링크, 지난 날짜 데일리, 타이머
- 테스트: 게임 화면 기준 전 항목 / 0시 기준 날짜가 KST(UTC 15:00 = 다음 날)
참조: 디자인 DESIGN.md S-02 / CTA DESIGN.md §6 S-02 / 성장 GROWTH.md KW-02, G-01, G-07 / 코드 CORE.md C-14, C-16, C-17, C-12, C-11, C-07 / 테스트 CONVENTIONS.md 테스트 기준 '게임 화면(S-02·S-03, S-04·S-05 포함)'

## T-12 S-03 무한 모드 문제 화면 (/infinite)
- `src/app/infinite/page.tsx`와 `src/features/game/view/InfiniteGame.tsx`를 만든다. T-11의 `useGame`을 mode 'infinite'로 쓴다
- 데이터: SPEC.md API 계약의 `GET /data/pool.json` 행을 따른다. 문제는 한 번에 1문제씩 C-15로 만든다(현재 연속 수, 이번 판에 쓴 거래 제외)
- 헤더 우측: "연속 {streak}" + "최고 {best}"(기록이 없으면 0)
- 질문: "더 비싼 집을 골라요", 보조 문구 "틀릴 때까지 계속 나와요"
- 카드·키보드·공개 패널은 T-11과 같다. 진행 막대는 없다
- 오답이면 패널 버튼이 "결과 보기"로 바뀌고 T-10 무한 결과로 넘어간다. 결과 표시 때 `storage.setBestIfHigher(maxStreak)`를 호출한다
- pickInfinite가 null이면 그 시점에 결과로 넘어간다
- 이벤트: `game_start{mode:'infinite'}`(첫 문제와 다시 도전 시), `answer`
- 상태: 로딩·에러는 T-11과 같은 문구·IMG-08·버튼이다. 이벤트 `pool_load_error{screen:'S-03'}`
- 반응형: T-11과 같다
- 메타(색인 대상, kind 'game', og 'S-03'): title "어느 아파트가 더 비쌀까? 무한 모드 | 집값대결" / description "틀릴 때까지 계속 나오는 수도권 아파트 가격 비교 게임. 실제 거래 두 건 중 더 비싼 쪽을 고르고 최고 기록에 도전해요." / JSON-LD WebApplication
- 만들지 않는 것: 광고, 일시정지, 생명(목숨) 시스템, 난이도 수동 선택
- 테스트: 오답 시 종료 / 최고 기록 갱신·유지 / 다시 도전 시 연속 0과 새 문제 / 연속 3에서 medium 구간 출제
참조: 디자인 DESIGN.md S-03 / CTA DESIGN.md §6 S-03 / 성장 GROWTH.md KW-03, G-01 / 코드 CORE.md C-15, C-16, C-12, C-11, C-07 / 테스트 CONVENTIONS.md 테스트 기준 '게임 화면(S-02·S-03, S-04·S-05 포함)'

## T-13 S-01 랜딩·모드 선택 (/)
- `src/app/page.tsx`를 완성한다. 섹션은 `src/features/landing/view/`에 둔다
- 히어로: H1 "둘 중 더 비싼 집은?" / 서브 "실제 거래된 아파트 두 채, 비싼 쪽을 골라요" / 메시지 "오늘의 10문제, 모두가 같은 문제를 풀어요" / btn-primary "오늘의 10문제 풀기" → `/daily` / 보조 "가입 없이 바로 시작해요" / btn-secondary "무한 모드 하기" → `/infinite` / IMG-03(priority)
- 히어로 클릭 이벤트: 1차는 `cta_click{S-01,primary}`, 2차는 `cta_click{S-01,secondary}` + `mode_switch{from:'S-01',to:'infinite'}`
- 오늘 KST 데일리 기록이 done이면 1차 버튼 옆(375px에서는 위)에 배지 "오늘 완료 · {score}/10"을 표시한다. 클라이언트에서 storage를 읽는다
- 게임 방법: h2 "이렇게 풀어요"와 카드 3개(DESIGN.md S-01 카피, IMG-05·IMG-06·IMG-07)
- 데이터 요약: 데이터 출처는 빌드 시 `loadStats()` 1회 호출이다 / 4칸: "거래 기간" `{formatYm(from)} ~ {formatYm(to)}` / "출제 거래" `{formatCount(poolTrades)}건` / "지역" `수도권 {sggCount}개 시군구` / "데이터 갱신" `{generatedAt 앞 10자}` / 출처 행 "실제 신고된 거래만 썼어요. 해제·직거래는 뺐어요" / btn-text "제외 기준 보기" → `/guide/data-source`. `isGuideLinkable` true일 때만 표시하고 `internal_link_click{from:'S-01',to:'CT-01'}`를 보낸다
- stats가 null이면 데이터 요약 섹션 전체를 렌더링하지 않는다
- 이어서 `<AdSlot slot="landingBottom"/>`를 둔다
- 재노출 바: 375px·768px에서 scrollY > 600px이면 하단 고정 바 btn-primary "오늘의 10문제 풀기"를 표시한다 / 1440px에서는 표시하지 않는다
- 반응형: DESIGN.md S-01 반응형(375px 1열·이미지는 CTA 아래 최대 높이 220px / 768px 2열 5:3 / 1440px 6:6, 컨테이너 1120px)
- 상태: 로딩·빈·에러 없음
- 메타(색인 대상, kind 'landing', og 'S-01'): title "집값대결 — 둘 중 더 비싼 집 고르기" / description "실제 거래된 수도권 아파트 두 채 중 더 비싼 쪽을 고르는 게임. 숫자 입력 없이 탭 한 번으로 고르고 바로 실거래가와 차이를 확인해요." / JSON-LD WebSite
- 만들지 않는 것: 헤더 메뉴, 히어로 영역 광고, 최근 결과 목록, 후기·사용자 수
- 테스트: 랜딩 기준 전 항목 / 미검수 시 "제외 기준 보기" 없음
참조: 디자인 DESIGN.md S-01 / CTA DESIGN.md §6 S-01 / 성장 GROWTH.md KW-01, G-01, G-04, G-05, G-07 / 코드 CORE.md C-07, C-09, C-12, C-25, C-29, C-11 / 테스트 CONVENTIONS.md 테스트 기준 '랜딩(S-01)'

## T-14 S-06 가이드 템플릿 (/guide/{slug})
- `src/app/guide/[slug]/page.tsx`를 만든다 / `generateStaticParams`는 `listGuides()`의 slug만 반환한다 / `dynamicParams = false`로 두어 md가 없는 slug는 404다
- `src/features/guide/`에 C-10 토큰 렌더와 `GuideBody`·`DataTable`·`GuideCta`·`RelatedGuide`를 둔다
- md 파일 2개를 이 내용 그대로 만든다. 본문 문장은 쓰지 않는다: `content/ko/guide/data-source.md`: 머리 메타 title "실거래가 데이터 출처와 제외 기준", description "집값대결이 쓰는 국토교통부 아파트 매매 실거래 자료의 수집 범위와 해제·직거래·이상치 제외 기준, 단계별 남은 거래 수를 정리했어요.", reviewed false, updatedAt = 작성일. 본문은 토큰 줄 `{{meta:period}}`, `{{table:filterFunnel}}`, `{{cta:primary}}`, `{{table:pairBands}}`, `{{cta:primary}}` / `content/ko/guide/median-price.md`: title "수도권 아파트 실거래 중간 가격: 시군구·면적·연식별", description "필터를 통과한 수도권 아파트 매매 실거래로 시군구별·전용면적대별·연식대별 중간 가격과 거래 수를 표로 정리했어요.", reviewed false. 본문은 `{{meta:period}}`, `{{table:bySgg}}`, `{{cta:primary}}`, `{{table:byArea}}`, `{{table:byAge}}`, `{{cta:secondary}}`
- 화면 구성: 브레드크럼 "홈 › {title}" / H1 title / 메타 행 DataSource variant 'guide' + " · 글 수정 {updatedAt}" / IMG-12 / 본문 / CTA 블록: primary는 h3 "둘 중 더 비싼 집은?" + "오늘의 10문제 풀기" + "가입 없이 바로 시작해요". secondary는 h3 "틀릴 때까지 풀어 보세요" + "무한 모드 하기" / 관련 글: 상대 slug가 `isGuideLinkable`일 때만 카드 1개를 보여준다
- 표 형식: 숫자 열은 우측 정렬 / 짝수 행 bg / 캡션 "출처 국토교통부 아파트 매매 실거래 자료 · 기간 {period} · 필터 통과 거래 기준" / bySgg 캡션에 warning 색으로 "거래 30건 미만 시군구는 표에서 뺐어요" / 375px에서 가로 스크롤, 첫 열 sticky
- 반응형: 본문 폭 720px. 375px에서 좌우 여백 20px, H1 30px
- 메타: title "{md title} | 집값대결", description = md description, og `guide-{slug}` / 색인 판정은 kind 'guide' + reviewed + hasBody(C-06). 현재 두 글 모두 noindex이고 sitemap에서 제외된다 / JSON-LD Article + BreadcrumbList. median-price는 Dataset을 추가한다
- 이벤트: CTA 클릭 시 `cta_click{S-06,primary|secondary}` / 관련 글 클릭 시 `internal_link_click{from:'CT-0n',to:'CT-0m'}`
- 재노출 바: 375px에서 scrollY > 800px이고 CTA 블록이 화면에 없을 때 하단 고정 바 "오늘의 10문제 풀기"를 표시한다
- 상태: 로딩 없음. 빈 상태는 404이고, stats null이면 빌드 실패다
- 만들지 않는 것: 가이드 목록 페이지, 태그, 목차, 댓글, 본문 문장 작성
- 테스트: 콘텐츠 기준 전 항목
참조: 디자인 DESIGN.md S-06 / CTA DESIGN.md §6 S-06 / 성장 GROWTH.md CT-01, CT-02, KW-04, KW-05, G-01, G-02, G-03, G-04, G-05 / 코드 CORE.md C-09, C-10, C-07, C-29, C-11 / 테스트 CONVENTIONS.md 테스트 기준 '콘텐츠(S-06)'

## T-15 S-07 개인정보처리방침 (/privacy)
- `src/app/privacy/page.tsx`와 `src/features/legal/view/PrivacyBody.tsx`를 만든다
- 구성: IMG-13(120×90) / H1 "개인정보처리방침" / "시행일 {site.privacyEffectiveDate}" / 절 6개(DESIGN.md S-07 카피 그대로, 메시지 키 `s07.*`)
- "광고" 절은 `site.ads.enabled`가 false면 렌더링하지 않는다
- "문의" 절은 `site.contactEmail`을 `mailto:` 링크로 출력한다. 값이 비어 있으면 "문의처는 준비 중이에요"를 출력하고 빌드 로그에 `[privacy] WARN contactEmail empty`를 남긴다(출시 전 사람이 값을 채운다, QA.md Q-17)
- 반응형: 본문 폭 720px, 375px 좌우 여백 20px
- 메타(noindex, kind 'legal', og 'S-01'): title "개인정보처리방침 | 집값대결" / description "집값대결은 회원가입 없이 운영돼요. 브라우저 저장 정보, 방문 분석과 광고 쿠키, 거부 방법과 문의처를 안내해요."
- 상태: 로딩·빈·에러 없음
- 이벤트: 없음
- 만들지 않는 것: 쿠키 동의 배너, 약관 페이지, 버전 이력
- 테스트: 렌더 / robots noindex / ads.enabled false일 때 광고 절 없음
참조: 디자인 DESIGN.md S-07 / CTA DESIGN.md §6 S-07 / 코드 CORE.md C-07, C-02 / 테스트 CONVENTIONS.md 테스트 기준 '정적(S-07·S-08)'

## T-16 S-08 404
- `src/app/not-found.tsx`를 완성한다
- 구성: IMG-14(320×240, 375px에서 240×180) / H1 "페이지를 찾을 수 없어요" / "주소가 바뀌었거나 없는 페이지예요" / btn-primary "오늘의 10문제 풀기" → `/daily` (`cta_click{S-08,primary}`) / btn-text "홈으로 가기" → `/`
- 반응형: 375px에서 버튼 폭 100%, 768px 이상에서 최소 240px 가운데 정렬
- 메타(noindex, kind 'notFound', og 'S-01'): title "페이지를 찾을 수 없어요 | 집값대결"
- 상태: 로딩·빈·에러 없음
- 만들지 않는 것: 검색창, 광고, 자동 리다이렉트
- 테스트: 렌더 / robots noindex / 1차 href `/daily` / e2e `/no-such-page` 응답 404
참조: 디자인 DESIGN.md S-08 / CTA DESIGN.md §6 S-08 / 코드 CORE.md C-07, C-11 / 테스트 CONVENTIONS.md 테스트 기준 '정적(S-07·S-08)'

## T-17 OG 이미지와 아이콘 생성
- `scripts/gen-og.ts`와 `scripts/gen-icons.ts`를 C-28대로 구현하고 `npm run gen:og`를 실행해 생성물을 커밋한다
- 생성 파일: `public/og/S-01.png`, `public/og/S-02.png`, `public/og/S-03.png` / `public/og/guide-data-source.png`, `public/og/guide-median-price.png` / `public/icons/icon-192.png`, `public/icons/icon-512.png` / `public/apple-touch-icon.png`, `public/favicon.ico`, `public/icon.svg`
- 크기 기준: DESIGN.md §2 필요 파일 목록. 이미지 원본이 플레이스홀더여도 같은 경로로 생성한다
- 만들지 않는 것: 결과별 동적 OG, 빌드 시 자동 생성(수동 명령만)
- 테스트: 생성 후 각 PNG의 IHDR 너비·높이 검사(1200×630, 192, 512, 180), favicon.ico 헤더의 이미지 수 3
참조: 디자인 DESIGN.md §2 / 성장 GROWTH.md G-01, G-06 / 코드 CORE.md C-28 / 테스트 CONVENTIONS.md 테스트 기준 '스크립트'

## T-18 색인·라우트 종합 점검과 QA §2
- `tests/e2e/seo.spec.ts`를 만든다. 대상은 preview 서버(http://localhost:8788)다: `/`, `/daily`, `/infinite` 응답 200 + title(T-11·T-12·T-13 문구) + robots에 noindex 없음 + canonical `{SITE_URL}{path}` / `/guide/data-source`, `/guide/median-price`, `/privacy` 응답 200 + robots noindex / `/no-such-page` 응답 404 / `/sitemap.xml`에 `/`, `/daily`, `/infinite` 3개만 있음 / `/robots.txt` 4줄(CONVENTIONS 기술 SEO) / 모든 페이지에 hreflang ko·x-default는 색인 대상에만 있음 / meta keywords 없음
- 단위 테스트를 추가한다: `indexLevel` 2 + 두 md를 reviewed true·본문 있음으로 바꾼 픽스처에서 sitemap에 `/guide/*`가 들어가는 것을 C-08로 검사한다(파일 시스템 목)
- `npm run qa:screens`를 실행해 `qa/screens/`에 24장이 생성되는지 확인한다. 브라우저를 실행할 수 없으면 C-27의 대체 절차를 따른다
- QA.md §2에 코딩 중 발견한 점검 항목을 5개 이내로 작성한다
- 만들지 않는 것: Lighthouse 자동화, 외부 색인 API 호출
참조: 성장 GROWTH.md G-01, G-02, §5 / 코드 CORE.md C-06, C-07, C-08, C-27 / 테스트 CONVENTIONS.md 테스트 기준 'e2e'
