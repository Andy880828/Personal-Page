import { expect, test } from '@playwright/test';
import { collectErrors, openTestMode, scrollToPos } from './helpers';

const inView = async (page: import('@playwright/test').Page, id: string) =>
  page.evaluate((sel) => {
    const r = document.getElementById(sel)!.getBoundingClientRect();
    return r.top < window.innerHeight * 0.5 && r.bottom > 0;
  }, id);

test.describe('路由', () => {
  test('/about 與 /project 直接開啟會捲到對應段落', async ({ page }) => {
    await page.goto('/about?test=1');
    await expect.poll(() => inView(page, 'about')).toBe(true);
    await page.goto('/project?test=1');
    await expect.poll(() => inView(page, 'projects')).toBe(true);
  });

  test('未知路徑導回首頁', async ({ page }) => {
    await page.goto('/no-such-page?test=1');
    await expect(page).toHaveURL(/\/\?test=1$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('林敬勛');
  });

  test('導覽列可以跳到經歷段落並標示目前位置', async ({ page }, info) => {
    test.skip(info.project.name === 'mobile', '手機版導覽在選單裡，另一個測試涵蓋');
    await openTestMode(page);
    await page.getByRole('navigation', { name: '主要導覽' }).getByRole('link', { name: '經歷' }).click();
    await expect.poll(() => inView(page, 'experience')).toBe(true);
    await expect(page.getByRole('link', { name: '經歷' })).toHaveAttribute('aria-current', 'location');
  });

  test('手機選單可以開關並跳到作品', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile', '只在手機版');
    await openTestMode(page);
    await page.getByRole('button', { name: '開啟選單' }).click();
    await page.locator('#mobile-menu').getByRole('link', { name: /作品/ }).click();
    await expect(page.locator('#mobile-menu')).toHaveCount(0);
    await expect(page).toHaveURL(/\/project/);
    await expect.poll(() => inView(page, 'projects')).toBe(true);
  });
});

test.describe('互動', () => {
  test('技能分頁：點擊與方向鍵切換', async ({ page }) => {
    await openTestMode(page);
    await scrollToPos(page, 2.5);
    await page.getByRole('tab', { name: /工作流程數位化/ }).click();
    await expect(page.getByRole('tabpanel')).toContainText('PostgreSQL');
    await page.getByRole('tab', { name: /工作流程數位化/ }).press('ArrowRight');
    await expect(page.getByRole('tab', { name: /Agent 應用/ })).toBeFocused();
    await expect(page.getByRole('tabpanel')).toContainText('Claude Code');
  });

  test('作品篩選', async ({ page }) => {
    await openTestMode(page);
    await scrollToPos(page, 3.2);
    await expect(page.locator('#projects article')).toHaveCount(10);
    await page.getByRole('button', { name: /^網站/ }).click();
    await expect(page.locator('#projects article')).toHaveCount(3);
    await expect(page.getByRole('button', { name: /^網站/ })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: /^全部/ }).click();
    await expect(page.locator('#projects article')).toHaveCount(10);
  });

  test('聯絡表單：必填驗證與送出（攔截 EmailJS，不真的寄信）', async ({ page }) => {
    let sent = 0;
    await page.route('https://api.emailjs.com/**', (route) => {
      sent++;
      return route.fulfill({ status: 200, body: 'OK' });
    });
    await openTestMode(page);
    await scrollToPos(page, 5.6);
    const form = page.locator('#contact form');
    await form.getByRole('button', { name: '送出' }).click();
    // 原生驗證擋下：沒有送出
    expect(sent).toBe(0);
    await form.getByLabel('姓名').fill('測試');
    await form.getByLabel('Email').fill('test@example.com');
    await form.getByLabel('訊息').fill('你好，這是自動化測試。');
    await form.getByRole('button', { name: '送出' }).click();
    await expect(page.getByRole('status').filter({ hasText: '收到了' })).toBeVisible();
    expect(sent).toBe(1);
  });

  test('鍵盤：第一個 Tab 是「跳到主要內容」，之後的焦點都在可見元素上', async ({ page }) => {
    await openTestMode(page);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: '跳到主要內容' })).toBeFocused();
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const ok = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return true;
        if (el.closest('[aria-hidden="true"]')) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      expect(ok, `第 ${i + 1} 次 Tab 落在隱藏元素上`).toBe(true);
    }
  });
});

test.describe('版面', () => {
  test('手機：每個段落都不會橫向溢出', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile', '只在手機版');
    await openTestMode(page);
    for (const pos of [0, 1.5, 2.5, 3.5, 4.5, 5.6]) {
      await scrollToPos(page, pos);
      const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
      expect(sw, `pos ${pos}`).toBeLessThanOrEqual(iw);
    }
  });
});

test.describe('降級與效能', () => {
  test('減少動態：載入完成後畫面靜止（rAF 每秒少於 5 次）', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const w = window as Window & { __raf?: number };
      w.__raf = 0;
      const orig = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (cb) => {
        w.__raf!++;
        return orig(cb);
      };
    });
    await page.goto('/?perf=1&tier=1');
    await page.waitForFunction(() => window.__site?.ready() === true, null, { timeout: 60_000 });
    await page.waitForTimeout(2500);
    const start = await page.evaluate(() => (window as Window & { __raf?: number }).__raf!);
    await page.waitForTimeout(2000);
    const end = await page.evaluate(() => (window as Window & { __raf?: number }).__raf!);
    expect((end - start) / 2).toBeLessThan(5);
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduce');
  });

  test('tier 0（沒有 WebGL）：沒有 Canvas，內容完整', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/?tier=0');
    await expect(page.locator('canvas')).toHaveCount(0);
    for (const id of ['about', 'skills', 'projects', 'experience', 'contact'])
      await expect(page.locator(`#${id} h2`)).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('效能 smoke：場景持續重繪並回報 frame time', async ({ page }, info) => {
    test.skip(info.project.name === 'mobile', '桌機跑一次就好');
    await page.goto('/?perf=1&tier=2');
    await page.waitForFunction(() => window.__site?.ready() === true, null, { timeout: 60_000 });
    await page.waitForFunction(() => (window.__perf?.samples ?? 0) > 20, null, { timeout: 60_000 });
    const perf = await page.evaluate(() => window.__perf!);
    info.annotations.push({ type: 'avgFrameMs（SwiftShader，僅供參考）', description: perf.avgFrameMs.toFixed(1) });
    expect(perf.avgFrameMs).toBeGreaterThan(0);
    expect(perf.avgFrameMs).toBeLessThan(2000);
  });
});
