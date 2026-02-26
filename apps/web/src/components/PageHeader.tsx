/**
 * BackButton.tsx — 공통 뒤로가기 버튼
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  label?: string;
  to?: string;
}

export function BackButton({ label, to }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) navigate(to);
    else navigate(-1);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        color: '#3182F6',
        fontSize: '15px',
        fontWeight: 500,
        padding: '8px 0',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      ← {label ?? '뒤로'}
    </button>
  );
}

interface PageHeaderProps {
  title: string;
  /**
   * 앱 내 뒤로가기 버튼 표시 여부.
   * Toss 미니앱(WebView) 환경에서는 네이티브 네비게이션 바가 뒤로가기를 제공하므로
   * 기본값을 false로 유지합니다. 중복 노출 방지.
   */
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export function PageHeader({ title, showBack = false, rightElement }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px 10px',
        position: 'sticky',
        top: 0,
        backgroundColor: '#fff',
        zIndex: 10,
        borderBottom: '1px solid #f2f4f6',
      }}
    >
      {showBack ? (
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#191f28',
            padding: '4px',
          }}
          aria-label="뒤로가기"
        >
          ←
        </button>
      ) : (
        <div style={{ width: '32px' }} />
      )}
      <h1 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#191f28' }}>
        {title}
      </h1>
      <div style={{ minWidth: '32px', display: 'flex', justifyContent: 'flex-end' }}>
        {rightElement}
      </div>
    </div>
  );
}
