import type { Object3D } from 'three';

/**
 * GLB 模型載入：GLTFLoader + MeshoptDecoder 放在自己的 chunk（gltf-*.js），第一次要模型時才下載；
 * 每個模型只抓一次，之後回傳同一個 Promise。不用 Draco、KTX2（解碼器太大）。
 */
type Loader = { loadAsync: (url: string) => Promise<{ scene: Object3D }> };

let loader: Promise<Loader> | null = null;
const cache = new Map<string, Promise<Object3D>>();
let pending = 0;

function getLoader(): Promise<Loader> {
  loader ??= import('./gltf').then((m) => m.createLoader());
  return loader;
}

export function modelUrl(slug: string): string {
  return `/models/${slug}.glb`;
}

export function loadModel(slug: string): Promise<Object3D> {
  let p = cache.get(slug);
  if (!p) {
    pending++;
    p = getLoader()
      .then((l) => l.loadAsync(modelUrl(slug)))
      .then((g) => g.scene)
      .finally(() => {
        pending--;
      });
    cache.set(slug, p);
  }
  return p;
}

/**
 * 還沒完成的模型工作（下載中，或下載完還沒掛進場景）；測試模式要等到 0 才標記場景就緒，視覺基準才穩。
 * 下載由 loadModel 自己計數；「掛進場景」由使用端用 holdWork / releaseWork 包起來。
 */
let held = 0;
export function holdWork() {
  held++;
}
export function releaseWork() {
  held = Math.max(0, held - 1);
}
export function pendingModels(): number {
  return pending + held;
}
