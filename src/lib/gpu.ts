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
 * 0：沒有 WebGL2、省流量、軟體算繪 → 純 DOM + CSS 背景
 * 1：弱 GPU、手機 → 關後製、魚群減半、DPR ≤ 1.5
 * 2：一般桌機 → 完整場景 + 後製
 * 3：高階 GPU → 再多一點粒子、DPR 2
 */
export function classifyGpu(i: GpuInput): Tier {
  if (i.override != null && i.override >= 0 && i.override <= 3) return i.override as Tier;
  if (!i.webgl2 || i.saveData) return 0;
  // 軟體算繪（GPU 被封鎖、沒有 GPU 的 VM / CI）跑 3D 只有幾 fps，還會卡住捲動：直接用純 DOM 版
  if (SOFTWARE.test(i.renderer)) return 0;
  const mobile = i.coarsePointer && i.viewportWidth < 900;
  if (mobile || WEAK.test(i.renderer) || i.cores <= 4) return 1;
  if (STRONG.test(i.renderer) && i.cores >= 8) return 3;
  return 2;
}

type Probe = { webgl2: boolean; renderer: string };

/** 主執行緒的備援探測（瀏覽器不支援 Worker 裡的 OffscreenCanvas WebGL 時） */
function probeMainThread(): Probe {
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
  return { webgl2, renderer };
}

function probeInWorker(timeoutMs = 2500): Promise<Probe> {
  return new Promise((resolve, reject) => {
    if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') return reject(new Error('no worker'));
    const worker = new Worker(new URL('./gpu-probe.worker.ts', import.meta.url), { type: 'module' });
    const timer = window.setTimeout(() => {
      worker.terminate();
      reject(new Error('timeout'));
    }, timeoutMs);
    worker.onmessage = (e: MessageEvent<Probe>) => {
      window.clearTimeout(timer);
      worker.terminate();
      // Worker 裡拿不到 WebGL2（例如舊版 Safari）不代表主執行緒也拿不到，交給備援
      if (e.data.webgl2) resolve(e.data);
      else reject(new Error('no webgl2 in worker'));
    };
    worker.onerror = () => {
      window.clearTimeout(timer);
      worker.terminate();
      reject(new Error('worker error'));
    };
  });
}

/**
 * 讀取分級所需的資訊。網址指定 tier 時不探測；
 * 否則在 Worker 裡探測 GPU（不擋主執行緒），不支援時才在主執行緒建 context。
 */
export async function readGpuInput(override: number | null): Promise<GpuInput> {
  const probe: Probe =
    override != null ? { webgl2: true, renderer: '' } : await probeInWorker().catch(() => probeMainThread());
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  return {
    ...probe,
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
