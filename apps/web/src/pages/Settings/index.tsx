/**
 * Settings/index.tsx — 설정 화면
 */
import React, { useState, useCallback } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { memoryCache } from '@/lib/cache';
import { clearAllCache, clearAllUserData } from '@/lib/storage';
import { APP_DISPLAY_NAME, APP_VERSION } from '@/types/constants';
import { useWishlist } from '@/lib/wishlistContext';

function SettingsRow({
  label,
  value,
  action,
  onLabelClick,
}: {
  label: string;
  value?: string;
  action?: { label: string; onClick: () => void; danger?: boolean };
  /** 라벨 영역 탭 콜백 (Easter egg 등) */
  onLabelClick?: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 0',
        borderBottom: '1px solid #f2f4f6',
      }}
    >
      <div onClick={onLabelClick} style={{ cursor: onLabelClick ? 'pointer' : undefined }}>
        <p style={{ fontSize: '15px', color: '#191f28', margin: 0 }}>{label}</p>
        {value && (
          <p style={{ fontSize: '12px', color: '#8b95a1', margin: '2px 0 0' }}>{value}</p>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            padding: '8px 14px',
            borderRadius: '8px',
            background: action.danger ? '#fff0f0' : '#f2f4f6',
            color: action.danger ? '#e5534b' : '#4e5968',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [cacheCleared, setCacheCleared] = useState(false);
  const [dataCleared, setDataCleared] = useState(false);
  const { wishlist } = useWishlist();

  const handleClearCache = useCallback(() => {
    memoryCache.clear();
    clearAllCache();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2000);
  }, []);

  const handleClearAllData = useCallback(() => {
    if (!window.confirm('위시리스트 데이터와 쾐시가 모두 삭제됩니다.\n이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?')) return;
    memoryCache.clear();
    clearAllUserData();
    setDataCleared(true);
    setTimeout(() => setDataCleared(false), 2000);
  }, []);

  return (
    <div>
      <PageHeader title="설정" />
      <div style={{ padding: '0 20px 48px' }}>
        {/* 앱 정보 */}
        <section style={{ marginBottom: '8px' }}>
          <p style={sectionLabel}>앱 정보</p>
          <SettingsRow label="앱 이름" value={APP_DISPLAY_NAME} />
          <SettingsRow
            label="버전"
            value={`v${APP_VERSION}`}
          />
          <SettingsRow
            label="데이터 출처"
            value="한국관광공사 TourAPI (공공데이터포털)"
          />
        </section>

        {/* 데이터 */}
        <section style={{ marginBottom: '8px' }}>
          <p style={sectionLabel}>데이터</p>
          <SettingsRow
            label="캐시 초기화"
            value={cacheCleared ? '✅ 초기화 완료' : '불필요한 임시 데이터를 지웁니다'}
            action={{ label: '초기화', onClick: handleClearCache }}
          />
        </section>

        {/* 개인 데이터 */}
        <section style={{ marginBottom: '8px' }}>
          <p style={sectionLabel}>개인 데이터</p>
          <SettingsRow
            label="저장된 위시리스트"
            value={`${wishlist.length}개 저장됨 · 기기 로컴 데이터`}
          />
          <SettingsRow
            label="전체 데이터 초기화"
            value={
              dataCleared
                ? '✅ 삭제 완료'
                : '위시리스트 및 캐시를 모두 삭제합니다'
            }
            action={{ label: '전체 삭제', onClick: handleClearAllData, danger: true }}
          />
          <p style={{ fontSize: '12px', color: '#b0b8c1', marginTop: '8px' }}>
            공개키 기반의 플레이스 정보는 기기에 저장되며, 서버로 전송되지 않습니다.
          </p>
        </section>

        {/* 위치 */}
        <section style={{ marginBottom: '8px' }}>
          <p style={sectionLabel}>권한</p>
          <SettingsRow
            label="위치 권한"
            value="권한 상태는 Toss 앱 설정에서 확인하세요"
          />
        </section>
      </div>
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  color: '#8b95a1',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  padding: '16px 0 8px',
  margin: 0,
};
