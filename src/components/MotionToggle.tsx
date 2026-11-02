import { Waves, Pause } from 'lucide-react';
import { isReducedMotion, saveMotionPref, useSiteStore } from '@/store/useSiteStore';

/** 一鍵關掉所有動態（慣性捲動、3D 動畫、文字動畫）；記在 localStorage */
export default function MotionToggle({ className = '' }: { className?: string }) {
  const reduced = useSiteStore(isReducedMotion);
  const setPref = useSiteStore((s) => s.setMotionPref);
  const toggle = () => {
    const next = reduced ? 'full' : 'reduce';
    setPref(next);
    saveMotionPref(next);
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={reduced}
      title={reduced ? '動態已關閉，按一下恢復' : '關閉慣性捲動與動畫'}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-xs text-ink/90 transition-colors hover:text-foam ${className}`}
    >
      {reduced ? <Pause size={14} aria-hidden="true" /> : <Waves size={14} aria-hidden="true" />}
      <span>減少動態</span>
    </button>
  );
}
