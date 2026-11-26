import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'tsdown';
import { tsxResolveTypes } from 'vite-plugin-tsx-resolve-types';

import { postbuild } from './scripts/postbuild.mjs';

/** 配置文件若被 tsdown 打包到临时目录，import.meta.url 会指错，回退到 cwd */
function resolveDistDir() {
  const fromConfig = fileURLToPath(new URL('dist', import.meta.url));
  return fs.existsSync(fromConfig)
    ? fromConfig
    : // eslint-disable-next-line n/prefer-global/process
      path.resolve(process.cwd(), 'dist');
}

export default defineConfig({
  entry: [
    'src/**/*.ts',
    'src/**/*.tsx',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.*',
  ],
  tsconfig: './tsconfig.build.json',
  outDir: 'dist',
  format: ['esm'],
  platform: 'neutral',
  target: 'es2022',
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
  hooks: {
    'build:done': () => {
      const { copiedDts, selfRefFixes, vueRewrites } =
        postbuild(resolveDistDir());
      if (vueRewrites > 0 || selfRefFixes > 0 || copiedDts > 0) {
        // oxlint-disable-next-line no-console
        console.log(
          `[postbuild] vue subpackage rewrites=${vueRewrites}, self-ref fixes=${selfRefFixes}, handwritten d.ts=${copiedDts}`,
        );
      }
    },
  },
});
