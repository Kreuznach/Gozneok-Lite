# 데이터 모델 — Gozneok Lite

> 최종 갱신: v0.1.1 (2026-03-07)

## 개요

- MVP는 익명 사용자 기준 (install/device id)
- 위시리스트는 localStorage만 (서버 저장은 확장 단계)
- 투표는 서버 인메모리 저장 → 확장 시 DB 연동
- Place 테이블은 TourAPI contentId 기반 캐시/메타 보관용

---

## SQL 스키마 초안 (PostgreSQL / Supabase 기준)

```sql
-- ────────────────────────────────────────────────────────
-- Place: TourAPI contentId 기반 메타 캐시
-- ────────────────────────────────────────────────────────
CREATE TABLE place (
  content_id      TEXT        PRIMARY KEY,
  content_type_id TEXT,
  title           TEXT        NOT NULL,
  addr1           TEXT,
  addr2           TEXT,
  zipcode         TEXT,
  area_code       TEXT,
  mapx            DOUBLE PRECISION,
  mapy            DOUBLE PRECISION,
  firstimage      TEXT,
  firstimage2     TEXT,
  tel             TEXT,
  overview        TEXT,
  synced_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────
-- Vote: 1~5 점 투표 (deviceId 기준 익명)
-- ────────────────────────────────────────────────────────
CREATE TABLE vote (
  id          BIGSERIAL   PRIMARY KEY,
  content_id  TEXT        NOT NULL REFERENCES place(content_id),
  device_id   TEXT        NOT NULL,  -- 클라이언트 생성 UUID
  score       SMALLINT    NOT NULL CHECK (score BETWEEN 1 AND 5),
  voted_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스: 장소별 집계
CREATE INDEX idx_vote_content_id ON vote (content_id);
-- 쿨다운 체크: (device_id, content_id) 조합
CREATE INDEX idx_vote_device_content ON vote (device_id, content_id);

-- ────────────────────────────────────────────────────────
-- Feedback: 짧은 메모 (100자 제한, 운영 부담 최소)
-- MVP에서는 미구현 — 확장 단계
-- ────────────────────────────────────────────────────────
CREATE TABLE feedback (
  id          BIGSERIAL   PRIMARY KEY,
  content_id  TEXT        NOT NULL,
  device_id   TEXT        NOT NULL,
  memo        TEXT        CHECK (char_length(memo) <= 100),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────
-- Wishlist: 서버 저장 (MVP는 localStorage만 — 확장 단계)
-- ────────────────────────────────────────────────────────
CREATE TABLE wishlist (
  id          BIGSERIAL   PRIMARY KEY,
  device_id   TEXT        NOT NULL,
  content_id  TEXT        NOT NULL,
  saved_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (device_id, content_id)
);
```

---

## localStorage 키 목록 (클라이언트)

| 키 | 타입 | 설명 | 상태 |
|----|------|------|------|
| `gz_device_id` | `string` | UUID (기기 식별자) | ✅ 활성 |
| `gz_wishlist` | `WishlistItem[]` | 위시리스트 배열 | ✅ 활성 |
| `gz_votes` | `Record<contentId, {score, votedAt}>` | 투표 이력 (쿨다운용) | 🔜 v2 예정 |
| `gz_user_profile` | `UserProfile` | 최소 사용자 정보 (선호 지역/시간대, 첫 진입일 등) | 🔜 v2 예정 |
| `gz_place_ratings` | `Record<contentId, PlaceRating>` | 장소 평점 로컬 캐시 | 🔜 v2 예정 |
| `gz_cache_*` | any | 앱 데이터 캐시 | ✅ 활성 |
| `gz_debug_use_dummy` | `"true"/"false"` | 디버그 더미 토글 | ✅ 활성 |

---

## [v2 스키마 준비] 최소 사용자 정보 (UserProfile)

```sql
-- ────────────────────────────────────────────────────────
-- UserProfile: 개인 식별 없이 UX 개인화용 익명 프로파일
-- MVP 로컬 전용 → v2에서 서버 저장 옵션 검토
-- ────────────────────────────────────────────────────────
CREATE TABLE user_profile (
  device_id           TEXT        PRIMARY KEY,  -- 클라이언트 생성 UUID
  preferred_area_codes TEXT[],                 -- 자주 선택한 지역 코드 배열
  preferred_time_slot TEXT,                    -- 'now' | 'morning' | 'afternoon' | 'evening'
  onboarded_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**TypeScript 인터페이스** (`types/index.ts` 에 추가됨):
```ts
export interface UserProfile {
  deviceId: string;
  preferredAreas?: AreaCode[];
  preferredTimeSlot?: TimeSlot;
  onboardedAt: number;   // timestamp (ms)
  lastActiveAt: number;  // timestamp (ms)
}
```

---

## [v2 스키마 준비] 장소별 평점 데이터 (PlaceRating)

```sql
-- ────────────────────────────────────────────────────────
-- PlaceRating: 장소별 베이지안 보정 평점 집계 뷰
-- vote 테이블에서 집계 — 서버에서 주기적 계산 후 캐시
-- ────────────────────────────────────────────────────────
CREATE TABLE place_rating (
  content_id      TEXT        PRIMARY KEY REFERENCES place(content_id),
  bayesian_score  REAL        NOT NULL DEFAULT 3.0,  -- 베이지안 보정 점수 (1~5)
  raw_average     REAL        NOT NULL DEFAULT 0.0,  -- 단순 평균
  vote_count      INTEGER     NOT NULL DEFAULT 0,
  last_voted_at   TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_place_rating_score ON place_rating (bayesian_score DESC);
```

**TypeScript 인터페이스** (`types/index.ts` 에 추가됨):
```ts
export interface PlaceRating {
  contentId: string;
  bayesianScore: number;
  rawAverage: number;
  voteCount: number;
  lastVotedAt: number;  // timestamp (ms)
}
```

---

## 보안 가이드

| 항목 | 규칙 |
|------|------|
| TourAPI serviceKey | 서버 환경변수에서만 사용, 클라이언트 절대 금지 |
| Supabase 서비스 롤 키 | 서버에서만, 클라이언트 절대 금지 |
| deviceId | 클라이언트 생성 UUID — 개인정보 아님 |
| 투표 레이트리밋 | MVP: 24h deviceId 기준 / 확장: IP + deviceId 복합 |

---

## 확장 단계 항목 (MVP 제외)
- Supabase RLS (Row Level Security) 설정
- 투표 레이트리밋 서버 강화 (Redis 등)
- Wishlist 서버 동기화 (로그인 연동)
- Feedback 텍스트 관리자 검토 플로우

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v0.1.0 | MVP | 초기 스키마 (place, vote, feedback, wishlist) |
| v0.1.1 | 2026-03-07 | v2 준비 스키마 추가 (UserProfile, PlaceRating), localStorage 키 테이블 갱신 |
