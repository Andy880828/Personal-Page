import { describe, expect, it } from 'vitest';
import { classifyGpu, sceneBudget, type GpuInput } from '@/lib/gpu';
import { parseFlags } from '@/lib/env';
import { createRng } from '@/lib/seed';

const base: GpuInput = {
  webgl2: true,
  renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Direct3D11 vs_5_0 ps_5_0)',
  cores: 12,
  dpr: 1,
  coarsePointer: false,
  viewportWidth: 1440,
  saveData: false,
};

describe('GPU 分級', () => {
  it('沒有 WebGL2 或省流量 → 0', () => {
    expect(classifyGpu({ ...base, webgl2: false })).toBe(0);
    expect(classifyGpu({ ...base, saveData: true })).toBe(0);
  });
  it('軟體算繪（CI 的 SwiftShader、llvmpipe）→ 0，用純 DOM 版', () => {
    expect(classifyGpu({ ...base, renderer: 'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)))' })).toBe(0);
    expect(classifyGpu({ ...base, renderer: 'llvmpipe (LLVM 15.0.7, 256 bits)' })).toBe(0);
  });
  it('手機與弱 GPU → 1', () => {
    expect(classifyGpu({ ...base, coarsePointer: true, viewportWidth: 390, renderer: 'Apple GPU' })).toBe(1);
    expect(classifyGpu({ ...base, renderer: 'Mali-G52 MC2' })).toBe(1);
    expect(classifyGpu({ ...base, renderer: 'Intel(R) HD Graphics 4000' })).toBe(1);
  });
  it('一般桌機 → 2，高階 → 3', () => {
    expect(classifyGpu({ ...base, renderer: 'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics)', cores: 8 })).toBe(2);
    expect(classifyGpu(base)).toBe(3);
    expect(classifyGpu({ ...base, renderer: 'Apple M2 Pro', cores: 10 })).toBe(3);
  });
  it('網址參數可以強制等級', () => {
    expect(classifyGpu({ ...base, webgl2: false, override: 2 })).toBe(2);
  });
  it('等級越高，粒子與魚越多；tier 1 沒有後製', () => {
    const t1 = sceneBudget(1);
    const t2 = sceneBudget(2);
    expect(t2.fish).toBeGreaterThan(t1.fish);
    expect(t2.snow).toBeGreaterThan(t1.snow);
    expect(t1.postprocessing).toBe(false);
    expect(t2.postprocessing).toBe(true);
    expect(t1.dpr[1]).toBeLessThanOrEqual(1.5);
    expect(sceneBudget(3, true).dpr).toEqual([1, 1]);
  });
});

describe('執行模式與亂數', () => {
  it('解析網址參數', () => {
    expect(parseFlags('?test=1&tier=1&debug')).toEqual({ test: true, tier: 1, debug: true, perf: false });
    expect(parseFlags('?tier=9').tier).toBeNull();
  });
  it('同一個種子產生同一串亂數', () => {
    const a = createRng(42);
    const b = createRng(42);
    const seqA = Array.from({ length: 5 }, a);
    expect(Array.from({ length: 5 }, b)).toEqual(seqA);
    for (const v of seqA) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
