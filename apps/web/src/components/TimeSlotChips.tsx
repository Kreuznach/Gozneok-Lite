/**
 * TimeSlotChips.tsx — 시간대 선택 칩 목록
 */
import React from 'react';
import type { TimeSlot } from '@/types';
import { TIME_SLOTS } from '@/types/constants';

interface TimeSlotChipsProps {
  selected: TimeSlot | null;
  onSelect: (slot: TimeSlot) => void;
}

export function TimeSlotChips({ selected, onSelect }: TimeSlotChipsProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '4px 0 4px',
        scrollbarWidth: 'none',
      }}
    >
      {TIME_SLOTS.map((slot) => {
        const isSelected = selected === slot.key;
        return (
          <button
            key={slot.key}
            onClick={() => onSelect(slot.key)}
            style={{
              flexShrink: 0,
              padding: '8px 16px',
              borderRadius: '20px',
              border: isSelected ? '2px solid #3182F6' : '1px solid #e5e8eb',
              backgroundColor: isSelected ? '#ebf3ff' : '#fff',
              color: isSelected ? '#3182F6' : '#4e5968',
              fontSize: '14px',
              fontWeight: isSelected ? 700 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            {slot.label}
          </button>
        );
      })}
    </div>
  );
}
