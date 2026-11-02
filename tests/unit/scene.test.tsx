import { describe, expect, it, beforeEach } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { createSchool, stepSchool, BOIDS, type Gather } from '@/scene/boids';
import { sceneBudget } from '@/lib/gpu';
import { SceneContents } from '@/scene/SceneRoot';
import { useSiteStore } from '@/store/useSiteStore';

describe('魚群模擬', () => {
  it('同一個種子 → 同樣的結果（視覺回歸可重現）', () => {
    const a = createSchool(60, 7);
    const b = createSchool(60, 7);
    for (let i = 0; i < 50; i++) {
      stepSchool(a, 1 / 30);
      stepSchool(b, 1 / 30);
    }
    expect(Array.from(a.pos)).toEqual(Array.from(b.pos));
  });

  it('速度維持在上下限之間、魚群不會散掉', () => {
    const s = createSchool(80, 1);
    for (let i = 0; i < 300; i++) stepSchool(s, 1 / 30);
    for (let i = 0; i < s.count; i++) {
      const v = Math.hypot(s.vel[i * 3]!, s.vel[i * 3 + 1]! / 0.6, s.vel[i * 3 + 2]!);
      expect(v).toBeLessThanOrEqual(BOIDS.maxSpeed + 1e-3);
      const r = Math.hypot(s.pos[i * 3]!, s.pos[i * 3 + 1]!, s.pos[i * 3 + 2]!);
      expect(r).toBeLessThan(BOIDS.radius * 2.2);
    }
  });

  it('dt = 0（凍結模式）時完全不動', () => {
    const s = createSchool(20, 3);
    const before = Array.from(s.pos);
    stepSchool(s, 0);
    expect(Array.from(s.pos)).toEqual(before);
  });

  it('會躲開滑鼠；點擊驚散的範圍與力道更大', () => {
    const s = createSchool(1, 9);
    s.pos.set([0, 0, 0]);
    s.vel.set([3, 0, 0]);
    stepSchool(s, 1 / 30, [0.5, 0, 0]);
    expect(s.vel[0]!).toBeLessThan(3);
    // 距離 6：一般躲避（半徑 4）沒反應，驚散（半徑 9）會
    const a = createSchool(1, 9);
    a.pos.set([0, 0, 0]);
    a.vel.set([3, 0, 0]);
    stepSchool(a, 1 / 30, [6, 0, 0]);
    const b = createSchool(1, 9);
    b.pos.set([0, 0, 0]);
    b.vel.set([3, 0, 0]);
    stepSchool(b, 1 / 30, [6, 0, 0], 9, 3);
    expect(b.vel[0]!).toBeLessThan(a.vel[0]!);
  });
});

describe('魚群即資料（作品篩選分群）', () => {
  const meanDist = (pos: Float32Array, idx: number[], t: [number, number, number]) =>
    idx.reduce((a, i) => a + Math.hypot(pos[i * 3]! - t[0], pos[i * 3 + 1]! - t[1], pos[i * 3 + 2]! - t[2]), 0) /
    idx.length;

  it('符合分類的魚聚到目標點附近，其他魚散開', () => {
    const n = 120;
    const s = createSchool(n, 11);
    const tags = Uint8Array.from({ length: n }, (_, i) => i % 5);
    const gather: Gather = { tags, tag: 2, target: [0, 0, 0], weight: 1 };
    for (let i = 0; i < 400; i++) stepSchool(s, 1 / 30, null, 4, 0.9, gather);
    const match = [...tags.keys()].filter((i) => tags[i] === 2);
    const rest = [...tags.keys()].filter((i) => tags[i] !== 2);
    const dm = meanDist(s.pos, match, gather.target);
    const dr = meanDist(s.pos, rest, gather.target);
    expect(dm).toBeLessThan(dr * 0.6);
    // 不會擠成一點：分離項還在
    expect(dm).toBeGreaterThan(BOIDS.separation * 0.4);
  });

  it('weight = 0 時和沒有分群一樣', () => {
    const a = createSchool(40, 5);
    const b = createSchool(40, 5);
    const tags = new Uint8Array(40);
    for (let i = 0; i < 60; i++) {
      stepSchool(a, 1 / 30);
      stepSchool(b, 1 / 30, null, 4, 0.9, { tags, tag: 0, target: [0, 0, 0], weight: 0 });
    }
    expect(Array.from(a.pos)).toEqual(Array.from(b.pos));
  });
});

describe('渲染迴圈', () => {
  it('場景程式沒有使用 priority > 0 的 useFrame（那會關掉 R3F 的自動渲染，沒有後製的 tier 1 會整片空白）', async () => {
    const { readFileSync, readdirSync } = await import('node:fs');
    const dir = 'src/scene';
    for (const f of readdirSync(dir).filter((n) => n.endsWith('.tsx'))) {
      const src = readFileSync(`${dir}/${f}`, 'utf8');
      expect(src, f).not.toMatch(/useFrame\([\s\S]*?\},\s*[1-9]\d*\s*\)/);
    }
  });
});

describe('場景內容依 GPU 等級變化', () => {
  beforeEach(() => useSiteStore.setState({ pos: 1.5 }));

  async function render(tier: 1 | 2) {
    const r = await ReactThreeTestRenderer.create(<SceneContents budget={sceneBudget(tier, true)} />);
    await ReactThreeTestRenderer.act(async () => {
      await r.advanceFrames(2, 1 / 60);
    });
    return r;
  }

  it('tier 2 的魚與海雪比 tier 1 多', async () => {
    const counts = async (tier: 1 | 2) => {
      const r = await render(tier);
      const fish = r.scene
        .findAll((n) => (n.instance as { isInstancedMesh?: boolean }).isInstancedMesh === true)
        .find((n) => (n.instance as { count: number }).count >= 100)!;
      const points = r.scene.findAll((n) => (n.instance as { isPoints?: boolean }).isPoints === true);
      const snow = points
        .map((p) => (p.instance as unknown as { geometry: { attributes: { position: { count: number } } } }).geometry)
        .map((g) => g.attributes.position.count);
      await r.unmount();
      return { fish: (fish.instance as { count: number }).count, maxPoints: Math.max(...snow) };
    };
    const t1 = await counts(1);
    const t2 = await counts(2);
    expect(t1.fish).toBe(sceneBudget(1).fish);
    expect(t2.fish).toBe(sceneBudget(2).fish);
    expect(t2.maxPoints).toBeGreaterThan(t1.maxPoints);
  });

  it('所有主要元件都有掛上：水面、天空、雙螺旋、水母、海床、礁岩', async () => {
    const r = await render(2);
    const meshes = r.scene.findAll((n) => (n.instance as { type?: string }).type === 'Mesh');
    // 雙螺旋 + 水面 + 天空 + 9 道光束 + 7 隻水母 + 海床（地形、岩塊、煙囪）+ 礁岩；模型是非同步載入，不算在這裡
    expect(meshes.length).toBeGreaterThan(40);
    expect(
      r.scene.findAll((n) => (n.instance as { isLineSegments?: boolean }).isLineSegments === true).length,
    ).toBeGreaterThanOrEqual(7);
    await r.unmount();
  });
});
