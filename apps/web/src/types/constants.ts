/**
 * 지역 상수 목록
 */
import type { AreaInfo, TimeSlotInfo } from '@/types';

export const AREAS: AreaInfo[] = [
  { code: '1', name: '서울' },
  { code: '6', name: '부산' },
  { code: '4', name: '대구' },
  { code: '2', name: '인천' },
  { code: '5', name: '광주' },
  { code: '3', name: '대전' },
  { code: '7', name: '울산' },
  { code: '8', name: '세종' },
  { code: '31', name: '경기' },
  { code: '32', name: '강원' },
  { code: '33', name: '충북' },
  { code: '34', name: '충남' },
  { code: '35', name: '경북' },
  { code: '36', name: '경남' },
  { code: '37', name: '전북' },
  { code: '38', name: '전남' },
  { code: '39', name: '제주' },
];

export const TIME_SLOTS: TimeSlotInfo[] = [
  {
    key: 'now',
    label: '지금',
    description: '현재 시간 기준',
    hoursRange: [0, 23],
  },
  {
    key: 'morning',
    label: '오전',
    description: '09:00 ~ 12:00',
    hoursRange: [9, 12],
  },
  {
    key: 'afternoon',
    label: '오후',
    description: '12:00 ~ 17:00',
    hoursRange: [12, 17],
  },
  {
    key: 'evening',
    label: '저녁',
    description: '17:00 ~ 21:00',
    hoursRange: [17, 21],
  },
];

export const APP_NAME = 'gozneok-lite' as const;
export const APP_DISPLAY_NAME = 'Gozneok Lite' as const;
export const APP_VERSION = '0.1.0' as const;
