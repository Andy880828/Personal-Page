import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  ShaderMaterial,
  SphereGeometry,
  type Group,
} from 'three';
import { createRng, SCENE_SEED } from '@/lib/seed';
import { useSiteStore } from '@/store/useSiteStore';
import { cameraY } from './path';
import { sceneTime } from './time';

const bellVert = /* glsl */ `
uniform float uTime;
uniform float uPhase;
varying vec3 vNormalV;
varying vec3 vViewDir;
varying float vY;
void main() {
  float pulse = pow(0.5 + 0.5 * sin(uTime * 1.6 + uPhase), 3.0);
  vec3 p = position;
  p.xz *= 1.0 - 0.18 * pulse * (1.0 - p.y);
  p.y *= 1.0 + 0.12 * pulse;
  vY = position.y;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vNormalV = normalize(normalMatrix * normal);
  vViewDir = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

const bellFrag = /* glsl */ `
uniform vec3 uColor;
uniform float uFade;
varying vec3 vNormalV;
varying vec3 vViewDir;
varying float vY;
void main() {
  float rim = pow(1.0 - abs(dot(vNormalV, vViewDir)), 2.2);
  float bands = 0.55 + 0.45 * sin(vY * 26.0);
  vec3 col = uColor * (rim * 1.6 + 0.12 * bands) + vec3(1.0) * pow(rim, 6.0) * 0.6;
  gl_FragColor = vec4(col * uFade, 1.0);
}`;

const tentVert = /* glsl */ `
uniform float uTime;
uniform float uPhase;
attribute float aT;
varying float vT;
void main() {
  vec3 p = position;
  float sway = sin(uTime * 1.3 + uPhase + aT * 5.0 + p.x * 3.0) * 0.35 * aT;
  p.x += sway;
  p.z += cos(uTime * 1.1 + uPhase + aT * 4.0) * 0.25 * aT;
  vT = aT;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

const tentFrag = /* glsl */ `
uniform vec3 uColor;
uniform float uFade;
varying float vT;
void main() {
  gl_FragColor = vec4(uColor * (1.0 - vT) * 0.9 * uFade, 1.0);
}`;

function tentacles(rng: () => number) {
  const strands = 10;
  const seg = 14;
  const pos: number[] = [];
  const ts: number[] = [];
  for (let s = 0; s < strands; s++) {
    const a = (s / strands) * Math.PI * 2 + rng() * 0.3;
    const r = 0.55 + rng() * 0.3;
    const len = 2.4 + rng() * 2.2;
    for (let k = 0; k < seg; k++) {
      for (const kk of [k, k + 1]) {
        const t = kk / seg;
        pos.push(Math.cos(a) * r * (1 - t * 0.5), -t * len, Math.sin(a) * r * (1 - t * 0.5));
        ts.push(t);
      }
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute('aT', new BufferAttribute(new Float32Array(ts), 1));
  return g;
}

const COLORS = ['#ff7eb6', '#4ff0d2', '#a99bff', '#7cc8ff', '#ff7eb6', '#4ff0d2', '#ffb86b'];

/** 中層帶到深層帶的發光水母：鐘形體會收縮脈動，觸手隨水流擺動 */
export default function Jellyfish({ count = 7 }: { count?: number }) {
  const group = useRef<Group>(null);
  const items = useMemo(() => {
    const rng = createRng(SCENE_SEED + 21);
    const bell = new SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const top = cameraY(2.8);
    const bottom = cameraY(4.7);
    return Array.from({ length: count }, (_, i) => {
      const color = new Color(COLORS[i % COLORS.length]!);
      const phase = rng() * 6.28;
      const uniforms = {
        uTime: { value: 0 },
        uPhase: { value: phase },
        uColor: { value: color },
        uFade: { value: 1 },
      };
      const side = i % 2 === 0 ? -1 : 1;
      return {
        bell,
        tent: tentacles(rng),
        bellMat: new ShaderMaterial({
          vertexShader: bellVert,
          fragmentShader: bellFrag,
          uniforms,
          transparent: true,
          depthWrite: false,
          blending: AdditiveBlending,
          side: DoubleSide,
          fog: false,
        }),
        tentMat: new ShaderMaterial({
          vertexShader: tentVert,
          fragmentShader: tentFrag,
          uniforms,
          transparent: true,
          depthWrite: false,
          blending: AdditiveBlending,
          fog: false,
        }),
        uniforms,
        x: side * (4 + rng() * 7),
        y: top + (bottom - top) * ((i + rng() * 0.6) / count),
        z: -9 - rng() * 14,
        scale: 0.55 + rng() * 0.7,
        drift: rng() * 6.28,
      };
    });
  }, [count]);

  const groups = useRef<(Group | null)[]>([]);

  useFrame((state) => {
    const t = sceneTime(state);
    const camY = state.camera.position.y;
    const pos = useSiteStore.getState().pos;
    if (group.current) group.current.visible = pos > 2.3 && pos < 5.3;
    items.forEach((it, i) => {
      it.uniforms.uTime.value = t;
      const d = Math.abs(it.y - camY);
      it.uniforms.uFade.value = 1 - Math.min(1, Math.max(0, (d - 10) / 12));
      const g = groups.current[i];
      if (g)
        g.position.set(it.x + Math.sin(t * 0.2 + it.drift) * 0.8, it.y + Math.sin(t * 0.35 + it.drift) * 1.2, it.z);
    });
  });

  return (
    <group ref={group}>
      {items.map((it, i) => (
        <group
          key={i}
          ref={(g) => {
            groups.current[i] = g;
          }}
          scale={it.scale}
          rotation={[0.15 * (i % 3), 0, 0.12 * ((i % 2) * 2 - 1)]}
        >
          <mesh geometry={it.bell} material={it.bellMat} frustumCulled={false} />
          <lineSegments geometry={it.tent} material={it.tentMat} frustumCulled={false} />
        </group>
      ))}
    </group>
  );
}
