import type { CSSProperties, SlotsType } from 'vue';

import type {
  InputProps as HeadlessInputProps,
  InputRef as HeadlessInputRef,
} from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { InputStatus } from '../_util/statusUtils';
import type { ComponentBaseProps, Variant } from '../config-provider/context';
import type { SizeType } from '../config-provider/size-context';

import { computed, defineComponent, shallowRef } from 'vue';

import { HeadlessInput } from '@arvin-studio/headless';
import { clsx, omit } from '@arvin-studio/kit';

import { getSlotPropsFnRun, toPropsRefs } from '../_util';
import { ContextIsolator } from '../_util/ContextIsolator';
import getAllowClear from '../_util/getAllowClear';
import {
  getAttrStyleAndClass,
  useMergeSemantic,
  useSemanticRootStyle,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { getMergedStatus, getStatusClassNames } from '../_util/statusUtils';
import { useComponentBaseConfig } from '../config-provider/context';
import { useDisabledContext } from '../config-provider/disabled-context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useSize } from '../config-provider/hooks/useSize';
import { useFormItemInputContext } from '../form/context';
import useVariant from '../form/hooks/useVariant';
import { useCompactItemContext } from '../space/Compact';
import useRemovePasswordTimeout from './hooks/useRemovePasswordTimeout';
import useStyle, { useSharedStyle } from './style';
export type InputSemanticName = keyof InputSemanticClassNames &
  keyof InputSemanticStyles;

export interface InputSemanticClassNames {
  clear?: string;
  count?: string;
  input?: string;
  prefix?: string;
  root?: string;
  suffix?: string;
}

export interface InputSemanticStyles {
  clear?: CSSProperties;
  count?: CSSProperties;
  input?: CSSProperties;
  prefix?: CSSProperties;
  root?: CSSProperties;
  suffix?: CSSProperties;
}

export type InputClassNamesType = SemanticClassNamesType<
  InputProps,
  InputSemanticClassNames
>;

export type InputStylesType = SemanticStylesType<
  InputProps,
  InputSemanticStyles
>;

export type InputRef = HeadlessInputRef;

interface BaseHeadlessInputProps {
  allowClear?: HeadlessInputProps['allowClear'];
  autoComplete?: string;
  autocomplete?: string;
  autoFocus?: boolean;
  changeOnComposing?: HeadlessInputProps['changeOnComposing'];
  components?: HeadlessInputProps['components'];
  count?: HeadlessInputProps['count'];
  dataAttrs?: HeadlessInputProps['dataAttrs'];
  defaultValue?: any;
  hidden?: boolean;
  htmlSize?: number;
  inputMode?: string;
  maxlength?: number;
  placeholder?: string;
  prefix?: VueNode;
  readonly?: boolean;
  showCount?: HeadlessInputProps['showCount'];
  suffix?: VueNode;
  type?: HeadlessInputProps['type'];
  value?: any;
}

export interface InputProps
  extends BaseHeadlessInputProps, ComponentBaseProps, InputEmitsProps {
  /** @deprecated Use `Space.Compact` instead. */
  addonAfter?: VueNode;
  /** @deprecated Use `Space.Compact` instead. */
  addonBefore?: VueNode;
  /** @deprecated Use `variant="borderless"` instead. */
  bordered?: boolean;
  classes?: InputClassNamesType;
  disabled?: boolean;
  size?: SizeType;
  status?: InputStatus;
  styles?: InputStylesType;
  variant?: Variant;
}

export interface InputEmits {
  blur: NonNullable<HeadlessInputProps['onBlur']>;
  change: NonNullable<HeadlessInputProps['onChange']>;
  clear: () => void;
  compositionend: NonNullable<HeadlessInputProps['onCompositionEnd']>;
  compositionstart: NonNullable<HeadlessInputProps['onCompositionStart']>;
  focus: NonNullable<HeadlessInputProps['onFocus']>;
  keydown: NonNullable<HeadlessInputProps['onKeyDown']>;
  keyup: NonNullable<HeadlessInputProps['onKeyUp']>;
  pressEnter: NonNullable<HeadlessInputProps['onPressEnter']>;
  'update:value': (value: HeadlessInputProps['value']) => void;
}
export interface InputEmitsProps {
  onBlur?: InputEmits['blur'];
  onChange?: InputEmits['change'];
  onClear?: InputEmits['clear'];
  onCompositionend?: InputEmits['compositionend'];
  onCompositionstart?: InputEmits['compositionstart'];
  onFocus?: InputEmits['focus'];
  onKeydown?: InputEmits['keydown'];
  onKeyup?: InputEmits['keyup'];
  onPressEnter?: InputEmits['pressEnter'];
  'onUpdate:value'?: InputEmits['update:value'];
}

export interface InputSlots {
  addonAfter: () => any;
  addonBefore: () => any;
  clearIcon: () => any;
  default: () => any;
  prefix: () => any;
  suffix: () => any;
}

const omitKeys: (keyof InputProps)[] = [
  'classes',
  'styles',
  'rootClass',
  'size',
  'status',
  'disabled',
  'addonBefore',
  'addonAfter',
  'bordered',
  'variant',
  'prefixCls',
  'allowClear',
  'autoComplete',
  'autocomplete',
  'prefix',
  'suffix',
  'maxlength',
  'readonly',
  'onBlur',
  'onChange',
  'onClear',
  'onCompositionend',
  'onCompositionstart',
  'onFocus',
  'onKeydown',
  'onKeyup',
  'onPressEnter',
  'onUpdate:value',
];

const InternalInput = defineComponent<
  InputProps,
  InputEmits,
  string,
  SlotsType<InputSlots>
>(
  (props, { slots, emit, attrs, expose }) => {
    const {
      prefixCls,
      direction,
      allowClear: contextAllowClear,
      autoComplete: contextAutoComplete,
      autocomplete: contextAutocomplete,
      changeOnComposing: contextChangeOnComposing,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
    } = useComponentBaseConfig('input', props, [
      'allowClear',
      'autoComplete',
      'autocomplete',
      'changeOnComposing',
    ]);

    const {
      classes,
      styles,
      rootClass,
      size: customSize,
      disabled: customDisabled,
      status: customStatus,
      bordered,
      variant: customVariant,
    } = toPropsRefs(
      props,
      'classes',
      'styles',
      'rootClass',
      'size',
      'disabled',
      'status',
      'bordered',
      'variant',
    );

    const inputRef = shallowRef<HeadlessInputRef>();

    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useSharedStyle(prefixCls, rootClass);
    useStyle(prefixCls, rootCls);

    const { compactSize, compactItemClassnames } = useCompactItemContext(
      prefixCls,
      direction,
    );

    const mergedSize = useSize<SizeType>(
      (ctx) => (customSize.value ?? compactSize.value ?? ctx) as SizeType,
    );

    const disabledContext = useDisabledContext();
    const mergedDisabled = computed(
      () => customDisabled.value ?? disabledContext.value,
    );

    const mergedProps = computed(() => {
      return {
        ...props,
        size: mergedSize.value,
        disabled: mergedDisabled.value,
      } as InputProps;
    });

    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      InputClassNamesType,
      InputStylesType,
      InputProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, contextStyleRoot as any, styles),
      useToProps(mergedProps),
    );

    const formItemInputContext = useFormItemInputContext();
    const contextStatus = computed(() => formItemInputContext.value.status);
    const hasFeedback = computed(() => formItemInputContext.value.hasFeedback);
    const feedbackIcon = computed(
      () => formItemInputContext.value.feedbackIcon,
    );
    const mergedStatus = computed(() =>
      getMergedStatus(contextStatus.value, customStatus.value),
    );

    const [mergedVariant, enableVariasCls] = useVariant(
      'input',
      customVariant,
      bordered,
    );

    const removePasswordTimeout = useRemovePasswordTimeout(inputRef, true);

    const mergedAllowClear = computed(() => {
      return getAllowClear(props.allowClear ?? contextAllowClear.value);
    });

    const mergedAutoComplete = computed(
      () =>
        props.autoComplete ??
        props.autocomplete ??
        contextAutoComplete.value ??
        contextAutocomplete.value,
    );
    const mergedChangeOnComposing = computed(
      () => props.changeOnComposing ?? contextChangeOnComposing.value,
    );

    expose({
      focus: (
        options?: Parameters<NonNullable<HeadlessInputRef['focus']>>[0],
      ) => inputRef.value?.focus?.(options),
      blur: () => inputRef.value?.blur?.(),
      setSelectionRange: (
        ...args: Parameters<NonNullable<HeadlessInputRef['setSelectionRange']>>
      ) => inputRef.value?.setSelectionRange?.(...args),
      select: () => inputRef.value?.select?.(),
      input: computed(() => inputRef.value?.input ?? null),
      nativeElement: computed(() => inputRef.value?.nativeElement ?? null),
    });

    const handlePressEnter: InputEmits['pressEnter'] = (e) => {
      emit('pressEnter', e);
    };

    const triggerChange = (e: any) => {
      const target = e?.target as HTMLInputElement | undefined;
      emit('update:value', target?.value);
      emit('change', e);
    };

    const handleClear = () => {
      emit('clear');
    };

    const handleFocus: InputEmits['focus'] = (e) => {
      removePasswordTimeout();
      emit('focus', e);
    };

    const handleBlur: InputEmits['blur'] = (e) => {
      removePasswordTimeout();
      emit('blur', e);
    };

    const handleKeyDown: InputEmits['keydown'] = (e) => {
      emit('keydown', e);
    };

    const handleKeyUp: InputEmits['keyup'] = (e) => {
      emit('keyup', e);
    };

    const handleCompositionStart: InputEmits['compositionstart'] = (e) => {
      emit('compositionstart', e);
    };

    const handleCompositionEnd: InputEmits['compositionend'] = (e) => {
      emit('compositionend', e);
    };

    return () => {
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs, {
        omit: ['onCompositionStart', 'onCompositionEnd', 'class'],
      });

      const prefixNode = getSlotPropsFnRun(slots, props, 'prefix');
      const suffixSlotNode = getSlotPropsFnRun(slots, props, 'suffix');
      const addonBeforeNode = getSlotPropsFnRun(slots, props, 'addonBefore');
      const addonAfterNode = getSlotPropsFnRun(slots, props, 'addonAfter');

      const mergedSuffix =
        hasFeedback.value || suffixSlotNode ? (
          <>
            {suffixSlotNode}
            {hasFeedback.value ? feedbackIcon.value : null}
          </>
        ) : undefined;

      const wrapAddon = (node?: VueNode) => {
        if (!node) {
          return undefined;
        }
        return (
          <ContextIsolator form space>
            {node}
          </ContextIsolator>
        );
      };

      const restProps = omit(props, omitKeys);

      const classesValue = clsx(
        contextClassName.value,
        className,
        rootClass.value,
        compactItemClassnames.value,
        cssVarCls.value,
        rootCls.value,
        mergedClassNames.value.root,
        hashId.value,
      );

      const mergedStyle: any = {
        ...mergedStyles.value.root,
        ...style,
      };

      const variantClassName = clsx(
        {
          [`${prefixCls.value}-${mergedVariant.value}`]: enableVariasCls.value,
        },
        getStatusClassNames(prefixCls.value, mergedStatus.value),
      );

      const classNames = {
        ...mergedClassNames.value,
        input: clsx(
          {
            [`${prefixCls.value}-sm`]: mergedSize.value === 'small',
            [`${prefixCls.value}-lg`]: mergedSize.value === 'large',
            [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
          },
          mergedClassNames.value.input,
          hashId.value,
        ),
        affixWrapper: clsx(
          {
            [`${prefixCls.value}-affix-wrapper-sm`]:
              mergedSize.value === 'small',
            [`${prefixCls.value}-affix-wrapper-lg`]:
              mergedSize.value === 'large',
            [`${prefixCls.value}-affix-wrapper-rtl`]: direction.value === 'rtl',
          },
          hashId.value,
        ),
        wrapper: clsx(
          {
            [`${prefixCls.value}-group-rtl`]: direction.value === 'rtl',
          },
          hashId.value,
        ),
        groupWrapper: clsx(
          {
            [`${prefixCls.value}-group-wrapper-sm`]:
              mergedSize.value === 'small',
            [`${prefixCls.value}-group-wrapper-lg`]:
              mergedSize.value === 'large',
            [`${prefixCls.value}-group-wrapper-rtl`]: direction.value === 'rtl',
            [`${prefixCls.value}-group-wrapper-${mergedVariant.value}`]:
              enableVariasCls.value,
          },
          getStatusClassNames(
            `${prefixCls.value}-group-wrapper`,
            mergedStatus.value,
            hasFeedback.value,
          ),
          hashId.value,
        ),
        variant: variantClassName,
      };

      return (
        <HeadlessInput
          {...restAttrs}
          {...restProps}
          addonAfter={wrapAddon(addonAfterNode)}
          addonBefore={wrapAddon(addonBeforeNode)}
          allowClear={mergedAllowClear.value}
          autoComplete={mergedAutoComplete.value}
          changeOnComposing={mergedChangeOnComposing.value}
          class={classesValue}
          classNames={classNames as any}
          components={props.components}
          dataAttrs={props.dataAttrs}
          disabled={mergedDisabled.value}
          maxLength={props.maxlength}
          onBlur={handleBlur}
          onChange={(e) => {
            removePasswordTimeout();
            triggerChange(e);
          }}
          onClear={handleClear}
          onCompositionEnd={handleCompositionEnd}
          onCompositionStart={handleCompositionStart}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onPressEnter={handlePressEnter}
          prefix={prefixNode}
          prefixCls={prefixCls.value}
          readOnly={props.readonly}
          ref={inputRef as any}
          style={mergedStyle}
          styles={mergedStyles.value as any}
          suffix={mergedSuffix}
          v-slots={{
            clearIcon: slots.clearIcon,
          }}
        />
      );
    };
  },
  {
    name: 'AsInput',
    inheritAttrs: false,
  },
);

export default InternalInput;
