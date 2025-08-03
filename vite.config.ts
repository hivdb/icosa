import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[tj]sx?$/
  },
  server: {
    port: 3009
  },
  resolve: {
    alias: {
      // Ramda's ESM build does not expose "src" to the exports
      // field. Provide a shim so dependencies requesting
      // "ramda/src/forEach" continue to work under vitest.
      'ramda/src/forEach': path.resolve(__dirname, 'src/shims/ramda-src-forEach.js')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    css: true,
    alias: {
      'flexbox-grid-mixins': path.resolve(__dirname, 'src/shims/flexbox-grid-mixins.scss'),
      'placeholder-loading/src/scss/placeholder-loading': path.resolve(__dirname, 'src/shims/placeholder-loading.scss')
    }
  }
});
