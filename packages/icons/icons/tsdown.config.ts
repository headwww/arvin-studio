import { defineConfig } from 'tsdown';

export default defineConfig({
  fromVite: true,
  dts: true,
  format: 'es',
  tsconfig: './tsconfig.app.json',
  entry: [
    'src/index.ts',
    'src/all.ts',
    'src/icons/index.tsx',
    'src/extra-icons/index.tsx',
  ],
  external: ['vue'],
  outExtensions() {
    return {
      js: '.js',
      dts: '.d.ts',
    };
  },
  unbundle: true,
  skipNodeModulesBundle: true,
  // JSX 转译为 Vue 的 createVNode 调用（classic 模式），并自动注入所需导入，
  // 避免 unbundle 产物中残留 JSX 语法（浏览器无法直接运行）
  inputOptions: {
    transform: {
      inject: {
        createVNode: ['vue', 'createVNode'],
        Fragment: ['vue', 'Fragment'],
      },
      jsx: {
        runtime: 'classic',
        pragma: 'createVNode',
        pragmaFrag: 'Fragment',
      },
    },
  },
});
