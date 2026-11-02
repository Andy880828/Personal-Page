import { create } from 'zustand';
import type { SectionId } from '@/lib/sections';
import type { Tier } from '@/lib/gpu';
import type { ProjectCategory } from '@/content/types';

export type MotionPref = 'system' | 'reduce' | 'full';

export interface SiteState {
  /** 連續段落位置（見 lib/scroll.ts）；每次捲動更新，元件請用 getState() 讀，不要訂閱 */
  pos: number;
  depth: number;
  velocity: number;
  section: SectionId;
  tier: Tier;
  systemReducedMotion: boolean;
  motionPref: MotionPref;
  activeSkill: string;
  hoverSkill: string | null;
  projectFilter: ProjectCategory | 'all';
  /** 3D 場景載入進度 0–1 與是否已畫出第一幀 */
  sceneProgress: number;
  sceneReady: boolean;
  setScroll: (pos: number, depth: number, velocity: number, section: SectionId) => void;
  setTier: (tier: Tier) => void;
  setSystemReducedMotion: (v: boolean) => void;
  setMotionPref: (p: MotionPref) => void;
  setActiveSkill: (id: string) => void;
  setHoverSkill: (id: string | null) => void;
  setProjectFilter: (f: ProjectCategory | 'all') => void;
  setSceneProgress: (p: number) => void;
  setSceneReady: (v: boolean) => void;
}

export const useSiteStore = create<SiteState>()((set, get) => ({
  pos: 0,
  depth: 0,
  velocity: 0,
  section: 'hero',
  tier: 2,
  systemReducedMotion: false,
  motionPref: 'system',
  activeSkill: 'frontend',
  hoverSkill: null,
  projectFilter: 'all',
  sceneProgress: 0,
  sceneReady: false,
  setScroll: (pos, depth, velocity, section) => {
    if (get().section !== section) set({ pos, depth, velocity, section });
    else set({ pos, depth, velocity });
  },
  setTier: (tier) => set({ tier }),
  setSystemReducedMotion: (v) => set({ systemReducedMotion: v }),
  setMotionPref: (motionPref) => set({ motionPref }),
  setActiveSkill: (activeSkill) => set({ activeSkill }),
  setHoverSkill: (hoverSkill) => set({ hoverSkill }),
  setProjectFilter: (projectFilter) => set({ projectFilter }),
  setSceneProgress: (sceneProgress) => set({ sceneProgress }),
  setSceneReady: (sceneReady) => set({ sceneReady }),
}));

export function isReducedMotion(s: Pick<SiteState, 'motionPref' | 'systemReducedMotion'>): boolean {
  return s.motionPref === 'reduce' || (s.motionPref === 'system' && s.systemReducedMotion);
}

export const useReducedMotion = () => useSiteStore(isReducedMotion);
