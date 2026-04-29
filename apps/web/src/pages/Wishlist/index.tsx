/**
 * Wishlist/index.tsx — 위시리스트 화면
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '@/lib/wishlistContext';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { toPlaceDetail } from '@/app/routes';
import { attachMainBannerAd } from '@/lib/admob';
import type { WishlistItem } from '@/types';

function WishlistCard({
  item,
  onRemove,
  onClick,
}: {
  item: WishlistItem;
  onRemove: () => void;
  onClick: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        borderRadius: '14px',
        background: '#fff',
        border: '1px solid #f2f4f6',
        marginBottom: '10px',
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      {/* 썸네일 */}
      <div
        style={{
          flexShrink: 0,
          width: '64px',
          height: '64px',
          borderRadius: '10px',
          overflow: 'hidden',
          background: '#f2f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          color: '#c4c9d4',
        }}
      >
        {item.firstimage ? (
          <img
            src={item.firstimage}
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          '🏛️'
        )}
      </div>

      {/* 텍스트 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: '#191f28',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.title}
        </p>
        <p
          style={{
            fontSize: '12px',
            color: '#8b95a1',
            margin: '3px 0 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.addr1}
        </p>
      </div>

      {/* 삭제 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        style={{
          flexShrink: 0,
          background: 'none',
          border: 'none',
          fontSize: '18px',
          cursor: 'pointer',
          color: '#c4c9d4',
          padding: '4px',
        }}
        aria-label="위시리스트 제거"
      >
        ✕
      </button>
    </div>
  );
}

export default function WishlistPage() {
  const navigate = useNavigate();
  const { wishlist, remove } = useWishlist();
  const [bannerHost, setBannerHost] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!bannerHost) return;
    const destroy = attachMainBannerAd(bannerHost);
    return () => { destroy?.(); };
  }, [bannerHost]);

  return (
    <div>
      <PageHeader title="위시리스트" />
      <div style={{ padding: '16px 20px 32px' }}>
        {wishlist.length === 0 ? (
          <EmptyState
            title="저장된 장소가 없어요"
            description="마음에 드는 장소를 찾으면 하트를 눌러 저장해보세요"
            action={{ label: '장소 탐색하기', onClick: () => navigate('/') }}
          />
        ) : (
          <>
            <p style={{ fontSize: '13px', color: '#8b95a1', margin: '0 0 12px' }}>
              {wishlist.length}개 저장됨 · 기기에 저장 (앱 삭제 시 초기화)
            </p>
            {wishlist.map((item) => (
              <WishlistCard
                key={item.contentId}
                item={item}
                onRemove={() => remove(item.contentId)}
                onClick={() => navigate(toPlaceDetail(item.contentId))}
              />
            ))}
          </>
        )}

        {/* 하단 배너 광고 (마이페이지 하단) */}
        <div
          ref={setBannerHost}
          style={{ width: '100%', marginTop: '24px' }}
        />
      </div>
    </div>
  );
}
