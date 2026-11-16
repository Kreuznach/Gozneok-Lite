/**
 * StampSection.tsx — 장소 상세의 "고요 도장" (다녀왔어요 + 한 줄 노트)
 */
import React, { useState, useCallback } from 'react';
import type { PlaceDetail, StampSlot } from '@/types';
import {
  NOTE_MAX_LENGTH,
  SLOT_LABEL,
  SEASON_LABEL,
  addStamp,
  currentSlot,
  stampsOfPlace,
} from '@/lib/journey';

const SLOTS: StampSlot[] = ['morning', 'afternoon', 'evening'];

export function StampSection({ detail }: { detail: PlaceDetail }) {
  const [slot, setSlot] = useState<StampSlot>(currentSlot());
  const [note, setNote] = useState('');
  const [count, setCount] = useState(() => stampsOfPlace(detail.contentId).length);
  const [message, setMessage] = useState('');

  const handleStamp = useCallback(() => {
    const result = addStamp({
      contentId: detail.contentId,
      title: detail.title,
      areaCode: detail.areaCode,
      firstimage: detail.firstimage,
      timeSlot: slot,
      note,
    });
    if (!result.added) {
      setMessage('오늘 이 시간대 도장은 이미 찍었어요. 다른 시간대로 다시 와 보세요!');
      return;
    }
    setCount(stampsOfPlace(detail.contentId).length);
    setNote('');
    const badgeText = result.newBadges.map((b) => `${b.emoji} ${b.name}`).join(', ');
    setMessage(
      badgeText
        ? `도장이 찍혔어요! 새 배지를 받았어요: ${badgeText}`
        : `도장이 찍혔어요! ${SEASON_LABEL[stampsOfPlace(detail.contentId)[0].season]}의 기록이에요.`
    );
  }, [detail, slot, note]);

  return (
    <section
      style={{
        background: '#ebf3ff',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '20px',
      }}
    >
      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px', color: '#191f28' }}>
        🏷️ 고요 도장
      </h3>
      <p style={{ fontSize: '12px', color: '#6b7684', margin: '0 0 10px' }}>
        다녀왔다면 도장을 찍어 보세요. 이 휴대폰에만 저장돼요.
        {count > 0 ? ` (이 장소 도장 ${count}개)` : ''}
      </p>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
        {SLOTS.map((s) => (
          <button
            key={s}
            onClick={() => setSlot(s)}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: '10px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              background: slot === s ? '#3182F6' : '#fff',
              color: slot === s ? '#fff' : '#4e5968',
            }}
          >
            {SLOT_LABEL[s]}
          </button>
        ))}
      </div>

      <input
        value={note}
        onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX_LENGTH))}
        placeholder="한 줄 노트 (선택, 나만 볼 수 있어요)"
        maxLength={NOTE_MAX_LENGTH}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '10px 12px',
          borderRadius: '10px',
          border: '1px solid #d1d6db',
          fontSize: '13px',
          marginBottom: '4px',
        }}
      />
      <div style={{ fontSize: '11px', color: '#8b95a1', textAlign: 'right', marginBottom: '8px' }}>
        {note.length} / {NOTE_MAX_LENGTH}
      </div>

      <button
        onClick={handleStamp}
        style={{
          width: '100%',
          padding: '13px',
          borderRadius: '12px',
          border: 'none',
          background: '#3182F6',
          color: '#fff',
          fontSize: '15px',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        ✅ 다녀왔어요
      </button>
      {message && (
        <p role="status" style={{ fontSize: '13px', color: '#1b64da', margin: '10px 0 0' }}>
          {message}
        </p>
      )}
    </section>
  );
}
