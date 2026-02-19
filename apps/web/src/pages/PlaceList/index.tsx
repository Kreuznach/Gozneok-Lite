/**
 * PlaceList/index.tsx — 장소 목록 화면
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import { useRecommendation } from '@/lib/recommendationContext';
import { useWishlist } from '@/lib/wishlistContext';
import { fetchPlaceList } from '@/lib/tourApiClient';
import { showInterstitialAd } from '@/lib/admob';
import { PlaceCard } from '@/components/PlaceCard';
import { PlaceCardSkeleton } from '@/components/Skeletons';
import { EmptyState, FallbackBanner } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { TimeSlotChips } from '@/components/TimeSlotChips';
import type { Place, TimeSlot } from '@/types';
import { TIME_SLOTS } from '@/types/constants';

const NUM_OF_ROWS = 20;

export default function PlaceListPage() {
  const navigate = useNavigate();
  const { selectedArea, selectedTimeSlot, useLocation, userLat, userLng, setTimeSlot } =
    useRecommendation();
  const { add, remove, has } = useWishlist();

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 광고: 최초 로드 완료 후 처음 새로고침 시 전면형 가능
  const isFirstLoad = useRef(true);

  // 목록 진입 시 조건 체크
  useEffect(() => {
    if (!selectedTimeSlot && !useLocation && !selectedArea) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [selectedArea, selectedTimeSlot, useLocation, navigate]);

  const loadPlaces = useCallback(
    async (page: number, reset = false) => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetchPlaceList({
          area: useLocation ? undefined : selectedArea?.code,
          timeSlot: selectedTimeSlot ?? 'now',
          lat: useLocation ? userLat : undefined,
          lng: useLocation ? userLng : undefined,
          pageNo: page,
          numOfRows: NUM_OF_ROWS,
        });
        setPlaces((prev) => (reset ? res.items : [...prev, ...res.items]));
        setIsFallback(res.isFallback ?? false);
        setHasMore(res.items.length === NUM_OF_ROWS);
      } catch {
        setError(true);
        setHasMore(false);
      } finally {
        setLoading(false);
        isFirstLoad.current = false;
      }
    },
    [selectedArea, selectedTimeSlot, useLocation, userLat, userLng]
  );

  useEffect(() => {
    setPageNo(1);
    setPlaces([]);
    loadPlaces(1, true);
  }, [loadPlaces]);

  const handleRefresh = useCallback(async () => {
    // 새로고침 시 전면 광고 가능 (첫 진입 제외)
    if (!isFirstLoad.current) {
      void showInterstitialAd();
    }
    setPageNo(1);
    await loadPlaces(1, true);
  }, [loadPlaces]);

  const handleLoadMore = useCallback(() => {
    const next = pageNo + 1;
    setPageNo(next);
    loadPlaces(next, false);
  }, [pageNo, loadPlaces]);

  const handleTimeSlotChange = useCallback(
    (slot: TimeSlot) => {
      setTimeSlot(slot);
    },
    [setTimeSlot]
  );

  const locationLabel = useLocation
    ? '내 주변'
    : selectedArea?.name ?? '';
  const timeLabel =
    TIME_SLOTS.find((t) => t.key === selectedTimeSlot)?.label ?? '';

  return (
    <div>
      <PageHeader
        title={`${locationLabel} · ${timeLabel}`}
        rightElement={
          <button
            onClick={() => navigate(ROUTES.REGION_SELECT)}
            style={{
              fontSize: '13px',
              color: '#3182F6',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            지역변경
          </button>
        }
      />

      <div style={{ padding: '12px 20px' }}>
        <TimeSlotChips
          selected={selectedTimeSlot}
          onSelect={handleTimeSlotChange}
        />
      </div>

      <div style={{ padding: '0 20px 32px' }}>
        {isFallback && <FallbackBanner />}

        {loading && places.length === 0 ? (
          <>
            <PlaceCardSkeleton />
            <PlaceCardSkeleton />
            <PlaceCardSkeleton />
          </>
        ) : error && places.length === 0 ? (
          <EmptyState
            title="장소를 불러오지 못했어요"
            description="네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요"
            action={{ label: '다시 시도', onClick: handleRefresh }}
          />
        ) : places.length === 0 ? (
          <EmptyState
            title="해당 조건의 장소가 없어요"
            description="다른 지역이나 시간대를 선택해보세요"
            action={{ label: '지역 다시 선택', onClick: () => navigate(ROUTES.REGION_SELECT) }}
          />
        ) : (
          <>
            {places.map((place) => (
              <PlaceCard
                key={place.contentId}
                place={place}
                isWishlisted={has(place.contentId)}
                onWishlistToggle={() => {
                  if (has(place.contentId)) {
                    remove(place.contentId);
                  } else {
                    add({
                      contentId: place.contentId,
                      title: place.title,
                      addr1: place.addr1,
                      firstimage: place.firstimage,
                      savedAt: Date.now(),
                    });
                  }
                }}
              />
            ))}

            {/* 더 보기 */}
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: '#f2f4f6',
                  border: 'none',
                  fontSize: '15px',
                  color: '#4e5968',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '8px',
                }}
              >
                {loading ? '불러오는 중…' : '추천 더 보기'}
              </button>
            )}

            {/* 새로고침 */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: '#fff',
                border: '1px solid #e5e8eb',
                fontSize: '15px',
                color: '#6b7684',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '8px',
              }}
            >
              🔄 다른 추천 보기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
