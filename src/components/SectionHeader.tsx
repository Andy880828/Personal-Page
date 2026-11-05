import SplitHeading from './SplitHeading';
import { SECTIONS, type SectionId } from '@/lib/sections';
import { formatDepth } from '@/lib/scroll';

interface Props {
  id: SectionId;
  title: string;
  lead?: React.ReactNode;
}

/**
 * 段落標題：標題本身是主角；深度像測深繩的刻度，放在標題同一列的右端，
 * 用一條細線連過去（不做標題上方的小標）。
 */
/** 深度刻度一律從 lib/sections 讀（段落起始深度 · 分層），和導覽選單、儀表同一個來源 */
function depthLabel(id: SectionId): string {
  const s = SECTIONS.find((x) => x.id === id)!;
  return `${formatDepth(s.depthStart)} m · ${s.zone}`;
}

export default function SectionHeader({ id, title, lead }: Props) {
  const depth = depthLabel(id);
  return (
    <header>
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-3">
        {/* 標題不讓深度刻度擠窄：放不下時刻度換到下一行，標題只在「，」處斷 */}
        {/* id 放在 h2 本身（拆字動畫會複製裡面的元素，放在內層會出現重複的 id）；
            標題文字變了就重新掛載（例如作品篩選），不讓 React 去改已經被拆字的 DOM */}
        <SplitHeading
          key={title}
          as="h2"
          id={`${id}-title`}
          className="max-w-full shrink-0 text-[clamp(2rem,4.6vw,3.6rem)] font-black tracking-tight text-foam [text-shadow:0_2px_24px_rgb(1_4_9/0.45)]"
        >
          {/* 中文標題依「，」切成片語、每段不斷行：避免 1024 寬時斷成「一整／套資料流程」 */}
          {title.split(/(?<=，)/).map((part) => (
            <span key={part} className="inline-block">
              {part}
            </span>
          ))}
        </SplitHeading>
        <span aria-hidden="true" className="hidden h-px min-w-10 flex-1 translate-y-[-0.35em] bg-foam/20 sm:block" />
        <span className="hidden shrink-0 font-mono text-xs text-foam/85 tabular-nums sm:inline">{depth}</span>
      </div>
      {lead && (
        <p className="mt-5 max-w-2xl text-lg text-ink/90" data-reveal>
          {lead}
        </p>
      )}
    </header>
  );
}
