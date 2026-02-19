/**
 * cache.ts
 * 메모리 기반 TTL 캐시 (페이지 새로고침 시 초기화)
 * 경량 구현 — 외부 라이브러리 없음
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class TTLCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  /** 만료된 항목 정리 */
  prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

/** 앱 전역 단일 캐시 인스턴스 */
export const memoryCache = new TTLCache();

/** TTL 상수 */
export const TTL = {
  LIST: 15 * 60 * 1000,    // 15분
  DETAIL: 2 * 60 * 60 * 1000, // 2시간
  IMAGES: 6 * 60 * 60 * 1000, // 6시간
} as const;
