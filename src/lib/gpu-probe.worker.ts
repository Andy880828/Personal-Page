/// <reference lib="webworker" />
// 在 Worker 裡用 OffscreenCanvas 建 WebGL2 context 讀 GPU 名稱，不佔主執行緒
let result: { webgl2: boolean; renderer: string } = { webgl2: false, renderer: '' };
try {
  const canvas = new OffscreenCanvas(1, 1);
  const gl = canvas.getContext('webgl2') as WebGL2RenderingContext | null;
  if (gl) {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    result = {
      webgl2: true,
      renderer: String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)),
    };
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
} catch {
  result = { webgl2: false, renderer: '' };
}
self.postMessage(result);
