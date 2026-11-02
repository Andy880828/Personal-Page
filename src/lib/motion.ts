export type Motion = typeof import('./motion-impl');

let promise: Promise<Motion> | null = null;

/** 動態套件只下載一次；呼叫端拿到的是同一份 */
export function loadMotion(): Promise<Motion> {
  promise ??= import('./motion-impl');
  return promise;
}
