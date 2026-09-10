import { writeFile } from 'node:fs/promises';

import { defineConfig } from 'tsdown';

// 类型声明是手写的 src/**/*.d.ts, 不生成, 原样拷进 es / lib
const dtsCopy = ['src/**/*.d.ts'];

export default defineConfig([
  // dist: 全部代码打成一个 ESM 文件, 供 CDN / <script type="module"> 直接用
  {
    clean: true,
    dts: false,
    entry: ['src/index.js'],
    format: ['esm'],
    outDir: 'dist',
    outputOptions: {
      entryFileNames: 'all.esm.js',
    },
  },

  // es: 未打包的 ESM 产物, src 一个文件对应 es 一个文件
  {
    clean: true,
    dts: false,
    entry: ['src/**/*.js'],
    format: ['esm'],
    unbundle: true,
    outDir: 'es',
    outExtensions: () => ({ js: '.js' }),
    copy: dtsCopy,
  },

  // lib: 未打包的 CJS 产物
  {
    clean: true,
    dts: false,
    entry: ['src/**/*.js'],
    format: ['cjs'],
    unbundle: true,
    outDir: 'lib',
    outExtensions: () => ({ js: '.js' }),
    copy: dtsCopy,
    // lib/index.js 同时有具名导出和 default(AsKit 本身), 这是有意的:
    // require 到的是 { add, after, ..., default: AsKit }, 所以屏蔽掉这条提示
    suppressWarnings: ['MIXED_EXPORTS'],
    // 包本身是 "type": "module", 要在 lib 里放个 marker 让 Node 把 lib/*.js 当 CJS
    onSuccess: () => writeFile('lib/package.json', '{ "type": "commonjs" }\n'),
  },
]);
