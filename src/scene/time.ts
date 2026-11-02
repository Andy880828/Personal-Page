import type { RootState } from '@react-three/fiber';
import { flags } from '@/lib/env';
import { isReducedMotion, useSiteStore } from '@/store/useSiteStore';

/** 測試模式與減少動態時，所有 shader 用同一個固定時間，畫面可重現 */
export const FROZEN_TIME = 12;

export function isFrozen(): boolean {
  return flags.test || isReducedMotion(useSiteStore.getState());
}

export function sceneTime(state: RootState): number {
  return isFrozen() ? FROZEN_TIME : state.clock.elapsedTime * flags.timeScale;
}

/** 每幀 delta：凍結時為 0（物理模擬停住），否則夾在 1/20 秒內避免切分頁回來時暴衝 */
export function sceneDelta(delta: number): number {
  return isFrozen() ? 0 : Math.min(delta, 1 / 20) * flags.timeScale;
}
