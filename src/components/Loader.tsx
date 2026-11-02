import { useSiteStore } from '@/store/useSiteStore';
import { flags } from '@/lib/env';

/** 左下角的場景載入提示；不遮住內容，載完就消失 */
export default function Loader() {
  const tier = useSiteStore((s) => s.tier);
  const ready = useSiteStore((s) => s.sceneReady);
  const progress = useSiteStore((s) => s.sceneProgress);
  if (!tier || ready || flags.test) return null;
  const pct = Math.round(progress * 100);
  return (
    <div
      role="status"
      aria-live="polite"
      className="glass fixed bottom-4 left-4 z-30 flex items-center gap-3 rounded-full py-1.5 pr-4 pl-3 font-mono text-xs text-mist"
    >
      <span className="relative h-1 w-16 overflow-hidden rounded-full bg-foam/15">
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-biolum transition-[width] duration-500"
          style={{ width: `${Math.max(6, pct)}%` }}
        />
      </span>
      深海場景載入中 {pct}%
    </div>
  );
}
