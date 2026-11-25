<!-- PROGRESS.md -->
# PROGRESS

## 현재 상태
- 마지막 완료 티켓: T-13
- 다음 티켓: T-14
- 마지막 커밋 해시: 4431676

## 완료 티켓
| 티켓 ID | 커밋 | 비고 |
|---|---|---|
| T-01 | 89329ee | 공통 레이어·토큰·플레이스홀더 14종·SEO·테스트 셋업 완료 |
| T-02 | 3d8c06b | 시군구 목록·수집 월 계산·RTMS 수집 클라이언트 및 단위 테스트 |
| T-03 | 15730aa | 규칙 상수·정규화·R-03 필터·R-04 이상치 및 실측 픽스처 테스트 |
| T-04 | 95cb937 | 투영·경계 수집·단순화·지오코딩·R-05 폴백·R-06 재배정 구현 |
| T-05 | eca584c | 출제 풀·통계·원자적 검증 교체 및 샘플 pool/stats 생성 커밋 |
| T-06 | b7466bf | 게임 순수 로직(시드·데일리·무한·reducer·풀 로더) 및 테스트 |
| T-07 | 8aeb969 | AdSlot 조건부 렌더 컴포넌트 및 ads.txt 생성 스크립트 |
| T-08 | ddb4b9f | QuestionCard(7개 정보·공개 상태) 및 MiniMap SVG(C-30) 구현 |
| T-09 | 363fc0a | S-04 RevealPanel(판정·차이·출처·반응형 진행 버튼) 구현 |
| T-10 | ebf36e9 | S-05 ResultView 및 ShareBlock(텍스트·캔버스 이미지·Web Share/폴백) 구현 |
| T-11 | 850b8a9 | S-02 데일리 문제 화면·useGame·로딩/에러/헤더 포털 구현 |
| T-12 | aacd98a | S-03 무한 모드 문제 화면 구현 |
| T-13 | 4431676 | S-01 랜딩 페이지(히어로·게임 방법·데이터 요약·재노출 바) 구현 |

## 가정
| 티켓 ID | 모호했던 서술 | 선택한 해석 | 근거 |
|---|---|---|---|
| T-01 | S-02·S-03 헤더 우측 상태 영역 전달 방식(T-01 이후 Header/layout 수정 금지, Context 금지) | Header에 `#header-status` 빈 슬롯을 두고 S-02·S-03에서 React portal로 렌더 | AGENTS.md 공통 레이어 수정 금지 및 CONVENTIONS.md Context 금지 준수 |
| T-01 | 푸터 링크 클릭 시 `internal_link_click` 전송과 서버 `loadStats`/`isGuideLinkable` 호출 분리 | `layout.tsx`(서버)가 값을 조회해 `Footer.tsx`(클라이언트) props로 전달 | CONVENTIONS.md `src/components/` 목록 외 추가 파일 미생성 |
| T-03 | `tests/fixtures/rtms-005-202610.json` 파일이 세션 시작 시 미배치 상태 | `연동결과-부동산실거래/data/005_apt_trade_dev.json`을 AGENTS.md 안내대로 복사 배치 | AGENTS.md "세션 시작 전 사람이 준비한 것" 및 SPEC.md 데이터 모델 지시 |
| T-11 | `@types/react-dom` 미설치 상태에서 `react-dom` `createPortal` 타입 오류 | `src/features/game/view/react-dom.d.ts`에 `createPortal` 최소 시그니처 선언 | AGENTS.md 새 라이브러리 추가 금지 및 T-01 가정(`#header-status` portal) 준수 |

## 막힘
| 티켓 ID | 시도한 것 | 오류 원문 | 막힌 지점 | 추정 원인 | 영향받는 티켓 |
|---|---|---|---|---|---|

## 세션 교체
| 교체 시점 티켓 | 사유 | 다음 세션이 먼저 알아야 할 것 |
|---|---|---|
| T-10 | 이 세션에서 티켓 10개 완료 (T-01~T-10) | 1) 브랜치 `develop`에 T-01~T-10 완료 및 샘플 `pool.json`·`stats.json` 커밋됨. 2) `Header`의 `#header-status` 슬롯에 T-11·T-12가 React portal로 상태 영역을 렌더해야 함(공통 레이어 수정 금지). 3) 다음 티켓은 T-11~T-18이며 모든 검증(`npm run verify`) 통과 상태임. |
