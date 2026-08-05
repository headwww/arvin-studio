import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'vite';
import { tsxResolveTypes } from 'vite-plugin-tsx-resolve-types';

export default defineConfig({
  plugins: [
    // TODO 编译时自动将 defineComponent 泛型参数中的 TypeScript 类型提取为运行时 props 声明。
    // 使得组件库源码无需手动维护 props: [...] 数组，直接从类型推导。
    // defaultPropsToUndefined: ['Boolean'] — Vue 对未传的 Boolean prop 默认填 false，
    // 此选项将 Boolean 类型的 prop 默认值改为 undefined，
    // 保留 boolean | undefined 的三态语义（未传 / true / false）。
    //
    // ⚠️ 仅用于开发期源码直引场景（monorepo workspace:* 源码消费）。
    // 打包发布时构建产物已包含运行时 props 声明，消费方无需安装此插件。
    tsxResolveTypes({
      defaultPropsToUndefined: ['Boolean'],
    }),
    vue(),
    vueJsx(),
  ],
});
