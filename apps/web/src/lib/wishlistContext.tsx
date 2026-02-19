/**
 * wishlistContext.tsx
 * 위시리스트 전역 상태 (localStorage 기반)
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { WishlistItem } from '@/types';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} from './storage';

interface WishlistContextValue {
  wishlist: WishlistItem[];
  add: (item: WishlistItem) => void;
  remove: (contentId: string) => void;
  has: (contentId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(getWishlist);

  const add = useCallback((item: WishlistItem) => {
    addToWishlist(item);
    setWishlist(getWishlist());
  }, []);

  const remove = useCallback((contentId: string) => {
    removeFromWishlist(contentId);
    setWishlist(getWishlist());
  }, []);

  const has = useCallback(
    (contentId: string) => isInWishlist(contentId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wishlist]
  );

  return (
    <WishlistContext.Provider value={{ wishlist, add, remove, has }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist는 WishlistProvider 내에서 사용해야 합니다');
  return ctx;
}
