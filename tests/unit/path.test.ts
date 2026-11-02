import { describe, expect, it } from 'vitest';
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
  });

  it('水色越深越暗，霧越深越濃', () => {
    const lum = (c: number[]) => 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
    expect(lum(waterColor(0.5))).toBeGreaterThan(lum(waterColor(3)));
    expect(lum(waterColor(3))).toBeGreaterThan(lum(waterColor(5.8)));
    expect(fogDensity(5)).toBeGreaterThan(fogDensity(1));
  });
});
