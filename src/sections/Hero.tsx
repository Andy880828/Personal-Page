import { useEffect, useRef } from 'react';
import { navigate } from '@/lib/router';
import { useSiteStore } from '@/store/useSiteStore';
import { smoothstep } from '@/lib/math';
import { ArrowDown } from 'lucide-react';
import { profile } from '@/content/profile';
import { scrollToElement, scrollToSection } from '@/lib/scroller';
import { projects } from '@/content/projects';

import RiseText from '@/components/RiseText';

const FEATURED = projects.filter((p) => p.featured !== undefined).sort((a, b) => a.featured! - b.featured!);

/**
 * 0 m：海面。高度 150vh、內容 sticky，讓相機有一整個畫面的捲動距離穿過水面。
 */
export default function Hero() {
  const content = useRef<HTMLDivElement>(null);

  // 首屏內容跟著捲動淡出上移：sticky 的內容在入水後會被推到頁頂、和導覽列的名字重疊，
  // 在那之前就讓它退場（減少動態時也照做：這是捲動位置決定的，不是計時動畫）
  useEffect(() => {
    const apply = (pos: number) => {
      const el = content.current;
      if (!el) return;
      const k = smoothstep(0.72, 0.98, pos);
      el.style.opacity = String(1 - k);
      el.style.transform = k > 0 ? `translateY(${-k * 48}px)` : '';
      el.style.visibility = k >= 0.999 ? 'hidden' : '';
    };
    apply(useSiteStore.getState().pos);
    return useSiteStore.subscribe((st, prev) => {
      if (st.pos !== prev.pos) apply(st.pos);
    });
  }, []);

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative h-[150vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-end px-5 pb-[14vh] sm:px-10 lg:px-16">
        <div ref={content} className="max-w-6xl will-change-[opacity,transform]">
          <h1
            id="hero-title"
            className="text-[clamp(3.75rem,11vw,9.5rem)] leading-[0.95] font-black tracking-tight text-foam [text-shadow:0_6px_40px_rgb(1_4_9/0.45)]"
          >
            <RiseText text={profile.name} />
          </h1>
          <p className="mt-6 max-w-3xl text-[clamp(1.25rem,2.6vw,2rem)] leading-snug font-medium text-foam [text-shadow:0_2px_18px_rgb(1_4_9/0.6)]">
            {/* 手機：英文名自己一行、不帶破折號；職稱各自不斷行，斜線放在第二個職稱前面，換行時不會掛在行尾 */}
            <span className="block sm:inline">{profile.nameEn}</span>
            <span className="mx-3 hidden text-ember sm:inline" aria-hidden="true">
              —
            </span>
            <span className="whitespace-nowrap">{profile.role}</span>{' '}
            <span className="whitespace-nowrap">
              <span className="mr-2 text-ember" aria-hidden="true">
                /
              </span>
              {profile.roleSecond}
            </span>
          </p>
          <p className="mt-2 text-base text-foam/90 sm:text-lg [text-shadow:0_2px_14px_rgb(1_4_9/0.7)]">
            {profile.roleZh}
          </p>
          <p className="mt-3 max-w-xl text-base text-ink/90 sm:text-lg [text-shadow:0_2px_14px_rgb(1_4_9/0.7)]">
            {profile.tagline}
          </p>

          {/* 按鈕帶一點暗底與陰影：入水時亮的水線劃過按鈕列也看得清 */}
          <div className="mt-9 flex flex-wrap items-center gap-x-3 gap-y-4">
            <button
              type="button"
              onClick={() => scrollToSection('about')}
              className="group inline-flex items-center gap-2 rounded-full bg-foam px-6 py-3 font-medium text-deep shadow-[0_6px_24px_rgb(1_4_9/0.4)] transition-transform hover:-translate-y-0.5"
            >
              往下潛
              <ArrowDown size={18} aria-hidden="true" className="transition-transform group-hover:translate-y-0.5" />
            </button>
            <a
              href="/project"
              onClick={(e) => {
                e.preventDefault();
                navigate('/project');
              }}
              className="rounded-full border border-foam/40 bg-deep/45 px-6 py-3 text-foam shadow-[0_6px_24px_rgb(1_4_9/0.35)] transition-colors hover:border-foam hover:bg-foam/10"
            >
              直接看作品
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('contact');
              }}
              // 手機上兩顆主按鈕一行，「聯絡我」移到下面那一行，不會自己掉到第二行變孤兒
              className="hidden rounded-full px-4 py-3 text-foam underline decoration-foam/40 underline-offset-4 transition-colors hover:decoration-foam sm:inline-flex"
            >
              聯絡我
            </a>
          </div>
          <p className="mt-7 font-mono text-xs text-foam/85 [text-shadow:0_1px_10px_rgb(1_4_9/0.8)]">
            <span className="text-haze">代表作</span>{' '}
            {FEATURED.map((p, i) => (
              <span key={p.slug}>
                {i > 0 && <span aria-hidden="true"> · </span>}
                <a
                  href="/project"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.querySelector<HTMLElement>(`[data-project="${p.slug}"]`);
                    if (el) scrollToElement(el);
                    else navigate('/project');
                  }}
                  className="underline decoration-foam/30 underline-offset-4 hover:text-foam hover:decoration-foam"
                >
                  {p.name}
                </a>
              </span>
            ))}
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('contact');
              }}
              className="ml-3 underline decoration-foam/30 underline-offset-4 sm:hidden"
            >
              聯絡我
            </a>
          </p>
          <p className="mt-3 font-mono text-xs text-foam/85 tabular-nums [text-shadow:0_1px_10px_rgb(1_4_9/0.8)]">
            0 m · 22.6°N 120.3°E · {profile.hometown}
            {/* 指令列只在桌機有入口 */}
            <span className="hidden md:inline">
              {' '}
              · 按 <kbd className="rounded border border-foam/30 px-1.5 py-px font-mono text-[0.7rem] text-foam">
                /
              </kbd>{' '}
              開啟指令列
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
