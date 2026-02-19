/**
 * Settings/index.tsx — 설정 화면
 */
import React, { useState, useCallback } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { memoryCache } from '@/lib/cache';
import { clearAllCache } from '@/lib/storage';
import { isAdSupported } from '@/lib/admob';
import { APP_DISPLAY_NAME, APP_VERSION } from '@/types/constants';

function SettingsRow({
  label,
  value,
  action,
}: {
  label: string;
  value?: string;
  action?: { label: string; onClick: () => void; danger?: boolean };
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
      <div>
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
  const [adSupported, setAdSupported] = useState<boolean | null>(null);

  const handleClearCache = useCallback(() => {
    memoryCache.clear();
    clearAllCache();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2000);
  }, []);

  const handleCheckAd = useCallback(async () => {
    const result = await isAdSupported();
    setAdSupported(result);
  }, []);

  return (
    <div>
      <PageHeader title="설정" />
      <div style={{ padding: '0 20px 32px' }}>
        {/* 앱 정보 */}
        <section style={{ marginBottom: '8px' }}>
          <p
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#8b95a1',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '16px 0 8px',
              margin: 0,
            }}
          >
            앱 정보
          </p>
          <SettingsRow label="앱 이름" value={APP_DISPLAY_NAME} />
          <SettingsRow label="버전" value={`v${APP_VERSION}`} />
          <SettingsRow
            label="데이터 출처"
            value="한국관광공사 TourAPI (공공데이터포털)"
          />
        </section>

        {/* 데이터 */}
        <section style={{ marginBottom: '8px' }}>
          <p
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#8b95a1',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '16px 0 8px',
              margin: 0,
            }}
          >
            데이터
          </p>
          <SettingsRow
            label="캐시 초기화"
            value={cacheCleared ? '✅ 초기화 완료' : '불필요한 임시 데이터를 지웁니다'}
            action={{ label: '초기화', onClick: handleClearCache }}
          />
        </section>

        {/* 위치 */}
        <section style={{ marginBottom: '8px' }}>
          <p
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#8b95a1',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '16px 0 8px',
              margin: 0,
            }}
          >
            권한
          </p>
          <SettingsRow
            label="위치 권한"
            value="권한 상태는 Toss 앱 설정에서 확인하세요"
            // TODO: @apps-in-toss/web-framework 권한 상태 조회 API 연동
          />
        </section>

        {/* 광고 */}
        <section>
          <p
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#8b95a1',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '16px 0 8px',
              margin: 0,
            }}
          >
            광고
          </p>
          <SettingsRow
            label="광고 지원 여부"
            value={
              adSupported === null
                ? '확인하려면 버튼을 누르세요'
                : adSupported
                ? '✅ 지원됨'
                : '❌ 미지원 (폴백 동작 중)'
            }
            action={{ label: '확인', onClick: handleCheckAd }}
          />
          <p style={{ fontSize: '12px', color: '#b0b8c1', marginTop: '8px' }}>
            광고는 서비스 무료 제공을 위해 노출됩니다.
            광고가 표시되지 않아도 모든 기능은 정상 동작합니다.
          </p>
        </section>
      </div>
    </div>
  );
}
