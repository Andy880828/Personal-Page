import { expect, test } from '@playwright/test';
import { collectErrors, openTestMode, scrollToPos } from './helpers';

/**
 * 視覺回歸：六個深度（海面、透光帶、技能氣泡、作品、經歷、海床）× 桌機與手機。
 * 桌機用 tier 2（含後製），手機用 tier 1（軟體算繪或手機實際會拿到的等級）。
 * 基準圖由 CI（ubuntu-24.04 + Playwright Chromium 1243）產生，見 README「更新基準圖」。
 * 其他機器的字型光柵化有次像素差異，中文換行會跟著不同，所以預設只在 CI 比對；本機要跑請設 VISUAL=1。
 */
const STOPS = [
  { name: 'hero', pos: 0 },
  { name: 'about', pos: 1.5 },
  { name: 'skills', pos: 2.5 },
  { name: 'projects', pos: 3.5 },
  { name: 'experience', pos: 4.5 },
  { name: 'seafloor', pos: 5.6 },
];

test('各深度的畫面與基準圖一致', async ({ page }, info) => {
  test.skip(!process.env.CI && !process.env.VISUAL, '視覺基準圖以 CI 為準；本機要比對請設 VISUAL=1');
  const errors = collectErrors(page);
  const tier = info.project.name === 'desktop' ? 2 : 1;
  await openTestMode(page, `&tier=${tier}`);
  for (const stop of STOPS) {
    await scrollToPos(page, stop.pos);
    await expect(page).toHaveScreenshot(`${stop.name}.png`);
  }
  expect(errors).toEqual([]);
});
