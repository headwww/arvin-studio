import type { App, CSSProperties, PublicProps, SlotsType } from 'vue';

import type {
  GetIndicatorSize,
  MoreProps,
  TabsProps as VcTabsProps,
  Tab as VcTabType,
} from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { ComponentBaseProps } from '../config-provider/context';
import type { SizeType } from '../config-provider/size-context';

import { computed, defineComponent, shallowRef, toRef } from 'vue';

import {
  getAttrStyleAndClass,
  omit,
  Tabs as VcTabs,
} from '@arvin-studio/headless';
import {
  CloseOutlined,
  EllipsisOutlined,
  PlusOutlined,
} from '@arvin-studio/icons';
import { clsx } from '@arvin-studio/kit';

import {
  useMergeSemantic,
  useSemanticRootStyle,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { devUseWarning, isDev } from '../_util/warning';
import { useComponentBaseConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useSize } from '../config-provider/hooks/useSize';
import useAnimateConfig from './hooks/useAnimateConfig';
import useLegacyItems from './hooks/useLegacyItems';
import useStyle from './style';
import TabPane from './TabPane';

export type TabsType = 'card' | 'editable-card' | 'line';

export type TabPosition = 'bottom' | 'left' | 'right' | 'top';

export type TabPlacement = 'bottom' | 'end' | 'start' | 'top';

export type TabsSemanticName = keyof TabsSemanticClassNames &
  keyof TabsSemanticStyles;

export interface TabsSemanticClassNames {
  body?: string;
  content?: string;
  header?: string;
  indicator?: string;
  item?: string;
  remove?: string;
  root?: string;
}

export interface TabsSemanticStyles {
  body?: CSSProperties;
  content?: CSSProperties;
  header?: CSSProperties;
  indicator?: CSSProperties;
  item?: CSSProperties;
  remove?: CSSProperties;
  root?: CSSProperties;
}

export type TabsClassNamesType = SemanticClassNamesType<
  TabsProps,
  TabsSemanticClassNames,
  {
    popup?: { root?: string };
  }
>;

export type TabsStylesType = SemanticStylesType<
  TabsProps,
  TabsSemanticStyles,
  {
    popup?: { root?: CSSProperties };
  }
>;

export interface CompatibilityProps {
  /** @deprecated Please use `destroyOnHidden` instead */
  destroyInactiveTabPane?: boolean;
}

export interface Tab extends Omit<VcTabType, 'children' | 'className'> {
  class?: string;
  content?: VueNode;
}

export type TabItem = Record<string, any> & Tab;

export interface TabsRef {
  nativeElement: any;
}
export interface BaseTabsProps<
  Item extends Tab = TabItem,
> extends ComponentBaseProps {
  centered?: boolean;
  classes?: TabsClassNamesType;
  hideAdd?: boolean;
  /** @deprecated Please use `indicator={{ size: ... }}` instead */
  indicatorSize?: GetIndicatorSize;
  items?: Item[];
  size?: SizeType;
  styles?: TabsStylesType;
  tabPlacement?: TabPlacement;
  /** @deprecated please use `tabPlacement` instead */
  tabPosition?: TabPosition;
  type?: TabsType;
}

export interface TabsEmits {
  change: NonNullable<VcTabsProps['onChange']>;
  edit: (
    e: KeyboardEvent | MouseEvent | string,
    action: 'add' | 'remove',
  ) => void;
  tabClick: NonNullable<VcTabsProps['onTabClick']>;
  tabScroll: NonNullable<VcTabsProps['onTabScroll']>;
  'update:activeKey': (activeKey: string) => void;
}
export interface TabsEmitsProps {
  onChange?: TabsEmits['change'];
  onEdit?: TabsEmits['edit'];
  onTabClick?: TabsEmits['tabClick'];
  onTabScroll?: TabsEmits['tabScroll'];
  'onUpdate:activeKey'?: TabsEmits['update:activeKey'];
}

export interface TabsProps<Item extends Tab = TabItem>
  extends
    BaseTabsProps<Item>,
    CompatibilityProps,
    Omit<
      VcTabsProps,
      | 'className'
      | 'classNames'
      | 'editable'
      | 'items'
      | 'onChange'
      | 'onTabClick'
      | 'onTabScroll'
      | 'popupClassName'
      | 'renderTabBar'
      | 'style'
      | 'styles'
    >,
    /* @vue-ignore */
    TabsEmitsProps {
  addIcon?: VueNode;
  classes?: TabsClassNamesType;
  more?: MoreProps;
  moreIcon?: VueNode;
  /** @deprecated Please use `classes.popup` instead */
  popupClassName?: string;
  removeIcon?: VueNode;
  renderTabBar?: (args: { props: any; TabNavListComponent: any }) => any;
  styles?: TabsStylesType;
}

export interface TabsSlots<Item extends Tab = TabItem> {
  addIcon: () => any;
  contentRender: (args: { index: number; item: Item }) => any;
  default: () => any;
  labelRender: (args: { index: number; item: Item }) => any;
  leftExtra?: () => any;
  moreIcon: () => any;
  removeIcon: () => any;
  renderTabBar?: (args: { props: any; TabNavListComponent: any }) => any;
  rightExtra?: () => any;
}

const InternalTabs = defineComponent<
  TabsProps,
  TabsEmits,
  string,
  SlotsType<TabsSlots>
>(
  (props, { attrs, slots, emit, expose }) => {
    const {
      classes,
      styles,
      type,
      size: customSize,
      tabPlacement: tabPlacementProp,
      tabPosition,
      hideAdd,
      centered,
      indicatorSize,
    } = toPropsRefs(
      props,
      'classes',
      'styles',
      'type',
      'size',
      'tabPlacement',
      'tabPosition',
      'hideAdd',
      'centered',
      'indicatorSize',
    );
    const more = toRef(props, 'more');
    const popupClassName = toRef(props, 'popupClassName');
    const indicator = toRef(props, 'indicator');

    const {
      prefixCls,
      direction,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
      getPopupContainer,
      getPrefixCls,
    } = useComponentBaseConfig('tabs', props);

    const size = useSize(customSize);

    const mergedPlacement = computed<TabPosition | undefined>(() => {
      const placement = tabPlacementProp.value ?? tabPosition.value;
      const isRTL = direction.value === 'rtl';
      switch (placement) {
        case 'end': {
          return isRTL ? 'left' : 'right';
        }
        case 'start': {
          return isRTL ? 'right' : 'left';
        }
        default: {
          return placement as TabPosition | undefined;
        }
      }
    });

    const mergedItems = useLegacyItems(() => props.items, slots);
    const mergedProps = computed(() => {
      return {
        ...props,
        size: size.value,
        tabPlacement: mergedPlacement.value as TabPlacement,
        items: mergedItems.value,
      } as TabsProps;
    });

    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      TabsClassNamesType,
      TabsStylesType,
      TabsProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, contextStyleRoot as any, styles),
      useToProps(mergedProps),
      computed(() => ({
        popup: {
          _default: 'root',
        },
      })),
    );

    const mergedAnimated = computed(() =>
      useAnimateConfig(prefixCls.value, props.animated),
    );
    const mergedIndicator = computed(() => ({
      align: indicator.value?.align,
      size: indicator.value?.size ?? indicatorSize.value,
    }));

    const tabsRef = shallowRef<any>();

    expose({
      nativeElement: computed(
        () => (tabsRef.value as any)?.$el ?? tabsRef.value ?? null,
      ),
    });

    if (isDev) {
      const warning = devUseWarning('Tabs');
      warning.deprecated(
        !popupClassName.value,
        'popupClassName',
        'classes.popup',
      );
      warning.deprecated(!tabPosition.value, 'tabPosition', 'tabPlacement');
      warning(
        !((attrs as any).onPrevClick || (attrs as any).onNextClick),
        'breaking',
        '`onPrevClick` and `onNextClick` has been removed. Please use `onTabScroll` instead.',
      );
      warning.deprecated(!indicatorSize.value, 'indicatorSize', 'indicator');
      warning.deprecated(
        !(
          props.destroyInactiveTabPane ||
          props.items?.some((item) => 'destroyInactiveTabPane' in (item as any))
        ),
        'destroyInactiveTabPane',
        'destroyOnHidden',
      );
      // warning.deprecated(!slots.default, 'Tabs.TabPane', 'items')
    }

    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

    const onInternalChange: VcTabsProps['onChange'] = (activeKey) => {
      emit('update:activeKey', activeKey);
      emit('change', activeKey);
    };
    const onInternalTabClick: VcTabsProps['onTabClick'] = (activeKey, e) => {
      emit('tabClick', activeKey, e);
    };
    const onInternalTabScroll: VcTabsProps['onTabScroll'] = (info) => {
      emit('tabScroll', info);
    };

    return () => {
      const {
        className: attrClassName,
        style: attrStyle,
        restAttrs,
      } = getAttrStyleAndClass(attrs);
      const addIcon = getSlotPropsFnRun(slots, props, 'addIcon') ?? (
        <PlusOutlined />
      );
      const removeIcon = getSlotPropsFnRun(slots, props, 'removeIcon') ?? (
        <CloseOutlined />
      );
      const moreIcon = getSlotPropsFnRun(slots, props, 'moreIcon') ?? (
        <EllipsisOutlined />
      );
      const editableFn = () => {
        if (type.value !== 'editable-card') {
          return undefined;
        }
        return {
          onEdit: (
            editType: 'add' | 'remove',
            { key, event }: { event: KeyboardEvent | MouseEvent; key?: string },
          ) => {
            emit('edit', editType === 'add' ? event : (key ?? ''), editType);
          },
          removeIcon,
          addIcon,
          showAdd: hideAdd.value !== true,
        };
      };

      const mergedMoreFn = () => {
        const rootPrefixCls = getPrefixCls();
        if (!rootPrefixCls) {
          return {
            icon: moreIcon,
            ...more.value,
          };
        }
        return {
          icon: moreIcon,
          transitionName: `${rootPrefixCls}-slide-up`,
          ...more.value,
        };
      };

      const mergedMore = mergedMoreFn();

      const editable = editableFn();
      const restProps = omit(props, [
        'items',
        'styles',
        'classes',
        'type',
        'size',
        'hideAdd',
        'centered',
        'addIcon',
        'removeIcon',
        'moreIcon',
        'more',
        'indicatorSize',
        'tabPlacement',
        'tabPosition',
        'rootClass',
        'popupClassName',
        'animated',
        'indicator',
        'destroyInactiveTabPane',
        'renderTabBar',
        'tabBarExtraContent',
      ]);
      const rootClassName = clsx(
        props.rootClass,
        contextClassName.value,
        mergedClassNames.value.root,
        {
          [`${prefixCls.value}-large`]: size.value === 'large',
          [`${prefixCls.value}-small`]: size.value === 'small',
          [`${prefixCls.value}-card`]: ['card', 'editable-card'].includes(
            type.value ?? '',
          ),
          [`${prefixCls.value}-editable-card`]: type.value === 'editable-card',
          [`${prefixCls.value}-centered`]: centered.value,
        },
        hashId.value,
        cssVarCls.value,
        rootCls.value,
        attrClassName,
      );

      const popupCls = clsx(
        popupClassName.value,
        hashId.value,
        cssVarCls.value,
        rootCls.value,
        mergedClassNames.value?.popup?.root,
      );

      const mergedStyle = {
        ...mergedStyles.value.root,
        ...attrStyle,
      };
      let renderTabBar: any | undefined;
      if (slots.renderTabBar || props.renderTabBar) {
        renderTabBar = (tabBarProps: any, TabNavListComponent: any) => {
          return getSlotPropsFnRun(slots, props, 'renderTabBar', true, {
            props: tabBarProps,
            TabNavListComponent,
          });
        };
      }
      let tabBarExtraContent: any;
      if (props.tabBarExtraContent) {
        tabBarExtraContent = props.tabBarExtraContent;
      } else {
        const leftExtra = getSlotPropsFnRun(slots, {}, 'leftExtra');
        const rightExtra = getSlotPropsFnRun(slots, {}, 'rightExtra');
        if (!leftExtra && rightExtra) {
          tabBarExtraContent = rightExtra;
        } else if (leftExtra && rightExtra) {
          tabBarExtraContent = {
            left: leftExtra,
            right: rightExtra,
          };
        } else if (leftExtra && !rightExtra) {
          tabBarExtraContent = {
            left: leftExtra,
          };
        }
      }
      return (
        <VcTabs
          direction={direction.value}
          getPopupContainer={getPopupContainer}
          ref={tabsRef}
          {...restAttrs}
          {...restProps}
          animated={mergedAnimated.value}
          className={rootClassName}
          classNames={{
            ...mergedClassNames.value,
            popup: popupCls,
          }}
          destroyOnHidden={
            props.destroyOnHidden ?? props.destroyInactiveTabPane
          }
          editable={editable}
          indicator={mergedIndicator.value}
          items={mergedItems.value}
          more={mergedMore}
          onChange={onInternalChange}
          onTabClick={onInternalTabClick}
          onTabScroll={onInternalTabScroll}
          prefixCls={prefixCls.value}
          renderTabBar={renderTabBar}
          style={mergedStyle}
          styles={mergedStyles.value}
          tabBarExtraContent={tabBarExtraContent}
          tabPosition={mergedPlacement.value}
        />
      );
    };
  },
  {
    name: 'AsTabs',
    inheritAttrs: false,
  },
);

type TabsInstance<Item extends Tab = TabItem> = {
  $emit: {
    (
      event: 'edit',
      e: KeyboardEvent | MouseEvent | string,
      action: 'add' | 'remove',
    ): void;
    (event: 'change', ...args: Parameters<TabsEmits['change']>): void;
    (event: 'tabClick', ...args: Parameters<TabsEmits['tabClick']>): void;
    (event: 'tabScroll', ...args: Parameters<TabsEmits['tabScroll']>): void;
    (event: 'update:activeKey', activeKey: string): void;
  };
  $props: PublicProps & TabsProps<Item>;
  $slots: TabsSlots<Item>;
} & TabsRef;

export interface TabsConstructor {
  new <Item extends Tab = TabItem>(props: TabsProps<Item>): TabsInstance<Item>;
  /**
   * Non-generic fallback signature. TypeScript infers from the last overload,
   * so this keeps render-function usage like `h(Tabs, props)` resolvable
   * against Vue's `Constructor<P>` overload of `h` (see #634), while the
   * generic signature above still drives template/Volar inference.
   */
  new (props: TabsProps<any>): TabsInstance<any>;
  install: (app: App) => void;
  TabPane: typeof TabPane;
}

const Tabs = InternalTabs as unknown as TabsConstructor;

Tabs.TabPane = TabPane;

Tabs.install = (app: App) => {
  app.component(InternalTabs.name, Tabs);
  app.component(TabPane.name, TabPane);
};

export { TabPane };
export type { TabPaneProps } from './TabPane';
export default Tabs;
