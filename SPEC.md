<!-- SPEC.md -->
# SPEC

## 목표
- 수도권 아파트 매매 실거래 두 건 중 더 비싼 쪽을 고르는 게임을 정적 사이트(유형 W)로 제공한다
- 데일리(전원 동일 10문제)와 무한 모드(오답 시 종료)를 제공하고 결과를 가격 없이 공유하게 한다
- `npm run update` 한 줄로 수집 → 가공 → 검증 → 빌드 → 배포 커밋까지 수행한다

## 비목표
| 항목 | 이유 |
|---|---|
| 전월세·연립·오피스텔 모드 | MVP는 아파트 매매만 |
| 지역 선택 | MVP는 수도권 전체 출제 |
| 랭킹 서버·정답 위조 방지 | 서버 없음(유형 W) |
| 로그인 | 기록은 브라우저 저장 |
| 이메일 수집·발송 | 범위 밖, 발송 수단 없음 |
| 단지 상세 페이지(레벨 3) 구현 | 데이터 이력 부족, 판정 규칙만 준비 |
| 다른 언어 페이지(레벨 4) 구현 | 1차 언어 ko 단일, 구조만 준비 |
| 카카오 SDK 공유 | Web Share API + 복사·저장으로 대체 |
| 카카오맵·지도 타일 | SVG 미니맵으로 대체 |
| 앱 API·서버 기능 | 정적 export |
| CI 예약 수집(GitHub Actions 등) | 로컬 `npm run update`로 대체 |
| PWA·푸시 알림 | 범위 밖(manifest는 아이콘용, 서비스 워커 없음) |
| 다크 모드 | 토큰 1세트만 |
| 수도권 외 지역 | MVP 범위 |
| 쿠키 동의 배너 | 국내 대상, 개인정보처리방침(S-07)으로 대응 |
| 가이드 목록 페이지 | CT 2개라 고유 기능 없음(GROWTH G-03) |

- 타겟·톤앤매너·CTA는 DESIGN.md §1·§6
- 채널·키워드·콘텐츠·성장 장치·언어 확장은 GROWTH.md

## 화면 목록
| S-ID | 경로 | 한 줄 목적 | 구현 티켓 |
|---|---|---|---|
| S-01 | `/` | 랜딩·모드 선택, 데이터 요약 | T-13 |
| S-02 | `/daily` | 데일리 10문제 | T-11 |
| S-03 | `/infinite` | 무한 모드 | T-12 |
| S-04 | S-02·S-03 내부 상태 | 정답 공개 패널 | T-09 |
| S-05 | S-02·S-03 내부 상태 | 결과·공유 | T-10 |
| S-06 | `/guide/data-source`, `/guide/median-price` | 가이드(CT-01, CT-02) | T-14 |
| S-07 | `/privacy` | 개인정보처리방침 | T-15 |
| S-08 | 없는 모든 경로 | 404 | T-16 |

## 핵심 흐름
- 공유 링크 진입: S-02 → 카드 선택 → S-04 → 다음 문제 ×10 → S-05 → 결과 공유하기 → (2차) S-03
- 검색 진입(브랜드·게임): S-01 → 오늘의 10문제 풀기 → S-02 → S-04 → S-05
- 검색 진입(가이드): S-06 → 본문 CTA → S-02 또는 S-03
- 데일리 재방문(같은 날): S-01(오늘 완료 배지) → S-02 → 저장된 S-05
- 무한: S-03 → S-04 → 정답이면 다음 문제, 오답이면 결과 보기 → S-05 → 다시 도전하기 → S-03
- 운영자: `npm run update` → (CORE C-23 순서) → main 커밋·푸시 → Cloudflare Pages 빌드

## 데이터 모델
- 연동결과-부동산실거래, 연동결과-부동산위치 폴더2개의 실제데이터 연동 코드및 데이터결과파일이있다 이를기반으로 코딩하라! 폴더내에 작업결과보고서.md 문서가 데이터설명문서이다.
- RawTradeItem(API item, 전부 string): aptSeq, aptNm, sggCd, umdNm, umdCd, jibun, roadNm, roadNmBonbun, roadNmBubun, buildYear, excluUseAr, floor, dealYear, dealMonth, dealDay, dealAmount("29,500"), dealingGbn, cdealType, cdealDay, buyerGbn, slerGbn, landLeaseholdGbn
- NormalizedTrade: id:string(`{aptSeq}-{YYYYMMDD}-{floor}-{areaM2}-{price}`), complexId:string(aptSeq), complexName:string, lawdCode:string(sggCd), umdName:string, jibun:string, roadAddr:string|null, buildYear:number, areaM2:number, floor:number, dealDate:string(`YYYY-MM-DD`), dealYm:string(`YYYY-MM`), price:number(만원), dealingGbn:string, cancelled:boolean, buyerGbn:string, slerGbn:string, landLeasehold:boolean
- Sgg(pool): code:string, name:string(예 "서울 강남구"), path:string(투영 좌표 SVG path)
- Complex(pool): id:string, name:string, sggCode:string, umd:string, buildYear:number, lat:number, lng:number, coordSource:"parcel"|"road"|"dong"|"sgg"
- PoolTrade(pool): id:string, complexId:string→Complex.id, areaM2:number, floor:number, dealYm:string, price:number
- Pool(`public/data/pool.json`): schemaVersion:1, poolVersion:string(`YYYYMMDD-HHmm` KST), generatedAt:string(ISO), period:{from,to}(`YYYY-MM`), sgg:Sgg[], complexes:Complex[], trades:PoolTrade[], pairs:{easy,medium,hard: [number,number][]}(trades 인덱스)
- Stats(`src/generated/stats.json`): generatedAt, poolVersion, period, sggCount:number, counts:{fetched, afterCancel, afterDirect, afterNonIndividual, afterLeasehold, afterOutlier, poolTrades}, pairBands:{easy|medium|hard:{count,minPct,maxPct}}, bySgg:[{code,name,median,count}], byArea:[{band,median,count}], byAge:[{band,median,count}]
- DailyRecord(localStorage `pd:v1:daily:{YYYY-MM-DD}`): poolVersion:string, answers:boolean[], maxStreak:number, done:boolean
- BestRecord(localStorage `pd:v1:best:infinite`): number

## 데이터 규칙
| ID | 규칙 | 값 |
|---|---|---|
| R-01 | 수집 월 | 실행 시점 KST 기준 전월까지 24개월. 최근 3개월은 매번 재수집, 그 이전은 캐시 우선 |
| R-02 | 수집 시군구 | 아래 기본 목록 ∪ VWorld 현재 시군구(sig_cd가 11·28·41로 시작) |
| R-03 | 제외 필터(순서) | cancel: cdealType 또는 cdealDay 값 있음 → direct: dealingGbn="직거래" → nonIndividual: buyerGbn 또는 slerGbn ≠ "개인" → leasehold: landLeaseholdGbn="Y" |
| R-04 | 이상치 | 같은 complexId, 면적 차 ≤ 3㎡, 거래일 이전 12개월 내 거래 중 최근 5건의 ㎡당가 중앙값 대비 |비율−1| > 0.40이면 제외. 비교 거래 < 2건이면 제외(`--sample` 모드는 통과) |
| R-05 | 좌표 폴백 | parcel(지번) → road(도로명) → dong(같은 lawdCode·umdName 좌표 평균) → sgg(해당 시군구 경계 꼭짓점 평균) → 없으면 단지 제외 |
| R-06 | 시군구 재배정 | 좌표가 들어 있는 현재 시군구 경계로 sggCode·name 결정. 어느 경계에도 없으면 수집 코드·기본 목록 이름 사용 |
| R-07 | 풀 샘플링 | 최대 8,000건. 시군구별 할당 = min(보유, max(30, floor(8000×비율))), 합계 초과 시 30 초과분을 비례 축소. 단지당 최대 5건. 시드 = poolVersion |
| R-08 | 난이도 구간 | pct = (고가−저가)/저가. easy ≥ 0.30, medium 0.10 ≤ pct < 0.30, hard 0.02 ≤ pct < 0.10 |
| R-09 | 쌍 | 구간별 3,000쌍(`--sample` ≥ 100). 같은 complexId 금지, 동일가 금지, 중복 쌍 금지 |
| R-10 | 데일리 | KST 날짜, 시드 hash(`{YYYY-MM-DD}|{poolVersion}`), 구간 순서 E,E,E,M,M,M,M,H,H,H, 10문제 안 거래 중복 금지, 좌우 순서 시드로 결정. 회차 = (날짜 − site.launchDate)일 + 1, 최소 1 |
| R-11 | 무한 단계 | 연속 0~2: easy · 3~5: medium 0.20~0.30 · 6~9: medium 0.10~0.20 · 10~14: hard 0.05~0.10 · 15+: hard 0.02~0.05. 한 판 안 거래 재출제 금지 |
| R-12 | 검증 | poolTrades ≥ 5,000(`--sample` ≥ 300), 시군구 커버리지(풀 거래 있는 시군구 / 필터 통과 거래 있는 시군구) ≥ 0.90(`--sample` 생략), 쌍 전수 R-08·R-09 만족, pool.json ≤ 2MB |
| R-13 | 통계 구간 | 면적 ≤60, 60<·≤85, 85<·≤102, 102<·≤135, >135㎡ / 연식(거래연도−건축연도) ≤5, 6~10, 11~20, 21~30, >30 / bySgg는 거래 ≥ 30만, 법정동코드 오름차순 |

시군구 기본 목록(`scripts/data/lawd-codes.ts`, code:이름):
- 서울: 11110 종로구, 11140 중구, 11170 용산구, 11200 성동구, 11215 광진구, 11230 동대문구, 11260 중랑구, 11290 성북구, 11305 강북구, 11320 도봉구, 11350 노원구, 11380 은평구, 11410 서대문구, 11440 마포구, 11470 양천구, 11500 강서구, 11530 구로구, 11545 금천구, 11560 영등포구, 11590 동작구, 11620 관악구, 11650 서초구, 11680 강남구, 11710 송파구, 11740 강동구
- 인천: 28110 중구, 28140 동구, 28177 미추홀구, 28185 연수구, 28200 남동구, 28237 부평구, 28245 계양구, 28260 서구, 28710 강화군, 28720 옹진군
- 경기: 41111 수원시 장안구, 41113 수원시 권선구, 41115 수원시 팔달구, 41117 수원시 영통구, 41131 성남시 수정구, 41133 성남시 중원구, 41135 성남시 분당구, 41150 의정부시, 41171 안양시 만안구, 41173 안양시 동안구, 41190 부천시, 41192 부천시 원미구, 41194 부천시 소사구, 41196 부천시 오정구, 41210 광명시, 41220 평택시, 41250 동두천시, 41271 안산시 상록구, 41273 안산시 단원구, 41281 고양시 덕양구, 41285 고양시 일산동구, 41287 고양시 일산서구, 41290 과천시, 41310 구리시, 41360 남양주시, 41370 오산시, 41390 시흥시, 41410 군포시, 41430 의왕시, 41450 하남시, 41461 용인시 처인구, 41463 용인시 기흥구, 41465 용인시 수지구, 41480 파주시, 41500 이천시, 41550 안성시, 41570 김포시, 41590 화성시, 41610 광주시, 41630 양주시, 41650 포천시, 41670 여주시, 41800 연천군, 41820 가평군, 41830 양평군
- 인천 2026-07 개편(제물포·영종·서해·검단구), 화성 2026-02 일반구(만세·효행·병점·동탄구) 코드는 R-02의 VWorld 현재 목록으로 들어온다. 시도 전체 표기: 11 서울특별시, 28 인천광역시, 41 경기도. 화면 표기: 서울·인천·경기

## API 계약
공통 응답 형식(정적 JSON): 최상위에 `schemaVersion`, `poolVersion`, `generatedAt`를 둔다(Pool·Stats).
공통 에러 형식: CONVENTIONS.md 에러 처리의 `Result.error` `{ code, message, context? }`.

| 메서드 | 경로 | 요청 파라미터 | 응답 data 필드 | 에러 코드 | 구현 담당 |
|---|---|---|---|---|---|
| GET | `/data/pool.json` | v:string:stats.poolVersion | Pool 전체(데이터 모델) | POOL_FETCH_FAILED, POOL_SCHEMA_MISMATCH, POOL_EMPTY | T-05 |
| GET | `/sitemap.xml` | 없음 | url, lastModified, alternates.languages | — | T-01 |
| GET | `/robots.txt` | 없음 | 텍스트(CONVENTIONS 기술 SEO) | — | T-01 |
| GET | `/manifest.webmanifest` | 없음 | name, short_name, icons, theme_color, background_color | — | T-01 |
| GET | `/ads.txt` | 없음 | `google.com, {pub-ID}, DIRECT, f08c47fec0942fa0` | — | T-07 |
| GET(외부) | `https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev` | serviceKey:string:secrets.dataGoKrKey, LAWD_CD:string, DEAL_YMD:string(YYYYMM), pageNo:number:1, numOfRows:number:1000 | XML response.header.resultCode("000"·"00" 성공), response.body.totalCount, response.body.items.item(RawTradeItem, 1건이면 객체) | COLLECT_HTTP, COLLECT_API, COLLECT_NO_CACHE | T-02 |
| GET(외부) | `https://api.vworld.kr/req/address` | service:address, request:getcoord, version:2.0, crs:epsg:4326, type:parcel\|road, address:string, refine:true, simple:false, format:json, key:secrets.vworldKey | response.status("OK"\|"NOT_FOUND"\|"ERROR"), response.result.point.x(경도), response.result.point.y(위도) | GEOCODE_KEY, GEOCODE_HTTP | T-04 |
| GET(외부) | `https://api.vworld.kr/req/data` | service:data, request:GetFeature, data:LT_C_ADSIGG_INFO, attrFilter:`sig_cd:like:{11\|28\|41}`, geometry:true, crs:EPSG:4326, size:1000, page:1, format:json, key | response.status, response.result.featureCollection.features[].properties.sig_cd·sig_kor_nm, geometry(MultiPolygon) | BOUNDARY_FAILED | T-04 |

스크립트 전용 에러 코드: VALIDATE_FAILED, BRANCH_NOT_MAIN, GIT_FAILED, VERIFY_FAILED(T-05).
