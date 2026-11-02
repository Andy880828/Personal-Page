import { useEffect, useRef, useState } from 'react';
import { navigate, usePathname } from '@/lib/router';
import { Menu, X } from 'lucide-react';
import { SECTIONS, type SectionDef } from '@/lib/sections';
import { scrollToSection } from '@/lib/scroller';
import { useSiteStore } from '@/store/useSiteStore';
import { profile } from '@/content/profile';
import MotionToggle from './MotionToggle';
import DepthReadout from './DepthReadout';

export default function Nav() {
  const section = useSiteStore((s) => s.section);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  // 手機選單：打開時焦點進到第一個連結，Esc 關閉並把焦點還給按鈕
  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLElement>('a')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      menuButton.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  const pathname = usePathname();

  const go = (s: SectionDef) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    if (s.route && s.route !== pathname) navigate(s.route);
    else scrollToSection(s.id);
  };

  const links = SECTIONS.filter((s) => s.id !== 'hero');

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color] duration-500 ${
        section === 'hero' ? 'bg-transparent' : 'bg-deep/85'
      }`}
    >
      {/* 海面狀態的遮罩：比列高很多、用 mask 慢慢淡掉，不在列的底緣收尾（之前 56 px 內收尾會在交界壓出一條暗線） */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-deep/70 transition-opacity duration-500 [mask-image:linear-gradient(to_bottom,black,transparent)] ${
          section === 'hero' ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <nav
        aria-label="主要導覽"
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8 sm:py-3.5"
      >
        <a
          href="/"
          onClick={go(SECTIONS[0]!)}
          className="group flex items-baseline gap-2 rounded-md text-foam"
          aria-label={`${profile.name}，回到海面`}
        >
          <span className="text-lg font-black tracking-wider">{profile.name}</span>
          <span className="hidden font-mono text-[0.7rem] tracking-[0.2em] text-ink/90 uppercase sm:inline">
            {profile.nameEn}
          </span>
        </a>

        <div
          className={`hidden items-center gap-1 rounded-full px-2 py-1 md:flex ${section === 'hero' ? 'bg-deep/75' : ''}`}
        >
          {links.map((s) => (
            <a
              key={s.id}
              href={s.route ?? `#${s.id}`}
              onClick={go(s)}
              aria-current={section === s.id ? 'location' : undefined}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                section === s.id ? 'bg-foam/15 text-foam' : 'text-ink/90 hover:text-foam'
              }`}
            >
              {s.label}
            </a>
          ))}
          <span className="mx-1 h-4 w-px bg-foam/15" aria-hidden="true" />
          <MotionToggle />
        </div>

        <DepthReadout className="ml-auto md:hidden" />
        <button
          ref={menuButton}
          type="button"
          className="glass inline-flex size-11 items-center justify-center rounded-full text-foam md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? '關閉選單' : '開啟選單'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" ref={menu} className="glass mx-4 rounded-2xl p-3 md:hidden">
          <ul className="grid grid-cols-2 gap-1">
            {links.map((s) => (
              <li key={s.id}>
                <a
                  href={s.route ?? `#${s.id}`}
                  onClick={go(s)}
                  aria-current={section === s.id ? 'location' : undefined}
                  className="flex items-baseline justify-between rounded-xl px-3 py-3 text-foam hover:bg-foam/8"
                >
                  {s.label}
                  <span className="font-mono text-[0.65rem] text-haze">{s.depthStart.toLocaleString('en-US')} m</span>
                </a>
              </li>
            ))}
          </ul>
          <MotionToggle className="mt-2 w-full justify-center" />
        </div>
      )}
    </header>
  );
}
