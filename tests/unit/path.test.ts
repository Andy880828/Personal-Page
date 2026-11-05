import { afterEach, describe, expect, it } from 'vitest';
import { cameraY, sectionWeight, waterColor, fogDensity, rigY, SKY_HEIGHT, DIVE_BOTTOM } from '@/scene/path';

describe('相機路徑', () => {
  it('從海面上出發，在第一段結束前潛入水下', () => {
    expect(cameraY(0)).toBeCloseTo(SKY_HEIGHT);
    expect(cameraY(0.05)).toBeGreaterThan(0);
    expect(cameraY(1)).toBeCloseTo(DIVE_BOTTOM);
  });

  it('一路單調往下，而且連續（沒有跳動）', () => {
    let last = Infinity;
    for (let p = 0; p <= 6; p += 0.01) {
      const y = cameraY(p);
      expect(y).toBeLessThanOrEqual(last + 1e-9);
      if (last !== Infinity) expect(last - y).toBeLessThan(1);
      last = y;
    }
  });

  it('段落權重在中心最大、遠離後為 0', () => {
    expect(sectionWeight(2.5, 2)).toBe(1);
    expect(sectionWeight(4.5, 2)).toBe(0);
    expect(sectionWeight(2.9, 2)).toBeGreaterThan(0);
  });

  it('跟段落的物件在段落中心時與相機同高', () => {
    expect(rigY(3.5, 3)).toBeCloseTo(cameraY(3.5));
    // 往下捲時相對於相機往上浮（和文字同方向）
    expect(rigY(3.8, 3) - cameraY(3.8)).toBeGreaterThan(rigY(3.2, 3) - cameraY(3.2));
  });

  it('水色越深越暗，霧越深越濃', () => {
    const lum = (c: number[]) => 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
    expect(lum(waterColor(0.5))).toBeGreaterThan(lum(waterColor(3)));
    expect(lum(waterColor(3))).toBeGreaterThan(lum(waterColor(5.8)));
    expect(fogDensity(5)).toBeGreaterThan(fogDensity(1));
  });
});

describe('相機路徑的速度連續', () => {
  afterEach(async () => {
    const { setSectionSpans } = await import('@/scene/path');
    setSectionSpans([1, 1, 1, 1, 1, 1]);
  });

  it('依各段捲動長度分配下潛距離：每捲 1 px 潛一樣遠，段落邊界兩側速度相同（作品段很長也不會變慢）', async () => {
    const { cameraY, setSectionSpans } = await import('@/scene/path');
    // 實測的段落長度（px，1440 寬）：作品段是其他段的 3–4 倍
    const spans = [1350, 1002, 1119, 3500, 1950, 1278];
    setSectionSpans(spans);
    const e = 1e-4;
    // pos 對 px 是逐段線性，所以 dy/dpx = (dy/dpos) / 該段長度
    const perPx = (p: number, dir: 1 | -1) => {
      const i = Math.min(5, Math.floor(dir < 0 ? p - e : p));
      return (cameraY(p + dir * e) - cameraY(p)) / (dir * e) / spans[i]!;
    };
    const mid = perPx(3.5, 1);
    for (const p of [1, 2, 3, 4, 5]) {
      const l = perPx(p, -1);
      const r = perPx(p, 1);
      expect(Math.abs(l - r) / Math.abs(r), `pos ${p}`).toBeLessThan(0.01);
    }
    for (const p of [1.5, 2.5, 4.5]) expect(Math.abs(perPx(p, 1) - mid) / Math.abs(mid), `pos ${p}`).toBeLessThan(0.01);
    // 到底時速度歸零、全程單調往下、海床位置不變
    expect(Math.abs((cameraY(6) - cameraY(6 - e)) / e)).toBeLessThan(0.01);
    for (let p = 0.1; p < 6; p += 0.01) expect(cameraY(p + 0.01)).toBeLessThanOrEqual(cameraY(p) + 1e-9);
  });

  it('evenPos：水色與光量跟著相機的實際深度走，每 px 的變化在段落邊界連續', async () => {
    const { evenPos, setSectionSpans } = await import('@/scene/path');
    expect(evenPos(2.3)).toBeCloseTo(2.3);
    const spans = [1350, 1002, 1119, 3500, 1950, 1278];
    setSectionSpans(spans);
    const e = 1e-4;
    const perPx = (p: number, dir: 1 | -1) => {
      const i = Math.min(5, Math.floor(dir < 0 ? p - e : p));
      return (evenPos(p + dir * e) - evenPos(p)) / (dir * e) / spans[i]!;
    };
    for (const p of [2, 3, 4])
      expect(Math.abs(perPx(p, -1) - perPx(p, 1)) / perPx(p, 1), `pos ${p}`).toBeLessThan(0.01);
    expect(evenPos(1)).toBeCloseTo(1);
    expect(evenPos(5)).toBeCloseTo(5);
  });

  it('六段等長時和固定間距一致（預設值）', async () => {
    const { cameraY, SECTION_SPACING, DIVE_BOTTOM } = await import('@/scene/path');
    expect(cameraY(2)).toBeCloseTo(DIVE_BOTTOM - SECTION_SPACING);
    expect(cameraY(5)).toBeCloseTo(DIVE_BOTTOM - 4 * SECTION_SPACING);
  });
});
