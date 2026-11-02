import { useEffect, useRef, useState } from 'react';
import { experience } from '@/content/experience';
import type { ExperienceItem } from '@/content/types';
import { useReveal } from '@/hooks/useReveal';
import { formatDepth } from '@/lib/scroll';
import SectionHeader from '@/components/SectionHeader';

const KIND: Record<ExperienceItem['kind'], { label: string; color: string }> = {
  edu: { label: '學歷', color: '#7cc8ff' },
  work: { label: '工作', color: '#ffb86b' },
  abroad: { label: '海外', color: '#ff7eb6' },
  build: { label: '開發', color: '#4ff0d2' },
};

/** 每筆經歷對應的深度：1,000 m 到 3,800 m 平均分配，越近期越深 */
const itemDepth = (i: number) => 1000 + (i * 2800) / Math.max(1, experience.length - 1);

export default function Experience() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    items.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const current = experience[active] ?? experience[0]!;

  return (
    <section
      id="experience"
      ref={scope}
      aria-labelledby="experience-title"
      className="relative px-5 py-[18vh] sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          id="experience"
          depth="1,000 m"
          label="Experience"
          title="一路潛下來的軌跡"
          lead="越往下越接近現在。"
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          {/* 深度 × 年份計：只給視覺用，內容在右邊的清單 */}
          <div aria-hidden="true" className="hidden lg:block">
            <div className="sticky top-[30vh] font-mono">
              <p className="text-xs tracking-[0.25em] text-haze uppercase">depth</p>
              <p className="text-5xl text-foam tabular-nums">
                {formatDepth(itemDepth(active))}
                <span className="ml-2 text-lg text-mist">m</span>
              </p>
              <p className="mt-8 text-xs tracking-[0.25em] text-haze uppercase">year</p>
              <p className="text-[6.5rem] leading-none font-bold text-biolum tabular-nums [text-shadow:0_0_40px_rgb(79_240_210/0.35)]">
                {current.start.slice(0, 4)}
              </p>
            </div>
          </div>

          <ol className="relative border-l border-foam/15 pl-8 sm:pl-10">
            {experience.map((item, i) => {
              const k = KIND[item.kind];
              const isActive = i === active;
              return (
                <li
                  key={`${item.start}-${item.org}`}
                  ref={(el) => {
                    items.current[i] = el;
                  }}
                  data-index={i}
                  data-reveal
                  className="relative pb-14 last:pb-0"
                >
                  <span
                    aria-hidden="true"
                    className="absolute top-2 -left-[calc(2rem+5px)] size-[9px] rounded-full transition-shadow duration-700 sm:-left-[calc(2.5rem+5px)]"
                    style={{
                      background: k.color,
                      boxShadow: isActive ? `0 0 0 6px ${k.color}22, 0 0 28px 4px ${k.color}` : `0 0 10px ${k.color}88`,
                    }}
                  />
                  <p className="font-mono text-sm text-mist tabular-nums">
                    <time dateTime={item.start.replace('/', '-')}>{item.start}</time>
                    {' – '}
                    {item.end ? <time dateTime={item.end.replace('/', '-')}>{item.end}</time> : '現在'}
                    <span className="ml-3 text-xs tracking-widest" style={{ color: k.color }}>
                      {k.label}
                    </span>
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-foam sm:text-2xl">{item.org}</h3>
                  <p className="mt-1 text-ink/85">
                    {item.title}
                    {item.note && <span className="text-mist">｜{item.note}</span>}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
