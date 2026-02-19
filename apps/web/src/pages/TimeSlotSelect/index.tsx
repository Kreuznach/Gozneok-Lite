/**
 * TimeSlotSelect/index.tsx — 시간대 선택 화면 (독립 페이지)
 */
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import { useRecommendation } from '@/lib/recommendationContext';
import { PageHeader } from '@/components/PageHeader';
import { TIME_SLOTS } from '@/types/constants';
import type { TimeSlot } from '@/types';

export default function TimeSlotSelectPage() {
  const navigate = useNavigate();
  const { selectedTimeSlot, setTimeSlot } = useRecommendation();

  const handleSelect = useCallback(
    (slot: TimeSlot) => {
      setTimeSlot(slot);
      navigate(-1);
    },
    [setTimeSlot, navigate]
  );

  return (
    <div>
      <PageHeader title="시간대 선택" />
      <div style={{ padding: '16px 20px 32px' }}>
        <p style={{ fontSize: '14px', color: '#6b7684', margin: '0 0 20px' }}>
          언제 방문할 예정인지 선택해주세요
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {TIME_SLOTS.map((slot) => {
            const isSelected = selectedTimeSlot === slot.key;
            return (
              <button
                key={slot.key}
                onClick={() => handleSelect(slot.key)}
                style={{
                  padding: '18px 20px',
                  borderRadius: '14px',
                  background: isSelected ? '#ebf3ff' : '#f8f9fa',
                  border: isSelected ? '2px solid #3182F6' : '1px solid #e5e8eb',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div
                  style={{
                    fontSize: '17px',
                    fontWeight: 700,
                    color: isSelected ? '#3182F6' : '#191f28',
                    marginBottom: '4px',
                  }}
                >
                  {slot.label}
                </div>
                <div style={{ fontSize: '13px', color: '#8b95a1' }}>
                  {slot.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
