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
import { skills } from '@/content/skills';
import { useSiteStore } from '@/store/useSiteStore';
import { rigY, sectionWeight } from './path';
import { isFrozen, sceneDelta, sceneTime } from './time';

const SECTION = 2;
/** 每個技能區段的鹼基對數；整條 DNA = 5 段 */
const BP_PER_SEGMENT = 16;
const BP = BP_PER_SEGMENT * skills.length;
/** 每個鹼基對沿軸上升的距離、每圈幾個鹼基對（B-DNA 約 10.5） */
const RISE = 0.12;
const PER_TURN = 10.5;
const RADIUS = 0.95;
const HEIGHT = BP * RISE;

const dummy = new Object3D();
const up = new Vector3(0, 1, 0);
const q = new Quaternion();

interface Segment {
  id: string;
  color: Color;
  nodes: MeshStandardMaterial;
  rungs: MeshStandardMaterial;
}

/**
 * 技能的 DNA 雙螺旋（呼應 eDNA 研究）：五個技能區段像五個基因串在同一條序列上。
 * - hover 區段：變亮；點擊：切換左側分頁（共用 store 的 activeSkill）
 * - 拖曳：轉動螺旋；放開後慣性減速
 * 每個區段是兩個 InstancedMesh（鹼基球、橫向鹼基對），共 10 個 draw call。
 */
export default function SkillHelix() {
  const group = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const nodeMeshes = useRef<(InstancedMesh | null)[]>([]);
  const rungMeshes = useRef<(InstancedMesh | null)[]>([]);
  const size = useThree((s) => s.size);
  const setActive = useSiteStore((s) => s.setActiveSkill);
  const setHover = useSiteStore((s) => s.setHoverSkill);
  const drag = useRef({ active: false, lastX: 0, vel: 0, angle: 0 });
  const scales = useRef<number[]>(skills.map(() => 1));

  const geo = useMemo(
    () => ({
      node: new SphereGeometry(0.11, 12, 10),
      rung: new CylinderGeometry(0.035, 0.035, RADIUS * 2 - 0.2, 6, 1),
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

  /** 寫入某個區段的實例矩陣；scale 用來做選取時的「膨脹」 */
  const layout = (seg: number, scale: number) => {
    const nodes = nodeMeshes.current[seg];
    const rungs = rungMeshes.current[seg];
    if (!nodes || !rungs) return;
    for (let i = 0; i < BP_PER_SEGMENT; i++) {
      const k = seg * BP_PER_SEGMENT + i;
      // 第一個區段（前端）在最上面，和左側分頁的順序一樣
      const y = HEIGHT / 2 - k * RISE;
      const theta = (k / PER_TURN) * Math.PI * 2;
      const r = RADIUS * scale;
      for (let strand = 0; strand < 2; strand++) {
        const a = theta + strand * Math.PI;
        dummy.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(0.85 + 0.35 * scale);
        dummy.updateMatrix();
        nodes.setMatrixAt(i * 2 + strand, dummy.matrix);
      }
      dummy.position.set(0, y, 0);
      q.setFromAxisAngle(up, -theta);
      dummy.quaternion.copy(q);
      dummy.rotation.set(0, dummy.rotation.y, Math.PI / 2);
      dummy.scale.set(1, scale, 1);
      dummy.updateMatrix();
      rungs.setMatrixAt(i, dummy.matrix);
    }
    nodes.instanceMatrix.needsUpdate = true;
    rungs.instanceMatrix.needsUpdate = true;
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
      const glow = isActive ? 1.1 : isHover ? 0.6 : 0.22;
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
              args={[geo.node, s.nodes, BP_PER_SEGMENT * 2]}
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
              args={[geo.rung, s.rungs, BP_PER_SEGMENT]}
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
