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

/**
 * 斷點 → 單調三次 Hermite 樣條（Fritsch–Carlson）的切線。
 * 逐段線性時，每段 DOM 高度不同、3D 卻潛一樣的距離，下潛速度會在段落邊界突然換檔（看起來像頓一下）；
 * 樣條讓速度在邊界兩側連續，而且仍然單調、仍然在斷點上剛好等於段落序號。
 */
const tangentCache = new WeakMap<number[], number[]>();
function tangents(b: number[]): number[] {
  const hit = tangentCache.get(b);
  if (hit) return hit;
  const n = b.length - 1;
  // 每段的斜率（pos / px）
  const d = Array.from({ length: n }, (_, i) => 1 / (b[i + 1]! - b[i]!));
  const m = new Array<number>(n + 1);
  m[0] = d[0]!;
  m[n] = d[n - 1]!;
  for (let i = 1; i < n; i++) {
    // 調和平均（Fritsch–Butland）：兩側都正，結果夾在兩者之間，保證單調
    m[i] = (2 * d[i - 1]! * d[i]!) / (d[i - 1]! + d[i]!);
  }
  tangentCache.set(b, m);
  return m;
}

export function scrollToPos(scrollY: number, breakpoints: number[]): number {
  const n = breakpoints.length - 1;
  if (n <= 0) return 0;
  if (scrollY <= breakpoints[0]!) return 0;
  if (scrollY >= breakpoints[n]!) return n;
  const m = tangents(breakpoints);
  for (let i = 0; i < n; i++) {
    const a = breakpoints[i]!;
    const b = breakpoints[i + 1]!;
    if (scrollY < b) {
      const h = b - a;
      const t = clamp(invLerp(a, b, scrollY));
      const t2 = t * t;
      const t3 = t2 * t;
      // Hermite：端點值 i、i+1，端點斜率 m（換成以 t 為單位要乘上 h）
      const v =
        (2 * t3 - 3 * t2 + 1) * i +
        (t3 - 2 * t2 + t) * h * m[i]! +
        (-2 * t3 + 3 * t2) * (i + 1) +
        (t3 - t2) * h * m[i + 1]!;
      return clamp(v, i, i + 1);
    }
  }
  return n;
}

/** 反向：要讓 pos 等於某值時應捲到哪裡（給「捲到某段」用）；樣條單調，用二分法解 */
export function posToScroll(pos: number, breakpoints: number[]): number {
  const n = breakpoints.length - 1;
  const p = clamp(pos, 0, n);
  const i = Math.min(n - 1, Math.floor(p));
  let lo = breakpoints[i]!;
  let hi = breakpoints[i + 1]!;
  if (p <= i) return lo;
  if (p >= n) return breakpoints[n]!;
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    if (scrollToPos(mid, breakpoints) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
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
