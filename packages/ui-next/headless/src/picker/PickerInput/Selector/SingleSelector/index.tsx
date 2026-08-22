import type { SetupContext } from 'vue';

import type { InternalMode, SelectorProps } from '../../../interface';
import type { InputRef } from '../Input';

import { computed, defineComponent, ref } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { isSame } from '../../../utils/dateUtil';
import { usePickerContext } from '../../context';
import ClearIcon from '../ClearIcon';
import useInputProps from '../hooks/useInputHooks';
import useRootProps from '../hooks/useRootProps';
import Icon from '../Icon';
import Input from '../Input';
import MultipleDates from './MultipleDates';

export interface SingleSelectorProps<
  DateType extends object = any,
> extends SelectorProps<DateType> {
  /** All the field show as `placeholder` */
  allHelp?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;

  id?: string;

  internalPicker: InternalMode;

  // Invalid
  invalid?: boolean;

  // Vue specific
  maxTagCount?: 'responsive' | number;

  multiple?: boolean;
  onChange: (date: DateType[], source?: 'input' | 'remove') => void;

  onInvalid: (valid: boolean) => void;

  onMouseDown?: (e: MouseEvent) => void;
  placeholder?: string;
  removeIcon?: any;

  tabIndex?: number | string;

  tagRender?: (props: {
    closable: boolean;
    disabled: boolean;
    label: any;
    onClose: (event?: MouseEvent) => void;
    value: DateType;
  }) => any;
  value?: DateType[];
}

const SingleSelector = defineComponent<SingleSelectorProps>(
  (props, { attrs, expose }: SetupContext) => {
    const rtl = computed(() => props.direction === 'rtl');

    // ======================== Prefix ========================
    const ctx = usePickerContext();
    const prefixCls = computed(() => ctx.value.prefixCls);
    const classNames = computed(() => ctx.value.classNames);
    const styles = computed(() => ctx.value.styles);

    // ========================= Refs =========================
    const rootRef = ref<HTMLDivElement>();
    const inputRef = ref<InputRef>();

    expose({
      nativeElement: rootRef,
      focus: (options?: FocusOptions) => {
        inputRef.value?.focus(options);
      },
      blur: () => {
        inputRef.value?.blur();
      },
    });

    // ======================== Props =========================
    // Filter props for root
    const rootProps = useRootProps(props as any);

    // ======================== Change ========================
    const onSingleChange = (date: any) => {
      props.onChange?.([date], 'input');
    };

    const onMultipleRemove = (date: any) => {
      const nextValues = (props.value || []).filter(
        (oriDate) =>
          oriDate &&
          !isSame(
            props.generateConfig!,
            props.locale!,
            oriDate,
            date,
            props.internalPicker as InternalMode,
          ),
      );
      // An open popup keeps removal temporary until confirmation. Removing while
      // closed is final and submits through the explicit `remove` source.
      // popup 打开时仅保留临时删除值并等待确认；关闭时删除是最终操作，通过
      // 明确的 `remove` 来源提交。
      props.onChange?.(nextValues, props.open ? 'input' : 'remove');
    };

    // ======================== Inputs ========================
    const [getInputProps, getText] = useInputProps(
      computed(() => ({
        ...props,
        'aria-required': !!(props as any)['aria-required'],
        onChange: onSingleChange,
      })) as any,
      ({ valueTexts }) => ({
        value: valueTexts[0] || '',
        active: props.focused,
      }),
    );

    // ======================== Render ========================
    return () => {
      const {
        prefix,
        clearIcon,
        suffixIcon,
        placeholder,
        onClick,
        onClear,
        multiple,
        maxTagCount,
        removeIcon,
        tagRender,
        onMouseDown,
        value,
        disabled,
        invalid,
        autoFocus,
        tabIndex,
      } = props;

      const showClear = !!(clearIcon && value && value.length > 0 && !disabled);

      // ======================= Multiple =======================
      const selectorNode = multiple ? (
        <>
          <MultipleDates
            disabled={disabled}
            formatDate={getText}
            maxTagCount={maxTagCount}
            onRemove={onMultipleRemove}
            placeholder={placeholder}
            prefixCls={prefixCls.value!}
            removeIcon={removeIcon}
            tagRender={tagRender}
            value={value as any[]}
          />
          <input
            autofocus={autoFocus}
            class={`${prefixCls.value}-multiple-input`}
            readonly
            ref={inputRef as any}
            tabindex={tabIndex as any}
            value={(value || []).map(getText).join(',')}
          />
          <Icon icon={suffixIcon} />
          {showClear && <ClearIcon icon={clearIcon} onClear={onClear as any} />}
        </>
      ) : (
        <Input
          ref={inputRef}
          {...getInputProps()}
          autofocus={autoFocus}
          clearIcon={
            showClear && <ClearIcon icon={clearIcon} onClear={onClear as any} />
          }
          showActiveCls={false}
          suffixIcon={suffixIcon}
          tabindex={tabIndex}
        />
      );

      return (
        <div
          {...rootProps.value}
          class={clsx(
            prefixCls.value,
            {
              [`${prefixCls.value}-multiple`]: multiple,
              [`${prefixCls.value}-focused`]: props.focused,
              [`${prefixCls.value}-disabled`]: disabled,
              [`${prefixCls.value}-invalid`]: invalid,
              [`${prefixCls.value}-rtl`]: rtl.value,
            },
            props.class,
            attrs.class as any,
          )}
          onClick={onClick as any}
          // Not lose current input focus
          onMousedown={(e) => {
            const { target } = e;
            if (target !== inputRef.value?.inputElement) {
              e.preventDefault();
            }

            onMouseDown?.(e);
          }}
          ref={rootRef}
          style={{ ...(attrs.style as any), ...props.style }}
        >
          {prefix && (
            <div
              class={clsx(`${prefixCls.value}-prefix`, classNames.value.prefix)}
              style={styles.value.prefix}
            >
              {prefix}
            </div>
          )}
          {selectorNode}
        </div>
      );
    };
  },
  {
    name: 'SingleSelector',
    inheritAttrs: false,
  },
);

export default SingleSelector;
