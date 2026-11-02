import { MeshGradient } from '@paper-design/shaders-react';
import { flags } from '@/lib/env';
import { useReducedMotion } from '@/store/useSiteStore';

/** 3D 場景下載與編譯期間的過場背景：暮色海面的流動漸層 */
export default function PaperBackdrop() {
  const reduced = useReducedMotion();
  const still = reduced || flags.test;
  return (
    <MeshGradient
      className="absolute inset-0 opacity-90"
      colors={['#071a33', '#0b4f7a', '#ffb86b', '#04203a']}
      distortion={0.85}
      swirl={0.35}
      grainOverlay={0.08}
      speed={still ? 0 : 0.35}
      frame={still ? 4200 : 0}
      maxPixelCount={1280 * 720}
    />
  );
}
