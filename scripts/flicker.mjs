// 閃爍量測：場景時間放慢（?slow=0.02），連續截圖，算相鄰幀的平均像素差（0–255）。
// 放慢後連續動畫幾乎不動，剩下的差異就是不連續的變化（閃爍）。
// 合格線：每個位置的最大值 < 1.5（LIMIT 可調）。基準：第五輪開工前的 main 在 1280×800、SwiftShader 上
// 海面 1.13／1.40（波浪本身還在慢慢動）、200 m 0.72、1000 m 0.34、海床 0.09；真的閃爍時會是 5 以上。
// 剛載入時場景會淡入，所以每個位置先等 SETTLE 毫秒（預設 6000）再量；VERBOSE=1 印出每一幀。
// 用法：先 npm run build && npm run preview，再 node scripts/flicker.mjs [tier，預設 2]
import { chromium } from 'playwright';
import sharp from 'sharp';

const tier = process.argv[2] ?? '2';
const SPOTS = [
  { name: '海面', pos: 0.2 },
  { name: '200 m', pos: 3.02 },
  { name: '1000 m', pos: 4.02 },
  { name: '海床', pos: 5.8 },
];
const FRAMES = 12;

const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(`http://localhost:4173/?tier=${tier}&slow=0.02&perf=1`);
await page.waitForFunction(() => window.__site?.ready() === true, null, { timeout: 120_000 });
const fx = await page.evaluate(() => document.querySelectorAll('[data-testid=scene] canvas').length);

const raw = async () => {
  const png = await page.locator('[data-testid=scene] canvas').screenshot();
  return sharp(png).removeAlpha().raw().toBuffer();
};

console.log(`tier ${tier}（canvas ${fx}）  相鄰幀平均差（0–255），${FRAMES} 幀`);
console.log('| 位置 | 平均 | 最大 |\n|---|---|---|');
let worst = 0;
for (const s of SPOTS) {
  await page.evaluate((p) => window.__site.scrollToPos(p), s.pos);
  // 等捲動停下、門檻掃描帶（600 ms）結束
  await page.waitForTimeout(Number(process.env.SETTLE ?? 6000));
  let prev = await raw();
  const diffs = [];
  for (let i = 1; i < FRAMES; i++) {
    await page.waitForTimeout(120);
    const cur = await raw();
    let sum = 0;
    for (let k = 0; k < cur.length; k++) sum += Math.abs(cur[k] - prev[k]);
    diffs.push(sum / cur.length);
    prev = cur;
  }
  const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  const max = Math.max(...diffs);
  worst = Math.max(worst, max);
  console.log(`| ${s.name} | ${avg.toFixed(2)} | ${max.toFixed(2)} |`);
  if (process.env.VERBOSE) console.log(diffs.map((d) => d.toFixed(2)).join(' '));
}
await browser.close();
process.exit(worst < Number(process.env.LIMIT ?? 1.5) ? 0 : 1);
