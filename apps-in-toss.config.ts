import { defineConfig } from '@apps-in-toss/web-framework/config';

/**
 * apps-in-toss.config.ts
 * Apps in Toss(WebView) 미니앱 설정 파일
 * (SDK 3.x 업그레이드로 granite.config.ts에서 이름 변경 — brand.displayName/icon,
 *  web.host/port/commands, outdir는 3.x 스키마에서 제거되어 Toss 파트너 콘솔/각 스크립트로 이전됨)
 *
 * [심사 제출 전 확인 사항]
 * - 앱 표시 이름·아이콘: Toss 파트너 콘솔에서 등록/업로드
 */
export default defineConfig({
  appName: 'gozneok-lite',

  brand: {
    primaryColor: '#3B82F6',
  },

  webBundleDir: 'apps/web/dist',

  /**
   * 권한 선언
   * - geolocation: 사용자 동의 시에만 사용. 거부 시 지역 선택 화면으로 대체.
   */
  permissions: [{ name: 'geolocation', access: 'access' }],
});
