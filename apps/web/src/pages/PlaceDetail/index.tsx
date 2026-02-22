/**
 * PlaceDetail/index.tsx — 장소 상세 화면
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPlaceDetail, fetchPlaceImages } from '@/lib/tourApiClient';
import { useWishlist } from '@/lib/wishlistContext';
import { PageHeader } from '@/components/PageHeader';
import { PageLoader } from '@/components/Skeletons';
import { EmptyState } from '@/components/EmptyState';
import { ImageViewer } from '@/components/ImageViewer';
import type { PlaceDetail, PlaceImage } from '@/types';

export default function PlaceDetailPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const { add, remove, has } = useWishlist();

  const [detail, setDetail] = useState<PlaceDetail | null>(null);
  const [images, setImages] = useState<PlaceImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  /** 이미지 미리보기 모달: 열린 이미지의 인덱스, null이면 닫힘 */
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);



  useEffect(() => {
    if (!contentId) return;

    let cancelled = false;
    setLoading(true);
    setError(false);

    Promise.all([
      fetchPlaceDetail(contentId),
      fetchPlaceImages(contentId),
    ])
      .then(([detailRes, imagesRes]) => {
        if (cancelled) return;
        setDetail(detailRes.data);
        setImages(imagesRes);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [contentId]);

  const handleWishlistToggle = useCallback(() => {
    if (!contentId || !detail) return;
    if (has(contentId)) {
      remove(contentId);
    } else {
      add({
        contentId,
        title: detail.title,
        addr1: detail.addr1,
        firstimage: detail.firstimage,
        savedAt: Date.now(),
      });
    }
  }, [contentId, detail, has, add, remove]);

  if (loading) return <PageLoader />;
  if (error || !detail) {
    return (
      <div>
        <PageHeader title="장소 상세" />
        <EmptyState
          title="장소 정보를 불러오지 못했어요"
          description="잠시 후 다시 시도해주세요"
          action={{ label: '돌아가기', onClick: () => navigate(-1) }}
        />
      </div>
    );
  }

  const displayImages =
    images.length > 0
      ? images.map((img) => img.originimgurl)
      : detail.firstimage
      ? [detail.firstimage]
      : [];

  const wishlisted = has(contentId!);

  return (
    <div style={{ paddingBottom: '48px' }}>
      <PageHeader
        title={detail.title.length > 16 ? detail.title.slice(0, 16) + '…' : detail.title}
        rightElement={
          <button
            onClick={handleWishlistToggle}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '22px',
              cursor: 'pointer',
            }}
            aria-label={wishlisted ? '위시리스트 제거' : '위시리스트 추가'}
          >
            {wishlisted ? '❤️' : '🤍'}
          </button>
        }
      />

      {/* 대표 이미지 */}
      <div
        style={{
          width: '100%',
          height: '240px',
          background: '#f2f4f6',
          overflow: 'hidden',
          cursor: displayImages[0] ? 'zoom-in' : 'default',
        }}
        onClick={() => displayImages[0] && setViewerIndex(0)}
        role={displayImages[0] ? 'button' : undefined}
        aria-label={displayImages[0] ? '이미지 크게 보기' : undefined}
      >
        {displayImages[0] ? (
          <img
            src={displayImages[0]}
            alt={detail.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              color: '#c4c9d4',
            }}
          >
            🏛️
          </div>
        )}
      </div>

      {/* 추가 이미지 가로 스크롤 */}
      {displayImages.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '8px 20px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {displayImages.slice(1).map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              loading="lazy"
              onClick={() => setViewerIndex(i + 1)}
              style={{
                flexShrink: 0,
                width: '80px',
                height: '60px',
                objectFit: 'cover',
                borderRadius: '8px',
                cursor: 'zoom-in',
              }}
            />
          ))}
        </div>
      )}

      <div style={{ padding: '20px' }}>
        {/* 장소명 & 주소 */}
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#191f28',
            margin: '0 0 6px',
          }}
        >
          {detail.title}
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7684', margin: '0 0 16px' }}>
          📍 {detail.addr1}
          {detail.addr2 ? ` ${detail.addr2}` : ''}
        </p>

        {/* 연락처 */}
        {detail.tel && (
          <p style={{ fontSize: '14px', color: '#6b7684', margin: '0 0 16px' }}>
            📞 {detail.tel}
          </p>
        )}

        {/* Quiet Score — 잠정 준비 메시지 (평가 기능 v2에서 오픈 예정) */}
        <section
          style={{
            background: '#f8f9fa',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <h3
            style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: '#191f28' }}
          >
            🤫 조용함 지수
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7684', margin: 0 }}>
            방문자 평가 데이터를 수집 중이에요. 업데이트를 기대해주세요!
          </p>
        </section>

        {/* 소개 */}
        {detail.overview && (
          <section style={{ marginBottom: '20px' }}>
            <h3
              style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: '#191f28' }}
            >
              소개
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: '#4e5968',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {detail.overview}
            </p>
          </section>
        )}

        {/* 길찾기 버튼 (외부 링크 1개만) */}
        <a
          href={`https://map.kakao.com/link/map/${encodeURIComponent(detail.title)},${detail.mapy},${detail.mapx}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            width: '100%',
            padding: '15px',
            borderRadius: '12px',
            background: '#f2f4f6',
            color: '#191f28',
            fontSize: '15px',
            fontWeight: 600,
            textAlign: 'center',
            textDecoration: 'none',
            boxSizing: 'border-box',
          }}
        >
          🗺️ 길찾기 (카카오맵)
        </a>
        <p style={{ fontSize: '11px', color: '#b0b8c1', textAlign: 'center', marginTop: '6px' }}>
          외부 앱으로 이동합니다
        </p>
      </div>

      {/* 이미지 전체화면 미리보기 모달 */}
      {viewerIndex !== null && (
        <ImageViewer
          images={displayImages}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </div>
  );
}
