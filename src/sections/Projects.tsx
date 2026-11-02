import { useMemo, useRef } from 'react';
import { categoryLabels, projects } from '@/content/projects';
import type { ProjectCategory } from '@/content/types';
import { useReveal } from '@/hooks/useReveal';
import { useSiteStore } from '@/store/useSiteStore';
import SectionHeader from '@/components/SectionHeader';
import ProjectCard from '@/components/ProjectCard';

const FILTERS: (ProjectCategory | 'all')[] = ['all', 'agent', 'selfhost', 'data', 'web', 'bio'];

export default function Projects() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);
  const filter = useSiteStore((s) => s.projectFilter);
  const setFilter = useSiteStore((s) => s.setProjectFilter);
  const list = useMemo(
    () => (filter === 'all' ? projects : projects.filter((p) => p.categories.includes(filter))),
    [filter],
  );
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
      className="relative px-5 py-[18vh] sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          id="projects"
          depth="200 m"
          label="Projects"
          title="最近在潛的地方"
          lead="2026 年起專注在給 AI agent 用的 CLI 與自架服務；網站與 eDNA 資料流是更早的作品，也一起留在這裡。"
        />

        <div role="group" aria-label="依類別篩選作品" className="mt-10 flex flex-wrap gap-2" data-reveal>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                filter === f ? 'border-transparent bg-foam text-deep' : 'hairline text-mist hover:text-foam'
              }`}
            >
              {f === 'all' ? '全部' : categoryLabels[f]}
              <span className="ml-1.5 font-mono text-xs opacity-60 tabular-nums">{counts[f] ?? 0}</span>
            </button>
          ))}
        </div>

        <p className="sr-only" aria-live="polite">
          顯示 {list.length} 個作品
        </p>

        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {list.map((p, i) => {
            const featured = filter === 'all' && i < 2;
            return (
              <li key={p.slug} className={`min-w-0 ${featured ? 'md:col-span-2' : ''}`} data-project={p.slug}>
                <ProjectCard project={p} featured={featured} />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
