/**
 * EmptyState.tsx — 데이터 없을 때 / 오류 발생 시 표시
 */
import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        gap: '12px',
      }}
    >
      <div style={{ fontSize: '40px', lineHeight: 1 }}>🔍</div>
      <p
        style={{
          fontSize: '17px',
          fontWeight: 600,
          color: '#191f28',
          margin: 0,
        }}
      >
        {title}
      </p>
      {description && (
        <p
          style={{
            fontSize: '14px',
            color: '#6b7684',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          style={{
            marginTop: '8px',
            padding: '12px 24px',
            backgroundColor: '#3182F6',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/** 폴백 데이터 표시 배너 */
export function FallbackBanner() {
  return (
    <div
      style={{
        backgroundColor: '#fff8e1',
        borderRadius: '8px',
        padding: '10px 16px',
        margin: '8px 0',
        fontSize: '13px',
        color: '#856404',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <span>⚠️</span>
      <span>현재 데이터 연결이 불안정해 기본 추천을 보여드려요</span>
    </div>
  );
}
