import type { SlotsType } from 'vue';

import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type {
  RadioChangeEvent,
  RadioEmits,
  RadioProps,
  RadioSemanticClassNames,
  RadioSemanticStyles,
  RadioSlots,
} from './interface';

import { computed, defineComponent, shallowRef } from 'vue';

import { filterEmpty, HeadlessCheckbox } from '@arvin-studio/headless';
import { clsx, omit } from '@arvin-studio/kit';

import {
  getAttrStyleAndClass,
  useMergeSemantic,
  useSemanticRootStyle,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { toPropsRefs } from '../_util/tools';
import { checkRenderNode } from '../_util/vueNode';
import Wave from '../_util/wave';
import { TARGET_CLS } from '../_util/wave/interface';
import useBubbleLock from '../checkbox/useBubbleLock';
import { useComponentBaseConfig } from '../config-provider/context';
import { useDisabledContext } from '../config-provider/disabled-context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useFormItemInputContext } from '../form/context';
import { useRadioGroupContext, useRadioOptionTypeContext } from './context';
import useStyle from './style';

export interface InternalRadioProps extends RadioEmitsProps, RadioProps {}

export interface RadioEmitsProps {
  onBlur?: RadioEmits['blur'];
  onChange?: RadioEmits['change'];
  onClick?: RadioEmits['click'];
  onFocus?: RadioEmits['focus'];
  onKeydown?: RadioEmits['keydown'];
  onKeypress?: RadioEmits['keypress'];
  onMouseenter?: RadioEmits['mouseenter'];
  onMouseleave?: RadioEmits['mouseleave'];
  'onUpdate:checked'?: RadioEmits['update:checked'];
  'onUpdate:value'?: RadioEmits['update:value'];
}

const InternalRadio = defineComponent<
  InternalRadioProps,
  RadioEmits,
  string,
  SlotsType<RadioSlots>
>(
  (props, { slots, expose, attrs, emit }) => {
    const groupContext = useRadioGroupContext();
    const radioOptionTypeContext = useRadioOptionTypeContext();
    const {
      prefixCls: radioPrefixCls,
      direction,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
    } = useComponentBaseConfig('radio', props);
    const innerRef = shallowRef();
    const formItemInputContext = useFormItemInputContext();

    const onChange = (e: RadioChangeEvent) => {
      emit('change', e as any);
      groupContext?.value?.onChange?.(e);
    };

    const { classes, styles } = toPropsRefs(props, 'classes', 'styles');

    const isButtonType = computed(
      () =>
        (groupContext?.value?.optionType || radioOptionTypeContext?.value) ===
        'button',
    );
    const prefixCls = computed(() =>
      isButtonType.value
        ? `${radioPrefixCls.value}-button`
        : radioPrefixCls.value,
    );

    // Style
    const rootCls = useCSSVarCls(radioPrefixCls);
    const [hashId, cssVarCls] = useStyle(radioPrefixCls, rootCls);

    // ===================== Disabled =====================
    const disabled = useDisabledContext();

    const radioProps = computed(() => {
      const _radioProps: any = {
        ...omit(props, [
          'prefixCls',
          'classes',
          'styles',
          'title',
          'rootClass',
        ]),
        onChange,
      };
      if (groupContext?.value) {
        _radioProps.name = groupContext.value.name;
        _radioProps.checked = props.value === groupContext.value.value;
        _radioProps.disabled ??= groupContext.value.disabled;
      }
      _radioProps.disabled ??= disabled.value;

      return _radioProps;
    });

    const mergedChecked = computed(() => {
      if (groupContext?.value) {
        return props.value === groupContext.value?.value;
      }
      return radioProps.value.checked;
    });
    // =========== Merged Props for Semantic ===========
    const mergedProps = computed(() => {
      return {
        ...props,
        ...radioProps.value,
        disabled: mergedChecked.value,
      };
    });

    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      SemanticClassNamesType<RadioProps, RadioSemanticClassNames>,
      SemanticStylesType<RadioProps, RadioSemanticStyles>,
      RadioProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, contextStyleRoot as any, styles),
      useToProps(mergedProps),
    );

    // ============================ Event Lock ============================
    const [onLabelClick, onInputClick] = useBubbleLock((e) => {
      emit('click', e as MouseEvent);
    });
    expose({
      blur: () => innerRef.value?.blur?.(),
      focus: () => innerRef.value?.focus?.(),
      input: computed(() => innerRef.value?.input),
    });
    return () => {
      const { rootClass, title } = props;
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const wrapperClassString = clsx(
        `${prefixCls.value}-wrapper`,
        {
          [`${prefixCls.value}-wrapper-checked`]: mergedChecked.value,
          [`${prefixCls.value}-wrapper-disabled`]: radioProps.value.disabled,
          [`${prefixCls.value}-wrapper-rtl`]: direction.value === 'rtl',
          [`${prefixCls.value}-wrapper-in-form-item`]:
            formItemInputContext?.value?.isFormItemInput,
          [`${prefixCls.value}-wrapper-block`]: !!groupContext?.value?.block,
        },
        contextClassName.value,
        className,
        rootClass,
        mergedClassNames.value.root,
        hashId.value,
        cssVarCls.value,
        rootCls.value,
      );
      const children = checkRenderNode(filterEmpty(slots?.default?.() ?? []));
      // ============================== Render ==============================
      return (
        <Wave component="Radio" disabled={radioProps.value.disabled}>
          <label
            {...restAttrs}
            class={wrapperClassString}
            onClick={onLabelClick}
            onMouseenter={(e) => {
              emit('mouseenter', e);
            }}
            onMouseleave={(e) => {
              emit('mouseleave', e);
            }}
            style={{ ...mergedStyles.value.root, ...style }}
            title={title}
          >
            <HeadlessCheckbox
              {...radioProps.value}
              checked={mergedChecked.value}
              class={clsx(mergedClassNames.value.icon, {
                [TARGET_CLS]: !isButtonType.value,
              })}
              onClick={onInputClick}
              prefixCls={prefixCls.value}
              ref={innerRef}
              style={mergedStyles.value.icon}
              type="radio"
              {...{
                'onUpdate:checked': (checked: boolean) => {
                  emit('update:checked', checked);
                },
              }}
            />
            {children ? (
              <span
                class={clsx(
                  `${prefixCls.value}-label`,
                  mergedClassNames.value.label,
                )}
                style={mergedStyles.value.label}
              >
                {children}
              </span>
            ) : null}
          </label>
        </Wave>
      );
    };
  },
  {
    name: 'AsRadio',
    inheritAttrs: false,
  },
);

export default InternalRadio;
