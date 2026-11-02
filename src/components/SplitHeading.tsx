import { useEffect, useRef, type ElementType, type ReactNode } from 'react';
import { loadMotion } from '@/lib/motion';
import { flags } from '@/lib/env';
import { useReducedMotion } from '@/store/useSiteStore';

interface Props {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

/**
 * 段落標題：進入畫面時逐字從水裡浮上來（GSAP SplitText）。讀屏器讀到的是完整文字。
 * 已經在畫面內的標題不做動畫，避免動態套件晚到時閃爍。
 */
export default function SplitHeading({ as: Tag = 'h2', className, children }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || flags.test) return;
    let cancelled = false;
    let cleanup: (() => void) | null = null;
    void Promise.all([loadMotion(), document.fonts.ready]).then(([{ gsap, SplitText }]) => {
      const el = ref.current;
      if (cancelled || !el || el.getBoundingClientRect().top < window.innerHeight * 0.95) return;
      const split = SplitText.create(el, { type: 'chars', charsClass: 'inline-block', aria: 'auto' });
      const tween = gsap.from(split.chars, {
        yPercent: 110,
        rotateX: -70,
        opacity: 0.02,
        filter: 'blur(8px)',
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.035,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onComplete: () => split.revert(),
      });
      cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        split.revert();
      };
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [reduced]);

  return (
    <Tag ref={ref} className={className} style={{ perspective: '600px' }}>
      {children}
    </Tag>
  );
}
