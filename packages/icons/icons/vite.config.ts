import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'vite';
import { tsxResolveTypes } from 'vite-plugin-tsx-resolve-types';

export default defineConfig({
  plugins: [vue(), tsxResolveTypes(), vueJsx()],
});
