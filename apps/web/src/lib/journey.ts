/**
 * journey.ts — 고요 도장 / 배지 / 주간 미션 / 월간 리포트 / 다시 가 볼까요 카드
 * 모든 기록은 기기 localStorage에만 저장합니다 (서버 전송 없음).
 * 미션·리포트는 도장과 위시리스트로부터 계산하므로 별도 저장하지 않습니다.
 */
import type { Stamp, StampSlot, Season, BadgeRecord, WishlistItem } from '@/types';
import { KEYS } from './storage';

export const NOTE_MAX_LENGTH = 100;
const DAY_MS = 24 * 60 * 60 * 1000;
const REVISIT_AFTER_DAYS = 30;

export const SLOT_LABEL: Record<StampSlot, string> = {
  morning: '오전',
  afternoon: '오후',
  evening: '저녁',
};

export const SEASON_LABEL: Record<Season, string> = {
  spring: '🌸 봄',
  summer: '🌊 여름',
  autumn: '🍂 가을',
  winter: '❄️ 겨울',
};

// ────────────────────────────────────────────────────────
// 시간 유틸
// ────────────────────────────────────────────────────────

export function currentSlot(date = new Date()): StampSlot {
  const h = date.getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export function seasonOf(date = new Date()): Season {
  const m = date.getMonth() + 1;
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'autumn';
  return 'winter';
}

export function dateKey(date = new Date()): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

/** 이번 주 월요일 00:00 (로컬) */
export function weekStartOf(date = new Date()): number {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = (d.getDay() + 6) % 7; // 월요일=0
  d.setDate(d.getDate() - diff);
  return d.getTime();
}

function monthStartOf(date = new Date()): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
}

// ────────────────────────────────────────────────────────
// 도장
// ────────────────────────────────────────────────────────

export function getStamps(): Stamp[] {
  try {
    const raw = localStorage.getItem(KEYS.STAMPS);
    const list = raw ? (JSON.parse(raw) as Stamp[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveStamps(list: Stamp[]): void {
  try {
    localStorage.setItem(KEYS.STAMPS, JSON.stringify(list));
  } catch {
    /* 용량 초과 등 무시 */
  }
}

export interface AddStampInput {
  contentId: string;
  title: string;
  areaCode: string;
  firstimage?: string;
  timeSlot: StampSlot;
  note?: string;
}

export interface AddStampResult {
  /** 같은 날 같은 시간대 도장이 이미 있으면 false */
  added: boolean;
  newBadges: BadgeDef[];
}

export function addStamp(input: AddStampInput): AddStampResult {
  const now = new Date();
  const today = dateKey(now);
  const list = getStamps();
  const duplicated = list.some(
    (s) =>
      s.contentId === input.contentId &&
      s.timeSlot === input.timeSlot &&
      dateKey(new Date(s.visitedAt)) === today
  );
  if (duplicated) return { added: false, newBadges: [] };

  const note = input.note?.trim().slice(0, NOTE_MAX_LENGTH);
  list.unshift({
    id: `${input.contentId}-${now.getTime()}`,
    contentId: input.contentId,
    title: input.title,
    areaCode: input.areaCode,
    firstimage: input.firstimage,
    visitedAt: now.getTime(),
    timeSlot: input.timeSlot,
    season: seasonOf(now),
    ...(note ? { note } : {}),
  });
  saveStamps(list);
  return { added: true, newBadges: syncBadges(list) };
}

export function removeStamp(id: string): void {
  saveStamps(getStamps().filter((s) => s.id !== id));
}

export function stampsOfPlace(contentId: string): Stamp[] {
  return getStamps().filter((s) => s.contentId === contentId);
}

// ────────────────────────────────────────────────────────
// 배지
// ────────────────────────────────────────────────────────

export interface BadgeDef {
  id: string;
  emoji: string;
  name: string;
  description: string;
  target: number;
  progress: (stamps: Stamp[]) => number;
}

function distinctPlaces(stamps: Stamp[]): number {
  return new Set(stamps.map((s) => s.contentId)).size;
}

/** 그룹별 서로 다른 값 개수의 최댓값 */
function maxDistinctPerGroup(
  stamps: Stamp[],
  groupBy: (s: Stamp) => string,
  value: (s: Stamp) => string
): number {
  const groups = new Map<string, Set<string>>();
  stamps.forEach((s) => {
    const key = groupBy(s);
    if (!groups.has(key)) groups.set(key, new Set());
    groups.get(key)!.add(value(s));
  });
  let max = 0;
  groups.forEach((set) => {
    max = Math.max(max, set.size);
  });
  return max;
}

export const BADGES: BadgeDef[] = [
  {
    id: 'first',
    emoji: '🎉',
    name: '첫 도장',
    description: '처음으로 도장을 찍어요',
    target: 1,
    progress: (s) => distinctPlaces(s),
  },
  {
    id: 'morning',
    emoji: '🌅',
    name: '아침 산책러',
    description: '오전에 서로 다른 3곳을 다녀와요',
    target: 3,
    progress: (s) => distinctPlaces(s.filter((x) => x.timeSlot === 'morning')),
  },
  {
    id: 'evening',
    emoji: '🌇',
    name: '노을 수집가',
    description: '저녁에 서로 다른 3곳을 다녀와요',
    target: 3,
    progress: (s) => distinctPlaces(s.filter((x) => x.timeSlot === 'evening')),
  },
  {
    id: 'timetravel',
    emoji: '⏳',
    name: '시간 여행자',
    description: '한 장소를 서로 다른 시간대에 2번 다녀와요',
    target: 2,
    progress: (s) => maxDistinctPerGroup(s, (x) => x.contentId, (x) => x.timeSlot),
  },
  {
    id: 'explorer',
    emoji: '🗺️',
    name: '동네 탐험가',
    description: '한 지역에서 서로 다른 5곳을 다녀와요',
    target: 5,
    progress: (s) =>
      maxDistinctPerGroup(
        s.filter((x) => x.areaCode),
        (x) => x.areaCode,
        (x) => x.contentId
      ),
  },
  {
    id: 'fourseasons',
    emoji: '🍀',
    name: '사계절 친구',
    description: '한 장소를 봄·여름·가을·겨울에 모두 다녀와요',
    target: 4,
    progress: (s) => maxDistinctPerGroup(s, (x) => x.contentId, (x) => x.season),
  },
];

export function getBadgeRecords(): BadgeRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.BADGES);
    const list = raw ? (JSON.parse(raw) as BadgeRecord[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** 새로 달성한 배지를 저장하고 목록을 반환 */
function syncBadges(stamps: Stamp[]): BadgeDef[] {
  const owned = getBadgeRecords();
  const ownedIds = new Set(owned.map((b) => b.id));
  const fresh = BADGES.filter(
    (b) => !ownedIds.has(b.id) && b.progress(stamps) >= b.target
  );
  if (fresh.length > 0) {
    const now = Date.now();
    try {
      localStorage.setItem(
        KEYS.BADGES,
        JSON.stringify([...owned, ...fresh.map((b) => ({ id: b.id, earnedAt: now }))])
      );
    } catch {
      /* 무시 */
    }
  }
  return fresh;
}

// ────────────────────────────────────────────────────────
// 주간 미션 (저장 없이 계산)
// ────────────────────────────────────────────────────────

export interface MissionStatus {
  id: string;
  title: string;
  progress: number;
  target: number;
  done: boolean;
}

interface MissionDef {
  id: string;
  title: string;
  target: number;
  progress: (ctx: { all: Stamp[]; week: Stamp[]; wishlist: WishlistItem[]; weekStart: number }) => number;
}

const MISSION_POOL: MissionDef[] = [
  {
    id: 'morning',
    title: '이번 주 오전에 조용한 곳 1곳 다녀오기',
    target: 1,
    progress: ({ week }) => distinctPlaces(week.filter((s) => s.timeSlot === 'morning')),
  },
  {
    id: 'wish-add',
    title: '위시리스트에 새 장소 1곳 담기',
    target: 1,
    progress: ({ wishlist, weekStart }) => wishlist.filter((w) => w.savedAt >= weekStart).length,
  },
  {
    id: 'wish-go',
    title: '위시리스트에 담아 둔 곳 중 1곳 다녀오기',
    target: 1,
    progress: ({ week, wishlist }) => {
      const ids = new Set(wishlist.map((w) => w.contentId));
      return distinctPlaces(week.filter((s) => ids.has(s.contentId)));
    },
  },
  {
    id: 'new-area',
    title: '가 보지 않은 지역에서 도장 1개 찍기',
    target: 1,
    progress: ({ all, week, weekStart }) => {
      const before = new Set(all.filter((s) => s.visitedAt < weekStart).map((s) => s.areaCode));
      return new Set(week.filter((s) => s.areaCode && !before.has(s.areaCode)).map((s) => s.areaCode)).size;
    },
  },
  {
    id: 'evening',
    title: '저녁에 조용한 곳 1곳 다녀오기',
    target: 1,
    progress: ({ week }) => distinctPlaces(week.filter((s) => s.timeSlot === 'evening')),
  },
];

/** 이번 주 미션 2개 (주마다 바뀜) */
export function getWeeklyMissions(
  stamps: Stamp[],
  wishlist: WishlistItem[],
  now = new Date()
): MissionStatus[] {
  const weekStart = weekStartOf(now);
  const weekNo = Math.floor(weekStart / (7 * DAY_MS));
  const picks = [
    MISSION_POOL[weekNo % MISSION_POOL.length],
    MISSION_POOL[(weekNo + 2) % MISSION_POOL.length],
  ];
  const week = stamps.filter((s) => s.visitedAt >= weekStart);
  return picks.map((m) => {
    const progress = Math.min(m.target, m.progress({ all: stamps, week, wishlist, weekStart }));
    return { id: m.id, title: m.title, progress, target: m.target, done: progress >= m.target };
  });
}

// ────────────────────────────────────────────────────────
// 월간 리포트
// ────────────────────────────────────────────────────────

export interface MonthlyReport {
  placeCount: number;
  stampCount: number;
  topSlot: StampSlot | null;
  newBadges: BadgeDef[];
}

export function getMonthlyReport(stamps: Stamp[], now = new Date()): MonthlyReport {
  const start = monthStartOf(now);
  const month = stamps.filter((s) => s.visitedAt >= start);
  const slotCount: Record<StampSlot, number> = { morning: 0, afternoon: 0, evening: 0 };
  month.forEach((s) => {
    slotCount[s.timeSlot] += 1;
  });
  let topSlot: StampSlot | null = null;
  (Object.keys(slotCount) as StampSlot[]).forEach((k) => {
    if (slotCount[k] > 0 && (topSlot === null || slotCount[k] > slotCount[topSlot])) topSlot = k;
  });
  const earnedIds = new Set(getBadgeRecords().filter((b) => b.earnedAt >= start).map((b) => b.id));
  return {
    placeCount: distinctPlaces(month),
    stampCount: month.length,
    topSlot,
    newBadges: BADGES.filter((b) => earnedIds.has(b.id)),
  };
}

// ────────────────────────────────────────────────────────
// 다시 가 볼까요? 카드
// ────────────────────────────────────────────────────────

/** 30일 이상 지난 장소 중 가장 최근에 다녀온 곳. 오늘 닫았거나 해당 없으면 null */
export function getRevisitCandidate(now = new Date()): Stamp | null {
  try {
    if (localStorage.getItem(KEYS.REVISIT_SEEN) === dateKey(now)) return null;
  } catch {
    return null;
  }
  const limit = now.getTime() - REVISIT_AFTER_DAYS * DAY_MS;
  const stamps = getStamps();
  const recentIds = new Set(stamps.filter((s) => s.visitedAt > limit).map((s) => s.contentId));
  const old = stamps
    .filter((s) => s.visitedAt <= limit && !recentIds.has(s.contentId))
    .sort((a, b) => b.visitedAt - a.visitedAt);
  return old[0] ?? null;
}

export function dismissRevisitCard(now = new Date()): void {
  try {
    localStorage.setItem(KEYS.REVISIT_SEEN, dateKey(now));
  } catch {
    /* 무시 */
  }
}

export function daysSince(timestamp: number, now = new Date()): number {
  return Math.floor((now.getTime() - timestamp) / DAY_MS);
}

// ────────────────────────────────────────────────────────
// 오늘의 고요 한 곳 — 날짜로 지역·장소를 정해 하루 동안 같은 곳을 보여줍니다
// ────────────────────────────────────────────────────────

export function hashString(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) >>> 0;
  }
  return h;
}
