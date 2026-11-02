import { useEffect } from 'react';
import { SECTIONS } from '@/lib/sections';
import { sectionIndex } from '@/lib/sections';
import { scrollToSection } from '@/lib/scroller';
import { useSiteStore } from '@/store/useSiteStore';

const isTyping = (el: Element | null) =>
  !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el as HTMLElement).isContentEditable);

/**
 * 鍵盤快捷鍵：/ 開指令列、j / k 下一段 / 上一段、Esc 關閉指令列。
 * 在輸入框裡打字時不觸發。
 */
export function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const s = useSiteStore.getState();
      if (e.key === 'Escape' && s.consoleOpen) {
        s.setConsoleOpen(false);
        return;
      }
      if (isTyping(document.activeElement)) return;
      if (e.key === '/') {
        e.preventDefault();
        s.setConsoleOpen(true);
      } else if (e.key === 'j' || e.key === 'k') {
        const i = sectionIndex(s.section);
        const next = e.key === 'j' ? Math.min(SECTIONS.length - 1, i + 1) : Math.max(0, i - 1);
        if (next !== i) scrollToSection(SECTIONS[next]!.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
