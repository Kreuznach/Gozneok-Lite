import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
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
