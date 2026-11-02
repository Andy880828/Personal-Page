import SplitHeading from './SplitHeading';

interface Props {
  id: string;
  /** 這一段的深度與海洋分層，例如「100 m · 透光帶」 */
  depth: string;
  title: string;
  lead?: React.ReactNode;
}

/**
 * 段落標題：標題本身是主角；深度像測深繩的刻度，放在標題同一列的右端，
 * 用一條細線連過去（不做標題上方的小標）。
 */
export default function SectionHeader({ id, depth, title, lead }: Props) {
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
