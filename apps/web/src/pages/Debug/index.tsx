/**
 * Debug/index.tsx — API 진단 디버그 화면
 *
 * 진입 경로:
 *   - 설정 탭 > 버전 항목 5회 탭 → "개발자 메뉴" 링크 노출
 *   - 직접 URL: /#/debug
 *
 * ⚠️ 라우트는 항상 등록되어 있으나, 설정에서 활성화해야 진입 링크가 표시됨
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { memoryCache } from '@/lib/cache';
import { getDeviceId } from '@/lib/storage';
import { isAdSupported } from '@/lib/admob';
import { apiLogger, type ApiLogEntry } from '@/lib/apiLogger';
import { fetchPlaceList } from '@/lib/tourApiClient';
import { APP_VERSION } from '@/types/constants';

const DUMMY_TOGGLE_KEY = 'gz_debug_use_dummy';

// ─────────────────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────────────────

export default function DebugPage() {
  const navigate = useNavigate();

  // 더미 데이터 토글
  const [useDummy, setUseDummy] = useState(
    () => localStorage.getItem(DUMMY_TOGGLE_KEY) === 'true'
  );

  // 광고 지원 여부
  const [adSupported, setAdSupported] = useState<boolean | null>(null);

  // 캐시 초기화 피드백
  const [cacheCleared, setCacheCleared] = useState(false);

  // API 로그
  const [logs, setLogs] = useState<ApiLogEntry[]>(() => apiLogger.getLogs());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // 주기적 로그 갱신 (2초)
  useEffect(() => {
    const id = setInterval(() => setLogs(apiLogger.getLogs()), 2000);
    return () => clearInterval(id);
  }, []);

  const toggleDummy = () => {
    const next = !useDummy;
    setUseDummy(next);
    localStorage.setItem(DUMMY_TOGGLE_KEY, String(next));
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

  const refreshLogs = useCallback(() => {
    setLogs(apiLogger.getLogs());
  }, []);

  const clearLogs = useCallback(() => {
    apiLogger.clear();
    setLogs([]);
    setTestResult(null);
  }, []);

  /** 실제 API 호출 테스트 — 서울 지역 장소 목록 조회 */
  const runApiTest = useCallback(async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const data = await fetchPlaceList({ area: '1', pageNo: 1, numOfRows: 3 });
      const first = data.items?.[0];
      const imgUrl = first?.firstimage ?? first?.firstimage2;
      const imgProtocol = imgUrl
        ? (imgUrl.startsWith('https://') ? '✅ https' : '⚠️ http (Mixed Content!)')
        : '이미지 없음';
      setTestResult(
        `✅ 성공 — ${data.totalCount ?? '?'}건 중 ${data.items?.length ?? 0}건 반환\n이미지 URL 프로토콜: ${imgProtocol}`
      );
    } catch (err) {
      setTestResult(`❌ 실패 — ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsTesting(false);
      setLogs(apiLogger.getLogs());
    }
  }, []);

  return (
    <div>
      <PageHeader title="🛠️ API 진단" />
      <div style={{ padding: '16px 20px 56px', fontFamily: 'monospace' }}>

        {/* 경고 배너 */}
        <p
          style={{
            background: '#fff3cd',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '13px',
            color: '#856404',
            marginBottom: '20px',
            lineHeight: '1.6',
          }}
        >
          ⚠️ 이 페이지는 설정에서 활성화한 경우에만 진입 가능합니다.
          실제 API를 호출하므로 트래픽이 발생합니다.
        </p>

        {/* ── 앱 정보 ── */}
        <Section title="앱 · 환경 정보">
          <Row label="버전" value={`v${APP_VERSION}`} />
          <Row label="환경" value={import.meta.env.MODE} />
          <Row
            label="TourAPI Base"
            value="apis.data.go.kr/B551011/KorService2"
          />
          <Row label="DeviceId" value={getDeviceId()} />
          <Row label="UserAgent" value={navigator.userAgent.slice(0, 60) + '…'} />
        </Section>

        {/* ── API 직접 테스트 ── */}
        <Section title="API 테스트">
          <p style={{ fontSize: '12px', color: '#6b7684', margin: '0 0 10px' }}>
            서울 지역 장소 목록(3건)을 실제로 요청합니다.
          </p>
          <button
            onClick={runApiTest}
            disabled={isTesting}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: isTesting ? '#f2f4f6' : '#3182F6',
              color: isTesting ? '#8b95a1' : '#ffffff',
              border: 'none',
              fontFamily: 'monospace',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isTesting ? 'not-allowed' : 'pointer',
              width: '100%',
            }}
          >
            {isTesting ? '요청 중…' : '▶ 장소 목록 API 호출'}
          </button>
          {testResult && (
            <p
              style={{
                marginTop: '10px',
                fontSize: '13px',
                background: testResult.startsWith('✅') ? '#f0fff4' : '#fff0f0',
                color: testResult.startsWith('✅') ? '#155724' : '#842029',
                borderRadius: '6px',
                padding: '8px 12px',
                wordBreak: 'break-all',
                whiteSpace: 'pre-line',
              }}
            >
              {testResult}
            </p>
          )}
        </Section>

        {/* ── API 호출 로그 ── */}
        <Section title={`API 호출 로그 (${logs.length}건)`}>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '10px',
            }}
          >
            <button onClick={refreshLogs} style={btnStyle('#ebf3ff', '#3182F6')}>
              새로고침
            </button>
            <button onClick={clearLogs} style={btnStyle('#fff0f0', '#e5534b')}>
              전체 삭제
            </button>
          </div>

          {logs.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#8b95a1', textAlign: 'center', padding: '16px 0' }}>
              아직 기록된 호출이 없습니다.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {logs.map((log) => (
                <LogItem key={log.id} log={log} />
              ))}
            </div>
          )}
        </Section>

        {/* ── 더미 데이터 ── */}
        <Section title="더미 데이터">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 0',
            }}
          >
            <span style={{ fontSize: '14px', color: '#191f28' }}>
              더미 데이터 강제 사용
            </span>
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
          <p style={{ fontSize: '11px', color: '#8b95a1', margin: '6px 0 0' }}>
            * API 서버의 USE_DUMMY_DATA 환경변수와 별개입니다.
            서버 측 설정은 서버 재시작이 필요합니다.
          </p>
        </Section>

        {/* ── 광고 ── */}
        <Section title="광고 상태">
          <Row
            label="isSupported()"
            value={adSupported === null ? '미확인' : adSupported ? '✅ true' : '❌ false'}
          />
          <button
            onClick={checkAd}
            style={{ ...btnStyle('#f2f4f6', '#4e5968'), marginTop: '8px' }}
          >
            광고 지원 여부 확인
          </button>
        </Section>

        {/* ── 캐시 ── */}
        <Section title="캐시">
          <button
            onClick={clearCache}
            style={btnStyle(cacheCleared ? '#d1fae5' : '#f2f4f6', cacheCleared ? '#155724' : '#4e5968')}
          >
            {cacheCleared ? '✅ 클리어됨' : '메모리 캐시 초기화'}
          </button>
        </Section>

        {/* 뒤로가기 */}
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: '8px',
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            background: '#f2f4f6',
            border: 'none',
            fontSize: '14px',
            color: '#4e5968',
            cursor: 'pointer',
          }}
        >
          ← 뒤로가기
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 서브 컴포넌트
// ─────────────────────────────────────────────────────────

function LogItem({ log }: { log: ApiLogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const time = new Date(log.timestamp).toLocaleTimeString('ko-KR');
  const isOk = log.ok;
  const statusColor = isOk ? '#155724' : '#842029';
  const statusBg = isOk ? '#d1f0da' : '#f8d7da';

  return (
    <div
      onClick={() => setExpanded((v) => !v)}
      style={{
        background: '#ffffff',
        border: `1px solid ${isOk ? '#c3e6cb' : '#f5c2c7'}`,
        borderRadius: '8px',
        padding: '10px 12px',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* 요약 행 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            background: statusBg,
            color: statusColor,
            borderRadius: '4px',
            padding: '2px 6px',
            flexShrink: 0,
          }}
        >
          {log.status}
        </span>
        <span
          style={{
            fontSize: '12px',
            color: '#4e5968',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 'calc(100% - 100px)',
          }}
        >
          {log.url}
        </span>
        <span style={{ fontSize: '11px', color: '#8b95a1', marginLeft: 'auto', flexShrink: 0 }}>
          {log.durationMs}ms
        </span>
      </div>

      {/* 실패 시: 접힌 상태에서도 에러 메시지 1줄 표시 */}
      {!isOk && log.error && !expanded && (
        <p
          style={{
            margin: '6px 0 0',
            fontSize: '11px',
            color: '#842029',
            background: '#fff5f5',
            borderRadius: '4px',
            padding: '4px 8px',
            wordBreak: 'break-all',
            lineHeight: '1.5',
          }}
        >
          {log.error}
        </p>
      )}

      {/* 상세 (펼침) */}
      {expanded && (
        <div
          style={{
            marginTop: '8px',
            fontSize: '11px',
            color: '#4e5968',
            lineHeight: '1.8',
            wordBreak: 'break-all',
          }}
        >
          <b>시각:</b> {time}
          <br />
          <b>URL:</b> {log.url}
          <br />
          <b>상태:</b> {log.status} ({isOk ? 'OK' : 'FAIL'})
          <br />
          <b>소요:</b> {log.durationMs}ms
          {log.error && (
            <>
              <br />
              <b>에러:</b>{' '}
              <span style={{ color: '#842029' }}>{log.error}</span>
            </>
          )}
        </div>
      )}
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

function Row({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
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
          color: highlight ? '#e5534b' : '#191f28',
          wordBreak: 'break-all',
          textAlign: 'right',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function btnStyle(bg: string, color: string): React.CSSProperties {
  return {
    padding: '8px 14px',
    borderRadius: '8px',
    background: bg,
    color,
    border: 'none',
    fontFamily: 'monospace',
    fontSize: '13px',
    cursor: 'pointer',
  };
}
