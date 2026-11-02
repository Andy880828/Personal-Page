import { describe, expect, it } from 'vitest';
import dna from '@/assets/dna-1bna.json';
import { DNA_BP, DNA_SEQUENCE, dnaSegment, segmentRange } from '@/lib/dna';
import { skills } from '@/content/skills';

describe('1BNA 雙螺旋資料', () => {
  it('序列與座標 JSON 一致：CGCGAATTCGCG × 3', () => {
    expect(dna.sequence).toBe('CGCGAATTCGCG');
    expect(dna.pairs.map((p) => p.base).join('')).toBe(DNA_SEQUENCE);
    expect(dna.pairs).toHaveLength(DNA_BP);
  });

  it('是 B-DNA 的幾何：每對上升約 3.3 Å、扭轉約 36°、磷原子離軸約 9 Å', () => {
    expect(dna.riseA).toBeGreaterThan(3.1);
    expect(dna.riseA).toBeLessThan(3.6);
    expect(Math.abs(dna.twistDeg)).toBeGreaterThan(32);
    expect(Math.abs(dna.twistDeg)).toBeLessThan(38);
    for (const p of dna.pairs) {
      const r = Math.hypot(p.pA[0]!, p.pA[2]!);
      expect(r).toBeGreaterThan(6);
      expect(r).toBeLessThan(13);
    }
    // 沿軸由下而上
    const ys = dna.pairs.map((p) => (p.cA[1]! + p.cB[1]!) / 2);
    for (let i = 1; i < ys.length; i++) expect(ys[i]!).toBeGreaterThan(ys[i - 1]!);
  });

  it('五個技能區段連續、不重疊、蓋滿整條序列；第一組技能在最上面（3′ 端）', () => {
    const segs = Array.from({ length: DNA_BP }, (_, i) => dnaSegment(i));
    expect(new Set(segs).size).toBe(skills.length);
    expect(segs[DNA_BP - 1]).toBe(0);
    expect(segs[0]).toBe(skills.length - 1);
    let total = 0;
    for (let s = 0; s < skills.length; s++) {
      const [a, b] = segmentRange(s);
      total += b - a;
      for (let i = a; i < b; i++) expect(dnaSegment(i)).toBe(s);
    }
    expect(total).toBe(DNA_BP);
  });
});
