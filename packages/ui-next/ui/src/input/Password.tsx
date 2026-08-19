import type { SlotsType } from 'vue';

import type { VueNode } from '../_util';
import type {
  InputEmits as BaseInputEmits,
  InputProps as BaseInputProps,
  InputRef,
} from './Input';

import { computed, defineComponent, shallowRef, watch } from 'vue';

import { EyeInvisibleOutlined, EyeOutlined } from '@arvin-studio/icons';
import { clsx, omit } from '@arvin-studio/kit';

import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { useComponentBaseConfig } from '../config-provider/context';
import { useDisabledContext } from '../config-provider/disabled-context';
import useRemovePasswordTimeout from './hooks/useRemovePasswordTimeout';
import Input from './Input';

type VisibilityToggle =
  | boolean
  | {
      onVisibleChange?: (visible: boolean) => void;
      tabIndex?: number;
      visible?: boolean;
    };

type PasswordAction = 'click' | 'hover';

export interface PasswordProps
  extends Omit<BaseInputProps, 'type'>, PasswordEmitsProps {
  action?: PasswordAction;
  iconRender?: (params: { visible: boolean }) => any;
  iconVisible?: boolean;
  inputPrefixCls?: string;
  suffix?: VueNode;
  visibilityToggle?: VisibilityToggle;
}

export interface PasswordEmits extends BaseInputEmits {
  'update:iconVisible': (visible: boolean) => void;
}
export interface PasswordEmitsProps {
  'onUpdate:iconVisible'?: PasswordEmits['update:iconVisible'];
}

export interface InputPasswordRef {
  blur: () => void;
  focus: (...args: Parameters<NonNullable<InputRef['focus']>>) => void;
  input: HTMLInputElement | null;
}

export interface PasswordSlots {
  addonAfter?: () => any;
  addonBefore?: () => any;
  clearIcon?: () => any;
  default?: () => any;
  iconRender?: (params: { visible: boolean }) => any;
  prefix?: () => any;
  suffix?: () => any;
}

const defaultIconRender = (visible: boolean) =>
  visible ? <EyeOutlined /> : <EyeInvisibleOutlined />;

const InternalPassword = defineComponent<
  PasswordProps,
  PasswordEmits,
  string,
  SlotsType<PasswordSlots>
>(
  (props, { slots, attrs, emit, expose }) => {
    const {
      disabled: customDisabled,
      inputPrefixCls: customizeInputPrefixCls,
    } = toPropsRefs(props, 'disabled', 'inputPrefixCls');
    const { getPrefixCls } = useComponentBaseConfig('input', props);
    const inputPrefixCls = computed(() =>
      getPrefixCls('input', customizeInputPrefixCls.value),
    );
    const passwordPrefixCls = computed(() =>
      getPrefixCls('input-password', props.prefixCls),
    );

    const disabledContext = useDisabledContext();
    const mergedDisabled = computed(
      () => customDisabled.value ?? disabledContext.value,
    );

    const inputRef = shallowRef<InputRef>();
    const removePasswordTimeout = useRemovePasswordTimeout(inputRef);

    const visibilityToggle = computed<VisibilityToggle>(
      () => props.visibilityToggle ?? true,
    );
    const visibilityControlled = computed(
      () =>
        typeof visibilityToggle.value === 'object' &&
        visibilityToggle.value.visible !== undefined,
    );
    const visible = shallowRef(
      visibilityControlled.value
        ? Boolean((visibilityToggle.value as any).visible)
        : false,
    );

    watch(visibilityToggle, (next) => {
      if (visibilityControlled.value) {
        visible.value = Boolean((next as any).visible);
      }
    });

    const triggerVisibleChange = () => {
      if (mergedDisabled.value || visibilityToggle.value === false) {
        return;
      }
      if (visible.value) {
        removePasswordTimeout();
      }
      const next = !visible.value;
      visible.value = next;
      if (typeof visibilityToggle.value === 'object') {
        visibilityToggle.value.onVisibleChange?.(next);
      }
    };

    const action = computed<PasswordAction>(() => props.action ?? 'click');

    const iconRender = (visible: boolean) => {
      const _iconRender = getSlotPropsFnRun(slots, props, 'iconRender', true, {
        visible,
      });
      if (_iconRender) {
        return _iconRender;
      }
      return defaultIconRender(visible);
    };

    const getIcon = () => {
      if (!visibilityToggle.value) {
        return null;
      }
      const iconNode = iconRender(visible.value);
      const eventName = action.value === 'hover' ? 'onMouseover' : 'onClick';
      const toggle = visibilityToggle.value;
      const iconTabIndex =
        typeof toggle === 'object' ? toggle.tabIndex : undefined;
      const triggerProps = { [eventName]: () => triggerVisibleChange() };
      return (
        <span
          aria-disabled={mergedDisabled.value}
          aria-pressed={visible.value}
          class={`${passwordPrefixCls.value}-icon`}
          key="passwordIcon"
          onKeydown={(e: KeyboardEvent) => {
            if (!(e.key === 'Enter' || e.key === ' ')) {
              return;
            }

            e.preventDefault();
            triggerVisibleChange();
          }}
          onMousedown={(e: MouseEvent) => e.preventDefault()}
          onMouseup={(e: MouseEvent) => e.preventDefault()}
          role="button"
          tabindex={mergedDisabled.value ? -1 : (iconTabIndex ?? 0)}
          {...triggerProps}
        >
          {iconNode}
        </span>
      );
    };

    const handleUpdateValue = (value: any) => {
      emit('update:value', value);
    };

    const handleChange: PasswordEmits['change'] = (e) => {
      emit('change', e);
    };

    const handleFocus: PasswordEmits['focus'] = (e) => emit('focus', e);
    const handleBlur: PasswordEmits['blur'] = (e) => emit('blur', e);

    expose({
      focus: (...args: Parameters<NonNullable<InputRef['focus']>>) =>
        inputRef.value?.focus?.(...args),
      blur: () => inputRef.value?.blur?.(),
      input: computed(() => inputRef.value?.input ?? null),
    });

    return () => {
      const restInputProps = omit(props, [
        'iconRender',
        'visibilityToggle',
        'action',
        'suffix',
        'inputPrefixCls',
        'rootClass',
        'prefixCls',
        // 事件回调由下方内部包装函数显式透传（emit 转发），
        // 若同时出现在 restInputProps 与显式 props 中，
        // 会被 JSX 编译产物的 mergeProps 合并成数组，触发
        // "Invalid prop: type check failed ... Expected Function, got Array" 警告
        'onBlur',
        'onChange',
        'onClear',
        'onFocus',
        'onKeydown',
        'onKeyup',
        'onPressEnter',
        'onCompositionstart',
        'onCompositionend',
        'onUpdate:value',
      ]);

      const suffixSlot = getSlotPropsFnRun(slots, props, 'suffix');
      const visibilityIcon = getIcon();
      const mergedSuffix =
        visibilityToggle.value && visibilityIcon ? (
          <>
            {visibilityIcon}
            {suffixSlot}
          </>
        ) : (
          suffixSlot
        );

      return (
        <Input
          {...attrs}
          {...restInputProps}
          disabled={mergedDisabled.value}
          onBlur={handleBlur}
          onChange={handleChange}
          onClear={() => emit('clear')}
          onCompositionend={(e: any) => emit('compositionend', e)}
          onCompositionstart={(e: any) => emit('compositionstart', e)}
          onFocus={handleFocus}
          onKeydown={(e: any) => emit('keydown', e)}
          onKeyup={(e: any) => emit('keyup', e)}
          onPressEnter={(e: any) => emit('pressEnter', e)}
          prefixCls={inputPrefixCls.value}
          ref={inputRef as any}
          rootClass={clsx(passwordPrefixCls.value, props.rootClass, {
            [`${passwordPrefixCls.value}-${props.size}`]: props.size,
          })}
          suffix={mergedSuffix}
          type={visible.value ? 'text' : 'password'}
          v-slots={{
            ...omit(slots, ['suffix', 'iconRender']),
          }}
          {...{
            'onUpdate:value': handleUpdateValue,
          }}
        />
      );
    };
  },
  {
    name: 'AsInputPassword',
    inheritAttrs: false,
  },
);

export default InternalPassword;
