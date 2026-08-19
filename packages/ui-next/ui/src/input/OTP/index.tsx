import type { CSSProperties, HTMLAttributes, SlotsType } from 'vue';

import type { VueNode } from '../../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../../_util/hooks';
import type { InputStatus } from '../../_util/statusUtils';
import type {
  ComponentBaseProps,
  Variant,
} from '../../config-provider/context';
import type { SizeType } from '../../config-provider/size-context';
import type { InputRef } from '../Input';

import { computed, defineComponent, shallowRef, watch } from 'vue';

import { clsx } from '@arvin-studio/kit';

import {
  getAttrStyleAndClass,
  useMergeSemantic,
  useSemanticRootStyle,
  useToArr,
  useToProps,
} from '../../_util/hooks';
import { getMergedStatus } from '../../_util/statusUtils';
import { toPropsRefs } from '../../_util/tools';
import { useComponentBaseConfig } from '../../config-provider/context';
import { useSize } from '../../config-provider/hooks/useSize';
import {
  useFormItemInputContext,
  useFormItemInputContextProvider,
} from '../../form/context';
import useStyle from '../style/otp';
import OTPInput from './OTPInput';

const strToArr = (str: string) => (str || '').split('');

export interface OTPSemanticClassNames {
  input?: string;
  root?: string;
  separator?: string;
}

export interface OTPSemanticStyles {
  input?: CSSProperties;
  root?: CSSProperties;
  separator?: CSSProperties;
}

export type OTPClassNamesType = SemanticClassNamesType<
  OTPProps,
  OTPSemanticClassNames
>;

export type OTPStylesType = SemanticStylesType<OTPProps, OTPSemanticStyles>;

export interface OTPProps
  extends
    ComponentBaseProps,
    /* @vue-ignore */
    Omit<HTMLAttributes, 'onChange' | 'onInput'>,
    /* @vue-ignore */
    OTPEmitsProps {
  autoFocus?: boolean;
  classes?: OTPClassNamesType;
  defaultValue?: string;
  disabled?: boolean;
  formatter?: (value: string) => string;
  inputMode?: string;
  length?: number;
  mask?: boolean | string;
  separator?: ((index: number) => VueNode) | VueNode;
  size?: SizeType;
  status?: InputStatus;
  styles?: OTPStylesType;
  type?: HTMLInputElement['type'];
  value?: string;
  variant?: Variant;
}

export interface OTPEmits {
  change: (value: string) => void;
  input: (cells: string[]) => void;
  'update:value': (value: string) => void;
}
export interface OTPEmitsProps {
  onChange?: OTPEmits['change'];
  onInput?: OTPEmits['input'];
  'onUpdate:value'?: OTPEmits['update:value'];
}

export interface OTPSlots {
  default: () => any;
  separator: (params: { index: number }) => any;
}

export type OPTSlots = OTPSlots;

const OTP = defineComponent<OTPProps, OTPEmits, string, SlotsType<OTPSlots>>(
  (props, { attrs, emit, slots }) => {
    const {
      prefixCls,
      direction,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
    } = useComponentBaseConfig('otp', props);

    const [hashId, cssVarCls] = useStyle(prefixCls);

    const mergedLength = computed(() => props.length ?? 6);
    const mergedSize = useSize<SizeType>(
      (ctx) => (props.size ?? ctx) as SizeType,
    );

    const formItemInputContext = useFormItemInputContext();
    const mergedStatus = computed(() =>
      getMergedStatus(formItemInputContext.value.status, props.status),
    );
    const proxyFormContext = computed(() => ({
      ...formItemInputContext.value,
      status: mergedStatus.value,
      hasFeedback: false,
      feedbackIcon: null,
    }));
    useFormItemInputContextProvider(proxyFormContext);

    const { classes, styles } = toPropsRefs(props, 'classes', 'styles');

    const mergedProps = computed(() => ({
      ...props,
      length: mergedLength.value,
    }));

    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      OTPClassNamesType,
      OTPStylesType,
      OTPProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, contextStyleRoot as any, styles),
      useToProps(mergedProps),
    );

    const inputRefs = shallowRef<Record<number, InputRef | null>>({});

    const internalFormatter = (txt: string) =>
      props.formatter ? props.formatter(txt) : txt;

    const initialValue = internalFormatter(
      props.value ?? props.defaultValue ?? '',
    );
    const valueCells = shallowRef<string[]>(strToArr(initialValue));
    watch(
      () => props.value,
      (newValue) => {
        valueCells.value = strToArr(internalFormatter(newValue ?? ''));
      },
    );

    const triggerValueCellsChange = (nextValueCells: string[]) => {
      const prevValue = valueCells.value.join('');
      valueCells.value = nextValueCells;
      emit('input', [...nextValueCells]);
      const nextValue = nextValueCells.join('');
      emit('update:value', nextValue);
      if (
        nextValueCells.length === mergedLength.value &&
        nextValueCells.every(Boolean) &&
        nextValue !== prevValue
      ) {
        emit('change', nextValue);
      }
    };

    const patchValue = (index: number, txt: string) => {
      let nextCells = [...valueCells.value];
      for (let i = 0; i < index; i += 1) {
        if (!nextCells[i]) {
          nextCells[i] = '';
        }
      }
      if (txt.length <= 1) {
        nextCells[index] = txt;
      } else {
        nextCells = nextCells.slice(0, index).concat(strToArr(txt));
      }
      nextCells = nextCells.slice(0, mergedLength.value);
      for (let i = nextCells.length - 1; i >= 0; i -= 1) {
        if (nextCells[i]) break;
        nextCells.pop();
      }
      const formattedValue = internalFormatter(
        nextCells.map((cell) => cell || ' ').join(''),
      );
      return strToArr(formattedValue).map((cell, i) => {
        if (cell === ' ' && !nextCells[i]) {
          return nextCells[i];
        }
        return cell;
      });
    };

    const handleInputChange = (index: number, txt: string) => {
      const nextCells = patchValue(index, txt);
      const nextIndex = Math.min(index + txt.length, mergedLength.value - 1);
      if (nextIndex !== index && nextCells[index] !== undefined) {
        inputRefs.value[nextIndex]?.focus?.();
      }
      triggerValueCellsChange(nextCells as any);
    };

    const handleActiveChange = (nextIndex: number) => {
      inputRefs.value[nextIndex]?.focus?.();
    };

    const renderSeparator = (index: number) => {
      const separator = slots.separator || props.separator;
      const separatorNode =
        typeof separator === 'function' ? separator({ index }) : separator;
      if (!separatorNode) {
        return null;
      }
      return (
        <span
          class={clsx(
            `${prefixCls.value}-separator`,
            mergedClassNames.value.separator,
          )}
          key={`otp-sep-${index}`}
          style={mergedStyles.value.separator}
        >
          {separatorNode}
        </span>
      );
    };

    return () => {
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);

      return (
        <div
          {...restAttrs}
          class={clsx(
            className,
            prefixCls.value,
            cssVarCls.value,
            props.rootClass,
            contextClassName.value,
            hashId.value,
            {
              [`${prefixCls.value}-sm`]: mergedSize.value === 'small',
              [`${prefixCls.value}-lg`]: mergedSize.value === 'large',
              [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
            },
            mergedClassNames.value.root,
          )}
          role="group"
          style={{ ...mergedStyles.value.root, ...style }}
        >
          {Array.from({ length: mergedLength.value }).map((_, index) => (
            <>
              <OTPInput
                autoFocus={index === 0 ? props.autoFocus : undefined}
                class={clsx(
                  `${prefixCls.value}-input`,
                  mergedClassNames.value.input,
                )}
                disabled={props.disabled}
                index={index}
                inputMode={props.inputMode}
                key={`otp-${index}`}
                mask={props.mask}
                onActiveChange={handleActiveChange}
                onChange={handleInputChange}
                prefixCls={prefixCls.value}
                ref={(instance: any) => {
                  inputRefs.value[index] = instance;
                }}
                size={mergedSize.value}
                status={mergedStatus.value}
                style={mergedStyles.value.input}
                type={props.type}
                value={valueCells.value[index] || ''}
                variant={props.variant}
              />
              {index < mergedLength.value - 1 ? renderSeparator(index) : null}
            </>
          ))}
        </div>
      );
    };
  },
  {
    name: 'AsInputOtp',
    inheritAttrs: false,
  },
);

export default OTP;
