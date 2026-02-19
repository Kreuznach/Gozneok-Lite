# Toss 심사 대응 체크리스트 — Gozneok Lite

## 심사 전 필수 확인 항목

### 1. TDS (Toss Design System) 적용
- [x] 전체 UI가 TDS 컴포넌트 또는 TDS 디자인 가이드라인 준수 (인라인 스타일로 TDS 컬러/타이포 직접 적용)
- [x] 라이트 모드 기준 일관성 유지 (`color-scheme: light`, `background: #ffffff`)
- [x] 폰트: Apple SD Gothic Neo / Pretendard 계열 사용 (global.css font-family 확인)
- [x] TDS 컬러 팔레트 (#3182F6 blue, #191f28 text — 전 페이지 적용 확인)

### 2. 앱 구성
- [x] iframe 미사용 확인
- [x] 외부 링크: "길찾기(카카오맵)" 1개만 (PlaceDetail target="_blank" 1건 확인)
- [x] 다크모드 강제 해제 (`color-scheme: light` — meta + global.css 적용)
- [x] `granite.config.ts` 정확히 작성 (brand.primaryColor/icon placeholder, permissions 객체형 — Day 10 완료)
- [x] `appName: 'gozneok-lite'` 확인

### 3. 권한
- [x] 위치 권한 선언 (`{ name: 'geolocation', access: 'access' }` — 타입 확인 완료, SDK `Accuracy.High` 적용)
- [x] 위치 권한 거부 시 정상 동작 (GetCurrentLocationPermissionError catch → Region Select 대체)
- [x] 불필요한 권한 미요청

### 4. 광고 (IAA)
- [x] Apps in Toss AdMob API 사용 (GoogleAdMob, loadFullScreenAd, showFullScreenAd 실제 SDK 연동)
- [x] 전면형: 첫 진입/첫 상세 진입에서 노출 금지 (admob.ts 쿨다운 로직 구현)
- [x] 보상형: 명시적 동의(버튼 클릭) 시에만
- [x] 광고 실패 시 UX 정상 (loadFullScreenAd.isSupported() 검사 + 타임아웃 30s 폴백)
- [x] `adGroupId` 환경변수로 분리 (VITE_ADMOB_* 환경변수)

### 5. 보안
- [x] TourAPI serviceKey가 클라이언트 코드에 없음 (프록시 서버 ENV 전용)
- [x] `git log` 검색으로 키 노출 이력 없음 (초기 커밋, 이력 없음)
- [x] `.env.local`이 gitignore에 포함됨
- [x] Supabase 서비스 롤 키 클라이언트 미포함 (Supabase 미사용, N/A)

### 6. 성능/번들
- [x] 무거운 라이브러리 미포함 (@toss/tds-mobile 제거, Redux/Zustand 미사용)
- [x] Debug 페이지: 동적 import로 분리 (프로덕션 숨김 — lazy() + import.meta.env.DEV)
- [x] 이미지 `loading="lazy"` 적용 (PlaceCard, PlaceDetail 모두 적용)
- [x] 번들 크기 확인 — 총 gzip ~64KB (`vite build` 확인 완료)

### 7. 오류 처리
- [x] 네트워크 실패 시 빈 화면/크래시 없음 (EmptyState + 폴백 구현)
- [x] TourAPI 오류 시 더미 폴백 + 안내 배너 (isFallback 플래그 기반)
- [x] 광고 타임아웃 폴백 확인 (AD_LOAD_TIMEOUT_MS=5000, AD_SHOW_TIMEOUT_MS=30000, withTimeout 래퍼 + isSupported() 분기 구현)

### 8. 콘텐츠
- [x] "AI 추천", "정확한 조용함 보장" 등 과장 표현 없음 (설계 단계부터 배제)
- [x] Quiet Score 레이블: "대체로/경향" 표현만 (RECOMMENDATION_RULES 기준)
- [x] 데이터 출처 표기 (설정 페이지 → "한국관광공사 TourAPI (공공데이터포털)")
- [x] 개인정보 수집 최소화 (deviceId만, 이름/연락처 없음)

> **[2026-02-19 변경]** 투표(QuietVote) 기능은 v2로 이관됨. 심사 제출 버전에서는 투표 UI 전체 제거.

---

## 샌드박스 테스트 플로우

1. Toss 앱 → 샌드박스(TestFlight/내부 배포) 설치
2. 미니앱 진입
3. Home → 위치 허용/거부 → 장소 목록 → 상세 → 위시리스트
4. 위치 거부 → Region Select → 장소 목록
5. 더미 데이터 모드 ON → 폴백 배너 확인
6. 광고 isSupported 확인 (설정 → 광고 지원 여부)
7. 캐시 초기화 → 재로드

> ~~투표 → 위시리스트 플로우~~: 투표 기능 v2 이후 추가 예정

---

## 반려 리스크 TOP 5

| 번호 | 리스크 | 대응 |
|------|--------|------|
| 1 | TDS 미준수 | TDS 컴포넌트 최대 활용 |
| 2 | 광고 빈도 과다 | 세션 2회 / 2분 쿨타임 준수 |
| 3 | iframe/외부 SDK | 미사용 확인 |
| 4 | 권한 과요청 | 위치만, 동의 시에만 |
| 5 | 과장 광고 표현 | 단정 표현 없음 확인 |
