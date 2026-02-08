/// <reference types="vitest" />
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'tsx',
    include: /(src|tests)\/.*\.[tj]sx?$/
  },
  server: {
    port: 3009
  },
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: 10000,
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true
        }
      }
    },
    alias: {
      'placeholder-loading/src/scss/placeholder-loading': path.resolve(__dirname, 'src/shims/placeholder-loading.scss'),
      'ramda/src': path.resolve(__dirname, 'src/shims/ramda-src'),
      '~react-dropdown/style': path.resolve(__dirname, 'src/shims/react-dropdown-style.scss'),
      'ngl': path.resolve(__dirname, 'src/shims/ngl.ts'),
      'react-ngl': path.resolve(__dirname, 'src/shims/react-ngl.tsx'),
      // Test-only shim to avoid native `canvas` dependency from react-konva
      'react-konva': path.resolve(__dirname, 'src/shims/react-konva.tsx')
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/shims/**',
        'src/types/**',
        'src/**/*.d.ts'
      ]
    }
  }
});
