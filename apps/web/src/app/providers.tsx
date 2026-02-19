import React from 'react';
import { WishlistProvider } from '@/lib/wishlistContext';
import { RecommendationProvider } from '@/lib/recommendationContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * 앱 전역 Context Provider 묶음
 * - Redux/MobX 없이 React Context만 사용
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <WishlistProvider>
      <RecommendationProvider>
        {children}
      </RecommendationProvider>
    </WishlistProvider>
  );
}
