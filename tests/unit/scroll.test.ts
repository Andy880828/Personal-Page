import { describe, expect, it } from 'vitest';
import {
  computeBreakpoints,
  depthAtScroll,
  formatDepth,
  posToDepth,
  posToScroll,
  posToSectionIndex,
  scrollForDepth,
  scrollToPos,
} from '@/lib/scroll';
import { SECTIONS, sectionForRoute } from '@/lib/sections';

const VH = 900;
// 六段的頂端：hero 150vh，其餘各段高度不同
const tops = [0, 1350, 2600, 3900, 7000, 9200];
const maxScroll = 10400;

describe('捲動 → 段落位置', () => {
  const b = computeBreakpoints(tops, VH, maxScroll);

  it('斷點單調遞增，從 0 開始、在最大捲動結束', () => {
    expect(b).toHaveLength(SECTIONS.length + 1);
    expect(b[0]).toBe(0);
    expect(b.at(-1)).toBe(maxScroll);
    for (let i = 1; i < b.length; i++) expect(b[i]!).toBeGreaterThan(b[i - 1]!);
  });

  it('段落頂端碰到視窗中線時 pos 剛好是段落序號', () => {
    expect(scrollToPos(tops[2]! - VH / 2, b)).toBeCloseTo(2);
    expect(scrollToPos(tops[4]! - VH / 2, b)).toBeCloseTo(4);
  });

  it('邊界：負值與超過底部都被夾住', () => {
    expect(scrollToPos(-100, b)).toBe(0);
    expect(scrollToPos(maxScroll + 999, b)).toBe(SECTIONS.length);
  });

  it('posToScroll 是 scrollToPos 的反函數', () => {
    for (const y of [0, 333, 1800, 4100, 8888, 10400]) expect(posToScroll(scrollToPos(y, b), b)).toBeCloseTo(y, 5);
  });

  it('單調：往下捲 pos 不會變小', () => {
    let last = -1;
    for (let y = 0; y <= maxScroll; y += 37) {
      const p = scrollToPos(y, b);
      expect(p).toBeGreaterThanOrEqual(last);
      last = p;
    }
  });

  it('段落很短時斷點仍然嚴格遞增', () => {
    const tight = computeBreakpoints([0, 10, 12, 14, 16, 18], VH, 20);
    for (let i = 1; i < tight.length; i++) expect(tight[i]!).toBeGreaterThan(tight[i - 1]!);
  });
});

describe('深度', () => {
  it('每段的深度在自己的區間內，整體單調', () => {
    let last = -1;
    for (let p = 0; p <= SECTIONS.length; p += 0.05) {
      const d = posToDepth(p);
      const s = SECTIONS[posToSectionIndex(p)]!;
      expect(d).toBeGreaterThanOrEqual(s.depthStart - 1e-9);
      expect(d).toBeLessThanOrEqual(s.depthEnd + 1e-9);
      expect(d).toBeGreaterThanOrEqual(last - 1e-9);
      last = d;
    }
    expect(posToDepth(0)).toBe(0);
    expect(posToDepth(SECTIONS.length)).toBe(4000);
  });

  it('段落深度首尾相接', () => {
    for (let i = 1; i < SECTIONS.length; i++) expect(SECTIONS[i]!.depthStart).toBe(SECTIONS[i - 1]!.depthEnd);
  });

  it('格式化有千分位', () => {
    expect(formatDepth(3812.4)).toBe('3,812');
  });

  it('路由對應段落', () => {
    expect(sectionForRoute('/')).toBe('hero');
    expect(sectionForRoute('/about')).toBe('about');
    expect(sectionForRoute('/about/')).toBe('about');
    expect(sectionForRoute('/project')).toBe('projects');
    expect(sectionForRoute('/nope')).toBeNull();
  });
});

describe('深度計的捲動 → 深度', () => {
  const b = computeBreakpoints(tops, VH, maxScroll);

  it('每個段落斷點剛好是該段的起始深度，捲到底是 4,000 m', () => {
    for (let i = 0; i < SECTIONS.length; i++) expect(depthAtScroll(b[i]!, b)).toBeCloseTo(SECTIONS[i]!.depthStart, 6);
    expect(depthAtScroll(maxScroll, b)).toBe(4000);
  });

  it('單調，而且數字的速度在段落邊界兩側連續（不會一進經歷段就突然快很多倍）', () => {
    let last = -1;
    for (let y = 0; y <= maxScroll; y += 7) {
      const d = depthAtScroll(y, b);
      expect(d).toBeGreaterThanOrEqual(last - 1e-9);
      last = d;
    }
    const e = 0.25;
    for (let i = 1; i < b.length - 1; i++) {
      const y = b[i]!;
      const l = (depthAtScroll(y, b) - depthAtScroll(y - e, b)) / e;
      const r = (depthAtScroll(y + e, b) - depthAtScroll(y, b)) / e;
      expect(Math.abs(l - r) / Math.max(l, r), `邊界 ${i}`).toBeLessThan(0.02);
    }
  });

  it('scrollForDepth 反解：誤差不超過一個像素對應的深度（捲動位置只能是整數像素）', () => {
    for (const d of [5, 50, 150, 600, 1200, 3000, 3900]) {
      const y = scrollForDepth(d, b);
      const perPx = depthAtScroll(y + 1, b) - depthAtScroll(y, b);
      const got = depthAtScroll(y, b);
      expect(got, String(d)).toBeGreaterThanOrEqual(d - 1e-6);
      expect(got - d, String(d)).toBeLessThanOrEqual(perPx + 1e-6);
    }
  });
});
