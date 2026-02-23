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
import {
  fetchPlaceListFromTourApi,
  fetchPlaceDetailFromTourApi,
  fetchPlaceImagesFromTourApi,
} from './tourProxy.js';
import { serverCache } from './cache.js';
import { config } from './config.js';

const app = express();
const PORT = config.port;

// ────────────────────────────────────────────────────────
// 미들웨어
// ────────────────────────────────────────────────────────

const allowedOrigins = config.corsOrigins;
// ['*'] 인 경우 cors 미들웨어에 문자열 '*' 로 전달해야 전체 오리진 허용이 동작합니다.
const corsOrigin: string | string[] =
  allowedOrigins.length === 1 && allowedOrigins[0] === '*' ? '*' : allowedOrigins;

app.use(
  cors({
    origin: corsOrigin,
    methods: ['GET', 'POST'],
  })
);

app.use(express.json());

// ────────────────────────────────────────────────────────
// 헬스체크
// ────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// ────────────────────────────────────────────────────────
// GET /api/places — 장소 목록
// ────────────────────────────────────────────────────────

app.get('/api/places', async (req, res) => {
  const area = req.query['area'] as string | undefined;
  const pageNo = parseInt(req.query['pageNo'] as string ?? '1', 10);
  const numOfRows = parseInt(req.query['numOfRows'] as string ?? '20', 10);

  try {
    const result = await fetchPlaceListFromTourApi({ area, pageNo, numOfRows });
    return res.json(result);
  } catch (err) {
    console.error('[/api/places] TourAPI 오류:', err instanceof Error ? err.message : String(err));
    return res.status(502).json({ error: '장소 목록을 가져오지 못했어요' });
  }
});

// ────────────────────────────────────────────────────────
// GET /api/places/:contentId — 장소 상세
// ────────────────────────────────────────────────────────

app.get('/api/places/:contentId', async (req, res) => {
  const { contentId } = req.params;

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
  console.log(`[API] 고요한 산책 프록시 서버 시작: http://localhost:${PORT}`);
});
