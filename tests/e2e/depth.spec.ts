import { expect, test } from '@playwright/test';
import { openTestMode, scrollToPos } from './helpers';

/**
 * 越潛越暗：直接讀 WebGL canvas 的像素（測試模式 preserveDrawingBuffer），只量 3D 場景不量 DOM。
 * tier 1 沒有後製，曾經因為水色被當成線性值輸出，深層帶反而比中層帶亮；兩條路徑都要量。
 */
async function sceneLuma(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const src = document.querySelector<HTMLCanvasElement>('[data-testid=scene] canvas')!;
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 40;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(src, 0, 0, 64, 40);
    const d = ctx.getImageData(0, 0, 64, 40).data;
    // 取中位數：避開零星的生物光與字元海雪
    const l: number[] = [];
    for (let i = 0; i < d.length; i += 4) l.push(0.2126 * d[i]! + 0.7152 * d[i + 1]! + 0.0722 * d[i + 2]!);
    l.sort((a, b) => a - b);
    return l[l.length >> 1]!;
  });
}

for (const tier of [1, 2]) {
  test(`越深越暗（tier ${tier}）`, async ({ page }, info) => {
    test.skip(info.project.name === 'mobile', '桌機量一次就夠');
    await openTestMode(page, `&tier=${tier}`);
    const luma: number[] = [];
    for (const pos of [1.5, 2.5, 3.5, 4.5]) {
      await scrollToPos(page, pos);
      luma.push(await sceneLuma(page));
    }
    for (let i = 1; i < luma.length; i++)
      expect(luma[i]!, `pos ${1.5 + i}: ${luma.join(', ')}`).toBeLessThan(luma[i - 1]!);
    // 深層帶幾乎全黑
    expect(luma[3]!).toBeLessThan(12);
  });
}

/**
 * 入水後不能有一條橫跨畫面的亮暗接縫（捲動時看起來像黑影刷過）：
 * 每一列取中位數亮度（局部的魚、礁不影響中位數，整條接縫會），相鄰列的差要小。
 * 曾經因為水面下側的顏色沒用 sRGB 指定，水面網格遠端和背景之間有一條硬亮度差。
 */
test('入水後沒有橫跨畫面的亮暗接縫', async ({ page }, info) => {
  test.skip(info.project.name === 'mobile', '桌機量一次就夠');
  await openTestMode(page, '&tier=1');
  for (const pos of [1.1, 1.3, 1.5]) {
    await scrollToPos(page, pos);
    const jump = await page.evaluate(() => {
      const src = document.querySelector<HTMLCanvasElement>('[data-testid=scene] canvas')!;
      const w = 160;
      const h = 300;
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(src, 0, 0, w, h);
      const d = ctx.getImageData(0, 0, w, h).data;
      const rows: number[] = [];
      for (let y = 0; y < h; y++) {
        const l: number[] = [];
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          l.push(0.2126 * d[i]! + 0.7152 * d[i + 1]! + 0.0722 * d[i + 2]!);
        }
        l.sort((a, b) => a - b);
        rows.push(l[w >> 1]!);
      }
      let max = 0;
      for (let y = 1; y < h; y++) max = Math.max(max, Math.abs(rows[y]! - rows[y - 1]!));
      return max;
    });
    expect(jump, `pos ${pos}`).toBeLessThan(10);
  }
});
