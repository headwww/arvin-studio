import type { App, CSSProperties, SlotsType } from 'vue';

import type { ItemType } from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { SizeType } from '../config-provider/size-context';
import type { CollapsibleType } from './CollapsePanel.tsx';

import { computed, defineComponent } from 'vue';

import { Collapse as VcCollapse } from '@arvin-studio/headless';
import { RightOutlined } from '@arvin-studio/icons';
import { clsx, omit } from '@arvin-studio/kit';

import {
  useMergeSemantic,
  useSemanticRootStyle,
  useToArr,
  useToProps,
} from '../_util/hooks';
import initCollapseMotion from '../_util/motion';
import { toPropsRefs } from '../_util/tools';
import { resolveSlotsNode } from '../_util/vnode';
import { checkRenderNode, cloneElement } from '../_util/vueNode';
import { useComponentBaseConfig } from '../config-provider/context';
import { useSize } from '../config-provider/hooks/useSize';
import CollapsePanel, { COLLAPSE_PANEL_MARK } from './CollapsePanel';
import useStyle from './style';

export type ExpandIconPlacement = 'end' | 'start';

export type CollapseSemanticName = keyof CollapseSemanticClassNames &
  keyof CollapseSemanticStyles;

export interface CollapseSemanticClassNames {
  body?: string;
  header?: string;
  icon?: string;
  root?: string;
  title?: string;
}

export interface CollapseSemanticStyles {
  body?: CSSProperties;
  header?: CSSProperties;
  icon?: CSSProperties;
  root?: CSSProperties;
  title?: CSSProperties;
}

export type CollapseClassNamesType = SemanticClassNamesType<
  CollapseProps,
  CollapseSemanticClassNames
>;

export type CollapseStylesType = SemanticStylesType<
  CollapseProps,
  CollapseSemanticStyles
>;

export type CollapseItemType = Omit<ItemType, 'children' | 'classNames'> & {
  classes?: ItemType['classNames'];
  content?: ItemType['children'];
};
export interface CollapseProps
  /* @vue-ignore */
  extends CollapseEmitsProps {
  /** 手风琴效果 */
  accordion?: boolean;
  activeKey?: Array<number | string> | number | string;
  bordered?: boolean;
  classes?: CollapseClassNamesType;
  collapsible?: CollapsibleType;
  contentRender?: (params: { index: number; item: CollapseItemType }) => any;
  defaultActiveKey?: Array<number | string> | number | string;
  destroyOnHidden?: boolean;
  expandIcon?: (panelProps: PanelProps) => any;
  expandIconPlacement?: ExpandIconPlacement;
  ghost?: boolean;
  items?: CollapseItemType[];
  labelRender?: (params: { index: number; item: CollapseItemType }) => any;
  prefixCls?: string;
  rootClass?: string;
  size?: SizeType;
  styles?: CollapseStylesType;
}

export interface CollapseEmits {
  change: (key: string[]) => void;
}
export interface CollapseEmitsProps {
  onChange?: CollapseEmits['change'];
}

interface PanelProps {
  className?: string;
  collapsible?: CollapsibleType;
  extra?: VueNode;
  forceRender?: boolean;
  header?: VueNode;
  isActive?: boolean;
  showArrow?: boolean;
  style?: CSSProperties;
}

interface CollapseSlots {
  contentRender: (params: { index: number; item: CollapseItemType }) => any;
  default?: () => any;
  expandIcon: (panelProps: PanelProps) => any;
  labelRender: (params: { index: number; item: CollapseItemType }) => any;
}

const defaults = {
  expandIconPlacement: 'start',
  bordered: true,
} as any;
const Collapse = defineComponent<
  CollapseProps,
  CollapseEmits,
  string,
  SlotsType<CollapseSlots>
>(
  (props = defaults, { attrs, emit, slots }) => {
    const {
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
      direction,
      prefixCls,
      getPrefixCls,
      expandIcon,
    } = useComponentBaseConfig('collapse', props, ['expandIcon']);
    const { styles, classes } = toPropsRefs(props, 'styles', 'classes');
    const mergedSize = useSize<SizeType>(
      (ctxSize) => props?.size ?? ctxSize ?? 'middle',
    );
    const rootPrefixCls = getPrefixCls();
    const [hashId, cssVarCls] = useStyle(prefixCls);
    const mergedPlacement = computed(
      () => props.expandIconPlacement ?? 'start',
    );
    // =========== Merged Props for Semantic ===========
    const mergedProps = computed<CollapseProps>(() => ({
      ...props,
      size: mergedSize.value,
      bordered: props.bordered ?? true,
      expandIconPlacement: mergedPlacement.value,
    }));
    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      CollapseClassNamesType,
      CollapseStylesType,
      CollapseProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, contextStyleRoot as any, styles),
      useToProps(mergedProps),
    );

    const renderExpandIcon = (panelProps: PanelProps = {}) => {
      const mergedExpandIcon =
        slots?.expandIcon ?? props?.expandIcon ?? expandIcon.value;
      const icon =
        typeof mergedExpandIcon === 'function' ? (
          mergedExpandIcon?.(panelProps)
        ) : (
          <RightOutlined
            aria-label={panelProps.isActive ? 'expanded' : 'collapsed'}
            rotate={
              panelProps.isActive
                ? direction.value === 'rtl'
                  ? -90
                  : 90
                : undefined
            }
          />
        );
      return cloneElement(icon, () => {
        return {
          class: clsx(icon.props?.class, `${prefixCls.value}-arrow`),
        };
      });
    };
    const openMotion = computed(() => {
      return {
        ...initCollapseMotion(rootPrefixCls),
        appear: false,
      };
    });
    const sourceItems = computed<CollapseItemType[]>(() => {
      if (props.items) {
        return props.items;
      }

      return resolveSlotsNode<Record<string, any>>(
        slots,
        'default',
        undefined,
        COLLAPSE_PANEL_MARK,
      ).map((item) => {
        return {
          ...item,
          label: item.header ?? item.label,
          content: item.content ?? item.children,
        };
      });
    });
    return () => {
      const { bordered, ghost, rootClass, destroyOnHidden } = props;
      const collapseClassName = clsx(
        `${prefixCls.value}-icon-placement-${mergedPlacement.value}`,
        {
          [`${prefixCls.value}-borderless`]: !bordered,
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
          [`${prefixCls.value}-ghost`]: !!ghost,
          [`${prefixCls.value}-${mergedSize.value}`]:
            mergedSize.value !== 'middle',
        },
        contextClassName.value,
        (attrs as any).class,
        rootClass,
        hashId.value,
        cssVarCls.value,
        mergedClassNames.value.root,
      );
      const labelRender = slots?.labelRender ?? props?.labelRender;
      const contentRender = slots?.contentRender ?? props?.contentRender;
      const items = sourceItems.value.map((item, index) => {
        const { classes: itemClasses, ...restItem } = item;
        const label = checkRenderNode(
          labelRender ? labelRender?.({ item, index }) : item.label,
        );
        const children = checkRenderNode(
          contentRender ? contentRender?.({ item, index }) : item.content,
        );
        const _item: ItemType = {
          ...restItem,
          classNames: itemClasses,
        };
        if (label) {
          _item.label = label;
        }
        if (children) {
          _item.children = children;
        }
        return _item;
      });
      return (
        <VcCollapse
          openMotion={openMotion.value}
          {...omit(attrs, ['class', 'style'])}
          {...(omit(props, [
            'rootClass',
            'items',
            'expandIconPlacement',
            'classes',
            'styles',
          ]) as any)}
          class={collapseClassName}
          classNames={mergedClassNames.value}
          destroyOnHidden={destroyOnHidden}
          expandIcon={renderExpandIcon}
          items={items}
          onChange={(key) => emit('change', key as string[])}
          prefixCls={prefixCls.value}
          style={[mergedStyles.value.root, (attrs as any).style]}
          styles={mergedStyles.value}
        />
      );
    };
  },
  {
    name: 'AsCollapse',
    inheritAttrs: false,
  },
);

(Collapse as any).install = (app: App) => {
  app.component(Collapse.name, Collapse);
  app.component(CollapsePanel.name, CollapsePanel);
};
export default Collapse;
