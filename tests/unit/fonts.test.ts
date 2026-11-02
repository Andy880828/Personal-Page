import { describe, expect, it } from 'vitest';
import { readFileSync, statSync } from 'node:fs';
import { collectSiteChars } from '../../scripts/charset.mjs';

describe('字體子集', () => {
  it('網站用到的每個字都在子集裡（改了文案要重跑 npm run fonts）', () => {
    const subset = new Set(readFileSync('public/fonts/noto-sans-tc.chars.txt', 'utf8'));
    const missing = [...collectSiteChars()].filter((ch) => !subset.has(ch) && !/\s/.test(ch));
    expect(missing.join('')).toBe('');
  });

  it('兩個字體檔合計不超過 300 KB', () => {
    const total = statSync('public/fonts/noto-sans-tc.woff2').size + statSync('public/fonts/jetbrains-mono.woff2').size;
    expect(total).toBeLessThan(300 * 1024);
  });
});
