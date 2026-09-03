import type { App, CSSProperties, SlotsType } from 'vue';

import type { Key } from '@arvin-studio/headless';

import type { AnyObject, VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { DropdownProps } from '../dropdown';
import type { BreadcrumbItemProps, MenuItem } from './BreadcrumbItem';

import { cloneVNode, computed, defineComponent, isVNode } from 'vue';

import { filterEmpty, pickAttrs } from '@arvin-studio/headless';
import { DownOutlined } from '@arvin-studio/icons';
import { clsx } from '@arvin-studio/kit';

import {
  getAttrStyleAndClass,
  useMergeSemantic,
  useSemanticRootStyle,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { useComponentBaseConfig } from '../config-provider/context';
import { useBreadcrumbProvider } from './BreadcrumbContext';
import BreadcrumbItem, { InternalBreadcrumbItem } from './BreadcrumbItem';
import BreadcrumbSeparator from './BreadcrumbSeparator';
import useStyle from './style';
import useItemRender from './useItemRender';

export interface BreadcrumbItemType {
  [key: `data-${string}`]: string;
  class?: string;
  dropdownProps?: DropdownProps;
  /**
   * Different with `path`. Directly set the link of this item.
   */
  href?: string;
  key?: Key;
  menu?: BreadcrumbItemProps['menu'];
  onClick?: (event: MouseEvent) => void;
  /**
   * Different with `href`. It will concat all prev `path` to the current one.
   */
  path?: string;
  style?: CSSProperties;

  title?: VueNode;
}

export interface BreadcrumbSeparatorType {
  separator?: VueNode;
  type: 'separator';
}

export type ItemType = Partial<BreadcrumbItemType & BreadcrumbSeparatorType>;

export type InternalRouteType = Partial<
  BreadcrumbItemType & BreadcrumbSeparatorType
>;

export type BreadcrumbSemanticName = keyof BreadcrumbSemanticClassNames &
  keyof BreadcrumbSemanticStyles;

export interface BreadcrumbSemanticClassNames {
  item?: string;
  root?: string;
  separator?: string;
}

export interface BreadcrumbSemanticStyles {
  item?: CSSProperties;
  root?: CSSProperties;
  separator?: CSSProperties;
}

export type BreadcrumbClassNamesType<T extends AnyObject = AnyObject> =
  SemanticClassNamesType<BreadcrumbProps<T>, BreadcrumbSemanticClassNames>;

export type BreadcrumbStylesType<T extends AnyObject = AnyObject> =
  SemanticStylesType<BreadcrumbProps<T>, BreadcrumbSemanticStyles>;

export interface BreadcrumbItemRenderContext<T extends AnyObject = AnyObject> {
  params: T;
  paths: string[];
  route: ItemType;
  routes: ItemType[];
}

export interface BreadcrumbProps<T extends AnyObject = AnyObject>
  /* @vue-ignore */
  extends BreadcrumbEmitsProps {
  classes?: BreadcrumbClassNamesType<T>;
  dropdownIcon?: VueNode;
  itemRender?: (
    route: ItemType,
    params: T,
    routes: ItemType[],
    paths: string[],
  ) => any;
  items?: ItemType[];

  menuExtraRender?: (params: {
    index: number;
    item: ItemType;
    menu: MenuItem;
  }) => any;
  // render by menu
  menuLabelRender?: (params: {
    index: number;
    item: ItemType;
    menu: MenuItem;
  }) => any;
  params?: T;

  prefixCls?: string;
  rootClass?: string;
  separator?: any;
  styles?: BreadcrumbStylesType<T>;
  titleRender?: (params: { index: number; item: ItemType }) => any;
}

export interface BreadcrumbEmits {
  [keys: string]: (...args: any[]) => any;
  clickItem: (item: ItemType, event: MouseEvent) => void;
}
export interface BreadcrumbEmitsProps {
  onClickItem?: BreadcrumbEmits['clickItem'];
}

export interface BreadcrumbSlots {
  default: () => any;
  // render by menu
  dropdownIcon: () => any;
  itemRender: (context: BreadcrumbItemRenderContext) => any;
  menuExtraRender?: (params: {
    index: number;
    item: ItemType;
    menu: MenuItem;
  }) => any;
  menuLabelRender?: (params: {
    index: number;
    item: ItemType;
    menu: MenuItem;
  }) => any;
  separator: () => any;
  titleRender: (params: { index: number; item: ItemType }) => any;
}

function getPath<T extends AnyObject = AnyObject>(params: T, path?: string) {
  if (path === undefined) {
    return path;
  }
  let mergedPath = (path || '').replace(/^\//, '');
  Object.keys(params).forEach((key) => {
    mergedPath = mergedPath.replace(`:${key}`, params[key]!);
  });
  return mergedPath;
}

const Breadcrumb = defineComponent<
  BreadcrumbProps,
  BreadcrumbEmits,
  string,
  SlotsType<BreadcrumbSlots>
>(
  (props, { slots, attrs, emit }) => {
    const {
      prefixCls,
      direction,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
      separator: contextSeparator,
      dropdownIcon: contextDropdownIcon,
    } = useComponentBaseConfig('breadcrumb', props, [
      'separator',
      'dropdownIcon',
    ]);
    const { classes, styles } = toPropsRefs(props, 'classes', 'styles');
    const mergedSeparator = computed(() => {
      const separator = getSlotPropsFnRun(slots, props, 'separator');
      const contextSep = getSlotPropsFnRun(
        {},
        { separator: contextSeparator.value },
        'separator',
      );
      return separator ?? contextSep ?? '/';
    });

    const [hashId, cssVarCls] = useStyle(prefixCls);

    const mergedItems = computed(() => props.items ?? []);

    // =========== Merged Props for Semantic ==========
    const mergedProps = computed(() => {
      return {
        ...props,
        separator: mergedSeparator.value,
      } as BreadcrumbProps;
    });
    // ========================= Style ==========================
    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      BreadcrumbClassNamesType,
      BreadcrumbStylesType,
      BreadcrumbProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, contextStyleRoot as any, styles),
      useToProps(mergedProps),
    );

    const contextValue = computed(() => {
      return {
        classes: mergedClassNames.value,
        styles: mergedStyles.value,
      };
    });

    useBreadcrumbProvider(contextValue);
    return () => {
      const { params = {}, rootClass } = props;
      const itemRender = slots?.itemRender
        ? (
            route: ItemType,
            slotParams: AnyObject,
            routes: ItemType[],
            paths: string[],
          ) => slots.itemRender?.({ route, params: slotParams, routes, paths })
        : props?.itemRender;
      const mergedDropdownIcon = getSlotPropsFnRun(
        slots,
        props,
        'dropdownIcon',
      ) ??
        contextDropdownIcon.value ?? <DownOutlined />;

      const children = filterEmpty(slots?.default?.() ?? []);
      let crumbs: any;

      const titleRender = slots?.titleRender ?? props?.titleRender;

      const mergedItemRender = useItemRender(
        prefixCls.value,
        itemRender,
        titleRender,
      );

      if (mergedItems.value && mergedItems.value.length > 0) {
        // generated by route
        const paths: string[] = [];
        const itemRenderRoutes = props?.items;
        crumbs = mergedItems.value.map((item, index) => {
          const {
            path,
            key,
            type,
            menu,
            onClick,
            class: itemClassName,
            style,
            dropdownProps,
          } = item;

          const handleClick = (event: MouseEvent) => {
            onClick?.(event);
            emit('clickItem', item, event);
          };
          const itemSeparator = getSlotPropsFnRun(
            {},
            { separator: item.separator },
            'separator',
          );
          const mergedPath = getPath(params || {}, path);

          if (mergedPath !== undefined) {
            paths.push(mergedPath);
          }

          const mergedKey = key ?? index;

          if (type === 'separator') {
            return (
              <BreadcrumbSeparator key={mergedKey}>
                {itemSeparator}
              </BreadcrumbSeparator>
            );
          }

          const itemProps: BreadcrumbItemProps = {};
          const isLastItem = index === mergedItems.value.length - 1;
          if (menu) {
            const menuLabelRender =
              slots?.menuLabelRender ?? props.menuLabelRender;
            if (menuLabelRender) {
              menu.labelRender = (menuItem) =>
                menuLabelRender({ item, index, menu: menuItem });
            }
            const menuExtraRender =
              slots?.menuExtraRender ?? props.menuExtraRender;
            if (menuExtraRender) {
              menu.extraRender = (menuItem) =>
                menuExtraRender({ item, index, menu: menuItem });
            }
            itemProps.menu = menu;
          }

          let { href } = item;

          if (paths.length > 0 && mergedPath !== undefined) {
            href = `#/${paths.join('/')}`;
          }

          return (
            <InternalBreadcrumbItem
              key={mergedKey}
              {...itemProps}
              {...pickAttrs(item, { data: true, aria: true })}
              class={itemClassName}
              dropdownIcon={mergedDropdownIcon}
              dropdownProps={dropdownProps}
              href={href}
              onClick={handleClick}
              prefixCls={prefixCls.value}
              separator={isLastItem ? '' : mergedSeparator.value}
              style={style}
            >
              {mergedItemRender(
                item,
                params,
                itemRenderRoutes!,
                paths,
                href,
                index,
              )}
            </InternalBreadcrumbItem>
          );
        });
      } else {
        const childrenLength = children.length;
        crumbs = children.map((element: any, index) => {
          if (!element || !isVNode(element)) {
            return element;
          }

          const isLastItem = index === childrenLength - 1;
          const isBreadcrumbItem = Boolean(
            (element.type as any)?.__AS_BREADCRUMB_ITEM,
          );
          return cloneVNode(element, {
            separator: isLastItem ? '' : mergedSeparator.value,
            ...(isBreadcrumbItem && { dropdownIcon: mergedDropdownIcon }),
            key: index,
          });
        });
      }

      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);

      const breadcrumbClassName = clsx(
        prefixCls.value,
        contextClassName.value,
        { [`${prefixCls}-rtl`]: direction.value === 'rtl' },
        className,
        rootClass,
        mergedClassNames.value?.root,
        hashId.value,
        cssVarCls.value,
      );
      const mergedStyle: CSSProperties = {
        ...mergedStyles.value?.root,
        ...style,
      };

      return (
        <nav class={breadcrumbClassName} style={mergedStyle} {...restAttrs}>
          <ol>{crumbs}</ol>
        </nav>
      );
    };
  },
  {
    name: 'AsBreadcrumb',
    inheritAttrs: false,
  },
);

(Breadcrumb as any).Item = BreadcrumbItem;
(Breadcrumb as any).Separator = BreadcrumbSeparator;
(Breadcrumb as any).install = (app: App) => {
  app.component(Breadcrumb.name, Breadcrumb);
  app.component(BreadcrumbItem.name, BreadcrumbItem);
  app.component(BreadcrumbSeparator.name, BreadcrumbSeparator);
};

export { BreadcrumbItem, BreadcrumbSeparator };

export default Breadcrumb;
