import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { flags } from '@/lib/env';
import { classifyGpu, readGpuInput } from '@/lib/gpu';
import { sectionForRoute } from '@/lib/sections';
import { navigate, usePathname } from '@/lib/router';
import { scrollToPosition, scrollToSection, startScroller, stopScroller, measure } from '@/lib/scroller';
import { isReducedMotion, useSiteStore } from '@/store/useSiteStore';
import Nav from '@/components/Nav';
import DepthHUD from '@/components/DepthHUD';
import Loader from '@/components/Loader';
import Backdrop from '@/components/Backdrop';
import SceneBoundary from '@/components/SceneBoundary';
import Hero from '@/sections/Hero';
import About from '@/sections/About';
import Skills from '@/sections/Skills';
import Projects from '@/sections/Projects';
import Experience from '@/sections/Experience';
import Contact from '@/sections/Contact';

const SceneRoot = lazy(() => import('@/scene/SceneRoot'));

const MOTION_KEY = 'motion-pref';

export default function Site() {
  const pathname = usePathname();
  const tier = useSiteStore((s) => s.tier);
  const reduced = useSiteStore(isReducedMotion);
  const [sceneAllowed, setSceneAllowed] = useState(false);
  const firstRoute = useRef(true);

  // GPU 分級、動態偏好（系統設定 + 使用者切換）
  useEffect(() => {
    const store = useSiteStore.getState();
    store.setTier(classifyGpu(readGpuInput(flags.tier)));
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    store.setSystemReducedMotion(mq.matches);
    const onChange = () => useSiteStore.getState().setSystemReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    try {
      const saved = localStorage.getItem(MOTION_KEY);
      if (saved === 'reduce' || saved === 'full') store.setMotionPref(saved);
    } catch {
      /* 無痕模式或封鎖儲存：用系統設定 */
    }
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // 捲動來源：一般情況 Lenis，減少動態與測試模式用原生捲動
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduce' : 'full';
    if (flags.test) document.documentElement.dataset.test = '1';
    startScroller(!reduced && !flags.test);
    return () => stopScroller();
  }, [reduced]);

  // 場景等第一次繪製完成後才開始下載，不擋首屏
  useEffect(() => {
    if (tier === 0) return;
    const start = () => setSceneAllowed(true);
    if (flags.test) {
      start();
      return;
    }
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(start, { timeout: 1200 });
      return () => window.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(start, 300);
    return () => window.clearTimeout(t);
  }, [tier]);

  // 路由 → 捲到對應段落；未知路徑導回首頁
  useEffect(() => {
    const target = sectionForRoute(pathname);
    if (!target) {
      navigate('/', { replace: true });
      return;
    }
    const immediate = firstRoute.current;
    firstRoute.current = false;
    if (immediate && target === 'hero') return;
    // 等版面量測完成（字體、圖片）再捲
    requestAnimationFrame(() => {
      measure();
      scrollToSection(target, immediate);
    });
  }, [pathname]);

  // 測試掛鉤
  useEffect(() => {
    if (!flags.test && !flags.perf) return;
    window.__site = {
      scrollToPos: (p: number) => scrollToPosition(p),
      frames: () => (window as Window & { __frames?: number }).__frames ?? 0,
      ready: () => useSiteStore.getState().sceneReady,
      tier: () => useSiteStore.getState().tier,
    };
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-foam focus:px-4 focus:py-2 focus:text-deep"
      >
        跳到主要內容
      </a>
      <Backdrop />
      {sceneAllowed && tier > 0 && (
        <SceneBoundary>
          <Suspense fallback={null}>
            <SceneRoot />
          </Suspense>
        </SceneBoundary>
      )}
      <Nav />
      <main id="main" className="relative z-10">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <DepthHUD />
      <Loader />
    </>
  );
}
