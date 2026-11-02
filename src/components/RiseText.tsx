interface Props {
  text: string;
  delayMs?: number;
  stepMs?: number;
}

/**
 * 首屏標題用：純 CSS 逐字浮出（不等任何 JS 套件），對 LCP 友善。
 * 讀屏器只讀 sr-only 的完整文字。
 */
export default function RiseText({ text, delayMs = 120, stepMs = 70 }: Props) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-block [perspective:600px]">
        {Array.from(text).map((ch, i) => (
          <span key={i} className="rise-char" style={{ animationDelay: `${delayMs + i * stepMs}ms` }}>
            {ch}
          </span>
        ))}
      </span>
    </>
  );
}
