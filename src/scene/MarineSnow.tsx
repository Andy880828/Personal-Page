import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, ShaderMaterial, Vector3 } from 'three';
import { createRng, SCENE_SEED } from '@/lib/seed';
import { useSiteStore } from '@/store/useSiteStore';
import { sceneTime } from './time';
import { sunlight } from './path';

const BOX = [44, 36, 44] as const;

const vert = /* glsl */ `
uniform float uTime;
uniform vec3 uBox;
uniform float uPixelRatio;
attribute float aSeed;
varying float vAlpha;
void main() {
  vec3 drift = vec3(sin(uTime * 0.15 + aSeed * 30.0) * 0.6, -uTime * (0.25 + aSeed * 0.35), cos(uTime * 0.12 + aSeed * 17.0) * 0.6);
  // 以相機為中心環繞的盒子：粒子永遠包住相機，往下潛時看起來在往上飄
  vec3 local = mod(position + drift - cameraPosition + uBox * 0.5, uBox) - uBox * 0.5;
  vec3 world = cameraPosition + local;
  vec4 mv = viewMatrix * vec4(world, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = (0.6 + aSeed * 1.6) * uPixelRatio;
  gl_PointSize = size * 26.0 / max(-mv.z, 0.5);
  float edge = 1.0 - smoothstep(0.32, 0.5, max(abs(local.x) / uBox.x, max(abs(local.y) / uBox.y, abs(local.z) / uBox.z)));
  vAlpha = edge * smoothstep(0.0, -2.0, world.y) * smoothstep(42.0, 6.0, -mv.z);
}`;

const frag = /* glsl */ `
uniform float uBright;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.1, d) * vAlpha * uBright;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vec3(0.82, 0.93, 1.0) * a, 1.0);
}`;

/** 海雪：在相機周圍環繞的漂浮顆粒，提供下潛時的速度感 */
export default function MarineSnow({ count }: { count: number }) {
  const { geometry, material } = useMemo(() => {
    const rng = createRng(SCENE_SEED + 11);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rng() - 0.5) * BOX[0];
      positions[i * 3 + 1] = (rng() - 0.5) * BOX[1];
      positions[i * 3 + 2] = (rng() - 0.5) * BOX[2];
      seeds[i] = rng();
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(positions, 3));
    g.setAttribute('aSeed', new BufferAttribute(seeds, 1));
    const m = new ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      fog: false,
      uniforms: {
        uTime: { value: 0 },
        uBox: { value: new Vector3(...BOX) },
        uPixelRatio: { value: 1 },
        uBright: { value: 1 },
      },
    });
    return { geometry: g, material: m };
  }, [count]);

  useFrame((state) => {
    const pos = useSiteStore.getState().pos;
    material.uniforms.uTime!.value = sceneTime(state);
    material.uniforms.uPixelRatio!.value = state.gl.getPixelRatio();
    material.uniforms.uBright!.value = 0.35 + 0.65 * sunlight(pos);
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
