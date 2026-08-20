import type { SlotsType } from 'vue';

import type {
  RadioChangeEvent,
  RadioGroupEmits,
  RadioGroupProps,
  RadioGroupSlots,
} from './interface';

import { computed, defineComponent, ref, useId, watch } from 'vue';

import { filterEmpty, pickAttrs } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import { toPropsRefs } from '../_util';
import { getAttrStyleAndClass, useOrientation } from '../_util/hooks';
import { checkRenderNode } from '../_util/vueNode';
import { useComponentBaseConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useSize } from '../config-provider/hooks/useSize';
import { useFormItemContext, useFormItemInputContext } from '../form/context';
import { useRadioGroupContextProvider } from './context';
import Radio from './radio';
import useStyle from './style';

const defaults = {
  buttonStyle: 'outline',
  block: false,
} as any;

export interface InternalRadioGroupProps /* @vue-ignore */
  extends RadioGroupEmitsProps, RadioGroupProps {}

export interface RadioGroupEmitsProps {
  onBlur?: RadioGroupEmits['blur'];
  onChange?: RadioGroupEmits['change'];
  onFocus?: RadioGroupEmits['focus'];
  onMouseenter?: RadioGroupEmits['mouseenter'];
  onMouseleave?: RadioGroupEmits['mouseleave'];
}

const RadioGroup = defineComponent<
  InternalRadioGroupProps,
  RadioGroupEmits,
  string,
  SlotsType<RadioGroupSlots>
>(
  (props = defaults, { slots, attrs, emit }) => {
    const { prefixCls, direction } = useComponentBaseConfig('radio', props);
    const formItemInputContext = useFormItemInputContext();
    const defaultName = computed(
      () => toNamePathStr(formItemInputContext.value?.name ?? '') || useId(),
    );
    const name = computed(() => props?.name ?? defaultName.value);
    const {
      size: customizeSize,
      orientation,
      vertical,
    } = toPropsRefs(props, 'size', 'orientation', 'vertical');
    const formItemContext = useFormItemContext(true);

    const value = ref(props?.value ?? props?.defaultValue);

    const onRadioChange = (e: RadioChangeEvent) => {
      const lastValue = value.value;
      const val = e.target.value;
      props?.['onUpdate:value']?.(val);
      if (val !== lastValue) {
        emit('change', e);
      }
      if (props.value === undefined) {
        value.value = val;
      }
    };

    watch(
      () => props.value,
      () => {
        value.value = props.value;
      },
    );
    const groupPrefixCls = computed(() => `${prefixCls.value}-group`);

    // Style
    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
    const mergedSize = useSize(customizeSize);
    const [, mergedVertical] = useOrientation(orientation, vertical);

    const memoizedValue = computed(() => {
      return {
        onChange: onRadioChange,
        value: value.value,
        disabled: props?.disabled,
        name: name.value,
        optionType: props?.optionType,
        block: props?.block,
      };
    });
    useRadioGroupContextProvider(memoizedValue);

    return () => {
      const { buttonStyle, block, rootClass, id, options, disabled } = props;
      const children = checkRenderNode(filterEmpty(slots?.default?.() ?? []));
      const { className, restAttrs, style } = getAttrStyleAndClass(attrs);

      const classString = clsx(
        groupPrefixCls.value,
        `${groupPrefixCls.value}-${buttonStyle}`,
        {
          [`${groupPrefixCls.value}-large`]: mergedSize.value === 'large',
          [`${groupPrefixCls.value}-small`]: mergedSize.value === 'small',
          [`${groupPrefixCls.value}-rtl`]: direction.value === 'rtl',
          [`${groupPrefixCls.value}-block`]: block,
        },
        className,
        rootClass,
        hashId.value,
        cssVarCls.value,
        rootCls.value,
      );
      let childrenToRender: any = children;

      const labelRender = slots?.labelRender ?? props?.labelRender;
      // If exists options, render options
      if (options && options.length > 0) {
        childrenToRender = options.map((option, index) => {
          if (typeof option === 'string' || typeof option === 'number') {
            const _label = labelRender
              ? labelRender({ item: { label: option, value: option }, index })
              : option;
            return (
              <Radio
                checked={value.value === option}
                disabled={disabled}
                key={option.toString()}
                prefixCls={prefixCls.value}
                value={option}
              >
                {_label}
              </Radio>
            );
          }
          const _label = labelRender
            ? labelRender({ item: option, index })
            : option.label;

          return (
            <Radio
              checked={value.value === option.value}
              class={option.class}
              disabled={option.disabled || disabled}
              id={option.id}
              key={`radio-group-value-options-${option.value}`}
              prefixCls={prefixCls.value}
              required={option.required}
              style={option.style}
              title={option.title}
              value={option.value}
            >
              {_label}
            </Radio>
          );
        });
      }
      return (
        <div
          {...pickAttrs(restAttrs, { aria: true, data: true })}
          class={clsx(classString, {
            [`${prefixCls.value}-group-vertical`]: mergedVertical.value,
          })}
          id={id}
          onBlur={(e) => {
            emit('blur', e);
            formItemContext?.triggerBlur?.();
          }}
          onFocus={(e) => {
            emit('focus', e);
          }}
          onMouseenter={(e) => {
            emit('mouseenter', e);
          }}
          onMouseleave={(e) => {
            emit('mouseleave', e);
          }}
          style={style}
        >
          {childrenToRender}
        </div>
      );
    };
  },
  {
    name: 'AsRadioGroup',
    inheritAttrs: false,
  },
);

export default RadioGroup;
