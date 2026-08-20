import type { VNodeChild } from 'vue';

import type { AnyObject, VueNode } from './types';

import { cloneVNode, Fragment, h, isVNode, Text } from 'vue';

import { filterEmpty } from '@arvin-studio/headless';

type RenderProps =
  | ((originProps: AnyObject) => AnyObject | undefined)
  | AnyObject;

export function replaceElement(
  element: VNodeChild,
  replacement: VNodeChild,
  props?: RenderProps,
) {
  if (!isVNode(element)) {
    return replacement;
  }
  return cloneVNode(
    element,
    typeof props === 'function' ? props(element.props || {}) : props,
  );
}

export function cloneElement(element: VNodeChild, props?: RenderProps) {
  return replaceElement(element, element, props);
}

export function getVNode(node: VueNode) {
  if (typeof node === 'function') {
    return node?.();
  }
  return node;
}

export function checkRenderNode(node: any) {
  if (!node) {
    return undefined;
  }
  const child = Array.isArray(node) ? node : [node];
  const pureChild = filterEmpty(child);
  if (pureChild.length > 0) {
    return pureChild.length === 1 ? pureChild[0] : h(Fragment, null, pureChild);
  }

  return undefined;
}

export function getTextByNode(node: any) {
  if (isVNode(node) && node.type === Text) {
    return node.children;
  } else if (
    typeof node === 'object' &&
    node !== null &&
    (typeof node.children === 'string' || typeof node.children === 'number')
    // eslint-disable-next-line unicorn/no-duplicate-if-branches
  ) {
    return node.children;
  }
  return node;
}

export function getTextNodeArr(nodes: any[]) {
  const res: any[] = [];
  for (const node of nodes) {
    res.push(getTextByNode(node));
  }
  return res;
}

export type EmitToProps<T extends Record<string, any>> = {
  [K in keyof T as `on${Capitalize<K & string>}`]: T[K];
};
