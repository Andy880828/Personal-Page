import { lazy, Suspense, useEffect, useRef, type Ref } from 'react';
import { useSiteStore } from '@/store/useSiteStore';
import { waterColor } from '@/scene/path';
import { smoothstep } from '@/lib/math';

const PaperBackdrop = lazy(() => import('./PaperBackdrop'));

const toCss = ([r, g, b]: [number, number, number]) =>
  `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`;

/**
 * 永遠存在的底層背景：
 * - 純 CSS：海面的暮色漸層 + 隨深度變暗的海水色（tier 0 只有這層，也是 3D 載入前的底色）
 * - tier 0：接近海床時浮出一張靜態等深線，沒有 3D 也知道到底了
 * - 3D 載入期間（tier ≥ 1）：Paper Shaders 的流動漸層，場景畫出第一幀後淡出並卸載
 */
export default function Backdrop() {
  const water = useRef<HTMLDivElement>(null);
  const sky = useRef<HTMLDivElement>(null);
  const floor = useRef<SVGSVGElement>(null);
  const tier = useSiteStore((s) => s.tier);
  const sceneReady = useSiteStore((s) => s.sceneReady);

  useEffect(() => {
    const apply = (pos: number) => {
      if (water.current) water.current.style.backgroundColor = toCss(waterColor(pos));
      if (sky.current) sky.current.style.opacity = String(1 - smoothstep(0.2, 0.7, pos));
      if (floor.current) floor.current.style.opacity = String(smoothstep(4.6, 5.6, pos));
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
      {tier === 0 && <FloorContours ref={floor} />}
      {!!tier && !sceneReady && (
        <Suspense fallback={null}>
          <PaperBackdrop />
        </Suspense>
      )}
    </div>
  );
}

/** 海床等深線：幾條錯開的起伏線，越下面越密、越亮，像聲納畫出的海床剖面 */
const CONTOURS = Array.from({ length: 9 }, (_, i) => {
  const y = 520 + i * 32;
  const a = 18 + i * 3;
  const d = Array.from({ length: 61 }, (_, k) => {
    const x = k * 20;
    const t = k / 5;
    const dy = Math.sin(t * 0.9 + i * 0.7) * a + Math.sin(t * 2.3 + i) * a * 0.35;
    return `${k ? 'L' : 'M'}${x} ${(y + dy).toFixed(1)}`;
  }).join(' ');
  return { d, o: 0.08 + i * 0.03 };
});

function FloorContours({ ref }: { ref: Ref<SVGSVGElement> }) {
  return (
    <svg
      ref={ref}
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMax slice"
      style={{ opacity: 0 }}
    >
      {CONTOURS.map((c) => (
        <path key={c.d} d={c.d} fill="none" stroke="#7fd8e6" strokeOpacity={c.o} strokeWidth={1.2} />
      ))}
    </svg>
  );
}
