import SplitHeading from './SplitHeading';

interface Props {
  id: string;
  depth: string;
  label: string;
  title: string;
  lead?: string;
}

export default function SectionHeader({ id, depth, label, title, lead }: Props) {
  return (
    <header className="max-w-3xl">
      <p className="eyebrow" data-reveal>
        <span className="normal-case tabular-nums">{depth}</span>
        <span className="mx-2 text-haze">/</span>
        {label}
      </p>
      <SplitHeading as="h2" className="mt-4 text-[clamp(2rem,4.6vw,3.6rem)] font-black tracking-tight text-foam">
        <span id={`${id}-title`}>{title}</span>
      </SplitHeading>
      {lead && (
        <p className="mt-5 max-w-2xl text-lg text-mist" data-reveal>
          {lead}
        </p>
      )}
    </header>
  );
}
