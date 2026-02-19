# 데이터 모델 — Gozneok Lite

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

| 키 | 타입 | 설명 |
|----|------|------|
| `gz_device_id` | `string` | UUID (기기 식별자) |
| `gz_wishlist` | `WishlistItem[]` | 위시리스트 배열 |
| `gz_votes` | `Record<contentId, {score, votedAt}>` | 투표 이력 (쿨다운용) |
| `gz_cache_*` | any | 앱 데이터 캐시 |
| `gz_debug_use_dummy` | `"true"/"false"` | 디버그 더미 토글 |

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
