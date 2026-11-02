import { useSyncExternalStore } from 'react';

/**
 * 極簡路由：這個站只有三個網址（/、/about、/project），都是「同一頁捲到不同段落」，
 * 用 History API 就夠了，不需要完整的路由函式庫（省下約 30 KB gzip）。
 */
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined') window.addEventListener('popstate', emit);

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function navigate(path: string, opts: { replace?: boolean } = {}) {
  if (opts.replace) window.history.replaceState(null, '', path);
  else if (window.location.pathname !== path) window.history.pushState(null, '', path);
  emit();
}

export function usePathname(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => '/',
  );
}
