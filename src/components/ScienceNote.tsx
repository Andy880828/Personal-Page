import { FlaskConical } from 'lucide-react';
import { noteFor, SOURCES, type ScienceNote as Note } from '@/content/science';

/**
 * 段落的科學註記：這一段的深度帶發生什麼事、畫面裡對應的現象、以及來源。
 * 寫成野外筆記的樣子（等寬字的標頭 + 一段說明），不是卡片。
 */
export default function ScienceNote({ section, className = '' }: { section: Note['section']; className?: string }) {
  const n = noteFor(section);
  return (
    <aside
      aria-label={`科學註記：${n.title}`}
      data-testid="science-note"
      data-reveal
      className={`max-w-xl border-l border-biolum/40 pl-5 ${className}`}
    >
      <p className="flex items-center gap-2 font-mono text-[0.7rem] tracking-[0.18em] text-biolum uppercase">
        <FlaskConical size={13} aria-hidden="true" />
        field note
      </p>
      <h3 className="mt-1.5 text-base font-bold text-foam">{n.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink/85">{n.body}</p>
      <p className="mt-2 text-sm text-mist">
        <span className="font-mono text-[0.7rem] text-haze">畫面 →</span> {n.seen}
      </p>
      <p className="mt-2 font-mono text-[0.68rem] text-haze">
        來源：
        {n.sources.map((id, i) => {
          const s = SOURCES.find((x) => x.id === id)!;
          return (
            <span key={id}>
              {i > 0 && '、'}
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-haze/60 underline-offset-2 hover:text-foam"
              >
                [{id}]
              </a>
            </span>
          );
        })}
      </p>
    </aside>
  );
}
