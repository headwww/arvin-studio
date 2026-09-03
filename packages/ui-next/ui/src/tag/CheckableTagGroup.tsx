import type { VueNode } from '../_util';
import type { SemanticClassNames, SemanticStyles } from '../_util/hooks';
import type { ComponentBaseProps } from '../config-provider/context.ts';

import { computed, defineComponent, shallowRef } from 'vue';

import { pickAttrs } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import { useComponentBaseConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import CheckableTag from './CheckableTag';
import useStyle from './style';

type CheckableTagDefaultValue = number | string;
export interface CheckableTagOption<
  CheckableTagValue = CheckableTagDefaultValue,
> {
  disabled?: boolean;
  label: VueNode;
  value: CheckableTagValue;
}

interface CheckableTagGroupSingleProps<
  CheckableTagValue = CheckableTagDefaultValue,
> {
  defaultValue?: CheckableTagValue | null;
  multiple?: false;
  onChange?: (value: CheckableTagValue | null) => void;
  value?: CheckableTagValue | null;
}

interface CheckableTagGroupMultipleProps<
  CheckableTagValue = CheckableTagDefaultValue,
> {
  defaultValue?: CheckableTagValue[];
  multiple: true;
  value?: CheckableTagValue[];
  // onChange?: (value: CheckableTagValue[]) => void
}

export type SemanticName = 'item' | 'root';

export type CheckableTagGroupProps<
  CheckableTagValue = CheckableTagDefaultValue,
> = (
  | CheckableTagGroupMultipleProps<CheckableTagValue>
  | CheckableTagGroupSingleProps<CheckableTagValue>
) &
  ComponentBaseProps & {
    classes?: SemanticClassNames<SemanticName>;
    disabled?: boolean;
    id?: string;
    options?: (CheckableTagOption<CheckableTagValue> | CheckableTagValue)[];
    role?: string;
    styles?: SemanticStyles<SemanticName>;
  };

export interface CheckableTagGroupRef {
  nativeElement: HTMLDivElement;
}

export interface CheckableTagGroupEmits<
  CheckableTagValue = CheckableTagDefaultValue,
> {
  change: (value: CheckableTagValue | CheckableTagValue[] | null) => void;
  'update:value': (
    value: CheckableTagValue | CheckableTagValue[] | null,
  ) => void;
}
export interface CheckableTagGroupEmitsProps<
  CheckableTagValue = CheckableTagDefaultValue,
> {
  onChange?: CheckableTagGroupEmits<CheckableTagValue>['change'];
  'onUpdate:value'?: CheckableTagGroupEmits<CheckableTagValue>['update:value'];
}

interface InternalCheckableTagGroupProps
  // oxlint-disable-next-line typescript/ban-ts-comment
  // @ts-ignore
  extends CheckableTagGroupEmitsProps, CheckableTagGroupProps {}

const CheckableTagGroup = defineComponent<
  InternalCheckableTagGroupProps,
  CheckableTagGroupEmits,
  string
>(
  (props: CheckableTagGroupProps, { emit, attrs, expose }) => {
    const { prefixCls, direction } = useComponentBaseConfig('tag', props);
    const groupPrefixCls = computed(() => `${prefixCls.value}-checkable-group`);
    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

    const mergedClassNames = computed(() => props.classes || {});
    const mergedStyles = computed(() => props.styles || {});
    // =============================== Option ===============================
    const parsedOptions = computed(() => {
      return (props.options ?? []).map((option) => {
        if (option && typeof option === 'object') {
          return option;
        }
        return {
          value: option,
          label: option,
        };
      });
    });

    // =============================== Values ===============================
    const _mergedValue = shallowRef<
      CheckableTagDefaultValue | CheckableTagDefaultValue[] | null
    >(props.defaultValue ?? props.value ?? null);
    const mergedValue = computed({
      set(value: CheckableTagDefaultValue | CheckableTagDefaultValue[] | null) {
        _mergedValue.value = value;
        emit('update:value', value);
      },
      get() {
        return props.value ?? _mergedValue.value;
      },
    });
    const handleChange = (checked: boolean, option: CheckableTagOption) => {
      // eslint-disable-next-line no-useless-assignment
      let newValue:
        | CheckableTagDefaultValue
        | CheckableTagDefaultValue[]
        | null = null;
      if (props.multiple) {
        const valueList = (mergedValue.value ||
          []) as CheckableTagDefaultValue[];
        newValue = checked
          ? [...valueList, option.value]
          : valueList.filter((v) => v !== option.value);
      } else {
        newValue = checked ? option.value : null;
      }
      mergedValue.value = newValue;
      emit('change', newValue);
    };

    // ================================ Refs ================================
    const divRef = shallowRef<HTMLDivElement>();
    expose({
      nativeElement: divRef,
    });
    return () => {
      const { rootClass, disabled, id, multiple } = props;
      // ================================ ARIA ================================
      const ariaProps = pickAttrs(attrs, {
        aria: true,
        data: true,
      });
      // =============================== Render ===============================

      return (
        <div
          {...ariaProps}
          class={clsx(
            groupPrefixCls.value,
            rootClass,
            {
              [`${groupPrefixCls.value}-disabled`]: disabled,
              [`${groupPrefixCls.value}-rtl`]: direction.value === 'rtl',
            },
            hashId.value,
            cssVarCls.value,
            (attrs as any).class,
            mergedClassNames.value.root,
          )}
          id={id}
          ref={divRef}
          style={[mergedStyles.value.root, (attrs as any).style]}
        >
          {parsedOptions.value.map((option) => {
            return (
              <CheckableTag
                checked={
                  multiple
                    ? (
                        (mergedValue.value as CheckableTagDefaultValue[]) || []
                      ).includes(option.value)
                    : mergedValue.value === option.value
                }
                class={clsx(
                  `${groupPrefixCls.value}-item`,
                  mergedClassNames.value.item,
                )}
                disabled={option.disabled ?? disabled}
                key={option.value}
                onChange={(checked: boolean) => handleChange(checked, option)}
                style={mergedStyles.value.item}
              >
                {option.label}
              </CheckableTag>
            );
          })}
        </div>
      );
    };
  },
  {
    name: 'AsCheckableTagGroup',
    inheritAttrs: false,
  },
);

export default CheckableTagGroup;
