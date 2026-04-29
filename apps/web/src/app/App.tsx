import React, { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from './providers';
import { AppLayout } from './Layout';
import { PageLoader } from '@/components/Skeletons';
import { ROUTES } from './routes';
import { TossAds } from '@apps-in-toss/web-framework';

/* 정적 import — 메인 청크 */
import HomePage from '@/pages/Home';
import RegionSelectPage from '@/pages/RegionSelect';
import TimeSlotSelectPage from '@/pages/TimeSlotSelect';
import PlaceListPage from '@/pages/PlaceList';
import PlaceDetailPage from '@/pages/PlaceDetail';
import WishlistPage from '@/pages/Wishlist';
import SettingsPage from '@/pages/Settings';

/* Debug 페이지: 동적 import → 프로덕션 빌드에서 별도 청크로 분리 */
const DebugPage = lazy(() => import('@/pages/Debug'));

export function App() {
  // 배너 광고 SDK 사전 초기화 (가이드: 앱 최상위 컴포넌트에서 한 번만)
  // TossAds.initialize()는 toss-ads-space-kit JS를 CDN에서 동적 로드합니다.
  // SDK가 이미 초기화된 경우 즉시 onInitialized를 호출하며 중복 로드하지 않습니다.
  // ※ isSupported()는 Toss 앱 WebView 외부(브라우저/로컬 개발)에서 예외를 throw하므로 try-catch 필수
  useEffect(() => {
    try {
      if (!TossAds.initialize.isSupported()) return;
      TossAds.initialize({
        callbacks: {
          onInitializationFailed: () => {
            // SDK 사전 초기화 실패 — 광고 없이 진행 (앱 동작에 영향 없음)
          },
        },
      });
    } catch {
      // Toss 앱 WebView 외부(브라우저, 로컬 개발 등)에서는 SDK 미지원 — 광고 없이 진행
    }
  }, []);

  return (
    <AppProviders>
      <HashRouter>
        <AppLayout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.REGION_SELECT} element={<RegionSelectPage />} />
              <Route path={ROUTES.TIME_SLOT_SELECT} element={<TimeSlotSelectPage />} />
              <Route path={ROUTES.PLACE_LIST} element={<PlaceListPage />} />
              <Route path={ROUTES.PLACE_DETAIL} element={<PlaceDetailPage />} />
              <Route path={ROUTES.WISHLIST} element={<WishlistPage />} />
              <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
              {/* Debug: 항상 라우트 등록 — 설정 탭에서 활성화해야 진입 링크 표시 */}
              <Route path={ROUTES.DEBUG} element={<DebugPage />} />
              <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
          </Suspense>
        </AppLayout>
      </HashRouter>
    </AppProviders>
  );
}
