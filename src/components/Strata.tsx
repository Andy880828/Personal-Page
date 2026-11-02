/**
 * 一層沉積層：經歷清單每一筆背後的色帶。越往下越舊，顏色越深、紋理越密，
 * 層與層之間一條細界線；顏色取自經歷種類，只留很淡的一點。純裝飾。
 */
export function Stratum({ color, index, total }: { color: string; index: number; total: number }) {
  const age = total > 1 ? index / (total - 1) : 0;
  const tint = Math.round(5 + age * 6);
  const grain = 7 - Math.round(age * 3);
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 -right-4 -left-[calc(2rem+1px)] -z-10 border-t border-foam/8 sm:-left-[calc(2.5rem+1px)]"
      style={{
        background: `repeating-linear-gradient(176deg, transparent 0 ${grain}px, rgb(223 243 255 / 0.018) ${grain}px ${grain + 1}px), linear-gradient(90deg, color-mix(in oklab, ${color} ${tint}%, transparent), transparent 85%)`,
      }}
    />
  );
}
