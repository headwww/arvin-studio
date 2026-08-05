import type { Ref } from 'vue';

export type UsePrefix = () => Ref<{
  iconPrefixCls: string;
  rootPrefixCls: string;
}>;
