/**
 * admob.ts
 * Apps in Toss AdMob API 래퍼
 *
 * SDK: @apps-in-toss/web-framework (web-bridge 경유)
 * - 배너(노출형):       TossAds.attachBanner  — 토스앱 5.241.0 이상 필요
 * - 전면형(인터스티셜): loadFullScreenAd → showFullScreenAd
 * - 보상형(리워드):     GoogleAdMob.loadAppsInTossAdMob → GoogleAdMob.showAppsInTossAdMob
 *
 * 배너 광고 ID
 *   TEST (비PROD 빌드): ait-ad-test-native-image-id  (피드형·native-image)
 *   LIVE (PROD 빌드):   ait.v2.live.cc42e4d2cbf54b8d
 *   환경변수 VITE_ADMOB_BANNER_GROUP_ID 가 설정된 경우 해당 값을 최우선 사용
 *
 * 빈도 룰:
 *   전면형: 2분 쿨다운, 세션 최대 2회
 *   보상형: 명시적 버튼 클릭 시에만
 *
 * 참고: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/광고/RN-BannerAd.html
 */
import {
  GoogleAdMob,
  TossAds,
  loadFullScreenAd,
  showFullScreenAd,
} from '@apps-in-toss/web-framework';

/** 광고 그룹 ID — 환경변수 미설정 시 빈 문자열 → 광고 자동 비활성화 */
const AD_GROUP_INTERSTITIAL =
  import.meta.env.VITE_ADMOB_INTERSTITIAL_GROUP_ID ?? '';
const AD_GROUP_REWARDED =
  import.meta.env.VITE_ADMOB_REWARDED_GROUP_ID ?? '';
/**
 * 배너 광고 그룹 ID
 * 우선순위: 환경변수 > PROD 빌드('ait.v2.live.cc42e4d2cbf54b8d') > TEST('ait-ad-test-native-image-id')
 */
const AD_GROUP_BANNER =
  import.meta.env.VITE_ADMOB_BANNER_GROUP_ID ||
  (import.meta.env.PROD
    ? 'ait.v2.live.cc42e4d2cbf54b8d'
    : 'ait-ad-test-native-image-id');

/** 전면형 쿨다운 (2분) */
const INTERSTITIAL_COOLDOWN_MS = 2 * 60 * 1000;
/** 세션당 전면형 최대 노출 횟수 */
const INTERSTITIAL_MAX_PER_SESSION = 2;
/** 로드 타임아웃 (5초) */
const AD_LOAD_TIMEOUT_MS = 5_000;
/** 시청 타임아웃 (30초) */
const AD_SHOW_TIMEOUT_MS = 30_000;

// ────────────────────────────────────────────────────────
// 세션 상태
// ────────────────────────────────────────────────────────

let interstitialLastShownAt = 0;
let interstitialSessionCount = 0;

// ────────────────────────────────────────────────────────
// 유틸
// ────────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

// ────────────────────────────────────────────────────────
// 내부 구현
// ────────────────────────────────────────────────────────

function _loadFullScreen(adGroupId: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const cleanup = loadFullScreenAd({
      options: { adGroupId },
      onEvent: (event) => {
        if (event.type === 'loaded') {
          cleanup();
          resolve(true);
        }
      },
      onError: () => {
        resolve(false);
      },
    });
  });
}

function _showFullScreen(adGroupId: string): Promise<void> {
  return new Promise<void>((resolve) => {
    const cleanup = showFullScreenAd({
      options: { adGroupId },
      onEvent: (event) => {
        // dismissed 또는 failedToShow 시 완료 처리
        if (event.type === 'dismissed' || event.type === 'failedToShow') {
          cleanup();
          resolve();
        }
      },
      onError: () => {
        resolve();
      },
    });
  });
}

function _loadRewarded(adGroupId: string): Promise<string | null> {
  // adUnitId 반환 (show에서 필요)
  return new Promise<string | null>((resolve) => {
    const cleanup = GoogleAdMob.loadAppsInTossAdMob({
      options: { adGroupId },
      onEvent: (event) => {
        if (event.type === 'loaded') {
          cleanup();
          resolve(event.data.adGroupId);
        }
      },
      onError: () => {
        resolve(null);
      },
    });
  });
}

function _showRewarded(adGroupId: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const cleanup = GoogleAdMob.showAppsInTossAdMob({
      options: { adGroupId },
      onEvent: (event) => {
        if (event.type === 'userEarnedReward') {
          cleanup();
          resolve(true);
        } else if (event.type === 'dismissed' || event.type === 'failedToShow') {
          cleanup();
          resolve(false);
        }
      },
      onError: () => {
        resolve(false);
      },
    });
  });
}

// ────────────────────────────────────────────────────────
// 공개 API
// ────────────────────────────────────────────────────────

/**
 * 현재 환경에서 전면형 광고 지원 여부
 * isSupported()는 동기 메서드 (SDK 제공)
 */
export function isAdSupportedSync(): boolean {
  if (!AD_GROUP_INTERSTITIAL) return false;
  try {
    return loadFullScreenAd.isSupported();
  } catch {
    return false;
  }
}

/** async 래퍼 (기존 호환) */
export async function isAdSupported(): Promise<boolean> {
  return isAdSupportedSync();
}

/** 메인 배너 광고 지원 여부 */
export function isBannerAdSupportedSync(): boolean {
  if (!AD_GROUP_BANNER) return false;
  try {
    return TossAds.attachBanner.isSupported();
  } catch {
    return false;
  }
}

/**
 * 메인 화면 배너 광고 부착
 * @returns destroy 함수 (광고 정리), 미지원 시 null
 */
export function attachMainBannerAd(target: HTMLElement): (() => void) | null {
  try {
    if (!isBannerAdSupportedSync()) return null;

    const slot = TossAds.attachBanner(AD_GROUP_BANNER, target, {
      theme: 'auto',
      variant: 'expanded',   // 피드형(native image) 광고에 적합한 인라인 확장 레이아웃
      tone: 'blackAndWhite', // 문서 기본값(SDK 기준)에 맞춤
    });

    return () => {
      try {
        slot.destroy();
      } catch {
        // 광고 정리 실패는 무시
      }
    };
  } catch {
    return null;
  }
}

/**
 * 전면형 광고 표시 (자연스러운 전환 시점에 호출)
 * - 첫 진입 / 첫 상세 진입에서는 절대 호출 금지
 * - 빈도 룰: 2분 쿨다운, 세션당 최대 2회
 */
export async function showInterstitialAd(): Promise<void> {
  try {
    if (!AD_GROUP_INTERSTITIAL) return;
    if (!loadFullScreenAd.isSupported()) return;

    const now = Date.now();
    if (now - interstitialLastShownAt < INTERSTITIAL_COOLDOWN_MS) return;
    if (interstitialSessionCount >= INTERSTITIAL_MAX_PER_SESSION) return;

    const loaded = await withTimeout(
      _loadFullScreen(AD_GROUP_INTERSTITIAL),
      AD_LOAD_TIMEOUT_MS,
      false
    );
    if (!loaded) return;

    await withTimeout(
      _showFullScreen(AD_GROUP_INTERSTITIAL),
      AD_SHOW_TIMEOUT_MS,
      undefined
    );

    interstitialLastShownAt = Date.now();
    interstitialSessionCount += 1;
  } catch {
    // 광고 실패 → 무시, UX 유지
  }
}

/**
 * 보상형 광고 표시 (명시적 버튼 클릭 시에만 호출)
 * @returns true = 보상 지급됨, false = 지급 안 됨/실패
 */
export async function showRewardedAd(): Promise<boolean> {
  try {
    if (!AD_GROUP_REWARDED) return false;
    if (!GoogleAdMob.loadAppsInTossAdMob.isSupported()) return false;

    const adGroupId = await withTimeout(
      _loadRewarded(AD_GROUP_REWARDED),
      AD_LOAD_TIMEOUT_MS,
      null
    );
    if (!adGroupId) return false;

    const earned = await withTimeout(
      _showRewarded(adGroupId),
      AD_SHOW_TIMEOUT_MS,
      false
    );
    return earned;
  } catch {
    return false;
  }
}
