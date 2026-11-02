import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, ShaderMaterial } from 'three';
import { createRng, SCENE_SEED } from '@/lib/seed';
import { cameraY } from './path';
import { sceneTime } from './time';

const vert = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
attribute float aSeed;
varying float vTwinkle;
varying float vHue;
void main() {
  vec3 p = position;
  p.x += sin(uTime * 0.3 + aSeed * 40.0) * 0.5;
  p.y += sin(uTime * 0.22 + aSeed * 23.0) * 0.6;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  vTwinkle = pow(0.5 + 0.5 * sin(uTime * (0.8 + aSeed * 1.6) + aSeed * 60.0), 4.0);
  vHue = aSeed;
  gl_PointSize = (1.4 + aSeed * 2.4) * uPixelRatio * 34.0 / max(-mv.z, 0.5);
}`;

const frag = /* glsl */ `
varying float vTwinkle;
varying float vHue;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float core = smoothstep(0.5, 0.0, d);
  float a = core * core * (0.15 + 0.85 * vTwinkle);
  if (a < 0.004) discard;
  vec3 c = vHue > 0.86 ? vec3(1.0, 0.72, 0.42) : vec3(0.31, 0.94, 0.82);
  gl_FragColor = vec4(c * a * 1.6, 1.0);
}`;

/** 深層帶的生物發光浮游生物：一閃一閃的青色光點，少數是琥珀色 */
export default function Plankton({ count }: { count: number }) {
  const { geometry, material } = useMemo(() => {
    const rng = createRng(SCENE_SEED + 31);
    const top = cameraY(3.6);
    const bottom = cameraY(5.6);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rng() - 0.5) * 44;
      positions[i * 3 + 1] = bottom + (top - bottom) * rng();
      positions[i * 3 + 2] = -4 - rng() * 30;
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
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
    });
    return { geometry: g, material: m };
  }, [count]);

  useFrame((state) => {
    material.uniforms.uTime!.value = sceneTime(state);
    material.uniforms.uPixelRatio!.value = state.gl.getPixelRatio();
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
