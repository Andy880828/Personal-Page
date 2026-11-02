import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, ShaderMaterial, Vector3 } from 'three';
import { createRng, SCENE_SEED } from '@/lib/seed';
import { isFrozen } from './time';

const COUNT = 220;
/** 一陣氣泡的壽命（秒） */
const LIFE = 1.8;

const vert = /* glsl */ `
uniform float uAge;
uniform vec3 uOrigin;
uniform float uPixelRatio;
attribute float aSeed;
varying float vAlpha;
void main() {
  // 每顆從相機前方的一團裡出發，往上浮、左右晃，越小的浮得越慢
  float a = uAge * (0.7 + aSeed * 0.6);
  vec3 p = uOrigin + position;
  p.y += a * (1.6 + aSeed * 2.4) + a * a * 0.6;
  p.x += sin(a * 6.0 + aSeed * 40.0) * 0.18 * a;
  p.z += cos(a * 5.0 + aSeed * 23.0) * 0.12 * a;
  vec4 mv = viewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float t = clamp(uAge / ${LIFE.toFixed(1)}, 0.0, 1.0);
  vAlpha = smoothstep(0.0, 0.06, t) * (1.0 - t) * (1.0 - t);
  gl_PointSize = (2.0 + aSeed * 7.0) * uPixelRatio * 22.0 / max(-mv.z, 0.4);
}`;

const frag = /* glsl */ `
varying float vAlpha;
void main() {
  // 氣泡：亮的外圈、透明的中心，上緣一點高光
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float ring = smoothstep(0.5, 0.42, d) * smoothstep(0.18, 0.4, d);
  float spec = smoothstep(0.16, 0.0, length(c - vec2(-0.14, -0.16)));
  float a = (ring * 0.7 + spec * 0.8) * vAlpha;
  if (a < 0.004) discard;
  gl_FragColor = vec4(vec3(0.82, 0.95, 1.0) * a, 1.0);
}`;

/**
 * 入水事件的氣泡：相機往下穿過水面的那一刻，在鏡頭前爆出一陣往上浮的氣泡（像人跳進水裡）。
 * 只在往下穿過時觸發；凍結模式（測試、減少動態）不出現。
 */
export default function Bubbles() {
  const lastY = useRef<number | null>(null);
  const start = useRef(-1);
  const { geometry, material } = useMemo(() => {
    const rng = createRng(SCENE_SEED + 71);
    const pos = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      // 鏡頭前方、略低於視線的一團（相機朝 -z）
      pos[i * 3] = (rng() - 0.5) * 9;
      pos[i * 3 + 1] = -1.5 - rng() * 4;
      pos[i * 3 + 2] = -1.5 - rng() * 9;
      seeds[i] = rng();
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new BufferAttribute(seeds, 1));
    const m = new ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      fog: false,
      uniforms: { uAge: { value: 99 }, uOrigin: { value: new Vector3() }, uPixelRatio: { value: 1 } },
    });
    return { geometry: g, material: m };
  }, []);

  const points = useRef<{ visible: boolean } | null>(null);

  useFrame((state) => {
    const y = state.camera.position.y;
    const prev = lastY.current;
    lastY.current = y;
    const now = state.clock.elapsedTime;
    if (!isFrozen() && prev !== null && prev > 0 && y <= 0) {
      start.current = now;
      (material.uniforms.uOrigin!.value as Vector3).copy(state.camera.position);
    }
    const age = start.current < 0 ? 99 : now - start.current;
    material.uniforms.uAge!.value = age;
    material.uniforms.uPixelRatio!.value = state.gl.getPixelRatio();
    if (points.current) points.current.visible = age < LIFE;
  });

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} visible={false} />;
}
