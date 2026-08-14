import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'vite';
import { tsxResolveTypes } from 'vite-plugin-tsx-resolve-types';

export default defineConfig({
  plugins: [vue(), tsxResolveTypes(), vueJsx()],
  build: {
    emptyOutDir: false,
    rolldownOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'vue',
        },
        exports: 'named',
      },
    },
    lib: {
      entry: './src/index.ts',
      fileName: () => 'as-icons.js',
      formats: ['umd'],
      name: 'AsIcons',
    },
  },
});
