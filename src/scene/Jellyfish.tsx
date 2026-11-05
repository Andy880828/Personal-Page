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
import { smoothstep } from '@/lib/math';
import { useSiteStore } from '@/store/useSiteStore';
import { cameraY } from './path';
import { sceneDelta, sceneTime } from './time';

const bellVert = /* glsl */ `
uniform float uTime;
uniform float uPhase;
uniform float uExcite;
varying vec3 vNormalV;
varying vec3 vViewDir;
varying float vY;
void main() {
  float pulse = pow(0.5 + 0.5 * sin(uTime * (1.6 + uExcite * 2.5) + uPhase), 3.0);
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
uniform float uExcite;
varying vec3 vNormalV;
varying vec3 vViewDir;
varying float vY;
void main() {
  float rim = pow(1.0 - abs(dot(vNormalV, vViewDir)), 2.2);
  float bands = 0.55 + 0.45 * sin(vY * 26.0);
  vec3 col = uColor * (rim * 1.6 + 0.12 * bands) + vec3(1.0) * pow(rim, 6.0) * 0.6;
  gl_FragColor = vec4(col * uFade * (1.0 + uExcite * 1.2), 1.0);
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
    return Array.from({ length: count }, (_, i) => {
      // 降低飽和與亮度：水母是遠處的微光，不能比內容搶眼
      // 和其他生物同一種掃描語言：單一冷色、很暗，亮度只差一點（COLORS 只用來錯開亮度）
      const color = new Color('#4ff0d2').lerp(new Color(COLORS[i % COLORS.length]!), 0.12).multiplyScalar(0.42);
      const phase = rng() * 6.28;
      const uniforms = {
        uTime: { value: 0 },
        uPhase: { value: phase },
        uColor: { value: color },
        uFade: { value: 1 },
        uExcite: { value: 0 },
      };
      const side = i % 2 === 0 ? -1 : 1;
      const z = -16 - rng() * 16;
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
        // 在中層帶裡的相對位置；實際高度每幀依相機路徑算（路徑依版面量測結果而定）
        frac: (i + rng() * 0.6) / count,
        z,
        // 放在作品卡片欄外：畫面的半寬約 0.78·|z|（16:10），x 取 0.82–0.95 倍，留在邊緣
        x: side * Math.abs(z) * (0.82 + rng() * 0.13),
        scale: 0.45 + rng() * 0.5,
        drift: rng() * 6.28,
      };
    });
  }, [count]);

  const groups = useRef<(Group | null)[]>([]);

  useFrame((state, delta) => {
    const t = sceneTime(state);
    const camY = state.camera.position.y;
    const pos = useSiteStore.getState().pos;
    // 中層帶的窗：進出都淡入淡出
    const win = smoothstep(2.7, 3.0, pos) * (1 - smoothstep(3.7, 4.0, pos));
    if (group.current) group.current.visible = win > 0.002;
    const top = cameraY(3.0);
    const bottom = cameraY(3.95);
    items.forEach((it, i) => {
      const y = top + (bottom - top) * it.frac;
      it.uniforms.uTime.value = t;
      it.uniforms.uExcite.value *= Math.exp(-sceneDelta(delta) * 1.4);
      const d = Math.abs(y - camY);
      it.uniforms.uFade.value = (1 - Math.min(1, Math.max(0, (d - 10) / 12))) * win;
      const g = groups.current[i];
      if (g) g.position.set(it.x + Math.sin(t * 0.2 + it.drift) * 0.8, y + Math.sin(t * 0.35 + it.drift) * 1.2, it.z);
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
          <mesh
            geometry={it.bell}
            material={it.bellMat}
            frustumCulled={false}
            onPointerOver={(e) => {
              e.stopPropagation();
              it.uniforms.uExcite.value = 1;
            }}
          />
          <lineSegments geometry={it.tent} material={it.tentMat} frustumCulled={false} />
        </group>
      ))}
    </group>
  );
}
