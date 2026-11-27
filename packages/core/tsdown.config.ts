import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  dts: true,

  entry: ['src/**/*.ts'],

  format: ['esm'],

  // 保留 src 的模块结构 (一个源文件对应一个产物), 不做打包合并
  unbundle: true,

  outDir: 'dist',

  outExtensions: () => ({
    js: '.js',
    dts: '.d.ts',
  }),

  deps: {
    // 产物不打包任何依赖: 从 node_modules 解析到的一律 external, 避免
    // unbundle(preserveModules) 模式把 vue 及其传递依赖 (以及 .pnpm 路径) 写进 dist
    neverBundle: true,
    // 白名单: 产物里只允许出现这些外部依赖的 import
    onlyImport: ['vue', /^@arvin-studio\//],
  },
});
