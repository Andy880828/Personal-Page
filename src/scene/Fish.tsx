import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  Plane,
  SphereGeometry,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createRng, SCENE_SEED } from '@/lib/seed';
import { useSiteStore } from '@/store/useSiteStore';
import { createSchool, stepSchool } from './boids';
import { cameraY } from './path';
import { isFrozen, sceneDelta, sceneTime } from './time';

/** 一條魚：拉長的身體 + 三角尾鰭，朝 +z 游 */
function fishGeometry() {
  const body = new SphereGeometry(0.5, 10, 6);
  body.scale(0.32, 0.42, 1.25);
  const tail = new BufferGeometry();
  const t = new Float32Array([0, 0, -0.5, 0, 0.32, -1.05, 0, -0.32, -1.05]);
  tail.setAttribute('position', new BufferAttribute(t, 3));
  tail.setAttribute('normal', new BufferAttribute(new Float32Array([1, 0, 0, 1, 0, 0, 1, 0, 0]), 3));
  tail.setAttribute('uv', new BufferAttribute(new Float32Array(6), 2));
  const merged = mergeGeometries([body.toNonIndexed(), tail]);
  merged.scale(0.48, 0.48, 0.48);
  return merged;
}

const dummy = new Object3D();
const avoidPlane = new Plane(new Vector3(0, 0, 1), 0);
const hit = new Vector3();
const center = new Vector3();

/** 魚群：在「關於」與「技能」兩段陪著相機游；CPU boids + InstancedMesh + 尾巴擺動 shader */
export default function Fish({ count }: { count: number }) {
  const mesh = useRef<InstancedMesh>(null);
  const school = useMemo(() => {
    const s = createSchool(count, SCENE_SEED + 3);
    // 先模擬一段時間，讓魚群一出場就是成形的隊伍（固定步長，結果可重現）
    for (let i = 0; i < 90; i++) stepSchool(s, 1 / 20);
    return s;
  }, [count]);

  const { geometry, material } = useMemo(() => {
    const m = new MeshStandardMaterial({ color: '#ffffff', metalness: 0.65, roughness: 0.32 });
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      m.userData.shader = shader;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          float phase = float(gl_InstanceID) * 1.7;
          float sway = sin(uTime * 9.0 + phase - position.z * 3.5) * 0.11 * smoothstep(0.25, -0.6, position.z);
          transformed.x += sway;`,
        );
    };
    return { geometry: fishGeometry(), material: m };
  }, []);

  useEffect(() => {
    const rng = createRng(SCENE_SEED + 5);
    const base = [new Color('#9cc9e8'), new Color('#5fa8d6'), new Color('#e8c690')];
    const c = new Color();
    for (let i = 0; i < count; i++) {
      c.copy(base[Math.floor(rng() * 2.3)]!).multiplyScalar(0.6 + rng() * 0.35);
      mesh.current?.setColorAt(i, c);
    }
    if (mesh.current?.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [count]);

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    const pos = useSiteStore.getState().pos;
    const visible = pos > 0.55 && pos < 3.3;
    m.visible = visible;
    if (!visible) return;
    const shader = material.userData.shader as { uniforms: { uTime: { value: number } } } | undefined;
    if (shader) shader.uniforms.uTime.value = sceneTime(state);

    // 魚群中心：跟著相機，但限制在「關於／技能」的深度帶裡，偏畫面右側前方
    const camY = state.camera.position.y;
    const minY = cameraY(2.9);
    const maxY = cameraY(0.9);
    const portrait = state.size.width < state.size.height;
    center.set(portrait ? 1.5 : 7.5, Math.min(maxY, Math.max(minY, camY - 1)), portrait ? -28 : -24);
    m.position.copy(center);

    let avoid: [number, number, number] | null = null;
    if (!isFrozen()) {
      state.raycaster.setFromCamera(state.pointer, state.camera);
      avoidPlane.constant = -center.z;
      if (state.raycaster.ray.intersectPlane(avoidPlane, hit)) avoid = [hit.x - center.x, hit.y - center.y, 0];
    }
    stepSchool(school, sceneDelta(delta), avoid);

    const p = school.pos;
    const v = school.vel;
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      dummy.position.set(p[ix]!, p[ix + 1]!, p[ix + 2]!);
      dummy.lookAt(p[ix]! + v[ix]!, p[ix + 1]! + v[ix + 1]!, p[ix + 2]! + v[ix + 2]!);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />;
}
