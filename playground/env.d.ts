// / <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare module '*.scss' {
  /** 作为副作用导入时不导出任何值 */
  const css: string;
  export default css;
}
