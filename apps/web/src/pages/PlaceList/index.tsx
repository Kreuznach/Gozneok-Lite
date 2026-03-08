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

/** 초기 호출 시 수신하는 장소 수 — 셔플 풀 크기 */
const NUM_OF_ROWS = 50;

/**
 * Fisher-Yates 셔플 — 원본 배열 불변, 새 배열 반환
 */
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

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
  /** 마지막 API 응답 시간 (ms). null = 미측정 */
  const [lastFetchMs, setLastFetchMs] = useState<number | null>(null);

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
      const t0 = performance.now();
      try {
        const res = await fetchPlaceList({
          area: useLocation ? undefined : selectedArea?.code,
          timeSlot: selectedTimeSlot ?? 'now',
          lat: useLocation ? userLat : undefined,
          lng: useLocation ? userLng : undefined,
          pageNo: page,
          numOfRows: NUM_OF_ROWS,
        });
        const elapsed = Math.round(performance.now() - t0);
        setLastFetchMs(elapsed);
        console.info(
          `[PlaceList] API 응답 ${elapsed}ms | 수신 ${res.items.length}건 | page=${page} | fallback=${res.isFallback ?? false}`
        );
        // 초기 로드(reset) 시 셔플, 페이지 추가 시 순서 유지
        const nextItems = reset ? shuffleArray(res.items) : res.items;
        setPlaces((prev) => (reset ? nextItems : [...prev, ...nextItems]));
        setIsFallback(res.isFallback ?? false);
        setHasMore(res.items.length === NUM_OF_ROWS);
      } catch {
        setLastFetchMs(Math.round(performance.now() - t0));
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

      {/*
       * [v2 필터 — 다음 업데이트에서 활성화]
       * 콘텐츠 유형 필터 (contentTypeId 기준)
       * 활성화 시:
       *   1. state: const [activeType, setActiveType] = useState<string | null>(null)
       *   2. fetchPlaceList params 에 contentTypeId 추가
       *   3. CONTENT_TYPES 상수(constants.ts) 정의 필요
       *
       * <div style={{ padding: '0 20px 8px', overflowX: 'auto' }}>
       *   <div style={{ display: 'flex', gap: '8px', paddingBottom: '4px' }}>
       *     {[
       *       { id: null, label: '전체' },
       *       { id: '12', label: '관광지' },
       *       { id: '14', label: '문화시설' },
       *       { id: '28', label: '레포츠' },
       *       { id: '32', label: '숙박' },
       *       { id: '39', label: '음식점' },
       *       { id: '38', label: '쇼핑' },
       *     ].map((t) => (
       *       <button
       *         key={String(t.id)}
       *         onClick={() => setActiveType(t.id)}
       *         style={{
       *           whiteSpace: 'nowrap',
       *           padding: '6px 14px',
       *           borderRadius: '20px',
       *           border: activeType === t.id ? '2px solid #3182F6' : '1px solid #e5e8eb',
       *           background: activeType === t.id ? '#ebf3ff' : '#fff',
       *           color: activeType === t.id ? '#3182F6' : '#4e5968',
       *           fontSize: '13px',
       *           fontWeight: activeType === t.id ? 700 : 400,
       *           cursor: 'pointer',
       *         }}
       *       >
       *         {t.label}
       *       </button>
       *     ))}
       *   </div>
       * </div>
       */}

      <div style={{ padding: '0 20px 32px' }}>
        {isFallback && <FallbackBanner />}

        {/* API 응답 시간 측정 뱃지 (DEV 전용) */}
        {import.meta.env.DEV && lastFetchMs !== null && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '6px',
              background: lastFetchMs < 500 ? '#e8fce8' : lastFetchMs < 1500 ? '#fff7e0' : '#ffe5e5',
              border: `1px solid ${lastFetchMs < 500 ? '#b7e8b7' : lastFetchMs < 1500 ? '#f5d87a' : '#f5a0a0'}`,
              fontSize: '11px',
              color: '#4e5968',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontWeight: 700 }}>⏱ {lastFetchMs}ms</span>
            <span>|</span>
            <span>{places.length}건 · 셔플됨</span>
          </div>
        )}

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
