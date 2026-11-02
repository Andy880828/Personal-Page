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
