import { useEffect, useRef, useState } from 'react';
import { Terminal, X } from 'lucide-react';
import { runCommand } from '@/lib/console';
import { scrollToDepth, scrollToSection } from '@/lib/scroller';
import { isReducedMotion, saveMotionPref, useSiteStore } from '@/store/useSiteStore';

interface Line {
  kind: 'in' | 'out';
  text: string;
}

const GREETING: Line[] = [{ kind: 'out', text: 'dive-console 2.0 · 輸入 help 看指令，Esc 關閉' }];

/**
 * 站內指令列：按 `/` 或右下角按鈕開啟。
 * 指令邏輯在 lib/console.ts（純函式）；這裡只負責輸入、輸出與執行動作。
 */
export default function Console() {
  const open = useSiteStore((s) => s.consoleOpen);
  const setOpen = useSiteStore((s) => s.setConsoleOpen);
  const [lines, setLines] = useState<Line[]>(GREETING);
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [lines]);

  const close = () => {
    setOpen(false);
    opener.current?.focus();
  };

  const submit = (raw: string) => {
    const s = useSiteStore.getState();
    const result = runCommand(raw, { depth: s.depth, tier: s.tier, reduced: isReducedMotion(s) });
    const next: Line[] = [
      ...lines,
      { kind: 'in', text: raw },
      ...result.lines.map((t) => ({ kind: 'out' as const, text: t })),
    ];
    setLines(next);
    if (raw.trim()) setHistory((h) => [raw, ...h].slice(0, 50));
    setCursor(-1);
    const a = result.action;
    if (!a) return;
    switch (a.type) {
      case 'goto':
        scrollToSection(a.section);
        break;
      case 'dive':
        scrollToDepth(a.depth);
        break;
      case 'tier': {
        const url = new URL(window.location.href);
        url.searchParams.set('tier', String(a.tier));
        window.location.assign(url.toString());
        break;
      }
      case 'motion':
        s.setMotionPref(a.reduce ? 'reduce' : 'full');
        saveMotionPref(a.reduce ? 'reduce' : 'full');
        break;
      case 'clear':
        setLines([]);
        break;
      case 'close':
        close();
        break;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submit(e.currentTarget.value);
      e.currentTarget.value = '';
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const c = e.key === 'ArrowUp' ? Math.min(history.length - 1, cursor + 1) : Math.max(-1, cursor - 1);
      setCursor(c);
      e.currentTarget.value = c >= 0 ? (history[c] ?? '') : '';
    } else if (e.key === 'Escape') {
      close();
    }
  };

  return (
    <>
      <button
        ref={opener}
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="dive-console"
        title="指令列（/）"
        className="glass fixed right-4 bottom-4 z-30 inline-flex size-11 items-center justify-center rounded-full text-foam transition-colors hover:text-biolum lg:right-6 lg:bottom-6"
      >
        <Terminal size={18} aria-hidden="true" />
        <span className="sr-only">開啟指令列</span>
      </button>

      {open && (
        <section
          id="dive-console"
          role="dialog"
          aria-label="指令列"
          className="fixed right-4 bottom-20 left-4 z-40 max-h-[60vh] rounded-2xl border border-foam/15 bg-abyss/95 font-mono text-sm text-ink sm:left-auto sm:w-[34rem] lg:right-6 lg:bottom-[5.5rem]"
        >
          <header className="flex items-center justify-between border-b border-foam/10 px-4 py-2 text-[0.7rem] tracking-widest text-mist uppercase">
            <span>dive-console</span>
            <button type="button" onClick={close} className="rounded-md p-1 hover:text-foam" aria-label="關閉指令列">
              <X size={14} aria-hidden="true" />
            </button>
          </header>
          <div
            ref={log}
            role="log"
            aria-live="polite"
            className="max-h-[40vh] overflow-y-auto px-4 py-3 leading-relaxed"
          >
            {lines.map((l, i) => (
              <p key={i} className={`whitespace-pre-wrap ${l.kind === 'in' ? 'text-biolum' : 'text-ink/85'}`}>
                {l.kind === 'in' && <span className="mr-2 text-haze select-none">$</span>}
                {l.text}
              </p>
            ))}
          </div>
          <label className="flex items-center gap-2 border-t border-foam/10 px-4 py-2">
            <span className="text-biolum" aria-hidden="true">
              $
            </span>
            <span className="sr-only">輸入指令</span>
            <input
              ref={input}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="help"
              className="w-full bg-transparent text-foam placeholder:text-haze focus:outline-none"
            />
          </label>
        </section>
      )}
    </>
  );
}
