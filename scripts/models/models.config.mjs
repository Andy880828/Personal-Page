// 每個模型的處理參數。原始檔在 raw/models/<slug>/（gitignore，來源見 Personal-Page 的 release raw-models-v1），
// 成品寫到 public/models/<slug>.glb。
//
// tris：減面後的目標三角形數（低多邊形模型設 null，不減面只壓縮）
// texture：貼圖最長邊（WebP）；maps：要保留的貼圖槽，其餘丟掉（深海很暗，法線與粗糙度貼圖的效益小於檔案大小）
// blend：保留半透明（管水母）
// keepNodes：組合包保留各自的節點（不合併），網站端再散開擺
// bake：攝影測量的三角形湯 → 貼圖烘成頂點色、只依位置焊接後再減面（見 bake.mjs），成品沒有貼圖

/** @typedef {{ tris: number | null, texture: number, maps: string[], blend?: boolean, bake?: boolean, keepNodes?: boolean, error?: number }} ModelSpec */

/** @type {Record<string, ModelSpec>} */
export const MODELS = {
  // 礁區（About 10–100 m）
  'snooty-wrasse': { tris: 8000, texture: 0, maps: [], bake: true },
  'red-naped-wrasse': { tris: 8000, texture: 0, maps: [], bake: true },
  damselfish: { tris: null, texture: 512, maps: ['baseColor'] },
  'brain-coral': { tris: 8000, texture: 0, maps: [], bake: true },
  'pavona-coral': { tris: 8000, texture: 0, maps: [], bake: true },
  coral: { tris: null, texture: 0, maps: [] },
  'soft-coral-set': { tris: 8000, texture: 256, maps: ['baseColor'], keepNodes: true },
  // 中層帶（Projects 200–1000 m）
  siphonophore: { tris: 8000, texture: 0, maps: [], bake: true, blend: true },
  // 深層帶（Experience 1000–3800 m）
  anglerfish: { tris: 8000, texture: 512, maps: ['baseColor', 'emissive'] },
  // 海床（Contact 3800–4000 m）
  'giant-isopod': { tris: 8000, texture: 0, maps: [], bake: true },
};

/** 每個 GLB 的上限；size-limit 另外量合計 */
export const MAX_GLB_BYTES = 200 * 1024;
