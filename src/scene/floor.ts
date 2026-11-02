import { createRng, SCENE_SEED } from '@/lib/seed';

/** 簡單的值雜訊 fbm（CPU，建立地形用） */
function makeNoise(seed: number) {
  const rng = createRng(seed);
  const perm = Array.from({ length: 512 }, () => rng());
  const h = (x: number, z: number) => perm[(((x * 73856093) ^ (z * 19349663)) >>> 0) % 512]!;
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const noise = (x: number, z: number) => {
    const xi = Math.floor(x);
    const zi = Math.floor(z);
    const xf = smooth(x - xi);
    const zf = smooth(z - zi);
    const a = h(xi, zi) + (h(xi + 1, zi) - h(xi, zi)) * xf;
    const b = h(xi, zi + 1) + (h(xi + 1, zi + 1) - h(xi, zi + 1)) * xf;
    return a + (b - a) * zf;
  };
  return (x: number, z: number) => {
    let v = 0;
    let amp = 1;
    let f = 0.06;
    for (let o = 0; o < 4; o++) {
      v += noise(x * f, z * f) * amp;
      amp *= 0.5;
      f *= 2.1;
    }
    return v;
  };
}

const floorNoise = makeNoise(SCENE_SEED + 41);

/** 海床地形高度（相對於 FLOOR_Y）；海床上的生物用它貼地 */
export function floorHeight(x: number, z: number): number {
  const ridge = Math.abs(floorNoise(x + 40, z + 40) - 0.9) * 3.2;
  return floorNoise(x, z) * 3.6 - ridge;
}

/**
 * 岩塊的起伏量：依頂點「位置」雜湊出 0–1。
 * IcosahedronGeometry 是非索引幾何，同一個角在每個相鄰三角形各有一份頂點；
 * 用位置算而不是每個頂點各抽一次亂數，同一個角才會被推到同一處，面不會裂開。
 */
export function rockJitter(x: number, y: number, z: number, seed: number): number {
  const q = (v: number) => Math.round(v * 1000);
  let h = (Math.imul(q(x), 73856093) ^ Math.imul(q(y), 19349663) ^ Math.imul(q(z), 83492791) ^ seed) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 2246822507) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
