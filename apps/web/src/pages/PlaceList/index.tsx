/**
 * PlaceList/index.tsx — 장소 목록 화면
 * - 정렬: 인기순(랜덤·기본) / 이름 ▲ / 이름 ▼ / 거리순
 * - 검색: 장소명·주소 키워드 필터 (클라이언트 사이드)
 * - 통신량 절감: numOfRows 10 / 정렬·검색 시 재호출 없음
 */
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
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

  // ── 원본 풀 (API 수신 순서 그대로 보존) ────────────────
  const [allPlaces, setAllPlaces]   = useState<Place[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  /** 마지막 API 응답 시간 (ms). null = 미측정 */
  const [lastFetchMs, setLastFetchMs] = useState<number | null>(null);

  // ── UI 상태 ────────────────────────────────────────────
  const [sortMode, setSortMode]       = useState<SortMode>('popular');
  const [searchQuery, setSearchQuery] = useState('');

  // 인기순용 안정 난수 맵 — 로드마다 초기화
  const shuffleMap = useRef<Map<string, number>>(new Map());

  // 광고: 최초 로드 완료 후 새로고침 시만 전면형
  const isFirstLoad = useRef(true);

  // ── 진입 조건 체크 ──────────────────────────────────────
  useEffect(() => {
    if (!selectedTimeSlot && !useLocation && !selectedArea) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [selectedArea, selectedTimeSlot, useLocation, navigate]);

  // ── 데이터 로드 ─────────────────────────────────────────
  const loadPlaces = useCallback(
    async (page: number, reset = false) => {
      setLoading(true);
      setError(false);
      const t0 = performance.now();
      try {
        const res = await fetchPlaceList({
          area:      useLocation ? undefined : selectedArea?.code,
          timeSlot:  selectedTimeSlot ?? 'now',
          lat:       useLocation ? userLat : undefined,
          lng:       useLocation ? userLng : undefined,
          pageNo:    page,
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
        // totalCount 기반 hasMore — 더 이상 페이지 없으면 버튼 숨김
        setHasMore(page * NUM_OF_ROWS < res.totalCount);
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
    setAllPlaces([]);
    loadPlaces(1, true);
  }, [loadPlaces]);

  // ── 표시 목록: 검색 → 정렬 (재호출 없음) ──────────────
  const displayPlaces = useMemo<Place[]>(() => {
    // 1. 키워드 필터
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? allPlaces.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.addr1.toLowerCase().includes(q)
        )
      : allPlaces;

    // 2. 정렬
    const sorted = [...filtered];
    if (sortMode === 'nameAsc') {
      sorted.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    } else if (sortMode === 'nameDesc') {
      sorted.sort((a, b) => b.title.localeCompare(a.title, 'ko'));
    } else if (sortMode === 'distance' && userLat != null && userLng != null) {
      sorted.sort(
        (a, b) =>
          haversineM(userLat, userLng, a.mapy, a.mapx) -
          haversineM(userLat, userLng, b.mapy, b.mapx)
      );
    } else if (sortMode === 'popular') {
      // 세션 내 안정 랜덤 (새로고침마다 초기화)
      sorted.sort((a, b) => {
        if (!shuffleMap.current.has(a.contentId))
          shuffleMap.current.set(a.contentId, Math.random());
        if (!shuffleMap.current.has(b.contentId))
          shuffleMap.current.set(b.contentId, Math.random());
        return shuffleMap.current.get(a.contentId)! - shuffleMap.current.get(b.contentId)!;
      });
    }
    return sorted;
  }, [allPlaces, sortMode, searchQuery, userLat, userLng]);

  // ── 핸들러 ─────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    if (!isFirstLoad.current) void showInterstitialAd();
    setPageNo(1);
    await loadPlaces(1, true);
  }, [loadPlaces]);

  const handleLoadMore = useCallback(() => {
    const next = pageNo + 1;
    setPageNo(next);
    loadPlaces(next, false);
  }, [pageNo, loadPlaces]);

  const handleTimeSlotChange = useCallback(
    (slot: TimeSlot) => { setTimeSlot(slot); },
    [setTimeSlot]
  );

  // ── 레이블 ─────────────────────────────────────────────
  const locationLabel = useLocation ? '내 주변' : selectedArea?.name ?? '';
  const timeLabel = TIME_SLOTS.find((t) => t.key === selectedTimeSlot)?.label ?? '';
  const hasGeo = useLocation && userLat != null && userLng != null;

  // ── 렌더 ───────────────────────────────────────────────
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

      {/* 시간대 칩 */}
      <div style={{ padding: '12px 20px 0' }}>
        <TimeSlotChips selected={selectedTimeSlot} onSelect={handleTimeSlotChange} />
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
        ) : error && allPlaces.length === 0 ? (
          <EmptyState
            title="장소를 불러오지 못했어요"
            description="네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요"
            action={{ label: '다시 시도', onClick: handleRefresh }}
          />
        ) : displayPlaces.length === 0 && searchQuery ? (
          <EmptyState
            title="검색 결과가 없어요"
            description="다른 키워드로 검색하거나 더 많은 장소를 불러와보세요"
            action={hasMore ? { label: '장소 더 불러오기', onClick: handleLoadMore } : undefined}
          />
        ) : allPlaces.length === 0 ? (
          <EmptyState
            title="해당 조건의 장소가 없어요"
            description="다른 지역이나 시간대를 선택해보세요"
            action={{ label: '지역 다시 선택', onClick: () => navigate(ROUTES.REGION_SELECT) }}
          />
        ) : (
          <>
            {displayPlaces.map((place) => {
              const distM =
                hasGeo
                  ? haversineM(userLat!, userLng!, place.mapy, place.mapx)
                  : undefined;
              return (
                <PlaceCard
                  key={place.contentId}
                  place={place}
                  distanceMeters={distM}
                  isWishlisted={has(place.contentId)}
                  onWishlistToggle={() => {
                    if (has(place.contentId)) {
                      remove(place.contentId);
                    } else {
                      add({
                        contentId:  place.contentId,
                        title:      place.title,
                        addr1:      place.addr1,
                        firstimage: place.firstimage,
                        savedAt:    Date.now(),
                      });
                    }
                  }}
                />
              );
            })}

            {/* 추가 로드 */}
            {hasMore && !searchQuery && (
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
