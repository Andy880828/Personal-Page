import { describe, expect, it } from 'vitest';
import {
  ATTENUATION,
  NOTES,
  SNELL_WINDOW_DEG,
  SOURCES,
  formatLight,
  lightFraction,
  pressureAtm,
  temperatureC,
  zoneAt,
} from '@/content/science';
import { SECTIONS } from '@/lib/sections';

describe('海洋科學換算', () => {
  it('壓力：每 10 m 加 1 atm', () => {
    expect(pressureAtm(0)).toBe(1);
    expect(pressureAtm(10)).toBe(2);
    expect(pressureAtm(4000)).toBe(401);
  });

  it('溫度剖面：表層暖、溫躍層陡、深層接近 4 °C 以下且單調遞減', () => {
    expect(temperatureC(0)).toBeGreaterThan(24);
    expect(temperatureC(1000)).toBeLessThan(5);
    expect(temperatureC(4000)).toBeLessThan(2);
    let last = Infinity;
    for (let d = 0; d <= 6000; d += 25) {
      const t = temperatureC(d);
      expect(t).toBeLessThanOrEqual(last + 1e-9);
      last = t;
    }
    // 溫躍層（200–1000 m）的降幅比深層（1000–4000 m）大
    expect(temperatureC(200) - temperatureC(1000)).toBeGreaterThan(temperatureC(1000) - temperatureC(4000));
  });

  it('光：100 m 剩約 1%，紅光比藍光消失得快', () => {
    expect(lightFraction(100)).toBeCloseTo(0.01, 2);
    expect(lightFraction(0)).toBe(1);
    expect(lightFraction(10, ATTENUATION.red)).toBeLessThan(lightFraction(10, ATTENUATION.blue));
    expect(lightFraction(10, ATTENUATION.red)).toBeLessThan(0.05);
    expect(formatLight(1)).toBe('100%');
    expect(formatLight(0.001)).toBe('0.10%');
    expect(formatLight(1e-12)).toBe('≈0');
  });

  it('分層帶與段落的深度一致', () => {
    expect(zoneAt(50).id).toBe('epipelagic');
    expect(zoneAt(200).id).toBe('mesopelagic');
    expect(zoneAt(999).id).toBe('mesopelagic');
    expect(zoneAt(1000).id).toBe('bathypelagic');
    expect(zoneAt(4000).id).toBe('abyssopelagic');
    expect(zoneAt(SECTIONS[1]!.depthStart).zh).toBe(SECTIONS[1]!.zone);
    expect(zoneAt(SECTIONS[3]!.depthStart).zh).toBe(SECTIONS[3]!.zone);
    expect(zoneAt(SECTIONS[4]!.depthStart).zh).toBe(SECTIONS[4]!.zone);
  });

  it('斯涅爾窗約 97°', () => {
    expect(SNELL_WINDOW_DEG).toBeGreaterThan(96);
    expect(SNELL_WINDOW_DEG).toBeLessThan(98);
  });

  it('每段都有註記，每個引用的來源都存在且是 https', () => {
    for (const id of ['hero', 'about', 'skills', 'projects', 'experience', 'contact'] as const)
      expect(
        NOTES.find((n) => n.section === id),
        id,
      ).toBeTruthy();
    for (const n of NOTES)
      for (const sid of n.sources) {
        const s = SOURCES.find((x) => x.id === sid);
        expect(s, `${n.section} source ${sid}`).toBeTruthy();
        expect(s!.url.startsWith('https://')).toBe(true);
      }
  });
});
