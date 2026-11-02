import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  Box3,
  IcosahedronGeometry,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
  type Group,
  type Object3D,
  type ShaderMaterial,
} from 'three';
import { FAUNA } from '@/content/fauna';
import { flags } from '@/lib/env';
import { useSiteStore } from '@/store/useSiteStore';
import { floorHeight, rockJitter } from './floor';
import { FLOOR_Y, rigY, sectionWeight } from './path';
import { holdWork, loadModel, releaseWork } from './models';
import { isFrozen, sceneTime } from './time';
import { scanMaterial } from './scanMaterial';

/**
 * 分層代表生物（content/fauna.ts）在場景裡的擺法。
 * 每一筆是一個實例：跟某一段走（y 用 rigY 做視差），或固定在海床上（floor）。
 * 模型的「頭」朝哪個軸：攝影測量的魚頭朝 -x、雀鯛朝 +z；擺尾 shader 依這個決定哪一端是尾巴。
 *
 * 所有生物都用 scanMaterial（和海床等深線同一套「被聲納掃出來」的語言），不用模型原本的顏色。
 * 每隻只在自己那一段出現（sectionWeight 寬 0.45，段落交界時不會兩段的生物同框），而且擺在該段 DOM 留下的空位：
 * 礁在 About 左下、柳珊瑚在 Skills 左下角、管水母在作品段右緣、鮟鱇在經歷段左半 YEAR 下方的空白。
 */
type Motion = 'swim' | 'drift' | 'still' | 'crawl';
interface Placement {
  species: string;
  section: number;
  pos: [number, number, number];
  /** 直式螢幕的位置（畫面窄，往中間收） */
  portrait?: [number, number, number];
  scale: number;
  yaw?: number;
  motion: Motion;
  head?: 'x-' | 'z+';
  /** 游動的橢圓半徑與速度 */
  orbit?: [number, number, number];
  floor?: boolean;
}

const PLACEMENTS: Placement[] = [
  // 透光帶礁區：畫面左下、文字欄下緣的一塊礁，兩隻隆頭魚在礁上方繞
  {
    species: 'brain-coral',
    section: 1,
    pos: [-12, -6.4, -22],
    portrait: [-3.2, -10.5, -22],
    scale: 3,
    yaw: 0.6,
    motion: 'still',
  },
  {
    species: 'pavona-coral',
    section: 1,
    pos: [-7.5, -6.8, -21],
    portrait: [0.8, -10.8, -21],
    scale: 3.2,
    yaw: 2.1,
    motion: 'still',
  },
  {
    species: 'snooty-wrasse',
    section: 1,
    pos: [-8.5, -3.6, -20],
    portrait: [-0.8, -7.6, -20],
    scale: 2.8,
    motion: 'swim',
    head: 'x-',
    orbit: [3.4, 1.6, 0.16],
  },
  {
    species: 'red-naped-wrasse',
    section: 1,
    pos: [-11, -4.6, -18],
    portrait: [-2, -8.6, -18],
    scale: 2.1,
    motion: 'swim',
    head: 'x-',
    orbit: [2.4, 1.2, -0.22],
  },
  // 透光帶下緣：左下角的柳珊瑚（右邊是技能的雙螺旋）
  {
    species: 'sea-fan',
    section: 2,
    pos: [-13, -7.6, -20],
    portrait: [-4, -11, -20],
    scale: 4,
    yaw: 0.4,
    motion: 'drift',
  },
  // 中層帶：作品卡片右緣、儀表下方，遠處慢慢漂的管水母
  {
    species: 'siphonophore',
    section: 3,
    pos: [13, -3.5, -26],
    portrait: [3.5, 7, -28],
    scale: 8,
    yaw: -0.5,
    motion: 'drift',
  },
  // 深層帶：經歷段左半、YEAR 下方的空白，一隻鮟鱇緩慢游，誘餌是全段唯一的暖色光
  {
    species: 'anglerfish',
    section: 4,
    pos: [-7.4, -4.6, -14],
    portrait: [5.6, 2, -22],
    scale: 2.6,
    motion: 'swim',
    head: 'x-',
    orbit: [0.8, 0.4, 0.08],
  },
  // 海床：一隻大王具足蟲在泥上爬
  {
    species: 'giant-isopod',
    section: 5,
    pos: [3.5, 0, -19],
    portrait: [0.5, 0, -20],
    scale: 4,
    yaw: 0.5,
    motion: 'crawl',
    floor: true,
  },
];

/** 礁區的岩坡，珊瑚擺在上面 */
function reefRock() {
  const g = new IcosahedronGeometry(1, 2);
  const p = g.attributes.position!;
  const v = new Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const k = 0.82 + rockJitter(v.x, v.y, v.z, 61) * 0.3;
    p.setXYZ(i, v.x * k, v.y * k, v.z * k);
  }
  g.computeVertexNormals();
  return g;
}

const box = new Box3();
const lurePos = new Vector3();
const ndc = new Vector3();
const bulbGeo = new SphereGeometry(1, 12, 8);

function Creature({ p, enabled, tier }: { p: Placement; enabled: boolean; tier: number }) {
  const species = FAUNA.find((f) => f.id === p.species)!;
  const slug = species.model!;
  const group = useRef<Group>(null);
  const lure = useRef<Mesh>(null);
  const mats = useRef<ShaderMaterial[]>([]);
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);
  const [model, setModel] = useState<Object3D | null>(null);
  const bulbMat = useMemo(() => new MeshBasicMaterial({ color: '#ffb86b', toneMapped: false, fog: false }), []);
  const lureLocal = useRef(new Vector3());
  const allowed = tier >= 2 || species.primary === true;

  useEffect(() => {
    if (!enabled || !allowed || model) return;
    let alive = true;
    holdWork();
    void loadModel(slug)
      .then(async (src) => {
        const obj = src.clone(true);
        box.setFromObject(obj);
        mats.current = [];
        obj.traverse((o) => {
          if (!(o as Mesh).isMesh) return;
          const mesh = o as Mesh;
          mesh.frustumCulled = false;
          const g = mesh.geometry;
          g.computeBoundingBox();
          const bb = g.boundingBox!;
          const sway =
            p.motion === 'swim' && p.head
              ? {
                  head: p.head,
                  axis: (p.head === 'x-' ? [bb.min.x, bb.max.x] : [bb.min.z, bb.max.z]) as [number, number],
                }
              : undefined;
          // 掃描線間距依顯示大小換算，大小不同的生物看起來是同一把尺掃出來的
          const mat = scanMaterial({
            spacing: 0.11 * (p.scale / 3),
            lines: p.species === 'siphonophore' ? 0.35 : 0.6,
            opacity: p.species === 'siphonophore' ? 0.55 : 1,
            sway,
          });
          mesh.material = mat;
          mats.current.push(mat);
        });
        if (p.species === 'anglerfish') {
          // 誘餌在頭頂前端（模型頭朝 -x，已正規化成最長邊 1、底部貼 y=0）
          box.setFromObject(obj);
          lureLocal.current.set(box.min.x + 0.03, box.max.y - 0.04, (box.min.z + box.max.z) / 2);
        }
        await gl.compileAsync(obj, camera, scene).catch(() => undefined);
        if (alive) setModel(obj);
        else releaseWork();
      })
      .catch(() => {
        // 模型抓不到就不顯示，場景其他部分照常
        releaseWork();
      });
    return () => {
      alive = false;
    };
  }, [enabled, allowed, model, slug, p, gl, camera, scene]);

  // 掛進場景之後才算完成（測試模式等這個）
  useEffect(() => {
    if (!model) return;
    invalidate();
    releaseWork();
  }, [model, invalidate]);

  useFrame((state) => {
    const g = group.current;
    if (!g || !model) return;
    const { pos } = useSiteStore.getState();
    const w = sectionWeight(pos, p.section, p.floor ? 1.2 : 0.45);
    g.visible = w > 0.001;
    if (!g.visible) return;
    const t = sceneTime(state);
    for (const m of mats.current) m.uniforms.uTime!.value = t;
    const portrait = size.width < size.height;
    const [x, y, z] = portrait && p.portrait ? p.portrait : p.pos;
    const baseY = p.floor ? FLOOR_Y + floorHeight(x, z) : rigY(pos, p.section, 10) + y;
    let px = x;
    let py = baseY;
    let pz = z;
    let yaw = p.yaw ?? 0;

    if (p.motion === 'swim' && p.orbit) {
      const [rx, rz, speed] = p.orbit;
      const a = t * speed + p.pos[0];
      px += Math.cos(a) * rx;
      pz += Math.sin(a) * rz;
      py += Math.sin(t * 0.5 + p.pos[2]) * 0.35;
      // 朝切線方向游：模型的頭是 -x 或 +z，換成對應的偏航角
      const dx = -Math.sin(a) * rx * Math.sign(speed);
      const dz = Math.cos(a) * rz * Math.sign(speed);
      const heading = Math.atan2(dx, dz);
      yaw = p.head === 'x-' ? heading + Math.PI / 2 : heading;
    } else if (p.motion === 'drift') {
      py += Math.sin(t * 0.3 + x) * 0.5;
      yaw += Math.sin(t * 0.12) * 0.25;
    } else if (p.motion === 'crawl') {
      // 很慢地往前爬一小段再停（凍結時停在原地）
      const step = isFrozen() ? 0 : (Math.sin(t * 0.15) * 0.5 + 0.5) * 1.6;
      px += Math.sin(yaw) * step;
      pz += Math.cos(yaw) * step;
      py = FLOOR_Y + floorHeight(px, pz);
    }
    g.position.set(px, py, pz);
    g.rotation.set(0, yaw, 0);
    g.scale.setScalar(p.scale * MathUtils.lerp(0.85, 1, w));

    if (lure.current) {
      // 游標靠近誘餌時變亮：在螢幕空間量距離
      lurePos.copy(lureLocal.current);
      g.localToWorld(lurePos);
      lure.current.position.copy(lurePos);
      ndc.copy(lurePos).project(state.camera);
      const d = Math.hypot(ndc.x - state.pointer.x, ndc.y - state.pointer.y);
      const near = isFrozen() ? 0 : 1 - MathUtils.smoothstep(d, 0.08, 0.45);
      const flicker = isFrozen() ? 0 : Math.sin(t * 3.1) * 0.08 + Math.sin(t * 7.7) * 0.04;
      // 誘餌：發光的小球（bloom 會讓它暈開），游標靠近時變大變亮
      lure.current.scale.setScalar(p.scale * (0.022 + 0.016 * near) * (1 + flicker));
      bulbMat.color.setRGB(1.4 + near * 1.6, 0.75 + near * 0.6, 0.35, SRGBColorSpace);
    }
  });

  if (!model) return null;
  return (
    <>
      <group ref={group}>
        <primitive object={model} />
      </group>
      {p.species === 'anglerfish' && <mesh ref={lure} geometry={bulbGeo} material={bulbMat} frustumCulled={false} />}
    </>
  );
}

/** 礁區岩坡：不是模型，程序幾何，礁區的珊瑚擺在上面 */
function ReefRock() {
  const mesh = useRef<Mesh>(null);
  const size = useThree((s) => s.size);
  const { geometry, material } = useMemo(
    () => ({
      geometry: reefRock(),
      material: scanMaterial({ spacing: 0.2, lines: 0.45 }),
    }),
    [],
  );
  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const { pos } = useSiteStore.getState();
    m.visible = sectionWeight(pos, 1, 0.45) > 0.001;
    if (!m.visible) return;
    const portrait = size.width < size.height;
    m.position.set(portrait ? -1 : -10, rigY(pos, 1, 10) + (portrait ? -13.6 : -9.6), portrait ? -22 : -22);
  });
  return <mesh ref={mesh} geometry={geometry} material={material} scale={[6.5, 3, 4.5]} rotation-y={0.4} />;
}

/** 先載入鄰近段落的模型，場景就緒後閒置時再載其他段；測試模式一次全部載入，視覺基準才穩 */
export default function Fauna({ tier }: { tier: number }) {
  const [near, setNear] = useState<Set<number>>(() => new Set(flags.test ? [0, 1, 2, 3, 4, 5] : []));

  useEffect(() => {
    if (flags.test) return;
    const update = (pos: number) => {
      const s = Math.floor(pos);
      setNear((prev) => {
        const want = [s - 1, s, s + 1, s + 2].filter((i) => i >= 0 && !prev.has(i));
        if (!want.length) return prev;
        return new Set([...prev, ...want]);
      });
    };
    update(useSiteStore.getState().pos);
    // 場景就緒後，趁閒置把其他段的模型也先載好、編譯好：不要在捲進新段落的那一刻才下載與編譯 shader（會頓一下）
    let idle = 0;
    const prefetch = () => {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      const all = () => setNear(new Set([0, 1, 2, 3, 4, 5]));
      idle = w.requestIdleCallback ? w.requestIdleCallback(all, { timeout: 4000 }) : window.setTimeout(all, 2000);
    };
    if (useSiteStore.getState().sceneReady) prefetch();
    const unsub = useSiteStore.subscribe((st, prev) => {
      if (Math.floor(st.pos) !== Math.floor(prev.pos)) update(st.pos);
      if (st.sceneReady && !prev.sceneReady) prefetch();
    });
    return () => {
      unsub();
      window.cancelIdleCallback?.(idle);
      window.clearTimeout(idle);
    };
  }, []);

  return (
    <group>
      <ReefRock />
      {PLACEMENTS.map((p, i) => (
        <Creature key={`${p.species}-${i}`} p={p} enabled={near.has(p.section)} tier={tier} />
      ))}
    </group>
  );
}
