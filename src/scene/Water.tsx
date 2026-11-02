import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, DoubleSide, Plane, ShaderMaterial, SRGBColorSpace, Vector3, Vector4, type Mesh } from 'three';
import common from './shaders/common.glsl?raw';
import vert from './shaders/water.vert.glsl?raw';
import frag from './shaders/water.frag.glsl?raw';
import { SUN_DIR } from './constants';
import { sceneTime, isFrozen } from './time';
import { useSiteStore } from '@/store/useSiteStore';
import { waterColor, fogDensity } from './path';
import { smoothstep } from '@/lib/math';

const MAX_RIPPLES = 8;
const plane = new Plane(new Vector3(0, 1, 0), 0);
const hit = new Vector3();

/** 海面：上方看是暮色反射與夕陽光帶，下方看是斯涅爾窗；滑鼠移動會在水面留下漣漪 */
export default function Water({ segments }: { segments: number }) {
  const mesh = useRef<Mesh>(null);
  const lastPointer = useRef({ x: 9, y: 9, t: 0 });
  const next = useRef(0);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vert,
        fragmentShader: common + frag,
        side: DoubleSide,
        // 水下那面用透明度淡進背景（見 water.frag.glsl）；水面上方 alpha 一律 1
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uSunDir: { value: SUN_DIR },
          uDeep: { value: new Color('#021624') },
          uUnderColor: { value: new Color() },
          uUnderDensity: { value: 0.03 },
          uFade: { value: 1 },
          uRipples: { value: Array.from({ length: MAX_RIPPLES }, () => new Vector4(0, 0, -99, 0)) },
        },
      }),
    [],
  );

  useFrame((state) => {
    const t = sceneTime(state);
    const u = material.uniforms;
    u.uTime!.value = t;
    const pos = useSiteStore.getState().pos;
    // 和 Atmosphere 的背景與霧同一個值、同一個色彩空間：水面遠端被霧吃掉後要剛好等於背景，
    // 否則水面網格的邊緣和背景之間會出現一條硬亮度差（捲動時像黑影刷過）
    const [r, g, b] = waterColor(Math.max(pos, 0.5));
    (u.uUnderColor!.value as Color).setRGB(r, g, b, SRGBColorSpace);
    u.uUnderDensity!.value = fogDensity(pos);
    // 往下潛時水面下側慢慢淡進水色，再關掉（不在某一幀硬切）
    u.uFade!.value = 1 - smoothstep(1.2, 1.65, pos);
    if (mesh.current) mesh.current.visible = pos < 1.7;
    // 網格跟著相機走，但對齊格點，避免頂點滑動造成波浪抖動
    const step = 240 / segments;
    mesh.current?.position.set(Math.round(state.camera.position.x / step) * step, 0, -60);

    // 滑鼠在海面上移動 → 新增漣漪（只在海面上、指標有移動時）
    if (isFrozen() || state.camera.position.y < 0.3) return;
    const p = state.pointer;
    const lp = lastPointer.current;
    const moved = Math.hypot(p.x - lp.x, p.y - lp.y);
    if (moved < 0.035 || t - lp.t < 0.12) return;
    state.raycaster.setFromCamera(p, state.camera);
    if (!state.raycaster.ray.intersectPlane(plane, hit)) return;
    lastPointer.current = { x: p.x, y: p.y, t };
    const slot = (u.uRipples!.value as Vector4[])[next.current % MAX_RIPPLES]!;
    slot.set(hit.x, hit.z, t, Math.min(1.4, 0.5 + moved * 6));
    next.current++;
  });

  return (
    <mesh ref={mesh} rotation-x={-Math.PI / 2} material={material} frustumCulled={false}>
      <planeGeometry args={[240, 220, segments, segments]} />
    </mesh>
  );
}
