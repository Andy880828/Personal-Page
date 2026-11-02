import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

/** 後製（tier ≥ 2 才載入）：bloom 讓生物光與夕陽發亮、加上暗角 */
export default function Effects() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.25} intensity={0.7} radius={0.7} />
      <Vignette offset={0.28} darkness={0.62} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
