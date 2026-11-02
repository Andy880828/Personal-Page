import { useEffect, useMemo, useRef } from 'react';
import { formatDepth } from '@/lib/scroll';
import { useSiteStore } from '@/store/useSiteStore';
import { formatLight, lightFraction, pressureAtm, temperatureC } from '@/content/science';

/** 深度（公尺）→ 刻度位置 0–1：對數尺度，淺水的變化（溫躍層、光的衰減）才看得到，像真正的 CTD 剖面圖 */
const MAX_DEPTH = 4000;
function depthToScale(depth: number): number {
  return Math.log10(1 + Math.max(0, depth)) / Math.log10(1 + MAX_DEPTH);
}
function scaleToDepth(y: number): number {
  return Math.pow(10, y * Math.log10(1 + MAX_DEPTH)) - 1;
}
const TICKS = [0, 10, 100, 200, 1000, 4000];

const W = 64;
const H = 100;

/** 溫度與光的垂直剖面（CTD 顯示器的樣子）：x 是數值、y 是深度計刻度 */
function useProfilePaths() {
  return useMemo(() => {
    const temps: string[] = [];
    const lights: string[] = [];
    const tMax = temperatureC(0);
    for (let i = 0; i <= 80; i++) {
      const y = i / 80;
      const depth = scaleToDepth(y);
      const tx = (temperatureC(depth) / tMax) * W;
      // 光用對數尺度：1 → 1e-8 對應 W → 0
      const lf = lightFraction(depth);
      const lx = (Math.max(0, 8 + Math.log10(Math.max(lf, 1e-9))) / 8) * W;
      temps.push(`${i ? 'L' : 'M'}${tx.toFixed(1)} ${(y * H).toFixed(1)}`);
      lights.push(`${i ? 'L' : 'M'}${lx.toFixed(1)} ${(y * H).toFixed(1)}`);
    }
    return { temps: temps.join(' '), lights: lights.join(' ') };
  }, []);
}

/**
 * 右側儀表：深度計 + 溫度與光的剖面 + 三個讀數（壓力、溫度、光），不加任何文字標籤。
 * 所有數字用 subscribe 直接改 DOM，不觸發 React 重繪。
 * 螢幕閱讀器不需要每一幀的深度，所以整塊 aria-hidden；段落資訊由導覽列的 aria-current 提供。
 */
export default function DepthHUD() {
  const depthEl = useRef<HTMLSpanElement>(null);
  const pressEl = useRef<HTMLSpanElement>(null);
  const tempEl = useRef<HTMLSpanElement>(null);
  const lightEl = useRef<HTMLSpanElement>(null);
  const needle = useRef<HTMLDivElement>(null);
  const marker = useRef<SVGLineElement>(null);
  const { temps, lights } = useProfilePaths();

  useEffect(() => {
    let lastDepth = -1;
    const apply = (depth: number) => {
      const d = Math.round(depth);
      if (d === lastDepth) return;
      lastDepth = d;
      if (depthEl.current) depthEl.current.textContent = formatDepth(d);
      if (pressEl.current) pressEl.current.textContent = pressureAtm(d).toFixed(d < 100 ? 1 : 0);
      if (tempEl.current) tempEl.current.textContent = temperatureC(d).toFixed(1);
      if (lightEl.current) lightEl.current.textContent = formatLight(lightFraction(d));
      const y = depthToScale(d);
      if (needle.current) needle.current.style.transform = `translateY(${y * 100}%)`;
      if (marker.current) {
        marker.current.setAttribute('y1', String(y * H));
        marker.current.setAttribute('y2', String(y * H));
      }
    };
    apply(useSiteStore.getState().depth);
    return useSiteStore.subscribe((st, prev) => {
      if (st.depth !== prev.depth) apply(st.depth);
    });
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none">
      <div
        className="fixed top-24 right-4 z-30 hidden w-[9rem] rounded-2xl border border-foam/10 bg-deep/85 px-3 py-3 font-mono lg:block"
        data-testid="hud"
      >
        <div className="flex gap-3">
          {/* 深度刻度 */}
          <div className="relative h-[26vh] w-px bg-foam/15">
            {TICKS.map((t) => (
              <span
                key={t}
                className="absolute -left-1 h-px w-2 bg-foam/35"
                style={{ top: `${depthToScale(t) * 100}%` }}
              />
            ))}
            <div ref={needle} className="absolute inset-x-0 top-0 h-full">
              <span className="absolute -left-[4px] size-[9px] rounded-full border-2 border-deep bg-biolum" />
            </div>
          </div>
          <div className="relative h-[26vh] w-9 text-[0.7rem] text-ink/85 tabular-nums">
            {TICKS.map((t) => (
              <span
                key={t}
                className="absolute -translate-y-1/2 leading-none"
                style={{ top: `${depthToScale(t) * 100}%` }}
              >
                {formatDepth(t)}
              </span>
            ))}
          </div>
          {/* 溫度（琥珀）與光（白）的剖面 */}
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            width="100%"
            className="h-[26vh] min-w-0 flex-1 overflow-visible"
          >
            <path
              d={lights}
              fill="none"
              stroke="rgb(223 243 255 / 0.45)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <path d={temps} fill="none" stroke="#ffb86b" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
            <line
              ref={marker}
              x1="0"
              x2={W}
              y1="0"
              y2="0"
              stroke="#4ff0d2"
              strokeWidth="1"
              strokeDasharray="2 2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
        <div className="mt-3 border-t border-foam/10 pt-3">
          <div className="text-2xl text-foam tabular-nums">
            <span ref={depthEl}>0</span>
            <span className="ml-1 text-xs text-mist">m</span>
          </div>
          {/* 只留數值與單位，不寫名稱：壓力、水溫（琥珀，對應剖面曲線）、表層光的比例 */}
          <p className="mt-1 grid gap-y-0.5 text-right text-[0.72rem] tabular-nums">
            <span className="text-ink">
              <span ref={pressEl}>1.0</span> atm
            </span>
            <span className="text-ember">
              <span ref={tempEl}>25.5</span> °C
            </span>
            <span className="text-ink">
              <span ref={lightEl}>100%</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
