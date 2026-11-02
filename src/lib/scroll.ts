import { SECTIONS, SECTION_COUNT } from './sections';
import { clamp, invLerp, lerp } from './math';

/**
 * 全站捲動 → 連續的「段落位置」pos（0 … SECTION_COUNT）。
 * pos 落在 [i, i+1) 代表第 i 段是主角；3D 場景只看 pos，與各段 DOM 高度無關。
 *
 * 斷點：第 i 段（i ≥ 1）的頂端碰到視窗中線時 pos = i；第 0 段從捲動 0 開始，最後一段在捲到底時結束。
 */
export function computeBreakpoints(sectionTops: number[], viewportHeight: number, maxScroll: number): number[] {
  const n = sectionTops.length;
  const b: number[] = new Array(n + 1);
  b[0] = 0;
  for (let i = 1; i < n; i++) {
    b[i] = Math.max(b[i - 1]! + 1, (sectionTops[i] ?? 0) - viewportHeight * 0.5);
  }
  b[n] = Math.max(b[n - 1]! + 1, maxScroll);
  return b;
}

/** 捲動 → pos：每段內線性。相機速度的連續性由 scene/path 依段落長度分配下潛距離負責 */
export function scrollToPos(scrollY: number, breakpoints: number[]): number {
  const n = breakpoints.length - 1;
  if (n <= 0) return 0;
  if (scrollY <= breakpoints[0]!) return 0;
  for (let i = 0; i < n; i++) {
    const a = breakpoints[i]!;
    const b = breakpoints[i + 1]!;
    if (scrollY < b) return i + clamp(invLerp(a, b, scrollY));
  }
  return n;
}

/** 反向：要讓 pos 等於某值時應捲到哪裡（給「捲到某段」用） */
export function posToScroll(pos: number, breakpoints: number[]): number {
  const n = breakpoints.length - 1;
  const p = clamp(pos, 0, n);
  const i = Math.min(n - 1, Math.floor(p));
  return lerp(breakpoints[i]!, breakpoints[i + 1]!, p - i);
}

export function posToSectionIndex(pos: number): number {
  return Math.min(SECTION_COUNT - 1, Math.max(0, Math.floor(pos)));
}

/** pos → 顯示用深度（公尺），每段在自己的深度區間內線性變化 */
export function posToDepth(pos: number): number {
  const i = posToSectionIndex(pos);
  const s = SECTIONS[i]!;
  return lerp(s.depthStart, s.depthEnd, clamp(pos - i));
}

export function formatDepth(meters: number): string {
  return Math.round(meters).toLocaleString('en-US');
}
