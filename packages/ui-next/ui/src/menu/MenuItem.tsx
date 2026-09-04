import type { SlotsType } from 'vue';

import type { MenuItemType } from '@arvin-studio/headless';

import type { EmptyEmit, VueNode } from '../_util';
import type { TooltipProps } from '../tooltip';

import { createVNode, defineComponent, isVNode } from 'vue';

import { filterEmpty, Item } from '@arvin-studio/headless';
import { clsx, omit } from '@arvin-studio/kit';

import { getAttrStyleAndClass, pureAttrs } from '../_util/hooks';
import { getSlotPropsFnRun } from '../_util/tools';
import { useSiderCtx } from '../layout/Sider';
import Tooltip from '../tooltip';
import { useMenuContext } from './MenuContext';

export interface MenuItemProps extends Omit<MenuItemType, 'key'> {
  /** @deprecated No place to use this. Should remove */
  attribute?: Record<string, string>;
  danger?: boolean;
  /** @private Internal filled key. Do not set it directly */
  eventKey?: string;
  icon?: VueNode;

  onFocus?: (e: FocusEvent) => void;

  onKeyDown?: (e: KeyboardEvent) => void;

  role?: string;
  title?: VueNode;
  /** @private Do not use. Private warning empty usage */
  warnKey?: boolean;
}

export interface MenuItemSlots {
  default: () => any;
  extra: () => any;
  icon: () => any;
  title: () => any;
}

const MenuItem = defineComponent<
  MenuItemProps,
  EmptyEmit,
  string,
  SlotsType<MenuItemSlots>
>(
  (props, { slots, attrs }) => {
    const menuContext = useMenuContext();
    const { siderCollapsed } = useSiderCtx();
    return () => {
      const extra = getSlotPropsFnRun(slots, props, 'extra');
      const icon = getSlotPropsFnRun(slots, props, 'icon');
      const title = getSlotPropsFnRun(slots, props, 'title', false);
      const { className, style } = getAttrStyleAndClass(attrs);
      const { danger } = props;
      const {
        prefixCls,
        firstLevel,
        direction,
        disableMenuItemTitleTooltip,
        inlineCollapsed: isInlineCollapsed,
        styles,
        classes,
      } = menuContext.value;
      const children = filterEmpty(slots?.default?.());
      const renderItemChildren = (inlineCollapsed: boolean) => {
        const label = children?.[0];
        const wrapNode = (
          <span
            class={clsx(
              `${prefixCls}-title-content`,
              firstLevel ? classes?.itemContent : classes?.subMenu?.itemContent,
              {
                [`${prefixCls}-title-content-with-extra`]:
                  !!extra || extra === 0,
              },
            )}
            style={
              firstLevel ? styles?.itemContent : styles?.subMenu?.itemContent
            }
          >
            {children}
          </span>
        );

        // inline-collapsed.md demo 依赖 span 来隐藏文字,有 icon 属性，则内部包裹一个 span
        const _children = children?.[0];
        if (
          (!icon || (isVNode(_children) && _children.type === 'span')) &&
          _children &&
          inlineCollapsed &&
          firstLevel &&
          typeof label === 'string'
        ) {
          return (
            <div class={`${prefixCls}-inline-collapsed-noicon`}>
              {label.charAt(0)}
            </div>
          );
        }
        return wrapNode;
      };
      let tooltipTitle = title;
      if (title === undefined) {
        tooltipTitle = firstLevel ? children : '';
      } else if (title === false) {
        tooltipTitle = '';
      }

      const tooltipProps: TooltipProps = { title: tooltipTitle };

      if (!siderCollapsed?.value && !isInlineCollapsed) {
        tooltipProps.title = null;
        // Reset `open` to fix control mode tooltip display not correct
        tooltipProps.open = false;
      }
      const childrenLength = children.length;
      let returnNode = (
        <Item
          {...(omit(pureAttrs(attrs), ['itemData']) as any)}
          {...omit(props, ['title', 'icon', 'danger', 'itemData'])}
          class={clsx(
            firstLevel ? classes?.item : classes?.subMenu?.item,
            {
              [`${prefixCls}-item-danger`]: !!danger,
              [`${prefixCls}-item-only-child`]:
                (icon ? childrenLength + 1 : childrenLength) === 1,
            },
            className,
          )}
          style={
            [firstLevel ? styles?.item : styles?.subMenu?.item, style] as any
          }
          title={typeof title === 'string' ? title : undefined}
        >
          {icon
            ? createVNode(icon, {
                class: clsx(
                  `${prefixCls}-item-icon`,
                  firstLevel ? classes?.itemIcon : classes?.subMenu?.itemIcon,
                ),
                style: firstLevel
                  ? styles?.itemIcon
                  : styles?.subMenu?.itemIcon,
              })
            : null}
          {renderItemChildren(isInlineCollapsed)}
        </Item>
      );
      if (!disableMenuItemTitleTooltip) {
        returnNode = (
          <Tooltip
            {...tooltipProps}
            classes={{
              root: `${prefixCls}-inline-collapsed-tooltip`,
            }}
            placement={direction === 'rtl' ? 'left' : 'right'}
          >
            {returnNode}
          </Tooltip>
        );
      }
      return returnNode;
    };
  },
  {
    name: 'AsMenuItem',
    inheritAttrs: false,
  },
);

export default MenuItem;
