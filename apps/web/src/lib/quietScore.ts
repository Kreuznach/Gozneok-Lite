/**
 * quietScore.ts
 * 조용함 지수(Quiet Score) 계산 — 베이지안 평균 보정
 *
 * 공식:
 *   score = (m * C + sumVotes) / (m + n)
 *   C = 전역 평균 (초기: 3.5)
 *   m = 최소 신뢰 표본 수 (10)
 *   n = 해당 장소 투표 수
 */

const GLOBAL_AVERAGE = 3.5;  // C
const MIN_VOTES = 10;         // m

/**
 * 베이지안 보정 점수 계산
 * @param votes - 해당 장소 투표 점수 배열
 */
export function calcBayesianScore(votes: number[]): number {
  const n = votes.length;
  if (n === 0) return GLOBAL_AVERAGE;
  const sum = votes.reduce((acc, v) => acc + v, 0);
  return (MIN_VOTES * GLOBAL_AVERAGE + sum) / (MIN_VOTES + n);
}

/**
 * 점수 → 레이블 (단정 표현 금지, "대체로/경향" 표현만 사용)
 */
export function scoreToLabel(score: number, voteCount: number): string {
  if (voteCount === 0) return '아직 평가 정보가 없어요';
  if (score >= 4.3) return '대체로 매우 조용한 편이에요';
  if (score >= 3.5) return '비교적 조용한 경향이 있어요';
  if (score >= 2.7) return '보통 수준인 편이에요';
  if (score >= 2.0) return '다소 혼잡할 수 있어요';
  return '비교적 웅성거리는 경향이 있어요';
}

/**
 * 점수 → 색상 (TDS 라이트 모드 팔레트 참고)
 */
export function scoreToColor(score: number): string {
  if (score >= 4.3) return '#00A878';
  if (score >= 3.5) return '#5AC4A8';
  if (score >= 2.7) return '#F5A623';
  return '#E5534B';
}

/**
 * 시간대별 조용함 설명 (휴리스틱)
 * 단정 금지 — "대체로/경향" 표현만
 */
export function timeSlotHint(timeSlot: string): string {
  switch (timeSlot) {
    case 'morning':
      return '오전에는 대체로 한적한 경향이 있어요';
    case 'afternoon':
      return '오후에는 방문객이 늘 수 있어요';
    case 'evening':
      return '저녁에는 분위기가 달라질 수 있어요';
    default:
      return '현재 시간 기준으로 추천드려요';
  }
}
