import type { App, CSSProperties, SlotsType } from 'vue';

import type {
  InputNumberProps as HeadlessInputNumberProps,
  InputNumberRef as HeadlessInputNumberRef,
  ValueType,
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

import { HeadlessInputNumber } from '@arvin-studio/headless';
import {
  DownOutlined,
  MinusOutlined,
  PlusOutlined,
  UpOutlined,
} from '@arvin-studio/icons';
import { clsx, omit } from '@arvin-studio/kit';

import { ContextIsolator } from '../_util/ContextIsolator';
import {
  getAttrStyleAndClass,
  useMergeSemantic,
  useSemanticRootStyle,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { getMergedStatus, getStatusClassNames } from '../_util/statusUtils';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { useComponentBaseConfig } from '../config-provider/context';
import { useDisabledContext } from '../config-provider/disabled-context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useSize } from '../config-provider/hooks/useSize';
import { useFormItemInputContext } from '../form/context';
import useVariant from '../form/hooks/useVariant';
import { SpaceAddon, SpaceCompact } from '../space';
import { useCompactItemContext } from '../space/Compact';
import useStyle from './style';

export type InputNumberSemanticName = keyof InputNumberSemanticClassNames &
  keyof InputNumberSemanticStyles;

export interface InputNumberSemanticClassNames {
  action?: string;
  actions?: string;
  input?: string;
  prefix?: string;
  root?: string;
  suffix?: string;
}

export interface InputNumberSemanticStyles {
  action?: CSSProperties;
  actions?: CSSProperties;
  input?: CSSProperties;
  prefix?: CSSProperties;
  root?: CSSProperties;
  suffix?: CSSProperties;
}

export type InputNumberClassNamesType = SemanticClassNamesType<
  InputNumberProps,
  InputNumberSemanticClassNames
>;

export type InputNumberStylesType = SemanticStylesType<
  InputNumberProps,
  InputNumberSemanticStyles
>;

export interface InputNumberStepContext {
  emitter: 'handler' | 'keyboard' | 'wheel';
  offset: ValueType;
  type: 'down' | 'up';
}

export interface InputNumberProps
  extends
    ComponentBaseProps,
    /* @vue-ignore */
    InputNumberEmitsProps,
    Omit<
      HeadlessInputNumberProps,
      | 'class'
      | 'className'
      | 'classNames'
      | 'controls'
      | 'onBeforeInput'
      | 'onBlur'
      | 'onChange'
      | 'onClick'
      | 'onCompositionEnd'
      | 'onCompositionStart'
      | 'onFocus'
      | 'onInput'
      | 'onKeyDown'
      | 'onKeyUp'
      | 'onMouseDown'
      | 'onMouseEnter'
      | 'onMouseMove'
      | 'onMouseUp'
      | 'onPressEnter'
      | 'onStep'
      | 'prefix'
      | 'prefixCls'
      | 'style'
      | 'styles'
      | 'suffix'
    > {
  addonAfter?: VueNode;
  addonBefore?: VueNode;
  /** @deprecated Use `variant="borderless"` instead. */
  bordered?: boolean;
  classes?: InputNumberClassNamesType;
  controls?: boolean | { downIcon?: VueNode; upIcon?: VueNode };
  disabled?: boolean;
  prefix?: VueNode;
  size?: SizeType;
  status?: InputStatus;
  styles?: InputNumberStylesType;
  suffix?: VueNode;
  type?: 'number' | 'text';
  /**
   * @default "outlined"
   */
  variant?: Variant;
}

export interface InputNumberEmits {
  beforeinput: (e: InputEvent) => void;
  blur: (e: FocusEvent) => void;
  change: (value: any) => void;
  click: (e: MouseEvent) => void;
  compositionend: (e: CompositionEvent) => void;
  compositionstart: (e: CompositionEvent) => void;
  focus: (e: FocusEvent) => void;
  input: (text: string) => void;
  keydown: (e: KeyboardEvent) => void;
  keyup: (e: KeyboardEvent) => void;
  mousedown: (e: MouseEvent) => void;
  mouseenter: (e: MouseEvent) => void;
  mouseleave: (e: MouseEvent) => void;
  mousemove: (e: MouseEvent) => void;
  mouseout: (e: MouseEvent) => void;
  mouseup: (e: MouseEvent) => void;
  pressEnter: (e: KeyboardEvent) => void;
  step: (value: any, info: InputNumberStepContext) => void;
  'update:value': (value: any) => void;
}
export interface InputNumberEmitsProps {
  onBeforeinput?: InputNumberEmits['beforeinput'];
  onBlur?: InputNumberEmits['blur'];
  onChange?: InputNumberEmits['change'];
  onClick?: InputNumberEmits['click'];
  onCompositionend?: InputNumberEmits['compositionend'];
  onCompositionstart?: InputNumberEmits['compositionstart'];
  onFocus?: InputNumberEmits['focus'];
  onInput?: InputNumberEmits['input'];
  onKeydown?: InputNumberEmits['keydown'];
  onKeyup?: InputNumberEmits['keyup'];
  onMousedown?: InputNumberEmits['mousedown'];
  onMouseenter?: InputNumberEmits['mouseenter'];
  onMouseleave?: InputNumberEmits['mouseleave'];
  onMousemove?: InputNumberEmits['mousemove'];
  onMouseout?: InputNumberEmits['mouseout'];
  onMouseup?: InputNumberEmits['mouseup'];
  onPressEnter?: InputNumberEmits['pressEnter'];
  onStep?: InputNumberEmits['step'];
  'onUpdate:value'?: InputNumberEmits['update:value'];
}

export interface InputNumberSlots {
  addonAfter?: () => any;
  addonBefore?: () => any;
  default?: () => any;
  prefix?: () => any;
  suffix?: () => any;
}

const omitKeys: (keyof InputNumberProps)[] = [
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
  'prefix',
  'suffix',
  'controls',
  'onInput',
  'onPressEnter',
  'onStep',
  'onBeforeinput',
  'keyboard',
  'onClick',
  'onFocus',
  'onMousedown',
  'onMouseup',
  'onMouseleave',
  'onMousemove',
  'onMouseenter',
  'onMouseout',
  'value',
  'defaultValue',
  'onChange',
];

const InputNumber = defineComponent<
  InputNumberProps,
  InputNumberEmits,
  string,
  SlotsType<InputNumberSlots>
>(
  (props, { slots, attrs, emit, expose }) => {
    const {
      prefixCls,
      direction,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
    } = useComponentBaseConfig('inputNumber', props, [], 'input-number');

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

    const inputNumberRef = shallowRef<HeadlessInputNumberRef>();
    expose({
      focus: (
        ...args: Parameters<NonNullable<HeadlessInputNumberRef['focus']>>
      ) => inputNumberRef.value?.focus?.(...args),
      blur: () => inputNumberRef.value?.blur?.(),
      input: computed(() => inputNumberRef.value?.input ?? null),
      nativeElement: computed(
        () => inputNumberRef.value?.nativeElement ?? null,
      ),
    });

    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

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

    const mergedControls = computed(() => {
      const raw = props.controls ?? true;
      if (!raw || mergedDisabled.value || props.readOnly) {
        return false;
      }
      return raw;
    });
    const controlsProp = computed(() =>
      typeof mergedControls.value === 'boolean'
        ? mergedControls.value
        : undefined,
    );

    const formItemInputContext = useFormItemInputContext();
    const mergedStatus = computed(() => {
      return getMergedStatus(
        formItemInputContext.value.status,
        customStatus.value,
      );
    });
    const hasFeedback = computed(() => formItemInputContext.value.hasFeedback);
    const feedbackIcon = computed(
      () => formItemInputContext.value.feedbackIcon,
    );

    const [mergedVariant, enableVariantCls] = useVariant(
      'inputNumber',
      customVariant,
      bordered,
    );

    const mergedProps = computed(() => {
      return {
        ...props,
        size: mergedSize.value,
        disabled: mergedDisabled.value,
        controls: mergedControls.value,
      } as InputNumberProps;
    });

    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      InputNumberClassNamesType,
      InputNumberStylesType,
      InputNumberProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, contextStyleRoot as any, styles),
      useToProps(mergedProps),
    );

    const hasLegacyAddon = computed(
      () => !!(props.addonBefore || props.addonAfter),
    );
    const upIcon = computed(() => {
      let icon: VueNode =
        props.mode === 'spinner' ? <PlusOutlined /> : <UpOutlined />;
      if (
        typeof mergedControls.value === 'object' &&
        mergedControls.value?.upIcon
      ) {
        icon = mergedControls.value.upIcon;
      }
      return icon;
    });
    const downIcon = computed(() => {
      let icon: VueNode =
        props.mode === 'spinner' ? <MinusOutlined /> : <DownOutlined />;
      if (
        typeof mergedControls.value === 'object' &&
        mergedControls.value?.downIcon
      ) {
        icon = mergedControls.value.downIcon;
      }
      return icon;
    });

    const appliedRootClass = computed(() =>
      hasLegacyAddon.value ? undefined : rootClass.value,
    );

    const classesValue = computed(() => {
      const { className } = getAttrStyleAndClass(attrs);
      return clsx(
        contextClassName.value,
        className,
        appliedRootClass.value,
        cssVarCls.value,
        rootCls.value,
        hashId.value,
        compactItemClassnames.value,
        mergedClassNames.value.root,
        getStatusClassNames(
          prefixCls.value,
          mergedStatus.value,
          hasFeedback.value,
        ),
        {
          [`${prefixCls.value}-${mergedVariant.value}`]: enableVariantCls.value,
          [`${prefixCls.value}-lg`]: mergedSize.value === 'large',
          [`${prefixCls.value}-sm`]: mergedSize.value === 'small',
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
          [`${prefixCls.value}-without-controls`]: !mergedControls.value,
          [`${prefixCls.value}-in-form-item`]:
            formItemInputContext.value.isFormItemInput,
        },
      );
    });

    const mergedStyle = computed(() => {
      const { style } = getAttrStyleAndClass(attrs);
      return {
        ...mergedStyles.value.root,
        ...style,
      };
    });

    const renderAddon = (node?: VueNode) => {
      if (!node) {
        return null;
      }
      return (
        <SpaceAddon
          class={clsx(
            `${prefixCls.value}-addon`,
            cssVarCls.value,
            hashId.value,
          )}
          disabled={mergedDisabled.value}
          status={mergedStatus.value}
          variant={mergedVariant.value}
        >
          <ContextIsolator form space>
            {node}
          </ContextIsolator>
        </SpaceAddon>
      );
    };

    const handleChange: InputNumberEmits['change'] = (value) => {
      emit('change', value as any);
    };
    const handleUpdateValue: InputNumberEmits['update:value'] = (value) => {
      emit('update:value', value as any);
    };
    const handleInput: InputNumberEmits['input'] = (text) => {
      emit('input', text);
    };
    const handlePressEnter: InputNumberEmits['pressEnter'] = (e) =>
      emit('pressEnter', e);
    const handleStep: InputNumberEmits['step'] = (value, info) =>
      emit('step', value as any, info as InputNumberStepContext);
    const handleMouseEvent =
      (eventName: keyof InputNumberEmits) => (e: MouseEvent) =>
        emit(eventName as any, e);
    const handleKeyboardEvent =
      (eventName: keyof InputNumberEmits) => (e: KeyboardEvent) =>
        emit(eventName as any, e);
    const handleFocusEvent =
      (eventName: keyof InputNumberEmits) => (e: FocusEvent) =>
        emit(eventName as any, e);
    const handleCompositionEvent =
      (eventName: keyof InputNumberEmits) => (e: CompositionEvent) =>
        emit(eventName as any, e);
    const handleBeforeInput: InputNumberEmits['beforeinput'] = (e) =>
      emit('beforeinput', e);

    return () => {
      const { restAttrs } = getAttrStyleAndClass(attrs);
      const restProps = omit(props, omitKeys);
      const { min, max, step } = props;
      const prefixNode = getSlotPropsFnRun(slots, props, 'prefix');
      const suffixSlot = getSlotPropsFnRun(slots, props, 'suffix');
      const mergedSuffixFn = () => {
        if (hasFeedback.value) {
          return (
            <>
              {suffixSlot}
              {feedbackIcon.value}
            </>
          );
        }
        return suffixSlot;
      };
      const mergedSuffix = mergedSuffixFn();
      const renderInputNode = () => (
        <HeadlessInputNumber
          {...restAttrs}
          {...restProps}
          className={classesValue.value}
          classNames={mergedClassNames.value as any}
          controls={controlsProp.value}
          disabled={mergedDisabled.value}
          downHandler={downIcon.value}
          keyboard={props.keyboard}
          max={max}
          min={min}
          onChange={handleChange}
          prefix={prefixNode}
          prefixCls={prefixCls.value}
          ref={inputNumberRef as any}
          step={step}
          style={mergedStyle.value}
          styles={mergedStyles.value as any}
          suffix={mergedSuffix}
          upHandler={upIcon.value}
          value={props.value}
          {...{
            'onUpdate:value': handleUpdateValue,
          }}
          onBeforeInput={handleBeforeInput}
          onBlur={handleFocusEvent('blur')}
          onClick={handleMouseEvent('click')}
          onCompositionEnd={handleCompositionEvent('compositionend')}
          onCompositionStart={handleCompositionEvent('compositionstart')}
          onFocus={handleFocusEvent('focus')}
          onInput={handleInput}
          onKeyDown={handleKeyboardEvent('keydown')}
          onKeyUp={handleKeyboardEvent('keyup')}
          onMouseDown={handleMouseEvent('mousedown')}
          onMouseEnter={handleMouseEvent('mouseenter')}
          onMouseLeave={handleMouseEvent('mouseleave')}
          onMouseMove={handleMouseEvent('mousemove')}
          onMouseOut={handleMouseEvent('mouseout')}
          onMouseUp={handleMouseEvent('mouseup')}
          onPressEnter={handlePressEnter}
          onStep={handleStep as any}
        />
      );

      const inputNode = renderInputNode();

      if (hasLegacyAddon.value) {
        return (
          <SpaceCompact rootClass={rootClass.value}>
            {renderAddon(getSlotPropsFnRun(slots, props, 'addonBefore'))}
            {inputNode}
            {renderAddon(getSlotPropsFnRun(slots, props, 'addonAfter'))}
          </SpaceCompact>
        ) as any;
      }

      return inputNode as any;
    };
  },
  {
    name: 'AsInputNumber',
    inheritAttrs: false,
  },
);

(InputNumber as any).install = (app: App) => {
  app.component(InputNumber.name, InputNumber);
  return app;
};

export type { HeadlessInputNumberRef as InputNumberRef, ValueType };
export default InputNumber;
