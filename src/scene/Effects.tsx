import { Bloom, EffectComposer, FXAA, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import AsciiBand from './AsciiBand';

/** 後製（tier ≥ 2 才載入）：bloom 讓生物光與夕陽發亮、加上暗角；最後是字元掃描帶 */
export default function Effects() {
  return (
    // 不用 MSAA：多重取樣的 render target 配上透射材質在部分 GPU 會閃爍；FXAA 是純後製（SMAA 要多 60 KB 的查表貼圖）
    <EffectComposer multisampling={0}>
      <FXAA />
      <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.25} intensity={0.7} radius={0.7} />
      <Vignette offset={0.28} darkness={0.62} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      {/* 最後讀成字元：分層門檻的掃描帶與 ascii on */}
      <AsciiBand />
    </EffectComposer>
  );
}
