import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Color, MathUtils, MeshBasicMaterial, MeshPhysicalMaterial, type Group, type Mesh } from 'three';
import { skills } from '@/content/skills';
import { useSiteStore } from '@/store/useSiteStore';
import { rigY, sectionWeight } from './path';
import { sceneTime } from './time';

const SECTION = 2;
/** 五顆氣泡的相對位置（鬆散的群聚，不是整齊的圓） */
const LAYOUT: [number, number, number, number][] = [
  [-1.9, 1.5, 0.4, 1.15],
  [1.6, 2.1, -0.8, 0.95],
  [0.2, -0.2, 0.9, 1.3],
  [2.5, -1.4, -0.2, 1.0],
  [-1.6, -2.1, -0.6, 0.9],
];

/**
 * 技能氣泡：彩虹膜（iridescence）+ 透射的玻璃球，中間是該技能顏色的發光核心。
 * 點氣泡 = 點 DOM 分頁（共用 store）；hover 分頁時對應氣泡也會亮。
 */
export default function SkillBubbles({ transmission }: { transmission: boolean }) {
  const group = useRef<Group>(null);
  const bubbles = useRef<(Mesh | null)[]>([]);
  const cores = useRef<(Mesh | null)[]>([]);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const size = useThree((s) => s.size);
  const activeSkill = useSiteStore((s) => s.activeSkill);
  const setActive = useSiteStore((s) => s.setActiveSkill);
  const setHover = useSiteStore((s) => s.setHoverSkill);

  const glass = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: '#ffffff',
        roughness: 0.06,
        metalness: 0,
        transmission: transmission ? 1 : 0,
        thickness: 0.5,
        ior: 1.33,
        iridescence: 1,
        iridescenceIOR: 1.32,
        iridescenceThicknessMinimum: 120,
        iridescenceThicknessMaximum: 720,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        transparent: !transmission,
        opacity: transmission ? 1 : 0.38,
        envMapIntensity: 1.6,
        specularIntensity: 1,
      }),
    [transmission],
  );
  const coreMaterials = useMemo(
    () =>
      skills.map((s) => new MeshBasicMaterial({ color: new Color(s.color).multiplyScalar(1.8), toneMapped: false })),
    [],
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const { pos, hoverSkill, activeSkill: active } = useSiteStore.getState();
    const w = sectionWeight(pos, SECTION, 0.85);
    g.visible = w > 0.001;
    // drei 的 Html 不會跟著父物件隱藏，標籤自己淡出
    for (const l of labels.current) {
      if (!l) continue;
      l.style.opacity = String(w > 0.05 ? w : 0);
      l.style.visibility = w > 0.05 ? 'visible' : 'hidden';
    }
    if (!g.visible) return;
    const t = sceneTime(state);
    const portrait = size.width < size.height;
    g.position.set(portrait ? 0.6 : 5.2, rigY(pos, SECTION, 10), portrait ? -13 : -11);
    const baseScale = (portrait ? 0.62 : 1) * MathUtils.lerp(0.6, 1, w);
    g.scale.setScalar(baseScale);
    g.rotation.y = Math.sin(t * 0.15) * 0.25;
    const k = 1 - Math.exp(-delta * 6);
    skills.forEach((s, i) => {
      const b = bubbles.current[i];
      const c = cores.current[i];
      const [x, y, z, r] = LAYOUT[i]!;
      if (!b || !c) return;
      const isActive = s.id === active;
      const isHover = s.id === hoverSkill;
      const target = r * (isActive ? 1.28 : isHover ? 1.12 : 1);
      const sc = delta > 0 ? MathUtils.lerp(b.scale.x, target, k) : target;
      b.scale.setScalar(sc);
      b.position.set(x + Math.sin(t * 0.6 + i) * 0.18, y + Math.sin(t * 0.8 + i * 1.7) * 0.3, z);
      c.position.copy(b.position);
      const coreTarget = sc * (isActive ? 0.36 : 0.2);
      c.scale.setScalar(delta > 0 ? MathUtils.lerp(c.scale.x, coreTarget, k) : coreTarget);
    });
  });

  return (
    <group ref={group}>
      {skills.map((s, i) => (
        <group key={s.id}>
          <mesh
            ref={(m) => {
              bubbles.current[i] = m;
            }}
            material={glass}
            onClick={(e) => {
              e.stopPropagation();
              setActive(s.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHover(s.id);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              setHover(null);
              document.body.style.cursor = '';
            }}
          >
            <sphereGeometry args={[1, 48, 32]} />
            <Html
              center
              position={[0, -1.25, 0]}
              className="pointer-events-none select-none"
              zIndexRange={[20, 0]}
              aria-hidden="true"
            >
              <span
                ref={(el) => {
                  labels.current[i] = el;
                }}
                className={`block font-mono text-[0.68rem] tracking-[0.18em] whitespace-nowrap uppercase transition-colors ${
                  s.id === activeSkill ? 'text-foam' : 'text-mist/70'
                }`}
              >
                {s.nameEn}
              </span>
            </Html>
          </mesh>
          <mesh
            ref={(m) => {
              cores.current[i] = m;
            }}
            material={coreMaterials[i]}
            raycast={() => null}
          >
            <icosahedronGeometry args={[1, 2]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
