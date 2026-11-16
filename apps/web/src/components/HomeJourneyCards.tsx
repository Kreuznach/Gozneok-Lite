/**
 * HomeJourneyCards.tsx — 홈 화면의 재미·재방문 카드
 * 오늘의 고요 한 곳 / 다시 가 볼까요? / 이번 주 미션 요약
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES, toPlaceDetail } from '@/app/routes';
import { fetchPlaceList } from '@/lib/tourApiClient';
import { useWishlist } from '@/lib/wishlistContext';
import {
  dateKey,
  hashString,
  getStamps,
  getRevisitCandidate,
  dismissRevisitCard,
  daysSince,
  getWeeklyMissions,
} from '@/lib/journey';
import { AREAS } from '@/types/constants';
import type { Place, Stamp } from '@/types';

const cardBase: React.CSSProperties = {
  borderRadius: '16px',
  padding: '16px',
  marginBottom: '12px',
};

/** 날짜가 같으면 같은 지역·같은 장소를 고릅니다 (하루 동안 고정) */
function TodayPick() {
  const navigate = useNavigate();
  const [place, setPlace] = useState<Place | null>(null);

  useEffect(() => {
    let cancelled = false;
    const seed = hashString(dateKey());
    const area = AREAS[seed % AREAS.length];
    fetchPlaceList({ area: area.code, numOfRows: 20 })
      .then((res) => {
        if (cancelled) return;
        const withImage = res.items.filter((p) => p.firstimage);
        const pool = withImage.length > 0 ? withImage : res.items;
        if (pool.length > 0) setPlace(pool[Math.floor(seed / AREAS.length) % pool.length]);
      })
      .catch(() => {
        /* 실패하면 카드를 숨깁니다 */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!place) return null;
  return (
    <div
      onClick={() => navigate(toPlaceDetail(place.contentId))}
      role="button"
      style={{ ...cardBase, background: '#fff8e1', cursor: 'pointer', display: 'flex', gap: '12px' }}
    >
      {place.firstimage && (
        <img
          src={place.firstimage}
          alt=""
          loading="lazy"
          style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' }}
        />
      )}
      <div>
        <div style={{ fontSize: '12px', color: '#b26a00', fontWeight: 700 }}>🎁 오늘의 고요 한 곳</div>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#191f28', margin: '2px 0' }}>
          {place.title}
        </div>
        <div style={{ fontSize: '12px', color: '#6b7684' }}>
          오늘 한번 들러 보면 좋을 곳이에요
        </div>
      </div>
    </div>
  );
}

function RevisitCard() {
  const navigate = useNavigate();
  const [stamp, setStamp] = useState<Stamp | null>(getRevisitCandidate);

  if (!stamp) return null;
  return (
    <div style={{ ...cardBase, background: '#e8f5e9' }}>
      <div style={{ fontSize: '12px', color: '#1b5e20', fontWeight: 700 }}>🍂 다시 가 볼까요?</div>
      <div style={{ fontSize: '14px', color: '#191f28', margin: '4px 0 10px', lineHeight: 1.5 }}>
        {daysSince(stamp.visitedAt)}일 전에 다녀온 <b>{stamp.title}</b>, 계절이 바뀌었을 수 있어요.
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => navigate(toPlaceDetail(stamp.contentId))}
          style={{ ...btn, background: '#1b5e20', color: '#fff' }}
        >
          보러 가기
        </button>
        <button
          onClick={() => {
            dismissRevisitCard();
            setStamp(null);
          }}
          style={{ ...btn, background: '#fff', color: '#4e5968' }}
        >
          오늘은 닫기
        </button>
      </div>
    </div>
  );
}

function JourneySummary() {
  const navigate = useNavigate();
  const { wishlist } = useWishlist();
  const missions = getWeeklyMissions(getStamps(), wishlist);
  const doneCount = missions.filter((m) => m.done).length;

  return (
    <div
      onClick={() => navigate(ROUTES.JOURNEY)}
      role="button"
      style={{ ...cardBase, background: '#f8f9fa', cursor: 'pointer' }}
    >
      <div style={{ fontSize: '14px', fontWeight: 800, color: '#191f28' }}>
        📒 내 고요 기록 · 이번 주 미션 {doneCount}/{missions.length}
      </div>
      <div style={{ fontSize: '12px', color: '#6b7684', marginTop: '2px' }}>
        도장, 배지, 한 달 리포트를 볼 수 있어요
      </div>
    </div>
  );
}

export function HomeJourneyCards() {
  return (
    <section style={{ marginBottom: '20px' }}>
      <RevisitCard />
      <TodayPick />
      <JourneySummary />
    </section>
  );
}

const btn: React.CSSProperties = {
  flex: 1,
  padding: '10px',
  borderRadius: '10px',
  border: 'none',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
};
