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
          groups: [
            { name: 'three', test: /node_modules[\\/]three[\\/]/, priority: 30 },
            {
              name: 'postfx',
              test: /node_modules[\\/](postprocessing|@react-three[\\/]postprocessing|n8ao)[\\/]/,
              priority: 20,
            },
            {
              name: 'r3f',
              test: /node_modules[\\/](@react-three[\\/](fiber|drei)|react-reconciler|its-fine|suspend-react|three-stdlib|three-mesh-bvh|maath|@monogrid|camera-controls|troika-[^\\/]+|meshline|stats-gl|@use-gesture|tunnel-rat|detect-gpu|hls\.js|@mediapipe)[\\/]/,
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
