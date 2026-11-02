import { lazy, Suspense, useEffect, useRef } from 'react';
import { useSiteStore } from '@/store/useSiteStore';
import { waterColor } from '@/scene/path';
import { smoothstep } from '@/lib/math';

const PaperBackdrop = lazy(() => import('./PaperBackdrop'));

const toCss = ([r, g, b]: [number, number, number]) =>
  `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`;

/**
 * 永遠存在的底層背景：
 * - 純 CSS：海面的暮色漸層 + 隨深度變暗的海水色（tier 0 只有這層，也是 3D 載入前的底色）
 * - 3D 載入期間（tier ≥ 1）：Paper Shaders 的流動漸層，場景畫出第一幀後淡出並卸載
 */
export default function Backdrop() {
  const water = useRef<HTMLDivElement>(null);
  const sky = useRef<HTMLDivElement>(null);
  const tier = useSiteStore((s) => s.tier);
  const sceneReady = useSiteStore((s) => s.sceneReady);

  useEffect(() => {
    const apply = (pos: number) => {
      if (water.current) water.current.style.backgroundColor = toCss(waterColor(pos));
      if (sky.current) sky.current.style.opacity = String(1 - smoothstep(0.2, 0.7, pos));
    };
    apply(useSiteStore.getState().pos);
    return useSiteStore.subscribe((s, prev) => {
      if (s.pos !== prev.pos) apply(s.pos);
    });
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <div ref={water} className="absolute inset-0" style={{ backgroundColor: '#0f587f' }} />
      <div
        ref={sky}
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 70% at 70% 52%, rgb(255 184 107 / 0.45), transparent 60%), linear-gradient(180deg, #071a33 0%, #0c3358 34%, #2a5f86 48%, #123f61 58%, #04203a 100%)',
        }}
      />
      {!!tier && !sceneReady && (
        <Suspense fallback={null}>
          <PaperBackdrop />
        </Suspense>
      )}
    </div>
  );
}
