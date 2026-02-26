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

// 초기·추가 로드 단위 — 절반 감축으로 초기 통신량 절감
const NUM_OF_ROWS = 10;

// ─── 정렬 타입 ──────────────────────────────────────────
type SortMode = 'popular' | 'nameAsc' | 'nameDesc' | 'distance';

interface SortChip {
  mode: SortMode;
  label: string;
}
const SORT_CHIPS: SortChip[] = [
  { mode: 'popular',  label: '인기순'  },
  { mode: 'nameAsc',  label: '이름 ▲' },
  { mode: 'nameDesc', label: '이름 ▼' },
  { mode: 'distance', label: '거리순'  },
];

// ─── Haversine 거리 (m) ─────────────────────────────────
function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
  const [pageNo, setPageNo]         = useState(1);
  const [hasMore, setHasMore]       = useState(true);

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
      try {
        const res = await fetchPlaceList({
          area:      useLocation ? undefined : selectedArea?.code,
          timeSlot:  selectedTimeSlot ?? 'now',
          lat:       useLocation ? userLat : undefined,
          lng:       useLocation ? userLng : undefined,
          pageNo:    page,
          numOfRows: NUM_OF_ROWS,
        });

        if (reset) {
          // 새로고침: 풀 초기화 + 인기순 난수 초기화
          shuffleMap.current.clear();
          setAllPlaces(res.items);
        } else {
          setAllPlaces((prev) => [...prev, ...res.items]);
        }

        setTotalCount(res.totalCount);
        setIsFallback(res.isFallback ?? false);
        // totalCount 기반 hasMore — 더 이상 페이지 없으면 버튼 숨김
        setHasMore(page * NUM_OF_ROWS < res.totalCount);
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

      {/* 정렬 칩 */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          padding: '10px 20px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {SORT_CHIPS.map(({ mode, label }) => {
          const isDistance = mode === 'distance';
          const disabled   = isDistance && !hasGeo;
          const active     = sortMode === mode;
          return (
            <button
              key={mode}
              disabled={disabled}
              onClick={() => !disabled && setSortMode(mode)}
              style={{
                flexShrink: 0,
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                fontSize: '13px',
                fontWeight: active ? 600 : 400,
                cursor: disabled ? 'not-allowed' : 'pointer',
                background: active ? '#3182F6' : '#f2f4f6',
                color: disabled ? '#c2c8cf' : active ? '#fff' : '#4e5968',
                transition: 'background 0.15s, color 0.15s',
              }}
              title={disabled ? '위치 정보 사용 동의 후 이용 가능합니다' : undefined}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 검색 입력 */}
      <div style={{ padding: '0 20px 12px' }}>
        <div style={{ position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '15px',
              pointerEvents: 'none',
            }}
          >
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="장소명 또는 주소로 검색"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 36px 10px 38px',
              borderRadius: '12px',
              border: '1px solid #e5e8eb',
              fontSize: '14px',
              color: '#191f28',
              background: '#f8f9fa',
              outline: 'none',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '15px',
                color: '#8b95a1',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <p style={{ margin: '4px 2px 0', fontSize: '12px', color: '#8b95a1' }}>
            "{searchQuery}" 검색 결과 {displayPlaces.length}개
          </p>
        )}
      </div>

      {/* 목록 */}
      <div style={{ padding: '0 20px 32px' }}>
        {isFallback && <FallbackBanner />}

        {loading && allPlaces.length === 0 ? (
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
