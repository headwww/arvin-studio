import type { CSSProperties, SlotsType } from 'vue';

import type {
  TextAreaProps as HeadlessTextAreaProps,
  TextAreaRef as HeadlessTextAreaRef,
  InputProps,
} from '@arvin-studio/headless';

import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { InputStatus } from '../_util/statusUtils';
import type { ComponentBaseProps, Variant } from '../config-provider/context';
import type { SizeType } from '../config-provider/size-context';

import { computed, defineComponent, onBeforeUnmount, shallowRef } from 'vue';

import { HeadlessTextArea } from '@arvin-studio/headless';
import { clsx, omit } from '@arvin-studio/kit';

import getAllowClear from '../_util/getAllowClear';
import {
  getAttrStyleAndClass,
  useMergeSemantic,
  useSemanticRootStyle,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { getMergedStatus, getStatusClassNames } from '../_util/statusUtils';
import { toPropsRefs } from '../_util/tools';
import { useComponentBaseConfig } from '../config-provider/context';
import { useDisabledContext } from '../config-provider/disabled-context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useSize } from '../config-provider/hooks/useSize';
import { useFormItemInputContext } from '../form/context';
import useVariant from '../form/hooks/useVariant';
import { useCompactItemContext } from '../space/Compact';
import { useSharedStyle } from './style';
import useStyle from './style/textarea';

export type TextAreaSemanticName = keyof TextAreaSemanticClassNames &
  keyof TextAreaSemanticStyles;

export interface TextAreaSemanticClassNames {
  count?: string;
  root?: string;
  textarea?: string;
}

export interface TextAreaSemanticStyles {
  count?: CSSProperties;
  root?: CSSProperties;
  textarea?: CSSProperties;
}

export type TextAreaClassNamesType = SemanticClassNamesType<
  TextAreaProps,
  TextAreaSemanticClassNames
>;

export type TextAreaStylesType = SemanticStylesType<
  TextAreaProps,
  TextAreaSemanticStyles
>;

export interface TextAreaRef extends Pick<
  HeadlessTextAreaRef,
  'blur' | 'focus'
> {
  nativeElement: HeadlessTextAreaRef['nativeElement'] | null;
  resizableTextArea?: HeadlessTextAreaRef['resizableTextArea'];
}

export type InputTextAreaRef = TextAreaRef;

export interface TextAreaProps
  extends
    ComponentBaseProps,
    Omit<
      HeadlessTextAreaProps,
      | 'classNames'
      | 'maxLength'
      | 'minLength'
      | 'onBlur'
      | 'onChange'
      | 'onCompositionEnd'
      | 'onCompositionStart'
      | 'onFocus'
      | 'onKeydown'
      | 'onPressEnter'
      | 'onResize'
      | 'readOnly'
      | 'styles'
    >,
    /* @vue-ignore */
    TextAreaEmitsProps {
  /** @deprecated Use `variant` instead */
  bordered?: boolean;
  classes?: TextAreaClassNamesType;
  maxlength?: number;
  minlength?: number;
  readonly?: boolean;
  rows?: number;
  showCount?: InputProps['showCount'];
  size?: SizeType;
  status?: InputStatus;
  styles?: TextAreaStylesType;
  variant?: Variant;
}

export interface TextAreaEmits {
  blur: (e: FocusEvent) => void;
  change: NonNullable<HeadlessTextAreaProps['onChange']>;
  compositionend: (e: CompositionEvent) => void;
  compositionstart: (e: CompositionEvent) => void;
  focus: (e: FocusEvent) => void;
  keydown: (e: KeyboardEvent) => void;
  mousedown: (e: MouseEvent) => void;
  pressEnter: NonNullable<HeadlessTextAreaProps['onPressEnter']>;
  resize: NonNullable<HeadlessTextAreaProps['onResize']>;
  'update:value': (value?: number | string) => void;
}
export interface TextAreaEmitsProps {
  onBlur?: TextAreaEmits['blur'];
  onChange?: TextAreaEmits['change'];
  onCompositionend?: TextAreaEmits['compositionend'];
  onCompositionstart?: TextAreaEmits['compositionstart'];
  onFocus?: TextAreaEmits['focus'];
  onKeydown?: TextAreaEmits['keydown'];
  onMousedown?: TextAreaEmits['mousedown'];
  onPressEnter?: TextAreaEmits['pressEnter'];
  onResize?: TextAreaEmits['resize'];
  'onUpdate:value'?: TextAreaEmits['update:value'];
}

export interface TextAreaSlots {
  default?: () => any;
}

const omitKeys: string[] = [
  'classes',
  'styles',
  'rootClass',
  'size',
  'status',
  'disabled',
  'bordered',
  'variant',
  'prefixCls',
  'allowClear',
  'onBlur',
  'onChange',
  'onCompositionend',
  'onCompositionstart',
  'onFocus',
  'onKeydown',
  'onMousedown',
  'onPressEnter',
  'onResize',
  'onUpdate:value',
];

const InternalTextArea = defineComponent<
  TextAreaProps,
  TextAreaEmits,
  string,
  SlotsType<TextAreaSlots>
>(
  (props, { attrs, emit, expose }) => {
    const {
      prefixCls,
      direction,
      allowClear: contextAllowClear,
      changeOnComposing: contextChangeOnComposing,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
    } = useComponentBaseConfig(
      'textArea',
      props,
      ['allowClear', 'changeOnComposing'],
      'input',
    );

    const {
      classes,
      styles,
      rootClass,
      size: customizeSize,
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

    const textAreaRef = shallowRef();
    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useSharedStyle(prefixCls, rootClass);
    useStyle(prefixCls, rootCls);

    const { compactSize, compactItemClassnames } = useCompactItemContext(
      prefixCls,
      direction,
    );
    const mergedSize = useSize<SizeType>(
      (ctx) => (customizeSize.value ?? compactSize.value ?? ctx) as SizeType,
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
      } as TextAreaProps;
    });

    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      TextAreaClassNamesType,
      TextAreaStylesType,
      TextAreaProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, contextStyleRoot as any, styles),
      useToProps(mergedProps),
    );

    const formItemInputContext = useFormItemInputContext();
    const mergedStatus = computed(() =>
      getMergedStatus(formItemInputContext.value.status, customStatus.value),
    );
    const hasFeedback = computed(() => formItemInputContext.value.hasFeedback);
    const feedbackIcon = computed(
      () => formItemInputContext.value.feedbackIcon,
    );

    const [mergedVariant, enableVariantCls] = useVariant(
      'textArea',
      customVariant,
      bordered,
    );

    const mergedAllowClear = computed(() =>
      getAllowClear(props.allowClear ?? contextAllowClear.value),
    );
    const mergedChangeOnComposing = computed(
      () => props.changeOnComposing ?? contextChangeOnComposing.value,
    );

    const isMouseDown = shallowRef(false);
    const resizeDirty = shallowRef(false);

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown.value = true;
      emit('mousedown', e);
      const onMouseUp = () => {
        isMouseDown.value = false;
        document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mouseup', onMouseUp);
    };

    onBeforeUnmount(() => {
      isMouseDown.value = false;
    });

    const handleResize: NonNullable<HeadlessTextAreaProps['onResize']> = (
      size,
    ) => {
      emit('resize', size);
      if (isMouseDown.value && typeof getComputedStyle === 'function') {
        const ele = textAreaRef.value?.resizableTextArea?.textArea;
        if (ele && getComputedStyle(ele).resize === 'both') {
          resizeDirty.value = true;
        }
      }
    };

    expose({
      resizableTextArea: computed(() => textAreaRef.value?.resizableTextArea),
      focus: () => textAreaRef.value?.focus?.(),
      blur: () => textAreaRef.value?.blur?.(),
      nativeElement: computed(() => textAreaRef.value?.nativeElement),
    });

    const handlePressEnter: TextAreaEmits['pressEnter'] = (e) => {
      emit('pressEnter', e);
    };

    const handleChange: TextAreaEmits['change'] = (e) => {
      const target = e?.target as HTMLTextAreaElement | undefined;
      emit('update:value', target?.value);
      emit('change', e);
    };

    const handleFocus: TextAreaEmits['focus'] = (e) => emit('focus', e);
    const handleBlur: TextAreaEmits['blur'] = (e) => emit('blur', e);
    const handleKeyDown: TextAreaEmits['keydown'] = (e) => {
      emit('keydown', e);
    };
    const handleCompositionStart: TextAreaEmits['compositionstart'] = (e) =>
      emit('compositionstart', e);
    const handleCompositionEnd: TextAreaEmits['compositionend'] = (e) =>
      emit('compositionend', e);

    return () => {
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const restProps = omit(props, omitKeys);

      const textareaAttrs = {
        ...restAttrs,
        maxLength: props.maxlength,
        minLength: props.minlength,
        readOnly: props.readonly,
      };

      const classesValue = clsx(
        cssVarCls.value,
        rootCls.value,
        className,
        rootClass.value,
        compactItemClassnames.value,
        contextClassName.value,
        mergedClassNames.value.root,
        hashId.value,
        {
          [`${prefixCls.value}-textarea-affix-wrapper-resize-dirty`]:
            resizeDirty.value,
        },
      );

      const mergedStyle: any = {
        ...mergedStyles.value.root,
        ...style,
      };

      const classNames = {
        ...mergedClassNames.value,
        textarea: clsx(
          {
            [`${prefixCls.value}-sm`]: mergedSize.value === 'small',
            [`${prefixCls.value}-lg`]: mergedSize.value === 'large',
          },
          hashId.value,
          mergedClassNames.value.textarea,
          isMouseDown.value && `${prefixCls.value}-mouse-active`,
        ),
        variant: clsx(
          {
            [`${prefixCls.value}-${mergedVariant.value}`]:
              enableVariantCls.value,
          },
          getStatusClassNames(prefixCls.value, mergedStatus.value),
        ),
        affixWrapper: clsx(
          `${prefixCls.value}-textarea-affix-wrapper`,
          {
            [`${prefixCls.value}-affix-wrapper-rtl`]: direction.value === 'rtl',
            [`${prefixCls.value}-affix-wrapper-sm`]:
              mergedSize.value === 'small',
            [`${prefixCls.value}-affix-wrapper-lg`]:
              mergedSize.value === 'large',
            [`${prefixCls.value}-textarea-show-count`]:
              props.showCount || props.count?.show,
          },
          hashId.value,
        ),
      };
      return (
        <HeadlessTextArea
          {...textareaAttrs}
          {...restProps}
          allowClear={mergedAllowClear.value}
          changeOnComposing={mergedChangeOnComposing.value}
          class={classesValue}
          classNames={classNames as any}
          disabled={mergedDisabled.value}
          onPressEnter={handlePressEnter}
          onResize={handleResize}
          prefixCls={prefixCls.value}
          ref={textAreaRef as any}
          style={mergedStyle}
          styles={mergedStyles.value as any}
          {...{
            onMousedown: handleMouseDown,
            onKeydown: handleKeyDown,
            onFocus: handleFocus,
            onBlur: handleBlur,
            onCompositionstart: handleCompositionStart,
            onCompositionend: handleCompositionEnd,
          }}
          onChange={handleChange}
          showCount={props.showCount}
          suffix={
            hasFeedback.value ? (
              <span class={`${prefixCls.value}-textarea-suffix`}>
                {feedbackIcon.value}
              </span>
            ) : undefined
          }
        />
      );
    };
  },
  {
    name: 'AsTextarea',
    inheritAttrs: false,
  },
);

export default InternalTextArea;
