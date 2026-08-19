import type { App, CSSProperties, SlotsType } from 'vue';

import type { RenderNodeFn, VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { ComponentBaseProps } from '../config-provider/context';
import type { SizeType } from '../config-provider/size-context';
import type {
  ButtonColorType,
  ButtonHTMLType,
  ButtonShape,
  ButtonType,
  ButtonVariantType,
} from './button-helper';

import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from 'vue';

import { filterEmpty } from '@arvin-studio/headless';
import { clsx, omit, toArray } from '@arvin-studio/kit';

import { getSlotPropsFnRun, toPropsRefs } from '../_util';
import {
  useMergeSemantic,
  useSemanticRootStyle,
  useToArr,
  useToProps,
} from '../_util/hooks';
import Wave from '../_util/wave';
import { useComponentBaseConfig } from '../config-provider/context';
import { useDisabledContext } from '../config-provider/disabled-context';
import { useSize } from '../config-provider/hooks/useSize';
import { useCompactItemContext } from '../space/Compact';
import {
  isTwoCNChar,
  isUnBorderedButtonVariant,
  spaceChildren,
} from './button-helper';
import DefaultLoadingIcon from './default-loading-icon';
import IconWrapper from './icon-wrapper';
import useStyle from './style';
import CompactStyle from './style/compact';

export type LegacyButtonType = 'danger' | ButtonType;

export type ButtonSemanticName = keyof ButtonSemanticClassNames &
  keyof ButtonSemanticStyles;

export interface ButtonSemanticClassNames {
  content?: string;
  icon?: string;
  root?: string;
}

export interface ButtonSemanticStyles {
  content?: CSSProperties;
  icon?: CSSProperties;
  root?: CSSProperties;
}

export type ButtonClassNamesType = SemanticClassNamesType<
  BaseButtonProps,
  ButtonSemanticClassNames
>;

export type ButtonStylesType = SemanticStylesType<
  BaseButtonProps,
  ButtonSemanticStyles
>;

export interface BaseButtonProps extends ComponentBaseProps {
  _skipSemantic?: boolean;
  /** 自动聚焦 */
  autoFocus?: boolean;
  /** 将按钮宽度调整为其父宽度的选项 */
  block?: boolean;
  classes?: ButtonClassNamesType;
  /** 设置按钮的颜色 */
  color?: ButtonColorType;
  /** 语法糖，设置危险按钮。当设置 color 时会以后者为准 */
  danger?: boolean;
  /** 设置按钮失效状态 */
  disabled?: boolean;
  /** 幽灵属性，使按钮背景透明 */
  ghost?: boolean;
  icon?: VueNode;
  /** 设置按钮图标组件的位置 */
  iconPlacement?: 'end' | 'start';
  /** 设置按钮载入状态 */
  loading?: boolean | { delay?: number; icon?: RenderNodeFn };
  /** 设置按钮形状 */
  shape?: ButtonShape;
  /** 设置按钮大小 */
  size?: SizeType;
  styles?: ButtonStylesType;
  /** 语法糖，设置按钮类型。当设置 variant 与 color 时以后者为准 */
  type?: ButtonType;
  /** 设置按钮的变体 */
  variant?: ButtonVariantType;
}

export interface ButtonProps extends BaseButtonProps {
  /** 我们默认提供两个汉字之间的空格，可以设置 autoInsertSpace 为 false 关闭 */
  autoInsertSpace?: boolean;
  href?: string;
  /** 设置 button 原生的 type 值，可选值请参考 HTML 标准 */
  htmlType?: ButtonHTMLType;
  target?: '_blank' | '_parent' | '_self' | '_top' | string;
}

type ColorVariantPairType = [
  color?: ButtonColorType,
  variant?: ButtonVariantType,
];

/**
 * type 到 [color, variant] 的映射表。
 *  color × variant 的笛卡尔积。
 * 这里做兼容：primary → primary + solid，dashed → default + dashed。
 */
const ButtonTypeMap: Partial<Record<ButtonType, ColorVariantPairType>> = {
  default: ['default', 'outlined'],
  primary: ['primary', 'solid'],
  dashed: ['default', 'dashed'],
  link: ['link' as any, 'link'],
  text: ['default', 'text'],
};

const defaultButtonProps = {
  iconPlacement: 'start',
  htmlType: 'button',
  autoInsertSpace: undefined,
  disabled: undefined,
  size: undefined,
} as any;

interface LoadingConfigType {
  delay: number;
  loading: boolean;
}

export interface ButtonEmits {
  click: (e: MouseEvent) => void;
}

export interface ButtonSlots {
  default?: () => any;
  icon?: () => any;
  loadingIcon?: () => any;
}

/**
 * 解析 loading prop。支持三种形式：
 *   loading={true}              → 立刻显示 loading
 *   loading={{ delay: 500 }}    → 500ms 后才显示（避免快速操作闪烁）
 *   loading={{ delay: 0, icon: <Spin /> }} → 立刻显示，自定义图标
 */
function getLoadingConfig(
  loading: BaseButtonProps['loading'],
): LoadingConfigType {
  if (typeof loading === 'object' && loading) {
    let delay = loading?.delay;
    delay = !Number.isNaN(delay) && typeof delay === 'number' ? delay : 0;
    return {
      loading: delay <= 0,
      delay,
    };
  }

  return {
    loading: !!loading,
    delay: 0,
  };
}

const AsButton = defineComponent<
  ButtonProps,
  ButtonEmits,
  string,
  SlotsType<ButtonSlots>
>(
  (props = defaultButtonProps, { attrs, slots, emit }) => {
    const mergedType = computed(() => props.type || 'default');

    const {
      prefixCls,
      autoInsertSpace: contextAutoInsertSpace,
      direction,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
      shape: contextShape,
      color: contextColor,
      loadingIcon: contextLoadingIcon,
      variant: contextVariant,
    } = useComponentBaseConfig(
      'button',
      props,
      ['autoInsertSpace', 'variant', 'shape', 'color', 'loadingIcon'],
      'btn',
    );

    const { classes, styles } = toPropsRefs(props, 'classes', 'styles');

    const mergedShape = computed(
      () => props.shape || contextShape.value || 'default',
    );

    /**
     * color × variant 的三级优先级解析：
     *   1. 局部 props.color + props.variant（最高优先级）
     *   2. type 语法糖（v4 兼容）：type="primary" → ['primary', 'solid']
     *   3. ConfigProvider 全局配置 contextColor/contextVariant
     *   4. 兜底：['default', 'outlined']
     */
    const parsedColorVariant = computed<ColorVariantPairType>(() => {
      const { color, variant, type, danger } = props;

      // 优先级 1：明确的 color + variant
      if (color && variant) {
        return [color, variant];
      }
      // 优先级 2：type 兼容（或 danger 快捷方式）
      if (type || danger) {
        const colorVariantPair = ButtonTypeMap[mergedType.value] || [];
        if (danger) {
          return ['danger', colorVariantPair[1]];
        }
        return colorVariantPair;
      }
      // 优先级 3：ConfigProvider 全局配置
      if (contextColor?.value && contextVariant?.value) {
        return [contextColor.value, contextVariant.value];
      }
      // 优先级 4：兜底
      return ['default', 'outlined'];
    });

    /**
     * ghost 属性会强制 variant 变为 outlined：
     *   <Button ghost type="primary"> → color=primary, variant=outlined
     * 因为 ghost 按钮只有 outlined 样式（没有 ghost solid）。
     */
    const mergedColorVariant = computed<ColorVariantPairType>(() => {
      const [parsedColor, parsedVariant] = parsedColorVariant.value;
      if (props.ghost && parsedVariant === 'solid') {
        return [parsedColor, 'outlined'];
      }
      return [parsedColor, parsedVariant];
    });

    const mergedColor = computed(() => mergedColorVariant.value[0]);

    const mergedVariant = computed(() => mergedColorVariant.value[1]);

    const isDanger = computed(() => mergedColor.value === 'danger');

    const mergedColorText = computed(() =>
      isDanger.value ? 'dangerous' : mergedColor.value,
    );

    const mergedInsertSpace = computed(() => {
      return props?.autoInsertSpace ?? contextAutoInsertSpace?.value ?? true;
    });

    const [hashId, cssVarCls] = useStyle(prefixCls);

    const disabled = useDisabledContext();

    const mergedDisabled = computed(() => {
      return props?.disabled ?? disabled.value;
    });

    const loadingOrDelay = computed<LoadingConfigType>(() => {
      return getLoadingConfig(props.loading);
    });
    const innerLoading = shallowRef(loadingOrDelay.value.loading);
    const hasTwoCNChar = shallowRef(false);
    const buttonRef = shallowRef<HTMLAnchorElement | HTMLButtonElement>();
    const isMountRef = shallowRef(true);

    onMounted(() => {
      isMountRef.value = false;
      if (props.autoFocus && buttonRef.value) {
        buttonRef.value?.focus?.();
      }
    });

    onBeforeUnmount(() => {
      isMountRef.value = true;
    });

    // ========================= Loading 延迟 =========================
    // 支持 loading={{ delay: 500 }}：500ms 后才显示 loading，
    // 避免快速操作时的闪烁
    let delayTimer: null | ReturnType<typeof setTimeout> = null;
    watch(
      [() => loadingOrDelay.value.delay, () => loadingOrDelay.value.loading],
      async (_new, _old, onCleanup) => {
        if (loadingOrDelay.value.delay > 0) {
          delayTimer = setTimeout(() => {
            delayTimer = null;
            innerLoading.value = true;
          }, loadingOrDelay.value.delay);
        } else {
          innerLoading.value = loadingOrDelay.value.loading;
        }
        onCleanup(() => {
          if (!delayTimer) {
            return;
          }

          clearTimeout(delayTimer);
          delayTimer = null;
        });
      },
      {
        flush: 'sync',
        immediate: true,
      },
    );

    /**
     * 两个中文字符检测：当按钮内只有两个字的中文（如"确定"、"取消"），
     * 自动在中间插入空格（"确 定"），增加视觉呼吸感。
     * 通过 CSS .as-btn-two-chinese-chars 的 letter-spacing 实现。
     */
    watch(
      [mergedInsertSpace, buttonRef, mergedVariant],
      async () => {
        await nextTick();
        if (!buttonRef.value || !mergedInsertSpace.value) {
          return;
        }
        const buttonText = buttonRef.value.textContent || '';
        const children = filterEmpty(slots?.default?.());
        const iconChildren = toArray(getSlotPropsFnRun(slots, props, 'icon'));
        // 只有 1 个子节点、无图标、非无边框变体时才插入空格
        const needInserted =
          children.length === 1 &&
          iconChildren.length === 0 &&
          !isUnBorderedButtonVariant(mergedVariant.value);
        if (needInserted && isTwoCNChar(buttonText.trim())) {
          if (!hasTwoCNChar.value) {
            hasTwoCNChar.value = true;
          }
        } else if (hasTwoCNChar.value) {
          hasTwoCNChar.value = false;
        }
      },
      {
        immediate: true,
      },
    );

    // ========================= Events =========================
    const handleClick = (e: MouseEvent) => {
      if (innerLoading.value || mergedDisabled.value) {
        e.preventDefault();
        return;
      }
      emit('click', e);
    };

    // ========================== Size ==========================
    // 尺寸优先级：props.size > compact 上下文（Space.Compact） > ConfigProvider size
    const { compactSize, compactItemClassnames } = useCompactItemContext(
      prefixCls,
      direction,
    );
    const sizeClassNameMap = {
      large: 'lg',
      small: 'sm',
      middle: undefined,
      medium: undefined,
    };
    const sizeFullName = useSize<SizeType>(
      (ctxSize) => (props?.size ?? compactSize.value ?? ctxSize) as SizeType,
    );
    const mergedIconPlacement = computed(() => props?.iconPlacement ?? 'start');

    // =========== Merged Props for Semantic ===========
    // 把所有合并后的值（局部 + 全局 + 派生）组装成一个完整 props 对象
    // 传给 useMergeSemantic 的 useToProps，用于函数式 class/style 解析
    const mergedProps = computed(() => {
      return {
        ...props,
        type: mergedType.value,
        color: mergedColor.value,
        variant: mergedVariant.value,
        danger: isDanger.value,
        shape: mergedShape.value,
        size: sizeFullName.value,
        disabled: mergedDisabled.value,
        loading: innerLoading.value,
        iconPlacement: mergedIconPlacement.value,
      };
    });

    // ========================= Style ==========================
    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      ButtonClassNamesType,
      ButtonStylesType,
      ButtonProps
    >(
      useToArr(
        ...(props._skipSemantic
          ? [ref(), classes]
          : [contextClassNames, classes]),
      ),
      useToArr(
        ...(props._skipSemantic
          ? [ref(), styles]
          : [contextStyles, contextStyleRoot as any, styles]),
      ),
      useToProps(mergedProps),
    );

    return () => {
      const { loading } = props;
      const sizeCls = sizeFullName.value
        ? (sizeClassNameMap?.[sizeFullName.value] ?? '')
        : '';
      const iconChildren = getSlotPropsFnRun(slots, props, 'icon');
      const hasIcon = !!iconChildren;
      const iconType = innerLoading.value ? 'loading' : hasIcon;
      const children = filterEmpty(slots?.default?.());
      const needInserted =
        children.length === 1 &&
        !hasIcon &&
        !isUnBorderedButtonVariant(mergedVariant.value);
      const kids =
        children.length > 0
          ? spaceChildren(
              children,
              needInserted && mergedInsertSpace.value,
              mergedStyles.value.content,
              mergedClassNames.value.content,
            )
          : null;
      const cls = clsx(
        prefixCls.value,
        hashId.value,
        cssVarCls.value,
        {
          // ── 形状（circle、round） ──
          [`${prefixCls.value}-${mergedShape.value}`]:
            mergedShape.value !== 'default' && mergedShape.value,
          [`${prefixCls.value}-two-chinese-chars`]:
            hasTwoCNChar.value &&
            mergedInsertSpace.value &&
            !innerLoading.value,
          // ── type 兼容（v4 旧语法，保留兼容） ──
          [`${prefixCls.value}-${mergedType.value}`]: mergedType.value,
          // ── danger 快捷方式 ──
          [`${prefixCls.value}-dangerous`]: props.danger,
          // ── color × variant 组合 ──
          [`${prefixCls.value}-color-${mergedColorText.value}`]:
            mergedColorText.value,
          [`${prefixCls.value}-variant-${mergedVariant.value}`]:
            mergedVariant.value,
          // ── 尺寸（sm / lg） ──
          [`${prefixCls.value}-${sizeCls}`]: sizeCls,
          // ── 纯图标按钮（无文字子节点） ──
          [`${prefixCls.value}-icon-only`]: children.length === 0 && !!iconType,
          // ── 幽灵按钮（透明背景，反色文字） ──
          [`${prefixCls.value}-background-ghost`]:
            props.ghost && !isUnBorderedButtonVariant(mergedVariant.value),
          // ── loading 状态 ──
          [`${prefixCls.value}-loading`]: innerLoading.value,
          // ── 两个中文字自动加间距 ──
          [`${prefixCls.value}-two-chinese-chars`]:
            hasTwoCNChar.value &&
            mergedInsertSpace.value &&
            !innerLoading.value,
          // ── 块级按钮，宽度撑满父容器 ──
          [`${prefixCls.value}-block`]: props.block,
          // ── RTL 从右到左 ──
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
          // ── 图标位置在文字结尾 ──
          [`${prefixCls.value}-icon-end`]: mergedIconPlacement.value === 'end',
        },
        compactItemClassnames.value,
        (attrs as any).class,
        props.rootClass,
        contextClassName.value,
        mergedClassNames.value.root,
      );

      const fullStyle: any[] = [mergedStyles.value.root, (attrs as any).style];
      const iconSharedProps = {
        class: mergedClassNames.value.icon,
        style: mergedStyles.value.icon,
      };

      const iconWrapperElement = (child: any) => (
        <IconWrapper prefixCls={prefixCls.value} {...iconSharedProps}>
          {child}
        </IconWrapper>
      );

      const defaultLoadingIconElement = (
        <DefaultLoadingIcon
          existIcon={hasIcon}
          loading={innerLoading.value}
          mount={isMountRef.value}
          prefixCls={prefixCls.value}
          {...iconSharedProps}
        />
      );

      /**
       * loading 图标优先级：slot #loadingIcon > props.loading.icon > ConfigProvider loadingIcon
       * 正常图标：slot #icon > props.icon
       */
      const slotLoadingIcon = getSlotPropsFnRun(slots, {}, 'loadingIcon');
      const propLoadingIcon =
        loading && typeof loading === 'object' && loading.icon
          ? typeof loading.icon === 'function'
            ? loading.icon()
            : loading.icon
          : null;
      const contextLoadingIconNode = getSlotPropsFnRun(
        {},
        {
          loadingIcon: contextLoadingIcon.value,
        },
        'loadingIcon',
      );
      const mergedLoadingIcon =
        slotLoadingIcon || propLoadingIcon || contextLoadingIconNode;

      /**
       * 图标节点的三种状态：
       *   1. 正常态 + 有自定义图标 → 显示自定义图标
       *   2. loading 态 + 有自定义 loading 图标 → 显示自定义 loading 图标
       *   3. loading 态 + 无自定义 loading 图标 → 显示默认 loading 动画
       */
      let iconNode: any;
      if (hasIcon && !innerLoading.value) {
        iconNode = iconWrapperElement(iconChildren);
      } else if (innerLoading.value && mergedLoadingIcon) {
        iconNode = iconWrapperElement(mergedLoadingIcon);
      } else {
        iconNode = defaultLoadingIconElement;
      }
      // 有 href → 渲染为 <a> 标签；无 href → 渲染为 <button>
      const mergedHref = props.href;
      const htmlType = props.htmlType ?? 'button';

      if (mergedHref !== undefined) {
        return (
          <a
            {...omit(attrs, ['class', 'style'])}
            aria-disabled={mergedDisabled.value}
            class={[
              cls,
              { [`${prefixCls.value}-disabled`]: mergedDisabled.value },
            ]}
            href={mergedDisabled.value ? undefined : mergedHref}
            onClick={handleClick}
            ref={buttonRef as any}
            style={fullStyle}
            target={props.target}
          >
            {iconNode}
            {kids}
          </a>
        );
      }

      let buttonNodes = (
        <button
          {...omit(attrs, ['class', 'style'])}
          class={cls}
          disabled={mergedDisabled.value}
          onClick={handleClick}
          ref={buttonRef as any}
          style={fullStyle}
          type={htmlType}
        >
          {iconNode}
          {kids}
          {compactItemClassnames.value ? (
            <CompactStyle prefixCls={prefixCls.value} />
          ) : null}
        </button>
      );
      // 非无边框变体 → 包裹 Wave 水波纹效果
      if (!isUnBorderedButtonVariant(mergedVariant.value)) {
        buttonNodes = (
          <Wave component="Button" disabled={innerLoading.value}>
            {buttonNodes}
          </Wave>
        );
      }
      return buttonNodes;
    };
  },
  {
    name: 'AsButton',
    inheritAttrs: false,
  },
);

const Button = AsButton as typeof AsButton & {
  __AS_BUTTON: boolean;
};

Button.__AS_BUTTON = true;

(Button as any).install = (app: App) => {
  app.component(AsButton.name, Button);
};

export default Button;
