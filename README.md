# 林敬勛 Ching-Hsun Lin｜個人網站

從海面一路潛到 4,000 m 的單頁作品集：每一段的顏色、光線與 3D 元素都由「深度」決定。

- 線上：<https://me.chlinandy.com>（`/about`、`/project` 會直接捲到對應段落）
- 設計規範：[`docs/DESIGN.md`](docs/DESIGN.md)；重構計畫：[`docs/PLAN.md`](docs/PLAN.md)；視覺審視紀錄：[`docs/REVIEW.md`](docs/REVIEW.md)

照片版權所有，未經同意請勿轉載。

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

| 指令                                       | 用途                                                                                                                                                                                                                                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run test:visual:update`               | 畫面有意改變時，更新視覺回歸基準圖（`tests/e2e/__screenshots__`）。基準圖以 CI 為準：commit 訊息加上 `[update-snapshots]`，CI 會重新產生並上傳 `screenshots` artifact，下載後 commit 回 `tests/e2e/__screenshots__`。視覺比對預設只在 CI 跑（字型光柵化依機器而異），本機要跑設 `VISUAL=1` |
| `npm run fonts`                            | 改了文案之後重新子集化字體（需要 `pip install fonttools brotli`）                                                                                                                                                                                                                          |
| `npm run images -- <來源> <輸出名> <寬度>` | 產生新的母圖到 `src/assets/img`                                                                                                                                                                                                                                                            |
| `npm run og`                               | 重新產生社群分享圖 `public/og.jpg`（先 `npm run build`）；**改了職稱或首屏就要重產**                                                                                                                                                                                                       |
| `npm run analyze`                          | 開啟 bundle 視覺化報告                                                                                                                                                                                                                                                                     |
| `npm run models`                           | 重建 `public/models/*.glb`：原始模型在 Personal-Page release `raw-models-v1`，各自解壓到 `raw/models/<slug>/`（gitignore）；參數在 `scripts/models/models.config.mjs`，授權表 `public/models/LICENSES.md` 會一起重寫                                                                       |
| `npm run models:preview`                   | 把所有模型畫成一張檢視圖（`test-results/models-preview.png`）                                                                                                                                                                                                                              |
| `node scripts/build-dna.mjs`               | 從 `raw/1BNA.pdb`（`https://files.rcsb.org/download/1BNA.pdb`）重建雙螺旋座標 `src/assets/dna-1bna.json`                                                                                                                                                                                   |

網址參數：`?tier=0-3` 強制 GPU 等級、`?test=1` 確定性模式（固定時間與亂數）、`?debug` 顯示效能面板、`?perf=1` 回報 frame time、`?slow=0.02` 放慢場景時間（找閃爍用）。

站內指令列（按 `/`）：`help`、`ls`、`cat <skill|project|zone>`、`here`、`contact`、`dive <公尺>`、`ascii on|off` 等。

## 更新內容

主要文案在 `src/content/`；段落標題與介面文字在 `src/sections/`、`src/components/`，指令列在 `src/lib/console.ts`。改完跑 `npm run fonts` 再 `npm run verify`：

| 檔案            | 內容                                                               |
| --------------- | ------------------------------------------------------------------ |
| `profile.ts`    | 姓名、職稱、自我介紹、連結、證照、興趣                             |
| `skills.ts`     | 五組技能（也決定雙螺旋與作品分類的顏色）                           |
| `projects.ts`   | 作品；私有 repo 不放 `repo` 連結，改寫 `note`                      |
| `experience.ts` | 經歷時間軸，由新到舊                                               |
| `fauna.ts`      | 每一段的代表生物與對應的模型                                       |
| `science.ts`    | 深度換算（壓力、溫度、光）、分層帶、指令列 `cat zone` 的說明與來源 |

文案有一條 lint（`tests/unit/copy.test.ts`）擋空泛用語與 emoji，寫法以具體動詞為主。

新增作品截圖：`npm run images -- 截圖.png 名稱.webp 1200`，再到 `src/components/ProjectCard.tsx` 的 `images` 加一行。

## 預算（CI 強制）

| 項目                                | 上限                 | 目前              |
| ----------------------------------- | -------------------- | ----------------- |
| 首屏 JS                             | 120 KB gzip          | 約 99 KB          |
| 3D 核心（three + r3f + drei，lazy） | 250 KB gzip          | 約 242 KB         |
| 後製（tier ≥ 2）                    | 80 KB gzip           | 約 28 KB          |
| 模型解碼器（lazy）                  | 40 KB gzip           | 約 21 KB          |
| 模型（GLB 合計／單檔）              | 800 KB／200 KB       | 約 685 KB         |
| 全部 JS（不含 `?debug` 面板）       | 500 KB gzip          | 約 473 KB         |
| 字體                                | 300 KB               | 約 241 KB         |
| 圖片（所有格式合計／單張）          | 1.5 MB／200 KB       | 約 770 KB         |
| Lighthouse 桌機                     | 效能 ≥ 85，其餘 ≥ 95 | 效能 99，其餘 100 |

CI 沒有 GPU，會被分到 tier 0（純 DOM 版），所以 Lighthouse 量的是首屏與內容；3D 的執行效能由 Playwright 的 frame-time 測試與 `?debug` 面板把關。

## 素材與資料來源

- 3D 模型：Sketchfab 上的 CC0、CC-BY 與 CC-BY-NC-SA（管水母，MBARI）作品，作者與授權見 [`public/models/LICENSES.md`](public/models/LICENSES.md)。
- 雙螺旋：RCSB PDB [1BNA](https://www.rcsb.org/structure/1BNA)，Drew, Wing, Takano, Broka, Tanaka, Itakura & Dickerson (1981) PNAS 78:2179。

## 科學資料來源

深度換算（壓力、水溫、光）是公開教材的概略值，不是量測資料；指令列 `cat zone` 會列出目前深度帶的說明與來源。

1. [Exploring Our Fluid Earth：Light in the Ocean](https://manoa.hawaii.edu/exploringourfluidearth/physical/ocean-depths/light-ocean)
2. [Introduction to Oceanography：6.5 Light](https://pressbooks.ccconline.org/introduction-to-oceanography/chapter/6-5-light/)
3. [NOAA Ocean Service：What is marine snow?](https://oceanservice.noaa.gov/facts/marinesnow.html)
4. [Martini & Haddock (2017) Scientific Reports：Quantification of bioluminescence from the surface to the deep sea](https://pmc.ncbi.nlm.nih.gov/articles/PMC5379559/)
5. [Scientific American：Greatest Migration on Earth Happens under Darkness Every Day](https://www.scientificamerican.com/article/greatest-migration-on-earth-happens-under-darkness-every-day)
6. [LibreTexts Oceanography：12.1 Zones of Marine Environments](<https://geo.libretexts.org/Bookshelves/Oceanography/Oceanography_(Hill)/12:_Marine_Environments/12.1:_Zones_of_Marine_Environments>)
7. [Miya et al. (2015) Royal Society Open Science：MiFish primers for fish eDNA metabarcoding](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4632578/)
8. [NOAA Ocean Exploration：Hydrothermal vents](https://oceanexplorer.noaa.gov/facts/vents.html)

## 部署

Vercel（`vercel.json`）。聯絡表單需要在 Vercel 的 Environment Variables 設定三個 EmailJS 值（見 `.env.example`），沒設定時不顯示表單，改顯示 Email、履歷、GitHub 與 Facebook。
