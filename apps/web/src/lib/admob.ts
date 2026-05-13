/**
 * admob.ts — 광고 API 래퍼
 *
 * - 배너 광고:    TossAds.initialize() → TossAds.attachBanner()
 * - 전면형 광고:  loadFullScreenAd() → showFullScreenAd()
 *
 * 모든 광고 기능은 Toss 앱 WebView(v5.241.0+) 환경에서만 동작합니다.
 * 브라우저·로컬 개발 환경에서는 isSupported() = false → 광고 없이 진행됩니다.
 */
import { TossAds, loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';

const AD_GROUP_BANNER =
  (import.meta.env.VITE_ADMOB_BANNER_GROUP_ID as string | undefined) ??
  'ait.v2.live.cc42e4d2cbf54b8d';

const AD_GROUP_INTERSTITIAL = import.meta.env
  .VITE_ADMOB_INTERSTITIAL_GROUP_ID as string | undefined;

/* 전면형 빈도 제어 */
const MAX_INTERSTITIAL_PER_SESSION = 2;
const INTERSTITIAL_COOLDOWN_MS = 2 * 60 * 1000; // 2분

let interstitialCount = 0;
let lastInterstitialTime = 0;

/** 배너 광고 지원 여부 동기 확인 */
function isBannerAdSupportedSync(): boolean {
  try {
    return TossAds.initialize.isSupported() && TossAds.attachBanner.isSupported();
  } catch {
    return false;
  }
}

/**
 * 메인 배너 광고 부착
 * @returns cleanup 함수 (컴포넌트 언마운트 시 호출), 미지원 환경에서는 undefined
 */
export function attachMainBannerAd(target: HTMLDivElement): (() => void) | undefined {
  if (!isBannerAdSupportedSync()) return undefined;

  try {
    TossAds.initialize({
      callbacks: {
        onInitialized: () => {
          try {
            TossAds.attachBanner(AD_GROUP_BANNER, target, {
              theme: 'auto',
              variant: 'expanded',
              tone: 'blackAndWhite',
            });
          } catch {
            // 배너 부착 실패 — 광고 없이 진행
          }
        },
        onInitializationFailed: () => {
          // SDK 초기화 실패 — 광고 없이 진행
        },
      },
    });
  } catch {
    return undefined;
  }

  return () => {
    try {
      target.innerHTML = '';
    } catch {
      // cleanup 실패 무시
    }
  };
}

/**
 * 전면형 광고 노출 (빈도 제어 포함)
 * - 세션당 최대 2회, 2분 쿨다운
 * - 첫 진입 / 첫 상세 진입에서는 호출 금지 (호출 측 책임)
 */
export async function showInterstitialAd(): Promise<void> {
  if (!AD_GROUP_INTERSTITIAL) return;
  if (interstitialCount >= MAX_INTERSTITIAL_PER_SESSION) return;
  if (Date.now() - lastInterstitialTime < INTERSTITIAL_COOLDOWN_MS) return;

  try {
    if (!loadFullScreenAd.isSupported()) return;

    // 1단계: 광고 로드 (loaded 이벤트 대기)
    await new Promise<void>((resolve, reject) => {
      const cleanup = loadFullScreenAd({
        options: { adGroupId: AD_GROUP_INTERSTITIAL! },
        onEvent: (event) => {
          if (event.type === 'loaded') {
            cleanup?.();
            resolve();
          }
        },
        onError: (err) => {
          cleanup?.();
          reject(err);
        },
      });
    });

    // 2단계: 광고 노출 (dismissed 이벤트 대기)
    await new Promise<void>((resolve, reject) => {
      const cleanup = showFullScreenAd({
        options: { adGroupId: AD_GROUP_INTERSTITIAL! },
        onEvent: (event) => {
          if (event.type === 'dismissed') {
            cleanup?.();
            resolve();
          }
        },
        onError: (err) => {
          cleanup?.();
          reject(err);
        },
      });
    });

    interstitialCount += 1;
    lastInterstitialTime = Date.now();
  } catch {
    // 전면형 광고 실패 — 앱 동작에 영향 없음
  }
}
