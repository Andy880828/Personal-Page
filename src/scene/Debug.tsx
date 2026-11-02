import { Perf } from 'r3f-perf';

/** ?debug：效能面板（只在除錯時載入） */
export default function Debug() {
  return <Perf position="bottom-left" minimal={false} />;
}
