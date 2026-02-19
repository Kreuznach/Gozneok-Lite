/**
 * storage.ts
 * localStorage 기반 deviceId / wishlist 관리
 */
import type { WishlistItem } from '@/types';

const KEYS = {
  DEVICE_ID: 'gz_device_id',
  WISHLIST: 'gz_wishlist',
  // VOTES: 'gz_votes', — 투표 기능 v2 예정, 현재 미사용
} as const;

// ────────────────────────────────────────────────────────
// deviceId
// ────────────────────────────────────────────────────────

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // 폴백: 단순 랜덤 UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getDeviceId(): string {
  try {
    const stored = localStorage.getItem(KEYS.DEVICE_ID);
    if (stored) return stored;
    const id = generateUUID();
    localStorage.setItem(KEYS.DEVICE_ID, id);
    return id;
  } catch {
    // localStorage 접근 불가 시 세션 임시 ID 반환
    return 'fallback-' + Date.now();
  }
}

// ────────────────────────────────────────────────────────
// 위시리스트
// ────────────────────────────────────────────────────────

export function getWishlist(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(KEYS.WISHLIST);
    return raw ? (JSON.parse(raw) as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

export function addToWishlist(item: WishlistItem): void {
  const list = getWishlist();
  const exists = list.some((w) => w.contentId === item.contentId);
  if (!exists) {
    list.unshift(item);
    try {
      localStorage.setItem(KEYS.WISHLIST, JSON.stringify(list));
    } catch {
      /* 용량 초과 등 무시 */
    }
  }
}

export function removeFromWishlist(contentId: string): void {
  const list = getWishlist().filter((w) => w.contentId !== contentId);
  try {
    localStorage.setItem(KEYS.WISHLIST, JSON.stringify(list));
  } catch {
    /* 무시 */
  }
}

export function isInWishlist(contentId: string): boolean {
  return getWishlist().some((w) => w.contentId === contentId);
}

// ────────────────────────────────────────────────────────
// 캐시 리셋 (Setting 페이지용)
// ────────────────────────────────────────────────────────

export function clearAllCache(): void {
  try {
    // deviceId, wishlist, votes는 유지 — 앱 데이터 캐시만 제거
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('gz_cache_')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* 무시 */
  }
}
