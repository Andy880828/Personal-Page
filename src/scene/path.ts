import { clamp, easeInOutCubic, lerp, smoothstep } from '@/lib/math';

/** 每一段在世界座標中佔的垂直距離 */
export const SECTION_SPACING = 30;
/** 相機剛潛入水下、第 1 段開始時的高度 */
export const DIVE_BOTTOM = -8;
/** 海面上的相機高度 */
export const SKY_HEIGHT = 5.5;

/** pos → 相機高度。第 0 段（海面）從空中穿過水面，之後每段等速下潛。 */
export function cameraY(pos: number): number {
  if (pos < 1) {
    const t = easeInOutCubic(clamp((pos - 0.08) / 0.92));
    return lerp(SKY_HEIGHT, DIVE_BOTTOM, t);
  }
  return DIVE_BOTTOM - (pos - 1) * SECTION_SPACING;
}

/** 相機俯角（弧度，負值往下看）：海面上看向夕陽海面，水下逐漸平視 */
export function cameraPitch(pos: number): number {
  if (pos < 1) return lerp(-0.2, 0.06, smoothstep(0.1, 0.9, pos));
  return lerp(0.06, -0.08, smoothstep(4.6, 5.6, pos));
}

/** 第 i 段的「主角位置」在世界座標的 y */
export function sectionAnchorY(i: number): number {
  return cameraY(i + 0.5);
}

/**
 * 跟著某段走的物件（技能氣泡、探測器、熱泉）在畫面中停留的權重：
 * 該段正中央時 1，離開半段後淡出到 0。
 */
export function sectionWeight(pos: number, i: number, width = 0.75): number {
  const d = Math.abs(pos - (i + 0.5));
  return 1 - smoothstep(width * 0.45, width, d);
}

/**
 * 跟段落走的物件 y：以相機為基準，再依與段落中心的距離做視差位移，
 * 讓它比相機慢一點穿過畫面（停留時間比世界座標固定的物件長）。
 */
export function rigY(pos: number, i: number, parallax = 9): number {
  return cameraY(pos) + (i + 0.5 - pos) * parallax;
}

/** 水下顏色（同時當霧與背景色），隨 pos 由淺藍漸變到深淵黑 */
const WATER_STOPS: [number, [number, number, number]][] = [
  [0.5, [0x14, 0x6f, 0x9a]],
  [1.5, [0x0b, 0x4f, 0x7a]],
  [2.5, [0x07, 0x37, 0x5a]],
  [3.5, [0x04, 0x1d, 0x36]],
  [4.5, [0x02, 0x10, 0x1f]],
  [5.6, [0x01, 0x05, 0x0c]],
];

export function waterColor(pos: number): [number, number, number] {
  const first = WATER_STOPS[0]!;
  const last = WATER_STOPS[WATER_STOPS.length - 1]!;
  if (pos <= first[0]) return first[1].map((c) => c / 255) as [number, number, number];
  if (pos >= last[0]) return last[1].map((c) => c / 255) as [number, number, number];
  for (let k = 0; k < WATER_STOPS.length - 1; k++) {
    const [p0, c0] = WATER_STOPS[k]!;
    const [p1, c1] = WATER_STOPS[k + 1]!;
    if (pos <= p1) {
      const t = (pos - p0) / (p1 - p0);
      return [0, 1, 2].map((j) => lerp(c0[j]!, c1[j]!, t) / 255) as [number, number, number];
    }
  }
  return last[1].map((c) => c / 255) as [number, number, number];
}

/** 水下霧濃度：越深越濃 */
export function fogDensity(pos: number): number {
  return lerp(0.028, 0.05, smoothstep(1, 5, pos));
}

/** 從海面往下的光量（0–1），給光束、海雪亮度用 */
export function sunlight(pos: number): number {
  return 1 - smoothstep(0.6, 3.6, pos);
}
