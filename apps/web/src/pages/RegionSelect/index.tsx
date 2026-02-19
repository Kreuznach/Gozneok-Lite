/**
 * RegionSelect/index.tsx — 지역 선택 화면
 */
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import { useRecommendation } from '@/lib/recommendationContext';
import { PageHeader } from '@/components/PageHeader';
import { AREAS } from '@/types/constants';
import type { AreaInfo } from '@/types';

export default function RegionSelectPage() {
  const navigate = useNavigate();
  const { selectedArea, setArea } = useRecommendation();

  const handleSelect = useCallback(
    (area: AreaInfo) => {
      setArea(area);
      navigate(ROUTES.PLACE_LIST);
    },
    [setArea, navigate]
  );

  return (
    <div>
      <PageHeader title="지역 선택" />
      <div style={{ padding: '16px 20px 32px' }}>
        <p style={{ fontSize: '14px', color: '#6b7684', margin: '0 0 16px' }}>
          방문하려는 지역을 선택해주세요
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
          }}
        >
          {AREAS.map((area) => {
            const isSelected = selectedArea?.code === area.code;
            return (
              <button
                key={area.code}
                onClick={() => handleSelect(area)}
                style={{
                  padding: '14px 8px',
                  borderRadius: '12px',
                  background: isSelected ? '#ebf3ff' : '#f8f9fa',
                  border: isSelected ? '2px solid #3182F6' : '1px solid #e5e8eb',
                  color: isSelected ? '#3182F6' : '#191f28',
                  fontSize: '15px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {area.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
