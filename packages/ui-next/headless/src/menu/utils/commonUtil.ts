import { cloneVNode, isVNode } from 'vue';

import { toArray } from '@arvin-studio/kit';

export function parseChildren(
  children: any | undefined,
  keyPath: string[],
): any[] {
  return toArray(children).map((child, index) => {
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

      return cloneVNode(child, {
        ...cloneProps,
      });
    }
    return child;
  });
}
