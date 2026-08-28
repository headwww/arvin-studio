import { defineConfig } from 'tsdown';

// 仅用于生成 d.ts：js 产物由 vite.config.ts 负责（vite 的插件链能生成运行时 props 声明）。
export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  format: ['es'],
  tsconfig: './tsconfig.json',
  outDir: 'dist-dts',
  external: ['vue', '@arvin-studio/kit'],
  outExtensions() {
    return {
      js: '.js',
      dts: '.d.ts',
    };
  },
  skipNodeModulesBundle: true,
  unbundle: true,
});
