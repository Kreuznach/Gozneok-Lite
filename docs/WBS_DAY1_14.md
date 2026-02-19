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
- [x] Settings 페이지 완성 (데이터 출처 표기, 캐시 초기화, 광고 지원 확인)
- [x] Debug 페이지 완성 (개발 전용, 동적 import)
- [x] 전체 라우팅 흐름 점검 (5개 경로: Home/RegionSelect/PlaceList/PlaceDetail/Wishlist + Debug 개발전용)

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
- [x] Debug 페이지 프로덕션 숨김 확인 (`import.meta.env.DEV` 조건부 Route + lazy() 동적 import)
- [ ] 심사 제출 (Toss 파트너 콘솔에서 제출 — 외적 절차)

---

## 완료 기준

- [ ] 샌드박스 전체 플로우 통과 (실기기 테스트 — 파트너 등록 후 진행)
- [x] TourAPI 오류 → 더미 폴백 동작 (코드 구현 + 실 데이터 테스트 완료)
- [x] 광고 isSupported false → 정상 동작 (loadFullScreenAd.isSupported() 폴백)
- [x] /docs 10종 문서 존재
- [x] TourAPI 키 소스코드 미포함 (grep 확인 완료)
- [x] 최종 프로덕션 빌드 성공 (vite build — 66 modules, gzip ~68.5 KB)
- [x] 심사 체크리스트 전 항목 `[x]` 완료 (외부 절차 2개 제외)
