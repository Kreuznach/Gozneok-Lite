/**
 * Home/index.tsx — 홈 화면
 * "지금 조용한 곳" 추천 진입점 (지역/시간대 선택)
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import { useRecommendation } from '@/lib/recommendationContext';
import { attachMainBannerAd } from '@/lib/admob';
import { TimeSlotChips } from '@/components/TimeSlotChips';
import { HomeJourneyCards } from '@/components/HomeJourneyCards';
import type { TimeSlot } from '@/types';
import { APP_DISPLAY_NAME } from '@/types/constants';

import {
  getCurrentLocation,
  GetCurrentLocationPermissionError,
  Accuracy,
} from '@apps-in-toss/web-framework';

const LOCATION_PERMISSION_PROMPT_SESSION_KEY = 'gz_location_prompted_on_launch';

/**
 * 앱 진입 시 위치 권한 다이얼로그를 1회 사전 노출합니다.
 * - 세션당 1회만 실행
 * - 이미 허용된 경우 추가 동작 없음
 */
async function preflightLocationPermissionOnLaunch(): Promise<void> {
  try {
    if (sessionStorage.getItem(LOCATION_PERMISSION_PROMPT_SESSION_KEY) === '1') {
      return;
    }
    sessionStorage.setItem(LOCATION_PERMISSION_PROMPT_SESSION_KEY, '1');

    const status = await getCurrentLocation.getPermission();
    if (status === 'allowed') return;

    await getCurrentLocation.openPermissionDialog();
  } catch {
    // 권한 사전 요청 실패는 UX를 막지 않음
  }
}

/**
 * Toss SDK getCurrentLocation 호출 후 좌표 반환
 * - 권한 거부(GetCurrentLocationPermissionError) → null 반환 → Region Select 안내
 * - 브라우저 환경(Toss 앱 외) → navigator.geolocation 폴백
 */
async function requestLocationPermission(): Promise<{
  lat: number;
  lng: number;
} | null> {
  // Toss SDK 경로 (앱 내 WebView 환경)
  try {
      const result = await getCurrentLocation({ accuracy: Accuracy.High });
    return { lat: result.coords.latitude, lng: result.coords.longitude };
  } catch (err) {
    if (err instanceof GetCurrentLocationPermissionError) {
      // 권한 거부 → null (Region Select로 대체)
      return null;
    }
    // SDK 미지원(브라우저 환경) 등 → 브라우저 폴백으로 낙하
  }

  // 브라우저 Geolocation 폴백 (개발 / Toss 앱 외부 환경)
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000 }
    );
  });
}

export default function HomePage() {
  const navigate = useNavigate();
  const { selectedTimeSlot, setTimeSlot, setLocation, clearLocation } =
    useRecommendation();
  const [locationLoading, setLocationLoading] = useState(false);
  const [bannerHost, setBannerHost] = useState<HTMLDivElement | null>(null);

  // 진입 시 기본 시간대 = 'now'
  useEffect(() => {
    if (!selectedTimeSlot) {
      setTimeSlot('now');
    }
  }, [selectedTimeSlot, setTimeSlot]);

  // 앱 진입 시 위치 권한 다이얼로그 사전 노출 (세션 1회)
  useEffect(() => {
    void preflightLocationPermissionOnLaunch();
  }, []);

  // 홈 배너 광고 부착
  useEffect(() => {
    if (!bannerHost) return;
    const destroy = attachMainBannerAd(bannerHost);
    return () => {
      destroy?.();
    };
  }, [bannerHost]);

  const handleTimeSlotSelect = useCallback(
    (slot: TimeSlot) => {
      setTimeSlot(slot);
    },
    [setTimeSlot]
  );

  const handleUseLocation = useCallback(async () => {
    setLocationLoading(true);
    const loc = await requestLocationPermission();
    setLocationLoading(false);
    if (loc) {
      setLocation(loc.lat, loc.lng);
      navigate(ROUTES.PLACE_LIST);
    } else {
      // 위치 권한 거부 → Region Select로 안내
      clearLocation();
      navigate(ROUTES.REGION_SELECT);
    }
  }, [setLocation, clearLocation, navigate]);

  const handleSelectRegion = useCallback(() => {
    navigate(ROUTES.REGION_SELECT);
  }, [navigate]);

  return (
    <div style={{ padding: '0 0 32px' }}>
      {/* 헤더 */}
      <div
        style={{
          padding: '48px 24px 24px',
          background: 'linear-gradient(160deg, #ebf3ff 0%, #ffffff 60%)',
        }}
      >
        <p style={{ fontSize: '14px', color: '#6b7684', margin: '0 0 6px' }}>
          {APP_DISPLAY_NAME}
        </p>
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 800,
            color: '#191f28',
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          지금, 조용한 곳이 <br />
          어딘가요? 🤫
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#6b7684',
            marginTop: '10px',
          }}
        >
          시간대와 지역을 선택하면 조용한 장소를 추천해드려요
        </p>
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* 재방문 카드 / 오늘의 고요 한 곳 / 내 고요 기록 */}
        <HomeJourneyCards />

        {/* 시간대 선택 */}
        <section style={{ marginBottom: '28px' }}>
          <h2
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#191f28',
              margin: '0 0 12px',
            }}
          >
            언제 방문할 예정인가요?
          </h2>
          <TimeSlotChips
            selected={selectedTimeSlot}
            onSelect={handleTimeSlotSelect}
          />
        </section>

        {/* 장소 찾기 방법 선택 */}
        <section>
          <h2
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#191f28',
              margin: '0 0 12px',
            }}
          >
            어디서 찾아드릴까요?
          </h2>

          {/* 위치 기반 */}
          <button
            onClick={handleUseLocation}
            disabled={locationLoading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '14px',
              background: '#3182F6',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 700,
              border: 'none',
              cursor: locationLoading ? 'not-allowed' : 'pointer',
              marginBottom: '10px',
              opacity: locationLoading ? 0.7 : 1,
            }}
          >
            {locationLoading ? '위치 확인 중…' : '📍 내 주변 조용한 곳 보기'}
          </button>

          {/* 지역 선택 */}
          <button
            onClick={handleSelectRegion}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '14px',
              background: '#f2f4f6',
              color: '#191f28',
              fontSize: '16px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            🗺️ 지역 직접 선택하기
          </button>

          <p
            style={{
              fontSize: '12px',
              color: '#b0b8c1',
              textAlign: 'center',
              marginTop: '10px',
            }}
          >
            위치 권한을 허용하지 않으면 지역 선택 화면으로 이동해요
          </p>
        </section>

        {/*
          메인 노출형 광고 — 피드형(native image), 인라인
          UI 가이드: https://developers-apps-in-toss.toss.im/ads/develop.html
          - width: 100% 필수
          - height 미지정 → SDK가 광고 콘텐츠 높이에 맞게 자동 조절
          - 위아래 여백 8px 이상 (section: marginTop 20px, marginBottom 8px)
          - 컨테이너 안에 borderRadius·overflow:hidden 금지 (광고 콘텐츠 클리핑 방지)
        */}
        <section style={{ marginTop: '20px', marginBottom: '8px' }}>
          <div
            ref={setBannerHost}
            style={{ width: '100%' }}
          />
        </section>

        {/* 바로가기 */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '24px',
          }}
        >
          <button
            onClick={() => navigate(ROUTES.WISHLIST)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              background: '#fff',
              border: '1px solid #e5e8eb',
              fontSize: '14px',
              color: '#4e5968',
              cursor: 'pointer',
            }}
          >
            ❤️ 위시리스트
          </button>
          <button
            onClick={() => navigate(ROUTES.SETTINGS)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              background: '#fff',
              border: '1px solid #e5e8eb',
              fontSize: '14px',
              color: '#4e5968',
              cursor: 'pointer',
            }}
          >
            ⚙️ 설정
          </button>
        </div>
      </div>
    </div>
  );
}
