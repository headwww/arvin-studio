import type { CSSProperties } from 'vue';

import type { Key } from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type { DropdownProps } from '../dropdown';
import type { ItemType } from './Breadcrumb';

import { defineComponent } from 'vue';

import { filterEmpty } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import isNonNullable from '../_util/isNonNullable';
import { getSlotPropsFnRun } from '../_util/tools';
import { checkRenderNode } from '../_util/vueNode';
import { useBaseConfig } from '../config-provider/context';
import Dropdown from '../dropdown';
import { useBreadcrumbContext } from './BreadcrumbContext';
import BreadcrumbSeparator from './BreadcrumbSeparator';
import { renderItem } from './useItemRender';

export interface SeparatorType {
  key?: Key;
  separator?: any;
}

type MenuType = NonNullable<DropdownProps['menu']>;
export interface MenuItem {
  href?: string;
  key?: Key;
  label?: VueNode;
  path?: string;
  title?: VueNode;
}

export interface BreadcrumbItemProps extends SeparatorType {
  class?: string;
  dropdownIcon?: VueNode;
  dropdownProps?: DropdownProps;
  href?: string;
  menu?: Omit<MenuType, 'items'> & {
    items?: MenuItem[];
  };
  onClick?: (event: MouseEvent) => void;
  prefixCls?: string;
  style?: CSSProperties;
  // children?: VueNode
}

export const InternalBreadcrumbItem = defineComponent<
  Omit<BreadcrumbItemProps, 'key'>
>(
  (props, { slots }) => {
    const breadcrumbContext = useBreadcrumbContext();

    /** If overlay is have Wrap a Dropdown */
    const renderBreadcrumbNode = (breadcrumbItem: any) => {
      const { prefixCls, menu, dropdownProps, href } = props;
      const dropdownIcon = getSlotPropsFnRun({}, props, 'dropdownIcon');
      if (menu) {
        const mergeDropDownProps: DropdownProps = {
          ...dropdownProps,
        };

        if (menu) {
          const { items, ...menuProps } = menu || {};
          mergeDropDownProps.menu = {
            ...menuProps,
            items: items?.map(
              ({ key, title, label, path, ...itemProps }, index) => {
                let mergedLabel: any = getSlotPropsFnRun(
                  { label: title },
                  { label },
                  'label',
                );

                if (path) {
                  mergedLabel = <a href={`${href}${path}`}>{mergedLabel}</a>;
                }

                return {
                  ...itemProps,
                  key: key ?? index,
                  label: mergedLabel,
                };
              },
            ),
          };
        }

        return (
          <Dropdown placement="bottom" {...mergeDropDownProps}>
            <span class={`${prefixCls}-overlay-link`}>
              {breadcrumbItem}
              {dropdownIcon}
            </span>
          </Dropdown>
        );
      }
      return breadcrumbItem;
    };
    return () => {
      const { separator = '/', prefixCls } = props;
      const children = checkRenderNode(filterEmpty(slots?.default?.() ?? []));
      const { classes: mergedClassNames, styles: mergedStyles } =
        breadcrumbContext.value;
      // wrap to dropDown
      const link = renderBreadcrumbNode(children);

      if (isNonNullable(link)) {
        return (
          <>
            <li
              class={clsx(`${prefixCls}-item`, mergedClassNames?.item)}
              style={mergedStyles?.item}
            >
              {link}
            </li>
            {!!separator && (
              <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
            )}
          </>
        );
      }
      return null;
    };
  },
  {
    name: 'InternalBreadcrumbItem',
    inheritAttrs: false,
  },
);

const BreadcrumbItem = defineComponent<Omit<BreadcrumbItemProps, 'key'>>(
  (props, { slots }) => {
    const { prefixCls } = useBaseConfig('breadcrumb', props);
    return () => {
      const { href, ...restProps } = props;

      const children = checkRenderNode(filterEmpty(slots?.default?.() ?? []));

      return (
        <InternalBreadcrumbItem {...restProps} prefixCls={prefixCls.value}>
          {renderItem(prefixCls.value, restProps as ItemType, children, href)}
        </InternalBreadcrumbItem>
      );
    };
  },
  {
    name: 'AsBreadcrumbItem',
    inheritAttrs: false,
  },
);

(BreadcrumbItem as any).__AS_BREADCRUMB_ITEM = true;

export default BreadcrumbItem as typeof BreadcrumbItem & {
  /** @internal */
  __AS_BREADCRUMB_ITEM: boolean;
};
