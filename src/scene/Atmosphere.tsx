import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Color, FogExp2, PMREMGenerator, type DirectionalLight, type HemisphereLight } from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { useSiteStore } from '@/store/useSiteStore';
import { fogDensity, sunlight, waterColor } from './path';
import { smoothstep } from '@/lib/math';

const ABOVE_FOG = new Color('#3a5d78');

/**
 * 霧、背景色、燈光與環境貼圖：
 * - 海面上：淡霧接地平線
 * - 水下：霧色 = 背景色 = 依深度變化的水色，越深越濃；陽光隨深度衰減
 */
export default function Atmosphere() {
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl);
  const sun = useRef<DirectionalLight>(null);
  const hemi = useRef<HemisphereLight>(null);
  const fog = useMemo(() => new FogExp2('#0b4f7a', 0.03), []);
  const bg = useMemo(() => new Color('#0b4f7a'), []);

  useEffect(() => {
    scene.fog = fog;
    scene.background = bg;
    // 用程式產生的室內環境當反射來源（不下載 HDR）；失敗時（例如測試用的模擬 GL）就不用環境貼圖
    let pmrem: PMREMGenerator | null = null;
    let env: { dispose: () => void } | null = null;
    try {
      pmrem = new PMREMGenerator(gl);
      const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = tex;
      scene.environmentIntensity = 0.6;
      env = tex;
    } catch {
      scene.environment = null;
    }
    return () => {
      scene.fog = null;
      scene.background = null;
      scene.environment = null;
      env?.dispose();
      pmrem?.dispose();
    };
  }, [scene, gl, fog, bg]);

  useFrame(({ camera }) => {
    const pos = useSiteStore.getState().pos;
    const above = camera.position.y > 0;
    if (above) {
      fog.color.copy(ABOVE_FOG);
      fog.density = 0.0035;
      bg.copy(ABOVE_FOG);
    } else {
      const [r, g, b] = waterColor(Math.max(pos, 0.5));
      fog.color.setRGB(r, g, b);
      bg.setRGB(r, g, b);
      fog.density = fogDensity(pos);
    }
    const light = sunlight(pos);
    if (sun.current) {
      sun.current.intensity = above ? 2.2 : 0.2 + 2.4 * light;
      sun.current.position.set(camera.position.x + 6, camera.position.y + 30, camera.position.z + 4);
      sun.current.target.position.set(camera.position.x, camera.position.y - 10, camera.position.z - 12);
      sun.current.target.updateMatrixWorld();
    }
    if (hemi.current) hemi.current.intensity = 0.35 + 0.9 * light + 1.1 * smoothstep(4.8, 5.6, pos);
    scene.environmentIntensity = 0.15 + 0.6 * light;
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={['#bfe6ff', '#02101f', 1]} />
      <directionalLight ref={sun} color="#cfeaff" intensity={2} />
    </>
  );
}
