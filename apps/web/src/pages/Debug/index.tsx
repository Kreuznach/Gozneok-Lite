/**
 * Debug/index.tsx — 개발 전용 디버그 화면
 * ⚠️ 프로덕션 빌드에서는 동적 import로 분리되어 숨겨짐
 */
import React, { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { memoryCache } from '@/lib/cache';
import { getDeviceId } from '@/lib/storage';
import { isAdSupported } from '@/lib/admob';
import { APP_VERSION } from '@/types/constants';

const DUMMY_TOGGLE_KEY = 'gz_debug_use_dummy';

export default function DebugPage() {
  const [useDummy, setUseDummy] = useState(
    () => localStorage.getItem(DUMMY_TOGGLE_KEY) === 'true'
  );
  const [adSupported, setAdSupported] = useState<boolean | null>(null);
  const [cacheCleared, setCacheCleared] = useState(false);

  const toggleDummy = () => {
    const next = !useDummy;
    setUseDummy(next);
    localStorage.setItem(DUMMY_TOGGLE_KEY, String(next));
    // 서버 재시작 필요 메시지 (실제로는 API 서버가 ENV를 읽음)
  };

  const checkAd = async () => {
    const r = await isAdSupported();
    setAdSupported(r);
  };

  const clearCache = () => {
    memoryCache.clear();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 1500);
  };

  return (
    <div>
      <PageHeader title="🛠️ Debug (Dev Only)" />
      <div style={{ padding: '16px 20px 40px', fontFamily: 'monospace' }}>
        <p
          style={{
            background: '#fff3cd',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '13px',
            color: '#856404',
            marginBottom: '20px',
          }}
        >
          ⚠️ 이 페이지는 개발 환경에서만 접근 가능합니다
        </p>

        {/* 앱 정보 */}
        <Section title="앱 정보">
          <Row label="버전" value={`v${APP_VERSION}`} />
          <Row label="환경" value={import.meta.env.MODE} />
          <Row label="API Base" value={import.meta.env.VITE_API_BASE_URL ?? '/api'} />
          <Row label="DeviceId" value={getDeviceId()} />
        </Section>

        {/* 더미 데이터 토글 */}
        <Section title="더미 데이터">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
            }}
          >
            <span style={{ fontSize: '14px' }}>더미 데이터 강제 사용</span>
            <button
              onClick={toggleDummy}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: useDummy ? '#ebf3ff' : '#f2f4f6',
                border: useDummy ? '1px solid #3182F6' : '1px solid #e5e8eb',
                color: useDummy ? '#3182F6' : '#4e5968',
                fontFamily: 'monospace',
                cursor: 'pointer',
              }}
            >
              {useDummy ? 'ON (더미)' : 'OFF (실데이터)'}
            </button>
          </div>
          <p style={{ fontSize: '11px', color: '#8b95a1', margin: '4px 0 0' }}>
            * API 서버의 USE_DUMMY_DATA 환경변수를 재시작 없이 직접 제어하려면
            서버 환경변수 수정이 필요합니다. 이 토글은 로컬 상태 표시용입니다.
          </p>
        </Section>

        {/* 광고 */}
        <Section title="광고 상태">
          <Row
            label="isSupported()"
            value={
              adSupported === null ? '미확인' : adSupported ? '✅ true' : '❌ false'
            }
          />
          <button
            onClick={checkAd}
            style={{
              marginTop: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#f2f4f6',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '13px',
            }}
          >
            광고 지원 여부 확인
          </button>
        </Section>

        {/* 캐시 */}
        <Section title="캐시">
          <button
            onClick={clearCache}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: cacheCleared ? '#d1fae5' : '#f2f4f6',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '13px',
            }}
          >
            {cacheCleared ? '✅ 클리어됨' : '메모리 캐시 초기화'}
          </button>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3
        style={{
          fontSize: '12px',
          fontWeight: 700,
          color: '#8b95a1',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          margin: '0 0 8px',
        }}
      >
        {title}
      </h3>
      <div
        style={{
          background: '#f8f9fa',
          borderRadius: '10px',
          padding: '12px 14px',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '13px',
        padding: '4px 0',
        gap: '8px',
      }}
    >
      <span style={{ color: '#6b7684', flexShrink: 0 }}>{label}</span>
      <span
        style={{
          color: '#191f28',
          wordBreak: 'break-all',
          textAlign: 'right',
        }}
      >
        {value}
      </span>
    </div>
  );
}
