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
      // field. Provide shims so dependencies requesting
      // "ramda/src/*" continue to work under vitest.
      'ramda/src': path.resolve(__dirname, 'src/shims/ramda-src')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true
        }
      }
    },
    alias: {
      'flexbox-grid-mixins': path.resolve(__dirname, 'src/shims/flexbox-grid-mixins.scss'),
      'placeholder-loading/src/scss/placeholder-loading': path.resolve(__dirname, 'src/shims/placeholder-loading.scss'),
      'ramda/src': path.resolve(__dirname, 'src/shims/ramda-src'),
      '~react-dropdown/style': path.resolve(__dirname, 'src/shims/react-dropdown-style.scss'),
      'react-tabs/style/react-tabs.scss': path.resolve(
        __dirname,
        'src/shims/react-tabs-style.scss'
      ),
      'ngl': path.resolve(__dirname, 'src/shims/ngl.ts'),
      'react-ngl': path.resolve(__dirname, 'src/shims/react-ngl.tsx'),
      'src/components/genome-map': path.resolve(__dirname, 'src/shims/genome-map.tsx')
    }
  }
});
