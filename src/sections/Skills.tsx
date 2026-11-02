import { useRef } from 'react';
import { skills } from '@/content/skills';
import { useReveal } from '@/hooks/useReveal';
import { useSiteStore } from '@/store/useSiteStore';
import SectionHeader from '@/components/SectionHeader';

/**
 * 技能：左邊是可用鍵盤操作的分頁（WAI-ARIA tabs），右邊的空間留給 3D 氣泡。
 * 分頁與氣泡共用 store 的 activeSkill，點哪一邊都會同步。
 */
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
      <div aria-hidden="true" className="scrim" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeader
          id="skills"
          depth="100 m · 透光帶"
          title="五顆氣泡，五種工具箱"
          lead={tier ? '點畫面裡漂浮的氣泡，或用下面的分頁切換。' : '用下面的分頁切換五組技能。'}
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div data-reveal>
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
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
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
              className="glass mt-6 rounded-3xl p-7 sm:p-9"
            >
              <p className="font-mono text-xs tracking-[0.2em] uppercase" style={{ color: current.color }}>
                {current.nameEn}
              </p>
              <h3 className="mt-2 text-2xl font-bold text-foam sm:text-3xl">{current.name}</h3>
              <p className="mt-4 text-lg text-ink/90">{current.summary}</p>
              <ul className="mt-6 grid gap-x-6 gap-y-2 sm:grid-cols-2">
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
          {/* 右欄：有 3D 時留白給氣泡；沒有 3D（tier 0）時用 CSS 畫五顆對應的光點 */}
          <div aria-hidden="true" className="relative hidden min-h-[28rem] lg:block">
            {tier === 0 &&
              skills.map((s, i) => {
                const pos = [
                  [18, 14, 7.5],
                  [62, 8, 6],
                  [40, 42, 8.5],
                  [74, 58, 6.5],
                  [16, 66, 6],
                ][i]!;
                const on = s.id === active;
                return (
                  <span
                    key={s.id}
                    className="absolute rounded-full border border-foam/25 transition-transform duration-500"
                    style={{
                      left: `${pos[0]}%`,
                      top: `${pos[1]}%`,
                      width: `${pos[2]}rem`,
                      height: `${pos[2]}rem`,
                      transform: on ? 'scale(1.15)' : 'scale(1)',
                      background: `radial-gradient(circle at 35% 30%, rgb(255 255 255 / 0.18), transparent 45%), radial-gradient(circle, ${s.color}${on ? '55' : '22'} 0 18%, transparent 19%)`,
                    }}
                  />
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
}
