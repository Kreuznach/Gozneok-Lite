/**
 * PlaceCard.tsx — 장소 목록 카드
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Place } from '@/types';
import { ScoreBadge } from './ScoreBadge';
import { calcBayesianScore } from '@/lib/quietScore';
import { toPlaceDetail } from '@/app/routes';

interface PlaceCardProps {
  place: Place;
  votes?: number[];           // 투표 점수 배열 (서버에서 받는 경우)
  distanceMeters?: number;    // 거리 (위치 권한 허용 시)
  onWishlistToggle?: () => void;
  isWishlisted?: boolean;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export function PlaceCard({
  place,
  votes = [],
  distanceMeters,
  onWishlistToggle,
  isWishlisted = false,
}: PlaceCardProps) {
  const navigate = useNavigate();
  const score = calcBayesianScore(votes);

  return (
    <div
      onClick={() => navigate(toPlaceDetail(place.contentId))}
      style={{
        background: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        marginBottom: '12px',
        border: '1px solid #f2f4f6',
      }}
    >
      {/* 이미지 */}
      <div style={{ position: 'relative', height: '180px', background: '#f2f4f6' }}>
        {place.firstimage ? (
          <img
            src={place.firstimage2 ?? place.firstimage}
            alt={place.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              color: '#c4c9d4',
            }}
          >
            🏛️
          </div>
        )}
        {/* 위시리스트 버튼 */}
        {onWishlistToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWishlistToggle();
            }}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(255,255,255,0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label={isWishlisted ? '위시리스트 제거' : '위시리스트 추가'}
          >
            {isWishlisted ? '❤️' : '🤍'}
          </button>
        )}
      </div>

      {/* 텍스트 정보 */}
      <div style={{ padding: '14px 16px 16px' }}>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 700,
            margin: 0,
            color: '#191f28',
          }}
        >
          {truncate(place.title, 20)}
        </h3>
        <p
          style={{
            fontSize: '13px',
            color: '#6b7684',
            margin: '4px 0 10px',
          }}
        >
          {distanceMeters != null
            ? formatDistance(distanceMeters)
            : truncate(place.addr1, 30)}
        </p>
        <ScoreBadge score={score} voteCount={votes.length} size="sm" />
      </div>
    </div>
  );
}
