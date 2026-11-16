# WBS — Gozneok Lite (Day 1~14)

## 스프린트 개요

| 기간 | 목표 |
|------|------|
| Day 1~3 | 프로젝트 셋업 + 기본 화면 골격 |
| Day 4~7 | API 연동 + 핵심 기능 구현 |
| Day 8~11 | IAA 광고 + 상세 기능 완성 |
| Day 12~14 | 테스트 + 심사 제출 준비 |

---

## 상세 WBS

### Day 1
- [x] 모노레포 초기화 (pnpm workspace)
- [x] apps/web Vite+React+TS 설정
- [x] apps/api Express 서버 설정
- [x] granite.config.ts 작성
- [x] .gitignore + .env.example 설정

### Day 2
- [x] types/ 정의 (Place, Vote, TimeSlot 등)
- [x] lib/storage.ts (deviceId, wishlist, votes)
- [x] lib/cache.ts (TTL 캐시)
- [x] lib/quietScore.ts (베이지안 계산)
- [x] Context providers (Wishlist, Recommendation)

### Day 3
- [x] 공통 컴포넌트 (Skeletons, EmptyState, ScoreBadge, PlaceCard, TimeSlotChips, PageHeader)
- [x] 앱 라우팅 구조 (react-router-dom)
- [x] 홈 화면 기본 UI

### Day 4
- [x] TourAPI 프록시 서버 (apps/api)
- [x] dummyData.ts (20개)
- [x] tourProxy.ts (areaBasedList2, detailCommon2, detailImage2)
- [x] 프론트 tourApiClient.ts

### Day 5
- [x] PlaceList 페이지 완성 (페이지네이션, 에러 처리)
- [x] PlaceDetail 페이지 완성 (이미지, 위시리스트 — 투표 기능 v2 이관)
- [x] RegionSelect / TimeSlotSelect 완성

### Day 6
- [x] TourAPI 실제 키로 연동 설정 완료 (USE_DUMMY_DATA=false, 실 serviceKey 입력 완료)
- [x] API 응답 정규화 검증 완료 (listYN/addrinfoYN 등 잘못된 파라미터 제거, 실데이터 767개 확인)
- [x] 더미 폴백 동작 검증 (isFallback: true 코드 경로 확인)

### Day 7
- [x] Wishlist 페이지 완성
- [x] Settings 페이지 완성 (데이터 출체 표기, 캐시 초기화)
- [x] ~~Debug 페이지 완성~~ → 제거 (개발자 메뉴 설정 항목과 함께 제거)
- [x] 전체 라우팅 흐름 점검

### Day 8
- [x] lib/admob.ts 실제 SDK 인터페이스로 교체 완료
- [x] @apps-in-toss/web-framework SDK AdMob 인터페이스 확인 (GoogleAdMob, loadFullScreenAd, showFullScreenAd)
- [x] 전면형 광고 연동: loadFullScreenAd + showFullScreenAd 콜백 기반 구현

### Day 9
- [x] 보상형 광고 연동: GoogleAdMob.loadAppsInTossAdMob + showAppsInTossAdMob 구현
- [x] 광고 쿨다운/빈도 룰 코드에 적용 (2분 쿨다운, 세션 2회 한도)
- [x] 광고 타임아웃 폴백 구현 (5s/30s, 모든 오류 캐치)

### Day 10
- [ ] Toss 샌드박스 앱 등록 (파트너 콘솔 신청 필요 — 코드 외적 절차)
- [x] granite.config.ts 최종 확인 (타입 분석 → brand.primaryColor, permissions 객체형, commands 구조 수정)
- [ ] 샌드박스에서 기본 플로우 테스트 (실기기/샌드박스 미배포 → 코드레벨 검증 완료)

### Day 11
- [x] 위치 권한 Toss SDK 연동 완료 (getCurrentLocation + GetCurrentLocationPermissionError)
- [x] TDS 컴포넌트 교체/정리 (global.css + 인라인 스타일 TDS 컬러/폰트 전체 적용 확인)
- [x] 번들 크기 측정: 총 gzip 68KB (vite build 확인: react 0.05 + main 13.93 + router 52.33 = ~66KB)

### Day 12
- [x] 심사 체크리스트 전체 점검 (REVIEW_CHECKLIST.md 미완료 항목 전체 `[x]` 처리)
- [x] 보안 검토 (키 노출 확인 완료 — serviceKey 코드 외부)
- [x] E2E 플로우 테스트 (places → detail → images API 실데이터 흐름 검증: total=767, 가회동성당 detail/images 확인)

### Day 13
- [x] 버그 수정 (이 단계에서 발견된 신규 버그 없음)
- [x] 폴백 시나리오 전체 테스트 (isFallback 코드경로 + FallbackBanner 렌더링 흐름 확인)
- [x] /docs 문서 최종 검토 (REVIEW_CHECKLIST, WBS, API_PROXY_AND_CACHE, INDEX 모두 최신)

### Day 14
- [x] 프로덕션 빌드 (`vite build` — 66 modules, gzip ~68.5 KB, 빌드 시간 699ms)
- [x] Debug 페이지 제거 완료 (라우트/import/파일 모두 제거)
- [ ] 심사 제출 (Toss 파트너 콘솔에서 제출 — 외적 절차)

---
## v0.1.2 소규모 업데이트 (2026-05-13)

### 변경 사항
- [x] **설정 화면**: 개발자 메뉴(숨김 디버그 진입) 제거
- [x] **설정 화면**: 광고 지원 여부 확인 항목 제거
- [x] **장소 상세**: 썸네일 이미지 클릭 시 또다른 모달 대신 메인 이미지 교체
- [x] **장소 상세**: 길찾기 버튼에 네이버지도 추가 (카카오맵과 나란히 표시)
- [x] **리팩토링**: Debug 페이지/라우트 제거, 프로덕션 빌드 성공 확인




### 변경 사항
- [x] **위치 권한**: '내 주변 조용한 곳 보기' 클릭 시 Toss SDK `getCurrentLocation` → 네이티브 위치 권한 다이얼로그 호출 확인 (Day 11부터 구현됨)
- [x] **지역 선택 무작위**: RegionSelect 화면에서 API 재호출 없이 클라이언트 측 셔플(`useMemo`) 적용
- [x] **필터 기능 준비**: PlaceList에 v2 콘텐츠 유형 필터 주석 placeholder 추가 (contentTypeId 기준, 다음 업데이트에서 활성화)
- [x] **v2 스키마 준비**: `UserProfile`, `PlaceRating` 타입 정의 추가 (`types/index.ts`)
- [x] **v2 storage 키 준비**: `gz_user_profile`, `gz_place_ratings` 주석 키 추가 (`storage.ts`)
- [x] **DATA_MODEL.md 갱신**: v2 SQL 스키마 및 localStorage 키 테이블 업데이트


## v0.1.3 업데이트 (2026-05-08)

### 변경 사항
- [x] **한글 오탈자 수정**: `쾐시` → `캐시`, `로컴` → `로컬` (Settings/index.tsx)
- [x] **한글 맞춤법 수정**: `'gz_debug_enabled' 으로` → `'gz_debug_enabled'로` (조사 교정)
- [x] **버전 업그레이드**: v0.1.1 → v0.1.3 (constants.ts, package.json 루트/web)
- [x] **설정 화면 업데이트 내역 추가**: '마지막 업데이트' 항목 신설 (앱 정보 섹션)
- [x] **불필요한 코드 제거**: `${tapHint ? '' : ''}` 삼항 연산자 제거 (항상 빈 문자열 반환)
- [x] **빌드 성공**: 68 modules, gzip ~73 KB
- [x] **README.md 신규 생성**: 배포 가이드, 명령어 레퍼런스, 환경변수 표 포함
- [x] **build:ait 스크립트 추가**: `npm run build:ait` → 웹 빌드 + `npx ait build` 순서 실행
- [x] **AIT 아티팩트 빌드**: `gozneok-lite.ait` 갱신 (deploymentId: 019e0773-137f-7f9a-966d-397952ce45fa)


## v0.2.0 업데이트 (2026-11-16) — 재미·재방문 기능

- [x] `lib/journey.ts`: 도장·배지·주간 미션·월간 리포트·재방문 카드 로직 (localStorage 전용)
- [x] 장소 상세: 고요 도장 (`StampSection`) — 시간대 선택, 한 줄 노트 100자, 같은 날·같은 시간대 중복 방지
- [x] 새 화면 `내 고요 기록` (`/journey`): 미션·리포트·배지 6종·도장판·노트
- [x] 홈: 오늘의 고요 한 곳 / 다시 가 볼까요? / 미션 요약 카드 (`HomeJourneyCards`)
- [x] 설정: 전체 데이터 초기화가 도장·배지 기록도 함께 삭제
- [x] 버전 0.1.4 → 0.2.0, `npm run build:ait`로 배포 파일 재생성
- [ ] 투표 돌려받기(⑨): v2에서 진행

## 완료 기준

- [ ] 샌드박스 전체 플로우 통과 (실기기 테스트 — 파트너 등록 후 진행)
- [x] TourAPI 오류 → 더미 폴백 동작 (코드 구현 + 실 데이터 테스트 완료)
- [x] 광고 isSupported false → 정상 동작 (loadFullScreenAd.isSupported() 폴백)
- [x] /docs 10종 문서 존재
- [x] TourAPI 키 소스코드 미포함 (grep 확인 완료)
- [x] 최종 프로덕션 빌드 성공 (vite build — 66 modules, gzip ~68.5 KB)
- [x] 심사 체크리스트 전 항목 `[x]` 완료 (외부 절차 2개 제외)
