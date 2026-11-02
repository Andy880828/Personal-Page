import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  Box3,
  Color,
  IcosahedronGeometry,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  type Group,
  type Material,
  type Object3D,
  type PointLight,
} from 'three';
import { FAUNA } from '@/content/fauna';
import { flags } from '@/lib/env';
import { createRng, SCENE_SEED } from '@/lib/seed';
import { useSiteStore } from '@/store/useSiteStore';
import { floorHeight } from './floor';
import { FLOOR_Y, rigY, sectionWeight } from './path';
import { holdWork, loadModel, releaseWork } from './models';
import { isFrozen, sceneTime } from './time';

/**
 * 分層代表生物（content/fauna.ts）在場景裡的擺法。
 * 每一筆是一個實例：跟某一段走（y 用 rigY 做視差），或固定在海床上（floor）。
 * 模型的「頭」朝哪個軸：攝影測量的魚頭朝 -x、雀鯛朝 +z；擺尾 shader 依這個決定哪一端是尾巴。
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
  // 透光帶礁區：畫面左下的岩坡，隆頭魚與雀鯛在礁旁繞
  {
    species: 'brain-coral',
    section: 1,
    pos: [-11, -7.4, -21],
    portrait: [-4.5, -9, -21],
    scale: 3.2,
    yaw: 0.6,
    motion: 'still',
  },
  {
    species: 'pavona-coral',
    section: 1,
    pos: [-6.5, -7.6, -19],
    portrait: [-1.5, -9.2, -20],
    scale: 3.4,
    yaw: 2.1,
    motion: 'still',
  },
  {
    species: 'soft-coral',
    section: 1,
    pos: [-9, -6.6, -17],
    portrait: [-3, -8.2, -17],
    scale: 6,
    yaw: 0.9,
    motion: 'still',
  },
  {
    species: 'snooty-wrasse',
    section: 1,
    pos: [-6, -6, -17],
    portrait: [-1.5, -7.5, -18],
    scale: 3.2,
    motion: 'swim',
    head: 'x-',
    orbit: [4.5, 2.2, 0.16],
  },
  {
    species: 'red-naped-wrasse',
    section: 1,
    pos: [-10, -7, -15],
    portrait: [-3, -8.5, -16],
    scale: 2.4,
    motion: 'swim',
    head: 'x-',
    orbit: [3.2, 1.6, -0.22],
  },
  ...[0, 1, 2].map((i): Placement => ({
    species: 'damselfish',
    section: 1,
    pos: [-8 + i * 0.9, -4.2 + i * 0.5, -14 - i * 0.6],
    portrait: [-2 + i * 0.6, -4 + i * 0.5, -15 - i * 0.6],
    scale: 0.9,
    motion: 'swim',
    head: 'z+',
    orbit: [2.2 + i * 0.4, 1.2, 0.3 + i * 0.04],
  })),
  // 透光帶下緣：左下的柳珊瑚（右邊是技能的雙螺旋）
  {
    species: 'sea-fan',
    section: 2,
    pos: [-8.5, -7.5, -16],
    portrait: [-3.5, -9, -18],
    scale: 4.2,
    yaw: 0.4,
    motion: 'drift',
  },
  // 中層帶：遠處慢慢漂的管水母
  {
    species: 'siphonophore',
    section: 3,
    pos: [9, 0.5, -24],
    portrait: [3, 4, -26],
    scale: 10,
    yaw: -0.5,
    motion: 'drift',
  },
  // 深層帶：一隻鮟鱇在右側緩慢游，誘餌是唯一的暖色光
  {
    species: 'anglerfish',
    section: 4,
    pos: [5.2, -4.2, -12],
    portrait: [1.5, 2.5, -14],
    scale: 3,
    motion: 'swim',
    head: 'x-',
    orbit: [1.4, 0.6, 0.08],
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

/** 礁區的岩坡（低多邊形、扁平著色），珊瑚擺在上面 */
function reefRock() {
  const g = new IcosahedronGeometry(1, 2);
  const rng = createRng(SCENE_SEED + 61);
  const p = g.attributes.position!;
  const v = new Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const k = 0.82 + rng() * 0.3;
    p.setXYZ(i, v.x * k, v.y * k, v.z * k);
  }
  g.computeVertexNormals();
  return g;
}

/** 魚的擺尾：沿身體軸往尾巴越擺越大；尾端在哪一頭由 HEAD 決定 */
function addSwimSway(mat: Material, axis: { min: number; max: number }, head: 'x-' | 'z+', uTime: { value: number }) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.uniforms.uAxis = { value: [axis.min, axis.max] };
    const along = head === 'x-' ? 'position.x' : 'position.z';
    const side = head === 'x-' ? 'transformed.z' : 'transformed.x';
    const tail = head === 'x-' ? 't' : '(1.0 - t)';
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform vec2 uAxis;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float t = clamp((${along} - uAxis.x) / (uAxis.y - uAxis.x), 0.0, 1.0);
        float tl = ${tail};
        ${side} += sin(uTime * 7.0 - tl * 5.0) * (uAxis.y - uAxis.x) * 0.07 * tl * tl;`,
      );
  };
  mat.customProgramCacheKey = () => `sway-${head}`;
}

const box = new Box3();
const lurePos = new Vector3();
const ndc = new Vector3();

function Creature({ p, enabled, tier }: { p: Placement; enabled: boolean; tier: number }) {
  const species = FAUNA.find((f) => f.id === p.species)!;
  const slug = species.model!;
  const group = useRef<Group>(null);
  const lure = useRef<PointLight>(null);
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);
  const [model, setModel] = useState<Object3D | null>(null);
  const uTime = useMemo(() => ({ value: 0 }), []);
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
        obj.traverse((o) => {
          if (!(o as Mesh).isMesh) return;
          const mesh = o as Mesh;
          mesh.frustumCulled = false;
          const mat = (mesh.material as MeshStandardMaterial).clone();
          mesh.material = mat;
          if (p.species === 'siphonophore') {
            mat.transparent = true;
            mat.opacity = 0.6;
            mat.depthWrite = false;
            mat.emissive = new Color('#4ff0d2');
            mat.emissiveIntensity = 0.12;
          }
          if (p.motion === 'swim' && p.head) {
            const g = mesh.geometry;
            g.computeBoundingBox();
            const bb = g.boundingBox!;
            const axis = p.head === 'x-' ? { min: bb.min.x, max: bb.max.x } : { min: bb.min.z, max: bb.max.z };
            addSwimSway(mat, axis, p.head, uTime);
          }
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
  }, [enabled, allowed, model, slug, p, gl, camera, scene, uTime]);

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
    const w = sectionWeight(pos, p.section, p.floor ? 1.2 : 0.95);
    g.visible = w > 0.001;
    if (!g.visible) return;
    const t = sceneTime(state);
    uTime.value = t;
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
      const flicker = isFrozen() ? 0 : Math.sin(t * 3.1) * 0.6 + Math.sin(t * 7.7) * 0.3;
      lure.current.intensity = 5 + flicker + near * 22;
    }
  });

  if (!model) return null;
  return (
    <>
      <group ref={group}>
        <primitive object={model} />
      </group>
      {p.species === 'anglerfish' && <pointLight ref={lure} color="#ffb86b" distance={9} decay={1.8} intensity={5} />}
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
      material: new MeshStandardMaterial({ color: '#3d5a63', roughness: 0.95, flatShading: true }),
    }),
    [],
  );
  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const { pos } = useSiteStore.getState();
    m.visible = sectionWeight(pos, 1, 0.95) > 0.001;
    if (!m.visible) return;
    const portrait = size.width < size.height;
    m.position.set(portrait ? -3 : -9, rigY(pos, 1, 10) + (portrait ? -12 : -10.5), portrait ? -20 : -19);
  });
  return <mesh ref={mesh} geometry={geometry} material={material} scale={[7.5, 3.6, 5]} rotation-y={0.4} />;
}

/** 依段落鄰近才載入模型（前後各一段）；測試模式一次全部載入，視覺基準才穩 */
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
    return useSiteStore.subscribe((st, prev) => {
      if (Math.floor(st.pos) !== Math.floor(prev.pos)) update(st.pos);
    });
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
