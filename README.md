# 林敬勛 Ching-Hsun Lin｜個人網站

從海面一路潛到 4,000 m 的單頁作品集：每一段的顏色、光線與 3D 元素都由「深度」決定。

- 線上：<https://personal-page-gules.vercel.app>（`/about`、`/project` 會直接捲到對應段落）
- 設計規範：[`docs/DESIGN.md`](docs/DESIGN.md)；重構計畫：[`docs/PLAN.md`](docs/PLAN.md)；視覺審視紀錄：[`docs/REVIEW.md`](docs/REVIEW.md)

照片皆具版權，僅供參考，翻印必究。

## 技術棧

| 層         | 用什麼                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------- |
| 建置       | Vite 8、TypeScript 6、React 19                                                               |
| 樣式       | Tailwind CSS 4（色票與字體在 `src/styles/index.css` 的 `@theme`）                            |
| 3D         | three.js、React Three Fiber、drei、postprocessing（bloom、vignette）                         |
| 載入期背景 | Paper Shaders（MeshGradient）                                                                |
| 動畫       | GSAP（ScrollTrigger、SplitText）+ Lenis，首屏後才載入                                        |
| 狀態       | zustand                                                                                      |
| 測試       | Vitest、@react-three/test-renderer、Playwright（視覺回歸 + 互動）、size-limit、Lighthouse CI |

## 指令

```bash
npm install
npm run dev            # http://localhost:5173
npm run verify         # lint + 型別 + 格式 + 單元測試 + build + 大小預算
npm run test:e2e       # Playwright：視覺回歸與互動（會自己 build 並開 preview）
npm run lhci           # Lighthouse CI（用 Playwright 附帶的 Chromium）
```

| 指令                                       | 用途                                                                                                          |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `npm run test:visual:update`               | 畫面有意改變時，更新視覺回歸基準圖（`tests/e2e/__screenshots__`）；基準圖以 CI 渲染為準（本機容差 4%、CI 2%） |
| `npm run fonts`                            | 改了文案之後重新子集化字體（需要 `pip install fonttools brotli`）                                             |
| `npm run images -- <來源> <輸出名> <寬度>` | 產生新的母圖到 `src/assets/img`                                                                               |
| `npm run og`                               | 重新產生社群分享圖 `public/og.jpg`（先 `npm run build`）                                                      |
| `npm run analyze`                          | 開啟 bundle 視覺化報告                                                                                        |

網址參數：`?tier=0-3` 強制 GPU 等級、`?test=1` 確定性模式（固定時間與亂數）、`?debug` 顯示效能面板、`?perf=1` 回報 frame time。

## 更新內容

所有文案都在 `src/content/`，改完跑 `npm run fonts` 再 `npm run verify`：

| 檔案            | 內容                                          |
| --------------- | --------------------------------------------- |
| `profile.ts`    | 姓名、職稱、自我介紹、連結、證照、興趣        |
| `skills.ts`     | 五組技能（也決定 3D 氣泡的顏色）              |
| `projects.ts`   | 作品；私有 repo 不放 `repo` 連結，改寫 `note` |
| `experience.ts` | 經歷時間軸，由舊到新                          |

新增作品截圖：`npm run images -- 截圖.png 名稱.webp 1200`，再到 `src/components/ProjectCard.tsx` 的 `images` 加一行。

## 預算（CI 強制）

| 項目                                | 上限                 | 目前              |
| ----------------------------------- | -------------------- | ----------------- |
| 首屏 JS                             | 120 KB gzip          | 約 91 KB          |
| 3D 核心（three + r3f + drei，lazy） | 250 KB gzip          | 約 244 KB         |
| 後製（tier ≥ 2）                    | 80 KB gzip           | 約 25 KB          |
| 全部 JS（不含 `?debug` 面板）       | 500 KB gzip          | 約 435 KB         |
| 字體                                | 300 KB               | 約 206 KB         |
| 圖片（所有格式合計／單張）          | 1.5 MB／200 KB       | 約 770 KB         |
| Lighthouse 桌機                     | 效能 ≥ 85，其餘 ≥ 95 | 效能 99，其餘 100 |

CI 沒有 GPU，會被分到 tier 0（純 DOM 版），所以 Lighthouse 量的是首屏與內容；3D 的執行效能由 Playwright 的 frame-time 測試與 `?debug` 面板把關。

## 部署

Vercel（`vercel.json`）。聯絡表單需要在 Vercel 的 Environment Variables 設定三個 EmailJS 值（見 `.env.example`），沒設定時表單會顯示「暫時關閉」並引導改用 GitHub / Facebook。
