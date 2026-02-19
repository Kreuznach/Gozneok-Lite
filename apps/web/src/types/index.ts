/**
 * Gozneok Lite 공통 타입 정의
 */

// ────────────────────────────────────────────────────────
// 지역 / 시간대
// ────────────────────────────────────────────────────────

/** TourAPI areaCode 기준 주요 지역 */
export type AreaCode =
  | '1'   // 서울
  | '2'   // 인천
  | '3'   // 대전
  | '4'   // 대구
  | '5'   // 광주
  | '6'   // 부산
  | '7'   // 울산
  | '8'   // 세종특별자치시
  | '31'  // 경기도
  | '32'  // 강원도
  | '33'  // 충청북도
  | '34'  // 충청남도
  | '35'  // 경상북도
  | '36'  // 경상남도
  | '37'  // 전라북도
  | '38'  // 전라남도
  | '39'; // 제주도

export interface AreaInfo {
  code: AreaCode;
  name: string;
}

export type TimeSlot = 'now' | 'morning' | 'afternoon' | 'evening';

export interface TimeSlotInfo {
  key: TimeSlot;
  label: string;
  description: string;
  hoursRange: [number, number]; // [시작시간, 종료시간]
}

// ────────────────────────────────────────────────────────
// 장소 (Place)
// ────────────────────────────────────────────────────────

/** 프록시 API 응답 정규화된 장소 */
export interface Place {
  contentId: string;
  contentTypeId: string;
  title: string;
  addr1: string;
  addr2?: string;
  zipcode?: string;
  areaCode: AreaCode;
  mapx: number;   // 경도 (longitude)
  mapy: number;   // 위도 (latitude)
  firstimage?: string;
  firstimage2?: string;
  tel?: string;
  overview?: string;
  createdtime?: string;
  modifiedtime?: string;
}

/** 장소 상세 (detailCommon 기반) */
export interface PlaceDetail extends Place {
  homepage?: string;
  booktour?: string;
  telname?: string;
}

/** 장소 상세 이미지 */
export interface PlaceImage {
  contentId: string;
  imgname: string;
  originimgurl: string;
  smallimageurl: string;
  serialnum: string;
}

// ────────────────────────────────────────────────────────
// Quiet Score (조용함 지수)
// ────────────────────────────────────────────────────────

/** 사용자 투표 (1~5) */
export type QuietVote = 1 | 2 | 3 | 4 | 5;

export interface VoteRecord {
  contentId: string;
  score: QuietVote;
  votedAt: number; // timestamp (ms)
  deviceId: string;
}

/** 베이지안 보정된 Quiet Score */
export interface QuietScore {
  contentId: string;
  bayesianScore: number;   // 보정된 점수 (1~5)
  rawAverage: number;      // 단순 평균
  voteCount: number;
  label: string;           // "대체로 조용한 편이에요" 등
}

// ────────────────────────────────────────────────────────
// 위시리스트
// ────────────────────────────────────────────────────────

export interface WishlistItem {
  contentId: string;
  title: string;
  addr1: string;
  firstimage?: string;
  savedAt: number;
}

// ────────────────────────────────────────────────────────
// 추천 상태 (RecommendationContext)
// ────────────────────────────────────────────────────────

export interface RecommendationState {
  selectedArea: AreaInfo | null;
  selectedTimeSlot: TimeSlot | null;
  useLocation: boolean;
  userLat?: number;
  userLng?: number;
}

// ────────────────────────────────────────────────────────
// API 응답 공통
// ────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  isFallback?: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNo: number;
  numOfRows: number;
  isFallback?: boolean;
}
