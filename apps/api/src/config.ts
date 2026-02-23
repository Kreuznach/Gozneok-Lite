/**
 * apps/api/src/config.ts
 * 환경설정 통합 모듈
 *
 * 우선순위 (높음 → 낮음):
 *   1. 이미 주입된 process.env (CI/CD, Docker, 플랫폼 환경변수)
 *   2. .env.local  (로컬 개발 전용, git 제외)
 *   3. .env        (팀 공통 기본값, git 포함 가능 — 시크릿 절대 금지)
 *   4. 코드 내 하드코딩된 기본값 (비민감 값만)
 *
 * ⚠️  TOUR_API_SERVICE_KEY 가 없으면 자동으로 더미 데이터 모드로 전환됩니다.
 *     실서비스용 키는 배포 플랫폼의 환경변수 설정에서 직접 주입하세요.
 */

import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

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

const rawServiceKey = process.env['TOUR_API_SERVICE_KEY']?.trim();
const hasServiceKey = !!rawServiceKey && rawServiceKey !== '__PUT_YOUR_KEY_HERE__';

/** API 키가 없으면 더미 모드를 자동으로 활성화 */
const autoUseDummy = !hasServiceKey;

if (autoUseDummy) {
  console.warn(
    '[config] ⚠️  TOUR_API_SERVICE_KEY 미설정 — 더미 데이터 모드로 실행됩니다.\n' +
    '         실제 데이터가 필요하면 .env.local 또는 환경변수에 키를 설정하세요.',
  );
}

export const config = {
  /** HTTP 서버 포트 */
  port: int('PORT', 3001),

  /** TourAPI 기본 URL */
  tourApiBaseUrl: str(
    'TOUR_API_BASE_URL',
    'https://apis.data.go.kr/B551011/KorService2',
  ),

  /** TourAPI MobileOS */
  tourApiMobileOs: str('TOUR_API_MOBILE_OS', 'ETC'),

  /** TourAPI MobileApp */
  tourApiMobileApp: str('TOUR_API_MOBILE_APP', 'GozneokLite'),

  /**
   * TourAPI 서비스키
   * 없을 경우 getServiceKey() 호출 시 예외를 던집니다.
   * (더미 모드에서는 호출 자체가 되지 않음)
   */
  tourApiServiceKey: rawServiceKey ?? '',

  /** true 이면 TourAPI 호출 없이 더미 데이터를 반환 */
  useDummyData: bool('USE_DUMMY_DATA', false) || autoUseDummy,

  /** CORS 허용 오리진 목록 */
  corsOrigins: list('CORS_ORIGINS', ['http://localhost:5173']),
} as const;

/** 서비스키를 안전하게 반환 (로그 노출 금지) */
export function getServiceKey(): string {
  if (!config.tourApiServiceKey) {
    throw new Error(
      'TOUR_API_SERVICE_KEY가 설정되지 않았습니다. ' +
      '환경변수 또는 .env.local 파일을 확인하세요.',
    );
  }
  return config.tourApiServiceKey;
}
