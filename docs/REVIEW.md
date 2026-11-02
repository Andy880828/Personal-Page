# impeccable 視覺審視紀錄

## 第二輪（2026-11-02，對正式站）

Method: dual-agent（A：設計審視 · B：偵測器與瀏覽器證據，隔離平行），對象 `https://personal-page-gules.vercel.app`，含科學層、指令列、DNA 雙螺旋與互動的版本。

### 結論

| 項目                                  | 修正前（正式站）                                                                          | 修正後                                 |
| ------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------- |
| 偵測器（渲染後，桌機 tier 1／tier 2） | 0 項                                                                                      | 0 項                                   |
| 偵測器（手機 tier 0）                 | 2 項 warning：`body-text-viewport-edge`（技能面板的序列行把欄位撐寬，整頁橫向溢出 23 px） | 0 項；新增 e2e「手機每段不可橫向溢出」 |
| Nielsen（Experience 模式，1 項 n/a）  | 25/36                                                                                     | 未重新評分；P1 全部已修                |
| 海面相鄰幀差異（`?slow=0.02`）        | 0.65–1.1                                                                                  | 同                                     |

審視對三個新東西的判斷：科學層「實質是真的、呈現像裝飾」（軸不是物理尺度、光量顯示 ≈0 和曙光帶說明矛盾）；指令列對工程師是真功能，但不該在手機上露出、也不該蓋住它所回報的儀表；雙螺旋明顯比泡泡好、而且和分頁真的接在一起。

### 已修正

| 優先 | 問題                                                                    | 修正                                                                                                                        |
| ---- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| P1   | 儀表在 1280–1536 寬的筆電蓋住內容（證照數字、螺旋圖例、表單）           | `main` 在 lg 以上為儀表保留 12.5rem 右欄（1640px 以上不用）；儀表改靠上、縮短                                               |
| P1   | 正式站的表單是停用狀態，旅程結束在一顆灰掉的按鈕                        | 沒接上寄信服務時不畫表單，改成 GitHub／履歷／Facebook 的聯絡卡                                                              |
| P1   | 指令列和儀表搶右下角；`help` 用 `padEnd` 在中文下對不齊、每列折兩行     | 指令列移到左下；`help` 回傳 tab 分欄、畫面排兩欄；手機不顯示按鈕（鍵盤 `/` 仍可）                                           |
| P1   | 手機橫向溢出 23 px                                                      | 序列行只在 sm 以上顯示並單行截斷；欄位 `min-w-0`、面板 `overflow-hidden`                                                    |
| P2   | 儀表的深度軸用段落等距、剖面圖不像物理曲線；光量顯示「≈0」              | 深度軸改 log10(depth+1)，刻度 0/10/100/200/1,000/4,000；光量低於 0.01% 用 10 的次方；標題改 telemetry（沒有鹽度就不叫 CTD） |
| P2   | 手機文案叫人拖曳看不到的螺旋                                            | 文案改成「大螢幕上也可以拖曳」；直式螢幕的螺旋往上移到分頁上方                                                              |
| P2   | 儀表文字 9–11 px、來源連結 20×15 px 太小、來源行在 3D 背景上對比 2.6:1  | 儀表字級 ≥ 11.5 px；註記加 70% 深色底；來源連結有 title／aria-label 與 44 px 點擊高度                                       |
| P2   | 修正後再掃一次：註記的左側彩色邊線 + 圓角觸發 `side-tab`（AI 慣用樣式） | 拿掉邊線，只留底色與標題色；正式站偵測器回到 0 項                                                                           |
| P2   | 分頁 40 px、篩選 36 px、作品連結 21 px 高                               | `min-h-11` 與 `py-2 -my-2` 擴大觸控面積                                                                                     |
| P3   | 首頁與經歷段重複顯示儀表已有的深度／壓力                                | 首頁只留座標；經歷段只留年份                                                                                                |
| P3   | 儀表 3,800 m 就寫「海床」，標題寫 4,000 m                               | 3,990 m 以上才寫海床                                                                                                        |

### 沒有採納

- **Tab 自動補全**：值得做，但不在這輪；`help` 與 placeholder 已能支撐。
- **加鹽度讓它名副其實叫 CTD**：改名比加一條假的鹽度剖面誠實。
- **移除 ACGT 裝飾序列**：保留（只在 sm 以上、單行、aria-hidden），它是技能段「被讀出來的基因」隱喻的一部分。
- **Email／LinkedIn**：仍需要你提供才會放。

---

## 第一輪（2026-11-02）

Method: dual-agent（A：設計審視子 agent · B：偵測器與瀏覽器證據子 agent，兩者互相隔離、平行執行）

- 工具：impeccable 4.8.0（skill 與引擎 v0.1.18，`npx impeccable install --providers=claude --scope=project --no-hooks`）
- 指令：`/impeccable critique`（含 Assessment A／B）→ `/impeccable audit` 的技術檢查 → 依結果做 `typeset`、`colorize`、`layout`、`adapt`、`harden`、`polish` 類修正
- 對象：`src/Site.tsx` 整頁；瀏覽器檢查用 production build（桌機 1440×900 tier 2、手機 390×844 tier 1、桌機 tier 0）
- 沒有 PRODUCT.md：critique／audit 屬於評估既有實作，依 skill 規則以程式碼與 `docs/DESIGN.md` 為準；建議之後跑一次 `/impeccable init`

## 結論

| 項目                                        | 修正前                                                              | 修正後                            |
| ------------------------------------------- | ------------------------------------------------------------------- | --------------------------------- |
| 偵測器（渲染後頁面，桌機＋手機）            | 8 項：段落小標 ×5、光暈 ×1、脈動點 ×1、低對比 ×1（另手機 1 項提示） | **0 項**（tier 1 與 tier 0 都是） |
| 偵測器（原始碼掃描）                        | 0 項（只做 regex，參考價值低）                                      | 0 項                              |
| Nielsen 啟發式（Experience 模式，2 項 n/a） | 23/32                                                               | 未重新評分；P1 問題已修           |
| Lighthouse 桌機                             | 效能 99、其餘 100                                                   | 效能 99、其餘 100，TBT 0 ms       |

最大的收穫：審視發現 **tier 1（手機與弱 GPU）完全不畫 3D**。原因是 `ReadyProbe` 用了 priority 1 的 `useFrame`，React Three Fiber 會因此關掉自動渲染；tier 2 有後製元件自己渲染所以沒露餡。已修正並加上單元測試防止再犯（`tests/unit/scene.test.tsx`）。

## Design Health Score（修正前，Assessment A）

| #         | Heuristic                       | Score     | Key Issue                                        |
| --------- | ------------------------------- | --------- | ------------------------------------------------ |
| 1         | Visibility of System Status     | 3         | 經歷段兩個深度讀數互相矛盾（2,050 m vs 2,400 m） |
| 2         | Match System / Real World       | 3         | 卡片用語偏工程（JSON envelope、CISA KEV）        |
| 3         | User Control and Freedom        | 3         | 手機選單沒有 Esc 關閉、沒有焦點管理              |
| 4         | Consistency and Standards       | 3         | 分類色不在 token；表單輸入框拿掉了焦點外框       |
| 5         | Error Prevention                | 3         | 選填電話欄位多餘                                 |
| 6         | Recognition Rather Than Recall  | 3         | 3D 氣泡要靠顏色對應分頁                          |
| 7         | Flexibility and Efficiency      | n/a       | 作品集                                           |
| 8         | Aesthetic and Minimalist Design | 2         | 淺水段 3D 太亮、和文字搶；終端機封面大片空白     |
| 9         | Error Recovery                  | 3         | 失敗時建議改用 Facebook                          |
| 10        | Help and Documentation          | n/a       | 作品集                                           |
| **Total** |                                 | **23/32** | **Good（偏低）**                                 |

## Design Specificity Verdict

**LLM 審視**：高度專屬。深度不是貼上去的裝飾，而是資訊結構：每段標題的深度、右側分層深度計、手機導覽列的深度讀數、越往下越近期的經歷時間軸、高雄座標、CLI 作品的封面直接用工具的真實輸出。退回通用的地方在元件層：玻璃面板、等寬字標籤、每段同一套「小標＋大標＋說明」。

**確定性掃描**：原始碼 0 項（引擎對 `.tsx` 只做 regex）；渲染後頁面 8 項，全部來自共用元件：`kicker-above-heading` ×5（`SectionHeader`）、`dark-glow` ×1（經歷段年份）、`pulsing-dot` ×1（「進行中」）、`low-contrast` ×1（深度計刻度）。偵測器沒抓到的：淺水段的大面積對比不足（A 用像素取樣量到內文 2.2–2.6:1）。A 沒注意到、偵測器抓到的：深度計刻度只有 3.6:1。

**瀏覽器 overlay**：在 headless Chromium 注入 `detect.js` 成功（7 項，與 CLI 一致）。沒有給人看的瀏覽器分頁，所以沒有 `[Human]` overlay 可看。

## 已修正

| 優先 | 問題                                                        | 修正                                                                                       | 位置                                                                                  |
| ---- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| P0   | tier 1 完全沒有 3D                                          | 拿掉 `useFrame` 的 priority；加測試                                                        | `src/scene/SceneRoot.tsx`、`tests/unit/scene.test.tsx`                                |
| P1   | 淺水段對比 2.2:1                                            | 淺水色調暗、光束減半、文字欄加 `.scrim`、說明文字改 `ink`                                  | `src/scene/path.ts`、`LightShafts.tsx`、`styles/index.css`、`About.tsx`、`Skills.tsx` |
| P1   | 段落標題上方的小標（craft-floor 禁止）                      | 深度改放在標題同一列右端，用細線連接；首頁英文名與座標移到名字下方                         | `SectionHeader.tsx`、`Hero.tsx`                                                       |
| P1   | 海面那一幕導覽與深度計看不清                                | 頁首加由上而下的暗色漸層、導覽文字改亮色、深度計加半透明底                                 | `Nav.tsx`、`DepthHUD.tsx`                                                             |
| P2   | 兩個深度讀數矛盾                                            | 經歷段深度改讀同一個捲動深度                                                               | `Experience.tsx`                                                                      |
| P2   | 零位移光暈、脈動點                                          | 年份去光暈、時間軸節點改實心環、「進行中」改靜態點                                         | `Experience.tsx`、`ProjectCard.tsx`、`DepthHUD.tsx`                                   |
| P2   | 作品段太長、終端機封面空白                                  | 封存作品改成「更早的作品」精簡列表；封面依內容高度；公開的 local-transcribe 移到第二個精選 | `Projects.tsx`、`ProjectCard.tsx`、`TerminalCover.tsx`、`projects.ts`                 |
| P2   | tier 0 技能右欄一片空白、說明文字提到看不到的氣泡           | tier 0 用 CSS 畫五顆對應光點；說明文字依 tier 調整                                         | `Skills.tsx`                                                                          |
| P2   | CSS 背景的地平線硬切線穿過名字                              | 漸層改成柔和過渡                                                                           | `Backdrop.tsx`                                                                        |
| P2   | 手機上魚群跑出畫面、段落留白過多                            | 直式螢幕魚群置中；`lg` 以下段落間距改固定值                                                | `Fish.tsx`、各 section                                                                |
| P2   | 表單輸入框沒有焦點外框、選填電話多餘、失敗訊息導向 Facebook | 加回 `focus-visible` 外框、拿掉電話欄位、訊息改導向 GitHub 與履歷，並說明內容還在          | `Contact.tsx`                                                                         |
| P2   | 手機選單沒有 Esc、沒有焦點管理                              | 打開時焦點進到第一個連結，Esc 關閉並還給按鈕                                               | `Nav.tsx`                                                                             |
| P3   | 動態按鈕同時改文字與 `aria-pressed`，狀態被念兩次           | 文字固定為「減少動態」，狀態只用 `aria-pressed`                                            | `MotionToggle.tsx`                                                                    |
| P3   | 「↗」符號當圖示、輸入游標是預設色                           | 改用 lucide 圖示；`caret-color` 用 `biolum`                                                | `About.tsx`、`styles/index.css`                                                       |
| P3   | 減少動態時全域把 transition 歸零（audit 會扣分）            | 只停動畫與位移，顏色與透明度的轉場保留                                                     | `styles/index.css`                                                                    |

## 沒有採納（以及原因）

- **加 Email、LinkedIn，Facebook 移到最後或拿掉**：這是公開聯絡方式的決定，需要你提供要放的 Email／LinkedIn。目前只把順序改成 GitHub → 履歷 → Facebook。
- **首頁寫「我在找什麼」**：需要你的實際求職方向，我不替你寫。
- **拿掉 stock-analysis-app**（審視認為內容太空）：這是你指定要放的作品，保留；建議補 1–2 句實際功能。
- **作品卡片改成「採樣標籤／測站紀錄」樣式**（審視的開放問題）：是更大的視覺方向調整，值得做但超出這次範圍，列為下一步。
- **把目前職位移到首頁**：經歷最後一筆寫的是「Agent 工具與自架服務（個人專案）」，需要你確認現況後再決定是否前移。

Questions skipped: 作者這次不在線上即時回覆，需要你決定的事項整理在上一節。

## 重現方式

```bash
npx impeccable install -y --providers=claude --scope=project --no-hooks
npm run build && npm run preview
# 另一個終端機（root 環境下 Chrome 需要 --no-sandbox，可用包裝腳本指定給 IMPECCABLE_BROWSER）
.claude/skills/impeccable/scripts/impeccable detect --json --viewport 1280x800 "http://localhost:4173/?test=1&tier=1"
.claude/skills/impeccable/scripts/impeccable detect --json --viewport 390x844 "http://localhost:4173/?test=1&tier=1"
```
