import { navigate } from '@/lib/router';
import { ArrowDown } from 'lucide-react';
import { profile } from '@/content/profile';
import { scrollToSection } from '@/lib/scroller';
import RiseText from '@/components/RiseText';

/**
 * 0 m：海面。高度 150vh、內容 sticky，讓相機有一整個畫面的捲動距離穿過水面。
 */
export default function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-title" className="relative h-[150vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-end px-5 pb-[14vh] sm:px-10 lg:px-16">
        <div className="max-w-6xl">
          <p className="eyebrow text-foam/80">
            <span className="normal-case">0 m</span> <span className="mx-2 text-foam/40">/</span> 22.6°N 120.3°E ·{' '}
            {profile.hometown}
          </p>
          <p className="mt-6 font-mono text-sm tracking-[0.3em] text-foam/85 uppercase sm:text-base">
            {profile.nameEn}
          </p>
          <h1
            id="hero-title"
            className="mt-1 text-[clamp(4.5rem,15vw,12.5rem)] leading-[0.95] font-black tracking-tight text-foam [text-shadow:0_6px_40px_rgb(1_4_9/0.45)]"
          >
            <RiseText text={profile.name} />
          </h1>
          <p className="mt-6 max-w-3xl text-[clamp(1.25rem,2.6vw,2rem)] leading-snug font-medium text-foam [text-shadow:0_2px_18px_rgb(1_4_9/0.6)]">
            {profile.role}
            <span className="mx-3 text-ember">/</span>
            {profile.roleSecond}
          </p>
          <p className="mt-2 text-base text-foam/80 sm:text-lg">{profile.roleZh}</p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => scrollToSection('about')}
              className="group inline-flex items-center gap-2 rounded-full bg-foam px-6 py-3 font-medium text-deep transition-transform hover:-translate-y-0.5"
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
              className="rounded-full border border-foam/40 px-6 py-3 text-foam backdrop-blur-sm transition-colors hover:border-foam hover:bg-foam/10"
            >
              直接看作品
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
