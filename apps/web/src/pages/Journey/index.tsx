/**
 * Journey/index.tsx — 내 고요 기록
 * 도장판 / 배지 / 주간 미션 / 한 달 리포트 / 한 줄 노트
 */
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { toPlaceDetail, ROUTES } from '@/app/routes';
import { useWishlist } from '@/lib/wishlistContext';
import {
  BADGES,
  SLOT_LABEL,
  SEASON_LABEL,
  getStamps,
  removeStamp,
  getBadgeRecords,
  getWeeklyMissions,
  getMonthlyReport,
} from '@/lib/journey';
import { AREAS } from '@/types/constants';
import type { Stamp } from '@/types';

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

export default function JourneyPage() {
  const navigate = useNavigate();
  const { wishlist } = useWishlist();
  const [stamps, setStamps] = useState<Stamp[]>(getStamps);

  const records = useMemo(() => getBadgeRecords(), [stamps]);
  const earnedIds = useMemo(() => new Set(records.map((r) => r.id)), [records]);
  const missions = useMemo(() => getWeeklyMissions(stamps, wishlist), [stamps, wishlist]);
  const report = useMemo(() => getMonthlyReport(stamps), [stamps]);

  const byArea = useMemo(() => {
    const map = new Map<string, Stamp[]>();
    stamps.forEach((s) => {
      map.set(s.areaCode, [...(map.get(s.areaCode) ?? []), s]);
    });
    return map;
  }, [stamps]);

  const handleRemove = useCallback((id: string) => {
    if (!window.confirm('이 도장을 지울까요?')) return;
    removeStamp(id);
    setStamps(getStamps());
  }, []);

  return (
    <div>
      <PageHeader title="내 고요 기록" />
      <div style={{ padding: '16px 20px 48px' }}>
        {/* 이번 주 작은 미션 */}
        <h2 style={h2}>🎯 이번 주 작은 미션</h2>
        {missions.map((m) => (
          <div key={m.id} style={{ ...card, background: m.done ? '#e8f5e9' : '#f8f9fa' }}>
            {m.done ? '✅ ' : '⬜ '}
            {m.title}
          </div>
        ))}
        <p style={hint}>못 해도 괜찮아요. 가볍게 즐겨 보세요!</p>

        {/* 한 달 리포트 */}
        <h2 style={h2}>📒 이번 달 고요 기록</h2>
        <div style={{ ...card, background: '#ebf3ff', lineHeight: 1.8 }}>
          <div>다녀온 곳: <b>{report.placeCount}곳</b></div>
          <div>
            가장 많이 간 시간대:{' '}
            <b>{report.topSlot ? SLOT_LABEL[report.topSlot] : '아직 없어요'}</b>
          </div>
          <div>
            새로 받은 배지:{' '}
            <b>
              {report.newBadges.length > 0
                ? report.newBadges.map((b) => `${b.emoji} ${b.name}`).join(', ')
                : '아직 없어요'}
            </b>
          </div>
        </div>

        {/* 배지 */}
        <h2 style={h2}>🏅 나의 배지</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {BADGES.map((b) => {
            const got = earnedIds.has(b.id);
            const current = Math.min(b.target, b.progress(stamps));
            return (
              <div
                key={b.id}
                style={{ ...card, marginBottom: 0, background: got ? '#fff8e1' : '#f8f9fa' }}
              >
                <div style={{ fontSize: '26px', filter: got ? 'none' : 'grayscale(1)' }}>{b.emoji}</div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{b.name}</div>
                <div style={{ fontSize: '11px', color: '#6b7684', margin: '2px 0 4px' }}>
                  {b.description}
                </div>
                <div style={{ fontSize: '12px', color: got ? '#b26a00' : '#8b95a1', fontWeight: 600 }}>
                  {got ? '달성!' : `${current} / ${b.target}`}
                </div>
              </div>
            );
          })}
        </div>

        {/* 도장판 */}
        <h2 style={h2}>🏷️ 지역별 도장판</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {AREAS.map((a) => {
            const places = new Set((byArea.get(a.code) ?? []).map((s) => s.contentId)).size;
            return (
              <div
                key={a.code}
                style={{
                  ...card,
                  marginBottom: 0,
                  textAlign: 'center',
                  background: places > 0 ? '#ebf3ff' : '#f8f9fa',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{a.name}</div>
                <div style={{ fontSize: '12px', color: places > 0 ? '#3182F6' : '#b0b8c1' }}>
                  {places > 0 ? `🔖 ${places}곳` : '비어 있어요'}
                </div>
              </div>
            );
          })}
        </div>

        {/* 도장 기록 & 한 줄 노트 */}
        <h2 style={h2}>📝 도장 기록 · 한 줄 노트</h2>
        {stamps.length === 0 ? (
          <EmptyState
            title="아직 찍은 도장이 없어요"
            description="장소 상세에서 '다녀왔어요'를 누르면 도장이 찍혀요"
            action={{ label: '장소 찾으러 가기', onClick: () => navigate(ROUTES.HOME) }}
          />
        ) : (
          stamps.slice(0, 30).map((s) => (
            <div key={s.id} style={{ ...card, background: '#fff', border: '1px solid #f2f4f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                <button
                  onClick={() => navigate(toPlaceDetail(s.contentId))}
                  style={{ ...linkBtn, fontWeight: 700 }}
                >
                  {s.title}
                </button>
                <button onClick={() => handleRemove(s.id)} style={{ ...linkBtn, color: '#e5534b' }}>
                  삭제
                </button>
              </div>
              <div style={{ fontSize: '12px', color: '#8b95a1', marginTop: '2px' }}>
                {formatDate(s.visitedAt)} · {SLOT_LABEL[s.timeSlot]} · {SEASON_LABEL[s.season]}
              </div>
              {s.note && (
                <div style={{ fontSize: '13px', color: '#4e5968', marginTop: '6px' }}>“{s.note}”</div>
              )}
            </div>
          ))
        )}
        <p style={hint}>모든 기록은 이 휴대폰 안에만 저장돼요.</p>
      </div>
    </div>
  );
}

const h2: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 800,
  color: '#191f28',
  margin: '24px 0 10px',
};
const card: React.CSSProperties = {
  borderRadius: '14px',
  padding: '12px 14px',
  marginBottom: '8px',
  fontSize: '14px',
  color: '#191f28',
};
const hint: React.CSSProperties = { fontSize: '12px', color: '#b0b8c1', margin: '8px 0 0' };
const linkBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  fontSize: '14px',
  color: '#191f28',
  cursor: 'pointer',
  textAlign: 'left',
};
