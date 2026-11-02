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
  /** null = 還在偵測，這段時間不載入任何 WebGL */
  tier: Tier | null;
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

const MOTION_KEY = 'motion-pref';

/** 建立 store 時就讀好動態偏好，第一次 render 就是正確值（不會先載入動畫套件再關掉） */
function initialSystemReduced(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function initialMotionPref(): MotionPref {
  try {
    const v = typeof localStorage !== 'undefined' ? localStorage.getItem(MOTION_KEY) : null;
    return v === 'reduce' || v === 'full' ? v : 'system';
  } catch {
    return 'system';
  }
}

export function saveMotionPref(p: MotionPref) {
  try {
    localStorage.setItem(MOTION_KEY, p);
  } catch {
    /* 無痕模式或封鎖儲存：只在本次有效 */
  }
}

export const useSiteStore = create<SiteState>()((set, get) => ({
  pos: 0,
  depth: 0,
  velocity: 0,
  section: 'hero',
  tier: null,
  systemReducedMotion: initialSystemReduced(),
  motionPref: initialMotionPref(),
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
