import type { CSSProperties, VNodeChild } from 'vue';

import type { KeyboardEventHandler } from '../util';

import { computed, defineComponent, shallowRef } from 'vue';

import useMergedState from '../util/hooks/useMergedState';
import KeyCode from '../util/KeyCode';

export type SwitchChangeEventHandler = (
  checked: boolean,
  event: KeyboardEvent | MouseEvent,
) => void;
export type SwitchClickEventHandler = SwitchChangeEventHandler;
export interface SwitchProps {
  checked?: boolean;
  checkedChildren?: (() => VNodeChild) | VNodeChild;
  className?: string;
  classNames?: { content?: string };
  defaultChecked?: boolean;
  disabled?: boolean;
  loadingIcon?: (() => VNodeChild) | VNodeChild;
  onChange?: SwitchChangeEventHandler;
  onClick?: SwitchClickEventHandler;
  onKeyDown?: KeyboardEventHandler;
  'onUpdate:checked'?: (value: boolean) => void;
  prefixCls?: string;
  styles?: { content?: CSSProperties };
  tabIndex?: number;
  title?: string;
  unCheckedChildren?: (() => VNodeChild) | VNodeChild;
}

const defaults = {
  prefixCls: 'headless-switch',
  defaultChecked: undefined,
  checked: undefined,
} as SwitchProps;

export const HeadlessSwitch = defineComponent<SwitchProps>(
  (props = defaults, { attrs, expose }) => {
    const btnRef = shallowRef<HTMLButtonElement>();
    const [innerChecked, setInnerChecked] = useMergedState(false, {
      value: computed(() => props.checked),
      defaultValue: props.defaultChecked,
    });

    function triggerChange(
      newChecked: boolean,
      event: KeyboardEvent | MouseEvent,
    ) {
      let mergedChecked = innerChecked.value;

      if (!props.disabled) {
        mergedChecked = newChecked;
        setInnerChecked(mergedChecked);
        props?.onChange?.(mergedChecked, event);
      }
      props?.['onUpdate:checked']?.(mergedChecked!);

      return mergedChecked;
    }

    function onInternalKeyDown(e: KeyboardEvent) {
      // eslint-disable-next-line unicorn/prefer-keyboard-event-key
      if (e.which === KeyCode.LEFT) {
        triggerChange(false, e);
        // eslint-disable-next-line unicorn/prefer-keyboard-event-key
      } else if (e.which === KeyCode.RIGHT) {
        triggerChange(true, e);
      }
      props?.onKeyDown?.(e);
    }

    function onInternalClick(e: MouseEvent) {
      const ret = triggerChange(!innerChecked.value, e);
      // [Legacy] trigger onClick with value
      props?.onClick?.(ret!, e);
    }

    expose({
      btnRef,
    });
    return () => {
      const {
        prefixCls,
        className,
        disabled,
        loadingIcon,
        checkedChildren,
        unCheckedChildren,
        classNames,
        styles,
        onChange: _onChange,
        onClick: _onClick,
        onKeyDown: _onKeyDown,
        'onUpdate:checked': _onUpdateChecked,
        ...restProps
      } = props;
      const switchClassName = [
        prefixCls,
        className,
        {
          [`${prefixCls}-checked`]: innerChecked.value,
          [`${prefixCls}-disabled`]: disabled,
        },
      ];
      return (
        <button
          {...(restProps as any)}
          {...attrs}
          aria-checked={innerChecked.value}
          class={switchClassName}
          disabled={disabled}
          onClick={onInternalClick}
          onKeydown={onInternalKeyDown as any}
          ref={btnRef}
          role="switch"
          type="button"
        >
          {typeof loadingIcon === 'function' ? loadingIcon() : loadingIcon}
          <span class={`${prefixCls}-inner`}>
            <span
              class={[`${prefixCls}-inner-checked`, classNames?.content]}
              style={styles?.content}
            >
              {checkedChildren}
            </span>
            <span
              class={[`${prefixCls}-inner-unchecked`, classNames?.content]}
              style={styles?.content}
            >
              {unCheckedChildren}
            </span>
          </span>
        </button>
      );
    };
  },
  {
    name: 'Switch',
    inheritAttrs: false,
  },
);
