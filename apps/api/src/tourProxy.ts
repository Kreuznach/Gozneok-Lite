/**
 * tourProxy.ts
 * TourAPI(KorService2) 호출 및 응답 정규화
 *
 * ⚠️ 보안: serviceKey는 환경변수(TOUR_API_SERVICE_KEY)에서만 읽음
 *    클라이언트로 절대 노출 금지
 *
 * 엔드포인트 참고: 공공데이터포털 KorService2 명세
 * - areaBasedList2   : 지역 기반 관광정보 목록
 * - detailCommon2    : 공통정보 상세
 * - detailImage2     : 이미지 정보
 *
 * TODO: 실제 Swagger 명세 확인 후 파라미터/응답 구조 최종 확정 필요
 *       현재는 KorService2 표준 명세 기준으로 구현 (불확실 항목 표시)
 */

import { serverCache, SERVER_TTL } from './cache.js';
import { config, getServiceKey } from './config.js';

// ────────────────────────────────────────────────────────
// 정규화된 장소 타입
// (dummyData.ts 삭제 후 이곳에서 관리)
// ────────────────────────────────────────────────────────

export interface NormalizedPlace {
  contentId: string;
  contentTypeId: string;
  title: string;
  addr1: string;
  addr2?: string;
  zipcode?: string;
  areaCode: string;
  mapx: number;
  mapy: number;
  firstimage?: string;
  firstimage2?: string;
  tel?: string;
  overview?: string;
  createdtime?: string;
  modifiedtime?: string;
  homepage?: string;
  booktour?: string;
  telname?: string;
}

// ────────────────────────────────────────────────────────
// 환경변수 (config 모듈에서 중앙 관리)
// ────────────────────────────────────────────────────────

const BASE_URL = config.tourApiBaseUrl;
const MOBILE_OS = config.tourApiMobileOs;
const MOBILE_APP = config.tourApiMobileApp;

// ────────────────────────────────────────────────────────
// 공통 파라미터 빌더
// ────────────────────────────────────────────────────────

function buildCommonParams(extra: Record<string, string> = {}): URLSearchParams {
  const params = new URLSearchParams({
    serviceKey: getServiceKey(),   // URLSearchParams가 인코딩 처리 — encodeURIComponent 이중 인코딩 금지
    MobileOS: MOBILE_OS,
    MobileApp: MOBILE_APP,
    _type: 'json',
    ...extra,
  });
  return params;
}

// ────────────────────────────────────────────────────────
// TourAPI 응답 타입 (일부)
// TODO: 실제 응답 구조 확인 후 보완
// ────────────────────────────────────────────────────────

interface TourApiItem {
  contentid?: string;
  contenttypeid?: string;
  title?: string;
  addr1?: string;
  addr2?: string;
  zipcode?: string;
  areacode?: string;
  mapx?: string;
  mapy?: string;
  firstimage?: string;
  firstimage2?: string;
  tel?: string;
  overview?: string;
  createdtime?: string;
  modifiedtime?: string;
  homepage?: string;
  booktour?: string;
  telname?: string;
}

interface TourApiImageItem {
  contentid?: string;
  imgname?: string;
  originimgurl?: string;
  smallimageurl?: string;
  serialnum?: string;
}

interface TourApiResponse<T> {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: {
      items?: { item?: T[] | T };
      totalCount?: number;
      pageNo?: number;
      numOfRows?: number;
    };
  };
}

// ────────────────────────────────────────────────────────
// 응답 정규화
// ────────────────────────────────────────────────────────

function normalizePlace(item: TourApiItem): NormalizedPlace {
  return {
    contentId: item.contentid ?? '',
    contentTypeId: item.contenttypeid ?? '',
    title: item.title ?? '',
    addr1: item.addr1 ?? '',
    addr2: item.addr2,
    zipcode: item.zipcode,
    areaCode: item.areacode ?? '',
    mapx: parseFloat(item.mapx ?? '0'),
    mapy: parseFloat(item.mapy ?? '0'),
    firstimage: item.firstimage || undefined,
    firstimage2: item.firstimage2 || undefined,
    tel: item.tel || undefined,
    overview: item.overview || undefined,
  };
}

function extractItems<T>(body: TourApiResponse<T>['response']): T[] {
  const itemsField = body?.body?.items?.item;
  if (!itemsField) return [];
  return Array.isArray(itemsField) ? itemsField : [itemsField];
}

// ────────────────────────────────────────────────────────
// 장소 목록 (areaBasedList2)
// ────────────────────────────────────────────────────────

export interface PlaceListParams {
  area?: string;
  pageNo?: number;
  numOfRows?: number;
}

export interface PlaceListResult {
  items: NormalizedPlace[];
  totalCount: number;
  pageNo: number;
  numOfRows: number;
  isFallback: boolean;
}

export async function fetchPlaceListFromTourApi(
  params: PlaceListParams
): Promise<PlaceListResult> {
  const cacheKey = `list:${JSON.stringify(params)}`;
  const cached = serverCache.get<PlaceListResult>(cacheKey);
  if (cached) return cached;

  const query = buildCommonParams({
    numOfRows: String(params.numOfRows ?? 20),
    pageNo: String(params.pageNo ?? 1),
    arrange: 'A',
    contentTypeId: '12',
    ...(params.area ? { areaCode: params.area } : {}),
  });

  const url = `${BASE_URL}/areaBasedList2?${query.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`TourAPI 목록 요청 실패: ${res.status}`);
  }
  const json = await res.json() as TourApiResponse<TourApiItem>;
  const rawItems = extractItems(json.response);
  const items = rawItems.map(normalizePlace);
  const totalCount = json.response?.body?.totalCount ?? 0;

  const result: PlaceListResult = {
    items,
    totalCount,
    pageNo: params.pageNo ?? 1,
    numOfRows: params.numOfRows ?? 20,
    isFallback: false,
  };

  serverCache.set(cacheKey, result, SERVER_TTL.LIST);
  return result;
}

// ────────────────────────────────────────────────────────
// 장소 상세 (detailCommon2)
// ────────────────────────────────────────────────────────

export async function fetchPlaceDetailFromTourApi(
  contentId: string
): Promise<NormalizedPlace> {
  const cacheKey = `detail:${contentId}`;
  const cached = serverCache.get<NormalizedPlace>(cacheKey);
  if (cached) return cached;

  const query = buildCommonParams({
    contentId,
    // KorService2: addrinfoYN/mapinfoYN/overviewYN/firstImageYN 파라미터 미지원
    // contentId만으로 모든 필드 반환됨
  });

  const url = `${BASE_URL}/detailCommon2?${query.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`TourAPI 상세 요청 실패: ${res.status}`);
  }
  const json = await res.json() as TourApiResponse<TourApiItem>;
  const items = extractItems(json.response);
  if (!items[0]) throw new Error('상세 데이터 없음');

  const result = normalizePlace(items[0]);
  serverCache.set(cacheKey, result, SERVER_TTL.DETAIL);
  return result;
}

// ────────────────────────────────────────────────────────
// 장소 이미지 (detailImage2)
// ────────────────────────────────────────────────────────

export interface PlaceImageResult {
  contentId: string;
  imgname: string;
  originimgurl: string;
  smallimageurl: string;
  serialnum: string;
}

export async function fetchPlaceImagesFromTourApi(
  contentId: string
): Promise<PlaceImageResult[]> {
  const cacheKey = `images:${contentId}`;
  const cached = serverCache.get<PlaceImageResult[]>(cacheKey);
  if (cached) return cached;

  const query = buildCommonParams({
    contentId,
    imageYN: 'Y',
    // KorService2: subImageYN 파라미터 미지원
  });

  const url = `${BASE_URL}/detailImage2?${query.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    return []; // 이미지 실패는 폴백 없이 빈 배열
  }
  const json = await res.json() as TourApiResponse<TourApiImageItem>;
  const items = extractItems(json.response);
  const result: PlaceImageResult[] = items.map((item) => ({
    contentId: item.contentid ?? contentId,
    imgname: item.imgname ?? '',
    originimgurl: item.originimgurl ?? '',
    smallimageurl: item.smallimageurl ?? '',
    serialnum: item.serialnum ?? '',
  }));

  const sorted = sortPlaceImages(result);
  serverCache.set(cacheKey, sorted, SERVER_TTL.IMAGES);
  return sorted;
}

// ────────────────────────────────────────────────────────
// 이미지 정렬/필터
// 화장실·주차장 등 부대시설 이미지를 뒤로 보내고
// '대표이미지' 태그가 있는 이미지를 최우선 노출
// ────────────────────────────────────────────────────────

const DEPRIORITIZED_IMG_KEYWORDS = [
  '화장실', '세면실', '욕실', '주차', '주차장', '창고', '기계실',
];
const PRIORITY_IMG_KEYWORDS = ['대표이미지', '대표'];

function sortPlaceImages(images: PlaceImageResult[]): PlaceImageResult[] {
  if (images.length === 0) return images;

  const priority: PlaceImageResult[] = [];
  const normal: PlaceImageResult[] = [];
  const deprioritized: PlaceImageResult[] = [];

  for (const img of images) {
    const name = img.imgname ?? '';
    if (PRIORITY_IMG_KEYWORDS.some((kw) => name.includes(kw))) {
      priority.push(img);
    } else if (DEPRIORITIZED_IMG_KEYWORDS.some((kw) => name.includes(kw))) {
      deprioritized.push(img);
    } else {
      normal.push(img);
    }
  }

  const bySerial = (a: PlaceImageResult, b: PlaceImageResult) =>
    parseInt(a.serialnum || '0', 10) - parseInt(b.serialnum || '0', 10);

  return [
    ...priority.sort(bySerial),
    ...normal.sort(bySerial),
    ...deprioritized.sort(bySerial),
  ];
}
