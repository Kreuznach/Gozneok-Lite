# IAA 광고 계획 — Gozneok Lite

## 광고 플랫폼
- **Apps in Toss AdMob API**
- **SDK 설치 버전**: `@apps-in-toss/web-framework` `2.1.1` (**2.0 이상 충족**)
- **외부 SDK**: `toss-ads-space-kit-1.3.0.js` (CDN: `https://static.toss.im/ads/sdk/`)  
  → `TossAds.initialize()` 호출 시 자동 동적 로드 (index.html에 preload 힌트 추가됨)
- **배너 API 참고**:  
  - [배너 광고(WebView) 공식 가이드](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B4%91%EA%B3%A0/BannerAd.html) ← 검토 완료
  - [배너 광고(React Native) 참고](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B4%91%EA%B3%A0/RN-BannerAd.html)

---

## 구현 파일
- `apps/web/src/lib/admob.ts` — 광고 API 래퍼
- `apps/web/src/app/App.tsx` — SDK 사전 초기화 (앱 최상위)
- `apps/web/src/pages/Home/index.tsx` — 배너 컨테이너 및 부착

---

## 광고 타입별 계획

### 노출형 (Banner)

| 항목 | 내용 |
|------|------|
| 노출 지점 | 홈 메인 화면 (장소 찾기 버튼 하단) |
| 광고 종류 | 피드형 (native image) |
| LIVE 광고 ID | `ait.v2.live.cc42e4d2cbf54b8d` |
| ID 선택 로직 | `VITE_ADMOB_BANNER_GROUP_ID` 환경변수 우선 → fallback: `ait.v2.live.cc42e4d2cbf54b8d` |
| SDK 초기화 흐름 | `App.tsx`: `TossAds.initialize()` → `onInitialized` → `TossAds.attachBanner()` |
| SDK API | `TossAds.initialize(callbacks)` → `TossAds.attachBanner(adGroupId, target, options)` |
| 옵션 | `theme: 'auto'`, `variant: 'expanded'`, `tone: 'blackAndWhite'` |
| 최소 토스 앱 버전 | 5.241.0 이상 |
| 컨테이너 높이 | height 미지정 (피드형 인라인: SDK가 광고 콘텐츠 높이에 맞게 자동 조절) |
| 컨테이너 너비 | `width: 100%` 필수 |
| 컨테이너 주변 여백 | `marginTop: 20px`, `marginBottom: 8px` (가이드: 위아래 8px 이상) |
| 컨테이너 div id | 홈 화면 배너 섹션 `ref={setBannerHost}` |
| localhost 동작 | **광고 미표시 정상** — `isSupported()` = false (Toss App 환경 외) |
| 실패 시 | 배너 영역만 비활성, 나머지 UX 영향 없음 |

> **⚠️ 중요**: `TossAds.initialize()` 없이 `TossAds.attachBanner()` 를 직접 호출하면  
> `"[toss-ad] Call initialize() before attaching an ad."` 오류가 발생합니다.  
> `attachMainBannerAd()` 가 내부적으로 반드시 `initialize()` → `attachBanner()` 순서를 보장합니다.

---

### 전면형 (Interstitial)

| 항목 | 내용 |
|------|------|
| 노출 지점 | 장소 목록 새로고침 / "다른 추천 보기" 클릭 시 |
| 금지 지점 | 앱 첫 진입, 첫 상세 진입 |
| 빈도 룰 | 세션당 최대 2회, 2분 쿨다운 |
| 연속 노출 | 금지 |

### 보상형 (Rewarded)

| 항목 | 내용 |
|------|------|
| 노출 지점 | "Quiet Score 상세 보기" 잠금 해제 버튼 |
| 조건 | 명시적 버튼 클릭 시에만 |
| 실패 시 | 광고 없이 바로 잠금 해제 (UX 파탄 방지) |

---

## localhost 광고 표시 여부

> **← localhost(브라우저)에서 광고가 표시되지 않는 것은 정상입니다.**

| 환경 | 동작 | 이유 |
|------|------|------|
| Toss App WebView (v5.241.0+) | 광고 표시 | `isSupported()` = true |
| localhost / 브라우저 / Toss App < 5.241.0 | 광고 미표시 | `isSupported()` = false |

공식 가이드 FAQ: *"This feature is not supported in the current environment"* →  
"토스 앱 환경에서 실행 중인지 확인해주세요."

---

## 배너 초기화 상세 흐름 (공식 가이드 준수)

```
[App.tsx — 앱 시작 시 한 번, 가이드 ✅ 좋은 예]
TossAds.initialize.isSupported()?
  └─ true → TossAds.initialize({ onInitializationFailed })  // SDK 사전 로드 시작

[Home 컴포넌트 — bannerHost ref 설정 후]
attachMainBannerAd(target)
  ├─ isBannerAdSupportedSync()
  │    ├─ TossAds.initialize.isSupported()  // Toss WebView 환경 감지
  │    └─ TossAds.attachBanner.isSupported()
  │         false → return null (광고 없이 진행)
  │
  └─ TossAds.initialize({ callbacks })
       // SDK가 이미 로드 중이면 pending promise에 편승 (중복 로드 없음)
       ├─ loadAdsSdk() → <script src="toss-ads-space-kit-1.3.0.js"> 동적 삽입
       │                   → window.TossAdsSpaceKit 노출 대기 (타임아웃 15초)
       │
       onInitialized:
         └─ TossAds.attachBanner(AD_GROUP_BANNER, target, options)
              → sdk.banner.createSlot(element, { spaceId, autoLoad: true })
              → 광고 렌더링 시작
       onInitializationFailed:
         → 광고 없이 진행 (에러 무시)
```

---

## 빈도 제어 로직

```
전면형 조건:
  isAdSupported() === true
  AND 마지막 노출 후 2분 경과
  AND 세션 내 2회 미만
  AND 첫 진입/첫 상세가 아님
```

---

## Feature Flag

| 환경변수 | 설명 |
|----------|------|
| `VITE_ADMOB_BANNER_GROUP_ID` | 배너 광고 그룹 ID (미설정 시 `ait.v2.live.cc42e4d2cbf54b8d` 사용) |
| `VITE_ADMOB_INTERSTITIAL_GROUP_ID` | 전면형 광고 그룹 ID |
| `VITE_ADMOB_REWARDED_GROUP_ID` | 보상형 광고 그룹 ID |

- 배너: 환경변수 미설정 시 `ait.v2.live.cc42e4d2cbf54b8d` (LIVE ID) 사용
- 전면형/보상형: 미설정 시 광고 기능 자동 비활성화
- 앱 나머지 기능에 영향 없음

---

## 오류/폴백 처리

| 상황 | 동작 |
|------|------|
| `isSupported()` = false (토스앱 5.241 미만 포함) | 광고 없이 진행 |
| SDK 스크립트 로드 실패 (`onInitializationFailed`) | 광고 없이 진행 |
| SDK 로드 타임아웃 (15초, SDK 내부) | 광고 없이 진행 |
| 노출 실패 / `onAdFailedToRender` | 광고 없이 진행 |
| `onNoFill` | 배너 영역 공백 유지 |
| 보상형 실패 | 잠금 해제 처리 (사용자 불이익 없음) |
| 컴포넌트 언마운트 후 init 완료 | `destroyed` 플래그로 무시, slot 미생성 |

> **원칙**: 광고 실패가 사용자 경험에 영향을 미쳐서는 안 됩니다.

---

## 완료 체크리스트

- [x] SDK 버전 2.0+ 확인 (`@apps-in-toss/web-framework@2.1.1`)
- [x] 광고 SDK JS 파일: `TossAds.initialize()` 가 `toss-ads-space-kit-1.3.0.js` 동적 로드  
      `index.html` 에 `<link rel="preload">` 힌트 추가
- [x] 배너 광고 컨테이너: `ref={setBannerHost}`, `width:100%`, height 미지정 (피드형 인라인 가이드 준수)
- [x] 광고 ID `ait.v2.live.cc42e4d2cbf54b8d` 설정 (`AD_GROUP_BANNER` fallback)
- [x] `TossAds.initialize()` → `TossAds.attachBanner()` 순서 보장
- [x] `App.tsx` 최상위에서 SDK 사전 초기화 (가이드 ✅ 좋은 예 준수)
- [x] localhost 광고 미표시 → 정상 동작 확인 (`isSupported()` = false in browser)
- [x] `ait build` 완료 (`deploymentId: 019d50f1-dfde-7d42-8888-209606a09714`)

---

## 가이드 검토 이력

| 날짜 | 항목 | 결과 |
|------|------|------|
| 2026-04-03 | [WebView BannerAd 공식 가이드](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B4%91%EA%B3%A0/BannerAd.html) 검토 | ✅ 완료 |
| 2026-04-03 | 초기화 위치 수정: `attachMainBannerAd` 내부 → `App.tsx` 최상위 추가 | ✅ 완료 |
| 2026-04-03 | 컨테이너 height 수정: `height: 96px` (리스트형 고정 기준) → height 미지정 (피드형 인라인, UI 가이드 준수) | ✅ 완료 |
| 2026-04-03 | `ait build` 재빌드 | ✅ 완료 |
