import { defineConfig } from '@apps-in-toss/web-framework';

/**
 * granite.config.ts
 * Apps in Toss(WebView) 미니앱 설정 파일
 *
 * [심사 제출 전 확인 사항]
 * - brand.icon: Toss 파트너 콘솔에서 심사용 아이콘을 업로드하고 발급된 URL로 교체 필요
 * - brand.primaryColor: 디자인 확정 후 변경 가능 (현재 placeholder)
 */
export default defineConfig({
  appName: 'gozneok-lite',

  brand: {
    displayName: 'Gozneok Lite',
    // NOTE: 심사 통과용 아이콘 업로드 후 Toss 콘솔에서 발급된 URL로 교체
    icon: 'https://placehold.co/96x96/3B82F6/ffffff.png',
    primaryColor: '#3B82F6',
  },

  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },

  outdir: 'dist',

  /**
   * 권한 선언
   * - geolocation: 사용자 동의 시에만 사용. 거부 시 지역 선택 화면으로 대체.
   */
  permissions: [{ name: 'geolocation', access: 'access' }],
});
