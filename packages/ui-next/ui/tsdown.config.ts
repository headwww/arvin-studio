import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'tsdown';
import { tsxResolveTypes } from 'vite-plugin-tsx-resolve-types';

export default defineConfig({
  entry: [
    'src/**/*.ts',
    'src/**/*.tsx',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.*',
  ],
  outDir: 'dist',
  format: ['esm'],
  platform: 'neutral',
  target: 'es2020',
  unbundle: true,
  dts: true,
  clean: true,
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
  plugins: [
    tsxResolveTypes({ defaultPropsToUndefined: ['Boolean'] }),
    vueJsx({ mergeProps: false, transformOn: false }),
  ],
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
  copy: [{ from: 'src/style/reset.css', to: 'dist' }],
});
