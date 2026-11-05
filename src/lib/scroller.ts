import type Lenis from 'lenis';
import { SECTIONS, type SectionId } from './sections';
import {
  computeBreakpoints,
  depthAtScroll,
  posToSectionIndex,
  posToScroll,
  scrollForDepth,
  scrollToPos,
} from './scroll';
import { loadMotion } from './motion';
import { useSiteStore } from '@/store/useSiteStore';
import { setSectionSpans } from '@/scene/path';

/**
 * 全站唯一的捲動來源。
 * - 首屏：原生捲動 + passive listener，馬上就能算出 pos。
 * - 動態套件載入後：Lenis（平滑慣性）由 gsap.ticker 驅動，並同步 ScrollTrigger。
 * 減少動態或測試模式時不建立 Lenis。
 */
let lenis: Lenis | null = null;
let breakpoints: number[] = [0, 1];
let lastY = 0;
let lastT = 0;
let resizeObserver: ResizeObserver | null = null;
let generation = 0;
let detachTicker: (() => void) | null = null;
let sleepTicker: (() => void) | null = null;

export function measure() {
  const vh = window.innerHeight;
  const tops = SECTIONS.map((s) => {
    const el = document.getElementById(s.id);
    return el ? el.getBoundingClientRect().top + window.scrollY : 0;
  });
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
  breakpoints = computeBreakpoints(tops, vh, maxScroll);
  // 3D 下潛距離依各段的捲動長度分配：每捲 1 px 潛一樣遠
  setSectionSpans(breakpoints.slice(1).map((b, i) => b - breakpoints[i]!));
  update();
}

export function getBreakpoints() {
  return breakpoints;
}

function update() {
  const y = window.scrollY;
  const now = performance.now();
  const dt = Math.max(1, now - lastT);
  const v = lenis ? lenis.velocity : ((y - lastY) / dt) * 16;
  lastY = y;
  lastT = now;
  const pos = scrollToPos(y, breakpoints);
  const section = SECTIONS[posToSectionIndex(pos)]!.id;
  useSiteStore.getState().setScroll(pos, depthAtScroll(y, breakpoints), v, section);
}

export function startScroller(smooth: boolean) {
  stopScroller();
  const gen = ++generation;
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', measure);
  resizeObserver = new ResizeObserver(() => measure());
  resizeObserver.observe(document.body);
  measure();
  if (!smooth) {
    // 減少動態：讓已經載入過的 GSAP ticker 休眠，不再每幀呼叫 requestAnimationFrame
    sleepTicker?.();
    return;
  }
  void loadMotion().then(({ Lenis: LenisCtor, gsap, ScrollTrigger }) => {
    if (gen !== generation) return;
    lenis = new LenisCtor({ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.4 });
    lenis.on('scroll', () => ScrollTrigger.update());
    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    detachTicker = () => gsap.ticker.remove(tick);
    sleepTicker = () => gsap.ticker.sleep();
    gsap.ticker.wake();
  });
}

export function stopScroller() {
  generation++;
  detachTicker?.();
  detachTicker = null;
  lenis?.destroy();
  lenis = null;
  window.removeEventListener('scroll', update);
  window.removeEventListener('resize', measure);
  resizeObserver?.disconnect();
  resizeObserver = null;
}

/** 捲到某段：段落頂端對齊畫面頂端（第一段是 0） */
export function scrollToSection(id: SectionId, immediate = false) {
  const el = document.getElementById(id);
  if (!el) return;
  const target = id === 'hero' ? 0 : el.getBoundingClientRect().top + window.scrollY;
  if (lenis && !immediate) {
    lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    const smoothNative = !immediate && document.documentElement.dataset.motion !== 'reduce';
    window.scrollTo({ top: target, behavior: (smoothNative ? 'smooth' : 'instant') as ScrollBehavior });
    update();
  }
}

/** 捲到頁面上某個元素（例如首屏「代表作」連到的作品卡），元素頂端停在導覽列下方 */
export function scrollToElement(el: HTMLElement) {
  const target = el.getBoundingClientRect().top + window.scrollY - 96;
  if (lenis) lenis.scrollTo(target, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else {
    const smooth = document.documentElement.dataset.motion !== 'reduce';
    window.scrollTo({ top: target, behavior: (smooth ? 'smooth' : 'instant') as ScrollBehavior });
    update();
  }
}

/** 捲到某個深度（公尺）：用深度樣條反解出捲動位置 */
export function scrollToDepth(depth: number) {
  const target = scrollForDepth(Math.max(0, Math.min(4000, depth)), breakpoints);
  if (lenis) lenis.scrollTo(target, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else {
    const smooth = document.documentElement.dataset.motion !== 'reduce';
    window.scrollTo({ top: target, behavior: (smooth ? 'smooth' : 'instant') as ScrollBehavior });
    update();
  }
}

/** 測試用：直接捲到某個 pos */
export function scrollToPosition(pos: number) {
  window.scrollTo({ top: posToScroll(pos, breakpoints), behavior: 'instant' as ScrollBehavior });
  update();
}
