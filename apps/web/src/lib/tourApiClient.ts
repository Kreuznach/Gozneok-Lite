/**
 * tourApiClient.ts
 * 프록시 API(/api/*) 호출 클라이언트
 *
 * ⚠️ 이 파일은 백엔드 프록시만 호출합니다.
 *    TourAPI serviceKey를 직접 포함하지 않습니다.
 */
import type { Place, PlaceDetail, PlaceImage, PaginatedResponse, ApiResponse } from '@/types';
import { memoryCache, TTL } from './cache';

/** 프록시 API 기본 URL (개발: vite proxy → 프로덕션: 환경변수)
 *
 * ⚠️ Toss 미니앱(WebView) 배포 시 반드시 VITE_API_BASE_URL 설정 필요:
 *   - 미설정 시 기본값 '/api' (상대 경로) → Toss CDN 호스트 기준 해석 → API 호출 실패
 *   - 빌드 전 apps/web/.env.local 에 VITE_API_BASE_URL=https://your-api-server.com 으로 설정
 *   - Toss 테스트 환경에서 데이터가 로드되지 않는다면 이 설정을 먼저 확인하세요
 */
const API_BASE = import.meta.env['VITE_API_BASE_URL'] ?? '/api';

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`API 요청 실패: ${res.status} ${url}`);
  }
  return res.json() as Promise<T>;
}

// ────────────────────────────────────────────────────────
// 장소 목록
// ────────────────────────────────────────────────────────

export interface PlaceListParams {
  area?: string;
  timeSlot?: string;
  lat?: number;
  lng?: number;
  pageNo?: number;
  numOfRows?: number;
}

export async function fetchPlaceList(
  params: PlaceListParams
): Promise<PaginatedResponse<Place>> {
  const query = new URLSearchParams();
  if (params.area) query.set('area', params.area);
  if (params.timeSlot) query.set('timeSlot', params.timeSlot);
  if (params.lat != null) query.set('lat', String(params.lat));
  if (params.lng != null) query.set('lng', String(params.lng));
  if (params.pageNo != null) query.set('pageNo', String(params.pageNo));
  if (params.numOfRows != null) query.set('numOfRows', String(params.numOfRows));

  const url = `${API_BASE}/places?${query.toString()}`;
  const cacheKey = `list:${url}`;

  const cached = memoryCache.get<PaginatedResponse<Place>>(cacheKey);
  if (cached) return cached;

  try {
    const data = await fetchJSON<PaginatedResponse<Place>>(url);
    memoryCache.set(cacheKey, data, TTL.LIST);
    return data;
  } catch (err) {
    console.warn('[tourApiClient] 목록 요청 실패, 폴백 없음:', err);
    // 오류를 상위로 전파 → 페이지에서 폴백 처리
    throw err;
  }
}

// ────────────────────────────────────────────────────────
// 장소 상세
// ────────────────────────────────────────────────────────

export async function fetchPlaceDetail(
  contentId: string
): Promise<ApiResponse<PlaceDetail>> {
  const url = `${API_BASE}/places/${contentId}`;
  const cacheKey = `detail:${contentId}`;

  const cached = memoryCache.get<ApiResponse<PlaceDetail>>(cacheKey);
  if (cached) return cached;

  const data = await fetchJSON<ApiResponse<PlaceDetail>>(url);
  memoryCache.set(cacheKey, data, TTL.DETAIL);
  return data;
}

// ────────────────────────────────────────────────────────
// 장소 이미지
// ────────────────────────────────────────────────────────

export async function fetchPlaceImages(
  contentId: string
): Promise<PlaceImage[]> {
  const url = `${API_BASE}/places/${contentId}/images`;
  const cacheKey = `images:${contentId}`;

  const cached = memoryCache.get<PlaceImage[]>(cacheKey);
  if (cached) return cached;

  try {
    const data = await fetchJSON<PlaceImage[]>(url);
    memoryCache.set(cacheKey, data, TTL.IMAGES);
    return data;
  } catch {
    return []; // 이미지 실패 시 빈 배열(UX 파탄 방지)
  }
}

// NOTE: 투표(POST /api/votes) 기능은 v2에서 구현 예정입니다.
