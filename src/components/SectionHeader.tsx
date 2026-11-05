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
      <div className="flex items-baseline gap-5">
        <SplitHeading
          as="h2"
          className="max-w-3xl text-[clamp(2rem,4.6vw,3.6rem)] font-black tracking-tight text-foam [text-shadow:0_2px_24px_rgb(1_4_9/0.45)]"
        >
          <span id={`${id}-title`}>{title}</span>
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
