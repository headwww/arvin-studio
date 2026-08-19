/**
 *  Input（headless 输入框主组件）
 *
 * 职责分层：
 * - 输入逻辑：值管理（受控/非受控）、输入法（composition）处理、
 *   回车锁定、聚焦/失焦、字数统计与超长截断；
 * - 布局：把原生 <input> 交给 BaseInput 按需包裹（前缀/后缀/清除/addon）。
 *
 * 关键设计：
 * 1. 输入法（IME）三件套（compositionRef / keyLockRef / compositionEndValueRef）：
 *    - 组合期间默认不触发 onChange（changeOnComposing=false 时）；
 *    - 修复 Firefox 在 compositionend 后补发相同值 input 事件的去重标记；
 *    - 回车通过 keydown 记录 + keyup 校验（组合态/修饰键排除）。
 * 2. 事件安全重建：值被截断/清除时，用克隆 target 的合成事件触发 onChange
 *    （见 utils/commonUtils）。
 * 3. count/showCount 双接口统一为 CountConfig，超长时可 exceedFormatter 截断。
 * 4. expose 标准实例方法：focus/blur/select/setSelectionRange/input/nativeElement。
 */
import type { InputFocusOptions } from '../util';
import type { HolderRef } from './BaseInput';
import type { InputProps } from './interface';

import { computed, defineComponent, shallowRef, watch } from 'vue';

import { clsx, omit } from '@arvin-studio/kit';

import { KeyCodeStr, toPropsRefs, triggerFocus } from '../util';
import BaseInput from './BaseInput';
import useCount from './hooks/useCount';
import { resolveOnChange } from './utils/commonUtils';

/** 默认 props：prefixCls 与 type 兜底 */
const defaults = {
  prefixCls: 'headless-input',
  type: 'text',
} as any;
const Input = defineComponent<InputProps>(
  (props = defaults, { slots, expose, attrs }) => {
    const focused = shallowRef(false);
    // 是否处于输入法组合中（compositionstart ~ compositionend）
    const compositionRef = shallowRef(false);
    // 回车键锁定（keydown 触发 onPressEnter 后，直到 keyup 才解锁，防止重复触发）
    const keyLockRef = shallowRef(false);
    // Track the value emitted by compositionEnd to dedup Firefox's subsequent input event
    // 记录 compositionend 时的值，用于去重 Firefox 在 compositionend 后补发的相同值 input 事件
    const compositionEndValueRef = shallowRef<null | string>(null);
    const { count, showCount } = toPropsRefs(props, 'count', 'showCount');

    const onChange = (e: Event) => {
      props?.onChange?.(e as any);
    };

    const inputRef = shallowRef<HTMLInputElement>();
    const holderRef = shallowRef<HolderRef>();

    /** 聚焦（支持光标位置选项） */
    const focus = (option?: InputFocusOptions) => {
      if (inputRef.value) {
        triggerFocus(inputRef.value, option);
      }
    };

    // ====================== Value =======================
    // 受控/非受控：props.value 优先，缺省用 defaultValue，再缺省为空
    const value = shallowRef(props?.value ?? props?.defaultValue);
    watch(
      () => props.value,
      (newValue) => {
        value.value = newValue;
      },
    );
    // 渲染值：null/undefined 归一化为空串
    const formatValue = computed(() =>
      value.value === undefined || value.value === null
        ? ''
        : String(value.value),
    );

    // =================== Select Range ===================
    // 截断后恢复光标选区（受控回写 selectionStart/End）
    const selection = shallowRef<[start: number, end: number] | null>(null);
    watch(selection, (newSelection) => {
      if (newSelection && inputRef.value) {
        inputRef.value.setSelectionRange(...newSelection);
      }
    });

    // ====================== Count =======================
    // 字数统计配置（count / showCount 归一化）
    const countConfig = useCount(count as any, showCount as any);
    const mergedMax = computed(
      () => countConfig?.value?.max || props?.maxLength,
    );
    const valueLength = computed(
      () => countConfig.value?.strategy?.(formatValue.value) ?? 0,
    );

    // 是否超出上限（用于 out-of-range 样式）
    const isOutOfRange = computed(
      () => !!mergedMax.value && valueLength.value > mergedMax.value,
    );

    // ======================= Ref ========================
    // 对外暴露标准实例方法
    expose({
      focus,
      blur: () => {
        inputRef.value?.blur?.();
      },
      setSelectionRange: (
        start: number,
        end: number,
        direction?: 'backward' | 'forward' | 'none',
      ) => {
        inputRef.value?.setSelectionRange(start, end, direction);
      },
      select: () => {
        inputRef.value?.select();
      },
      input: inputRef,
      // 根元素：优先容器（有 affix/group 时），否则 input 本身
      nativeElement: computed(
        () => holderRef.value?.nativeElement || inputRef.value,
      ),
    });

    // 禁用时同步清理焦点/回车锁定状态
    watch(
      () => props.disabled,
      () => {
        if (keyLockRef.value) {
          keyLockRef.value = false;
        }
        focused.value = focused.value && props.disabled ? false : focused.value;
      },
      {
        immediate: true,
      },
    );

    /**
     * 统一变更入口：过滤（组合态/去重）→ 截断（超长）→ 同步值 → 触发 onChange
     */
    const triggerChange = (
      e: CompositionEvent | Event,
      currentValue: string,
    ) => {
      // Skip during IME composition to avoid emitting intermediate values
      // 组合期间不触发（除非 changeOnComposing）
      if (compositionRef.value && !props.changeOnComposing) {
        return;
      }

      // Dedup: Firefox fires input event(s) AFTER compositionend with the same value.
      // Keep blocking until a genuinely different value arrives.
      // 去重：Firefox 在 compositionend 后会用相同值补发 input 事件，
      // 值一致则拦截，直到出现真正不同的值才放行
      if (compositionEndValueRef.value !== null) {
        if (currentValue === compositionEndValueRef.value) {
          return;
        }
        compositionEndValueRef.value = null;
      }

      let cutValue = currentValue;
      const config = countConfig.value;

      // 超长截断：非组合态、配置了 exceedFormatter 且超出 max 时
      if (
        !compositionRef.value &&
        config?.exceedFormatter &&
        config.max &&
        config.strategy(currentValue) > config.max
      ) {
        cutValue = config.exceedFormatter(currentValue, {
          max: config.max,
        });

        // 截断改变了值 → 记录当前光标位置，回写后恢复
        if (currentValue !== cutValue) {
          selection.value = [
            inputRef.value?.selectionStart || 0,
            inputRef.value?.selectionEnd || 0,
          ];
        }
      }

      // 非受控模式：同步内部值
      if (props.value === undefined) {
        value.value = cutValue;
      }

      // 触发 onChange（用克隆 target 的安全事件携带新值）
      if (inputRef.value) {
        resolveOnChange(inputRef.value, e, onChange, cutValue);
      }
    };

    const onInternalChange = (e: Event) => {
      triggerChange(e, (e.target as HTMLInputElement).value);
    };

    const onInternalCompositionStart = (e: CompositionEvent) => {
      compositionRef.value = true;
      // Clear stale dedup marker from previous composition cycle
      // 清除上一次组合周期遗留的去重标记
      compositionEndValueRef.value = null;
      props?.onCompositionStart?.(e as any);
    };

    const onInternalCompositionEnd = (e: CompositionEvent) => {
      compositionRef.value = false;
      const currentValue = (e.target as HTMLInputElement).value;
      // When changeOnComposing is true, the input event before compositionend
      // already fired onChange with the final value — skip to avoid duplicate.
      // When guard is on (default), the input event was blocked, so we must
      // trigger here as Chrome/Safari fire input BEFORE compositionend.
      // Also skip if value hasn't changed (e.g. composition cancelled via Esc).
      // changeOnComposing=true 时组合期间的 input 已触发过 onChange，这里跳过；
      // 默认关闭时组合期间被拦截，而 Chrome/Safari 的 input 在 compositionend 之前，
      // 所以这里补触发一次（值未变化如 Esc 取消则跳过）
      if (!props.changeOnComposing && currentValue !== formatValue.value) {
        triggerChange(e, currentValue);
      }
      // Always set dedup ref after compositionend: Firefox fires input event(s)
      // after compositionend regardless of whether value changed or not
      // 无论值是否变化，compositionend 后都记录当前值供去重
      if (!props.changeOnComposing) {
        compositionEndValueRef.value = currentValue;
      }
      props?.onCompositionEnd?.(e as any);
    };

    // 回车：keydown 时锁定并触发一次 onPressEnter（keyup 解锁），
    // 组合态（isComposing）不触发
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === KeyCodeStr.Enter && !keyLockRef.value && !e.isComposing) {
        keyLockRef.value = true;
        props.onPressEnter?.(e);
      }
      props?.onKeyDown?.(e);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        keyLockRef.value = false;
      }
      props?.onKeyUp?.(e);
    };

    const handleFocus = (e: FocusEvent) => {
      focused.value = true;
      props?.onFocus?.(e);
    };

    const handleBlur = (e: FocusEvent) => {
      if (keyLockRef.value) {
        keyLockRef.value = false;
      }
      focused.value = false;
      props?.onBlur?.(e);
    };

    /** 清除：重置值（非受控）、聚焦、以空值触发 onChange */
    const handleReset = (e: MouseEvent) => {
      compositionEndValueRef.value = null;
      if (props.value === undefined) {
        value.value = '';
      }
      focus();
      if (inputRef.value) {
        resolveOnChange(inputRef.value, e, onChange);
      }
    };

    // 合并 allowClear：插槽 clearIcon 优先，其次对象配置
    const mergedAllowClear = computed(() => {
      if (!props.allowClear) {
        return props.allowClear;
      }

      const clearIcon = slots.clearIcon?.();

      if (clearIcon) {
        return {
          ...(typeof props.allowClear === 'object' && props.allowClear),
          clearIcon,
        };
      }

      return props.allowClear;
    });

    return () => {
      const {
        autoComplete,
        prefixCls = defaults.prefixCls,
        disabled,
        htmlSize,
        classNames,
        styles,
        suffix,
        type = defaults.type,
        classes,
        readOnly,
        hidden,
        dataAttrs,
        components,
      } = props;
      const { class: className, style, ...restAttrs } = attrs;
      const mergedClassName = className ?? (props as any).class;
      const mergedStyle = style ?? (props as any).style;

      // 插槽优先，props 兜底
      const prefixNode = slots.prefix?.() ?? props.prefix;
      const suffixNode = slots.suffix?.() ?? suffix;
      const addonBefore = slots.addonBefore?.() ?? props.addonBefore;
      const addonAfter = slots.addonAfter?.() ?? props.addonAfter;

      // 字数统计：拼进 suffix 区（count 展示 + 用户 suffix）
      const config = countConfig.value;
      const hasMaxLength = Number(mergedMax.value) > 0;
      let mergedSuffix = suffixNode;
      if (suffixNode || config?.show) {
        // 展示内容：自定义 formatter 优先，否则 "count / max"
        const dataCount = config?.showFormatter
          ? config.showFormatter({
              value: formatValue.value,
              count: valueLength.value,
              maxLength: mergedMax.value,
            })
          : `${valueLength.value}${hasMaxLength ? ` / ${mergedMax.value}` : ''}`;

        mergedSuffix = (
          <>
            {config?.show && (
              <span
                class={clsx(
                  `${prefixCls}-show-count-suffix`,
                  {
                    [`${prefixCls}-show-count-has-suffix`]: !!suffixNode,
                  },
                  classNames?.count,
                )}
                style={styles?.count}
              >
                {dataCount}
              </span>
            )}
            {suffixNode}
          </>
        );
      }

      // 由 Input 层处理的 props 不再透传给原生 input
      const otherProps = omit(props as any, [
        'prefixCls',
        'onPressEnter',
        'addonBefore',
        'addonAfter',
        'prefix',
        'suffix',
        'allowClear',
        'defaultValue',
        'showCount',
        'count',
        'classes',
        'htmlSize',
        'styles',
        'classNames',
        'onClear',
        'dataAttrs',
        'components',
        'hidden',
        'readOnly',
        'value',
        'type',
        'class',
        'style',
        'onFocus',
        'onBlur',
        'onChange',
        'onKeyDown',
        'onKeyUp',
        'onCompositionStart',
        'onCompositionEnd',
        'onInput',
        'changeOnComposing',
      ]);

      // 原生 input 节点（事件全部走内部处理器，再转发给用户）
      const inputElement = (
        <input
          {...restAttrs}
          {...otherProps}
          autocomplete={autoComplete}
          class={clsx(
            prefixCls,
            {
              [`${prefixCls}-disabled`]: disabled,
            },
            classNames?.input,
          )}
          disabled={disabled}
          maxlength={props.maxLength}
          onBlur={handleBlur}
          onCompositionend={onInternalCompositionEnd}
          onCompositionstart={onInternalCompositionStart}
          onFocus={handleFocus}
          onInput={onInternalChange}
          onKeydown={handleKeyDown}
          onKeyup={handleKeyUp}
          readonly={readOnly}
          ref={inputRef}
          size={htmlSize}
          style={styles?.input}
          type={type}
          value={formatValue.value}
        />
      );

      // 交给 BaseInput 按需包裹（affix/group），并传入布局相关 props
      return (
        <BaseInput
          addonAfter={addonAfter}
          addonBefore={addonBefore}
          allowClear={mergedAllowClear.value as any}
          class={clsx(
            mergedClassName as any,
            isOutOfRange.value && `${prefixCls}-out-of-range`,
          )}
          classes={classes}
          classNames={classNames}
          components={components}
          dataAttrs={dataAttrs}
          disabled={disabled}
          focused={focused.value}
          handleReset={handleReset}
          hidden={hidden}
          onClear={props.onClear}
          prefix={prefixNode}
          prefixCls={prefixCls}
          readOnly={readOnly}
          ref={holderRef as any}
          style={mergedStyle as any}
          styles={styles}
          suffix={mergedSuffix}
          triggerFocus={focus}
          value={formatValue.value}
        >
          {inputElement}
        </BaseInput>
      );
    };
  },
  {
    name: 'Input',
    inheritAttrs: false,
  },
);

export default Input;
