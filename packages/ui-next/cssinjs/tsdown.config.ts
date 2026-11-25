import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/**/*.ts'],
  dts: true,
  deps: {
    // JS 产物保持所有 npm 依赖外部化（等价于原先的 skipNodeModulesBundle，
    // 但 neverBundle 的语义更明确，也不会把 vue/@vue/* 子路径内联）。
    neverBundle: true,
  },
  outExtensions() {
    return {
      js: '.js',
      dts: '.d.ts',
    };
  },
  format: 'esm',
  unbundle: true,
});
