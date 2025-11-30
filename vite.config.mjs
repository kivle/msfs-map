import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // Serve at root in dev so public assets (GeoJSON) resolve without a prefix,
  // keep the GitHub Pages base path for production builds.
  base: command === 'serve' ? '/' : '/msfs-map/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
  },
}));
