import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from './providers';
import { AppLayout } from './Layout';
import { PageLoader } from '@/components/Skeletons';
import { ROUTES } from './routes';

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
  return (
    <AppProviders>
      <BrowserRouter>
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
              {/* Debug: 개발 환경에서만 표시 */}
              {import.meta.env.DEV && (
                <Route path={ROUTES.DEBUG} element={<DebugPage />} />
              )}
              <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
          </Suspense>
        </AppLayout>
      </BrowserRouter>
    </AppProviders>
  );
}
