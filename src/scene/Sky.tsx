import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide, ShaderMaterial, type Mesh } from 'three';
import common from './shaders/common.glsl?raw';
import skyFrag from './shaders/sky.glsl?raw';
import { SUN_DIR } from './constants';

const vert = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}`;

/** 暮色天空球：只在相機高於水面時可見，跟著相機移動（視為無限遠） */
export default function Sky() {
  const mesh = useRef<Mesh>(null);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vert,
        fragmentShader: common + skyFrag,
        uniforms: { uSunDir: { value: SUN_DIR } },
        side: BackSide,
        depthWrite: false,
        fog: false,
      }),
    [],
  );
  useFrame(({ camera }) => {
    if (!mesh.current) return;
    mesh.current.visible = camera.position.y > -0.5;
    mesh.current.position.copy(camera.position);
  });
  return (
    <mesh ref={mesh} material={material} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[300, 32, 16]} />
    </mesh>
  );
}
