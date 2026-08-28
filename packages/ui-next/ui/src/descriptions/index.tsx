import type { App, CSSProperties, SlotsType } from 'vue';

import type { Key } from '@arvin-studio/headless';

import type { EmptyEmit, VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { Breakpoint } from '../_util/responsiveObserver';
import type { ComponentBaseProps } from '../config-provider/context';
import type { SizeType } from '../config-provider/size-context';
import type { DescriptionsItemProps } from './Item.tsx';

import { computed, defineComponent } from 'vue';

import { clsx, omit } from '@arvin-studio/kit';

import {
  useMergeSemantic,
  useSemanticRootStyle,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { matchScreen } from '../_util/responsiveObserver';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { resolveSlotsNode } from '../_util/vnode';
import { devUseWarning, isDev } from '../_util/warning';
import { useComponentBaseConfig } from '../config-provider/context';
import { useSize } from '../config-provider/hooks/useSize';
import useBreakpoint from '../grid/hooks/useBreakpoint';
import DEFAULT_COLUMN_MAP from './constant';
import { useDescriptionsProvider } from './DescriptionsContext';
import useItems from './hooks/useItems';
import useRow from './hooks/useRow';
import DescriptionsItem, { DESCRIPTIONS_ITEM_MARK } from './Item';
import Row from './Row';
import useStyle from './style';

export type DescriptionsSemanticName = keyof DescriptionsSemanticClassNames &
  keyof DescriptionsSemanticStyles;

export interface DescriptionsSemanticClassNames {
  content?: string;
  extra?: string;
  header?: string;
  label?: string;
  root?: string;
  title?: string;
}

export interface DescriptionsSemanticStyles {
  content?: CSSProperties;
  extra?: CSSProperties;
  header?: CSSProperties;
  label?: CSSProperties;
  root?: CSSProperties;
  title?: CSSProperties;
}

export type DescriptionsClassNamesType = SemanticClassNamesType<
  DescriptionsProps,
  DescriptionsSemanticClassNames
>;

export type DescriptionsStylesType = SemanticStylesType<
  DescriptionsProps,
  DescriptionsSemanticStyles
>;
export interface InternalDescriptionsItemType extends Omit<
  DescriptionsItemProps,
  'span'
> {
  /**
   * @internal 记录当前项的索引，用于渲染时的辅助计算
   */
  _$index?: number;
  filled?: boolean;
  key?: Key;
  span?: number;
}

export interface DescriptionsItemType extends Omit<
  DescriptionsItemProps,
  'prefixCls'
> {
  key?: Key;
}

export type RenderDescriptionsItem = (params: {
  index: number;
  item: InternalDescriptionsItemType;
  value: any;
}) => any;

export interface DescriptionsProps extends ComponentBaseProps {
  bordered?: boolean;
  classes?: DescriptionsClassNamesType;
  colon?: boolean;
  column?: number | Partial<Record<Breakpoint, number>>;
  contentRender?: RenderDescriptionsItem;
  extra?: VueNode;
  id?: string;
  items?: DescriptionsItemType[];
  labelRender?: RenderDescriptionsItem;
  layout?: 'horizontal' | 'vertical';
  size?: 'default' | SizeType;
  styles?: DescriptionsStylesType;
  title?: VueNode;
}

const defaults = {
  colon: true,
} as any;

export interface DescriptionsSlots {
  contentRender?: RenderDescriptionsItem;
  default?: () => any;
  extra?: () => any;
  labelRender?: RenderDescriptionsItem;
  title?: () => any;
}

const Descriptions = defineComponent<
  DescriptionsProps,
  EmptyEmit,
  string,
  SlotsType<DescriptionsSlots>
>(
  (props = defaults, { slots, attrs }) => {
    const {
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
      prefixCls,
      direction,
    } = useComponentBaseConfig('descriptions', props);
    const { classes, styles } = toPropsRefs(props, 'classes', 'styles');
    const screens = useBreakpoint();
    const items = computed<DescriptionsItemType[]>(() => {
      if (props.items) {
        return props.items;
      }
      return resolveSlotsNode<Record<string, any>>(
        slots,
        'default',
        undefined,
        DESCRIPTIONS_ITEM_MARK,
      ).map((item) => {
        return {
          ...item,
          content: item.content ?? item.children,
        };
      });
    });
    const customizeSize = computed(() => props.size);
    // Column count
    // Mobile-first cascade: try the user-supplied map first (so a lower
    // breakpoint like `md` stays "active" on a larger `lg` viewport). Only
    // fall back to DEFAULT_COLUMN_MAP when no user-supplied breakpoint
    // matches at all. Merging user + default upfront would let default's
    // wider breakpoint override the user's narrower one.
    const mergedColumn = computed(() => {
      if (typeof props.column === 'number') {
        return props.column;
      }
      return (
        matchScreen(
          screens.value!,
          props.column as Partial<Record<Breakpoint, number>> | undefined,
        ) ??
        matchScreen(screens.value!, DEFAULT_COLUMN_MAP) ??
        3
      );
    });
    // Items with responsive
    const mergedItems = useItems(screens as any, items);

    const mergedSize = useSize(customizeSize);
    const rows = useRow(mergedColumn, mergedItems);
    const [hashId, cssVarCls] = useStyle(prefixCls);
    // =========== Merged Props for Semantic ==========
    const mergedProps = computed(() => {
      return {
        ...props,
        column: mergedColumn.value,
        items: mergedItems.value,
        size: mergedSize.value,
      };
    });
    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      DescriptionsClassNamesType,
      DescriptionsStylesType,
      DescriptionsProps
    >(
      useToArr(contextClassNames, classes as any),
      useToArr(contextStyles, contextStyleRoot as any, styles),
      useToProps(mergedProps),
    );

    if (isDev) {
      const warning = devUseWarning('Descriptions');
      warning.deprecated(
        props.size !== 'default',
        'size="default"',
        'size="large"',
      );
    }

    // ======================== Render ========================
    const contextValue = computed(() => {
      return {
        styles: {
          content: mergedStyles.value?.content,
          label: mergedStyles.value.label,
        },
        classes: {
          content: mergedClassNames.value.content,
          label: mergedClassNames.value.label,
        },
      };
    });
    useDescriptionsProvider(contextValue);
    return () => {
      const { bordered, rootClass, colon, layout } = props;
      const title = getSlotPropsFnRun(slots, props, 'title');
      const extra = getSlotPropsFnRun(slots, props, 'extra');
      const labelRender = slots?.labelRender ?? props?.labelRender;
      const contentRender = slots?.contentRender ?? props?.contentRender;
      return (
        <div
          class={clsx(
            prefixCls.value,
            contextClassName.value,
            mergedClassNames.value.root,
            {
              [`${prefixCls.value}-medium`]:
                mergedSize.value === 'medium' || mergedSize.value === 'middle',
              [`${prefixCls.value}-small`]: mergedSize.value === 'small',
              [`${prefixCls.value}-bordered`]: !!bordered,
              [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
            },
            (attrs as any).class,
            rootClass,
            hashId.value,
            cssVarCls.value,
          )}
          id={props.id}
          style={[mergedStyles.value.root, (attrs as any).style]}
          {...omit(attrs, ['class', 'style'])}
        >
          {(!!title || !!extra) && (
            <div
              class={clsx(
                `${prefixCls.value}-header`,
                mergedClassNames.value?.header,
              )}
              style={mergedStyles.value.header}
            >
              {!!title && (
                <div
                  class={clsx(
                    `${prefixCls.value}-title`,
                    mergedClassNames.value.title,
                  )}
                  style={mergedStyles.value.title}
                >
                  {title}
                </div>
              )}
              {!!extra && (
                <div
                  class={clsx(
                    `${prefixCls.value}-extra`,
                    mergedClassNames.value.extra,
                  )}
                  style={mergedStyles.value.extra}
                >
                  {extra}
                </div>
              )}
            </div>
          )}

          <div class={`${prefixCls.value}-view`}>
            <table>
              <tbody>
                {rows.value.map((row, index) => (
                  <Row
                    bordered={bordered}
                    colon={!!colon}
                    contentRender={contentRender}
                    index={index}
                    key={index}
                    labelRender={labelRender}
                    prefixCls={prefixCls.value}
                    row={row}
                    vertical={layout === 'vertical'}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    };
  },
  {
    name: 'ADescriptions',
    inheritAttrs: false,
  },
);
(Descriptions as any).install = (app: App) => {
  app.component(Descriptions.name, Descriptions);
  app.component(DescriptionsItem.name, DescriptionsItem);
};

(Descriptions as any).Item = DescriptionsItem;

export { DescriptionsItem };
export type { DescriptionsItemProps, DescriptionsItemSlots } from './Item.tsx';
export default Descriptions;
