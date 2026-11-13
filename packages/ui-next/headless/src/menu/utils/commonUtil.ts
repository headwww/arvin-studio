import { cloneVNode, Fragment, isVNode } from 'vue';

import { toArray } from '@arvin-studio/kit';

/**
 * 取出节点里真正承载业务的子节点。
 *
 * JSX 里的数组子节点（例如 `items` 的 children 展开后）会被包成 Fragment，
 * 甚至是 Fragment 套 Fragment；Fragment 自身没有业务 key，如果直接给它生成
 * eventKey，里面真正的 item 就永远拿不到 eventKey —— 表现为子菜单项
 * `data-menu-id` 变成 `xxx-undefined`、点击后没有选中态。所以这里展开后再处理。
 */
function getInnerNodes(child: any): any[] | null {
  if (Array.isArray(child)) {
    return child;
  }
  if (isVNode(child) && child.type === Fragment) {
    return toArray(child.children as any);
  }
  return null;
}

export function parseChildren(
  children: any | undefined,
  keyPath: string[],
): any[] {
  return toArray(children).flatMap((child: any, index) => {
    const innerNodes = getInnerNodes(child);
    if (innerNodes) {
      return parseChildren(innerNodes, [...keyPath, index]);
    }

    if (isVNode(child)) {
      const key = child.key;
      let eventKey = (child.props as any)?.eventKey ?? key;
      const emptyKey = eventKey === null || eventKey === undefined;
      if (emptyKey) {
        eventKey = `tmp_key-${[...keyPath, index].join('-')}`;
      }
      const cloneProps = { key: eventKey, eventKey } as any;
      // @ts-expect-error this is a global variable which injected by babel plugin
      // eslint-disable-next-line n/prefer-global/process
      if (process.env.NODE_ENV !== 'production' && emptyKey) {
        cloneProps.warnKey = true;
      }

      return [
        cloneVNode(child, {
          ...cloneProps,
        }),
      ];
    }
    return [child];
  });
}
