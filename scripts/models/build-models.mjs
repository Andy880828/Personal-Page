// 模型素材管線：raw/models/<slug>/scene.gltf → public/models/<slug>.glb
// 步驟：丟輔助網格 → 攤平節點 → 依材質合併 → 去重、焊接 → meshopt 減面 → 置中、縮成最長邊 1
//       → 只留指定貼圖並縮成 WebP → meshopt 壓縮（含量化）
// 用法：node scripts/models/build-models.mjs [slug...]（不給 slug 就全部重建）
// 原始素材：Personal-Page release raw-models-v1 的 zip，各自解壓到 raw/models/<slug>/，同資料夾 source.txt 寫來源與授權
import { NodeIO, getBounds } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, flatten, join, meshopt, prune, simplify, textureCompress, weld } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { MAX_GLB_BYTES, MODELS } from './models.config.mjs';
import { bakeToVertexColors, computeNormals } from './bake.mjs';

const RAW = 'raw/models';
const OUT = 'public/models';

const SLOTS = {
  baseColor: ['getBaseColorTexture', 'setBaseColorTexture'],
  normal: ['getNormalTexture', 'setNormalTexture'],
  emissive: ['getEmissiveTexture', 'setEmissiveTexture'],
  metallicRoughness: ['getMetallicRoughnessTexture', 'setMetallicRoughnessTexture'],
  occlusion: ['getOcclusionTexture', 'setOcclusionTexture'],
};

const countTris = (doc) => {
  let n = 0;
  for (const mesh of doc.getRoot().listMeshes())
    for (const p of mesh.listPrimitives())
      n += (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3;
  return Math.round(n);
};

/** 把整個場景包進一個節點：置中到原點、底部貼 y=0、最長邊縮成 1 */
function normalize(doc) {
  const scene = doc.getRoot().listScenes()[0];
  const { min, max } = getBounds(scene);
  const size = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
  const s = 1 / size;
  const root = doc.createNode('root').setScale([s, s, s]);
  root.setTranslation([-((min[0] + max[0]) / 2) * s, -min[1] * s, -((min[2] + max[2]) / 2) * s]);
  for (const child of scene.listChildren()) {
    scene.removeChild(child);
    root.addChild(child);
  }
  scene.addChild(root);
}

async function build(slug, spec, io) {
  const src = `${RAW}/${slug}/scene.gltf`;
  if (!existsSync(src)) {
    console.warn(`- ${slug}: 找不到 ${src}，略過（下載 release raw-models-v1 解壓到 ${RAW}/${slug}/）`);
    return null;
  }
  const doc = await io.read(src);
  const before = countTris(doc);

  // 1. 輔助網格（≤ 12 個三角形的方塊、平面）
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    const tris = mesh.listPrimitives().reduce((a, p) => a + (p.getIndices()?.getCount() ?? 0) / 3, 0);
    if (tris <= 12) node.dispose();
  }

  // 2. 貼圖槽與材質
  for (const mat of doc.getRoot().listMaterials()) {
    // 烘焙模式要先用 baseColor 取樣，貼圖留到烘完才整個換掉
    if (!spec.bake) for (const [slot, [, set]] of Object.entries(SLOTS)) if (!spec.maps.includes(slot)) mat[set](null);
    if (!spec.blend) mat.setAlphaMode('OPAQUE');
    mat.setDoubleSided(true);
  }

  if (spec.bake) {
    await doc.transform(prune());
    await bakeToVertexColors(doc);
  } else {
    // keepNodes：組合包（軟珊瑚一組 24 個）保留各自的節點，網站端再把它們散開擺
    await doc.transform(prune(), flatten(), ...(spec.keepNodes ? [] : [join({ keepNamed: false })]), dedup(), weld());
  }

  // 3. 減面
  if (spec.tris) {
    await MeshoptSimplifier.ready;
    const ratio = Math.min(1, spec.tris / countTris(doc));
    await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio, error: spec.error ?? 0.05 }));
  }

  if (spec.bake) computeNormals(doc);
  normalize(doc);

  // 4. 貼圖 → WebP；5. meshopt 壓縮
  const steps = [prune()];
  if (spec.texture) {
    steps.push(
      textureCompress({ encoder: sharp, targetFormat: 'webp', quality: 72, resize: [spec.texture, spec.texture] }),
    );
  }
  await MeshoptEncoder.ready;
  steps.push(meshopt({ encoder: MeshoptEncoder, level: 'high' }));
  await doc.transform(...steps);

  const out = `${OUT}/${slug}.glb`;
  await io.write(out, doc);
  const bytes = statSync(out).size;
  return { slug, before, after: countTris(doc), bytes };
}

/** source.txt（Sketchfab 附的 license.txt）→ LICENSES.md 一列 */
function licenseRow(slug) {
  const txt = readFileSync(`${RAW}/${slug}/source.txt`, 'utf8');
  const pick = (k) => txt.match(new RegExp(`\\* ${k}:\\s*(.+)`))?.[1]?.trim() ?? '';
  const author = pick('author').replace(/\s*\((https?:[^)]+)\)/, '');
  const authorUrl = pick('author').match(/\((https?:[^)]+)\)/)?.[1] ?? '';
  const license = pick('license type').replace(/\s*\(.+\)/, '');
  const title = pick('title')
    .replace(/[^\p{L}\p{N}\s.,()'-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  return `| \`${slug}.glb\` | [${title}](${pick('source')}) | [${author}](${authorUrl}) | ${license} |`;
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder': (await import('meshoptimizer')).MeshoptDecoder,
  'meshopt.encoder': MeshoptEncoder,
});
mkdirSync(OUT, { recursive: true });

const only = process.argv.slice(2);
const results = [];
for (const [slug, spec] of Object.entries(MODELS)) {
  if (only.length && !only.includes(slug)) continue;
  const r = await build(slug, spec, io);
  if (r) results.push(r);
}

let failed = false;
for (const r of results) {
  const over = r.bytes > MAX_GLB_BYTES;
  failed ||= over;
  console.log(
    `${over ? '✗' : '✓'} ${r.slug.padEnd(18)} ${String(r.before).padStart(8)} → ${String(r.after).padStart(6)} 三角形  ${(r.bytes / 1024).toFixed(0).padStart(4)} KB`,
  );
}

// 全部重建時才重寫授權表（只建一個時不動，避免漏列）
if (!only.length) {
  const rows = Object.keys(MODELS)
    .filter((slug) => existsSync(`${RAW}/${slug}/source.txt`))
    .map(licenseRow);
  writeFileSync(
    `${OUT}/LICENSES.md`,
    `# 模型授權\n\n由 \`scripts/models/build-models.mjs\` 依 \`raw/models/<slug>/source.txt\` 產生，不要手改。\n` +
      `每個 GLB 都經過減面、貼圖縮小與壓縮，屬於原作的改作；CC-BY-NC-SA 的改作沿用同一授權，只用於這個非商業的個人網站。\n\n` +
      `| 檔案 | 原作 | 作者 | 授權 |\n|---|---|---|---|\n${rows.join('\n')}\n`,
  );
}
if (failed) {
  console.error(`有模型超過 ${MAX_GLB_BYTES / 1024} KB`);
  process.exit(1);
}
