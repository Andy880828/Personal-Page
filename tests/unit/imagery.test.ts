import { describe, expect, it } from 'vitest';
import { experience } from '@/content/experience';
import { shortSha } from '@/lib/sha';
import { crossedThreshold } from '@/scene/thresholds';
import { GLYPHS, GLYPH_GRID } from '@/scene/glyphs';

describe('經歷的 commit 短碼', () => {
  it('每筆都是 7 個 16 進位字、彼此不同、每次算都一樣', () => {
    const shas = experience.map(shortSha);
    for (const s of shas) expect(s).toMatch(/^[0-9a-f]{7}$/);
    expect(new Set(shas).size).toBe(shas.length);
    expect(experience.map(shortSha)).toEqual(shas);
  });
});

describe('分層門檻掃描', () => {
  it('跨過 200 m 或 1000 m（任一方向）才觸發', () => {
    expect(crossedThreshold(190, 210)).toBe(true);
    expect(crossedThreshold(1010, 990)).toBe(true);
    expect(crossedThreshold(210, 990)).toBe(false);
    expect(crossedThreshold(0, 150)).toBe(false);
    expect(crossedThreshold(150, 1200)).toBe(true);
  });
});

describe('字元圖集', () => {
  it('剛好填滿 4×4，第 0 格是空白（ASCII 後製的最暗階）', () => {
    expect(GLYPHS).toHaveLength(GLYPH_GRID * GLYPH_GRID);
    expect(GLYPHS[0]).toBe(' ');
    expect(new Set(GLYPHS).size).toBe(GLYPHS.length);
  });
});
