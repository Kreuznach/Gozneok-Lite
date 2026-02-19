/**
 * cache.ts (API 서버)
 * 인메모리 TTL 캐시 — 외부 라이브러리 없음
 */

interface Entry<T> {
  data: T;
  expiresAt: number;
}

class ServerTTLCache {
  private store = new Map<string, Entry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as Entry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }
}

export const serverCache = new ServerTTLCache();

export const SERVER_TTL = {
  LIST: 15 * 60 * 1000,    // 15분
  DETAIL: 2 * 60 * 60 * 1000, // 2시간
  IMAGES: 6 * 60 * 60 * 1000, // 6시간
} as const;
