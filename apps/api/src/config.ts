/**
 * apps/api/src/config.ts
 * 환경설정 통합 모듈
 *
 * 우선순위 (높음 → 낮음):
 *   1. 이미 주입된 process.env (CI/CD, Docker, 플랫폼 환경변수)
 *   2. .env.local  (로컬 개발 전용, git 제외)
 *   3. .env        (팀 공통 기본값, git 포함 가능 — 시크릿 절대 금지)
 *   4. builtins.ts (프로젝트 내장값 — base64 난독화, 서버 번들 전용)
 */

import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';
import {
  BUILTIN_TOUR_API_BASE_URL,
  BUILTIN_TOUR_API_SERVICE_KEY,
} from './builtins.js';

// ── .env 파일 로드 (파일이 없어도 에러 없이 무시) ──────────────────────

const root = resolve(process.cwd()); // 앱 루트 (프로세스 실행 위치)

// 1) .env.local 우선 로드 (없으면 override 없이 통과)
dotenvConfig({ path: resolve(root, '.env.local'), override: false });

// 2) .env 차선 로드 (이미 설정된 값은 덮어쓰지 않음)
dotenvConfig({ path: resolve(root, '.env'), override: false });

// ── 값 파싱 헬퍼 ──────────────────────────────────────────────────────────

function str(key: string, fallback: string): string {
  return process.env[key]?.trim() || fallback;
}

function int(key: string, fallback: number): number {
  const v = process.env[key];
  const n = v ? parseInt(v, 10) : NaN;
  return isNaN(n) ? fallback : n;
}

function bool(key: string, fallback: boolean): boolean {
  const v = process.env[key]?.toLowerCase().trim();
  if (v === 'true' || v === '1') return true;
  if (v === 'false' || v === '0') return false;
  return fallback;
}

function list(key: string, fallback: string[]): string[] {
  const v = process.env[key];
  if (!v) return fallback;
  return v.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
}

// ── 설정 조립 ─────────────────────────────────────────────────────────────

// 환경변수 우선, 없으면 내장값(builtins) 사용
// 플레이스홀더(__FOO__ 패턴)는 미설정으로 간주
const rawServiceKey = process.env['TOUR_API_SERVICE_KEY']?.trim() ?? '';
const isPlaceholder = /^__.*__$/.test(rawServiceKey);
const resolvedServiceKey =
  (!rawServiceKey || isPlaceholder ? '' : rawServiceKey) ||
  BUILTIN_TOUR_API_SERVICE_KEY;

export const config = {
  /** HTTP 서버 포트 */
  port: int('PORT', 3001),

  /** TourAPI 기본 URL — env 우선, 없으면 내장값 */
  tourApiBaseUrl: str('TOUR_API_BASE_URL', BUILTIN_TOUR_API_BASE_URL),

  /** TourAPI MobileOS */
  tourApiMobileOs: str('TOUR_API_MOBILE_OS', 'ETC'),

  /** TourAPI MobileApp */
  tourApiMobileApp: str('TOUR_API_MOBILE_APP', 'GozneokLite'),

  /**
   * TourAPI 서비스키 — env 우선, 없으면 내장값(builtins)
   * ⚠️ 절대 응답 바디에 포함하거나 로그에 출력하지 마세요
   */
  tourApiServiceKey: resolvedServiceKey,

  /** true 이면 TourAPI 호출 없이 더미 데이터를 반환 */
  useDummyData: bool('USE_DUMMY_DATA', false),

  /** CORS 허용 오리진 목록 ('*' 단일 항목이면 모든 오리진 허용) */
  corsOrigins: list('CORS_ORIGINS', [
    'http://localhost:5173',
    'https://gozneok-lite.apps.tossmini.com',
    'https://gozneok-lite.private-apps.tossmini.com',
  ]),
} as const;

/** 서비스키를 안전하게 반환 (로그 노출 금지) */
export function getServiceKey(): string {
  if (!config.tourApiServiceKey) {
    throw new Error('TOUR_API_SERVICE_KEY를 확인할 수 없습니다.');
  }
  return config.tourApiServiceKey;
}
