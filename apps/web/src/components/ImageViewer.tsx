/**
 * ImageViewer.tsx
 * 이미지 전체화면 미리보기 모달
 *
 * 사용법:
 *   <ImageViewer images={urls} initialIndex={0} onClose={() => setViewer(null)} />
 */
import React, { useEffect, useCallback } from 'react';

export interface ImageViewerProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export function ImageViewer({ images, initialIndex = 0, onClose }: ImageViewerProps) {
  const [current, setCurrent] = React.useState(initialIndex);

  const prev = useCallback(() => setCurrent((c) => Math.max(c - 1, 0)), []);
  const next = useCallback(() => setCurrent((c) => Math.min(c + 1, images.length - 1)), [images.length]);

  // 키보드 이벤트 (ESC / 방향키)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, prev, next]);

  // body 스크롤 잠금
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="이미지 미리보기"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.92)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 닫기 */}
      <button
        onClick={onClose}
        aria-label="닫기"
        style={{
          position: 'absolute',
          top: '14px',
          right: '14px',
          background: 'rgba(255,255,255,0.18)',
          border: 'none',
          borderRadius: '50%',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '17px',
          color: '#fff',
          cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        ✕
      </button>

      {/* 이미지 본체 — 클릭 버블링 차단 */}
      <img
        src={images[current]}
        alt={`이미지 ${current + 1}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '100%',
          maxHeight: '80vh',
          objectFit: 'contain',
          borderRadius: '8px',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      />

      {/* 네비게이션 & 인디케이터 */}
      {images.length > 1 && (
        <>
          {/* 이전 버튼 */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            disabled={current === 0}
            aria-label="이전 이미지"
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: current === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.18)',
              border: 'none',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              fontSize: '20px',
              color: current === 0 ? 'rgba(255,255,255,0.3)' : '#fff',
              cursor: current === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ‹
          </button>

          {/* 다음 버튼 */}
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            disabled={current === images.length - 1}
            aria-label="다음 이미지"
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: current === images.length - 1 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.18)',
              border: 'none',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              fontSize: '20px',
              color: current === images.length - 1 ? 'rgba(255,255,255,0.3)' : '#fff',
              cursor: current === images.length - 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ›
          </button>

          {/* 페이지 인디케이터 */}
          <p
            style={{
              position: 'absolute',
              bottom: '20px',
              color: 'rgba(255,255,255,0.65)',
              fontSize: '13px',
              margin: 0,
              userSelect: 'none',
            }}
          >
            {current + 1} / {images.length}
          </p>
        </>
      )}
    </div>
  );
}
