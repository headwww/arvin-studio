import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'vite';
import { tsxResolveTypes } from 'vite-plugin-tsx-resolve-types';

export default defineConfig({
  plugins: [vue(), tsxResolveTypes(), vueJsx()],
  build: {
    rolldownOptions: {
      external: ['vue'],
    },
    emptyOutDir: false,
    lib: {
      entry: './src/index.ts',
      fileName: () => 'as-icons.esm.js',
      formats: ['es'],
    },
  },
});
