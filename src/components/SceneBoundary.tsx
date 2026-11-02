import { Component, type ReactNode } from 'react';
import { useSiteStore } from '@/store/useSiteStore';

/** 3D 場景出錯（WebGL context 建不起來、shader 編譯失敗）時退回 tier 0，網站內容照常可讀 */
export default class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('[scene] 3D 場景停用，改用純 DOM 版本：', error);
    useSiteStore.getState().setTier(0);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
