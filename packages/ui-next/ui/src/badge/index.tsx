import type { App, CSSProperties, SlotsType, VNode } from 'vue';

import type { LiteralUnion } from '@arvin-studio/headless';

import type { EmptyEmit, VueNode } from '../_util';
import type { PresetStatusColorType } from '../_util/colors.ts';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { ComponentBaseProps } from '../config-provider/context.ts';
import type { SizeType } from '../config-provider/size-context';
import type { PresetColorKey } from '../theme/interface';
import type { RibbonProps } from './Ribbon';

import {
  cloneVNode,
  computed,
  defineComponent,
  shallowRef,
  Transition,
  watchEffect,
} from 'vue';

import { filterEmpty, getTransitionProps } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import { isPresetColor } from '../_util/colors';
import { useMergeSemantic, useToArr, useToProps } from '../_util/hooks';
import { formatUnit } from '../_util/styleUtils';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { devUseWarning, isDev } from '../_util/warning';
import { useComponentBaseConfig } from '../config-provider/context';
import Ribbon from './Ribbon';
import ScrollNumber from './ScrollNumber';
import useStyle from './style';

export type BadgeSemanticName = keyof BadgeSemanticClassNames &
  keyof BadgeSemanticStyles;

export interface BadgeSemanticClassNames {
  indicator?: string;
  root?: string;
}

export interface BadgeSemanticStyles {
  indicator?: CSSProperties;
  root?: CSSProperties;
}

export type BadgeClassNamesType = SemanticClassNamesType<
  BadgeProps,
  BadgeSemanticClassNames
>;

export type BadgeStylesType = SemanticStylesType<
  BadgeProps,
  BadgeSemanticStyles
>;

export interface BadgeProps extends ComponentBaseProps {
  classes?: BadgeClassNamesType;
  color?: LiteralUnion<PresetColorKey>;
  /** Number to show in badge */
  count?: VueNode;
  /** Whether to show red dot without number */
  dot?: boolean;
  offset?: [number | string, number | string];
  /** Max count to show */
  overflowCount?: number;
  scrollNumberPrefixCls?: string;
  showZero?: boolean;
  size?: 'default' | Exclude<SizeType, 'large'>;
  status?: PresetStatusColorType;
  styles?: BadgeStylesType;
  text?: VueNode;
  /** Set `null` or `false` to remove the native tooltip title. */
  title?: false | null | string;
}

export interface BadgeSlots {
  count?: () => any;
  default?: () => any;
  text?: () => any;
}

const defaultProps = {
  count: null,
  overflowCount: 99,
  size: 'medium',
} as BadgeProps;

const InternalBadge = defineComponent<
  BadgeProps,
  EmptyEmit,
  string,
  SlotsType<BadgeSlots>
>(
  (props = defaultProps, { slots, attrs, expose }) => {
    const {
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
      prefixCls,
      direction,
      getPrefixCls,
    } = useComponentBaseConfig('badge', props);
    const { classes, styles } = toPropsRefs(props, 'classes', 'styles');

    // =========== Merged Props for Semantic ===========
    const mergedProps = computed(() => props);
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      BadgeClassNamesType,
      BadgeStylesType,
      BadgeProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, styles),
      useToProps(mergedProps),
    );

    const badgeRef = shallowRef<HTMLSpanElement>();
    expose({ badgeRef });
    const [hashId, cssVarCls] = useStyle(prefixCls);

    if (isDev) {
      const warning = devUseWarning('Badge');
      warning.deprecated(
        props.size !== 'default',
        'size="default"',
        'size="medium"',
      );
    }

    const numberedDisplayCount = computed(() => {
      const { count, overflowCount } = props;
      return (
        (count as number) > (overflowCount as number)
          ? `${overflowCount}+`
          : count
      ) as null | number | string;
    });

    const isZero = computed(
      () =>
        numberedDisplayCount.value === '0' ||
        numberedDisplayCount.value === 0 ||
        props.text === '0' ||
        props.text === 0,
    );
    const countNodes = computed(() => {
      const result = getSlotPropsFnRun(slots, props, 'count');
      if (!result) {
        return [] as VueNode[];
      }
      return Array.isArray(result) ? result : [result];
    });
    const textNodes = computed(() => {
      const result = getSlotPropsFnRun(slots, props, 'text');
      if (!result) {
        return [] as VueNode[];
      }
      return Array.isArray(result) ? result : [result];
    });
    const ignoreCount = computed(
      () => props.count === null || (isZero.value && !props.showZero),
    );
    const hasStatus = computed(() => {
      const { status, color } = props;
      return (
        ((status !== null && status !== undefined) ||
          (color !== null && color !== undefined)) &&
        ignoreCount.value
      );
    });
    const hasStatusValue = computed(
      () =>
        (props.status !== null && props.status !== undefined) || !isZero.value,
    );
    const showAsDot = computed(() => props.dot && !isZero.value);

    const mergedCount = computed(() =>
      showAsDot.value ? '' : numberedDisplayCount.value,
    );
    const isHidden = computed(() => {
      const textEmpty =
        textNodes.value.length === 0 &&
        // eslint-disable-next-line unicorn/prefer-includes-over-repeated-comparisons
        (props.text === undefined || props.text === null || props.text === '');
      const isEmptyCount =
        // eslint-disable-next-line unicorn/prefer-includes-over-repeated-comparisons
        (mergedCount.value === null ||
          mergedCount.value === undefined ||
          mergedCount.value === '') &&
        countNodes.value.length === 0;
      return (
        (isEmptyCount || (isZero.value && !props.showZero)) &&
        !showAsDot.value &&
        textEmpty
      );
    });

    const displayCountRef = shallowRef(mergedCount.value);
    const countCacheRef = shallowRef<null | VueNode>(props.count ?? null);
    const isDotRef = shallowRef(showAsDot.value);

    watchEffect(() => {
      if (!isHidden.value) {
        displayCountRef.value = mergedCount.value;
      }
    });

    watchEffect(() => {
      if (!isHidden.value) {
        countCacheRef.value = countNodes.value[0] ?? null;
      }
    });

    watchEffect(() => {
      if (!isHidden.value) {
        isDotRef.value = showAsDot.value;
      }
    });

    // =============================== Styles ===============================
    const mergedStyle = computed(() => {
      if (!props.offset) {
        return { ...contextStyle.value, ...(attrs.style as CSSProperties) };
      }

      const horizontalOffset = Number.parseInt(props.offset[0] as string, 10);
      const insetInlineEnd =
        direction.value === 'rtl' ? horizontalOffset : -horizontalOffset;
      const insetInlineEndUnit = formatUnit(insetInlineEnd)!;

      const offsetStyle: CSSProperties = {
        marginTop: formatUnit(props.offset[1]),
        insetInlineEnd: insetInlineEndUnit,
      };
      return {
        ...contextStyle.value,
        ...offsetStyle,
        ...(attrs.style as CSSProperties),
      };
    });

    const displayCount = computed(() => displayCountRef.value);
    const isInternalColor = computed(() => isPresetColor(props.color, false));

    return () => {
      // oxlint-disable-next-line no-unused-vars
      const { class: attrClass, style: attrStyle, ...restAttrs } = attrs;
      const children = filterEmpty(slots.default?.() ?? []);
      let livingCount: any = countCacheRef.value;
      if (typeof livingCount === 'function') {
        livingCount = livingCount();
      }
      const fallbackTitleNode =
        typeof livingCount === 'string' || typeof livingCount === 'number'
          ? livingCount
          : undefined;
      const titleNode =
        props.title === null || props.title === false
          ? undefined
          : (props.title ?? fallbackTitleNode);
      const hasTextSlot = textNodes.value.length > 0;
      const showStatusTextNode =
        !isHidden.value &&
        (hasTextSlot
          ? true
          : props.text === 0
            ? props.showZero
            : !!props.text && props.text !== true);

      const statusCls = clsx(mergedClassNames.value.indicator, {
        [`${prefixCls.value}-status-dot`]: hasStatus.value,
        [`${prefixCls.value}-status-${props.status}`]: !!props.status,
        [`${prefixCls.value}-color-${props.color}`]: isInternalColor.value,
      });

      const badgeClassName = clsx(
        prefixCls.value,
        {
          [`${prefixCls.value}-status`]: hasStatus.value,
          [`${prefixCls.value}-not-a-wrapper`]: children.length === 0,
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
        },
        (attrs as any).class,
        props.rootClass,
        contextClassName.value,
        mergedClassNames.value?.root,
        hashId.value,
        cssVarCls.value,
      );

      const statusStyle: CSSProperties = {};
      if (props.color && !isInternalColor.value) {
        statusStyle.background = props.color;
        statusStyle.color = props.color;
      }

      const renderStatusText = (style?: CSSProperties) => {
        if (!showStatusTextNode) {
          return null;
        }
        return (
          <span class={`${prefixCls.value}-status-text`} style={style}>
            {hasTextSlot ? textNodes.value : props.text}
          </span>
        );
      };

      if (
        children.length === 0 &&
        hasStatus.value &&
        (showStatusTextNode || hasStatusValue.value || !ignoreCount.value)
      ) {
        const statusTextColor = mergedStyle.value?.color;
        return (
          <span
            {...restAttrs}
            class={badgeClassName}
            ref={badgeRef}
            style={[mergedStyles.value.root, mergedStyle.value]}
          >
            <span
              class={statusCls}
              style={[mergedStyles.value.indicator, statusStyle]}
            />
            {renderStatusText({ color: statusTextColor })}
          </span>
        );
      }

      const scrollNumberCls = clsx(mergedClassNames.value.indicator, {
        [`${prefixCls.value}-dot`]: isDotRef.value,
        [`${prefixCls.value}-count`]: !isDotRef.value,
        [`${prefixCls.value}-count-sm`]: props.size === 'small',
        [`${prefixCls.value}-multiple-words`]:
          !isDotRef.value &&
          displayCount.value &&
          displayCount.value.toString().length > 1,
        [`${prefixCls.value}-status-${props.status}`]: !!props.status,
        [`${prefixCls.value}-color-${props.color}`]: isInternalColor.value,
      });

      const scrollNumberPrefixCls = getPrefixCls(
        'scroll-number',
        props.scrollNumberPrefixCls,
      );

      const livingVNode =
        livingCount && typeof livingCount === 'object'
          ? (livingCount as VNode)
          : null;
      const clonedNode = livingVNode
        ? cloneVNode(livingVNode, {
            style: mergedStyle.value,
          })
        : undefined;
      const scrollNumberStyle: CSSProperties = {};
      if (props.color && !isInternalColor.value) {
        scrollNumberStyle.background = props.color;
      }

      return (
        <span
          {...restAttrs}
          class={badgeClassName}
          ref={badgeRef}
          style={mergedStyles.value.root}
        >
          {children}
          <Transition
            {...getTransitionProps(`${prefixCls.value}-zoom`, {
              appear: false,
            })}
          >
            {{
              default: () =>
                isHidden.value ? null : (
                  <ScrollNumber
                    class={scrollNumberCls}
                    count={displayCount.value}
                    key="scrollNumber"
                    prefixCls={scrollNumberPrefixCls}
                    show={!isHidden.value}
                    style={[
                      mergedStyles.value?.indicator,
                      mergedStyle.value,
                      scrollNumberStyle,
                    ]}
                    title={titleNode}
                  >
                    {clonedNode}
                  </ScrollNumber>
                ),
            }}
          </Transition>
          {renderStatusText()}
        </span>
      );
    };
  },
  {
    name: 'AsBadge',
    inheritAttrs: false,
  },
);

const Badge = InternalBadge as typeof InternalBadge & {
  Ribbon: typeof Ribbon;
};

Badge.Ribbon = Ribbon;

export const BadgeRibbon = Ribbon;

(Badge as any).install = (app: App) => {
  app.component(InternalBadge.name, Badge);
  app.component(Ribbon.name, Ribbon);
};

export default Badge;

export type BadgeRibbonProps = RibbonProps;
