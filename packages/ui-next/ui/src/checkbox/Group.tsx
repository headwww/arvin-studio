import type { CSSProperties, SlotsType } from 'vue';

import type { CheckboxChangeEvent } from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type { ComponentBaseProps } from '../config-provider/context';
import type { CheckboxGroupContext } from './GroupContext.tsx';

import { computed, defineComponent, shallowRef, watch } from 'vue';

import { clsx, omit } from '@arvin-studio/kit';

import { getAttrStyleAndClass } from '../_util/hooks';
import { useBaseConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import Checkbox from './Checkbox';
import { useGroupContextProvider } from './GroupContext';
import useStyle from './style';

export interface CheckboxOptionType {
  class?: string;
  disabled?: boolean;
  id?: string;
  label: VueNode;
  onChange?: (e: CheckboxChangeEvent) => void;
  required?: boolean;
  style?: CSSProperties;
  title?: string;
  value: any;
}

export interface AbstractCheckboxGroupProps extends ComponentBaseProps {
  disabled?: boolean;
  options?: (CheckboxOptionType | number | string)[];
}

export interface CheckboxGroupProps
  extends
    AbstractCheckboxGroupProps,
    /* @vue-ignore */
    CheckboxGroupEmitsProps {
  defaultValue?: any[];
  labelRender?: (params: { index: number; item: CheckboxOptionType }) => any;
  name?: string;
  'onUpdate:value'?: (value: any[]) => void;
  role?: string;
  value?: any[];
}

export interface CheckboxGroupEmits {
  change: (checkedValue: any[]) => void;
}
export interface CheckboxGroupEmitsProps {
  onChange?: CheckboxGroupEmits['change'];
}

export interface CheckboxGroupSlots {
  default: () => any;
  labelRender: (params: { index: number; item: CheckboxOptionType }) => any;
}

// type InternalCheckboxValueType = string | number | boolean
const defaults = {
  options: [],
  role: 'group',
} as any;
const CheckboxGroup = defineComponent<
  CheckboxGroupProps,
  CheckboxGroupEmits,
  string,
  SlotsType<CheckboxGroupSlots>
>(
  (props = defaults, { slots, emit, attrs }) => {
    const { prefixCls, direction } = useBaseConfig('checkbox', props);
    const value = shallowRef(props?.value ?? props?.defaultValue ?? []);
    const registeredValues = shallowRef<any[]>([]);
    watch(
      () => props.value,
      () => {
        value.value = props?.value ?? [];
      },
    );
    const memoizedOptions = computed(() => {
      return (props?.options ?? []).map((option) => {
        if (typeof option === 'string' || typeof option === 'number') {
          return {
            label: option,
            value: option,
          };
        }
        return option;
      });
    });

    const cancelValue = (val: any) => {
      registeredValues.value = registeredValues.value.filter((v) => v !== val);
    };
    const registerValue = (val: any) => {
      registeredValues.value = [...registeredValues.value, val];
    };

    const toggleOption: CheckboxGroupContext['toggleOption'] = (option) => {
      const optionIndex = value.value.indexOf(option.value);
      const newValue = [...value.value];
      if (optionIndex === -1) {
        newValue.push(option.value);
      } else {
        newValue.splice(optionIndex, 1);
      }
      const sortVals = newValue
        .filter((val) => registeredValues.value.includes(val))
        .toSorted((a, b) => {
          const indexA = memoizedOptions.value.findIndex(
            (opt) => opt.value === a,
          );
          const indexB = memoizedOptions.value.findIndex(
            (opt) => opt.value === b,
          );
          return indexA - indexB;
        });
      emit('change', sortVals);
      props?.['onUpdate:value']?.(sortVals);
      if (props.value === undefined) {
        value.value = newValue;
      }
    };
    const groupPrefixCls = computed(() => `${prefixCls.value}-group`);
    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
    const memoizedContext = computed(() => {
      return {
        toggleOption,
        value: value.value,
        disabled: props.disabled,
        name: props.name,
        registerValue,
        cancelValue,
      };
    });

    useGroupContextProvider(memoizedContext);
    return () => {
      const { options = [], rootClass, role } = props;
      const restProps = omit(props, [
        'options',
        'rootClass',
        'defaultValue',
        'prefixCls',
      ]);
      const children = slots?.default?.();
      const { restAttrs, className, style } = getAttrStyleAndClass(attrs);

      const labelRender = slots?.labelRender ?? props?.labelRender;
      const childrenNode =
        options.length > 0
          ? memoizedOptions.value.map((option, index) => {
              const _label = labelRender
                ? labelRender({ item: option, index })
                : option.label;
              return (
                <Checkbox
                  checked={value.value.includes(option.value)}
                  disabled={
                    'disabled' in option ? option.disabled : restProps.disabled
                  }
                  key={option.value.toString()}
                  prefixCls={prefixCls.value}
                  value={option.value as any}
                  {...{
                    onChange: option.onChange,
                  }}
                  class={clsx(`${groupPrefixCls.value}-item`, option.class)}
                  id={option.id}
                  required={option.required}
                  style={option.style}
                  title={option.title}
                >
                  {_label}
                </Checkbox>
              );
            })
          : children;

      const classString = clsx(
        groupPrefixCls.value,
        {
          [`${groupPrefixCls.value}-rtl`]: direction.value === 'rtl',
        },
        className,
        rootClass,
        cssVarCls.value,
        rootCls.value,
        hashId.value,
      );
      return (
        <div class={classString} role={role} style={style} {...restAttrs}>
          {childrenNode}
        </div>
      );
    };
  },
  {
    name: 'AsCheckboxGroup',
    inheritAttrs: false,
  },
);

export default CheckboxGroup;
