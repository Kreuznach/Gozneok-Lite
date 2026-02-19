/**
 * apps/api/src/index.ts
 * Gozneok Lite 프록시 API 서버
 *
 * ⚠️ 보안 주의:
 * - TOUR_API_SERVICE_KEY는 이 서버에서만 사용, 클라이언트로 절대 노출 금지
 * - 응답에 serviceKey 포함 금지
 */

import express from 'express';
import cors from 'cors';
import { DUMMY_PLACES } from './dummyData.js';
import {
  fetchPlaceListFromTourApi,
  fetchPlaceDetailFromTourApi,
  fetchPlaceImagesFromTourApi,
} from './tourProxy.js';
import { serverCache } from './cache.js';

const app = express();
const PORT = parseInt(process.env['PORT'] ?? '3001', 10);

// ────────────────────────────────────────────────────────
// 미들웨어
// ────────────────────────────────────────────────────────

const allowedOrigins = (process.env['CORS_ORIGINS'] ?? 'http://localhost:5173')
  .split(' ')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  })
);

app.use(express.json());

// ────────────────────────────────────────────────────────
// 더미 데이터 스위치
// ────────────────────────────────────────────────────────

function useDummyData(): boolean {
  return process.env['USE_DUMMY_DATA'] === 'true';
}

// ────────────────────────────────────────────────────────
// 헬스체크
// ────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', dummy: useDummyData() });
});

// ────────────────────────────────────────────────────────
// GET /api/places — 장소 목록
// ────────────────────────────────────────────────────────

app.get('/api/places', async (req, res) => {
  const area = req.query['area'] as string | undefined;
  const timeSlot = req.query['timeSlot'] as string | undefined;
  const pageNo = parseInt(req.query['pageNo'] as string ?? '1', 10);
  const numOfRows = parseInt(req.query['numOfRows'] as string ?? '20', 10);

  if (useDummyData()) {
    // 더미 폴백
    const filtered = area
      ? DUMMY_PLACES.filter((p) => p.areaCode === area)
      : DUMMY_PLACES;
    const start = (pageNo - 1) * numOfRows;
    const items = filtered.slice(start, start + numOfRows);
    return res.json({
      items,
      totalCount: filtered.length,
      pageNo,
      numOfRows,
      isFallback: true,
    });
  }

  try {
    const result = await fetchPlaceListFromTourApi({ area, pageNo, numOfRows });
    return res.json(result);
  } catch (err) {
    console.error('[/api/places] TourAPI 오류, 더미 폴백 반환:', err instanceof Error ? err.message : String(err));
    // 장애 시 더미 폴백
    const filtered = area
      ? DUMMY_PLACES.filter((p) => p.areaCode === area)
      : DUMMY_PLACES;
    return res.json({
      items: filtered.slice(0, numOfRows),
      totalCount: filtered.length,
      pageNo,
      numOfRows,
      isFallback: true,
    });
  }
});

// ────────────────────────────────────────────────────────
// GET /api/places/:contentId — 장소 상세
// ────────────────────────────────────────────────────────

app.get('/api/places/:contentId', async (req, res) => {
  const { contentId } = req.params;

  if (useDummyData() || contentId.startsWith('dummy-')) {
    const place = DUMMY_PLACES.find((p) => p.contentId === contentId);
    if (!place) return res.status(404).json({ error: '장소를 찾을 수 없어요' });
    return res.json({ data: place, isFallback: true });
  }

  try {
    const data = await fetchPlaceDetailFromTourApi(contentId);
    return res.json({ data, isFallback: false });
  } catch (err) {
    console.error('[/api/places/:contentId] 오류:', err instanceof Error ? err.message : String(err));
    return res.status(502).json({ error: '장소 정보를 가져오지 못했어요' });
  }
});

// ────────────────────────────────────────────────────────
// GET /api/places/:contentId/images — 장소 이미지
// ────────────────────────────────────────────────────────

app.get('/api/places/:contentId/images', async (req, res) => {
  const { contentId } = req.params;

  if (useDummyData() || contentId.startsWith('dummy-')) {
    return res.json([]); // 더미 이미지 없음
  }

  try {
    const images = await fetchPlaceImagesFromTourApi(contentId);
    return res.json(images);
  } catch (err) {
    console.error('[/api/places/:contentId/images] 오류:', err instanceof Error ? err.message : String(err));
    return res.json([]); // 이미지 실패는 빈 배열 반환 (UX 파탄 방지)
  }
});

// NOTE: POST /api/votes (투표 기능)는 v2에서 구현 예정입니다.

// ────────────────────────────────────────────────────────
// 서버 시작
// ────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[API] Gozneok Lite 프록시 서버 시작: http://localhost:${PORT}`);
  console.log(`[API] 더미 데이터 모드: ${useDummyData() ? 'ON' : 'OFF'}`);
});
