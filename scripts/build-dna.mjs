// 技能雙螺旋的真實資料：RCSB PDB 1BNA（B-DNA 十二聚體 CGCGAATTCGCG，Drew et al. 1981, PNAS 78:2179）
// 讀 raw/1BNA.pdb → 取每個鹼基對的主鏈磷原子（P；5′ 端沒有 P 用 O5′）與 C1′ → 對齊螺旋軸 →
// 沿軸接三份成 36 bp → 寫 src/assets/dna-1bna.json（單位 Å，四捨五入到 0.01）。
// 用法：curl -o raw/1BNA.pdb https://files.rcsb.org/download/1BNA.pdb && node scripts/build-dna.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = 'raw/1BNA.pdb';
const OUT = 'src/assets/dna-1bna.json';
const COPIES = 3;

const atoms = readFileSync(SRC, 'utf8')
  .split('\n')
  .filter((l) => l.startsWith('ATOM'))
  .map((l) => ({
    name: l.slice(12, 16).trim(),
    res: l.slice(17, 20).trim(),
    chain: l.slice(21, 22),
    seq: Number(l.slice(22, 26)),
    p: [Number(l.slice(30, 38)), Number(l.slice(38, 46)), Number(l.slice(46, 54))],
  }));

const residue = (chain, seq) => atoms.filter((a) => a.chain === chain && a.seq === seq);
const pick = (res, ...names) => {
  for (const n of names) {
    const a = res.find((x) => x.name === n);
    if (a) return a.p;
  }
  throw new Error(`missing ${names.join('/')} in ${res[0]?.chain}${res[0]?.seq}`);
};

// A1..A12 與 B24..B13 反向配對
const N = 12;
const pairs = [];
for (let i = 1; i <= N; i++) {
  const a = residue('A', i);
  const b = residue('B', 25 - i);
  pairs.push({
    base: a[0].res.replace('D', ''),
    pA: pick(a, 'P', "O5'"),
    pB: pick(b, 'P', "O5'"),
    cA: pick(a, "C1'"),
    cB: pick(b, "C1'"),
  });
}

// 螺旋軸：鹼基對中點（C1′ 中點）的主成分方向
const sub = (u, v) => u.map((x, i) => x - v[i]);
const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);
const norm = (u) => u.map((x) => x / Math.hypot(...u));
const mids = pairs.map((p) => p.cA.map((x, i) => (x + p.cB[i]) / 2));
const all = pairs.flatMap((p) => [p.pA, p.pB, p.cA, p.cB]);
const center = all[0].map((_, i) => all.reduce((s, p) => s + p[i], 0) / all.length);
let axis = norm(sub(mids[N - 1], mids[0]));
// 幾次冪迭代把方向修正到主成分
for (let k = 0; k < 20; k++) {
  const acc = [0, 0, 0];
  for (const m of mids) {
    const d = sub(m, center);
    const s = dot(d, axis);
    for (let i = 0; i < 3; i++) acc[i] += d[i] * s;
  }
  axis = norm(acc);
}
// 以軸為 y 的正交基底
const tmp = Math.abs(axis[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
const ex = norm([
  axis[1] * tmp[2] - axis[2] * tmp[1],
  axis[2] * tmp[0] - axis[0] * tmp[2],
  axis[0] * tmp[1] - axis[1] * tmp[0],
]);
const ez = [axis[1] * ex[2] - axis[2] * ex[1], axis[2] * ex[0] - axis[0] * ex[2], axis[0] * ex[1] - axis[1] * ex[0]];
const local = (p) => {
  const d = sub(p, center);
  return [dot(d, ex), dot(d, axis), dot(d, ez)];
};
const L = pairs.map((p) => ({ base: p.base, pA: local(p.pA), pB: local(p.pB), cA: local(p.cA), cB: local(p.cB) }));

// 每個鹼基對的上升與扭轉（由 C1′ 連線的方向角算）
const angle = (p) => Math.atan2(p.cA[2] - p.cB[2], p.cA[0] - p.cB[0]);
let twist = 0;
for (let i = 1; i < N; i++) {
  let d = angle(L[i]) - angle(L[i - 1]);
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  twist += d;
}
twist /= N - 1;
const midY = (p) => (p.cA[1] + p.cB[1]) / 2;
const rise = (midY(L[N - 1]) - midY(L[0])) / (N - 1);

// 接三份：每一份沿軸平移 12·rise、繞軸轉 12·twist
const rot = (p, th, dy) => [
  p[0] * Math.cos(th) - p[2] * Math.sin(th),
  p[1] + dy,
  p[0] * Math.sin(th) + p[2] * Math.cos(th),
];
const r2 = (p) => p.map((x) => Math.round(x * 100) / 100);
const out = [];
for (let k = 0; k < COPIES; k++) {
  const th = k * N * twist;
  const dy = k * N * rise;
  for (const p of L)
    out.push({
      base: p.base,
      pA: r2(rot(p.pA, th, dy)),
      pB: r2(rot(p.pB, th, dy)),
      cA: r2(rot(p.cA, th, dy)),
      cB: r2(rot(p.cB, th, dy)),
    });
}
// 置中到原點
const ys = out.flatMap((p) => [p.pA[1], p.pB[1]]);
const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
for (const p of out) for (const k of ['pA', 'pB', 'cA', 'cB']) p[k][1] = Math.round((p[k][1] - cy) * 100) / 100;

const json = {
  source: 'RCSB PDB 1BNA · Drew, Wing, Takano, Broka, Tanaka, Itakura & Dickerson (1981) PNAS 78:2179',
  sequence: L.map((p) => p.base).join(''),
  copies: COPIES,
  riseA: Math.round(rise * 1000) / 1000,
  twistDeg: Math.round(((twist * 180) / Math.PI) * 100) / 100,
  pairs: out,
};
writeFileSync(OUT, JSON.stringify(json) + '\n');
console.log(
  `${OUT}: ${json.sequence} × ${COPIES}, rise ${json.riseA} Å, twist ${json.twistDeg}°, ${JSON.stringify(json).length} bytes`,
);
