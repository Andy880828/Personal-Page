import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { projects, categoryLabels } from '@/content/projects';
import { skills } from '@/content/skills';
import { experience } from '@/content/experience';
import { profile } from '@/content/profile';

const https = z.string().url().startsWith('https://');

const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  nameZh: z.string().optional(),
  summary: z.string().min(10).max(90),
  highlights: z.array(z.string().min(2)).max(3),
  featured: z.number().int().positive().optional(),
  outcome: z.string().optional(),
  role: z.string().optional(),
  tags: z.array(z.string()).min(1).max(6),
  year: z.number().int().min(2019).max(2030),
  categories: z.array(z.enum(['mining', 'viz', 'workflow', 'agent', 'web'])).min(1),
  repo: https.optional(),
  demo: https.optional(),
  image: z.enum(['recipecube', 'trim2sort', 'fitness']).optional(),
  cover: z.object({ prompt: z.string().min(1), lines: z.array(z.string()).min(1).max(4) }).optional(),
  status: z.enum(['active', 'stable', 'archived']),
  note: z.string().optional(),
});

describe('作品資料', () => {
  it('每一筆都符合 schema', () => {
    for (const p of projects) expect(() => projectSchema.parse(p), p.slug).not.toThrow();
  });

  it('slug 不重複', () => {
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
  });

  it('精選作品都有封面（截圖或終端機封面）；終端機封面只放真的指令輸出，沒有就不放', () => {
    for (const p of projects.filter((x) => x.featured !== undefined))
      expect(Boolean(p.image || p.cover), p.slug).toBe(true);
  });

  it('精選作品剛好三個、排序不重複', () => {
    const f = projects.filter((x) => x.featured !== undefined).map((x) => x.featured);
    expect(f).toHaveLength(3);
    expect(new Set(f).size).toBe(3);
  });

  it('沒有公開 repo 的作品要說明原因', () => {
    for (const p of projects.filter((x) => !x.repo)) expect(p.note, p.slug).toBeTruthy();
  });

  it('包含 2026-11 確認的作品清單，且已移除兩個舊作品', () => {
    const slugs = projects.map((p) => p.slug);
    for (const s of [
      'syssec',
      'scout',
      'homelab',
      'andy-claude-kit',
      'stock-analysis-app',
      'local-transcribe',
      'trim2sort',
      'fitness-challenge',
      'nature-footprint-studio',
      'recipecube',
    ])
      expect(slugs).toContain(s);
    expect(slugs).not.toContain('aquarium-fish-vending');
    expect(slugs).not.toContain('bingobingo');
  });

  it('每個分類都有標籤文字', () => {
    for (const p of projects) for (const c of p.categories) expect(categoryLabels[c]).toBeTruthy();
  });
});

describe('技能與經歷', () => {
  it('五組技能，主方向在前，id 不重複，顏色是 hex', () => {
    expect(skills.map((s) => s.id)).toEqual(['mining', 'viz', 'workflow', 'agent', 'web']);
    expect(new Set(skills.map((s) => s.id)).size).toBe(5);
    for (const s of skills) expect(s.color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('經歷由新到舊排序，只有第一筆可以沒有結束日期', () => {
    const starts = experience.map((e) => e.start);
    expect([...starts].sort().reverse()).toEqual(starts);
    experience.slice(1).forEach((e) => expect(e.end).not.toBeNull());
    for (const e of experience) {
      expect(e.start).toMatch(/^\d{4}\/\d{2}$/);
      if (e.end) expect(e.end >= e.start).toBe(true);
    }
  });

  it('個人連結都是 https', () => {
    for (const url of Object.values(profile.links)) expect(() => https.parse(url)).not.toThrow();
  });
});
