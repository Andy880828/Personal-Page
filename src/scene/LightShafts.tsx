import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, DoubleSide, ShaderMaterial, type Group } from 'three';
import { createRng, SCENE_SEED } from '@/lib/seed';
import { useSiteStore } from '@/store/useSiteStore';
import { sceneTime } from './time';
import { sunlight } from './path';

const vert = /* glsl */ `
varying vec2 vUv;
varying float vDepth;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vDepth = world.y;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

const frag = /* glsl */ `
uniform float uTime;
uniform float uIntensity;
uniform float uSeed;
varying vec2 vUv;
varying float vDepth;
void main() {
  float across = smoothstep(0.0, 0.5, vUv.x) * smoothstep(1.0, 0.5, vUv.x);
  float along = smoothstep(0.0, 0.85, vUv.y) * smoothstep(-70.0, -4.0, vDepth);
  float flicker = 0.65 + 0.35 * sin(uTime * 0.7 + uSeed * 6.28 + vUv.x * 3.0);
  float a = across * across * along * flicker * uIntensity;
  gl_FragColor = vec4(vec3(0.62, 0.86, 1.0) * a * 0.18, 1.0);
}`;

/** 從海面斜射下來的光束：加法混合的長條面，越深越淡 */
export default function LightShafts({ count = 9 }: { count?: number }) {
  const group = useRef<Group>(null);
  const shafts = useMemo(() => {
    const rng = createRng(SCENE_SEED + 7);
    return Array.from({ length: count }, (_, i) => {
      const material = new ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        side: DoubleSide,
        fog: false,
        uniforms: { uTime: { value: 0 }, uIntensity: { value: 1 }, uSeed: { value: rng() } },
      });
      return {
        material,
        x: (i / (count - 1) - 0.5) * 46 + (rng() - 0.5) * 5,
        z: -10 - rng() * 30,
        width: 2.5 + rng() * 5,
        tilt: 0.28 + rng() * 0.12,
      };
    });
  }, [count]);

  useFrame((state) => {
    const pos = useSiteStore.getState().pos;
    const t = sceneTime(state);
    const intensity = sunlight(pos) * (state.camera.position.y < 0 ? 1 : 0);
    if (group.current) group.current.visible = intensity > 0.01;
    for (const s of shafts) {
      s.material.uniforms.uTime!.value = t;
      s.material.uniforms.uIntensity!.value = intensity;
    }
  });

  return (
    <group ref={group}>
      {shafts.map((s, i) => (
        <mesh key={i} material={s.material} position={[s.x, -32, s.z]} rotation={[0, 0, s.tilt]} frustumCulled={false}>
          <planeGeometry args={[s.width, 64, 1, 1]} />
        </mesh>
      ))}
    </group>
  );
}
