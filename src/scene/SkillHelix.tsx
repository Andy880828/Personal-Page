import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import {
  Color,
  CylinderGeometry,
  InstancedMesh,
  MathUtils,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  SphereGeometry,
  Vector3,
  type Group,
} from 'three';
import dna from '@/assets/dna-1bna.json';
import { dnaSegment } from '@/lib/dna';
import { skills } from '@/content/skills';
import { useSiteStore } from '@/store/useSiteStore';
import { rigY, sectionWeight } from './path';
import { isFrozen, sceneDelta, sceneTime } from './time';

const SECTION = 2;
/** 1BNA 的座標單位是 Å；縮成場景單位（整條 36 bp 約 9.6 高、磷原子半徑約 0.8） */
const SCALE = 0.08;
const PAIRS = dna.pairs;
const BP = PAIRS.length;
/** 鹼基對 → 技能區段：由上而下（第一組技能在最上面，和左側分頁順序一樣） */
const SEG_BP = skills.map((_, s) => PAIRS.map((_, i) => i).filter((i) => dnaSegment(i, skills.length, BP) === s));
const HEIGHT = BP * dna.riseA * SCALE;
const RADIUS = 0.9;

const dummy = new Object3D();
const SLATE = new Color('#36566b');
const scratch = new Color();
const up = new Vector3(0, 1, 0);
const q = new Quaternion();
const va = new Vector3();
const vb = new Vector3();
const dir = new Vector3();

type P3 = readonly number[];
/** Å → 場景座標；scale 是選取時的徑向「膨脹」 */
function at(p: P3, scale: number, out: Vector3) {
  return out.set(p[0]! * SCALE * scale, p[1]! * SCALE, p[2]! * SCALE * scale);
}
/** 把單位高度、沿 y 的圓柱放到 a→b 之間 */
function stick(a: Vector3, b: Vector3) {
  dir.subVectors(b, a);
  const len = dir.length();
  dummy.position.copy(a).addScaledVector(dir, 0.5);
  q.setFromUnitVectors(up, dir.normalize());
  dummy.quaternion.copy(q);
  dummy.scale.set(1, len, 1);
  dummy.updateMatrix();
  return dummy.matrix;
}

interface Segment {
  id: string;
  color: Color;
  nodes: MeshStandardMaterial;
  rungs: MeshStandardMaterial;
}

/**
 * 技能的 DNA 雙螺旋：RCSB PDB 1BNA 的真實原子座標（scripts/build-dna.mjs 產生），接三份成 36 bp；
 * 五個技能區段像五個基因串在同一條序列上。
 * - hover 區段：變亮；點擊：切換左側分頁（共用 store 的 activeSkill）
 * - 拖曳：轉動螺旋；放開後慣性減速
 * 每個區段是三個 InstancedMesh（磷原子、鹼基對、主鏈），共 15 個 draw call。
 */
export default function SkillHelix() {
  const group = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const nodeMeshes = useRef<(InstancedMesh | null)[]>([]);
  const rungMeshes = useRef<(InstancedMesh | null)[]>([]);
  const linkMeshes = useRef<(InstancedMesh | null)[]>([]);
  const size = useThree((s) => s.size);
  const setActive = useSiteStore((s) => s.setActiveSkill);
  const setHover = useSiteStore((s) => s.setHoverSkill);
  const drag = useRef({ active: false, lastX: 0, vel: 0, angle: 0 });
  const scales = useRef<number[]>(skills.map(() => 1));

  const geo = useMemo(
    () => ({
      node: new SphereGeometry(0.11, 12, 10),
      rung: new CylinderGeometry(0.035, 0.035, 1, 6, 1),
      link: new CylinderGeometry(0.03, 0.03, 1, 5, 1),
      hit: new CylinderGeometry(RADIUS + 0.5, RADIUS + 0.5, HEIGHT + 1, 12, 1),
    }),
    [],
  );

  const segments = useMemo<Segment[]>(
    () =>
      skills.map((s) => {
        const color = new Color(s.color);
        return {
          id: s.id,
          color,
          nodes: new MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.25,
            roughness: 0.35,
            metalness: 0.1,
            toneMapped: true,
          }),
          rungs: new MeshStandardMaterial({
            color: color.clone().multiplyScalar(0.55),
            emissive: color,
            emissiveIntensity: 0.08,
            roughness: 0.6,
          }),
        };
      }),
    [],
  );

  /** 寫入某個區段的實例矩陣（1BNA 真實座標）；scale 用來做選取時的「膨脹」 */
  const layout = (seg: number, scale: number) => {
    const nodes = nodeMeshes.current[seg];
    const rungs = rungMeshes.current[seg];
    const links = linkMeshes.current[seg];
    if (!nodes || !rungs || !links) return;
    SEG_BP[seg]!.forEach((i, j) => {
      const p = PAIRS[i]!;
      // 兩股的磷原子
      for (const [k, pt] of [p.pA, p.pB].entries()) {
        at(pt, scale, va);
        dummy.position.copy(va);
        dummy.quaternion.identity();
        dummy.scale.setScalar(0.85 + 0.35 * scale);
        dummy.updateMatrix();
        nodes.setMatrixAt(j * 2 + k, dummy.matrix);
      }
      // 鹼基對：兩個 C1′ 之間
      rungs.setMatrixAt(j, stick(at(p.cA, scale, va), at(p.cB, scale, vb)));
      // 主鏈：每股接到下一個鹼基對的磷原子（最後一對沒有下一個，縮成 0）
      const next = PAIRS[i + 1];
      for (const [k, key] of (['pA', 'pB'] as const).entries()) {
        if (next) links.setMatrixAt(j * 2 + k, stick(at(p[key], scale, va), at(next[key], scale, vb)));
        else {
          dummy.scale.setScalar(0);
          dummy.updateMatrix();
          links.setMatrixAt(j * 2 + k, dummy.matrix);
        }
      }
    });
    nodes.instanceMatrix.needsUpdate = true;
    rungs.instanceMatrix.needsUpdate = true;
    links.instanceMatrix.needsUpdate = true;
  };

  useEffect(() => {
    skills.forEach((_, i) => layout(i, 1));
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const { pos, activeSkill, hoverSkill } = useSiteStore.getState();
    const w = sectionWeight(pos, SECTION, 0.85);
    g.visible = w > 0.001;
    if (!g.visible) return;
    const t = sceneTime(state);
    const dt = sceneDelta(delta);
    const portrait = size.width < size.height;
    g.position.set(portrait ? 0.3 : 4.6, rigY(pos, SECTION, 10) + (portrait ? 3.5 : -0.4), portrait ? -15 : -13.5);
    g.scale.setScalar((portrait ? 0.58 : 0.82) * MathUtils.lerp(0.7, 1, w));
    g.rotation.z = -0.2;
    g.rotation.x = 0.1;

    // 自轉 + 拖曳慣性
    const d = drag.current;
    if (!d.active) {
      d.vel *= Math.exp(-dt * 2.2);
      d.angle += (0.25 + d.vel) * dt;
    }
    if (spin.current) spin.current.rotation.y = isFrozen() ? 0.6 : d.angle;

    // 區段高亮
    const k = dt > 0 ? 1 - Math.exp(-dt * 7) : 1;
    segments.forEach((s, i) => {
      const isActive = s.id === activeSkill;
      const isHover = s.id === hoverSkill;
      const target = isActive ? 1.25 : isHover ? 1.12 : 1;
      const sc = MathUtils.lerp(scales.current[i]!, target, k);
      if (Math.abs(sc - scales.current[i]!) > 0.002) {
        scales.current[i] = sc;
        layout(i, sc);
      }
      // 只有選到的那段帶顏色，其他段退成接近水色的灰藍：一次只讀一個基因
      const tint = isActive ? 0 : isHover ? 0.35 : 0.72;
      scratch.copy(s.color).lerp(SLATE, tint);
      s.nodes.color.lerp(scratch, k);
      s.nodes.emissive.lerp(scratch, k);
      s.rungs.color.lerp(scratch.multiplyScalar(0.55), k);
      const glow = isActive ? 0.9 : isHover ? 0.45 : 0.08;
      s.nodes.emissiveIntensity = MathUtils.lerp(s.nodes.emissiveIntensity, glow + Math.sin(t * 2 + i) * 0.05, k);
      s.rungs.emissiveIntensity = MathUtils.lerp(s.rungs.emissiveIntensity, isActive ? 0.35 : 0.08, k);
    });
  });

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    drag.current = { ...drag.current, active: true, lastX: e.clientX, vel: 0 };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.lastX;
    d.lastX = e.clientX;
    d.angle += dx * 0.012;
    d.vel = dx * 0.6;
  };
  const onUp = (e: ThreeEvent<PointerEvent>) => {
    drag.current.active = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  return (
    <group ref={group}>
      <group ref={spin}>
        {segments.map((s, i) => (
          <group key={s.id}>
            <instancedMesh
              ref={(m) => {
                nodeMeshes.current[i] = m;
              }}
              args={[geo.node, s.nodes, SEG_BP[i]!.length * 2]}
              frustumCulled={false}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHover(s.id);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                setHover(null);
                document.body.style.cursor = '';
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (Math.abs(drag.current.vel) < 2) setActive(s.id);
              }}
            />
            <instancedMesh
              ref={(m) => {
                rungMeshes.current[i] = m;
              }}
              args={[geo.rung, s.rungs, SEG_BP[i]!.length]}
              frustumCulled={false}
              raycast={() => null}
            />
            <instancedMesh
              ref={(m) => {
                linkMeshes.current[i] = m;
              }}
              args={[geo.link, s.rungs, SEG_BP[i]!.length * 2]}
              frustumCulled={false}
              raycast={() => null}
            />
          </group>
        ))}
        {/* 透明的拖曳把手 */}
        <mesh
          geometry={geo.hit}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}
