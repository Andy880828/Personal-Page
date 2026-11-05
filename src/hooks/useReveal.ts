import { useEffect, type RefObject } from 'react';
import { loadMotion } from '@/lib/motion';
import { flags } from '@/lib/env';
import { useReducedMotion } from '@/store/useSiteStore';

/**
 * 容器內帶 data-reveal 的元素在進入畫面時浮上來。
 * 動態套件晚於首屏載入，所以只隱藏「還在畫面下方」的元素，已經看得到的不會閃一下。
 * 減少動態與測試模式下不做動畫。
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || flags.test) return;
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;
    void loadMotion().then(({ gsap, ScrollTrigger }) => {
      if (cancelled || !scope.current) return;
      ctx = gsap.context(() => {
        const items = gsap.utils
          .toArray<HTMLElement>('[data-reveal]', scope.current)
          .filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.92);
        if (!items.length) return;
        // 只用 opacity，不用 autoAlpha（autoAlpha 會設 visibility: hidden，還沒浮出的連結與按鈕就 Tab 不到）；
        // 模糊也降到 2px，捲動途中不會拍到糊掉的標題
        gsap.set(items, { opacity: 0, y: 28, filter: 'blur(2px)' });
        ScrollTrigger.batch(items, {
          start: 'top 88%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 1.1,
              ease: 'expo.out',
              stagger: 0.08,
              overwrite: true,
            }),
        });
      }, scope.current);
    });
    // 鍵盤使用者 Tab 到還沒浮出的元素時，立刻讓它出現
    const el = scope.current;
    const onFocus = (e: FocusEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-reveal]');
      if (target) {
        target.style.opacity = '1';
        target.style.transform = 'none';
        target.style.filter = 'none';
      }
    };
    el?.addEventListener('focusin', onFocus);
    return () => {
      el?.removeEventListener('focusin', onFocus);
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced, scope]);
}
