import type { SlotsType } from 'vue';

import type { EmptyEmit } from '../../_util';
import type { InputEmits, InputProps, InputRef } from '../Input';

import { defineComponent, shallowRef } from 'vue';

import { raf } from '@arvin-studio/headless';
import { clsx, omit } from '@arvin-studio/kit';

import { getAttrStyleAndClass } from '../../_util/hooks';
import Input from '../Input';

export interface OTPInputProps extends Omit<InputProps, 'onChange'> {
  index: number;
  mask?: boolean | string;
  onActiveChange: (nextIndex: number) => void;
  onChange: (index: number, value: string) => void;
  prefixCls: string;
  value?: string;
}

const OTPInput = defineComponent<
  OTPInputProps,
  EmptyEmit,
  string,
  SlotsType<{ default?: () => any }>
>(
  (props, { attrs, expose, slots }) => {
    const inputRef = shallowRef<InputRef>();
    expose({
      focus: (...args: Parameters<NonNullable<InputRef['focus']>>) =>
        inputRef.value?.focus?.(...args),
      blur: () => inputRef.value?.blur?.(),
      input: inputRef,
    });

    const syncSelection = () => {
      raf(() => {
        const inputEle = inputRef.value?.input;
        if (document.activeElement === inputEle && inputEle) {
          inputEle.select();
        }
      });
    };

    const handleChange: InputEmits['change'] = (e) => {
      props.onChange(props.index, (e?.target as HTMLInputElement)?.value ?? '');
    };

    const handleKeyDown: InputEmits['keydown'] = (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey } = event;
      if (key === 'ArrowLeft') {
        props.onActiveChange(props.index - 1);
      } else if (key === 'ArrowRight') {
        props.onActiveChange(props.index + 1);
      } else if (key === 'z' && (ctrlKey || metaKey)) {
        event.preventDefault();
      } else if (key === 'Backspace' && !props.value) {
        props.onActiveChange(props.index - 1);
      }
      syncSelection();
    };

    const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
    const restInputProps = omit(props, [
      'prefixCls',
      'index',
      'onChange',
      'onActiveChange',
      'mask',
      // 这两个回调在下方显式透传，若不排除会被 mergeProps 合并为数组
      'onFocus',
      'onKeydown',
    ]);
    const maskValue = typeof props.mask === 'string' ? props.mask : props.value;

    return () => (
      <span class={`${props.prefixCls}-input-wrapper`} role="presentation">
        {props.mask && props.value !== '' && props.value !== undefined && (
          <span aria-hidden="true" class={`${props.prefixCls}-mask-icon`}>
            {maskValue}
          </span>
        )}
        <Input
          {...restAttrs}
          {...restInputProps}
          aria-label={`OTP Input ${props.index + 1}`}
          class={clsx(className, {
            [`${props.prefixCls}-mask-input`]: props.mask,
          })}
          htmlSize={1}
          onChange={handleChange}
          onFocus={() => syncSelection()}
          onKeydown={handleKeyDown}
          onMousedown={() => syncSelection()}
          onMouseup={() => syncSelection()}
          ref={inputRef as any}
          style={style}
          type={props.mask === true ? 'password' : (props.type ?? 'text')}
          v-slots={slots}
          value={props.value}
        />
      </span>
    );
  },
  {
    name: 'AsInputOTPInput',
    inheritAttrs: false,
  },
);

export default OTPInput;
