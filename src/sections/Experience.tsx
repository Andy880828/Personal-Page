import { useEffect, useRef, useState } from 'react';
import { experience } from '@/content/experience';
import type { ExperienceItem } from '@/content/types';
import { useReveal } from '@/hooks/useReveal';
import SectionHeader from '@/components/SectionHeader';
import { Stratum } from '@/components/Strata';
import { shortSha } from '@/lib/sha';

/**
 * 經歷種類不用分類色（技能與作品已經用那五色代表分類，同一個顏色不該有兩種意思），
 * 改用中性色的節點形狀：工作與專案是實心、學歷與海外是空心。
 */
const KIND: Record<ExperienceItem['kind'], { label: string; filled: boolean }> = {
  edu: { label: '學歷', filled: false },
  // 職訓課程不算學歷
  training: { label: '進修', filled: false },
  work: { label: '工作', filled: true },
  abroad: { label: '海外', filled: false },
  build: { label: '自主開發', filled: true },
};
const NODE = '#dff3ff';
const STRATUM = '#9dbccf';

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
      className="relative px-5 py-24 lg:py-[18vh] sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader id="experience" title="經歷與學歷" lead="由新到舊；次要經歷收成精簡列。" />

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,0.5fr)_minmax(0,1.5fr)]">
          {/* 深度 × 年份計：只給視覺用，內容在右邊的清單 */}
          <div aria-hidden="true" className="hidden lg:block">
            <div className="sticky top-[30vh] font-mono">
              <p className="text-xs tracking-[0.25em] text-haze">年份</p>
              <p className="text-[6rem] leading-none font-bold text-biolum tabular-nums">{current.start.slice(0, 4)}</p>
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
                  className={`relative isolate ${item.minor ? 'py-4' : 'py-7'}`}
                >
                  <Stratum color={STRATUM} index={i} total={experience.length} />
                  <span
                    aria-hidden="true"
                    className={`absolute ${item.minor ? 'top-[1.35rem]' : 'top-9'} -left-[calc(2rem+5px)] size-[9px] rounded-full border-2 transition-[box-shadow,transform] duration-500 sm:-left-[calc(2.5rem+5px)]`}
                    style={{
                      borderColor: NODE,
                      background: k.filled ? NODE : 'var(--color-deep)',
                      boxShadow: isActive ? '0 0 0 5px rgb(223 243 255 / 0.15)' : 'none',
                      transform: isActive ? 'scale(1.35)' : 'scale(1)',
                    }}
                  />
                  <p className="font-mono text-sm text-mist tabular-nums">
                    <time dateTime={item.start.replace('/', '-')}>{item.start}</time>
                    {' – '}
                    {item.end ? <time dateTime={item.end.replace('/', '-')}>{item.end}</time> : '至今'}
                    <span className="ml-3 text-xs tracking-widest text-haze">{k.label}</span>
                    {/* 沉積層的短碼：很淡的裝飾，不搶日期 */}
                    <span aria-hidden="true" className="ml-3 text-[0.7rem] text-haze/60">
                      {shortSha(item)}
                    </span>
                  </p>
                  {item.minor ? (
                    <p className="mt-1 text-ink/85">
                      <span className="font-bold text-foam">{item.org}</span>
                      <span className="text-mist">｜{item.title}</span>
                    </p>
                  ) : (
                    <>
                      <h3 className="mt-2 text-xl font-bold text-foam sm:text-2xl">{item.org}</h3>
                      <p className="mt-1 text-ink/85">
                        {item.title}
                        {item.note && <span className="text-mist">｜{item.note}</span>}
                      </p>
                      {item.highlights && item.highlights.length > 0 && (
                        <ul className="mt-3 space-y-1.5 text-sm text-mist">
                          {item.highlights.map((h) => (
                            <li key={h} className="flex gap-2.5">
                              <span aria-hidden="true" className="mt-[0.65em] h-px w-2.5 shrink-0 bg-foam/40" />
                              {h}
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
