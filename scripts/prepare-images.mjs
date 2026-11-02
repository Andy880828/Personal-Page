// 把原始素材縮成合理尺寸的「母圖」放進 src/assets/img；
// 實際給瀏覽器的 AVIF/WebP 由 vite-imagetools 在 build 時從母圖產生。
// 用法：node scripts/prepare-images.mjs <來源> <輸出檔名> <最大寬度> [--trim]
import sharp from 'sharp';
import path from 'node:path';

const [src, out, width, ...flags] = process.argv.slice(2);
if (!src || !out || !width) {
  console.error('usage: node scripts/prepare-images.mjs <src> <out-name> <max-width> [--trim]');
  process.exit(2);
}
let img = sharp(src);
if (flags.includes('--trim')) img = img.trim();
img = img.resize({ width: Number(width), withoutEnlargement: true });
const dest = path.join('src/assets/img', out);
const ext = path.extname(out).toLowerCase();
if (ext === '.jpg') img = img.jpeg({ quality: 86, mozjpeg: true });
else if (ext === '.webp') img = img.webp({ quality: 88 });
else if (ext === '.png') img = img.png({ compressionLevel: 9, palette: false });
const info = await img.toFile(dest);
console.log(`${dest} ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
