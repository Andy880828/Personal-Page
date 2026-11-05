import { useMemo, useRef } from 'react';
import { Lock } from 'lucide-react';
import { categoryLabels, projects } from '@/content/projects';
import type { ProjectCategory } from '@/content/types';
import { useReveal } from '@/hooks/useReveal';
import { useSiteStore } from '@/store/useSiteStore';
import SectionHeader from '@/components/SectionHeader';
import ProjectCard from '@/components/ProjectCard';

const FILTERS: (ProjectCategory | 'all')[] = ['all', 'mining', 'viz', 'workflow', 'agent', 'web'];

export default function Projects() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);
  const filter = useSiteStore((s) => s.projectFilter);
  const setFilter = useSiteStore((s) => s.setProjectFilter);
  const list = useMemo(
    () => (filter === 'all' ? projects : projects.filter((p) => p.categories.includes(filter))),
    [filter],
  );
  // 全部：只有站主挑的精選作品是卡片（有截圖、有線上展示、最能代表定位的放前面），其餘進「其他作品」清單；
  // 篩選後符合的作品都用卡片，已封存的早期作品一律放清單
  const featuredList = projects.filter((p) => p.featured !== undefined).sort((a, b) => a.featured! - b.featured!);
  const current = filter === 'all' ? featuredList : list.filter((p) => p.status !== 'archived');
  const earlier =
    filter === 'all' ? list.filter((p) => p.featured === undefined) : list.filter((p) => p.status === 'archived');
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects.length };
    for (const p of projects) for (const k of p.categories) c[k] = (c[k] ?? 0) + 1;
    return c;
  }, []);

  return (
    <section
      id="projects"
      ref={scope}
      aria-labelledby="projects-title"
      className="relative px-5 py-24 lg:py-[18vh] sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          id="projects"
          title={filter === 'all' ? '精選作品' : `作品：${categoryLabels[filter]}`}
          lead={
            filter === 'all'
              ? '最前面三個最能代表我現在做的事：用資料計分的活動平台、把 eDNA 定序資料整理成物種名錄的工具，以及替主機查漏洞的指令列工具。其他作品在後面的清單；用分類鈕可以只看某一類。'
              : `${list.length} 個作品。`
          }
        />

        <div role="group" aria-label="依類別篩選作品" className="mt-10 flex flex-wrap gap-2" data-reveal>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`min-h-11 rounded-full border px-4 py-1.5 text-sm transition-colors ${
                filter === f ? 'border-transparent bg-foam text-deep' : 'hairline text-mist hover:text-foam'
              }`}
            >
              {f === 'all' ? '全部' : categoryLabels[f]}
              <span className="ml-1.5 font-mono text-xs opacity-85 tabular-nums">{counts[f] ?? 0}</span>
            </button>
          ))}
        </div>

        <p className="sr-only" aria-live="polite">
          顯示 {list.length} 個作品
        </p>

        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {current.map((p, i) => {
            // 精選的第一個用寬卡片，其餘兩兩並排
            const featured = filter === 'all' && i < 1;
            return (
              <li key={p.slug} className={`min-w-0 ${featured ? 'md:col-span-2' : ''}`} data-project={p.slug}>
                <ProjectCard project={p} featured={featured} />
              </li>
            );
          })}
        </ul>

        {earlier.length > 0 && (
          <div className="mt-14" data-reveal>
            <h3 className="text-lg font-bold text-foam">{filter === 'all' ? '其他作品' : '已封存的作品'}</h3>
            <ul className="mt-4 divide-y divide-foam/10 border-y border-foam/10">
              {earlier.map((p) => (
                <li key={p.slug} data-project={p.slug} className="min-w-0">
                  <article
                    aria-labelledby={`p-${p.slug}`}
                    className="grid gap-x-6 gap-y-1 py-4 sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_9rem] sm:items-baseline"
                  >
                    <h4 id={`p-${p.slug}`} className="font-bold text-foam">
                      {p.name}
                      <span className="ml-2 font-mono text-xs font-normal text-haze tabular-nums">{p.year}</span>
                      {/* 中文副名換到第二行、整段不斷行，不會斷成「本地轉錄與講／者辨識」 */}
                      {p.nameZh && <span className="block text-sm font-medium text-mist">{p.nameZh}</span>}
                    </h4>
                    <p className="text-sm text-ink/85">{p.summary}</p>
                    <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm sm:justify-end">
                      {p.demo && (
                        <a href={p.demo} target="_blank" rel="noreferrer" className="text-foam hover:text-biolum">
                          線上展示<span className="sr-only">（{p.name}）</span>
                        </a>
                      )}
                      {p.repo && (
                        <a href={p.repo} target="_blank" rel="noreferrer" className="text-foam hover:text-biolum">
                          原始碼<span className="sr-only">（{p.name}，GitHub）</span>
                        </a>
                      )}
                      {!p.repo && (
                        <span className="inline-flex items-center gap-1.5 text-mist">
                          <Lock size={13} aria-hidden="true" />
                          原始碼未公開
                        </span>
                      )}
                      {p.repo && p.note && <span className="text-mist">{p.note}</span>}
                    </p>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
