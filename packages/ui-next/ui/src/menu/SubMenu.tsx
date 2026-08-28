import type { SlotsType } from 'vue';

import type { EmptyEmit, VueNode } from '../_util';
import type { SubMenuType } from './interface.ts';

import { computed, createVNode, defineComponent } from 'vue';

import { useFullPath, SubMenu as VcSubMenu } from '@arvin-studio/headless';
import { clsx, omit } from '@arvin-studio/kit';

import { pureAttrs, useZIndex } from '../_util/hooks';
import { getSlotPropsFnRun } from '../_util/tools';
import { useMenuContext, useMenuContextProvider } from './MenuContext';

export interface SubMenuProps extends Omit<
  SubMenuType,
  'children' | 'key' | 'label'
> {
  title?: VueNode;
}

export interface SubMenuSlots {
  default: () => any;
  icon: () => any;
  title: () => any;
}

const SubMenu = defineComponent<
  SubMenuProps,
  EmptyEmit,
  string,
  SlotsType<SubMenuSlots>
>(
  (props, { slots, attrs }) => {
    const menuContext = useMenuContext();
    const parentPath = useFullPath();

    const contextValue = computed(() => {
      return {
        ...menuContext.value,
        firstLevel: false,
      };
    });

    useMenuContextProvider(contextValue);

    // ============================ zIndex ============================
    const [zIndex] = useZIndex('Menu');
    return () => {
      const { popupClassName, theme: customTheme } = props;

      const {
        inlineCollapsed,
        prefixCls,
        theme: contextTheme,
        classes,
        styles = {} as any,
      } = menuContext.value;
      let titleNode: any;
      const title = getSlotPropsFnRun(slots, props, 'title');
      const icon = getSlotPropsFnRun(slots, props, 'icon');
      if (icon) {
        const titleIsSpan =
          typeof title === 'object' && (title as any).type === 'span';
        titleNode = (
          <>
            {createVNode(icon, {
              class: clsx(`${prefixCls}-item-icon`, classes?.itemIcon),
              style: styles.itemIcon,
            })}
            {titleIsSpan ? (
              title
            ) : (
              <span class={`${prefixCls}-title-content`}>{title}</span>
            )}
          </>
        );
      } else {
        titleNode =
          inlineCollapsed &&
          !parentPath.value?.length &&
          title &&
          typeof title === 'string' ? (
            <div class={`${prefixCls}-inline-collapsed-noicon`}>
              {title.charAt(0)}
            </div>
          ) : (
            <span class={`${prefixCls}-title-content`}>{title}</span>
          );
      }
      return (
        <VcSubMenu
          {...pureAttrs(attrs)}
          {...omit(props, ['icon'])}
          classes={{
            list: classes?.subMenu?.list,
            listTitle: classes?.subMenu?.itemTitle,
          }}
          popupClassName={clsx(
            prefixCls,
            popupClassName,
            classes?.popup?.root,
            `${prefixCls}-${customTheme || contextTheme}`,
          )}
          popupStyle={{
            zIndex: zIndex.value,
            ...props?.popupStyle,
            ...styles?.popup?.root,
          }}
          styles={{
            list: styles?.subMenu?.list,
            listTitle: styles?.subMenu?.itemTitle,
          }}
          title={titleNode}
        >
          {slots?.default?.()}
        </VcSubMenu>
      );
    };
  },
  {
    name: 'AsSubMenu',
    inheritAttrs: false,
  },
);

export default SubMenu;
