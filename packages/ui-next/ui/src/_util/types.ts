import type { VNode, VNodeChild } from 'vue';

export type RenderNodeFn<Args extends any[] = any[]> = (
  ...args: Args
) => VNodeChild;

export type VueNode<Args extends any[] = any[]> =
  | boolean
  | null
  | number
  | RenderNodeFn<Args>
  | string
  | undefined
  | VNode;
