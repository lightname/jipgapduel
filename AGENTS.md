<!-- AGENTS.md -->
# AGENTS

## 프로젝트
- 사이트명: 집값대결 (JipgapDuel), 코드명 `price-duel`
- 한 줄 요약: 수도권 아파트 매매 실거래 두 건 중 더 비싼 쪽을 고르는 연속 정답 게임. 정적 사이트(유형 W), Cloudflare Pages 배포
- 기술 스택(정확한 버전, `^` 없이 고정):
  - 런타임: Node 22 LTS, npm
  - 앱: next 16.4.6, react 19.3.1, react-dom 19.3.1, typescript 6.0.3
  - 스타일: tailwindcss 4.3.5, @tailwindcss/postcss 4.3.5, pretendard 1.3.9
  - 린트: eslint 9.39.5, eslint-config-next 16.4.6, prettier 3.10.1
  - 테스트: vitest 5.1.1, @vitejs/plugin-react 6.3.0, jsdom 31.0.1, @testing-library/react 16.3.3, @testing-library/dom 10.4.2, @playwright/test 1.65.1
  - 스크립트: tsx 4.23.15, fast-xml-parser 5.12.1, marked 18.2.1, wrangler 4.166.0
  - 타입: @types/react 19.3.0, @types/node 22 계열 최신

## 검증
완료 판정은 다음 명령의 종료 코드로만 한다:
`npm run typecheck && npm run lint && npm test && npm run build`
'잘 동작할 것으로 보입니다' 같은 자체 판단 금지

## 실행
- 로컬 개발: `npm run dev` → http://localhost:3000
- 정적 결과 확인: `npm run build && npm run preview` → http://localhost:8788
- QA 스크린샷: `npm run qa:screens` → `qa/screens/{S-ID}-{375|768|1440}.png`
- 샘플 데이터 생성: `npm run data:sample`
- 실데이터 갱신·배포 커밋: `npm run update`(사람만 실행. 코딩·QA 세션은 실행 금지)

## 세션 시작 전 사람이 준비한 것
- `tests/fixtures/rtms-005-202610.json`: data.zip의 `data/005_apt_trade_dev.json`을 이 이름으로 복사한 파일
- `config.ts` `secrets` 값은 비어 있어도 된다. 코딩 세션은 외부 API를 호출하지 않는다

## 문서 로딩
| 문서 | 읽는 조건 | 읽는 범위 |
|---|---|---|
| AGENTS.md | 모든 세션 시작 | 전체 |
| CONVENTIONS.md | 코딩 세션 시작 | 전체 |
| SPEC.md | 코딩 세션 시작 | 화면 목록, 데이터 모델, 데이터 규칙, API 계약 공통 형식 |
| DESIGN.md | 코딩 세션 시작 | §3 |
| GROWTH.md | 코딩 세션 시작 | §2, §4, §5, §6 |
| CORE.md | 코딩 세션 시작 | 전체 |
| TICKETS.md | 코딩 세션 시작 | 맨 위 세 줄 |
| PROGRESS.md | 코딩 세션 시작 | 전체 |
| TICKETS.md | 티켓마다 | 해당 티켓 |
| DESIGN.md | 티켓마다 | 참조 줄의 S-xx 절(§4)과 §6 S-xx 절 |
| GROWTH.md | 티켓마다 | 참조 줄의 G·CT·KW 항목 |
| CORE.md | 티켓마다 | 참조 줄의 C 항목 |
| SPEC.md | 티켓마다 | API 계약의 해당 행, 참조된 R-xx |
| 전체 | 1차 QA 세션 | 전부 읽기. 쓰기는 QA.md §3과 GROWTH.md(§9 이력 기록 필수)만 |
| 전체 | 수정 세션 | 필요한 문서 읽기. 쓰기는 코드와 QA.md §4만 |
| 전체 | 최종 QA 세션 | 전부 읽기. 쓰기는 최종완료보고서.md만 |

## 세션 역할 규칙
코딩 세션(P6)과 수정 세션(P8)만 코드를 수정한다.
QA 세션(P7, P9)은 코드를 수정하지 않는다.
설계 문서 중 수정 가능한 것은 P7의 GROWTH.md 하나뿐이다. 다른 세션은 설계 문서를 수정하지 않는다.
예외: 코딩 세션은 PROGRESS.md 전체와 QA.md §2(T-18)를 쓴다.

## 성장 규칙
- GROWTH.md §1에서 '금지'인 채널을 구현하지 않는다(예: 수신 동의 없는 대상에게 보내는 메일 발송 기능)
- 색인 대상 여부는 CORE.md C-06 판정 함수로만 정한다
- 키워드만 다른 페이지, 문서에 없는 페이지를 만들지 않는다
- 분량을 채우는 설명문·FAQ를 지어 쓰지 않는다. 메타 키워드 태그를 쓰지 않는다
- 콘텐츠 본문을 지어 쓰지 않는다. 화면 문구를 하드코딩하지 않는다(메시지 파일)
- 측정 이벤트는 CORE.md C-11의 전송 함수로만 보낸다

## 논스톱 규칙
코딩 세션은 사람에게 묻지 않는다. 티켓마다 PROGRESS.md를 갱신한다(완료 티켓 행, 현재 상태, 커밋 해시).

## 가정 규칙
서술이 모호하면 ① 같은 성격의 앞선 티켓 구현을 따르고 ② 없으면 가장 단순한 구현을 고르고 ③ PROGRESS.md 가정 절에 기록한다. 기록 없는 추측 금지.

## 탐색 금지
파일 위치 추측·검색 금지. 경로는 CONVENTIONS.md 폴더 구조와 CORE.md 파일 위치에 있다.

## 절대 금지
- 새 라이브러리 추가(위 스택 외)
- 폴더 구조 변경
- 티켓 외 데이터 스키마(SPEC.md 데이터 모델) 변경
- 대규모 리팩터링
- 테스트 스킵(`.skip`, `.only`)·`any` 캐스팅·`@ts-ignore`
- DESIGN.md §3 밖 색·여백
- 이미지 경로 하드코딩
- T-01 이후 공통 레이어(config.ts, layout.tsx, globals.css, src/lib/*, src/components/Header·Footer) 수정
- `src/generated/stats.json`, `public/data/pool.json` 수동 편집(생성 명령만)
- 허용: 티켓이 지시한 `src/messages/ko.json` 키 추가, `src/features/*`·`src/components/AdSlot.tsx` 신규 파일

## 브랜치·커밋
- 작업 브랜치 `develop`. 코딩·수정 세션은 `develop`에만 커밋한다. main 직접 커밋·머지 금지(머지는 사람)
- 티켓 커밋 `T-01: {요약}`, 수정 커밋 `QA-01: {요약}`, 데이터 커밋 `data: pool {poolVersion}`(사람이 main에서 `npm run update`로만)
- 커밋은 티켓 단위 1개 이상, 검증 명령 통과 후에만

## 막힘 프로토콜
동일 오류 3회 실패 시 그 티켓 중단. 우회책 금지.
PROGRESS.md 막힘 절에 기록하고 다음 티켓으로 간다.
이 티켓에 의존하는 티켓은 건너뛰고 같은 절에 '선행 막힘'으로 기록한다.
T-01이 막히거나 막힌 티켓이 전체의 20%를 넘으면(18개 중 4개 이상) 최종완료보고서.md에 막힌 부분을 기록하고 다음 단계로 넘어간다.

## 세션 교체
도구가 컨텍스트 경고·자동 압축을 띄우거나 이 세션에서 티켓 10개를 끝내면 PROGRESS.md 세션 교체 절에 기록하고 종료한다.
