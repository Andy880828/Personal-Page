import { useRef, type ReactNode } from 'react';
import { useReducedMotion } from '@/store/useSiteStore';

/**
 * 指標跟隨的 3D 傾斜 + 光澤。只在有滑鼠（hover）時啟用；觸控與減少動態時是靜態卡片。
 * 用 CSS 變數更新，不觸發 React 重繪。
 */
export default function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const reduced = useReducedMotion();

  const onMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType !== 'mouse' || !ref.current) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty('--rx', `${(0.5 - y) * 7}deg`);
      el.style.setProperty('--ry', `${(x - 0.5) * 9}deg`);
      el.style.setProperty('--gx', `${x * 100}%`);
      el.style.setProperty('--gy', `${y * 100}%`);
      el.style.setProperty('--glow', '1');
    });
  };
  const onLeave = () => {
    cancelAnimationFrame(frame.current);
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--glow', '0');
  };

  return (
    <div className="h-full [perspective:1100px]">
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={`relative transition-transform duration-500 ease-[var(--ease-tide)] [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d] ${className}`}
      >
        {children}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[var(--glow,0)] transition-opacity duration-500"
          style={{
            background:
              'radial-gradient(420px circle at var(--gx,50%) var(--gy,50%), rgb(79 240 210 / 0.13), transparent 45%)',
          }}
        />
      </div>
    </div>
  );
}
