import { existsSync, readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FAUNA, MODEL_SLUGS } from '@/content/fauna';
import { SECTIONS } from '@/lib/sections';
import { zoneAt } from '@/content/science';

describe('分層代表生物', () => {
  it('id 不重複', () => {
    expect(new Set(FAUNA.map((f) => f.id)).size).toBe(FAUNA.length);
  });

  it('每一段至少一種生物', () => {
    for (const s of SECTIONS) expect(FAUNA.filter((f) => f.section === s.id).length, s.id).toBeGreaterThan(0);
  });

  it('深度範圍落在所屬段落與分層裡', () => {
    for (const f of FAUNA) {
      const sec = SECTIONS.find((s) => s.id === f.section)!;
      const [a, b] = f.depth;
      expect(a, f.id).toBeLessThan(b);
      // 和段落的深度有重疊
      expect(a < sec.depthEnd && b > sec.depthStart, f.id).toBe(true);
      // 不跨分層（海床段 4000 m 是深層帶的下界，算在裡面）
      const zone = zoneAt(a);
      expect(b, f.id).toBeLessThanOrEqual(zone.to);
    }
  });

  it('每一段有模型的生物裡，恰好一種是 tier 1 會載的 primary', () => {
    for (const s of SECTIONS) {
      const withModel = FAUNA.filter((f) => f.section === s.id && f.model);
      if (!withModel.length) continue;
      expect(withModel.filter((f) => f.primary).length, s.id).toBe(1);
    }
  });

  it('模型檔存在、每個 ≤ 200 KB，合計 ≤ 800 KB', () => {
    let total = 0;
    for (const slug of MODEL_SLUGS) {
      const file = `public/models/${slug}.glb`;
      expect(existsSync(file), file).toBe(true);
      const size = statSync(file).size;
      expect(size, file).toBeLessThanOrEqual(200 * 1024);
      total += size;
    }
    expect(total).toBeLessThanOrEqual(800 * 1024);
  });

  it('LICENSES.md 列出每一個模型的作者與連結', () => {
    const licenses = readFileSync('public/models/LICENSES.md', 'utf8');
    for (const slug of MODEL_SLUGS) {
      const row = licenses.split('\n').find((l) => l.includes(`\`${slug}.glb\``));
      expect(row, slug).toBeTruthy();
      expect(row, slug).toMatch(/\]\(https:\/\/sketchfab\.com\/3d-models\//);
      expect(row, slug).toMatch(/CC/);
    }
  });
});
