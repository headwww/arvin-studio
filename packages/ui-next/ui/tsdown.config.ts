import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'tsdown';
import { tsxResolveTypes } from 'vite-plugin-tsx-resolve-types';

export default defineConfig({
  plugins: [
    tsxResolveTypes({
      defaultPropsToUndefined: ['Boolean'],
    }),
    vueJsx(),
    vue(),
  ],
  entry: [
    'src/**/*.ts',
    'src/**/*.tsx',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.*',
    '!src/index.with-locales.ts',
  ],
  unbundle: true,
  format: 'es',
  target: 'es2022',
  outExtensions() {
    return {
      js: '.js',
      dts: '.d.ts',
    };
  },
  // minify: true,
  clean: true,
  copy: [{ from: 'src/style/reset.css', to: 'dist' }],
  deps: {
    neverBundle: true,
    onlyImport: [
      'vue',
      '@vueuse/core',
      'dayjs',
      'dom-zindex',
      'scroll-into-view-if-needed',
      'throttle-debounce',
      /^@arvin-studio\//,
    ],
  },
});
