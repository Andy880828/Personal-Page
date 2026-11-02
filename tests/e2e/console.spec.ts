import { expect, test } from '@playwright/test';
import { collectErrors, openTestMode } from './helpers';

const inView = async (page: import('@playwright/test').Page, id: string) =>
  page.evaluate((sel) => {
    const r = document.getElementById(sel)!.getBoundingClientRect();
    return r.top < window.innerHeight * 0.5 && r.bottom > 0;
  }, id);

test.describe('指令列與快捷鍵', () => {
  test('按 / 開啟、help 列指令、goto 捲動、Esc 關閉並把焦點還給按鈕', async ({ page }, info) => {
    const errors = collectErrors(page);
    await openTestMode(page);
    await page.keyboard.press('/');
    const dialog = page.getByRole('dialog', { name: '指令列' });
    await expect(dialog).toBeVisible();
    const input = dialog.getByLabel('輸入指令');
    await expect(input).toBeFocused();
    await input.fill('help');
    await input.press('Enter');
    await expect(dialog.getByRole('log')).toContainText('dive <公尺>');
    await input.fill('goto experience');
    await input.press('Enter');
    await expect.poll(() => inView(page, 'experience')).toBe(true);
    await input.fill('ctd');
    await input.press('Enter');
    await expect(dialog.getByRole('log')).toContainText('深層帶');
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    // 開啟按鈕只在 md 以上顯示；手機用鍵盤 / 開啟，關閉後沒有按鈕可還焦點
    if (info.project.name !== 'mobile') await expect(page.getByRole('button', { name: '開啟指令列' })).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('dive 1200 讓深度計顯示 1,200 m，水溫與壓力跟著換算', async ({ page }, info) => {
    test.skip(info.project.name === 'mobile', '深度計只在桌機顯示');
    await openTestMode(page);
    await page.getByRole('button', { name: '開啟指令列' }).click();
    const input = page.getByRole('dialog').getByLabel('輸入指令');
    await input.fill('dive 1200');
    await input.press('Enter');
    const hud = page.getByTestId('hud');
    await expect(hud).toContainText('1,200');
    await expect(hud).toContainText('121 atm');
    await expect(hud).toContainText('深層帶');
  });

  test('j / k 在段落間移動；在輸入框裡打字不會觸發', async ({ page }) => {
    await openTestMode(page);
    await page.keyboard.press('j');
    await expect.poll(() => inView(page, 'about')).toBe(true);
    await page.keyboard.press('j');
    await expect.poll(() => inView(page, 'skills')).toBe(true);
    await page.keyboard.press('k');
    await expect.poll(() => inView(page, 'about')).toBe(true);
    await page.keyboard.press('/');
    await page.getByRole('dialog').getByLabel('輸入指令').type('jjj');
    await expect.poll(() => inView(page, 'about')).toBe(true);
  });

  test('每段都有科學註記與來源連結', async ({ page }) => {
    await page.goto('/?tier=0');
    const notes = page.getByTestId('science-note');
    await expect(notes).toHaveCount(5);
    const links = notes.locator('a[href]');
    expect(await links.count()).toBeGreaterThanOrEqual(5);
    for (const href of await links.evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href)))
      expect(href).toMatch(/^https:\/\//);
  });
});
