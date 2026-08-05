import type { VNodeChild } from 'vue';
type ComponentName =
  | 'Cascader'
  | 'List'
  | 'Mentions'
  | 'Select'
  | 'Table'
  | 'Table.filter'
  | 'Transfer'
  | 'TreeSelect'
  | string;

export type RenderEmptyHandler = (componentName?: ComponentName) => VNodeChild;

// TODO 默认的空组件
