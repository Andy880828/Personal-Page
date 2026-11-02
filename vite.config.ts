import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
  plugins: [react(), tailwindcss(), imagetools({ removeMetadata: true })],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    reportCompressedSize: true,
    chunkSizeWarningLimit: 900,
    rolldownOptions: {
      output: {
        // 3D 相關程式只在場景 lazy import 後才下載；這裡只給它們固定的 chunk 名稱，方便 size-limit 量測
        codeSplitting: {
          // 只把符合 test 的模組放進群組，不要連帶吸走它們依賴的 React（否則首屏會靜態載入 3D chunk）
          includeDependenciesRecursively: false,
          groups: [
            // 模型載入器與 meshopt 解碼器：第一次要模型時才下載
            {
              name: 'gltf',
              test: /node_modules[\\/]three[\\/]examples[\\/]jsm[\\/](loaders[\\/]GLTFLoader|libs[\\/]meshopt_decoder)/,
              priority: 40,
            },
            { name: 'three', test: /node_modules[\\/]three[\\/]/, priority: 30 },
            {
              name: 'postfx',
              test: /node_modules[\\/](postprocessing|@react-three[\\/]postprocessing|n8ao)[\\/]/,
              priority: 20,
            },
            {
              name: 'r3f',
              // 只放主場景一定會用到的；除錯面板（r3f-perf）才用到的 troika 等留在自己的 chunk
              test: /node_modules[\\/](@react-three[\\/](fiber|drei)|react-reconciler|its-fine|suspend-react)[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
  server: { port: 5173 },
  preview: { port: 4173 },
});
