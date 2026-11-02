// 單張圖片上限檢查（size-limit 只能量總和）
import { readdirSync, statSync } from 'node:fs';

const LIMIT = 200 * 1024;
const dir = 'dist/assets';
const bad = readdirSync(dir)
  .filter((f) => /\.(avif|webp|jpe?g|png)$/.test(f))
  .map((f) => ({ f, size: statSync(`${dir}/${f}`).size }))
  .filter((x) => x.size > LIMIT);
if (bad.length) {
  for (const b of bad) console.error(`✗ ${b.f} ${(b.size / 1024).toFixed(0)} KB > 200 KB`);
  process.exit(1);
}
console.log('✓ 每張圖片都在 200 KB 以內');
