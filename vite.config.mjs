import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/msfs-map/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
  },
});
