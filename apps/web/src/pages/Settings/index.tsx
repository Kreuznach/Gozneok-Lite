/**
 * Settings/index.tsx — 설정 화면
 *
 * 숨겨진 개발자 메뉴 진입:
 *   버전 항목을 5회 연속 탭 → "개발자 메뉴" 링크 토글
 *   (localStorage 'gz_debug_enabled' 으로 상태 유지)
 */
import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { memoryCache } from '@/lib/cache';
import { clearAllCache } from '@/lib/storage';
import { isAdSupported } from '@/lib/admob';
import { APP_DISPLAY_NAME, APP_VERSION } from '@/types/constants';
import { ROUTES } from '@/app/routes';

const DEBUG_ENABLED_KEY = 'gz_debug_enabled';
const UNLOCK_TAPS = 5;
const TAP_RESET_MS = 3000;

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
  const navigate = useNavigate();
  const [cacheCleared, setCacheCleared] = useState(false);
  const [adSupported, setAdSupported] = useState<boolean | null>(null);

  // 개발자 메뉴 활성화 상태
  const [debugEnabled, setDebugEnabled] = useState(
    () => localStorage.getItem(DEBUG_ENABLED_KEY) === 'true'
  );
  // 버전 탭 카운터 (Easter egg)
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 탭 힌트 표시 ('3번 더' 등)
  const [tapHint, setTapHint] = useState<string | null>(null);

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

  /** 버전 항목 5회 탭 → 개발자 메뉴 토글 */
  const handleVersionTap = useCallback(() => {
    tapCountRef.current += 1;
    const remaining = UNLOCK_TAPS - tapCountRef.current;

    // 타이머 리셋 (3초 내 연속 탭 아니면 초기화)
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
      setTapHint(null);
    }, TAP_RESET_MS);

    if (remaining <= 0) {
      // 잠금 해제 / 재잠금 토글
      tapCountRef.current = 0;
      setTapHint(null);
      const next = !debugEnabled;
      setDebugEnabled(next);
      localStorage.setItem(DEBUG_ENABLED_KEY, String(next));
    } else if (tapCountRef.current >= 2) {
      // 2탭부터 힌트 표시
      setTapHint(`${remaining}번 더 탭하면 개발자 메뉴가 ${debugEnabled ? '비활성화' : '활성화'}됩니다`);
    }
  }, [debugEnabled]);

  return (
    <div>
      <PageHeader title="설정" />
      <div style={{ padding: '0 20px 48px' }}>
        {/* 앱 정보 */}
        <section style={{ marginBottom: '8px' }}>
          <p style={sectionLabel}>앱 정보</p>
          <SettingsRow label="앱 이름" value={APP_DISPLAY_NAME} />
          {/* 버전 항목 — 5회 탭으로 개발자 메뉴 토글 */}
          <SettingsRow
            label="버전"
            value={`v${APP_VERSION}${tapHint ? '' : ''}`}
            onLabelClick={handleVersionTap}
          />
          {tapHint && (
            <p style={{ fontSize: '11px', color: '#8b95a1', margin: '2px 0 8px', paddingLeft: '2px' }}>
              {tapHint}
            </p>
          )}
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

        {/* 위치 */}
        <section style={{ marginBottom: '8px' }}>
          <p style={sectionLabel}>권한</p>
          <SettingsRow
            label="위치 권한"
            value="권한 상태는 Toss 앱 설정에서 확인하세요"
          />
        </section>

        {/* 광고 */}
        <section style={{ marginBottom: '8px' }}>
          <p style={sectionLabel}>광고</p>
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

        {/* 개발자 메뉴 — 버전 5탭 후 노출 */}
        {debugEnabled && (
          <section>
            <p style={{ ...sectionLabel, color: '#e5534b' }}>개발자</p>
            <SettingsRow
              label="🛠️ API 진단"
              value="API 호출 로그 및 에러 확인"
              action={{
                label: '열기',
                onClick: () => navigate(ROUTES.DEBUG),
              }}
            />
            <SettingsRow
              label="개발자 메뉴 비활성화"
              value="이 항목을 비활성화합니다"
              action={{
                label: '끄기',
                onClick: () => {
                  setDebugEnabled(false);
                  localStorage.setItem(DEBUG_ENABLED_KEY, 'false');
                },
                danger: true,
              }}
            />
          </section>
        )}
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
