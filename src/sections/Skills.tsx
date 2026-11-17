import { useRef } from 'react';
import { skills } from '@/content/skills';
import { DNA_SEQUENCE, segmentRange } from '@/lib/dna';
import { useReveal } from '@/hooks/useReveal';
import { useSiteStore } from '@/store/useSiteStore';
import SectionHeader from '@/components/SectionHeader';

/** 1BNA 的真序列（股 A，5′→3′），目前技能在雙螺旋上的那一段亮起 */
function Sequence({ seg, color }: { seg: number; color: string }) {
  const [start, end] = segmentRange(seg);
  return (
    <>
      5′ {DNA_SEQUENCE.slice(0, start)}
      <span style={{ color }}>{DNA_SEQUENCE.slice(start, end)}</span>
      {DNA_SEQUENCE.slice(end)} 3′
    </>
  );
}

/**
 * 技能：左邊是可用鍵盤操作的分頁（WAI-ARIA tabs），右邊的空間留給 3D 的 DNA 雙螺旋。
 * 分頁與螺旋共用 store 的 activeSkill，點哪一邊都會同步。
 */
/** tier 0 的靜態雙螺旋：五段不同顏色，選到的區段較亮 */
function HelixFallback({ active }: { active: string }) {
  const n = 60;
  const per = n / skills.length;
  const items = Array.from({ length: n }, (_, i) => {
    const seg = skills[Math.floor(i / per)]!;
    const y = 10 + (i / n) * 300;
    const a = (i / 10.5) * Math.PI * 2;
    const x1 = 100 + Math.cos(a) * 48;
    const x2 = 100 - Math.cos(a) * 48;
    const on = seg.id === active;
    return (
      <g key={i} opacity={on ? 1 : 0.45}>
        <line x1={x1} y1={y} x2={x2} y2={y} stroke={seg.color} strokeWidth={on ? 2 : 1.2} strokeOpacity={0.5} />
        <circle cx={x1} cy={y} r={on ? 4 : 3} fill={seg.color} />
        <circle cx={x2} cy={y} r={on ? 4 : 3} fill={seg.color} />
      </g>
    );
  });
  return (
    <svg viewBox="0 0 200 320" className="mx-auto h-[26rem] w-auto rotate-[-12deg]">
      {items}
    </svg>
  );
}

export default function Skills() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);
  const active = useSiteStore((s) => s.activeSkill);
  const setActive = useSiteStore((s) => s.setActiveSkill);
  const setHover = useSiteStore((s) => s.setHoverSkill);
  const tier = useSiteStore((s) => s.tier);
  const current = skills.find((s) => s.id === active) ?? skills[0]!;

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const n = skills.length;
    const next =
      e.key === 'ArrowRight' || e.key === 'ArrowDown'
        ? (index + 1) % n
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
          ? (index - 1 + n) % n
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? n - 1
              : -1;
    if (next < 0) return;
    e.preventDefault();
    setActive(skills[next]!.id);
    document.getElementById(`skill-tab-${skills[next]!.id}`)?.focus();
  };

  return (
    <section
      id="skills"
      ref={scope}
      aria-labelledby="skills-title"
      className="relative px-5 py-24 lg:py-[18vh] sm:px-10 lg:px-16"
    >
      <div className="relative mx-auto max-w-6xl">
        <SectionHeader
          id="skills"
          title="我會做的事"
          lead={
            // 拖曳雙螺旋只在大螢幕有（手機上螺旋退到背景，不能操作）；沒有 3D 時不顯示說明
            tier ? <span className="hidden lg:inline">右邊的雙螺旋可以拖曳、點選。</span> : undefined
          }
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div data-reveal className="min-w-0">
            <div role="tablist" aria-label="技能分類" className="flex flex-wrap gap-2">
              {skills.map((s, i) => {
                const selected = s.id === active;
                return (
                  <button
                    key={s.id}
                    id={`skill-tab-${s.id}`}
                    role="tab"
                    type="button"
                    aria-selected={selected}
                    aria-controls="skill-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActive(s.id)}
                    onKeyDown={(e) => onKeyDown(e, i)}
                    onPointerEnter={() => setHover(s.id)}
                    onPointerLeave={() => setHover(null)}
                    className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-colors ${
                      selected ? 'border-transparent bg-foam text-deep' : 'hairline text-mist hover:text-foam'
                    }`}
                  >
                    <span aria-hidden="true" className="size-2 rounded-full" style={{ background: s.color }} />
                    {s.name}
                  </button>
                );
              })}
            </div>

            <div
              id="skill-panel"
              role="tabpanel"
              aria-labelledby={`skill-tab-${current.id}`}
              tabIndex={0}
              className="panel mt-6 overflow-hidden rounded-3xl p-7 sm:p-9"
            >
              <p className="font-mono text-xs tracking-[0.2em] uppercase" style={{ color: current.color }}>
                {current.nameEn}
              </p>
              <p
                aria-hidden="true"
                className="mt-1 hidden truncate font-mono text-[0.68rem] tracking-[0.08em] text-haze sm:block"
              >
                <Sequence seg={skills.indexOf(current)} color={current.color} />
              </p>
              <h3 className="mt-2 text-2xl font-bold text-foam">{current.name}</h3>
              <p className="mt-4 text-lg text-ink/90">{current.summary}</p>
              <ul className="mt-6 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {current.strengths.map((t) => (
                  <li key={t} className="flex gap-3 text-ink/85">
                    <span
                      aria-hidden="true"
                      className="mt-[0.7em] h-px w-3 shrink-0"
                      style={{ background: current.color }}
                    />
                    {t}
                  </li>
                ))}
              </ul>
              <ul className="mt-7 flex flex-wrap gap-2" aria-label="常用工具">
                {current.tools.map((t) => (
                  <li key={t} className="chip">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* 右欄：有 3D 時留白給雙螺旋；沒有 3D（tier 0）時畫一條靜態的 SVG 雙螺旋（分類名稱只在左邊的分頁出現一次） */}
          <div aria-hidden="true" className="relative hidden min-h-[28rem] lg:block">
            {tier === 0 && <HelixFallback active={active} />}
          </div>
        </div>
      </div>
    </section>
  );
}
