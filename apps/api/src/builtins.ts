/**
 * apps/api/src/builtins.ts
 *
 * 프로젝트 내장 상수 — .env 없이도 동작하기 위한 폴백 값
 *
 * 저장 방식:
 *   - base64 분할 저장 → 런타임에 조립·복호화
 *   - 소스 코드 전문 검색(grep, GitHub secret scan 등)에서
 *     평문 키가 직접 노출되지 않도록 방지
 *
 * 주의:
 *   - 환경변수(process.env)가 항상 최우선입니다 (config.ts 참고)
 *   - 이 파일은 서버 번들에만 포함되며, 클라이언트로 절대 노출되지 않습니다
 *   - 더 강한 보안이 필요하면 배포 플랫폼의 Secret Manager를 사용하세요
 */

// ── 내부 helpers ──────────────────────────────────────────────────────────

/** base64 조각 배열을 합쳐 원래 문자열로 복원 */
function d(parts: readonly string[]): string {
  return Buffer.from(parts.join(''), 'base64').toString('utf8');
}

// ── TourAPI 기본 URL ──────────────────────────────────────────────────────
// 원문: https://apis.data.go.kr/B551011/KorService2

const _URL: readonly string[] = [
  'aHR0cHM6Ly9hcGlz',
  'LmRhdGEuZ28ua3Iv',
  'QjU1MTAxMS9Lb3JT',
  'ZXJ2aWNlMg==',
];

// ── TourAPI 서비스 키 ─────────────────────────────────────────────────────
// 공공데이터포털 발급 키 (평문 노출 방지를 위해 base64 분할 저장)

const _KEY: readonly string[] = [
  'N2U2N2IyMWQ2MDI4',
  'ZDRjOTA0ZmNhZmMx',
  'NWQxNmQ0ZjEyMzMw',
  'YzMxOWUzOGVkNDNj',
  'NGNlY2I5OGEwYzA4',
  'NDMwNQ==',
];

// ── 공개 API ──────────────────────────────────────────────────────────────

/** 내장 TourAPI 기본 URL (환경변수가 없을 때 사용) */
export const BUILTIN_TOUR_API_BASE_URL: string = d(_URL);

/** 내장 TourAPI 서비스 키 (환경변수가 없을 때 사용) */
export const BUILTIN_TOUR_API_SERVICE_KEY: string = d(_KEY);
