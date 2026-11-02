import { useEffect, useRef } from 'react';
import { formatDepth } from '@/lib/scroll';
import { useSiteStore } from '@/store/useSiteStore';

/** 小螢幕用的深度讀數（放在導覽列裡，不蓋住內容） */
export default function DepthReadout({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let last = '';
    const apply = (d: number) => {
      const text = `${formatDepth(d)} m`;
      if (text !== last && ref.current) ref.current.textContent = last = text;
    };
    apply(useSiteStore.getState().depth);
    return useSiteStore.subscribe((s, prev) => {
      if (s.depth !== prev.depth) apply(s.depth);
    });
  }, []);
  return (
    <span ref={ref} aria-hidden="true" className={`font-mono text-xs text-mist tabular-nums ${className}`}>
      0 m
    </span>
  );
}
