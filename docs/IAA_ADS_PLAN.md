# IAA 광고 계획 — Gozneok Lite

## 광고 플랫폼
- **Apps in Toss AdMob API**
- **SDK 기준 버전**: `@apps-in-toss/web-framework` `2.x`

---

## 구현 파일
`apps/web/src/lib/admob.ts`

---

## 광고 타입별 계획

### 노출형 (Banner)

| 항목 | 내용 |
|------|------|
| 노출 지점 | 홈 메인 화면 (시간/지역 선택 UI 하단) |
| 광고 ID | `ait.v2.live.cc42e4d2cbf54b8d` |
| SDK API | `TossAds.attachBanner(adGroupId, target, options)` |
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
| `VITE_ADMOB_BANNER_GROUP_ID` | 노출형(배너) 광고 그룹 ID |
| `VITE_ADMOB_INTERSTITIAL_GROUP_ID` | 전면형 광고 그룹 ID |
| `VITE_ADMOB_REWARDED_GROUP_ID` | 보상형 광고 그룹 ID |

- 미설정 시 광고 기능 자동 비활성화
- 앱 나머지 기능에 영향 없음

---

## 오류/폴백 처리

| 상황 | 동작 |
|------|------|
| `isSupported()` = false | 광고 없이 진행 |
| 로드 타임아웃 (5초) | 광고 없이 진행 |
| 노출 실패 | 광고 없이 진행 |
| 보상형 실패 | 잠금 해제 처리 (사용자 불이익 없음) |

> **원칙**: 광고 실패가 사용자 경험에 영향을 미쳐서는 안 됩니다.

---

## 광고 SDK 불확실 사항 (TODO)

- `adGroupId` 발급/교체 절차 (Toss 파트너 콘솔)
- 샌드박스 테스트 광고 ID 존재 여부
- 운영 배너 ID 교체 시, `VITE_ADMOB_BANNER_GROUP_ID` 우선 적용
