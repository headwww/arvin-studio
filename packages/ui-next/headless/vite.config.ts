import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'vite';
import { tsxResolveTypes } from 'vite-plugin-tsx-resolve-types';

export default defineConfig({
  plugins: [
    vue(),
    // 把 defineComponent<Props> 的类型编译为运行时 props 声明（产物自带 props/emits）
    tsxResolveTypes(),
    vueJsx(),
  ],
  build: {
    outDir: 'dist',
    minify: false,
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/index.ts',
      // 关闭 tree-shaking：preserveModules 输出所有源模块，
      // 避免纯 re-export 的 index.ts / 内部实现文件（如 DialogWrap）被摇掉，
      // 保持与 d.ts 产物一一对应（tree-shaking 能力由消费方 ESM 承担）。
      treeshake: false,
      preserveEntrySignatures: 'exports-only',
      // 依赖一律不打进产物，保留 import 原样
      external: [
        'vue',
        '@arvin-studio/kit',
        'date-fns',
        'dayjs',
        'luxon',
        'moment',
        'resize-observer-polyfill',
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        format: 'es',
      },
    },
  },
});