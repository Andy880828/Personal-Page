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

/**
 * 捲動 → 顯示深度（公尺）：通過每個段落斷點的標稱深度（0、10、100、200、1000、3800、4000）的單調三次樣條。
 * 逐段線性時，每段每 px 的深度差到 16 倍（經歷段 2,800 m 只有約 2,000 px），數字在段落邊界突然變快；
 * 樣條讓速度在邊界兩側連續，斷點上仍剛好是段落的起始深度，而且單調不回頭。
 */
const DEPTHS = [...SECTIONS.map((s) => s.depthStart), SECTIONS[SECTIONS.length - 1]!.depthEnd];
export function depthAtScroll(scrollY: number, breakpoints: number[]): number {
  const n = breakpoints.length - 1;
  if (n !== DEPTHS.length - 1) return 0;
  if (scrollY <= breakpoints[0]!) return DEPTHS[0]!;
  if (scrollY >= breakpoints[n]!) return DEPTHS[n]!;
  const d = Array.from(
    { length: n },
    (_, i) => (DEPTHS[i + 1]! - DEPTHS[i]!) / (breakpoints[i + 1]! - breakpoints[i]!),
  );
  const m = new Array<number>(n + 1);
  m[0] = d[0]!;
  m[n] = d[n - 1]!;
  // 調和平均（Fritsch–Butland）：夾在兩側斜率之間，保證單調
  for (let i = 1; i < n; i++) m[i] = (2 * d[i - 1]! * d[i]!) / (d[i - 1]! + d[i]!);
  for (let i = 0; i < n; i++) {
    const a = breakpoints[i]!;
    const b = breakpoints[i + 1]!;
    if (scrollY < b) {
      const h = b - a;
      const t = (scrollY - a) / h;
      const t2 = t * t;
      const t3 = t2 * t;
      const v =
        (2 * t3 - 3 * t2 + 1) * DEPTHS[i]! +
        (t3 - 2 * t2 + t) * h * m[i]! +
        (-2 * t3 + 3 * t2) * DEPTHS[i + 1]! +
        (t3 - t2) * h * m[i + 1]!;
      return clamp(v, DEPTHS[i]!, DEPTHS[i + 1]!);
    }
  }
  return DEPTHS[n]!;
}

/** 反向：要顯示某個深度時應捲到哪裡（樣條單調，用二分法） */
export function scrollForDepth(depth: number, breakpoints: number[]): number {
  let lo = breakpoints[0]!;
  let hi = breakpoints[breakpoints.length - 1]!;
  for (let k = 0; k < 50; k++) {
    const mid = (lo + hi) / 2;
    if (depthAtScroll(mid, breakpoints) < depth) lo = mid;
    else hi = mid;
  }
  return Math.ceil((lo + hi) / 2);
}

export function formatDepth(meters: number): string {
  return Math.round(meters).toLocaleString('en-US');
}
