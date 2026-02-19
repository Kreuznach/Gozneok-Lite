/**
 * Skeletons.tsx — 페이지/카드 로딩 스켈레톤 + PageLoader
 */
import React from 'react';

const baseStyle: React.CSSProperties = {
  backgroundColor: '#f2f4f6',
  borderRadius: '8px',
  animation: 'gz-pulse 1.4s ease-in-out infinite',
};

/** 애니메이션 키프레임 주입 (단 1회) */
if (typeof document !== 'undefined') {
  const id = 'gz-skeleton-style';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes gz-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
    `;
    document.head.appendChild(style);
  }
}

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = '16px', style }: SkeletonProps) {
  return <div style={{ ...baseStyle, width, height, ...style }} />;
}

/** 장소 카드 스켈레톤 */
export function PlaceCardSkeleton() {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '0',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        marginBottom: '12px',
      }}
    >
      <Skeleton height="180px" style={{ borderRadius: '16px 16px 0 0' }} />
      <div style={{ padding: '16px' }}>
        <Skeleton height="20px" width="60%" />
        <Skeleton height="14px" width="80%" style={{ marginTop: '8px' }} />
        <Skeleton height="14px" width="40%" style={{ marginTop: '6px' }} />
      </div>
    </div>
  );
}

/** 전체 페이지 로딩 */
export function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          border: '3px solid #f2f4f6',
          borderTop: '3px solid #3182F6',
          borderRadius: '50%',
          animation: 'gz-spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes gz-spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ color: '#8b95a1', fontSize: '14px' }}>불러오는 중</span>
    </div>
  );
}
