import { expect, test } from '@playwright/test';
import { openTestMode } from './helpers';

/** 頂端列在海面狀態不能在底緣壓出一條暗線：底緣下方 0–6 px 每一列的平均亮度，相鄰列差 < 12/255 */
test('海面狀態的頂端列底緣沒有暗線', async ({ page }) => {
  await openTestMode(page);
  const box = (await page.locator('body > div header, #root > header').first().boundingBox())!;
  const shot = await page.screenshot({ clip: { x: 0, y: box.y + box.height - 4, width: box.width, height: 12 } });
  const rows = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const out: number[] = [];
    for (let y = 0; y < img.height; y++) {
      const d = ctx.getImageData(0, y, img.width, 1).data;
      let sum = 0;
      for (let i = 0; i < d.length; i += 4) sum += 0.299 * d[i]! + 0.587 * d[i + 1]! + 0.114 * d[i + 2]!;
      out.push(sum / (d.length / 4));
    }
    return out;
  }, shot.toString('base64'));
  for (let i = 1; i < rows.length; i++) expect(Math.abs(rows[i]! - rows[i - 1]!), `row ${i}`).toBeLessThan(12);
});

test('ascii on：整個畫面改成字元渲染（tier 2 才有後製）', async ({ page }, info) => {
  test.skip(info.project.name === 'mobile', '指令列按鈕只在桌機');
  await openTestMode(page, '&tier=2');
  const canvas = page.locator('[data-testid=scene] canvas');
  const before = await canvas.screenshot();
  await page.keyboard.press('/');
  const input = page.getByRole('dialog').getByLabel('輸入指令');
  await input.fill('ascii on');
  await input.press('Enter');
  await expect(page.getByRole('dialog')).toContainText('ascii on');
  await page.keyboard.press('Escape');
  await expect.poll(async () => Buffer.compare(await canvas.screenshot(), before) !== 0).toBe(true);
});
