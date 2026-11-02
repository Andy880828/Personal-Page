import { ExternalLink, Lock } from 'lucide-react';
import { GithubIcon } from './BrandIcons';
import type { Project } from '@/content/types';
import { categoryColors, categoryLabels } from '@/content/projects';
import TiltCard from './TiltCard';
import TerminalCover from './TerminalCover';
import Picture from './Picture';
import recipecube from '@/assets/img/recipecube.webp?w=480;704&format=avif;webp;jpg&as=picture';
import trim2sort from '@/assets/img/trim2sort.webp?w=480;960&format=avif;webp;jpg&as=picture';
import fitness from '@/assets/img/fitness.webp?w=480;960&format=avif;webp;jpg&as=picture';

const images = { recipecube, trim2sort, fitness } as const;

export default function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  const accent = categoryColors[project.categories[0] ?? 'web'];
  return (
    <TiltCard className="panel h-full overflow-hidden rounded-3xl">
      <article
        aria-labelledby={`p-${project.slug}`}
        className={`flex h-full min-w-0 flex-col ${featured ? 'md:grid md:grid-cols-[1.1fr_1fr]' : ''}`}
      >
        <div
          className={`relative overflow-hidden ${
            project.image
              ? featured
                ? 'md:order-2 md:h-full'
                : 'aspect-[16/9]'
              : // 終端機封面只要放得下指令與三行輸出：固定矮高度，大卡片裡靠底對齊，不撐成一大塊空框
                `h-40 ${featured ? 'md:order-2 md:self-end md:h-44' : ''}`
          }`}
        >
          {project.image ? (
            <Picture
              picture={images[project.image]}
              alt={`${project.name} 的畫面截圖`}
              sizes={featured ? '(min-width: 768px) 45vw, 100vw' : '(min-width: 768px) 40vw, 100vw'}
              className="h-full w-full object-cover object-top"
            />
          ) : project.cover ? (
            <TerminalCover prompt={project.cover.prompt} lines={project.cover.lines} accent={accent} />
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.7rem] tracking-widest uppercase">
            <span style={{ color: accent }}>{project.categories.map((c) => categoryLabels[c]).join(' · ')}</span>
            <span className="text-haze tabular-nums">{project.year}</span>
            {project.status === 'active' && (
              <span className="inline-flex items-center gap-1.5 text-biolum">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-biolum" />
                進行中
              </span>
            )}
          </div>

          <h3 id={`p-${project.slug}`} className="mt-3 text-2xl font-bold text-foam">
            {project.name}
            {project.nameZh && <span className="ml-3 text-base font-medium text-mist">{project.nameZh}</span>}
          </h3>
          <p className="mt-3 text-ink/90">{project.summary}</p>

          {project.highlights.length > 0 && (
            <ul className="mt-4 space-y-1.5 text-sm text-mist">
              {project.highlights.slice(0, featured ? 3 : 2).map((h) => (
                <li key={h} className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-[0.65em] h-px w-2.5 shrink-0" style={{ background: accent }} />
                  {h}
                </li>
              ))}
            </ul>
          )}

          <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="使用技術">
            {project.tags.map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-6 text-sm">
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noreferrer"
                className="-my-2 inline-flex items-center gap-1.5 py-2 text-foam hover:text-biolum"
              >
                <GithubIcon size={16} />
                原始碼<span className="sr-only">（{project.name}，GitHub）</span>
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noreferrer"
                className="-my-2 inline-flex items-center gap-1.5 py-2 text-foam hover:text-biolum"
              >
                <ExternalLink size={16} aria-hidden="true" />
                線上展示<span className="sr-only">（{project.name}）</span>
              </a>
            )}
            {project.note && (
              <span className="inline-flex items-center gap-1.5 text-haze">
                {!project.repo && <Lock size={14} aria-hidden="true" />}
                {project.note}
              </span>
            )}
          </div>
        </div>
      </article>
    </TiltCard>
  );
}
