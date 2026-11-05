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
import { injectDither } from './fade';
import { cameraY, rigY, sectionWeight } from './path';
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
 * 魚群：CPU boids + InstancedMesh + 尾巴擺動 shader，兩群各活在自己的深度帶：
 * - reef：透光帶（關於、技能），在畫面下緣的遠處（霧裡只剩剪影），越往下越稀，200 m 前就不見
 * - lantern：中層帶（作品段）的燈籠魚，身體很暗、腹側有分類色的發光點；
 *   篩選作品時符合分類的魚聚成一團、其他散開（像散點圖被 filter）
 */
export default function Fish({ count, kind = 'reef' }: { count: number; kind?: 'reef' | 'lantern' }) {
  const lanternMode = kind === 'lantern';
  const mesh = useRef<InstancedMesh>(null);
  const school = useMemo(() => {
    const s = createSchool(count, SCENE_SEED + (lanternMode ? 13 : 3));
    // 先模擬一段時間，讓魚群一出場就是成形的隊伍（固定步長，結果可重現）
    for (let i = 0; i < 90; i++) stepSchool(s, 1 / 20);
    return s;
  }, [count, lanternMode]);

  const uFade = useMemo(() => ({ value: 1 }), []);
  const { geometry, material } = useMemo(() => {
    const m = new MeshStandardMaterial({ color: '#ffffff', metalness: 0.3, roughness: 0.55 });
    m.onBeforeCompile = (shader) => {
      injectDither(shader, uFade);
      shader.uniforms.uTime = { value: 0 };
      shader.uniforms.uLantern = { value: 0 };
      m.userData.shader = shader;
      // 燈籠魚模式（中層帶）：和其他生物同一種掃描語言——身體幾乎全黑、冷色輪廓光；
      // 腹側一排小發光點是這條魚的作品分類色（篩選分群時看得出誰是誰），尾巴不發光
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          '#include <common>\nuniform float uLantern;\nvarying vec3 vTag;\nvarying vec3 vLocal;',
        )
        .replace(
          '#include <color_fragment>',
          '#include <color_fragment>\ndiffuseColor.rgb *= mix(1.0, 0.08, uLantern);',
        )
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
          float rim = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 2.4);
          float dots = step(0.6, fract(vLocal.z * 16.0)) * smoothstep(-0.03, -0.09, vLocal.y) * step(-0.18, vLocal.z);
          totalEmissiveRadiance += (vec3(0.31, 0.94, 0.82) * rim * 0.55 + vTag * dots * 0.7) * uLantern;`,
        );
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          '#include <common>\nuniform float uTime;\nattribute vec3 aTag;\nvarying vec3 vTag;\nvarying vec3 vLocal;',
        )
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvTag = aTag;\nvLocal = position;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          float phase = float(gl_InstanceID) * 1.7;
          float sway = sin(uTime * 9.0 + phase - position.z * 3.5) * 0.11 * smoothstep(0.25, -0.6, position.z);
          transformed.x += sway;`,
        );
    };
    return { geometry: fishGeometry(), material: m };
  }, [uFade]);

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
    // 降飽和、偏水色：遠處的魚群是剪影，不是彩色貼紙
    const base = [new Color('#7d9fb5'), new Color('#57809b'), new Color('#93907f')];
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
    // 進出都用淡入淡出（抖動），不在某個捲動位置突然出現或消失
    const fade = lanternMode
      ? smoothstep(2.85, 3.15, pos) * (1 - smoothstep(3.85, 4.15, pos))
      : smoothstep(0.6, 0.9, pos) * (1 - smoothstep(2.5, 2.95, pos));
    uFade.value = fade;
    const visible = fade > 0.002;
    m.visible = visible;
    if (!visible) return;
    // 礁區魚群越往下越稀：只畫前面一部分實例
    // 礁區魚群越往下越稀（實例數慢慢減少，配合淡出）
    m.count = lanternMode ? count : Math.max(8, Math.round(count * (1 - 0.6 * smoothstep(1.9, 2.9, pos))));
    const shader = material.userData.shader as { uniforms: { uTime: { value: number } } } | undefined;
    const lantern = lanternMode ? 1 : 0;
    if (shader) {
      shader.uniforms.uTime.value = sceneTime(state);
      (shader.uniforms as unknown as { uLantern: { value: number } }).uLantern.value = lantern;
    }

    // 魚群中心：在世界座標的深度帶裡慢慢落後相機（視差），放在畫面下緣的遠處，不壓在文字欄上
    const camY = state.camera.position.y;
    const portrait = state.size.width < state.size.height;
    if (lanternMode) {
      center.set(portrait ? 2 : 10, rigY(pos, PROJECTS, 8) - 2, portrait ? -30 : -26);
    } else {
      const y = Math.min(cameraY(1.1), Math.max(cameraY(2.8), camY - 10));
      center.set(portrait ? 1 : 6, y, portrait ? -40 : -38);
    }
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
    gather.weight = !lanternMode || projectFilter === 'all' ? 0 : smoothstep(0.5, 0.9, w);
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
