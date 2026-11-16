/**
 * 라우트 경로 상수
 * 변경 시 이 파일만 수정하면 됨
 */
export const ROUTES = {
  HOME: '/',
  REGION_SELECT: '/region',
  TIME_SLOT_SELECT: '/time-slot',
  PLACE_LIST: '/places',
  PLACE_DETAIL: '/places/:contentId',
  WISHLIST: '/wishlist',
  JOURNEY: '/journey',
  SETTINGS: '/settings',
} as const;

export type RouteKey = keyof typeof ROUTES;

/** 장소 상세 경로 생성 헬퍼 */
export const toPlaceDetail = (contentId: string) =>
  `/places/${contentId}`;
