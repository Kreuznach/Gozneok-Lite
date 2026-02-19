/**
 * recommendationContext.tsx
 * 지역/시간대 선택 상태 관리 (Context + Hooks)
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { RecommendationState, AreaInfo, TimeSlot } from '@/types';

interface RecommendationContextValue extends RecommendationState {
  setArea: (area: AreaInfo) => void;
  setTimeSlot: (slot: TimeSlot) => void;
  setLocation: (lat: number, lng: number) => void;
  clearLocation: () => void;
  reset: () => void;
}

const initialState: RecommendationState = {
  selectedArea: null,
  selectedTimeSlot: null,
  useLocation: false,
};

const RecommendationContext =
  createContext<RecommendationContextValue | null>(null);

export function RecommendationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<RecommendationState>(initialState);

  const setArea = useCallback((area: AreaInfo) => {
    setState((s) => ({ ...s, selectedArea: area, useLocation: false }));
  }, []);

  const setTimeSlot = useCallback((slot: TimeSlot) => {
    setState((s) => ({ ...s, selectedTimeSlot: slot }));
  }, []);

  const setLocation = useCallback((lat: number, lng: number) => {
    setState((s) => ({ ...s, useLocation: true, userLat: lat, userLng: lng }));
  }, []);

  const clearLocation = useCallback(() => {
    setState((s) => ({
      ...s,
      useLocation: false,
      userLat: undefined,
      userLng: undefined,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <RecommendationContext.Provider
      value={{ ...state, setArea, setTimeSlot, setLocation, clearLocation, reset }}
    >
      {children}
    </RecommendationContext.Provider>
  );
}

export function useRecommendation(): RecommendationContextValue {
  const ctx = useContext(RecommendationContext);
  if (!ctx)
    throw new Error(
      'useRecommendation은 RecommendationProvider 내에서 사용해야 합니다'
    );
  return ctx;
}
