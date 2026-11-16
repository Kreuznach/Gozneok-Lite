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
// 고요 도장 / 배지 (재미·재방문 기능, localStorage 전용)
// ────────────────────────────────────────────────────────

export type StampSlot = Exclude<TimeSlot, 'now'>;
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface Stamp {
  id: string;
  contentId: string;
  title: string;
  areaCode: string;
  firstimage?: string;
  visitedAt: number;
  timeSlot: StampSlot;
  season: Season;
  note?: string; // 100자 이하, 나만 보는 메모
}

export interface BadgeRecord {
  id: string;
  earnedAt: number;
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

// ────────────────────────────────────────────────────────
// [v2 스키마 준비] 최소 사용자 정보 (localStorage → 서버 확장 예정)
// ────────────────────────────────────────────────────────

/**
 * 최소 사용자 프로파일 — 개인 식별 없이 UX 개인화용
 * v2 활성화 시 storage.ts 의 USER_PROFILE 키와 연동
 */
export interface UserProfile {
  deviceId: string;
  preferredAreas?: AreaCode[];       // 자주 보는 지역
  preferredTimeSlot?: TimeSlot;      // 자주 선택하는 시간대
  onboardedAt: number;               // 첫 진입 timestamp (ms)
  lastActiveAt: number;              // 마지막 사용 timestamp (ms)
}

// ────────────────────────────────────────────────────────
// [v2 스키마 준비] 장소별 평점 데이터 (클라이언트 캐시 → 서버 집계 예정)
// ────────────────────────────────────────────────────────

/**
 * 장소 평점 집계 — 베이지안 보정 점수 기반
 * v2 활성화 시 /api/ratings/:contentId 엔드포인트 연동 예정
 */
export interface PlaceRating {
  contentId: string;
  bayesianScore: number;   // 베이지안 보정 점수 (1.0 ~ 5.0)
  rawAverage: number;      // 단순 평균 (레퍼런스용)
  voteCount: number;       // 누적 투표 수
  lastVotedAt: number;     // 마지막 투표 timestamp (ms) — 캐시 갱신 판단용
}
