import { useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { MathUtils } from 'three';
import { useSiteStore } from '@/store/useSiteStore';
import { cameraPitch, cameraY } from './path';
import { isFrozen } from './time';

/**
 * 相機完全由捲動位置 pos 決定（Lenis 已經做過平滑，這裡只再補一點阻尼）；
 * 滑鼠帶來很輕的視差，凍結模式下沒有。
 */
export default function CameraRig() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  useEffect(() => {
    // 直式螢幕視野放寬，讓兩側的 3D 物件不被裁掉
    const portrait = size.width < size.height;
    (camera as { fov?: number }).fov = portrait ? 68 : 52;
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  useFrame((state, delta) => {
    const pos = useSiteStore.getState().pos;
    const frozen = isFrozen();
    const targetY = cameraY(pos);
    const targetPitch = cameraPitch(pos);
    const px = frozen ? 0 : state.pointer.x * 0.55;
    const py = frozen ? 0 : state.pointer.y * 0.035;
    const k = frozen ? 1 : 1 - Math.exp(-delta * 8);
    camera.position.y = MathUtils.lerp(camera.position.y, targetY, k);
    camera.position.x = MathUtils.lerp(camera.position.x, px, frozen ? 1 : 1 - Math.exp(-delta * 2.5));
    camera.position.z = 0;
    camera.rotation.order = 'YXZ';
    camera.rotation.x = MathUtils.lerp(camera.rotation.x, targetPitch + py, k);
    camera.rotation.y = MathUtils.lerp(camera.rotation.y, -px * 0.04, k);
  });
  return null;
}
