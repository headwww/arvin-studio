import type { VueNode } from '../util';
import type { MenuItemGroupType } from './interface';

import { computed, defineComponent } from 'vue';

import { clsx, omit } from '@arvin-studio/kit';

import { filterEmpty } from '../util';
import { useMenuContext } from './context/MenuContext';
import { useFullPath, useMeasure } from './context/PathContext';
import { parseChildren } from './utils/commonUtil';

export interface MenuItemGroupProps extends Omit<
  MenuItemGroupType,
  'children' | 'label' | 'type'
> {
  // children?: React.ReactNode;
  /**
   *
   * @private
   */
  eventKey?: string;

  title?: VueNode;

  /**
   *  @private
   */
  warnKey?: boolean;
}

const InternalMenuItemGroup = defineComponent<MenuItemGroupProps>(
  (props, { slots }) => {
    const context = useMenuContext();
    return () => {
      const { class: className, title, ...restProps } = props;
      const {
        prefixCls,
        classes: menuClassNames,
        styles,
      } = context?.value ?? {};
      const groupPrefixCls = `${prefixCls}-item-group`;

      return (
        <li
          role="presentation"
          {...restProps}
          class={clsx(groupPrefixCls, className)}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            class={clsx(`${groupPrefixCls}-title`, menuClassNames?.listTitle)}
            role="presentation"
            style={styles?.listTitle}
            title={typeof title === 'string' ? title : undefined}
          >
            {title}
          </div>
          <ul
            class={clsx(`${groupPrefixCls}-list`, menuClassNames?.list)}
            role="group"
            style={styles?.list}
          >
            {slots?.default ? slots.default() : null}
          </ul>
        </li>
      );
    };
  },
  {
    name: 'InternalMenuItemGroup',
  },
);

const MenuItemGroup = defineComponent<MenuItemGroupProps>(
  (props, ctx) => {
    const connectedKeyPath = useFullPath(computed(() => props.eventKey!));
    const measure = useMeasure();

    return () => {
      const slots = ctx.slots;
      const children = filterEmpty(slots.default ? slots.default() : []);
      const childList = parseChildren(children, connectedKeyPath.value as any);
      if (measure) {
        return childList;
      }
      return (
        <InternalMenuItemGroup {...omit(props, ['warnKey'])}>
          {childList}
        </InternalMenuItemGroup>
      );
    };
  },
  {
    name: 'MenuItemGroup',
    inheritAttrs: false,
  },
);

export default MenuItemGroup;
