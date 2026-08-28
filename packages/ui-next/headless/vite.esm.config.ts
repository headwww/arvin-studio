import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'vite';
import { tsxResolveTypes } from 'vite-plugin-tsx-resolve-types';

export default defineConfig({
  plugins: [vue(), tsxResolveTypes(), vueJsx()],
  build: {
    emptyOutDir: false,
    rollupOptions: {
      external: [
        'vue',
        '@arvin-studio/kit',
        'date-fns',
        'dayjs',
        'luxon',
        'moment',
        'resize-observer-polyfill',
      ],
    },
    lib: {
      entry: './src/index.ts',
      fileName: () => 'as-headless.esm.js',
      formats: ['es'],
    },
  },
});
