/**
 * 網址參數控制的執行模式：
 *   ?test=1   確定性模式（固定亂數與時間、關掉慣性捲動與雜訊），給視覺回歸測試用
 *   ?tier=0-3 強制 GPU 等級
 *   ?debug    載入 leva / r3f-perf
 *   ?perf=1   在 window.__perf 回報 frame time
 *   ?slow=0.1 場景時間放慢（除錯：找閃爍時把波浪等連續動畫放慢，剩下的變化就是不連續的）
 */
export interface RuntimeFlags {
  test: boolean;
  tier: number | null;
  debug: boolean;
  perf: boolean;
  timeScale: number;
}

export function parseFlags(search: string): RuntimeFlags {
  const q = new URLSearchParams(search);
  const tierRaw = q.get('tier');
  const tier = tierRaw !== null && /^[0-3]$/.test(tierRaw) ? Number(tierRaw) : null;
  return {
    test: q.get('test') === '1',
    tier,
    debug: q.has('debug'),
    perf: q.get('perf') === '1',
    timeScale: Number(q.get('slow')) > 0 ? Number(q.get('slow')) : 1,
  };
}

export const flags: RuntimeFlags = typeof window === 'undefined' ? parseFlags('') : parseFlags(window.location.search);
