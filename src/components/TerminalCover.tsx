interface Props {
  prompt: string;
  lines: string[];
  accent: string;
}

/** 沒有截圖的 CLI 專案用的封面：README 裡真的會出現的指令與輸出，零圖片重量 */
export default function TerminalCover({ prompt, lines, accent }: Props) {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-full min-h-44 flex-col justify-end overflow-hidden bg-abyss/80 p-5 font-mono text-[0.72rem] leading-relaxed sm:text-xs"
    >
      <span
        className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full opacity-40 blur-3xl"
        style={{ background: accent }}
      />
      <div className="absolute top-3 left-4 flex gap-1.5">
        <span className="size-2 rounded-full bg-foam/20" />
        <span className="size-2 rounded-full bg-foam/20" />
        <span className="size-2 rounded-full bg-foam/20" />
      </div>
      <p className="truncate text-foam">
        <span style={{ color: accent }}>$</span> {prompt}
      </p>
      {lines.map((l) => (
        <p key={l} className="truncate text-mist">
          {l}
        </p>
      ))}
    </div>
  );
}
