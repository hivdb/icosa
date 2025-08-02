import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[tj]sx?$/
  },
  server: {
    port: 3009
  },
  test: {
    globals: true,
    environment: 'jsdom',
    css: true
  }
});
