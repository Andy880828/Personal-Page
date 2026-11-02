import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, Plane, Vector3, type PointLight } from 'three';
import { useSiteStore } from '@/store/useSiteStore';
import { sunlight } from './path';
import { isFrozen } from './time';
import { cursorWorld } from './cursor';

const plane = new Plane(new Vector3(0, 0, 1), 0);
const hit = new Vector3();

/**
 * 深海探照燈：沒有陽光的深度（中層帶以下），游標變成一盞跟著走的燈，
 * 照亮海床、岩塊、探測器；浮游生物靠近游標時也會更亮（Plankton 讀 cursorWorld）。
 */
export default function CursorLight() {
  const light = useRef<PointLight>(null);
  useFrame((state, delta) => {
    const l = light.current;
    if (!l) return;
    const pos = useSiteStore.getState().pos;
    const dark = 1 - sunlight(pos);
    const target = isFrozen() ? 0 : dark * 55;
    l.intensity = MathUtils.lerp(l.intensity, target, 1 - Math.exp(-delta * 6));
    l.visible = l.intensity > 0.5;
    if (!l.visible) return;
    state.raycaster.setFromCamera(state.pointer, state.camera);
    plane.constant = 12;
    if (state.raycaster.ray.intersectPlane(plane, hit)) {
      cursorWorld.lerp(hit, 1 - Math.exp(-delta * 10));
      l.position.copy(cursorWorld);
    }
  });
  return <pointLight ref={light} color="#bfe9ff" intensity={0} distance={26} decay={1.6} />;
}
