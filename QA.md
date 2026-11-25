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

## §4 수정 결과
