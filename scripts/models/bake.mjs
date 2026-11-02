// 攝影測量模型的「烘成頂點色」：
// 這類模型常是三角形湯（每個三角形三個獨立頂點，UV 不連續），一般的焊接合併不了頂點，減面也就減不下去；
// 而且好幾張 4096 貼圖遠超出預算。做法是把貼圖顏色取樣到頂點、丟掉 UV 與貼圖，
// 再只依位置焊接（顏色取平均），之後就能正常減面，成品只剩位置、法線、頂點色。
import sharp from 'sharp';

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

async function decode(texture) {
  const { data, info } = await sharp(Buffer.from(texture.getImage()))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

function sample(img, u, v) {
  // glTF UV：原點在左上；超出 [0,1] 時 repeat
  u -= Math.floor(u);
  v -= Math.floor(v);
  const x = Math.min(img.w - 1, Math.floor(u * img.w));
  const y = Math.min(img.h - 1, Math.floor(v * img.h));
  const i = (y * img.w + x) * 4;
  return [img.data[i] / 255, img.data[i + 1] / 255, img.data[i + 2] / 255];
}

/** 把整個場景合成一個頂點色網格，回傳新的 primitive 數量資訊 */
export async function bakeToVertexColors(doc) {
  const root = doc.getRoot();
  const scene = root.listScenes()[0];
  const cache = new Map();
  const pos = [];
  const col = [];
  const v = [0, 0, 0];

  for (const node of root.listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    const m = node.getWorldMatrix();
    for (const prim of mesh.listPrimitives()) {
      const P = prim.getAttribute('POSITION');
      const UV = prim.getAttribute('TEXCOORD_0');
      const mat = prim.getMaterial();
      const tex = mat?.getBaseColorTexture();
      const factor = mat?.getBaseColorFactor() ?? [1, 1, 1, 1];
      if (tex && !cache.has(tex)) cache.set(tex, await decode(tex));
      const img = tex ? cache.get(tex) : null;
      const idx = prim.getIndices();
      const n = idx ? idx.getCount() : P.getCount();
      for (let k = 0; k < n; k++) {
        const i = idx ? idx.getScalar(k) : k;
        P.getElement(i, v);
        pos.push(
          m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12],
          m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13],
          m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14],
        );
        let c = [1, 1, 1];
        if (img && UV) {
          const uv = UV.getElement(i, [0, 0]);
          c = sample(img, uv[0], uv[1]);
        }
        col.push(...c.map((x, j) => srgbToLinear(x) * factor[j]));
      }
    }
  }

  // 只依位置焊接：格點 = 包圍盒最長邊的 1e-5
  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.length; i += 3)
    for (let a = 0; a < 3; a++) {
      min[a] = Math.min(min[a], pos[i + a]);
      max[a] = Math.max(max[a], pos[i + a]);
    }
  const cell = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]) * 1e-5;
  const map = new Map();
  const outPos = [];
  const sum = [];
  const cnt = [];
  const indices = [];
  for (let i = 0; i < pos.length / 3; i++) {
    const key = `${Math.round(pos[i * 3] / cell)},${Math.round(pos[i * 3 + 1] / cell)},${Math.round(pos[i * 3 + 2] / cell)}`;
    let j = map.get(key);
    if (j === undefined) {
      j = cnt.length;
      map.set(key, j);
      outPos.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
      sum.push(0, 0, 0);
      cnt.push(0);
    }
    for (let a = 0; a < 3; a++) sum[j * 3 + a] += col[i * 3 + a];
    cnt[j]++;
    indices.push(j);
  }
  // 丟掉焊接後退化的三角形
  const tri = [];
  for (let i = 0; i < indices.length; i += 3) {
    const [a, b, c] = [indices[i], indices[i + 1], indices[i + 2]];
    if (a !== b && b !== c && a !== c) tri.push(a, b, c);
  }
  const outCol = sum.map((s, i) => s / cnt[Math.floor(i / 3)]);

  // 換掉整個場景
  for (const node of root.listNodes()) node.dispose();
  for (const mesh of root.listMeshes()) mesh.dispose();
  const buffer = root.listBuffers()[0];
  const material = doc
    .createMaterial('baked')
    .setBaseColorFactor([1, 1, 1, 1])
    .setRoughnessFactor(0.85)
    .setMetallicFactor(0)
    .setDoubleSided(true);
  const prim = doc
    .createPrimitive()
    .setMaterial(material)
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(outPos)).setBuffer(buffer))
    .setAttribute('COLOR_0', doc.createAccessor().setType('VEC3').setArray(new Float32Array(outCol)).setBuffer(buffer))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(tri)).setBuffer(buffer));
  const node = doc.createNode('baked').setMesh(doc.createMesh('baked').addPrimitive(prim));
  for (const child of scene.listChildren()) scene.removeChild(child);
  scene.addChild(node);
  return { vertices: cnt.length, tris: tri.length / 3 };
}

/** 依面積加權算平滑法線（減面之後再算，烘焙模式沒有法線） */
export function computeNormals(doc) {
  for (const mesh of doc.getRoot().listMeshes())
    for (const prim of mesh.listPrimitives()) {
      const P = prim.getAttribute('POSITION').getArray();
      const I = prim.getIndices().getArray();
      const N = new Float32Array(P.length);
      for (let i = 0; i < I.length; i += 3) {
        const [a, b, c] = [I[i] * 3, I[i + 1] * 3, I[i + 2] * 3];
        const e1 = [P[b] - P[a], P[b + 1] - P[a + 1], P[b + 2] - P[a + 2]];
        const e2 = [P[c] - P[a], P[c + 1] - P[a + 1], P[c + 2] - P[a + 2]];
        const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
        for (const o of [a, b, c]) for (let k = 0; k < 3; k++) N[o + k] += n[k];
      }
      for (let i = 0; i < N.length; i += 3) {
        const l = Math.hypot(N[i], N[i + 1], N[i + 2]) || 1;
        N[i] /= l;
        N[i + 1] /= l;
        N[i + 2] /= l;
      }
      prim.setAttribute(
        'NORMAL',
        doc.createAccessor().setType('VEC3').setArray(N).setBuffer(doc.getRoot().listBuffers()[0]),
      );
    }
}
