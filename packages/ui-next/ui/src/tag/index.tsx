import type { App, CSSProperties, SlotsType } from 'vue';

import type { LiteralUnion } from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type { PresetColorType, PresetStatusColorType } from '../_util/colors';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { ClosableType } from '../_util/hooks/useClosable';
import type { ComponentBaseProps } from '../config-provider/context';

import { computed, createVNode, defineComponent, shallowRef } from 'vue';

import { filterEmpty } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import {
  pureAttrs,
  useMergeSemantic,
  useToArr,
  useToProps,
} from '../_util/hooks';
import useClosable, { pickClosable } from '../_util/hooks/useClosable';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { replaceElement } from '../_util/vueNode';
import Wave from '../_util/wave';
import { useComponentBaseConfig, useConfig } from '../config-provider/context';
import { useDisabledContext } from '../config-provider/disabled-context';
import CheckableTag from './CheckableTag';
import CheckableTagGroup from './CheckableTagGroup';
import useColor from './hooks/useColor';
import useStyle from './style';
import PresetCmp from './style/presetCmp';
import StatusCmp from './style/statusCmp';

export type { CheckableTagProps } from './CheckableTag';

export type TagSemanticName = keyof TagSemanticClassNames &
  keyof TagSemanticStyles;

export interface TagSemanticClassNames {
  close?: string;
  content?: string;
  icon?: string;
  root?: string;
}

export interface TagSemanticStyles {
  close?: CSSProperties;
  content?: CSSProperties;
  icon?: CSSProperties;
  root?: CSSProperties;
}

export type TagClassNamesType = SemanticClassNamesType<
  TagProps,
  TagSemanticClassNames
>;

export type TagStylesType = SemanticStylesType<TagProps, TagSemanticStyles>;

export interface TagProps
  extends
    ComponentBaseProps,
    /* @vue-ignore */
    TagEmitsProps {
  bordered?: boolean;
  classes?: TagClassNamesType;
  /** Advised to use closeIcon instead. */
  closable?: ClosableType;
  closeIcon?: VueNode;
  color?: LiteralUnion<PresetColorType | PresetStatusColorType>;
  disabled?: boolean;
  href?: string;
  icon?: VueNode;
  onClick?: (e: MouseEvent) => void;
  styles?: TagStylesType;
  target?: string;
  variant?: 'filled' | 'outlined' | 'solid';
}

export interface TagSlots {
  closeIcon?: () => any;
  default?: () => any;
  icon?: () => any;
}

export interface TagEmits {
  close: (ev: MouseEvent) => void;
}
export interface TagEmitsProps {
  onClose?: TagEmits['close'];
}

const defaultProps: Partial<TagProps> = {
  bordered: true,
  closable: undefined,
};
const InternalTag = defineComponent<
  TagProps,
  TagEmits,
  string,
  SlotsType<TagSlots>
>(
  (props = defaultProps, { slots, attrs, emit, expose }) => {
    const configContext = useConfig();
    const {
      prefixCls,
      direction,
      class: contextClassName,
      variant: contextVariant,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
    } = useComponentBaseConfig('tag', props, ['variant']);
    const {
      variant,
      href,
      target,
      disabled: customDisabled,
      color,
      bordered,
      classes,
      styles,
    } = toPropsRefs(
      props,
      'classes',
      'styles',
      'variant',
      'href',
      'target',
      'disabled',
      'color',
      'bordered',
    );
    const [hashId, cssVarCls] = useStyle(prefixCls);

    // ====================== Colors ======================
    const [mergedVariant, mergedColor, isPreset, isStatus, customTagStyle] =
      useColor({ bordered, variant, color }, contextVariant);

    const isInternalColor = computed(() => isPreset.value || isStatus.value);
    // ===================== Disabled =====================
    const disabled = useDisabledContext();
    const mergedDisabled = computed(
      () => customDisabled?.value ?? disabled.value,
    );
    const visible = shallowRef(true);
    const tagRef = shallowRef<HTMLElement>();
    // =========== Merged Props for Semantic ===========
    const mergedProps = computed(() => {
      return {
        ...props,
        color: mergedColor?.value,
        variant: mergedVariant?.value,
        disabled: mergedDisabled?.value,
      } as TagProps;
    });

    // ====================== Styles ======================
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      TagClassNamesType,
      TagStylesType,
      TagProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, styles),
      useToProps(mergedProps),
    );
    expose({ tagRef });

    const triggerClose = (e: KeyboardEvent | MouseEvent) => {
      if (mergedDisabled.value) {
        return;
      }
      e.stopPropagation();
      emit('close', e as MouseEvent);
      if (e.defaultPrevented) {
        return;
      }
      if (href.value) {
        e.preventDefault();
      }
      visible.value = false;
    };

    const handleCloseKeyDown = (e: KeyboardEvent) => {
      if (!(e.key === 'Enter' || e.key === ' ')) {
        return;
      }

      e.preventDefault();
      (e.currentTarget as HTMLElement)?.click();
    };

    const closableInfo = useClosable(
      pickClosable(
        computed(
          () =>
            ({
              ...props,
              closeIcon: getSlotPropsFnRun(slots, props, 'closeIcon'),
            }) as unknown as any,
        ),
      ) as any,
      pickClosable(computed(() => configContext.value.tag as any)) as any,
      computed(() => {
        return {
          closable: false,
          closeIconRender(iconNode) {
            const replacement = (
              <span
                aria-disabled={mergedDisabled.value || undefined}
                class={clsx(
                  `${prefixCls.value}-close-icon`,
                  mergedClassNames.value?.close,
                )}
                onClick={triggerClose}
                onKeydown={handleCloseKeyDown}
                role="button"
                style={mergedStyles.value?.close}
                tabindex={mergedDisabled.value ? -1 : 0}
              >
                {iconNode}
              </span>
            );
            return replaceElement(iconNode, replacement, (originProps) => {
              return {
                onClick(e: MouseEvent) {
                  originProps?.onClick?.(e);
                  triggerClose(e);
                },
                onKeydown(e: KeyboardEvent) {
                  originProps?.onKeydown?.(e);
                  if (!e.defaultPrevented) {
                    handleCloseKeyDown(e);
                  }
                },
                role: 'button',
                // camelCase is required when the close icon is an icon component
                // like CloseOutlined — AntdIcon declares `tabIndex` as a typed
                // prop and renders `<span tabindex={iconTabIndex}>` after its
                // attr spread, so a lowercase `tabindex` lands only in attrs
                // and is then overridden back to `-1` by that hardcoded
                // assignment. `tabIndex` flows into the component prop and
                // drives `iconTabIndex` directly. Vue normalizes camelCase to
                // the lowercase HTML attribute for plain <span> close icons too.
                tabIndex: mergedDisabled.value ? -1 : 0,
                'aria-disabled': mergedDisabled.value || undefined,
                class: clsx(
                  originProps?.class,
                  `${prefixCls.value}-close-icon`,
                  mergedClassNames.value?.close,
                ),
                style: {
                  ...(originProps?.style as any),
                  ...mergedStyles.value?.close,
                },
              };
            });
          },
        };
      }),
    );

    const tagStyle = computed(() => {
      let nextTagStyle: any = {
        ...mergedStyles.value?.root,
        ...contextStyle.value,
        ...(attrs as any).style,
      };
      if (!mergedDisabled.value) {
        nextTagStyle = { ...customTagStyle.value, ...nextTagStyle };
      }
      return nextTagStyle as CSSProperties;
    });

    return () => {
      // Style
      const tagClassName = clsx(
        prefixCls.value,
        contextClassName.value,
        mergedClassNames.value.root,
        `${prefixCls.value}-${mergedVariant.value}`,
        {
          [`${prefixCls.value}-${mergedColor.value}`]: isInternalColor.value,
          [`${prefixCls.value}-hidden`]: !visible.value,
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
          [`${prefixCls.value}-disabled`]: mergedDisabled.value,
        },
        (attrs as any).class,
        props.rootClass,
        hashId.value,
        cssVarCls.value,
      );
      const children = filterEmpty(slots?.default?.())[0];
      // ====================== Render ======================
      const isNeedWave =
        (children && children.type === 'a') ||
        typeof props.onClick === 'function';
      const iconNode = getSlotPropsFnRun(slots, props, 'icon');
      let iconNodes = iconNode;
      // eslint-disable-next-line unicorn/prefer-ternary
      if (iconNode) {
        iconNodes = createVNode(iconNode, {
          class: mergedClassNames.value?.icon,
          style: mergedStyles.value?.icon,
        });
      }

      const kids = iconNodes ? (
        <>
          {iconNodes}
          {children && (
            <span
              class={mergedClassNames.value.content}
              style={mergedStyles.value.content}
            >
              {children}
            </span>
          )}
        </>
      ) : (
        children
      );
      const TagWrapper = href.value ? 'a' : 'span';

      const mergedCloseIcon = closableInfo.value?.[1];
      const tagNode = (
        <TagWrapper
          {...pureAttrs(attrs)}
          class={tagClassName}
          href={mergedDisabled.value ? undefined : href.value}
          onClick={mergedDisabled.value ? undefined : props.onClick}
          style={tagStyle.value}
          target={target.value}
          {...(href.value && mergedDisabled.value
            ? { 'aria-disabled': true }
            : {})}
        >
          {kids}
          {mergedCloseIcon}
          {isPreset.value && (
            <PresetCmp key="preset" prefixCls={prefixCls.value} />
          )}
          {isStatus.value && (
            <StatusCmp key="status" prefixCls={prefixCls.value} />
          )}
        </TagWrapper>
      );
      return isNeedWave ? <Wave component="Tag">{tagNode}</Wave> : tagNode;
    };
  },
  {
    name: 'AsTag',
    inheritAttrs: false,
  },
);

const Tag = InternalTag as typeof InternalTag & {
  CheckableTag: typeof CheckableTag;
};

Tag.CheckableTag = CheckableTag;

(Tag as any).install = (app: App) => {
  app.component(InternalTag.name, Tag);
  app.component(CheckableTag.name, CheckableTag);
  app.component(CheckableTagGroup.name, CheckableTagGroup);
};
export { CheckableTag, CheckableTagGroup };

export default Tag;
