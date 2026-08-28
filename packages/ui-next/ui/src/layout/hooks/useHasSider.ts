import type { VNodeChild } from 'vue';

export default function useHasSider(
  siders: string[],
  children?: VNodeChild,
  hasSider?: boolean,
) {
  if (typeof hasSider === 'boolean') {
    return hasSider;
  }
  if (siders.length > 0) {
    return true;
  }
  const childNodes = Array.isArray(children) ? children : [children];

  return childNodes.some((node: any) => node?.type?.name === 'ALayoutSider');
}
