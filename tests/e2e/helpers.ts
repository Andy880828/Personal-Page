import type { Page } from '@playwright/test';

/**
 * 進入確定性模式並等 3D 場景畫好。
 * CI 沒有 GPU 會被分到 tier 0（沒有 3D），所以測試一律用網址指定等級（預設 1）。
 */
export async function openTestMode(page: Page, query = '') {
  const tier = query.includes('tier=') ? '' : '&tier=1';
  await page.goto(`/?test=1${tier}${query}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.__site?.ready() === true, null, { timeout: 60_000 });
}

/** 捲到某個段落位置並等場景重繪一幀 */
export async function scrollToPos(page: Page, pos: number) {
  const before = await page.evaluate(() => window.__site!.frames());
  await page.evaluate((p) => window.__site!.scrollToPos(p), pos);
  await page.waitForFunction((f) => window.__site!.frames() > f, before, { timeout: 30_000 });
  // 等 DOM（例如導覽列狀態）也跟上
  await page.waitForTimeout(150);
}

/** 收集頁面上的錯誤（console.error 與未捕捉例外） */
export function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}
