/**
 * ScoreBadge.tsx — 조용함 지수(Quiet Score) 배지
 */
import React from 'react';
import { scoreToColor, scoreToLabel } from '@/lib/quietScore';

interface ScoreBadgeProps {
  score: number;
  voteCount: number;
  size?: 'sm' | 'md';
}

export function ScoreBadge({ score, voteCount, size = 'md' }: ScoreBadgeProps) {
  const color = scoreToColor(score);
  const label = scoreToLabel(score, voteCount);
  const isSm = size === 'sm';

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: `${color}18`,
          borderRadius: '8px',
          padding: isSm ? '3px 8px' : '4px 10px',
        }}
      >
        <span
          style={{
            color,
            fontWeight: 700,
            fontSize: isSm ? '13px' : '15px',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          🤫 {score.toFixed(1)}
        </span>
        {voteCount > 0 && (
          <span
            style={{
              color: '#8b95a1',
              fontSize: isSm ? '11px' : '12px',
            }}
          >
            ({voteCount}명)
          </span>
        )}
      </div>
      {!isSm && (
        <span
          style={{
            fontSize: '12px',
            color: '#6b7684',
            textAlign: 'center',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
