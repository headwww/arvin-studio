import type { VNode } from 'vue';

import type { PanelProps } from '../interface';

import { isVNode } from 'vue';

import { filterEmpty } from '@arvin-studio/headless';

export type ItemType = Omit<PanelProps, 'collapsible'> & {
  _$slots?: Record<string, any>;
  collapsible: {
    end?: boolean;
    showCollapsibleIcon: 'auto' | boolean;
    start?: boolean;
  };
};

function getCollapsible(
  collapsible?: PanelProps['collapsible'],
): ItemType['collapsible'] {
  if ((collapsible as any) === '') {
    collapsible = true;
  }
  if (collapsible && typeof collapsible === 'object') {
    return {
      ...collapsible,
      showCollapsibleIcon:
        collapsible.showCollapsibleIcon === undefined
          ? 'auto'
          : collapsible.showCollapsibleIcon,
    };
  }

  const mergedCollapsible = !!collapsible;
  return {
    start: mergedCollapsible,
    end: mergedCollapsible,
    showCollapsibleIcon: 'auto',
  };
}

/**
 * Convert `children` into `items`.
 */
export function convertChildrenToItems(children: VNode[]): ItemType[] {
  return filterEmpty(children)
    .filter((item) => isVNode(item))
    .map((node) => {
      const { props, children } = node;
      const defaultSize = props?.['default-size'] ?? props?.defaultSize;
      const { collapsible, resizable, ...restProps } = (props ??
        {}) as PanelProps;
      const mergedResizable = resizable !== false;
      return {
        ...restProps,
        defaultSize,
        resizable: mergedResizable,
        collapsible: getCollapsible(collapsible),
        _$slots: children,
      } as ItemType;
    });
}
