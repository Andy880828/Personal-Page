import { useEffect, useRef } from 'react';
import { SECTIONS, SECTION_COUNT } from '@/lib/sections';
import { formatDepth, posToSectionIndex } from '@/lib/scroll';
import { useSiteStore } from '@/store/useSiteStore';

/**
 * 右側深度計：數字與指針用 subscribe 直接改 DOM，不觸發 React 重繪。
 * 螢幕閱讀器不需要每一幀的深度，所以整塊 aria-hidden；段落資訊由導覽列的 aria-current 提供。
 */
export default function DepthHUD() {
  const value = useRef<HTMLSpanElement>(null);
  const zone = useRef<HTMLSpanElement>(null);
  const needle = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lastText = '';
    const apply = (pos: number, depth: number) => {
      const text = formatDepth(depth);
      if (text !== lastText) {
        lastText = text;
        if (value.current) value.current.textContent = text;
      }
      if (zone.current) zone.current.textContent = SECTIONS[posToSectionIndex(pos)]!.zone;
      if (needle.current) needle.current.style.transform = `translateY(${(pos / SECTION_COUNT) * 100}%)`;
    };
    const s = useSiteStore.getState();
    apply(s.pos, s.depth);
    return useSiteStore.subscribe((st, prev) => {
      if (st.pos !== prev.pos) apply(st.pos, st.depth);
    });
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none">
      <div className="fixed top-1/2 right-6 z-30 hidden h-[52vh] -translate-y-1/2 lg:block">
        <div className="relative flex h-full gap-3">
          <div className="relative h-full w-px bg-foam/15">
            {SECTIONS.map((s, i) => (
              <span
                key={s.id}
                className="absolute -left-1 h-px w-2 bg-foam/35"
                style={{ top: `${(i / SECTION_COUNT) * 100}%` }}
              />
            ))}
            <div ref={needle} className="absolute inset-x-0 top-0 h-full">
              <span className="absolute -left-[3px] size-[7px] rounded-full bg-biolum shadow-[0_0_12px_var(--color-biolum)]" />
            </div>
          </div>
          <div className="flex flex-col justify-between font-mono text-[0.65rem] text-haze">
            {SECTIONS.map((s) => (
              <span key={s.id}>{formatDepth(s.depthStart)}</span>
            ))}
            <span>4,000</span>
          </div>
        </div>
        <div className="absolute -bottom-14 right-0 text-right font-mono">
          <div className="text-xl text-foam tabular-nums">
            <span ref={value}>0</span>
            <span className="ml-1 text-xs text-mist">m</span>
          </div>
          <span ref={zone} className="text-[0.7rem] tracking-widest text-mist">
            海面
          </span>
        </div>
      </div>
    </div>
  );
}
