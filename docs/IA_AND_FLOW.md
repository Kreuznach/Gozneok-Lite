# IA & 화면 흐름 — Gozneok Lite

## 정보 구조 (IA)

```
/ (Home)
├── /region       (RegionSelect)
├── /time-slot    (TimeSlotSelect)
├── /places       (PlaceList)
│   └── /places/:contentId  (PlaceDetail)
├── /wishlist     (Wishlist)
├── /journey      (Journey — 내 고요 기록: 미션·리포트·배지·도장판·노트)
└── /settings     (Settings)
```

---

## 화면별 설명

### 1. Home (`/`)
- 앱 진입점
- 시간대 선택 (TimeSlotChips)
- 버튼 2개: "내 주변" (위치 권한 요청) / "지역 선택"
- 위치 권한 거부 → Region Select 자동 이동
- 바로가기: 위시리스트 / 설정
- 재미·재방문 카드 (v0.2.0): "다시 가 볼까요?"(30일 넘게 안 간 곳이 있을 때, 하루 한 번 닫기 가능) / "오늘의 고요 한 곳" / "내 고요 기록" 요약(이번 주 미션 진행도)

### 2. RegionSelect (`/region`)
- 17개 시도 그리드
- 선택 즉시 → PlaceList 이동

### 3. TimeSlotSelect (`/time-slot`)
- 오전/오후/저녁/지금 4가지
- 선택 즉시 → 이전 화면으로 복귀 (또는 PlaceList)

### 4. PlaceList (`/places`)
- 카드 리스트 (이미지·Quiet Score·주소)
- 시간대 칩으로 필터 전환 가능
- 새로고침(전면 광고 가능) / 더 보기
- TourAPI 오류 시 더미 폴백 + 배너 안내

### 5. PlaceDetail (`/places/:contentId`)
- 대표 이미지 + 추가 이미지 가로 스크롤 (썸네일 클릭 시 메인 이미지 교체)
- 장소명·주소·연락처
- Quiet Score 배지 (잠금 해제 with 보상형 광고)
- 1~5 투표 (deviceId 기준 24h 쿨늤운)
- 위시리스트 토글
- 길찾기 버튼 (카카오맵 / 네이버지도 외부 링크)
- 고요 도장 (v0.2.0): 시간대(오전/오후/저녁) 선택 + 한 줄 노트(100자) + "다녀왔어요" 버튼, 새 배지를 받으면 안내 문구 표시

### 6. Wishlist (`/wishlist`)
- 저장된 장소 카드 목록
- 삭제 버튼
- localStorage 기반 (앱 재설치 시 초기화 안내)

### 6-1. Journey (`/journey`) — v0.2.0
- 이번 주 작은 미션 2개 / 이번 달 리포트 / 배지 6종(진행도) / 지역별 도장판 / 도장 기록·한 줄 노트(삭제 가능)
- 홈의 "내 고요 기록" 카드로 진입

### 7. Settings (`/settings`)
- 앱 버전 / 데이터 출처 안내
- 캐시 초기화
- 위치 권한 상태 안내
- 전체 데이터 삭제 (위시리스트 + 캐시)

---

## 주요 화면 전환 흐름

```
[Home]
  ├─ 위치 허용 ──────────────────────→ [PlaceList]
  ├─ 위치 거부/지역 선택 클릭 ─────→ [RegionSelect] → [PlaceList]
  └─ 시간대 칩 클릭 ──────────────→ [TimeSlotSelect] → 복귀

[PlaceList]
  ├─ 카드 클릭 ───────────────────→ [PlaceDetail]
  ├─ 새로고침 ── (전면광고 가능) ─→ 갱신
  └─ 지역변경 클릭 ───────────────→ [RegionSelect]

[PlaceDetail]
  ├─ 썸네일 클릭 ────────────────→ 메인 이미지 교체
  ├─ 투표(1~5) ─────────────────→ 점수 반영
  ├─ Quiet Score 잠금 해제 ───────→ 보상형 광고 → 점수 표시
  ├─ 위시리스트 하트 ────────────→ localStorage 토글
  └─ 길찾기 버튼 ──────────────→ 카카오맵 / 네이버지도 (외부)
```

---

## 제약 사항
- iframe 없음
- 지도 SDK/임베드 없음 (MVP)
- 다크 모드 지원 없음
- 외부 링크는 "길찾기" 1개만 허용
