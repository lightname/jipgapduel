<!-- QA.md -->
# QA

## 심각도 기준
- **상**: 핵심 흐름이 끝나지 않거나, 색인·신뢰·개인정보에 직접 해가 되는 결함
  - S-02 데일리 10문제를 끝까지 풀 수 없음, S-03 오답 후 결과로 가지 않음, S-04에서 정답 판정이 가격과 반대
  - 같은 날·같은 poolVersion에서 S-02 문제가 기기마다 다름
  - S-05 공유 텍스트·이미지에 가격이 들어감
  - 색인 대상 페이지(S-01·S-02·S-03)가 noindex, robots.txt에서 차단, sitemap.xml에서 누락
  - 페이지 생성 규칙 위반 페이지(미검수·본문 없는 S-06, S-07, S-08)가 색인 대상이거나 sitemap에 포함
  - 구독 폼 수신 동의 절차 없음(이 버전은 구독 폼이 없다. 폼이 생기면 상)
  - `out/`에 config.ts `secrets` 값 포함
  - `npm run verify` 실패
- **중**: 흐름은 끝나지만 전환·측정·표기가 명세와 다른 결함
  - 1차 CTA 문구·이동 경로가 DESIGN.md §6과 다름, 1차 CTA가 한 뷰포트에 2개 이상
  - 측정 이벤트 미발생·이름 불일치(GROWTH.md §6)
  - 가격·면적·날짜 표기가 SPEC·CORE C-03과 다름
  - 375px에서 카드 2열 붕괴, 하단 고정 바가 콘텐츠를 가림
  - 로딩·에러 상태 문구·IMG-ID가 티켓과 다름
  - canonical·OG·파비콘 누락, 데이터 출처·갱신일 미표시
  - 문제 화면(S-02·S-03·S-04)에 광고 노출
- **하**: 기능·전환에 영향 없는 시각 차이
  - 토큰 밖 색·여백 1곳, 전환 시간 차이, 정렬 어긋남, 아이콘 크기 차이

## §1 설계 QA 리스트
| ID | 분야 | 대상 | 확인 방법 | 기대 결과 | 근거 문서·절 |
|---|---|---|---|---|---|
| Q-01 | 버그 | S-02 → S-04 → S-05 | `/daily`에서 카드 10회 선택·다음 문제 | 10번째 후 "결과 보기" → S-05에 "10문제 중 {n}개", 격자 10칸, 진행 막대 색이 답과 일치 | TICKETS T-11, T-09, T-10 |
| Q-02 | 버그 | S-02 데일리 결정성 | 두 브라우저 프로필에서 같은 날 `/daily` 첫 3문제 단지명 비교 | 동일 | SPEC R-10, CORE C-14 |
| Q-03 | 버그 | S-03 → S-05 | `/infinite`에서 일부러 오답 선택 | 버튼 "결과 보기" → "연속 {n}개 정답", 최고 기록이 localStorage `pd:v1:best:infinite`와 일치 | T-12, CORE C-16 |
| Q-04 | CTA | S-01 1차 CTA | "오늘의 10문제 풀기" 클릭, 375px에서 600px 스크롤 | `/daily` 이동, 고정 바 등장 시 히어로 1차 버튼이 화면 밖 | DESIGN §6 S-01 |
| Q-05 | CTA | S-05 공유 | Web Share 미지원 브라우저(데스크톱 Firefox)에서 "결과 공유하기" | "텍스트 복사하기"·"이미지 저장하기" 노출, 복사 텍스트에 "억"·"만원" 없음 | T-10, CORE C-24 |
| Q-06 | 버그 | S-02 에러 상태 | DevTools로 `/data/pool.json` 요청 차단 후 `/daily` | IMG-08, "문제를 불러오지 못했어요", "다시 시도하기" 클릭 시 재요청 | T-11 |
| Q-07 | 디자인 | 375px 레이아웃 | `npm run qa:screens` S-02-375.png, S-04-375.png | 카드 2열 유지, 가로 스크롤 없음, S-04 하단 고정 바가 판정 행을 가리지 않음 | DESIGN S-02, S-04 |
| Q-08 | 성장 | S-01·S-02·S-03 메타 | 빌드 HTML의 title·og:image·icon link 확인 | T-13·T-11·T-12 title 문구, og:image 1200×630 파일 존재, favicon.ico·icon.svg·apple-touch-icon link | CONVENTIONS 기술 SEO, DESIGN §2 |
| Q-09 | 디자인 | 플레이스홀더 | S-01-1440.png 히어로, S-05-375.png 결과 이미지 | IMG-03 4:3 비율로 우측 열, IMG-11 180×120, 이미지 안 IMG-ID 표기 | DESIGN §5, CONVENTIONS 이미지 |
| Q-10 | 디자인 | 토큰 준수 | `src/` 전체에서 `#[0-9A-Fa-f]{6}`·`px` 임의 값 검색(globals.css·share-image.ts 제외) | 0건 | CONVENTIONS 디자인 값 |
| Q-11 | 성장 | sitemap·robots | `out/sitemap.xml`, `out/robots.txt` 열람 | sitemap에 `/`, `/daily`, `/infinite`만. robots는 `Allow: /`, `Disallow: /data/`, Sitemap 줄 | GROWTH G-02, CONVENTIONS 기술 SEO |
| Q-12 | 성장 | canonical | `/daily` HTML canonical | `https://price-duel.pages.dev/daily`(쿼리 없음, 끝 슬래시 없음) | CORE C-07 |
| Q-13 | 성장 | 본문 없는 콘텐츠 | `/guide/data-source` HTML robots, sitemap 포함 여부, 푸터 링크 | `noindex`, sitemap 미포함, 푸터·S-01·S-04에 링크 없음 | GROWTH G-02·G-03, CORE C-09 |
| Q-14 | 성장 | 기준 미달·필터·빈 결과 | CORE C-06 단위 테스트 결과 확인(complexDetail 거래 4건, hasQuery, isEmptyResult, isFilterCombo) | 전부 false | CORE C-06 |
| Q-15 | 성장 | 데이터 출처·갱신일 | S-01 데이터 요약, S-04 출처 행, 푸터 | "국토교통부 아파트 매매 실거래 자료"와 stats.generatedAt 날짜 일치 | GROWTH G-05 |
| Q-16 | 성장 | 1차 CTA 측정 | production 빌드를 hosts로 비-localhost 도메인에 띄우고 GA4 DebugView에서 S-01 1차 클릭 | `cta_click{screen:'S-01',cta:'primary'}` 1건, 로컬호스트에서는 0건 | CORE C-11 |
| Q-17 | 성장 | S-07 문의처 | `site.contactEmail` 값과 S-07 "문의" 절 | 출시 빌드에서 mailto 링크 표시, 빈 값이면 출시 차단 | T-15 |
| Q-18 | 성장 | hreflang·언어 경로 | `/` HTML의 link alternate, `/en` 요청 | hreflang ko·x-default가 canonical과 같은 URL, `/en` 404 | CONVENTIONS 다국어 |
| Q-19 | 버그 | 광고 조건 | `site.ads.enabled` true + clientId만 입력(슬롯 빈 값)으로 빌드 | S-01·S-05에 광고 DOM 없음, `out/ads.txt` 생성, S-02~S-04 광고 없음 | CORE C-25, T-07 |
| Q-20 | 버그 | 키 노출 | secrets에 임의 문자열 입력 후 그 값을 `src/`에서 import하는 코드 추가 시도 | lint 실패, 빌드 시 check-secrets FAIL | CORE C-26, CONVENTIONS 레이어 규칙 |

## §2 코딩 후 추가 항목
| ID | 분야 | 대상 | 확인 방법 | 기대 결과 | 근거 문서·절 |
|---|---|---|---|---|---|
| Q-21 | 버그 | 헤더 `#header-status` 포털 | `/daily`·`/infinite` 진입 및 홈 왕복 이동 | 헤더 우측에 데일리 회차·진행률 및 연속·최고 기록이 중복이나 잔상 없이 표시되고, 홈으로 이동하면 비워짐 | PROGRESS 가정 T-01, DESIGN §4.0 |
| Q-22 | 버그 | 데일리 미완료 이어하기 | `/daily`에서 3문제 풀이 후 새로고침 | 같은 `poolVersion`이면 4/10부터 이어서 시작하고 진행 막대 1~3칸 색이 저장 답안과 일치 | CORE C-16, T-11 |
| Q-23 | CTA | 가이드 모바일 재노출 바 | 375px `/guide/data-source`에서 800px 이상 스크롤 | 본문 CTA 블록이 화면 밖일 때만 하단 고정 바 표시, 본문 CTA가 뷰포트에 들어오면 숨김 | DESIGN §6 S-06, T-14 |
| Q-24 | 성장 | OG·아이콘 파일·404 응답 | `out/og/*.png` 5종·`out/favicon.ico`·`out/icon.svg` 존재 및 `/no-such-page`·`/en` 요청 확인 | 모든 이미지·아이콘 파일 존재, 두 미존재 경로 모두 404 및 noindex | DESIGN §2, T-17, T-18 |
| Q-25 | 버그 | 샘플→실데이터 전환 | 출시 전 `main`에서 `npm run update` 실행 후 `stats.json`·`pool.json` 확인 | 5개 구 샘플에서 수도권 전체(≥5,000건·커버리지 ≥90%)로 갱신되고 검증 통과 | SPEC R-12, CORE C-23 |

## §3 1차 QA 결과

### 검증 명령
- `npm run typecheck && npm run lint && npm test && npm run build`: **통과** (종료 코드 0 / `typecheck` 오류 0, `lint` 오류 0·경고 6[`.wrangler/tmp/*`], `test` 21파일 86건 통과, `build` 10페이지 생성·`[secrets] OK`)
- `npm run qa:screens` · `npm run test:e2e`: **통과** (스크린샷 24장 생성, E2E 33건 통과)
- 색인 URL 현황: 색인 대상 **3개**(`/`, `/daily`, `/infinite`), noindex **4개**(`/guide/data-source`, `/guide/median-price`, `/privacy`, `/404`[없는 경로])

### 점검 결과
| 점검 ID(§1·§2·가정·막힘·G-ID·CT-ID) | 결과(통과/실패/사람 확인 필요) | 관찰 내용 한 줄 |
|---|---|---|
| Q-01 | 통과 | `/daily` 10문제 완주→"결과 보기"→S-05 "10문제 중 7개", 격자 10칸, 진행 막대 색이 답안과 일치함 |
| Q-02 | 통과 | 격리된 두 브라우저 프로필에서 같은 날 `/daily` 첫 3문제 단지명 쌍이 완전히 동일함 |
| Q-03 | 통과 | `/infinite` 오답 시 "결과 보기"→"연속 2개 정답", `pd:v1:best:infinite`=`2` 일치 및 재도전 시 연속 0 초기화 확인 |
| Q-04 | 실패 | 375px 스크롤 >600px 시 히어로 1차 화면 밖·고정 바 폭 100% 정상이나, 768px 고정 바 버튼이 240px로 축소됨(QA-02) |
| Q-05 | 통과 | Web Share 미지원 환경에서 복사·저장 버튼 노출, 복사 텍스트에 "억"·"만원" 없음, PNG 다운로드 정상 동작 |
| Q-06 | 통과 | `/data/pool.json` 차단 시 IMG-08·"문제를 불러오지 못했어요" 노출, "다시 시도하기" 클릭 후 정상 복구 |
| Q-07 | 실패 | 375px 카드 2열 유지·가로 스크롤 없음(`375===375`)이나, S-04 하단 고정 바(`y:587~667`)가 판정 행(`y:556~632`) 하단을 가림(QA-01) |
| Q-08 | 통과 | S-01·S-02·S-03 빌드 HTML title·description·og:image(1200×630 존재)·파비콘·아이콘·manifest link 모두 일치 |
| Q-09 | 통과 | `S-01-1440.png` IMG-03 우측 4:3 배치, `S-05-375.png` IMG-11 180×120 및 전 화면 플레이스홀더 IMG-ID 표기 확인 |
| Q-10 | 실패 | `globals.css` `.prose-guide h2` 여백·데스크톱 크기 불일치, `Header.tsx` 워드마크 및 일부 컴포넌트 임의 `px` 유틸리티 혼용(QA-05) |
| Q-11 | 통과 | `out/sitemap.xml`에 `/`, `/daily`, `/infinite` 3개만 포함, `out/robots.txt` 4줄(`Allow: /`, `Disallow: /data/`, Sitemap) 일치 |
| Q-12 | 통과 | `/daily` 빌드 HTML canonical이 `https://price-duel.pages.dev/daily`(쿼리·끝 슬래시 없음)로 출력됨 |
| Q-13 | 통과 | `/guide/data-source`·`median-price` 모두 `noindex, follow`, sitemap 미포함, 푸터·S-01·S-04·관련 글 링크 미노출 |
| Q-14 | 통과 | `tests/unit/lib/index-policy.test.ts` 12건 통과(기준 미달 4건·hasQuery·isEmptyResult·isFilterCombo·isInternalSearch 전부 false) |
| Q-15 | 통과 | S-01 데이터 요약·S-04 출처 행·푸터 모두 출처와 `stats.generatedAt` 날짜(`2026-11-25`) 일치(S-06 문구 차이는 QA-06) |
| Q-16 | 사람 확인 필요 | `track()`·`canSend()` 로컬호스트 차단 구현 확인; 출시 전 `ga4Id` 입력 후 비-localhost 도메인 GA4 DebugView 확인 필요 |
| Q-17 | 사람 확인 필요 | 현재 `contactEmail` 빈 값으로 "문의처는 준비 중이에요"·빌드 경고 출력 확인; 출시 전 사람이 이메일 입력 후 `mailto:` 확인 필요 |
| Q-18 | 통과 | 색인 대상 3페이지 `hreflang="ko"`·`x-default`가 canonical과 동일, noindex 페이지 미출력, `/en` 요청 HTTP 404 |
| Q-19 | 통과 | `tests/unit/lib/ads.test.tsx` 3건 통과, 현재 `ads.enabled:false`로 광고 DOM·`out/ads.txt` 미생성, S-02~S-04 광고 없음 |
| Q-20 | 통과 | `eslint.config.mjs` `no-restricted-imports` 및 `scripts/check-secrets.ts`(`out/` 전 파일 검사 `[secrets] OK`) 구현 확인 |
| Q-21 | 통과 | `/daily`·`/infinite` 진입 및 홈 왕복 이동 시 `#header-status` 포털 중복·잔상 없이 표시 및 비워짐 확인 |
| Q-22 | 통과 | `/daily` 3문제 풀이 후 새로고침 시 4/10부터 이어하기 및 진행 막대 1~3칸 색 복원 일치 |
| Q-23 | 통과 | 375px `/guide/data-source`·`median-price`에서 본문 CTA 뷰포트 교차 시 고정 바 미표시 및 Observer 동작 확인 |
| Q-24 | 통과 | `out/og/*.png` 5종(1200×630)·`out/icons/*.png`·`favicon.ico`(3크기)·`icon.svg` 존재, `/no-such-page`·`/en` 모두 404·noindex |
| Q-25 | 사람 확인 필요 | 현재 샘플 데이터(5개 구, 369건) 상태; 출시 전 사람이 `main`에서 `npm run update` 실행 후 실데이터(≥5,000건·커버리지 ≥90%) 확인 필요 |
| 가정-T01-1 | 통과 | `#header-status` React portal 방식이 DESIGN §4.0·CONVENTIONS(Context 금지)·AGENTS(공통 레이어 불변)와 충돌 없음 |
| 가정-T01-2 | 통과 | `layout.tsx`(서버)→`Footer.tsx`(클라이언트) props 전달이 CONVENTIONS 폴더 구조·SSR 요구와 충돌 없음 |
| 가정-T03 | 통과 | `연동결과-부동산실거래/data/005_apt_trade_dev.json` 픽스처 배치가 AGENTS·SPEC 지시와 일치 |
| 가정-T11 | 통과 | `src/features/game/view/react-dom.d.ts` 최소 타입 선언이 AGENTS(새 라이브러리 금지)와 충돌 없음 |
| 막힘 | 통과 | PROGRESS.md 막힘 절 0건, T-01~T-18 전 티켓 완료 |
| G-01 | 통과 | 전 페이지 title·description·canonical·OG·JSON-LD(`WebSite`, `WebApplication`, `Article`, `BreadcrumbList`, `Dataset`) 일치(GROWTH.md 키명 오류 수정) |
| G-02 | 통과 | `index-policy.ts` 단일 판정, 색인 대상 3건·noindex 4건, 규칙 위반·금지 채널 페이지 0건 |
| G-03 | 통과 | `generateStaticParams`·`dynamicParams=false`, 토큰 치환 및 미등록·인라인 토큰 throw 검증 완료(GROWTH.md `{{cta:*}}` 보완) |
| G-04 | 통과 | S-01·S-04·S-05·S-06·푸터 내부 링크 조건부 렌더 및 `internal_link_click` 전송 확인(GROWTH.md S-01 동작 보완) |
| G-05 | 실패 | S-01·S-04·푸터는 일치하나 S-06 메타 행에서 "출처 "·"데이터 " 표기가 누락됨(QA-06; GROWTH.md 문구 충돌 수정) |
| G-06 | 실패 | 공유 텍스트·이미지 가격 미포함·UTM URL·폴백 동작 정상이나 `share-image.ts` 문구 하드코딩(QA-03) 및 S-05 768px 이상 버튼 폭 미적용(QA-02) |
| G-07 | 통과 | S-05 "내일 0시에 새 10문제", S-01 "오늘 완료 · {n}/10" 배지, S-02 재방문 시 저장된 S-05 즉시 표시 확인 |
| CT-01 | 통과 | `/guide/data-source` `filterFunnel`·`pairBands` 표·CTA 2개 정상 렌더, `reviewed:false`로 noindex·미링크 유지(GROWTH.md KW-04 H1 조정) |
| CT-02 | 통과 | `/guide/median-price` `bySgg`(법정동코드순·30건 미만 제외 경고)·`byArea`·`byAge` 표·`Dataset` JSON-LD 정상 렌더, noindex·미링크 유지(GROWTH.md KW-05·내부 링크 조정) |
| GROWTH-§5 | 실패 | 로케일 포맷·hreflang·`/en` 404·자동 리다이렉트 없음은 통과하나 `share-image.ts`(QA-03)·S-06 브레드크럼 `aria-label`(QA-06)에 문구 하드코딩 존재 |
| GROWTH-§6 | 통과 | 10종 이벤트 이름·파라미터가 `track.ts`와 호출부에서 일치하고 개인정보 파라미터 없음(GROWTH.md `cta_click` S-08 보완) |

### 개선 목록
| QA-ID | 분야 | 심각도 | 위치(S-ID·섹션·파일) | 현상 | 기대 | 근거(문서·절 또는 객관적 결함) |
|---|---|---|---|---|---|---|
| QA-01 | 디자인 | 중 | S-04 · 판정 행·진행 버튼 · `src/features/game/view/RevealPanel.tsx` | 375×667 뷰포트에서 카드 선택 직후 하단 고정 진행 바(`y:587~667px`)가 판정 행(`y:556~632px`) 하단 45px("오답이에요" 하반부와 "가격 차이" 행 전체)을 가린다(`qa/screens/S-04-375.png` 동일) | 375×667에서 카드 선택 직후 하단 고정 바가 판정 행과 출처 행을 가리지 않고 판정 문구와 가격 차이가 온전히 보여야 한다 | QA.md 심각도 기준(중: 하단 고정 바가 콘텐츠를 가림), QA.md Q-07, DESIGN.md §4 S-04 |
| QA-02 | CTA | 중 | S-05·S-04·S-01 · 768px 이상 버튼 폭·정렬 · `src/app/globals.css`, `ResultView.tsx`, `ShareBlock.tsx`, `RevealPanel.tsx`, `StickyCtaBar.tsx` | `globals.css`의 `.btn-primary`·`.btn-secondary`가 `@layer` 밖에 선언되어 768px 이상에서 `width: auto; min-width: 240px`가 폭 유틸리티를 덮어쓴다. 그 결과 768px·1440px에서 S-05 1차가 560px 대신 240px로 축소되고 2차가 240px로 좌측 정렬되며(`S-05-768.png`, `S-05-1440.png`), S-04 데스크톱 버튼이 320px 대신 240px, S-01 768px 재노출 바 버튼이 폭 100% 대신 240px로 표시된다 | 768px 이상에서 S-05 1차·2차 CTA 버튼은 결과 영역 폭 100%(560px)로 중앙 정렬되고, S-04 데스크톱 진행 버튼은 중앙 폭 320px, S-01 768px 재노출 바 버튼은 폭 100%로 표시되어야 한다 | DESIGN.md §4 S-05(1차·2차 폭 100%), DESIGN.md §4 S-04(데스크톱 폭 320px), DESIGN.md §6 S-01(768 재노출 바 폭 100%) |
| QA-03 | 성장 | 중 | S-05 · 공유 이미지 · `src/features/share/logic/share-image.ts` | 공유 이미지 캔버스 문구("집값대결", "데일리", "무한 모드", "10문제 중 …개", "연속 …개 정답", "최고 연속 …개", "최고 기록 …개") 5곳이 `t()` 대신 파일에 직접 하드코딩되어 있다 | 공유 이미지에 그려지는 모든 화면 문구를 `src/messages/ko.json` 키로 `t()`에서 조회해 출력해야 한다 | GROWTH.md §5(화면 문구 하드코딩 금지), CONVENTIONS.md 다국어, AGENTS.md 성장 규칙 |
| QA-04 | 디자인 | 하 | S-04 · 진행 버튼 자동 포커스 · `src/features/game/view/RevealPanel.tsx` | 1440×900에서 카드 선택 시 진행 버튼 자동 포커스가 페이지 스크롤(`scrollY=257px`)을 유발해 두 카드 상단 정보(단지명·면적 등)가 sticky 헤더 아래로 가려진다(`S-04-1440.png` 동일) | 공개 직후 진행 버튼에 키보드 포커스는 유지하되, 두 카드의 정보와 공개 가격이 헤더에 가려지지 않는 스크롤 상태를 유지해야 한다 | DESIGN.md §4 S-04(카드 영역 그대로 유지·공개 후 진행 버튼 자동 포커스) |
| QA-05 | 디자인 | 하 | 전 화면 · 디자인 토큰 준수 · `src/app/globals.css`, `src/components/Header.tsx`, `src/components/DataSource.tsx`, `src/features/` | `.prose-guide h2` 상단 여백이 `--space-12` 대신 `--space-10`이고 768px 이상 `h2`/`h3` 데스크톱 크기가 누락되었으며, `Header.tsx` 워드마크가 모바일 `h4`(15/22) 대신 17/24 고정값을 쓰고 여러 컴포넌트에서 `.type-small` 대신 임의 `px` 유틸리티(`text-[13px]` 등)를 반복 사용한다 | `.prose-guide` `h2`·`h3`가 DESIGN.md §3·§4 S-06 크기·여백(`--space-12`)과 일치하고, 헤더 워드마크와 보조 텍스트가 정의된 토큰·타이포 클래스를 사용해 불필요한 임의 `px` 선언이 없어야 한다 | DESIGN.md §3·§4.0·§4 S-06, CONVENTIONS.md 디자인 값, QA.md Q-10 |
| QA-06 | 성장 | 하 | S-06 · 상단 메타 행·브레드크럼 · `src/messages/ko.json`, `src/app/guide/[slug]/page.tsx` | S-06 상단 메타 행이 `"국토교통부 아파트 매매 실거래 자료 · 갱신 {date}"`로 출력되어 `"출처 "`와 `"데이터 "`가 빠졌고, 브레드크럼 `<nav>`의 `aria-label="breadcrumb"`이 메시지 파일 대신 영문 하드코딩되어 있다 | S-06 메타 행이 `"출처 국토교통부 아파트 매매 실거래 자료 · 데이터 갱신 {generatedAt} · 글 수정 {updatedAt}"` 형식으로 표시되고, 브레드크럼 `aria-label`도 메시지 파일에서 조회해야 한다 | DESIGN.md §4 S-06(메타 행 카피), GROWTH.md §5(화면 문구 하드코딩 금지) |
| QA-07 | 버그 | 하 | 개발·검증 환경 · `eslint.config.mjs`, `.gitignore` | `npm run preview`·E2E 실행 후 생성되는 `.wrangler/` 디렉터리가 ESLint 무시 목록과 `.gitignore`에서 빠져 `npm run lint` 시 `.wrangler/tmp/*` 경고 6건이 발생하고 미추적 폴더로 남는다 | `.wrangler/`가 ESLint 및 git 무시 목록에 포함되어 `npm run lint`가 오류·경고 0건으로 통과해야 한다 | 객관적 결함(`npm run lint` 경고 6건), TICKETS.md T-01 검증 기준 |

## §4 수정 결과

### QA 항목 처리
| QA-ID | 상태(완료/보류/실패) | 변경 파일 | 커밋 | 비고(보류·실패 사유, 영향 화면) |
|---|---|---|---|---|
| QA-01 | 완료 | `src/features/game/view/RevealPanel.tsx`, `tests/unit/features/reveal-panel.test.tsx` | `1e20c0e` | S-04 모바일 고정 바 겹침 시 자동 스크롤 보정; 영향 화면: S-02, S-03, S-04 |
| QA-02 | 완료 | `src/app/globals.css` | `c52a462` | 공통 레이어 수정(`src/app/globals.css` 버튼 `@layer components`); 영향 화면: S-01, S-02, S-03, S-04, S-05, S-06, S-07, S-08 |
| QA-03 | 완료 | `src/features/share/logic/share-image.ts`, `src/messages/ko.json` | `b8f1ba1` | 공유 이미지 캔버스 문구 전체 `t()` 조회 전환; 영향 화면: S-05 |
| QA-04 | 완료 | `src/features/game/view/RevealPanel.tsx`, `tests/unit/features/reveal-panel.test.tsx` | `cb71edd` | `focus({ preventScroll: true })`로 데스크톱 자동 스크롤 방지; 영향 화면: S-02, S-03, S-04 |
| QA-05 | 완료 | `src/app/globals.css`, `src/components/Header.tsx`, `src/components/DataSource.tsx`, `src/features/game/view/QuestionCard.tsx`, `src/features/game/view/GameArena.tsx`, `src/features/game/view/ResultView.tsx`, `src/features/landing/view/HeroSection.tsx`, `src/features/guide/view/DataTable.tsx` | `626909e` | 공통 레이어 수정(`src/app/globals.css`, `src/components/Header.tsx`, `src/components/DataSource.tsx`); 영향 화면: S-01, S-02, S-03, S-04, S-05, S-06, S-07, S-08 |
| QA-06 | 완료 | `src/messages/ko.json`, `src/app/guide/[slug]/page.tsx` | `be32eda` | S-06 메타 행 출처·데이터 표기 일치 및 브레드크럼 `aria-label` 메시지 조회; 영향 화면: S-06 |
| QA-07 | 완료 | `eslint.config.mjs`, `.gitignore` | `09cbcbc` | `.wrangler/` 무시 목록 추가(`npm run lint` 오류 0·경고 0); 영향 화면: 없음(개발·검증 환경) |

### GROWTH 반영 점검
누락 없음 — 점검한 절: §1~§6, §9
