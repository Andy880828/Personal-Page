export type Tier = 0 | 1 | 2 | 3;

export interface GpuInput {
  webgl2: boolean;
  renderer: string;
  cores: number;
  dpr: number;
  coarsePointer: boolean;
  viewportWidth: number;
  saveData: boolean;
  override?: number | null;
}

const SOFTWARE = /swiftshader|llvmpipe|software|softpipe|microsoft basic render/i;
const WEAK =
  /mali-[4t]|mali-g(31|51|52|57)\b|adreno \(tm\) [3-5]\d\d|powervr|intel\(r\) hd graphics [2-5]\d{3}|\bgma\b/i;
const STRONG = /apple m\d|rtx|radeon rx|radeon pro|geforce gtx 1[0-9]{3}|arc a\d/i;

/**
 * 0：沒有 WebGL2（或省流量）→ 純 DOM + CSS 背景
 * 1：軟體算繪、弱 GPU、手機 → 關後製、魚群減半、DPR ≤ 1.5
 * 2：一般桌機 → 完整場景 + 後製
 * 3：高階 GPU → 再多一點粒子、DPR 2
 */
export function classifyGpu(i: GpuInput): Tier {
  if (i.override != null && i.override >= 0 && i.override <= 3) return i.override as Tier;
  if (!i.webgl2 || i.saveData) return 0;
  if (SOFTWARE.test(i.renderer)) return 1;
  const mobile = i.coarsePointer && i.viewportWidth < 900;
  if (mobile || WEAK.test(i.renderer) || i.cores <= 4) return 1;
  if (STRONG.test(i.renderer) && i.cores >= 8) return 3;
  return 2;
}

export function readGpuInput(override: number | null): GpuInput {
  let webgl2 = false;
  let renderer = '';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: false });
    if (gl) {
      webgl2 = true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      renderer = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch {
    webgl2 = false;
  }
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  return {
    webgl2,
    renderer,
    cores: navigator.hardwareConcurrency || 4,
    dpr: window.devicePixelRatio || 1,
    coarsePointer: window.matchMedia?.('(pointer: coarse)').matches ?? false,
    viewportWidth: window.innerWidth,
    saveData: nav.connection?.saveData === true,
    override,
  };
}

/** 依等級決定的場景參數；集中在這裡方便測試 */
export function sceneBudget(tier: Tier, test = false) {
  return {
    dpr: (test ? [1, 1] : tier >= 3 ? [1, 2] : tier === 2 ? [1, 1.75] : [1, 1.5]) as [number, number],
    waterSegments: tier >= 2 ? 192 : 112,
    fish: tier >= 3 ? 360 : tier === 2 ? 260 : 120,
    snow: tier >= 3 ? 2600 : tier === 2 ? 2000 : 800,
    plankton: tier >= 2 ? 420 : 160,
    postprocessing: tier >= 2,
    transmission: tier >= 2,
  };
}
