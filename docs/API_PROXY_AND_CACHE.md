# API 호출 및 캐시 전략 — Gozneok Lite

> 최종 갱신: v0.1.1 (2026-04-29)
>
> **아키텍처 변경**: 프록시 서버 없음 — 클라이언트에서 TourAPI 직접 호출

## 구조

```
[Toss WebView (apps/web)]
        ↓ 직접 호출
[TourAPI KorService2 (apis.data.go.kr)]
```

- **별도 프록시 서버 없음** — `apps/web/src/lib/tourApiClient.ts`에서 직접 호출
- TourAPI serviceKey는 공공데이터포털 공개키로 클라이언트 포함 허용
- 환경변수 `VITE_TOUR_API_KEY` 우선 사용, 미설정 시 내장 폴백 키 사용
- **Supabase 미사용** (DB 의존도 = 0)

---

## TourAPI 직접 호출 엔드포인트

| 기능 | TourAPI 엔드포인트 | 정렬 파라미터 |
|------|-------------------|--------------|
| 장소 목록 | `areaBasedList2` | `arrange=E` (조회순) + 클라이언트 Fisher-Yates shuffle |
| 장소 상세 | `detailCommon2` | — |
| 장소 이미지 | `detailImage2` | — |

### 장소 목록 정렬 전략
- API 호출 시 `arrange=E` (조회순) 사용 — 알파벳순(`A`) 회피
- 클라이언트 초기 로드 시 Fisher-Yates 셔플 적용
- UI 정렬 모드: 인기순(랜덤·기본) / 이름 ▲ / 이름 ▼ / 거리순

---

## 캐시 전략

| 항목 | TTL | 저장 위치 |
|------|-----|-----------|
| 장소 목록 | 15분 | 클라이언트 메모리 캐시 |
| 장소 상세 | 2시간 | 클라이언트 메모리 캐시 |
| 장소 이미지 | 6시간 | 클라이언트 메모리 캐시 |

**구현 방식**:
- 클라이언트: `apps/web/src/lib/cache.ts` — 인메모리 Map 기반 TTL 캐시
- 설정 > 데이터 섹션에서 수동 초기화 가능 (`clearAllCache()`)

---

## 더미 데이터 폴백

| 조건 | 동작 |
|------|------|
| TourAPI 오류 발생 | 더미 폴백 자동 반환 + `isFallback: true` |
| CORS 오류 등 네트워크 장애 | UI 에러 상태 표시 + 재시도 버튼 |

- UI 안내: "현재 데이터 연결이 불안정해 기본 추천을 보여드려요"

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v0.1.0 | MVP | 프록시 서버 구조 설계 |
| v0.1.1 | 2026-04-29 | 프록시 서버 제거, 클라이언트 직접 호출 구조 확정, Supabase 의존도 제거 |


| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `area` | string | N | TourAPI areaCode |
| `timeSlot` | string | N | now/morning/afternoon/evening |
| `lat` | number | N | 위도 (위치 기반 시) |
| `lng` | number | N | 경도 (위치 기반 시) |
| `pageNo` | number | N | 페이지 번호 (기본: 1) |
| `numOfRows` | number | N | 페이지당 항목 수 (기본: 20) |

**응답 예시**:
```json
{
  "items": [...],
  "totalCount": 150,
  "pageNo": 1,
  "numOfRows": 20,
  "isFallback": false
}
```

---

### GET `/api/places/:contentId`
장소 상세 조회 (TourAPI `detailCommon2`)

**응답 예시**:
```json
{
  "data": {
    "contentId": "123456",
    "title": "경복궁",
    "addr1": "서울특별시 종로구 사직로 161",
    "mapx": 126.977041,
    "mapy": 37.579617,
    "overview": "조선왕조의 법궁...",
    ...
  },
  "isFallback": false
}
```

---

### GET `/api/places/:contentId/images`
장소 이미지 목록 (TourAPI `detailImage2`)

**응답 예시**:
```json
[
  {
    "contentId": "123456",
    "imgname": "경복궁 외관",
    "originimgurl": "https://...",
    "smallimageurl": "https://...",
    "serialnum": "1"
  }
]
```

---

### POST `/api/votes`
투표 저장

**요청 Body**:
```json
{
  "contentId": "123456",
  "score": 4,
  "deviceId": "uuid-string"
}
```

**응답**:
- `200 { ok: true }` — 성공
- `400` — 잘못된 요청
- `429` — 쿨다운 중 (24h)

---

## TourAPI 엔드포인트 매핑

| 프록시 엔드포인트 | TourAPI 엔드포인트 | 비고 |
|------------------|--------------------|------|
| `GET /api/places` | `areaBasedList2` | TODO: Swagger 명세 최종 확인 |
| `GET /api/places/:id` | `detailCommon2` | TODO: 파라미터 확인 |
| `GET /api/places/:id/images` | `detailImage2` | TODO: 파라미터 확인 |

> **불확실 항목**: KorService2 실제 엔드포인트명과 응답 스키마는 공공데이터포털 Swagger 문서 확인 필수.
> 현재 코드는 가장 일반적인 조합으로 구현됨. 명세 확인 즉시 교체 예정.

---

## 캐시 전략

| 항목 | TTL | 저장 위치 |
|------|-----|-----------|
| 장소 목록 | 15분 | 서버 인메모리 + 클라이언트 메모리 |
| 장소 상세 | 2시간 | 서버 인메모리 + 클라이언트 메모리 |
| 장소 이미지 | 6시간 | 서버 인메모리 + 클라이언트 메모리 |
| 투표 | 저장 즉시 캐시 무효화 | — |

**구현 방식**:
- 서버: `apps/api/src/cache.ts` — 인메모리 Map 기반 TTL 캐시
- 클라이언트: `apps/web/src/lib/cache.ts` — 동일 구조
- 설정 페이지에서 클라이언트 캐시 수동 초기화 가능

---

## 더미 데이터 폴백

| 조건 | 동작 |
|------|------|
| `USE_DUMMY_DATA=true` (ENV) | TourAPI 호출 없이 더미 반환 |
| TourAPI 오류 발생 | 더미 폴백 자동 반환 + `isFallback: true` |
| API 키 미설정 | 더미 폴백 |

- 더미 데이터 위치: `apps/api/src/dummyData.ts`
- 최소 20개 항목 (서울·부산·강원·경주·제주 등)
- UI 안내: "현재 데이터 연결이 불안정해 기본 추천을 보여드려요"

---

## 배포 옵션

| 옵션 | 비고 |
|------|------|
| Vercel (Node.js Functions) | 추천, 냉각 시작 유의 |
| Cloudflare Workers | 엣지, 인메모리 캐시 주의 (격리) |
| Supabase Edge Functions | Deno 기반, 환경변수 지원 |
| 자체 서버 (EC2 등) | 인메모리 캐시 안정적 |
