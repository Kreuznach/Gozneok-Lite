/**
 * apiLogger.ts
 * API 호출 로그를 메모리에 기록하는 싱글턴 저장소
 *
 * - tourApiClient의 모든 fetch에서 자동으로 기록됨
 * - Debug 페이지에서 실시간으로 열람 가능
 * - DEV/PROD 모두 동작하지만, Debug 화면은 설정에서 활성화해야 접근 가능
 */

export type ApiLogStatus = number | 'ERR';

export interface ApiLogEntry {
  /** 자동 증가 ID (최신이 낮음 → 최신순 정렬용) */
  id: number;
  /** 요청 URL (풀 URL) */
  url: string;
  /** HTTP 상태코드 또는 네트워크 에러 시 'ERR' */
  status: ApiLogStatus;
  /** res.ok (200–299) 여부 */
  ok: boolean;
  /** 요청~응답 소요 시간 (ms) */
  durationMs: number;
  /** 에러 메시지 (실패 시) */
  error?: string;
  /** 기록 시각 (Date.now() 기준) */
  timestamp: number;
}

const MAX_LOGS = 100;
let _seq = 0;
const _logs: ApiLogEntry[] = [];

export const apiLogger = {
  /**
   * 새 로그 항목 추가 (최신이 앞에 옴)
   */
  add(entry: Omit<ApiLogEntry, 'id'>): void {
    _logs.unshift({ ...entry, id: ++_seq });
    if (_logs.length > MAX_LOGS) _logs.length = MAX_LOGS;
  },

  /** 현재 저장된 로그 복사본 반환 */
  getLogs(): ApiLogEntry[] {
    return [..._logs];
  },

  /** 전체 로그 초기화 */
  clear(): void {
    _logs.length = 0;
  },

  /** 저장된 로그 수 */
  count(): number {
    return _logs.length;
  },
};
