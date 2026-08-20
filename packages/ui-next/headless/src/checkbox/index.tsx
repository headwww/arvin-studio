import { computed, defineComponent, shallowRef } from 'vue';

import { clsx } from '@arvin-studio/kit';

import useMergedState from '../util/hooks/useMergedState';

export interface InputHTMLAttributesType {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (e: Event) => void;
  title?: string;
  type?: string;
  value?: any;
}

export interface CheckboxChangeEvent {
  nativeEvent: any;
  preventDefault: () => void;
  stopPropagation: () => void;
  target: CheckboxChangeEventTarget;
}

export interface CheckboxChangeEventTarget extends CheckboxProps {
  checked: boolean;
}

export interface CheckBoxInstance {
  blur: () => void;
  focus: () => void;
  input: HTMLInputElement | null;
  nativeElement: HTMLDivElement | null;
}

export interface CheckboxProps extends Omit<
  InputHTMLAttributesType,
  'onChange'
> {
  onChange?: (e: CheckboxChangeEvent) => void;
  'onUpdate:checked'?: (value: boolean) => void;
  prefixCls?: string;
}

export const HeadlessCheckbox = defineComponent<CheckboxProps>(
  (props, { expose, attrs }) => {
    const inputRef = shallowRef<HTMLInputElement>();
    const holderRef = shallowRef<HTMLInputElement>();
    const [rawValue, setRawValue] = useMergedState(props.defaultChecked, {
      value: computed(() => props.checked),
    });

    expose({
      focus: () => {
        inputRef.value?.focus();
      },
      blur: () => {
        inputRef.value?.blur();
      },
      input: inputRef,
      nativeElement: holderRef,
    });

    const handleChange = (e: any) => {
      if (props.disabled) return;

      if (props.checked === undefined) setRawValue(e.target?.checked);

      props?.['onUpdate:checked']?.(e.target.checked);
      props?.onChange?.({
        target: {
          ...attrs,
          ...props,
          checked: e.target.checked,
        },
        stopPropagation() {
          e.stopPropagation();
        },
        preventDefault() {
          e.preventDefault();
        },
        nativeEvent: e,
      });
    };

    return () => {
      const {
        prefixCls = 'headless-checkbox',
        disabled,
        type = 'checkbox',
        title,
      } = props;
      const classString = clsx(prefixCls, attrs.class as any, {
        [`${prefixCls}-checked`]: rawValue.value,
        [`${prefixCls}-disabled`]: disabled,
      });
      return (
        <span
          class={classString}
          ref={holderRef}
          style={[(attrs as any).style]}
          title={title}
        >
          <input
            checked={!!rawValue.value}
            class={`${prefixCls}-input`}
            disabled={disabled}
            onChange={(e) => handleChange(e)}
            ref={inputRef}
            type={type}
          />
        </span>
      );
    };
  },
);
