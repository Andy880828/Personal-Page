// 產生社群分享圖 public/og.jpg：用確定性模式截海面那一幕（1200×630）
// 用法：npm run build && npm run og
import { preview } from 'vite';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const server = await preview({ preview: { port: 4174, strictPort: true } });
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto('http://localhost:4174/?test=1&tier=2');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.__site?.ready() === true, null, { timeout: 60_000 });
  await page.waitForTimeout(300);
  const png = await page.screenshot();
  const info = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile('public/og.jpg');
  console.log(`public/og.jpg ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
} finally {
  await browser.close();
  await new Promise((r) => server.httpServer.close(r));
}
