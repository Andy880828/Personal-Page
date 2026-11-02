import { useEffect, useMemo, useRef } from 'react';
import { SECTIONS, SECTION_COUNT } from '@/lib/sections';
import { formatDepth } from '@/lib/scroll';
import { useSiteStore } from '@/store/useSiteStore';
import { formatLight, lightFraction, pressureAtm, temperatureC, zoneAt } from '@/content/science';

/** 把深度（公尺）換算成深度計的刻度位置 0–1：刻度和段落一樣是不等距的，所以用段落區間內插 */
function depthToScale(depth: number): number {
  for (let i = 0; i < SECTIONS.length; i++) {
    const s = SECTIONS[i]!;
    if (depth <= s.depthEnd) return (i + (depth - s.depthStart) / (s.depthEnd - s.depthStart)) / SECTION_COUNT;
  }
  return 1;
}

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
      // 刻度 → 深度（反函式）：找出 y 落在哪一段
      const seg = Math.min(SECTION_COUNT - 1, Math.floor(y * SECTION_COUNT));
      const s = SECTIONS[seg]!;
      const depth = s.depthStart + (y * SECTION_COUNT - seg) * (s.depthEnd - s.depthStart);
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
 * 右側儀表：深度計 + CTD 剖面 + 遙測讀數（壓力、溫度、光）。
 * 所有數字用 subscribe 直接改 DOM，不觸發 React 重繪。
 * 螢幕閱讀器不需要每一幀的深度，所以整塊 aria-hidden；段落資訊由導覽列的 aria-current 提供。
 */
export default function DepthHUD() {
  const depthEl = useRef<HTMLSpanElement>(null);
  const zoneEl = useRef<HTMLSpanElement>(null);
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
      const z = zoneAt(d);
      if (zoneEl.current) zoneEl.current.textContent = d >= 3800 ? '海床' : d < 1 ? '海面' : `${z.zh} · ${z.en}`;
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
        className="fixed top-1/2 right-4 z-30 hidden w-[11.5rem] -translate-y-1/2 rounded-2xl border border-foam/10 bg-deep/85 px-3 py-3 font-mono lg:block"
        data-testid="hud"
      >
        <p className="text-[0.6rem] tracking-[0.22em] text-mist uppercase">ctd · telemetry</p>

        <div className="mt-2 flex gap-3">
          {/* 深度刻度 */}
          <div className="relative h-[34vh] w-px bg-foam/15">
            {SECTIONS.map((s, i) => (
              <span
                key={s.id}
                className="absolute -left-1 h-px w-2 bg-foam/35"
                style={{ top: `${(i / SECTION_COUNT) * 100}%` }}
              />
            ))}
            <div ref={needle} className="absolute inset-x-0 top-0 h-full">
              <span className="absolute -left-[4px] size-[9px] rounded-full border-2 border-deep bg-biolum" />
            </div>
          </div>
          <div className="flex h-[34vh] flex-col justify-between text-[0.62rem] text-ink/85 tabular-nums">
            {SECTIONS.map((s) => (
              <span key={s.id}>{formatDepth(s.depthStart)}</span>
            ))}
            <span>4,000</span>
          </div>
          {/* 溫度（琥珀）與光（白）的剖面 */}
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            width="100%"
            className="h-[34vh] min-w-0 flex-1 overflow-visible"
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
        <div className="mt-1 flex justify-end gap-3 text-[0.55rem] text-haze">
          <span>
            <span className="mr-1 inline-block h-px w-3 bg-ember align-middle" />T
          </span>
          <span>
            <span className="mr-1 inline-block h-px w-3 bg-foam/50 align-middle" />光
          </span>
        </div>

        <div className="mt-3 border-t border-foam/10 pt-3">
          <div className="text-2xl text-foam tabular-nums">
            <span ref={depthEl}>0</span>
            <span className="ml-1 text-xs text-mist">m</span>
          </div>
          <span ref={zoneEl} className="block text-[0.62rem] tracking-widest text-ink/85">
            海面
          </span>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[0.68rem] tabular-nums">
            <dt className="text-haze">壓力</dt>
            <dd className="text-right text-ink">
              <span ref={pressEl}>1.0</span> atm
            </dd>
            <dt className="text-haze">水溫</dt>
            <dd className="text-right text-ember">
              <span ref={tempEl}>25.5</span> °C
            </dd>
            <dt className="text-haze">光</dt>
            <dd className="text-right text-ink">
              <span ref={lightEl}>100%</span>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
