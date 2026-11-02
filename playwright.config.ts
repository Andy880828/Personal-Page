import { defineConfig, devices } from '@playwright/test';

/**
 * 視覺回歸與互動測試。
 * - 用自己的 build（帶假的 EmailJS 設定，表單才會啟用；送出請求在測試裡攔截）
 * - Chromium 用 SwiftShader 軟體算繪，CI 沒有 GPU 也能畫 WebGL，結果可重現
 */
const swiftshader = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  expect: {
    timeout: 20_000,
    // 基準圖以 CI（ubuntu-24.04 + Playwright Chromium）的渲染為準。
    // 其他機器的字寬有次像素差異，中文段落可能在換行邊界多擠一個字，所以本機容差放寬一點。
    toHaveScreenshot: { maxDiffPixelRatio: process.env.CI ? 0.02 : 0.04, animations: 'disabled', caret: 'hide' },
  },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
  use: {
    baseURL: 'http://localhost:4173',
    launchOptions: { args: swiftshader },
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      VITE_EMAILJS_SERVICE_ID: 'service_test',
      VITE_EMAILJS_TEMPLATE_ID: 'template_test',
      VITE_EMAILJS_PUBLIC_KEY: 'public_test',
    },
  },
});
