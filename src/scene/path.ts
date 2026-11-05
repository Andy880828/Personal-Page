import { clamp, lerp, smoothstep } from '@/lib/math';

/** 每一段在世界座標中佔的垂直距離 */
export const SECTION_SPACING = 30;
/** 相機剛潛入水下、第 1 段開始時的高度 */
export const DIVE_BOTTOM = -8;
/** 海面上的相機高度 */
export const SKY_HEIGHT = 5.5;

/** 最後一段（海床）下潛速度變慢，相機停在海床上方 */
export const FLOOR_SPACING = 12;
/** 海床高度：最深的相機位置再往下一點 */
export const FLOOR_Y = DIVE_BOTTOM - 4 * SECTION_SPACING - FLOOR_SPACING - 13;

/**
 * 每一段實際的捲動長度（px，由 lib/scroller 量完版面後設定）。
 * 水下四段（關於、技能、作品、經歷）共潛 4 × SECTION_SPACING，依各段的捲動長度分配：
 * 每捲 1 px 都潛一樣的距離，作品段很長也不會讓下潛變慢（舊做法是每段潛一樣遠，作品段速度只剩約 1/4）。
 * 預設六段等長，等於舊行為；單元測試直接用它。
 */
let spans = [1, 1, 1, 1, 1, 1];
export function setSectionSpans(next: number[]) {
  if (next.length === spans.length && next.every((v) => v > 0)) spans = next.slice();
}
export function getSectionSpans(): readonly number[] {
  return spans;
}

const UNDER = 4 * SECTION_SPACING;
const DIVE_START = 0.08;

/** 水下每 px 捲動的下潛距離 */
function divePerPx(): number {
  return UNDER / (spans[1]! + spans[2]! + spans[3]! + spans[4]!);
}

/**
 * pos → 相機高度。第 0 段（海面）從空中穿過水面，水下四段依捲動長度等速下潛，最後一段減速停在海床上。
 * 接合處速度連續：
 * - 海面：h(t) = (m−2)t³ + (3−m)t²，起點速度 0、終點速度接上水下的等速
 * - 海床：Hermite，起點速度接上水下的等速、終點速度 0、總共再降 FLOOR_SPACING
 */
export function cameraY(pos: number): number {
  const c = divePerPx();
  if (pos < 1) {
    const t = clamp((pos - DIVE_START) / (1 - DIVE_START));
    const drop = SKY_HEIGHT - DIVE_BOTTOM;
    // 終點斜率（以 t 為單位）；m ≤ 3 才單調
    const m = Math.min(3, (c * spans[0]! * (1 - DIVE_START)) / drop);
    const h = (m - 2) * t * t * t + (3 - m) * t * t;
    return SKY_HEIGHT - drop * h;
  }
  if (pos < 5) {
    const i = Math.floor(pos);
    let y = DIVE_BOTTOM;
    for (let k = 1; k < i; k++) y -= c * spans[k]!;
    return y - (pos - i) * c * spans[i]!;
  }
  const u = Math.min(1, pos - 5);
  // 起點斜率 s0（以 u 為單位）；s0 ≤ 3·FLOOR_SPACING 才單調
  const s0 = Math.min(3 * FLOOR_SPACING, c * spans[5]!);
  const f = (u * u * u - 2 * u * u + u) * s0 + (3 * u * u - 2 * u * u * u) * FLOOR_SPACING;
  return DIVE_BOTTOM - UNDER - f;
}

/**
 * 「每 px 等距」的 pos：把相機的實際高度換回六段等長時的 pos。
 * 水色、霧、光量這些跟深度走的東西用它，速度就和相機一樣在段落邊界不換檔
 * （直接用 pos 時，短的段落變色快、長的作品段變色慢，每個邊界都有一個速度折點）。
 * 六段等長時就是 pos 本身。
 */
export function evenPos(pos: number): number {
  if (pos <= 1 || pos >= 5) return pos;
  return 1 + (DIVE_BOTTOM - cameraY(pos)) / SECTION_SPACING;
}

/** 相機穿過水面（y = 0）時的 pos；海面段的曲線單調，用二分法解 */
export function surfacePos(): number {
  let lo = 0;
  let hi = 1;
  for (let k = 0; k < 30; k++) {
    const mid = (lo + hi) / 2;
    if (cameraY(mid) > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** 入水後抬頭看斯涅爾窗的最大仰角（弧度）：視線中心離正上方約 21°，整個光窗（半角 48.6°）剛好框在畫面裡 */
export const SNELL_LOOK = 1.15;

/**
 * 入水事件的仰角權重 0–1：穿過水面後抬頭（看到頭頂的斯涅爾窗），停一下，再隨下潛轉回平視。
 * 全部由捲動驅動，往回捲就倒著播；用 smoothstep 接合，速度連續。
 */
export function entryLook(pos: number): number {
  const sp = surfacePos();
  const end = Math.min(1.1, sp + 0.5);
  return smoothstep(sp - 0.02, sp + 0.12, pos) * (1 - smoothstep(sp + 0.24, end, pos));
}

/** 相機俯角（弧度，負值往下看）：海面上看向夕陽海面；入水時抬頭看斯涅爾窗；水下平視；到海床往下看 */
export function cameraPitch(pos: number): number {
  if (pos < 1.15) return lerp(-0.2, 0.06, smoothstep(0.1, 0.9, pos)) + SNELL_LOOK * entryLook(pos);
  return lerp(0.06, -0.4, smoothstep(4.6, 5.7, pos));
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
 * 跟段落走的物件 y：以相機為基準，再依與段落中心的距離做視差位移。
 * 往下捲時物件在畫面上往上浮（和文字同方向），但比文字慢，像遠處的東西；段落中心時剛好在設定的位置。
 * （以前符號寫反了：物件往下沉、而且比文字還快，礁一進關於段就沉出畫面底部。）
 */
export function rigY(pos: number, i: number, parallax = 9): number {
  return cameraY(pos) + (pos - (i + 0.5)) * parallax;
}

/** 水下顏色（同時當霧與背景色），隨 pos 由淺藍漸變到深淵黑 */
const WATER_STOPS: [number, [number, number, number]][] = [
  [0.5, [0x0f, 0x58, 0x7f]],
  [1.5, [0x09, 0x42, 0x66]],
  [2.5, [0x06, 0x31, 0x50]],
  [3.4, [0x03, 0x1a, 0x30]],
  // 深層帶：幾乎全黑，只剩生物光與字元海雪
  [4.05, [0x01, 0x07, 0x0f]],
  [4.6, [0x01, 0x04, 0x09]],
  [5.6, [0x01, 0x05, 0x0c]],
];

export function waterColor(rawPos: number): [number, number, number] {
  const pos = evenPos(rawPos);
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
export function fogDensity(rawPos: number): number {
  const pos = evenPos(rawPos);
  // 海床段變清澈一點，讓地形與熱泉看得到
  return lerp(0.026, 0.034, smoothstep(1, 4.5, pos)) - 0.014 * smoothstep(4.9, 5.6, pos);
}

/** 從海面往下的光量（0–1），給光束、海雪亮度用 */
export function sunlight(pos: number): number {
  return 1 - smoothstep(0.6, 3.6, evenPos(pos));
}
