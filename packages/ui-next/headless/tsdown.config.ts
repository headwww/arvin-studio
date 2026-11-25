import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'tsdown';
import { tsxResolveTypes } from 'vite-plugin-tsx-resolve-types';

import { postbuild } from './scripts/postbuild.mjs';

/** 配置文件若被 tsdown 打包到临时目录，import.meta.url 会指错，回退到 cwd（pnpm --filter 会把 cwd 设为包目录） */
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
  tsconfig: 'tsconfig.json',
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
      'date-fns',
      'dayjs',
      'luxon',
      'moment',
      'resize-observer-polyfill',
      /^@arvin-studio\//,
    ],
  },
  hooks: {
    // build / watch 结束后修正 d.ts：@vue/<subpkg> -> vue、命名空间自引用，并做产物卫生检查。
    // 只在确实改写了文件时打印，避免 watch 每次重建都刷一行。
    'build:done': () => {
      const { vueRewrites, selfRefFixes } = postbuild(resolveDistDir());
      if (vueRewrites > 0 || selfRefFixes > 0) {
        // oxlint-disable-next-line no-console
        console.log(
          `[postbuild] vue subpackage rewrites=${vueRewrites}, self-ref fixes=${selfRefFixes}`,
        );
      }
    },
  },
});
