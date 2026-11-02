import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  InstancedBufferAttribute,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  Plane,
  SphereGeometry,
  Vector2,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createRng, SCENE_SEED } from '@/lib/seed';
import { useSiteStore } from '@/store/useSiteStore';
import { categoryColors } from '@/content/projects';
import type { ProjectCategory } from '@/content/types';
import { smoothstep } from '@/lib/math';
import { createSchool, stepSchool, type Gather } from './boids';
import { cameraY, sectionWeight } from './path';
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
const pointerNdc = new Vector2();

/** 每條魚帶一個作品分類（照順序輪流），燈籠魚模式時發光點是那個分類的顏色 */
const CATEGORIES = Object.keys(categoryColors) as ProjectCategory[];
const PROJECTS = 3;

/**
 * 魚群：從「關於」一路陪相機游到「作品」；CPU boids + InstancedMesh + 尾巴擺動 shader。
 * 到了中層帶變成燈籠魚，每條魚帶一個作品分類，篩選作品時符合的魚聚成一團（像散點圖被 filter）。
 */
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
      shader.uniforms.uLantern = { value: 0 };
      m.userData.shader = shader;
      // 燈籠魚模式（中層帶）：身體變暗，腹側一排很淡的發光點，顏色是這條魚的分類
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          '#include <common>\nuniform float uLantern;\nvarying vec3 vTag;\nvarying float vBelly;',
        )
        .replace(
          '#include <color_fragment>',
          '#include <color_fragment>\ndiffuseColor.rgb *= mix(1.0, 0.22, uLantern);',
        )
        .replace(
          '#include <emissivemap_fragment>',
          '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vTag * uLantern * vBelly * 0.9;',
        );
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          '#include <common>\nuniform float uTime;\nattribute vec3 aTag;\nvarying vec3 vTag;\nvarying float vBelly;',
        )
        .replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\nvTag = aTag;\nvBelly = smoothstep(-0.02, -0.12, position.y) * step(abs(position.x), 0.12);',
        )
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

  const tags = useMemo(() => Uint8Array.from({ length: count }, (_, i) => i % CATEGORIES.length), [count]);
  const gather = useMemo<Gather>(() => ({ tags, tag: 0, target: [0, 0, 0], weight: 0 }), [tags]);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const tagColors = new Float32Array(count * 3);
    const c = new Color();
    for (let i = 0; i < count; i++) c.set(categoryColors[CATEGORIES[tags[i]!]!]).toArray(tagColors, i * 3);
    m.geometry.setAttribute('aTag', new InstancedBufferAttribute(tagColors, 3));
  }, [count, tags]);

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
    // 透光帶的魚群一路跟到中層帶，在作品段變成燈籠魚
    const visible = pos > 0.55 && pos < 4.35;
    m.visible = visible;
    if (!visible) return;
    const shader = material.userData.shader as { uniforms: { uTime: { value: number } } } | undefined;
    const lantern = smoothstep(2.6, 3.2, pos);
    if (shader) {
      shader.uniforms.uTime.value = sceneTime(state);
      (shader.uniforms as unknown as { uLantern: { value: number } }).uLantern.value = lantern;
    }

    // 魚群中心：跟著相機，但限制在「關於／技能」的深度帶裡，偏畫面右側前方
    const camY = state.camera.position.y;
    const minY = cameraY(3.9);
    const maxY = cameraY(0.9);
    const portrait = state.size.width < state.size.height;
    center.set(portrait ? 1.5 : 7.5, Math.min(maxY, Math.max(minY, camY - 1)), portrait ? -28 : -24);
    m.position.copy(center);

    let avoid: [number, number, number] | null = null;
    let radius = 4;
    let strength = 0.9;
    if (!isFrozen()) {
      const { pulse } = useSiteStore.getState();
      const age = pulse ? (performance.now() - pulse.t) / 1000 : Infinity;
      avoidPlane.constant = -center.z;
      if (age < 1.2) {
        // 點擊驚散：從點擊點用更大的範圍、更強的推力把魚群推開，1.2 秒內衰減
        pointerNdc.set(pulse!.x, pulse!.y);
        state.raycaster.setFromCamera(pointerNdc, state.camera);
        if (state.raycaster.ray.intersectPlane(avoidPlane, hit)) {
          avoid = [hit.x - center.x, hit.y - center.y, 0];
          radius = 9;
          strength = 3.2 * (1 - age / 1.2);
        }
      } else {
        state.raycaster.setFromCamera(state.pointer, state.camera);
        if (state.raycaster.ray.intersectPlane(avoidPlane, hit)) avoid = [hit.x - center.x, hit.y - center.y, 0];
      }
    }
    // 作品篩選：符合分類的魚聚成一團、其他散開（只在作品段的正中間）
    const { projectFilter } = useSiteStore.getState();
    const w = sectionWeight(pos, PROJECTS, 0.9);
    gather.weight = projectFilter === 'all' ? 0 : smoothstep(0.5, 0.9, w);
    gather.tag = projectFilter === 'all' ? 0 : CATEGORIES.indexOf(projectFilter);
    stepSchool(school, sceneDelta(delta), avoid, radius, strength, gather);

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
