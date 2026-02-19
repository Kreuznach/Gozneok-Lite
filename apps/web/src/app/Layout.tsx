import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * 앱 최상위 레이아웃
 * - TDS WebView 기준 최대 너비/패딩 설정
 * - 라이트 모드 기준
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        maxWidth: '430px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}
