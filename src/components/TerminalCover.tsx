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
      className="relative flex h-full w-full min-w-0 flex-col justify-end overflow-hidden min-h-36 bg-abyss/80 p-5 pt-10 font-mono text-[0.72rem] leading-relaxed sm:text-xs"
    >
      {/* 分類色只用在左緣一條細線與提示字元（不用零位移的彩色光暈） */}
      <span className="absolute inset-y-0 left-0 w-0.5" style={{ background: accent }} />
      <div className="absolute top-3 left-4 flex gap-1.5">
        <span className="size-2 rounded-full bg-foam/20" />
        <span className="size-2 rounded-full bg-foam/20" />
        <span className="size-2 rounded-full bg-foam/20" />
      </div>
      {/* 窄卡片放不下時橫向捲動，不截斷、不重疊；右緣漸隱提示還有內容 */}
      <div
        tabIndex={-1}
        className="min-w-0 overflow-x-auto [mask-image:linear-gradient(to_right,black_88%,transparent)] [scrollbar-width:none]"
      >
        <p className="whitespace-pre text-foam">
          <span style={{ color: accent }}>$</span> {prompt}
        </p>
        {lines.map((l) => (
          <p key={l} className="whitespace-pre text-mist">
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}
