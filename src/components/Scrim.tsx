import { useEffect, useRef } from 'react';
import { useSiteStore } from '@/store/useSiteStore';
import { smoothstep } from '@/lib/math';

/**
 * 文字欄後面的暗色遮罩：一層固定在畫面上的圖層（在 3D 之上、內容之下），
 * 透明度跟深度走。淺水段水色最亮才需要它；越深水本身越暗，就慢慢退掉。
 * 以前是放在 About、Skills 兩段裡的 absolute 元素，捲過段落邊界會切出一條硬接縫。
 */
export default function Scrim() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const apply = (pos: number) => {
      if (el.current) el.current.style.opacity = String(smoothstep(0.7, 1.05, pos) * (1 - smoothstep(3.0, 3.8, pos)));
    };
    apply(useSiteStore.getState().pos);
    return useSiteStore.subscribe((s, prev) => {
      if (s.pos !== prev.pos) apply(s.pos);
    });
  }, []);
  return (
    <div ref={el} aria-hidden="true" className="scrim pointer-events-none fixed inset-0 z-[2]" style={{ opacity: 0 }} />
  );
}
