/** 分層門檻（公尺）：捲過時掃一次 */
export const THRESHOLDS = [200, 1000];

/** 深度從 prev 到 next 是否跨過某個分層門檻（兩個方向都算） */
export function crossedThreshold(prev: number, next: number): boolean {
  return THRESHOLDS.some((t) => (prev < t && next >= t) || (prev >= t && next < t));
}
