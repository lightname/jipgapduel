<!-- DESIGN.md -->
# 집값대결 DESIGN.md

입력: 확정표(① D1~D7, ②, 변경분 승인), GROWTH.md(승인). 화면 ID는 SPEC 화면 목록과 같다(S-01~S-08).
카피는 전부 `src/messages/ko.json`으로 옮긴다. 아래 카피에서 `{중괄호}`는 데이터 값 자리이며, 형식은 확정표 ② 표기 형식을 따른다.

## §1 마케팅 전략

### 1.1 타겟 페르소나
**P1. 30대 직장인 (주 타겟)**
- 상황: 출퇴근 지하철·점심시간에 휴대폰으로 1~3분 사용. 동료·단톡방의 집값 대화를 듣기만 한다
- 해결하려는 문제: 수도권 아파트 가격 감이 없어 어느 정도가 비싼지 판단하지 못한다
- 지금 쓰는 대안: 부동산 앱에서 아는 단지 검색, 뉴스 기사(주로 최고가 거래), 단톡방 공유 기사
- 선택 기준: 바로 시작, 숫자 입력 없음, 가입 없음, 짧게 끝남
- 망설이는 이유: 설치·가입 요구 걱정, 데이터 신뢰 여부, 공부처럼 느껴짐

**P2. 20대 후반~30대 초반, 집 마련을 막연히 생각하는 사람**
- 상황: 언젠가 집을 사야 한다고 생각만 한다. 짬날 때 부동산 콘텐츠를 가볍게 본다
- 해결하려는 문제: 면적·연식·층·지역 중 무엇이 가격을 크게 가르는지 감각이 없다
- 지금 쓰는 대안: 유튜브 부동산 영상, 부동산 앱에서 단지를 목적 없이 눌러 보기
- 선택 기준: 틀려도 부담 없음, 틀린 이유를 바로 확인
- 망설이는 이유: 점수가 낮으면 창피함, 공유 시 관심 지역·재산이 드러날까 걱정

### 1.2 가치 제안
**"실제로 거래된 수도권 아파트 두 채 중 더 비싼 쪽을 탭 한 번으로 고르고, 바로 정답 가격을 확인한다."**
1. 카드 선택 → 즉시 공개 (S-02·S-03 → S-04): 숫자 입력 없이 고르면 두 거래의 가격, 차이 금액, 차이 비율이 나온다
2. 데일리 10문제 (S-02): 매일 전원이 같은 10문제. 쉬움 → 어려움 순서이며, 틀려도 10문제를 끝까지 푼다
3. 결과 공유 이미지 (S-05): 점수, 최고 연속, 정답 격자만 담고 가격은 숨긴다

### 1.3 차별점
| 지금 쓰는 대안 | 대안의 한계 | 이 서비스 |
|---|---|---|
| 부동산 앱 단지 검색 | 볼 대상을 직접 정해야 하고, 두 거래를 비교하려면 직접 오가야 한다 | 비교할 두 건이 이미 짝지어져 있다. 고르기만 한다 |
| 뉴스 기사 | 눈에 띄는 거래 위주라 평범한 가격대 감각이 생기지 않는다 | 필터를 통과한 일반 거래에서 출제한다(해제·직거래·이상치 제외) |
| 유튜브 부동산 콘텐츠 | 길고, 내가 판단하는 과정이 없다 | 짧고, 매 문제 내가 판단한 뒤 정답을 확인한다 |
| 숫자 입력형 가격 맞히기 | 가격을 입력해야 하고, 오차 계산이 부담스럽다 | 둘 중 하나만 고른다. 정답·오답이 명확하다 |

### 1.4 메시지 위계
| 순위 | 메시지 문장 | 배치 화면 |
|---|---|---|
| 1 | 둘 중 더 비싼 집은? | S-01 히어로, S-02·S-03 문제 상단 |
| 2 | 오늘의 10문제, 모두가 같은 문제를 풀어요 | S-01 데일리 CTA 영역, S-05 데일리 결과 |
| 3 | 실제 신고된 거래만 썼어요. 해제·직거래는 뺐어요 | S-01 데이터 요약, S-04 출처 한 줄, S-06 본문 |

### 1.5 전환 퍼널
| 단계 | 사용자 행동 | 화면 | 이탈 요인 | 이탈을 줄일 장치 |
|---|---|---|---|---|
| 1. 진입 | 공유 링크·검색으로 진입 | S-01, S-02 | 무슨 게임인지 모른다 | 공유 링크는 `/daily`로 직행해 첫 문제부터 보여줌. S-01 "가입 없이 바로 시작해요" |
| 2. 첫 선택 | 카드 하나를 누른다 | S-02, S-03 | 카드 정보 과다로 판단 피로, 로딩 실패 | 카드 정보 순서 고정(단지명 → 시군구·동 → 면적 → 층 → 건축연도 → 거래 연월 → 지도), 첫 3문제 easy, 실패 시 다시 시도 버튼 |
| 3. 정답 확인 | 가격·차이를 본다 | S-04 | 결과가 납득되지 않는다 | 두 가격·차이 금액·비율 표시, 출처 한 줄과 CT-01 링크 |
| 4. 반복 | 다음 문제로 | S-04 → S-02·S-03 | 다음 버튼을 못 찾음, 진행률을 모름 | 다음 버튼을 엄지 영역에 고정, 데일리 "3/10", 무한 현재 연속 표시 |
| 5. 완료 | 결과 확인 | S-05 | 낮은 점수에 실망 | 점수와 무관한 중립 문장, 무한 모드는 최고 기록 병기 |
| 6. 공유(주 전환) | 공유 버튼 | S-05 | 가격·지역 노출 걱정, 공유 수단 막힘 | 버튼 위 "가격은 공유되지 않아요", 미지원 시 텍스트 복사·이미지 저장 |
| 7. 재방문(보조) | 다음 날 재방문 | S-01, S-02 | 새 문제가 언제 나오는지 모름 | S-05 "내일 0시에 새 10문제", 같은 날 재진입 시 저장된 결과 표시 |
| 8. 추가 플레이 | 무한 모드로 이동 | S-05 → S-03 | 데일리 후 할 것이 없음 | 데일리 결과 2차 CTA로 무한 모드 연결 |

### 1.6 신뢰 장치
| 장치 | 내용 | 화면 |
|---|---|---|
| 데이터 출처 표기 | 국토교통부 아파트 매매 실거래 자료 | S-01, S-04, S-06, 푸터 |
| 데이터 범위 공개 | 기간, 출제 거래 건수, 시군구 수(빌드 시 삽입) | S-01 |
| 필터 기준 공개 | 해제·직거래·개인 외·토지임대부 제외, 같은 단지 최근 거래 대비 ±40% 이상치 제외 | S-06 |
| 정답 근거 즉시 공개 | 두 가격, 차이 금액, 차이 비율 | S-04 |
| 가입·결제 없음 | 로그인 없음, 무료, 기록은 브라우저에만 저장 | S-01, S-07 |
쓰지 않는 것: 이용 후기, 사용자 수, 보증, 사례.

### 1.7 톤앤매너 규칙
1. 해요체. 명령형("~하라")·반말 금지
2. 화면 UI 문장은 25자 이내. S-06 본문만 문장당 60자 이내
3. 버튼 문구는 "~하기"로 끝내고 10자 이내. 예외: 카드 선택 버튼(카드 자체), "다음 문제", "결과 보기"
4. 사용 금지: 투자, 저평가, 고평가, 급등, 폭락, 신고가, 오를, 떨어질, 추천 단지, 시세 예측
5. 전문용어(호가, 평단가, 전용률, 공급면적, 해제거래, 직거래, 갭)는 S-02~S-05에서 쓰지 않는다. S-06에서만 설명과 함께 쓴다
6. "실거래가"는 메타 title·description과 S-06에서만 쓴다. 게임 화면에서는 "실제 거래 가격"
7. 정답 공개는 수치만 보여준다. 단지 평가어("비싸다", "싸다", "가성비") 금지
8. 결과 문장은 점수를 평가하지 않는다("꽝", "문외한", "부동산 고수" 금지)
9. 숫자 표기는 확정표 ② 표기 형식을 따른다
10. 이모지는 공유 텍스트 격자(🟩🟥)에만 쓴다. 느낌표는 화면당 최대 1개
11. 지역명은 데이터 표기 그대로 쓴다. 지역 서열화 표현 금지

### 1.8 CTA 문구
| 화면 | 1차 CTA | 2차 CTA | 근거 |
|---|---|---|---|
| S-01 | 오늘의 10문제 풀기 | 무한 모드 하기 | 데일리는 공유 결과를 서로 비교할 수 있어 주 전환으로 이어진다. 무한은 체류용 |
| S-04 | 다음 문제 (마지막 문제·무한 오답 시 "결과 보기") | 없음 | 공개 직후 행동은 진행 하나뿐 |
| S-05 데일리 | 결과 공유하기 | 무한 모드로 더 풀기 | 공유가 주 전환. 오늘 남은 데일리가 없으므로 무한으로 체류 연장 |
| S-05 무한 | 기록 공유하기 | 다시 도전하기 | 오답 직후 재도전 의향이 높지만 성장 경로인 공유를 1차로 통일 |

## §2 브랜드
- 사이트명: 집값대결
- 영문 표기: JipgapDuel (로마자 Jipgap Daegyeol)
- 슬로건: 둘 중 더 비싼 집은?
- 로고 구성: 심볼(IMG-01) + 워드마크. 워드마크는 이미지가 아니라 HTML 텍스트 "집값대결"(Pretendard 800, `--color-text`)
- 로고 심볼 컨셉: 높이가 다른 아파트 동 두 개가 나란히 서 있고, 그 사이를 짧은 사선 하나가 가른다
  - 상징: 두 거래의 맞대결(나란한 두 동), 고르기(사선)
  - 색: 높은 동 `--color-primary`, 낮은 동 `--color-secondary`, 창문 격자 `--color-surface`
  - 형태: 사각형과 직선만 사용. 모서리 2px 라운드

**웹 아이콘(로고 심볼) 생성 프롬프트**
```
Subject: app icon symbol of two stylized apartment buildings standing side by side, the left one taller, separated by a short diagonal slash between them
Composition: centered, both buildings share one baseline, symbol fills 80% of a square canvas, equal padding
Shapes: rectangles and straight lines only, small grid of square windows, corners slightly rounded
Colors: taller building #2447D8, shorter building #C2410C, windows #FFFFFF, slash #17181C, transparent background
Style: flat vector, solid fills, no gradients, no shadows, crisp edges, readable at 32px
Negative: no text, no letters, no numbers, no watermark, no 3D, no perspective, no people
```

**파비콘 생성 프롬프트**
```
Subject: ultra-simplified favicon of two solid vertical bars of different heights side by side, left bar taller
Composition: centered on a square canvas, bars share one baseline, gap between bars equals one third of a bar width, symbol fills 90% of the canvas
Colors: taller bar #2447D8, shorter bar #C2410C, transparent background
Style: flat vector, solid fills only, no windows, no outlines, no detail smaller than 2px at 16px size
Negative: no text, no letters, no numbers, no gradients, no shadows, no thin lines, no watermark
```

**필요 파일 목록**
| 파일 | 경로 | 픽셀 크기 | 원본 | 용도 |
|---|---|---|---|---|
| logo-symbol.svg | public/images/logo-symbol.svg | viewBox 512×512 | IMG-01 | 헤더 로고, 공유 이미지, OG 합성 |
| favicon-symbol.svg | public/images/favicon-symbol.svg | viewBox 64×64 | IMG-02 | 파비콘 원본 |
| favicon.ico | public/favicon.ico | 16, 32, 48 포함 | IMG-02 | 브라우저 탭 |
| icon.svg | public/icon.svg | viewBox 64×64 | IMG-02 복사본 | `<link rel="icon" type="image/svg+xml">` |
| icon-192.png | public/icons/icon-192.png | 192×192 | IMG-01, 배경 #FFFFFF, 심볼 폭 70% | 웹 매니페스트 |
| icon-512.png | public/icons/icon-512.png | 512×512 | IMG-01, 배경 #FFFFFF, 심볼 폭 70% | 웹 매니페스트 |
| apple-touch-icon.png | public/apple-touch-icon.png | 180×180 | IMG-01, 배경 #FFFFFF, 심볼 폭 70% | iOS 홈 화면 |
| manifest.webmanifest | public/manifest.webmanifest | — | — | name "집값대결", short_name "집값대결", theme_color #2447D8, background_color #F6F5F1, icons 192/512. 서비스 워커 없음 |
| OG 기본 | public/og/S-01.png | 1200×630 | IMG-04 + 카피 합성 | 기본 OG(S-01·S-07·S-08) |
| OG 데일리 | public/og/S-02.png | 1200×630 | IMG-04 + 카피 합성 | S-02, 공유 링크 미리보기 |
| OG 무한 | public/og/S-03.png | 1200×630 | IMG-04 + 카피 합성 | S-03 |
| OG 가이드 | public/og/guide-data-source.png, public/og/guide-median-price.png | 1200×630 | IMG-04 + md title 합성 | S-06 |
| 이미지 매니페스트 | public/images/manifest.json | — | — | 확정표 ② 형식. IMG-01~IMG-14 전부 등록 |

OG 합성 규칙(`scripts/gen-og.ts`):
- 배경 `#F6F5F1`, IMG-04를 1200×630 전체에 깐다
- 텍스트는 좌측 64px부터 폭 600px 영역에 쓴다
  - 1행 IMG-01 56px + 워드마크 "집값대결" 32px/800
  - 2행 제목 56px/800/`#17181C`, 최대 2줄
  - 3행 보조 28px/500/`#5B5F6A`
- 화면별 제목/보조:

| OG 파일 | 제목 | 보조 |
|---|---|---|
| S-01 | 둘 중 더 비싼 집은? | 실제 거래된 아파트로 푸는 게임 |
| S-02 | 오늘의 10문제 | 모두가 같은 문제를 풀어요 |
| S-03 | 어느 아파트가 더 비쌀까? | 틀릴 때까지 계속 풀어요 |
| 가이드 | md `title` | 집값대결 가이드 |

## §3 디자인 시스템
`src/app/globals.css`의 `@theme`에 아래 이름·값 그대로 선언한다. 이 값 외의 색·크기를 쓰지 않는다. 확정표 ② "초기 토큰"을 이 값으로 교체한다.

### 색
| 토큰 | 값 | 용도 |
|---|---|---|
| --color-primary | #2447D8 | 1차 버튼, 링크, 강조 시군구 테두리 |
| --color-primary-hover | #1B37AC | 1차 버튼 hover, 링크 hover |
| --color-primary-soft | #E3E9FC | 강조 시군구 채움, 선택 카드 배경 틴트 |
| --color-secondary | #C2410C | 지도 점, VS 배지 배경, 심볼 보조색 |
| --color-text | #17181C | 본문·제목 |
| --color-text-muted | #5B5F6A | 보조 문구, 캡션 |
| --color-bg | #F6F5F1 | 페이지 배경 |
| --color-surface | #FFFFFF | 카드, 패널, 헤더 |
| --color-border | #E2E0DA | 카드 테두리, 구분선 |
| --color-map-land | #ECEAE4 | 미니맵 기본 시군구 채움 |
| --color-success | #15803D | 정답 표시, 정답 격자 |
| --color-success-soft | #EEF7F1 | 정답 판정 행 배경 |
| --color-warning | #B45309 | 데이터 경고 문구(사용처: S-06 표 주석) |
| --color-danger | #C62828 | 오답 표시, 오답 격자 |
| --color-danger-soft | #FBEDED | 오답 판정 행 배경 |
| --color-disabled-bg | #E4E3DE | 비활성 버튼 배경 |
| --color-disabled-text | #8A8E98 | 비활성 버튼 글자 |
| --color-focus | rgba(36,71,216,0.35) | 포커스 링 |

명도 대비(측정값):
- text/bg 16.26:1, text/surface 17.74:1
- text-muted/bg 5.85:1, text-muted/surface 6.38:1
- #FFFFFF/primary 7.08:1, #FFFFFF/secondary 5.18:1
- success/surface 5.02:1, danger/surface 5.62:1
- success/success-soft 4.59:1, danger/danger-soft 4.94:1

### 폰트
- family: `Pretendard Variable`. `next/font/local`로 `node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2`를 로드하고 weight 범위는 100~900
- fallback: `-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif`
- 가격·면적·점수 숫자: `font-variant-numeric: tabular-nums`
- `word-break: keep-all` 전역 적용

| 스타일 | 데스크톱(≥768) px / line-height / weight | 모바일(<768) |
|---|---|---|
| h1 | 40 / 52 / 800 | 30 / 40 / 800 |
| h2 | 28 / 38 / 700 | 24 / 32 / 700 |
| h3 | 20 / 28 / 700 | 18 / 26 / 700 |
| h4 | 17 / 24 / 700 | 15 / 22 / 700 |
| body | 16 / 26 / 400 | 16 / 26 / 400 |
| small | 13 / 20 / 500 | 13 / 20 / 500 |
| price (가격 공개 숫자) | 26 / 32 / 800 | 19 / 26 / 800 |
| score (결과 점수) | 48 / 56 / 800 | 40 / 48 / 800 |

### 여백·레이아웃
- 여백 스케일: --space-1 4px, --space-2 8px, --space-3 12px, --space-4 16px, --space-5 20px, --space-6 24px, --space-8 32px, --space-10 40px, --space-12 48px, --space-16 64px, --space-20 80px
- 섹션 간 여백: 데스크톱 --space-16, 모바일 --space-12
- 컨테이너 최대 폭: 일반 1120px, 게임 영역 880px, 본문(prose) 720px

### 라운드·그림자·테두리
- 라운드: --radius-sm 8px(배지·격자 칸), --radius-md 12px(버튼·입력), --radius-lg 20px(카드·패널), --radius-full 9999px(VS 배지, 진행 점)
- 그림자:
  - --shadow-card `0 1px 2px rgba(23,24,28,0.06), 0 4px 12px rgba(23,24,28,0.06)`
  - --shadow-raised `0 8px 24px rgba(23,24,28,0.10)`
  - --shadow-bar `0 -4px 16px rgba(23,24,28,0.08)`
- 테두리: --border-1 1px, --border-2 2px(선택·판정 카드)

### 버튼
| 종류 | 높이 | 패딩 | 배경 / 글자 / 테두리 | hover | disabled |
|---|---|---|---|---|---|
| btn-primary | 52px (모바일 56px) | 0 --space-6 | primary / #FFFFFF / 없음, h4 굵기 700·17px | primary-hover, --shadow-raised | disabled-bg / disabled-text, 커서 not-allowed |
| btn-secondary | 52px (모바일 56px) | 0 --space-6 | surface / primary / --border-1 primary | 배경 primary-soft | 배경 surface / disabled-text / --border-1 border |
| btn-text | 44px | 0 --space-2 | 투명 / primary / 없음, 15px·600 | 밑줄, 색 primary-hover | disabled-text |
- 공통: 라운드 --radius-md, 포커스 `outline: 3px solid var(--color-focus); outline-offset: 2px`
- 1차·2차 버튼은 모바일에서 폭 100%, 데스크톱 최소 폭 240px
- 아이콘이 붙는 버튼은 아이콘 20px, 글자와 간격 --space-2

### 브레이크포인트·그리드
| 지점 | 범위 | 열 | 거터 | 좌우 여백 |
|---|---|---|---|---|
| 375 기준 (기본) | <768px | 4 | 12px | 20px |
| 768 기준 (md) | 768~1439px | 8 | 24px | 32px |
| 1440 기준 (xl) | ≥1440px | 12 | 24px | auto(컨테이너 1120px 중앙) |
Tailwind 사용자 정의 breakpoint는 `md: 768px`, `xl: 1440px` 두 개만 쓴다.

### 아이콘·전환
- 아이콘: 선형, 24×24 그리드, stroke 1.75px, round cap·round join, 색 currentColor
  - `src/components/icons.tsx`에 인라인 SVG 컴포넌트로 직접 작성한다
  - 목록: Check, X, Share, Copy, Download, ArrowRight, Info, Home
- 전환 시간: --duration-fast 120ms(hover·press), --duration-base 200ms(공개 페이드·카드 상태), --duration-slow 320ms(하단 바 등장)
- easing: `cubic-bezier(0.2, 0, 0, 1)`
- `prefers-reduced-motion: reduce`이면 전부 0ms

## §4 화면별 상세 디자인

### §4.0 공통 요소
**헤더 (전 화면)**
- 높이 56px, 배경 surface, 하단 --border-1 border, 위치 sticky top 0
- 좌측: IMG-01 28×28 + 워드마크 "집값대결"(h4, 800). 클릭하면 `/`로 이동, aria-label "집값대결 홈"
- 우측: 화면별 상태 영역(S-02·S-03만 사용, 아래 정의). 그 외 화면은 비움. 내비게이션 메뉴 없음

**푸터 (전 화면, G-04·G-05)**
- 배경 bg, 상단 --border-1 border, 상하 패딩 --space-10, 컨테이너 1120px
- 1행(small, text-muted): "출처 국토교통부 아파트 매매 실거래 자료 · 데이터 갱신 {generatedAt YYYY-MM-DD}"
- 2행 링크(btn-text 15px, 가로 나열 후 줄바꿈 허용, 간격 --space-4): "홈" `/`, "오늘의 10문제" `/daily`, "무한 모드" `/infinite`, "데이터 출처와 제외 기준" `/guide/data-source`, "조건별 중간 가격" `/guide/median-price`, "개인정보처리방침" `/privacy`
  - `reviewed:false`인 가이드 링크는 렌더링하지 않는다
- 3행(small, text-muted): "© 집값대결 · 기록은 이 브라우저에만 저장돼요"

**광고 슬롯 (AdSlot)**
- `site.ads` 조건을 충족할 때만 렌더링한다
- 위에 라벨 "광고"(small, text-muted), 영역 최소 높이 280px, 좌우 중앙, 상하 여백 --space-8
- 조건 불충족 시 DOM 자체를 만들지 않는다(빈 공간 없음)
- 허용 위치는 S-01 landingBottom, S-05 resultBottom 두 곳뿐

**문제 카드 (Card) — S-02·S-03·S-04 공용**
- `<button>`, 배경 surface, --radius-lg, --shadow-card, --border-1 border, 패딩 --space-4(모바일 --space-3), 내부 세로 스택 간격 --space-2
- 요소 순서(위→아래, 고정):
  1. 단지명: h4, 2줄 말줄임
  2. 시군구·동: small, text-muted. 예 "서울 강남구 대치동"
  3. 정보 목록: body(모바일 14px/20px), 줄마다 하나씩
     - "전용 {84.97}㎡ ({25.7}평)"
     - "{12}층"
     - "{2004}년 준공"
     - "{2026}년 {10}월 거래"
  4. 미니맵: 폭 100%, 비율 4:3, 배경 bg, --radius-sm
  5. 가격 영역: 높이 56px(모바일 48px), 상단 --border-1 border
     - 공개 전: "?" (price 스타일, text-muted)
     - 공개 후: 가격 "{12억 3,000만원}" (price 스타일)
- aria-label: "{단지명}, {시군구·동}, 전용 {㎡}㎡, {층}층, {건축연도}년 준공, {연}년 {월}월 거래 선택"
- 미니맵(SVG, 데이터로 그림. IMG 아님):
  - 시군구 경로는 fill map-land, stroke surface 0.75px
  - 해당 시군구는 fill primary-soft, stroke primary 1.5px
  - 단지 위치는 원 r=5, fill secondary, stroke surface 2px
  - viewBox: 해당 시군구가 서울이면 서울 시군구 전체 bbox + 10% 여백, 아니면 수도권 전체 bbox + 5% 여백
  - aria-hidden="true"(위치는 텍스트로 이미 제공)
- 카드 두 장은 같은 높이(grid `align-items: stretch`)

### S-01 랜딩·모드 선택 (/)
- 목적: 퍼널 1단계(진입) → 2단계로 보낸다. 데일리 시작이 주 행동
- 섹션 순서:
  1. **히어로**
     - 레이아웃: xl·md는 2열(좌 텍스트 6/12, 우 이미지 6/12, 세로 중앙). 기본(375)은 1열 좌측 정렬이며 이미지는 CTA 아래
     - 요소·카피:
       - H1 "둘 중 더 비싼 집은?"
       - 서브(body, text-muted) "실제 거래된 아파트 두 채, 비싼 쪽을 골라요"
       - 메시지(small, text) "오늘의 10문제, 모두가 같은 문제를 풀어요"
       - btn-primary "오늘의 10문제 풀기"
       - 오늘 완료 시 버튼 오른쪽(모바일은 버튼 위)에 배지 "오늘 완료 · {8}/10"
         - small 600, 배경 success-soft, 글자 success, --radius-sm, 패딩 --space-1 --space-2
       - 보조(small, text-muted) "가입 없이 바로 시작해요"
       - btn-secondary "무한 모드 하기"
     - 배치: 1차·2차는 데스크톱 가로 나란히(간격 --space-3), 모바일 세로 스택(간격 --space-3)
     - 이미지: IMG-03, 데스크톱 우측 열 폭 100%(최대 560px) 세로 중앙. 모바일 CTA 아래 폭 100%, 최대 높이 220px
     - 토큰: --color-text, --color-text-muted, btn-primary, btn-secondary, --space-6, --space-12
  2. **게임 방법**
     - 레이아웃: 섹션 제목 + 3열 카드(md·xl 3열, 375 1열 세로)
     - 카드는 surface, --radius-lg, 패딩 --space-6, 이미지 위·텍스트 아래
     - 카피:
       - 제목(h2) "이렇게 풀어요"
       - 1: "카드 두 장 중 하나를 눌러요" / "숫자는 입력하지 않아요"
       - 2: "바로 두 가격과 차이가 나와요" / "틀려도 이유를 바로 알 수 있어요"
       - 3: "데일리는 10문제, 무한은 틀릴 때까지" / "최고 기록은 이 브라우저에 저장돼요"
     - 이미지: 1 IMG-05, 2 IMG-06, 3 IMG-07. 각 카드 상단 96×96, 좌측 정렬
     - 토큰: --color-surface, --radius-lg, --shadow-card, h3, body
  3. **데이터 요약 (G-05)**
     - 레이아웃: 섹션 제목 + 4칸 통계(xl·md 4열, 375 2×2), 아래 출처 행
     - 카피:
       - 제목(h2) "이 게임의 데이터"
       - 칸1 라벨 "거래 기간" / 값 "{2024년 11월} ~ {2026년 10월}"
       - 칸2 "출제 거래" / "{7,842}건"
       - 칸3 "지역" / "수도권 {78}개 시군구"
       - 칸4 "데이터 갱신" / "{2026-11-21}"
       - 출처 행(body) "실제 신고된 거래만 썼어요. 해제·직거래는 뺐어요"
       - 링크 btn-text "제외 기준 보기" → `/guide/data-source`(CT-01이 `reviewed:false`면 링크 숨김)
     - 값 스타일: h3 800 tabular-nums. 라벨: small text-muted
     - 이미지: 없음
     - 토큰: --color-surface, --radius-lg, --border-1, h3, small
  4. **광고 슬롯 landingBottom** (조건부)
  5. **푸터**
- 반응형:
  - 375: 1열, 히어로 상단 패딩 --space-8, H1 30px, 버튼 폭 100%, 게임 방법 1열, 통계 2×2
  - 768: 히어로 2열(텍스트 5/8, 이미지 3/8), 게임 방법 3열
  - 1440: 컨테이너 1120px, 히어로 6/12+6/12, 상단 패딩 --space-20
- 상태:
  - 로딩: 없음(전부 빌드 시 HTML)
  - 빈 상태: 없음
  - 에러: 없음(정적)
  - 오늘 완료 배지는 localStorage를 읽은 뒤 클라이언트에서 표시(배지 영역 높이를 미리 확보하지 않고 inline으로 등장)
- 인터랙션: 버튼 hover --duration-fast, 게임 방법 카드 hover 없음, 링크 hover 밑줄

### S-02 데일리 문제 화면 (/daily)
- 목적: 퍼널 2~4단계. 10문제를 끝까지 풀게 한다
- 섹션 순서:
  1. **헤더 상태 영역**: 우측에 "데일리 #{12}"(small, text-muted) + 진행 "{3}/10"(h4, tabular-nums)
  2. **진행 막대**
     - 헤더 아래 게임 컨테이너 폭, 10칸 가로 균등 분할, 칸 높이 6px, 간격 4px, --radius-full
     - 색: 미풀이 border, 정답 success, 오답 danger
     - aria-label "10문제 중 {3}문제 풀이"
  3. **질문**
     - 중앙 정렬 h2 "더 비싼 집을 골라요"
     - 아래 small text-muted "카드를 눌러 선택해요"(S-04 상태에서는 숨김)
  4. **카드 영역**
     - 2열 고정(모든 폭), 열 간격 --space-3(md 이상 --space-6), 게임 컨테이너 880px 중앙
     - 두 카드 사이 세로 중앙에 VS 배지: 원형 36px(md 이상 44px), 배경 secondary, 글자 "VS" #FFFFFF small 800, --shadow-card
     - VS 배지는 HTML 텍스트, aria-hidden
  5. **S-04 공개 패널 영역**(선택 후, S-04 정의)
  6. **푸터**
- 오늘 이미 완료한 경우: 1~5를 렌더링하지 않고 S-05 데일리 결과를 바로 표시한다
- 반응형:
  - 375: 카드 폭 (375−40−12)/2, 카드 패딩 --space-3, 정보 14px, h2 20px로 축소
  - 768: 카드 패딩 --space-4, 열 간격 --space-6
  - 1440: 게임 컨테이너 880px, 카드 패딩 --space-6
- 상태:
  - 로딩: 진행 막대 자리에 회색 막대 1개. 카드 자리에 스켈레톤 카드 2장(카드와 같은 크기, 내부에 border색 막대 4줄 + 4:3 사각형 + 가격 영역). opacity 0.6↔1, 1200ms 반복. reduced-motion이면 고정
  - 빈 상태: 출제 풀이 비어 있으면 에러와 같은 화면
  - 에러(pool 로드 실패):
    - 카드 영역 대신 중앙 정렬로 IMG-08 240×180, h3 "문제를 불러오지 못했어요", body text-muted "네트워크를 확인하고 다시 시도해 주세요", btn-primary "다시 시도하기"(재요청)
    - 이벤트 `pool_load_error`
    - 확정표 ② 에러 문구는 §1.7 규칙 1(해요체)에 맞춰 이 문구로 적용한다
- 인터랙션:
  - 카드 hover(포인터 기기만): --shadow-raised, translateY(−2px), --duration-fast
  - 카드 포커스: 포커스 링
  - 키보드 ←는 왼쪽 카드, →는 오른쪽 카드 선택
  - 누르는 동안 scale(0.98)
  - 선택 즉시 S-04로 전환(지연 없음)

### S-03 무한 모드 문제 화면 (/infinite)
- 목적: 퍼널 2~4단계. 오답 전까지 계속 풀게 한다
- 섹션 순서:
  1. **헤더 상태 영역**: 우측에 "연속 {5}"(h4, tabular-nums) + "최고 {12}"(small, text-muted)
  2. **질문**: h2 "더 비싼 집을 골라요", small text-muted "틀릴 때까지 계속 나와요"(S-04 상태에서는 숨김)
  3. **카드 영역**: S-02와 동일
  4. **S-04 공개 패널 영역**
  5. **푸터**
- 진행 막대: 없음(문제 수가 끝이 없음)
- 반응형: S-02와 동일
- 상태:
  - 로딩·빈 상태·에러: S-02와 동일(IMG-08, 같은 문구·버튼)
  - 최고 기록이 없으면 "최고 0"
- 인터랙션: S-02와 동일

### S-04 정답 공개 패널 (S-02·S-03 내부 상태)
- 목적: 퍼널 3단계. 결과의 근거를 보여 주고 다음 행동(4단계)으로 보낸다
- 섹션 순서:
  1. **카드 상태 변화**(카드 영역 그대로 유지)
     - 두 카드 가격 영역의 "?"가 가격으로 바뀐다(opacity 0→1, --duration-base)
     - 가격이 더 높은 카드 우측 상단에 배지 "정답": small 700, 배경 success, 글자 #FFFFFF, --radius-sm, 카드 모서리에서 --space-2 안쪽
     - 사용자가 고른 카드는 --border-2. 정답이면 success, 오답이면 danger
     - 고르지 않은 카드는 --border-1 border 유지
     - 두 카드 모두 비활성(재선택 불가), 커서 default
  2. **판정 행**
     - 카드 아래 --space-6, 게임 컨테이너 폭, 배경 정답 success-soft / 오답 danger-soft, --radius-lg, 패딩 --space-4
     - 좌: IMG-09(정답) 또는 IMG-10(오답) 48×48
     - 우 텍스트:
       - 1행 h3, 색 success 또는 danger: "정답이에요" / "오답이에요"
       - 2행 body: "가격 차이 {+2억 1,500만원} ({17.4}%)"
     - 판정 행에 `aria-live="polite"`
  3. **출처 행 (G-04)**
     - 판정 행 아래 --space-3, small text-muted "국토교통부 실거래 자료 · "
     - 링크 btn-text(small) "데이터 기준 보기" → `/guide/data-source`(CT-01이 미검수면 링크 없이 출처 문구만)
  4. **진행 버튼**
     - btn-primary "다음 문제"
     - 데일리 10번째 문제, 무한 모드 오답일 때는 "결과 보기"
     - 데스크톱(md 이상): 출처 행 아래 --space-6, 중앙, 폭 320px
     - 모바일(375): 하단 고정 바. 배경 surface, --shadow-bar, 패딩 --space-3 --space-5 + `env(safe-area-inset-bottom)`, 버튼 폭 100%. 아래에서 위로 translateY 100%→0, --duration-slow
     - 고정 바 높이만큼 페이지 하단 패딩을 추가한다
     - 공개 후 진행 버튼에 자동 포커스, Enter로 실행
- 반응형:
  - 375: 판정 행 패딩 --space-3, 아이콘 40×40, 진행 버튼은 고정 바
  - 768·1440: 인라인 버튼
- 상태: 로딩·빈·에러 없음(이미 로드된 데이터)
- 인터랙션:
  - 공개 전환 --duration-base
  - 진행 버튼 클릭 시 카드 영역 opacity 1→0(120ms) → 새 문제 렌더 → 0→1(--duration-base), 스크롤을 질문 위치로 이동
  - reduced-motion이면 즉시 교체

### S-05 결과·공유 (S-02·S-03 내부 상태)
- 목적: 퍼널 5~8단계. 공유(주 전환), 재방문 안내, 추가 플레이
- 레이아웃: 1열 중앙 정렬, 폭 최대 560px, 결과 카드는 surface, --radius-lg, --shadow-card, 패딩 --space-8(모바일 --space-6)
- 섹션 순서(데일리):
  1. **결과 카드**
     - IMG-11 상단 중앙 240×160(모바일 180×120)
     - h2 "오늘의 결과"
     - small text-muted "{2026년 11월 21일} · 데일리 #{12}"
     - 점수(score 스타일) "10문제 중 {8}개"
     - body "최고 연속 {5}개"
     - 정답 격자(아래 정의)
     - 메시지 body text-muted "오늘의 10문제, 모두가 같은 문제를 풀어요"
  2. **공유 블록 (G-06)**
     - 결과 카드 아래 --space-6
     - 보조(small, text-muted, 중앙) "가격은 공유되지 않아요"
     - btn-primary(아이콘 Share) "결과 공유하기", 폭 100%
     - Web Share 미지원이면 버튼을 누를 때 그 자리에 2개 버튼이 가로 나란히 나타난다(모바일은 세로)
       - btn-secondary(아이콘 Copy) "텍스트 복사하기"
       - btn-secondary(아이콘 Download) "이미지 저장하기"
     - 복사 성공 시 버튼 아래 small success "복사했어요"가 2초간 표시
  3. **재방문 안내 (G-07)**: small text-muted 중앙 "내일 0시에 새 10문제"
  4. **2차 CTA**: btn-secondary "무한 모드로 더 풀기" → `/infinite`, 폭 100%, 위 여백 --space-6
  5. **내부 링크 (G-04)**: btn-text "조건별 중간 가격 보기" → `/guide/median-price`, 중앙, 위 여백 --space-8(CT-02 미검수면 숨김)
  6. **광고 슬롯 resultBottom** (조건부)
  7. **푸터**
- 섹션 순서(무한):
  1. **결과 카드**
     - IMG-11
     - h2 "이번 기록"
     - 점수(score) "연속 {5}개 정답"
     - body "최고 기록 {12}개"
     - 이번 기록이 최고 기록을 넘으면 점수 위에 배지 "최고 기록 경신"(small 700, 배경 primary-soft, 글자 primary, --radius-sm)
     - 정답 격자
  2. **공유 블록**: 데일리와 같고, 1차 문구만 "기록 공유하기"
  3. **2차 CTA**: btn-secondary "다시 도전하기" → 같은 화면에서 새 판 시작
  4. **내부 링크**: 데일리와 동일
  5. **광고 슬롯 resultBottom** (조건부)
  6. **푸터**
- 정답 격자:
  - 칸 32×32(모바일 28×28), 간격 6px, --radius-sm, 한 줄 최대 10칸
  - 정답 칸: 배경 success, 아이콘 Check #FFFFFF 18px
  - 오답 칸: 배경 danger, 아이콘 X #FFFFFF 18px
  - 무한 모드는 최대 30칸. 31칸째부터는 마지막에 "+{n}"(small 700, text-muted) 칸 1개
  - aria-label "{8}개 정답, {2}개 오답"
- 공유 이미지(canvas 1080×1080 PNG):
  - 배경 #F6F5F1, 중앙 흰 카드(940×940, 라운드 40px)
  - 좌상단 IMG-01 96px + "집값대결" 56px/800
  - 다음 줄 "{2026.11.21} 데일리 #{12}" 36px/500 #5B5F6A
  - 점수 "10문제 중 8개" 88px/800 #17181C
  - "최고 연속 5개" 44px/600
  - 격자 칸 72px, 간격 12px, 색과 기호는 위 격자와 동일
  - 하단 "집값대결 · {SITE_URL 호스트}" 32px/500 #5B5F6A
  - 무한 모드는 점수 줄 "연속 5개 정답", 둘째 줄 "최고 기록 12개"
  - Pretendard 로드(`document.fonts.ready`) 후 그린다
- 반응형:
  - 375: 결과 카드 패딩 --space-6, score 40px, 버튼 폭 100%
  - 768·1440: 폭 560px 중앙
- 상태:
  - 로딩: 없음
  - 빈 상태: 없음
  - 에러: 공유 이미지 생성 실패 시 텍스트 공유만 진행하고, 공유 블록 아래 small text-muted "이미지를 만들지 못해 텍스트만 공유했어요"
- 인터랙션:
  - 결과 카드 등장 opacity 0→1 + translateY(8px→0), --duration-slow
  - 격자 칸 등장 애니메이션 없음
  - 버튼 hover --duration-fast

### S-06 가이드 (/guide/{slug})
- 목적: 퍼널 1단계(검색 진입) → 2단계(게임 시작)로 보낸다
- 인스턴스: `/guide/data-source`(CT-01), `/guide/median-price`(CT-02)
- 섹션 순서:
  1. **브레드크럼**: small text-muted "홈 › {md title}", "홈"은 `/` 링크. JSON-LD BreadcrumbList 2단계
  2. **제목 영역**
     - prose 720px 좌측 정렬
     - H1 = md `title`
     - 메타 행(small, text-muted) "출처 국토교통부 아파트 매매 실거래 자료 · 데이터 갱신 {generatedAt} · 글 수정 {updatedAt}"
  3. **헤더 이미지**: IMG-12, prose 폭 100%, 16:9, --radius-lg, 제목 영역 아래 --space-6
  4. **본문 (G-03)**
     - prose 720px
     - h2 h2 스타일, 위 여백 --space-12
     - h3 h3 스타일, 위 여백 --space-8
     - 문단 body, 아래 여백 --space-4
     - 목록 들여쓰기 --space-6
     - 링크 primary 밑줄
  5. **데이터 표 (`{{table:*}}`)**
     - 폭 100%, 가로 스크롤 컨테이너(모바일), --border-1 border, --radius-md
     - 헤더 행 배경 bg, small 700
     - 행 높이 44px, 셀 패딩 --space-3
     - 숫자 열 우측 정렬, tabular-nums, 홀수 행 surface / 짝수 행 bg
     - 표 아래 캡션 small text-muted "출처 국토교통부 아파트 매매 실거래 자료 · 기간 {period} · 필터 통과 거래 기준"
     - bySgg 표 캡션에 color warning 한 줄 "거래 30건 미만 시군구는 표에서 뺐어요"
  6. **본문 CTA 블록 (`{{cta:primary}}`, `{{cta:secondary}}`)**
     - G-03 토큰 목록에 포함한다. 알 수 없는 토큰은 빌드 실패
     - 블록: 배경 primary-soft, --radius-lg, 패딩 --space-6, 좌측 정렬
     - `cta:primary`: h3 "둘 중 더 비싼 집은?" + btn-primary "오늘의 10문제 풀기" → `/daily` + 아래 small text-muted "가입 없이 바로 시작해요"
     - `cta:secondary`: h3 "틀릴 때까지 풀어 보세요" + btn-secondary "무한 모드 하기" → `/infinite`
     - 배치: CT-01 = 단계별 건수 표 아래·본문 끝에 primary. CT-02 = 시군구 표 아래 primary, 본문 끝 secondary(본문 md에 토큰으로 위치 지정)
  7. **관련 글 (G-04)**
     - 본문 아래 --space-12
     - h3 "관련 글" + 카드 1개(surface, --radius-lg, --shadow-card, 패딩 --space-6): 상대 CT의 h4 title + small text-muted description + ArrowRight 아이콘
     - 상대 CT가 미검수면 섹션 전체를 숨긴다
  8. **푸터**
- 반응형:
  - 375: 좌우 여백 20px, H1 30px, 표 가로 스크롤(첫 열 sticky left)
  - 768: prose 720px 중앙
  - 1440: prose 720px 중앙, 상단 패딩 --space-16
- 상태:
  - 로딩: 없음(SSG)
  - 빈 상태: md 파일 없는 slug는 S-08(404)
  - 에러: stats 값이 없는 토큰은 빌드 실패(화면 에러 상태 없음)
- 인터랙션: 링크 hover 색 primary-hover, 관련 글 카드 hover --shadow-raised --duration-fast

### S-07 개인정보처리방침 (/privacy)
- 목적: 신뢰 장치(GA4·광고 쿠키 고지). 퍼널 단계 밖, noindex
- 섹션 순서:
  1. **제목 영역**: prose 720px, IMG-13 120×90 좌측 정렬, 아래 H1 "개인정보처리방침", small text-muted "시행일 {site.privacyEffectiveDate}"
  2. **본문**(각 h2 + 문단 body):
     - h2 "수집하지 않는 정보" / "회원가입과 로그인이 없어요. 이름·연락처를 받지 않아요."
     - h2 "브라우저에만 저장하는 정보" / "게임 기록과 최고 기록은 이 브라우저에만 저장돼요. 서버로 보내지 않아요. 브라우저 데이터를 지우면 함께 지워져요."
     - h2 "방문 분석" / "Google 애널리틱스로 방문 페이지, 기기·브라우저 정보, 버튼 사용 기록을 모아요. 서비스 개선에만 써요."
     - h2 "광고" / "광고가 켜져 있으면 Google 애드센스가 쿠키를 쓸 수 있어요. 맞춤 광고는 Google 광고 설정에서 끌 수 있어요." (`site.ads.enabled`가 false면 이 절을 렌더링하지 않는다)
     - h2 "쿠키 거부 방법" / "브라우저 설정에서 쿠키 저장을 거부할 수 있어요. 거부해도 게임은 그대로 쓸 수 있어요."
     - h2 "문의" / "개인정보 관련 문의: {site.contactEmail}"
  3. **푸터**
- `site.privacyEffectiveDate`, `site.contactEmail`은 config.ts 키다(문서 밖 보고 참조). 법적 문구는 사람이 검토한다
- 반응형: S-06 prose 규칙과 동일
- 상태: 로딩·빈·에러 없음(정적)
- 인터랙션: 링크 hover만

### S-08 404 (모든 없는 경로)
- 목적: 이탈 직전 사용자를 퍼널 2단계로 되돌린다
- 섹션 순서:
  1. **본문**
     - 1열 중앙 정렬, 폭 최대 480px, 상하 패딩 --space-20(모바일 --space-12)
     - IMG-14 320×240(모바일 240×180)
     - H1(h2 스타일) "페이지를 찾을 수 없어요"
     - body text-muted "주소가 바뀌었거나 없는 페이지예요"
     - btn-primary "오늘의 10문제 풀기" → `/daily`
     - btn-text(아이콘 Home) "홈으로 가기" → `/`
  2. **푸터**
- 반응형: 375 버튼 폭 100%, 768 이상 버튼 최소 폭 240px 중앙
- 상태: 해당 없음(정적)
- 인터랙션: 버튼 hover만

## §5 이미지 목록
공통 스타일 앵커: `flat vector illustration, limited palette of #2447D8, #C2410C, #E3E9FC, #F6F5F1 and #17181C, simple geometric apartment buildings, clean 2px outlines, rounded corners, generous negative space, no text, no letters, no numbers, no watermark`

공통 규칙:
- 스타일은 일러스트 하나로 통일하고 사진은 쓰지 않는다
- 이미지 안에 글자·숫자를 넣지 않는다
- 형식은 확정표 ②대로 SVG(아이콘·일러스트), OG는 PNG(합성 산출물)
- 모든 IMG는 `public/images/manifest.json`에 등록한다

### IMG-01 로고 심볼
- 파일 경로: public/images/logo-symbol.svg
- 적용 위치:
  - 전 화면 헤더 좌측
  - S-05 공유 이미지 좌상단
  - OG 합성(public/og/*.png) 1행
  - icon-192/512, apple-touch-icon 원본
- 역할: 로고
- 크기: viewBox 512×512 (1:1)
- 표시 방식: `<img>` 고정 크기(28×28 등), object-fit contain, 숨김 없음
- alt: 헤더에서는 "" (워드마크 텍스트가 이름을 제공)
- 생성 프롬프트: §2 웹 아이콘 프롬프트 + 공통 스타일 앵커
- 네거티브: no text, no letters, no numbers, no gradients, no shadows, no 3D, no people

### IMG-02 파비콘 심볼
- 파일 경로: public/images/favicon-symbol.svg
- 적용 위치: public/favicon.ico, public/icon.svg 원본
- 역할: 파비콘
- 크기: viewBox 64×64 (1:1)
- 표시 방식: 브라우저 탭(16/32/48)
- alt: 해당 없음(link 아이콘)
- 생성 프롬프트: §2 파비콘 프롬프트 + 공통 스타일 앵커
- 네거티브: no text, no letters, no windows, no thin lines, no gradients, no shadows

### IMG-03 히어로 맞대결
- 파일 경로: public/images/hero-duel.svg
- 적용 위치: S-01 히어로 우측 열 세로 중앙(데스크톱) / CTA 아래(모바일)
- 역할: 히어로
- 크기: viewBox 1120×840 (4:3, 표시 최대 560px의 2배)
- 표시 방식: object-fit contain, 모바일 최대 높이 220px로 축소(크롭 없음)
- alt: "높이가 다른 아파트 두 동이 마주 보고 있는 그림"
- 생성 프롬프트: Subject: two stylized apartment towers of different heights facing each other on the left and right, each standing on a rounded rectangular card, a small location pin floating above each tower, a short diagonal slash between them / Composition: symmetrical, towers occupy the lower 70%, open sky above / Viewpoint: straight-on front view, no perspective / Background: plain #F6F5F1 with two faint rounded shapes in #E3E9FC / Mood: playful, calm, game-like + 공통 스타일 앵커
- 네거티브: no text, no numbers, no price tags, no money symbols, no people, no brand logos, no real building likeness

### IMG-04 OG 배경
- 파일 경로: public/images/og-base.svg
- 적용 위치:
  - public/og/S-01.png (S-01, S-07, S-08 기본 OG)
  - public/og/S-02.png (S-02, 공유 링크)
  - public/og/S-03.png (S-03)
  - public/og/guide-data-source.png, public/og/guide-median-price.png (S-06)
- 역할: OG
- 크기: viewBox 1200×630 (1.91:1)
- 표시 방식: OG 합성 시 전체 배경. 일러스트는 우측 45% 안에만 그리고, 좌측 55%는 텍스트 자리로 비운다
- alt: 해당 없음(OG). `og:image:alt`는 OG 제목 카피와 같다
- 생성 프롬프트: Subject: two stylized apartment towers of different heights side by side with a short diagonal slash between them, a few small rounded cards floating around / Composition: all elements inside the right 45% of the canvas, left 55% completely empty / Viewpoint: straight-on front view / Background: plain #F6F5F1 / Mood: bright, simple, inviting + 공통 스타일 앵커
- 네거티브: no text, no numbers, no elements in the left half, no people, no brand logos, no photo

### IMG-05 게임 방법 1 (고르기)
- 파일 경로: public/images/step-pick.svg
- 적용 위치: S-01 게임 방법 카드 1 상단 좌측
- 역할: 섹션 설명
- 크기: viewBox 192×192 (1:1, 표시 96px의 2배)
- 표시 방식: object-fit contain, 숨김 없음
- alt: ""(장식, 텍스트가 설명)
- 생성 프롬프트: Subject: two small rounded cards side by side, each showing a tiny apartment building, a simple hand pointer tapping the right card / Composition: centered, cards fill 80% width / Viewpoint: front / Background: transparent / Mood: simple, friendly + 공통 스타일 앵커
- 네거티브: no text, no numbers, no realistic hand, no people's faces

### IMG-06 게임 방법 2 (공개)
- 파일 경로: public/images/step-reveal.svg
- 적용 위치: S-01 게임 방법 카드 2 상단 좌측
- 역할: 섹션 설명
- 크기: viewBox 192×192 (1:1)
- 표시 방식: object-fit contain
- alt: ""
- 생성 프롬프트: Subject: two small rounded cards side by side, the left card slightly raised with a check mark shape above it, small horizontal bars of different lengths under each card suggesting values / Composition: centered / Viewpoint: front / Background: transparent / Mood: clear, satisfying + 공통 스타일 앵커
- 네거티브: no text, no numbers, no currency symbols, no people

### IMG-07 게임 방법 3 (두 모드)
- 파일 경로: public/images/step-modes.svg
- 적용 위치: S-01 게임 방법 카드 3 상단 좌측
- 역할: 섹션 설명
- 크기: viewBox 192×192 (1:1)
- 표시 방식: object-fit contain
- alt: ""
- 생성 프롬프트: Subject: a small calendar page shape next to a looping infinity-shaped ribbon, both simple geometric forms / Composition: side by side, centered / Viewpoint: front / Background: transparent / Mood: light, orderly + 공통 스타일 앵커
- 네거티브: no text, no numbers, no dates, no letters on the calendar, no people

### IMG-08 불러오기 실패
- 파일 경로: public/images/state-error.svg
- 적용 위치:
  - S-02 에러 상태 카드 영역 중앙
  - S-03 에러 상태 카드 영역 중앙
- 역할: 빈 상태(에러)
- 크기: viewBox 480×360 (4:3, 표시 240px의 2배)
- 표시 방식: object-fit contain, 모바일 200×150
- alt: ""(문구가 상태를 설명)
- 생성 프롬프트: Subject: a single stylized apartment building with a small cloud beside it and a broken dotted line between them / Composition: centered, building on the left third, cloud on the right / Viewpoint: front / Background: transparent / Mood: calm, not alarming + 공통 스타일 앵커
- 네거티브: no text, no warning signs with symbols, no red alarm, no people

### IMG-09 정답 표시
- 파일 경로: public/images/verdict-correct.svg
- 적용 위치: S-04 판정 행 좌측(정답일 때)
- 역할: 섹션 설명
- 크기: viewBox 96×96 (1:1, 표시 48px의 2배)
- 표시 방식: object-fit contain, 모바일 40px
- alt: ""(판정 텍스트가 제공)
- 생성 프롬프트: Subject: a small apartment building icon with a bold check mark shape overlapping its lower right corner, check mark in #15803D / Composition: centered / Viewpoint: front / Background: transparent / Mood: positive + 공통 스타일 앵커(색 목록에 #15803D 추가)
- 네거티브: no text, no letters, no confetti, no people

### IMG-10 오답 표시
- 파일 경로: public/images/verdict-wrong.svg
- 적용 위치: S-04 판정 행 좌측(오답일 때)
- 역할: 섹션 설명
- 크기: viewBox 96×96 (1:1)
- 표시 방식: object-fit contain, 모바일 40px
- alt: ""
- 생성 프롬프트: Subject: a small apartment building icon with a bold cross mark shape overlapping its lower right corner, cross mark in #C62828 / Composition: centered / Viewpoint: front / Background: transparent / Mood: neutral, not harsh + 공통 스타일 앵커(색 목록에 #C62828 추가)
- 네거티브: no text, no letters, no sad faces, no people

### IMG-11 결과
- 파일 경로: public/images/result.svg
- 적용 위치: S-05 결과 카드 상단 중앙(데일리·무한 공용)
- 역할: 섹션 설명
- 크기: viewBox 480×320 (3:2, 표시 240px의 2배)
- 표시 방식: object-fit contain, 모바일 180×120
- alt: ""
- 생성 프롬프트: Subject: two stylized apartment towers side by side with a small flag on top of the taller one, a neat row of small rounded squares floating in front of them / Composition: centered, towers in the back, squares in a single row across the lower third / Viewpoint: front / Background: transparent / Mood: accomplished but modest + 공통 스타일 앵커
- 네거티브: no text, no numbers, no trophy, no medals, no confetti, no people

### IMG-12 가이드 헤더
- 파일 경로: public/images/guide-header.svg
- 적용 위치: S-06 제목 영역 아래(모든 slug 공용)
- 역할: 섹션 설명
- 크기: viewBox 1440×810 (16:9, 표시 720px의 2배)
- 표시 방식: object-fit cover, --radius-lg, 모바일 폭 100%(크롭 없음)
- alt: ""
- 생성 프롬프트: Subject: a row of simple apartment buildings behind a large sheet with a plain grid of empty table cells and a magnifying glass resting on it / Composition: sheet centered in the foreground, buildings low in the background, wide margins / Viewpoint: slight front view, flat / Background: plain #F6F5F1 / Mood: orderly, trustworthy + 공통 스타일 앵커
- 네거티브: no text, no numbers in the table, no charts with labels, no people, no brand logos

### IMG-13 개인정보 보호
- 파일 경로: public/images/privacy.svg
- 적용 위치: S-07 제목 영역 좌측 상단
- 역할: 섹션 설명
- 크기: viewBox 240×180 (4:3, 표시 120px의 2배)
- 표시 방식: object-fit contain
- alt: ""
- 생성 프롬프트: Subject: a simple browser window shape with a rounded shield shape in front of it / Composition: centered / Viewpoint: front / Background: transparent / Mood: calm, safe + 공통 스타일 앵커
- 네거티브: no text, no letters, no lock with numbers, no people

### IMG-14 없는 페이지
- 파일 경로: public/images/not-found.svg
- 적용 위치: S-08 본문 상단 중앙
- 역할: 빈 상태
- 크기: viewBox 640×480 (4:3, 표시 320px의 2배)
- 표시 방식: object-fit contain, 모바일 240×180
- alt: ""
- 생성 프롬프트: Subject: an empty plot of land between two apartment buildings with a blank signpost standing in the middle / Composition: centered, buildings at left and right edges / Viewpoint: front / Background: transparent / Mood: light, slightly humorous + 공통 스타일 앵커
- 네거티브: no text on the signpost, no numbers, no construction warning symbols, no people

## §6 CTA 전략
**전체 원칙**
- 1차 CTA 문구: "오늘의 10문제 풀기". 사이트 진입용 1차이며 S-01·S-06·S-08에 쓴다
- 2차 CTA 문구: "무한 모드 하기". 진입용 2차이며 S-01·S-06에 쓴다
- 게임 흐름 안의 CTA(S-04 "다음 문제"/"결과 보기", S-05 "결과 공유하기"/"기록 공유하기", "무한 모드로 더 풀기"/"다시 도전하기")는 §1.8 화면별 확정 문구를 쓴다
- 한 뷰포트에 보이는 1차 CTA(btn-primary)는 최대 1개. 하단 고정 바가 보이는 동안 본문의 같은 1차 버튼은 뷰포트 밖에 있어야 한다
- 시각 우열:
  - 1차 = btn-primary(채움 primary)
  - 2차 = btn-secondary(테두리 primary, 배경 surface)
  - 3차(링크성) = btn-text
  - 2차는 1차보다 위에 두지 않는다. 같은 줄이면 1차가 왼쪽
  - 1차 버튼 주변 --space-6 안에는 btn-text 외의 버튼을 두지 않는다

### S-01 랜딩·모드 선택
- 단 하나의 행동: 데일리 시작
- 1차: "오늘의 10문제 풀기" / 히어로 텍스트 열, 서브 문구 아래 / `/daily` 이동, `cta_click{screen:"S-01",cta:"primary"}`
- 2차: "무한 모드 하기" / 1차 오른쪽(데스크톱)·아래(모바일) / `/infinite` 이동, `cta_click`·`mode_switch{from:"S-01",to:"infinite"}`
- 재노출:
  - 375·768에서 scrollY > 600px이면 하단 고정 바에 btn-primary "오늘의 10문제 풀기"(폭 100%, --shadow-bar, --duration-slow로 등장)
  - scrollY ≤ 600px이면 숨김
  - 1440: 없음
- 망설임 해소: 1차 아래 "가입 없이 바로 시작해요"
- 모바일 차이: 버튼 높이 56px·폭 100%, 1차·2차 세로 스택
- 두지 않을 것: 헤더 메뉴, 히어로 안의 외부 링크, 히어로 영역 광고, 데이터 요약의 "제외 기준 보기" 외 링크

### S-02 데일리 문제 화면
- 단 하나의 행동: 카드 하나를 고르기
- 1차: 카드 두 장(버튼 컴포넌트 아님) / 카드 영역 / S-04로 전환, `answer` 이벤트
- 2차: 없음(선택 외 행동은 이탈을 만든다)
- 재노출: 없음
- 망설임 해소: 질문 아래 "카드를 눌러 선택해요"
- 모바일 차이: 카드 2열 유지, 카드 전체가 터치 영역
- 두지 않을 것: 광고, 모드 전환 링크, 공유 버튼, 헤더 메뉴

### S-03 무한 모드 문제 화면
- 단 하나의 행동: 카드 하나를 고르기
- 1차: 카드 두 장 / 카드 영역 / S-04로 전환, `answer` 이벤트
- 2차: 없음
- 재노출: 없음
- 망설임 해소: 질문 아래 "틀릴 때까지 계속 나와요"
- 모바일 차이: S-02와 동일
- 두지 않을 것: 광고, 데일리 이동 링크, 공유 버튼

### S-04 정답 공개 패널
- 단 하나의 행동: 다음으로 진행
- 1차: "다음 문제"(마지막 문제·무한 오답 시 "결과 보기") / 판정 행·출처 행 아래(데스크톱), 하단 고정 바(모바일) / 다음 문제 렌더 또는 S-05 전환
- 2차: 없음
- 재노출: 모바일 하단 고정 바가 공개 직후부터 항상 표시
- 망설임 해소: 없음(판정 행이 근거를 제공)
- 모바일 차이: 하단 고정 바, 버튼 폭 100%, 높이 56px
- 두지 않을 것: 광고, 공유 버튼, 출처 링크 외 링크

### S-05 결과·공유
- 단 하나의 행동: 결과 공유
- 1차: 데일리 "결과 공유하기" / 무한 "기록 공유하기" / 결과 카드 바로 아래 / Web Share 호출(미지원 시 복사·저장 버튼 노출), `share_click`→`share_done`, `cta_click{screen:"S-05",cta:"primary"}`
- 2차: 데일리 "무한 모드로 더 풀기" → `/infinite`(`mode_switch`) / 무한 "다시 도전하기" → 새 판(`replay_click`) / 공유 블록과 재방문 안내 아래 / `cta_click{cta:"secondary"}`
- 재노출: 없음(결과 카드와 1차가 첫 뷰포트에 들어오도록 배치)
- 망설임 해소: 1차 바로 위 "가격은 공유되지 않아요"
- 모바일 차이: 1차·2차 폭 100%, 1차가 첫 뷰포트(375×667) 안에 들어오도록 IMG-11을 180×120으로 축소
- 두지 않을 것: 1차와 2차 사이의 광고(광고는 내부 링크 아래), 1차 주변의 외부 링크

### S-06 가이드
- 단 하나의 행동: 본문을 읽은 뒤 데일리 시작
- 1차: "오늘의 10문제 풀기" / `{{cta:primary}}` 블록(CT별 위치는 §4 S-06) / `/daily` 이동, `cta_click{screen:"S-06",cta:"primary"}`
- 2차: "무한 모드 하기" / `{{cta:secondary}}` 블록(CT-02 본문 끝) / `/infinite` 이동
- 재노출:
  - 375에서 scrollY > 800px이면 하단 고정 바 btn-primary "오늘의 10문제 풀기"
  - 본문 CTA 블록이 뷰포트에 보이는 동안에는 숨김(IntersectionObserver)
  - 768·1440: 없음
- 망설임 해소: 1차 버튼 아래 "가입 없이 바로 시작해요"
- 모바일 차이: CTA 블록 패딩 --space-5, 버튼 폭 100%
- 두지 않을 것: 본문 내 외부 서비스 링크(출처 기관 링크는 허용), 광고, 관련 글을 CTA 블록 안에 넣는 것

### S-07 개인정보처리방침
- 없음: 법적 고지 화면이라 전환 유도를 두지 않는다. 이동은 헤더 로고와 푸터로 한다

### S-08 404
- 단 하나의 행동: 데일리로 복귀
- 1차: "오늘의 10문제 풀기" / 본문 문구 아래 중앙 / `/daily` 이동, `cta_click{screen:"S-08",cta:"primary"}`
- 2차: 없음. 대신 3차 btn-text "홈으로 가기" → `/`
- 재노출: 없음
- 망설임 해소: 없음
- 모바일 차이: 버튼 폭 100%
- 두지 않을 것: 광고, 검색창
