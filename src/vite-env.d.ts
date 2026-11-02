/// <reference types="vite/client" />

interface ImagePicture {
  sources: Record<string, string>;
  img: { src: string; w: number; h: number };
}

declare module '*&as=picture' {
  const value: ImagePicture;
  export default value;
}

interface ImportMetaEnv {
  readonly VITE_EMAILJS_SERVICE_ID?: string;
  readonly VITE_EMAILJS_TEMPLATE_ID?: string;
  readonly VITE_EMAILJS_PUBLIC_KEY?: string;
}

interface Window {
  /** 測試／除錯用的掛鉤（只在 ?test=1 或 ?perf=1 時存在） */
  __site?: {
    scrollToPos: (pos: number) => void;
    frames: () => number;
    ready: () => boolean;
    tier: () => number;
  };
  __perf?: { avgFrameMs: number; samples: number };
}
