import type { SlotsType } from 'vue';

import type { ButtonProps, LegacyButtonType } from '../button';
import type { EmptyEmit } from './types';

import { defineComponent, onBeforeUnmount, onMounted, shallowRef } from 'vue';

import Button from '../button';

function isThenable<T>(value?: PromiseLike<T>): value is PromiseLike<T> {
  return typeof value?.then === 'function';
}

export interface ActionButtonProps {
  actionFn?: (...args: any[]) => any | PromiseLike<any>;
  autoFocus?: boolean;
  buttonProps?: ButtonProps;
  children?: any;
  close?: (...args: any[]) => void;
  emitEvent?: boolean;
  isSilent?: () => boolean;
  prefixCls: string;
  quitOnNullishReturnValue?: boolean;
  type?: LegacyButtonType;
}

export interface ActionButtonSlots {
  default?: () => any;
}

const ActionButton = defineComponent<
  ActionButtonProps,
  EmptyEmit,
  string,
  SlotsType<ActionButtonSlots>
>(
  (props, { slots }) => {
    const clicked = shallowRef(false);
    const loading = shallowRef<ButtonProps['loading']>(false);
    const buttonRef = shallowRef<any>();
    let autoFocusTimeout: null | ReturnType<typeof setTimeout> = null;

    const focusButton = () => {
      const instance = buttonRef.value;
      const element = instance?.$el ?? instance;
      element?.focus?.({ preventScroll: true });
    };

    onMounted(() => {
      if (props.autoFocus) {
        autoFocusTimeout = setTimeout(() => {
          focusButton();
        }, 0);
      }
    });

    onBeforeUnmount(() => {
      if (!autoFocusTimeout) {
        return;
      }

      clearTimeout(autoFocusTimeout);
      autoFocusTimeout = null;
    });

    const onInternalClose = (...args: any[]) => {
      props.close?.(...args);
    };

    const handlePromiseOnOk = (returnValueOfOnOk?: PromiseLike<any>) => {
      if (!isThenable(returnValueOfOnOk)) {
        return;
      }
      loading.value = true;
      // eslint-disable-next-line unicorn/prefer-then-catch
      returnValueOfOnOk.then(
        (...args: any[]) => {
          loading.value = false;
          clicked.value = false;
          onInternalClose(...args);
        },
        (error: Error) => {
          loading.value = false;
          clicked.value = false;
          if (props.isSilent?.()) {
            return;
          }
          throw error;
        },
      );
    };

    const onClick = (e: MouseEvent) => {
      if (clicked.value) {
        return;
      }
      clicked.value = true;

      const { actionFn } = props;
      if (!actionFn) {
        onInternalClose();
        return;
      }

      let returnValueOfOnOk: PromiseLike<any>;
      if (props.emitEvent) {
        returnValueOfOnOk = actionFn(e);
        if (props.quitOnNullishReturnValue && !isThenable(returnValueOfOnOk)) {
          clicked.value = false;
          onInternalClose(e);
          return;
        }
      } else if (actionFn.length > 0) {
        returnValueOfOnOk = actionFn(onInternalClose);
        clicked.value = false;
      } else {
        returnValueOfOnOk = actionFn();
        if (!isThenable(returnValueOfOnOk)) {
          onInternalClose();
          return;
        }
      }

      handlePromiseOnOk(returnValueOfOnOk);
    };

    return () => {
      const buttonAttrs = props.buttonProps ?? {};
      return (
        <Button
          loading={loading.value}
          onClick={onClick}
          prefixCls={props.prefixCls}
          ref={buttonRef}
          type={props.type}
          {...buttonAttrs}
        >
          {slots.default?.()}
        </Button>
      );
    };
  },
  {
    name: 'AsActionButton',
    inheritAttrs: false,
  },
);

export default ActionButton;
