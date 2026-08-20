import type { App, CSSProperties, SlotsType } from 'vue';

import type {
  SwitchChangeEventHandler,
  SwitchClickEventHandler,
} from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { ComponentBaseProps } from '../config-provider/context';
import type { SizeType } from '../config-provider/size-context';

import { computed, defineComponent, shallowRef, watch } from 'vue';

import { HeadlessSwitch } from '@arvin-studio/headless';
import { LoadingOutlined } from '@arvin-studio/icons';
import { clsx, omit } from '@arvin-studio/kit';

import {
  getAttrStyleAndClass,
  useMergeSemantic,
  useSemanticRootStyle,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { isValueEqual } from '../_util/isEqual';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import Wave from '../_util/wave';
import { useComponentBaseConfig } from '../config-provider/context';
import { useDisabledContext } from '../config-provider/disabled-context';
import { useSize } from '../config-provider/hooks/useSize';
import useStyle from './style';

export type SwitchSize = 'default' | Exclude<SizeType, 'large'>;

export type SwitchSemanticName = keyof SwitchSemanticClassNames &
  keyof SwitchSemanticStyles;

export interface SwitchSemanticClassNames {
  content?: string;
  indicator?: string;
  root?: string;
}

export interface SwitchSemanticStyles {
  content?: CSSProperties;
  indicator?: CSSProperties;
  root?: CSSProperties;
}

export type SwitchClassNamesType = SemanticClassNamesType<
  SwitchProps,
  SwitchSemanticClassNames
>;

export type SwitchStylesType = SemanticStylesType<
  SwitchProps,
  SwitchSemanticStyles
>;

export type CheckedValueType = boolean | number | object | string;

export interface SwitchProps extends ComponentBaseProps, SwitchEmitsProps {
  autoFocus?: boolean;
  checked?: CheckedValueType;
  // 这两个给插槽
  checkedChildren?: VueNode;
  /**
   * 选中时的值
   */
  checkedValue?: CheckedValueType;
  classes?: SwitchClassNamesType;
  defaultChecked?: CheckedValueType;
  /**
   * Alias for `defaultChecked`.
   * @since 5.12.0
   */
  defaultValue?: CheckedValueType;
  disabled?: boolean;
  id?: string;
  loading?: boolean;
  size?: SwitchSize;
  styles?: SwitchStylesType;
  tabIndex?: number;
  title?: string;
  unCheckedChildren?: VueNode;
  /**
   * 非选中时的值
   */
  unCheckedValue?: CheckedValueType;
  /**
   * Alias for `checked`.
   * @since 5.12.0
   */
  value?: CheckedValueType;
}

export interface SwitchEmits {
  change: SwitchChangeEventHandler;
  click: SwitchClickEventHandler;
  'update:checked': (checked: CheckedValueType) => void;
  'update:value': (checked: CheckedValueType) => void;
}
export interface SwitchEmitsProps {
  onChange?: SwitchEmits['change'];
  onClick?: SwitchEmits['click'];
  'onUpdate:checked'?: SwitchEmits['update:checked'];
  'onUpdate:value'?: SwitchEmits['update:value'];
}

export interface SwitchSlots {
  checkedChildren: () => any;
  unCheckedChildren: () => any;
}

const keys = [
  'prefixCls',
  'size',
  'disabled',
  'loading',
  'rootClass',
  'style',
  'checked',
  'value',
  'defaultChecked',
  'defaultValue',
  'checkedValue',
  'unCheckedValue',
  'styles',
  'classes',
  'checkedChildren',
  'unCheckedChildren',
];

const Switch = defineComponent<
  SwitchProps,
  SwitchEmits,
  string,
  SlotsType<SwitchSlots>
>(
  (props, { slots, emit, attrs }) => {
    // 获取选中和非选中的值，默认为 true/false
    const mergedCheckedValue = computed(() => props.checkedValue ?? true);
    const mergedUnCheckedValue = computed(() => props.unCheckedValue ?? false);

    // 获取当前值
    const currentValue = shallowRef<CheckedValueType>(
      props?.checked ??
        props?.value ??
        props?.defaultChecked ??
        props?.defaultValue ??
        mergedUnCheckedValue.value,
    );
    watch(
      [() => props.checked, () => props.value],
      ([newChecked, newValue]) => {
        if (newChecked !== undefined) {
          currentValue.value = newChecked;
        } else if (newValue === undefined) {
          currentValue.value = mergedUnCheckedValue.value;
        } else {
          currentValue.value = newValue;
        }
      },
    );

    const isChecked = computed(() =>
      isValueEqual(currentValue.value, mergedCheckedValue.value),
    );

    const {
      prefixCls,
      direction,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
    } = useComponentBaseConfig('switch', props);
    const {
      classes,
      styles,
      size: customizeSize,
    } = toPropsRefs(props, 'size', 'classes', 'styles');
    // ===================== Disabled =====================
    const disabled = useDisabledContext();
    const mergedDisabled = computed(
      () => (props.disabled ?? disabled.value) || props.loading,
    );
    // const formItemContext = useFormItemContext()

    // Style
    const [hashId, cssVarCls] = useStyle(prefixCls);

    const mergedSize = useSize(customizeSize);

    const mergedProps = computed(() => {
      return {
        ...props,
        size: mergedSize.value,
        disabled: mergedDisabled.value,
      } as SwitchProps;
    });

    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      SwitchClassNamesType,
      SwitchStylesType,
      SwitchProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, contextStyleRoot as any, styles),
      useToProps(mergedProps),
    );

    const changeHandler: SwitchChangeEventHandler = (...args) => {
      emit('change', ...args);
    };
    const clickHandler: SwitchClickEventHandler = (...args) => {
      emit('click', ...args);
    };
    const handleVMHandler = (checked: boolean) => {
      // 根据 checked 状态返回对应的自定义值
      const newValue = checked
        ? mergedCheckedValue.value
        : mergedUnCheckedValue.value;
      if (props.checked === undefined && props.value === undefined) {
        currentValue.value = newValue;
      }
      emit('update:checked', newValue);
      emit('update:value', newValue);
    };
    return () => {
      const { loading, rootClass } = props;
      const checkedChildren = getSlotPropsFnRun(
        slots,
        props,
        'checkedChildren',
      );
      const unCheckedChildren = getSlotPropsFnRun(
        slots,
        props,
        'unCheckedChildren',
      );
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const loadingIcon = (
        <div
          class={clsx(
            `${prefixCls.value}-handle`,
            mergedClassNames.value.indicator,
          )}
          style={mergedStyles.value.indicator}
        >
          {loading && (
            <LoadingOutlined class={`${prefixCls.value}-loading-icon`} />
          )}
        </div>
      );

      const classes = clsx(
        contextClassName.value,
        {
          [`${prefixCls.value}-small`]: mergedSize.value === 'small',
          [`${prefixCls.value}-loading`]: loading,
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
        },
        className,
        rootClass,
        mergedClassNames.value.root,
        hashId.value,
        cssVarCls.value,
      );

      const mergedStyle: any = {
        ...mergedStyles.value.root,
        ...style,
      };

      const restProps = omit(props, keys);
      return (
        <Wave component="Switch" disabled={mergedDisabled.value}>
          <HeadlessSwitch
            {...restAttrs}
            {...(restProps as any)}
            checked={isChecked.value}
            checkedChildren={checkedChildren}
            className={classes}
            classNames={mergedClassNames.value}
            disabled={mergedDisabled.value}
            loadingIcon={loadingIcon}
            onChange={changeHandler}
            onClick={clickHandler}
            prefixCls={prefixCls.value}
            style={mergedStyle}
            styles={mergedStyles.value}
            unCheckedChildren={unCheckedChildren}
            {...{
              'onUpdate:checked': handleVMHandler,
            }}
          />
        </Wave>
      );
    };
  },
  {
    name: 'AsSwitch',
    inheritAttrs: false,
  },
);

(Switch as any).install = (app: App) => {
  app.component(Switch.name, Switch);
};

export default Switch;
