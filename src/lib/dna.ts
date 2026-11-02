import { skills } from '@/content/skills';

/**
 * 1BNA（CGCGAATTCGCG，Drew & Dickerson 1981）接三份：雙螺旋與技能段的序列字串共用。
 * 字串寫死在這裡，首屏不必載入座標 JSON；tests/unit/dna.test.ts 確認和 src/assets/dna-1bna.json 一致。
 */
export const DNA_SEQUENCE = 'CGCGAATTCGCG'.repeat(3);
export const DNA_BP = DNA_SEQUENCE.length;

/**
 * 鹼基對 i（股 A 的 5′→3′，也是座標由下而上）→ 技能區段。
 * 第一組技能在螺旋最上面，和左側分頁順序一樣，所以從 3′ 端（上）往回分。
 */
export function dnaSegment(i: number, segments = skills.length, bp = DNA_BP): number {
  return Math.min(segments - 1, Math.floor(((bp - 1 - i) * segments) / bp));
}

/** 某個技能區段在序列上的範圍 [start, end)（股 A 的索引） */
export function segmentRange(seg: number): [number, number] {
  const idx = [...DNA_SEQUENCE].map((_, i) => i).filter((i) => dnaSegment(i) === seg);
  return [Math.min(...idx), Math.max(...idx) + 1];
}
