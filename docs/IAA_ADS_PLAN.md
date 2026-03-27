# IAA 광고 계획 — Gozneok Lite

## 광고 플랫폼
- **Apps in Toss AdMob API**
- **SDK 기준 버전**: `@apps-in-toss/web-framework` `2.x`
- **배너 API 참고**: [RN-BannerAd 문서](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B4%91%EA%B3%A0/RN-BannerAd.html)

---

## 구현 파일
`apps/web/src/lib/admob.ts`

---

## 광고 타입별 계획

### 노출형 (Banner)

| 항목 | 내용 |
|------|------|
| 노출 지점 | 홈 메인 화면 (장소 찾기 버튼 하단) |
| 광고 종류 | 피드형 (native image) |
| TEST 광고 ID | `ait-ad-test-native-image-id` |
| LIVE 광고 ID | `ait.v2.live.cc42e4d2cbf54b8d` |
| ID 선택 로직 | `VITE_ADMOB_BANNER_GROUP_ID` 환경변수 우선 → PROD 빌드: LIVE ID → 비PROD: TEST ID |
| SDK API | `TossAds.attachBanner(adGroupId, target, options)` |
| 옵션 | `theme: 'auto'`, `variant: 'expanded'`, `tone: 'blackAndWhite'` |
| 최소 토스 앱 버전 | 5.241.0 이상 |
| 컨테이너 높이 | `minHeight: 96px` (문서 권장 고정 높이) |
| 실패 시 | 배너 영역만 비활성, 나머지 UX 영향 없음 |

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
| `VITE_ADMOB_BANNER_GROUP_ID` | 배너 광고 그룹 ID (미설정 시 환경 자동 분기) |
| `VITE_ADMOB_INTERSTITIAL_GROUP_ID` | 전면형 광고 그룹 ID |
| `VITE_ADMOB_REWARDED_GROUP_ID` | 보상형 광고 그룹 ID |

- 배너: 환경변수 미설정 시 PROD 빌드(`import.meta.env.PROD`)이면 LIVE ID, 아니면 TEST ID 자동 사용
- 전면형/보상형: 미설정 시 광고 기능 자동 비활성화
- 앱 나머지 기능에 영향 없음

---

## 오류/폴백 처리

| 상황 | 동작 |
|------|------|
| `isSupported()` = false (토스앱 5.241 미만 포함) | 광고 없이 진행 |
| 로드 타임아웃 (5초) | 광고 없이 진행 |
| 노출 실패 / `onAdFailedToRender` | 광고 없이 진행 |
| `onNoFill` | 배너 영역 공백 유지 |
| 보상형 실패 | 잠금 해제 처리 (사용자 불이익 없음) |

> **원칙**: 광고 실패가 사용자 경험에 영향을 미쳐서는 안 됩니다.
