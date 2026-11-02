import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  Color,
  EdgesGeometry,
  IcosahedronGeometry,
  LineBasicMaterial,
  MeshBasicMaterial,
  MeshStandardMaterial,
  type Group,
  type Mesh,
} from 'three';
import { useSiteStore } from '@/store/useSiteStore';
import { rigY, sectionWeight } from './path';
import { sceneDelta, sceneTime } from './time';

const SECTION = 3;
const ACCENT: Record<string, Color> = {
  all: new Color('#4ff0d2'),
  agent: new Color('#ffb86b'),
  selfhost: new Color('#7cc8ff'),
  data: new Color('#a99bff'),
  web: new Color('#4ff0d2'),
  bio: new Color('#ff7eb6'),
};

/**
 * 作品段的「資料探測器」：線框二十面體 + 三道軌道環 + 聲納脈衝。
 * 切換作品篩選時會加速旋轉、換成該分類的顏色。
 */
export default function ProjectProbe() {
  const group = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  const rings = useRef<(Mesh | null)[]>([]);
  const ping = useRef<Mesh>(null);
  const spin = useRef(0);
  const burst = useRef(0);
  const lastPulse = useRef(0);
  const size = useThree((s) => s.size);
  const color = useMemo(() => ACCENT.all!.clone(), []);

  const { edges, lineMat, coreMat, ringMat, pingMat } = useMemo(() => {
    const ico = new IcosahedronGeometry(1.7, 1);
    return {
      edges: new EdgesGeometry(ico),
      lineMat: new LineBasicMaterial({ color: '#4ff0d2', transparent: true, opacity: 0.9, toneMapped: false }),
      coreMat: new MeshStandardMaterial({ color: '#0a2236', metalness: 0.8, roughness: 0.35, flatShading: true }),
      ringMat: new MeshBasicMaterial({
        color: '#4ff0d2',
        transparent: true,
        opacity: 0.55,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
      pingMat: new MeshBasicMaterial({
        color: '#4ff0d2',
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    };
  }, []);

  useEffect(
    () =>
      useSiteStore.subscribe((s, prev) => {
        if (s.projectFilter !== prev.projectFilter) spin.current = 1;
      }),
    [],
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const { pos, projectFilter } = useSiteStore.getState();
    const w = sectionWeight(pos, SECTION, 0.95);
    g.visible = w > 0.001;
    if (!g.visible) return;
    const t = sceneTime(state);
    const dt = sceneDelta(delta);
    const portrait = size.width < size.height;
    g.position.set(portrait ? 2.2 : 6.5, rigY(pos, SECTION, 7) + 1.5, -14);
    g.scale.setScalar((portrait ? 0.7 : 1) * (0.55 + 0.45 * w));

    color.lerp(ACCENT[projectFilter] ?? ACCENT.all!, dt > 0 ? 1 - Math.exp(-dt * 4) : 1);
    lineMat.color.copy(color);
    ringMat.color.copy(color);
    pingMat.color.copy(color);

    const { pulse } = useSiteStore.getState();
    if (pulse && pulse.t !== lastPulse.current && w > 0.3) {
      lastPulse.current = pulse.t;
      burst.current = 1;
      spin.current = Math.max(spin.current, 0.8);
    }
    burst.current = Math.max(0, burst.current - dt * 0.9);
    spin.current = Math.max(0, spin.current - dt * 0.8);
    const speed = 0.25 + spin.current * 3;
    if (core.current) {
      core.current.rotation.y += dt * speed;
      core.current.rotation.x = Math.sin(t * 0.3) * 0.4;
      if (dt === 0) core.current.rotation.set(0.35, 0.8, 0);
    }
    rings.current.forEach((r, i) => {
      if (!r) return;
      r.rotation.set(t * (0.2 + i * 0.13) + i, t * (0.31 - i * 0.07), i * 1.1);
    });
    if (ping.current) {
      // 平時慢慢脈動；點擊後從中心爆發一圈更亮更大的聲納
      const b = burst.current;
      const phase = b > 0 ? 1 - b : (t * 0.45) % 1;
      ping.current.scale.setScalar(1.6 + phase * (b > 0 ? 9 : 5.5));
      pingMat.opacity = (1 - phase) * (b > 0 ? 0.9 : 0.35) * w;
    }
  });

  return (
    <group ref={group}>
      <mesh ref={core} material={coreMat}>
        <icosahedronGeometry args={[1.25, 0]} />
        <lineSegments geometry={edges} material={lineMat} />
      </mesh>
      {[2.6, 3.2, 3.9].map((r, i) => (
        <mesh
          key={r}
          ref={(m) => {
            rings.current[i] = m;
          }}
          material={ringMat}
        >
          <torusGeometry args={[r, 0.012, 6, 128]} />
        </mesh>
      ))}
      <mesh ref={ping} material={pingMat} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.96, 1, 96]} />
      </mesh>
    </group>
  );
}
