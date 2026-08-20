import type { CSSProperties, SlotsType } from 'vue';

import type { CheckboxChangeEvent } from '@arvin-studio/headless';

import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { ComponentBaseProps } from '../config-provider/context';

import { computed, defineComponent, nextTick, shallowRef, watch } from 'vue';

import { filterEmpty, HeadlessCheckbox } from '@arvin-studio/headless';
import { clsx, omit } from '@arvin-studio/kit';

import { isValueEqual, toPropsRefs } from '../_util';
import {
  getAttrStyleAndClass,
  useMergeSemantic,
  useSemanticRootStyle,
  useToArr,
  useToProps,
} from '../_util/hooks';
import isNonNullable from '../_util/isNonNullable';
import { checkRenderNode } from '../_util/vueNode';
import Wave from '../_util/wave';
import { TARGET_CLS } from '../_util/wave/interface';
import { useComponentBaseConfig } from '../config-provider/context';
import { useDisabledContext } from '../config-provider/disabled-context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useFormItemContext, useFormItemInputContext } from '../form/context';
import { useGroupContext } from './GroupContext';
import useStyle from './style';
import useBubbleLock from './useBubbleLock';

export type CheckedValueType = boolean | number | object | string;

export interface AbstractCheckboxProps extends ComponentBaseProps {
  autoFocus?: boolean;
  checked?: CheckedValueType;
  /**
   * 选中时的值
   */
  checkedValue?: CheckedValueType;
  defaultChecked?: CheckedValueType;
  disabled?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  skipGroup?: boolean;
  tabIndex?: number;
  title?: string;
  type?: string;
  /**
   * 非选中时的值
   */
  unCheckedValue?: CheckedValueType;
  value?: any;
}

export interface CheckboxEmits {
  blur: (event: FocusEvent) => void;
  change: (checked: CheckboxChangeEvent) => void;
  click: (event: MouseEvent) => void;
  focus: (event: FocusEvent) => void;
  keydown: (event: KeyboardEvent) => void;
  keypress: (event: KeyboardEvent) => void;
  mouseenter: (event: MouseEvent) => void;
  mouseleave: (event: MouseEvent) => void;
  'update:checked': (checked: any) => void;
  'update:value': (value: any) => void;
}

export interface CheckboxEmitsProps {
  onBlur?: CheckboxEmits['blur'];
  onChange?: CheckboxEmits['change'];
  onClick?: CheckboxEmits['click'];
  onFocus?: CheckboxEmits['focus'];
  onKeydown?: CheckboxEmits['keydown'];
  onKeypress?: CheckboxEmits['keypress'];
  onMouseenter?: CheckboxEmits['mouseenter'];
  onMouseleave?: CheckboxEmits['mouseleave'];
  'onUpdate:checked'?: CheckboxEmits['update:checked'];
  'onUpdate:value'?: CheckboxEmits['update:value'];
}

export interface CheckboxSlots {
  default?: () => any;
}

export type CheckboxSemanticName = keyof CheckboxSemanticClassNames &
  keyof CheckboxSemanticStyles;

export interface CheckboxSemanticClassNames {
  icon?: string;
  label?: string;
  root?: string;
}

export interface CheckboxSemanticStyles {
  icon?: CSSProperties;
  label?: CSSProperties;
  root?: CSSProperties;
}

export type CheckboxClassNamesType = SemanticClassNamesType<
  CheckboxProps,
  CheckboxSemanticClassNames
>;

export type CheckboxStylesType = SemanticStylesType<
  CheckboxProps,
  CheckboxSemanticStyles
>;

export interface CheckboxProps
  extends AbstractCheckboxProps, CheckboxEmitsProps {
  classes?: CheckboxClassNamesType;
  indeterminate?: boolean;
  styles?: CheckboxStylesType;
}

const defaults = {
  indeterminate: false,
  skipGroup: false,
};

const InternalCheckbox = defineComponent<
  CheckboxProps,
  CheckboxEmits,
  string,
  SlotsType<CheckboxSlots>
>(
  (props = defaults, { emit, expose, slots, attrs }) => {
    const {
      direction,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
      prefixCls,
    } = useComponentBaseConfig('checkbox', props);
    const { classes, styles } = toPropsRefs(props, 'classes', 'styles');
    const checkboxGroup = useGroupContext();
    const formItemInputContext = useFormItemInputContext();
    const formItemContext = useFormItemContext();
    const contextDisabled = useDisabledContext();
    const mergedDisabled = computed(
      () =>
        (checkboxGroup?.value?.disabled || props?.disabled) ??
        contextDisabled.value,
    );

    // 获取选中和非选中的值，默认为 true/false
    const mergedCheckedValue = computed(() => props.checkedValue ?? true);
    const mergedUnCheckedValue = computed(() => props.unCheckedValue ?? false);

    // 当前值（用于单独使用时，不在 Group 中）
    const currentValue = shallowRef<CheckedValueType>(
      props?.checked ?? props?.defaultChecked ?? mergedUnCheckedValue.value,
    );

    watch(
      () => props.checked,
      (newChecked) => {
        currentValue.value = newChecked ?? mergedUnCheckedValue.value;
      },
    );

    // 计算是否选中（用于单独使用时）
    const isChecked = computed(() =>
      isValueEqual(currentValue.value, mergedCheckedValue.value),
    );
    const mergedChecked = computed(() => {
      if (checkboxGroup?.value && !props.skipGroup) {
        return checkboxGroup.value.value.includes?.(props.value);
      }
      return isChecked.value;
    });

    const mergedProps = computed(() => {
      return {
        ...props,
        disabled: mergedDisabled.value,
        checked: mergedChecked.value,
      } as CheckboxProps;
    });

    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      CheckboxClassNamesType,
      CheckboxStylesType,
      CheckboxProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, contextStyleRoot as any, styles),
      useToProps(mergedProps),
    );

    const prevValue = shallowRef(props.value);
    const checkboxRef = shallowRef();

    watch([() => props.value, () => props?.skipGroup], (_n, _o, onCleanup) => {
      if (props.skipGroup || !checkboxGroup?.value) {
        return;
      }
      if (prevValue.value !== props.value) {
        checkboxGroup?.value?.registerValue?.(props.value);
        prevValue.value = props.value;
      }
      onCleanup(() => {
        checkboxGroup?.value?.cancelValue?.(prevValue.value);
      });
    });

    if (checkboxGroup?.value) {
      checkboxGroup?.value?.registerValue?.(prevValue.value);
    }

    watch(
      () => props.indeterminate,
      async () => {
        await nextTick();
        if (checkboxRef.value && checkboxRef.value?.input) {
          checkboxRef.value.input.indeterminate = props.indeterminate;
        }
      },
      { immediate: true },
    );

    const rootCls = useCSSVarCls(prefixCls);

    // checkbox is controlled when checked prop is defined
    const isControlled = computed(() => props.checked !== undefined);

    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

    const [onLabelClick, onInputClick] = useBubbleLock((e) => {
      emit('click', e as MouseEvent);
    });

    const keys = [
      'prefixCls',
      'rootClass',
      'indeterminate',
      'skipGroup',
      'disabled',
      'classes',
      'styles',
      'checkedValue',
      'unCheckedValue',
    ] as const;

    expose({
      blur: () => checkboxRef.value?.blur?.(),
      focus: () => checkboxRef.value?.focus?.(),
      input: computed(() => checkboxRef.value?.input),
    });

    return () => {
      const { skipGroup, rootClass, indeterminate } = props;
      const children = checkRenderNode(filterEmpty(slots?.default?.() ?? []));
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const checkboxProps: any = {
        ...omit(props, keys as any),
      };

      // 是否在 Group 中使用
      const inGroup = checkboxGroup?.value && !skipGroup;

      if (inGroup) {
        checkboxProps.onChange = (checked: any) => {
          emit('change', checked);
        };
        checkboxProps.name = checkboxGroup.value?.name;
        checkboxProps.checked = mergedChecked.value;
      } else {
        // 单独使用时，使用 isChecked 判断选中状态
        checkboxProps.checked = mergedChecked.value;
      }
      const classString = clsx(
        `${prefixCls.value}-wrapper`,
        {
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
          [`${prefixCls.value}-wrapper-checked`]: checkboxProps.checked,
          [`${prefixCls.value}-wrapper-disabled`]: mergedDisabled.value,
          [`${prefixCls.value}-wrapper-in-form-item`]:
            formItemInputContext.value?.isFormItemInput,
        },
        contextClassName.value,
        className,
        mergedClassNames.value.root,
        rootClass,
        cssVarCls.value,
        rootCls.value,
        hashId.value,
      );

      const checkboxClass = clsx(
        mergedClassNames.value.icon,
        { [`${prefixCls.value}-indeterminate`]: indeterminate },
        TARGET_CLS,
        hashId.value,
      );
      // ============================== Render ==============================
      return (
        <Wave component="Checkbox" disabled={mergedDisabled.value}>
          <label
            class={classString}
            onClick={onLabelClick}
            onMouseenter={(e) => emit('mouseenter', e)}
            onMouseleave={(e) => emit('mouseleave', e)}
            style={[mergedStyles.value.root, style]}
            {...restAttrs}
          >
            <HeadlessCheckbox
              {...omit(checkboxProps, ['onChange'])}
              {...({
                onChange: (e: any) => {
                  if (!checkboxProps.onChange) {
                    emit('change', e);
                  }
                  checkboxProps?.onChange?.(e);
                },
                'onUpdate:checked': (checked: boolean) => {
                  if (inGroup) {
                    // 在 Group 中使用时，保持原有行为
                    emit('update:checked', checked);
                    if (!skipGroup && checkboxGroup?.value?.toggleOption) {
                      checkboxGroup.value.toggleOption({
                        label: children,
                        value: props.value,
                      });
                    }
                  } else {
                    // 单独使用时，返回自定义值
                    const newValue = checked
                      ? mergedCheckedValue.value
                      : mergedUnCheckedValue.value;
                    if (!isControlled.value) {
                      currentValue.value = newValue;
                    }
                    emit('update:checked', newValue);
                  }
                },
              } as any)}
              checked={mergedChecked.value}
              class={checkboxClass}
              disabled={mergedDisabled.value}
              name={
                !skipGroup && checkboxGroup?.value
                  ? checkboxGroup.value?.name
                  : props.name
              }
              onBlur={(e: any) => {
                formItemContext?.triggerBlur?.();
                emit('blur', e);
              }}
              onClick={onInputClick}
              prefixCls={prefixCls.value}
              ref={checkboxRef}
              style={mergedStyles.value.icon}
              value={props.value}
            />
            {isNonNullable(children) && (
              <span
                class={clsx(
                  `${prefixCls.value}-label`,
                  mergedClassNames.value?.label,
                )}
                style={mergedStyles.value?.label}
              >
                {children}
              </span>
            )}
          </label>
        </Wave>
      );
    };
  },
  {
    name: 'AsCheckbox',
    inheritAttrs: false,
  },
);

export default InternalCheckbox;
