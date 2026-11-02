import type { ExperienceItem } from '@/content/types';

/** 起訖年月 + 單位 → 7 字元短碼（FNV-1a），每筆經歷固定一個，看起來像 commit sha */
export function shortSha(item: Pick<ExperienceItem, 'start' | 'end' | 'org'>): string {
  let h = 0x811c9dc5;
  for (const ch of `${item.start}|${item.end ?? 'now'}|${item.org}`) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  // 32 bit 只有 8 個 16 進位字；再攪一次補足亂度後取 7 個
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0;
  return h.toString(16).padStart(8, '0').slice(0, 7);
}
