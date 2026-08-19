/**
 *
 * 核心设计：
 * 1. 数值一律用 @v-c/mini-decimal 的 DecimalClass 表示（十进制字符串运算），
 *    从源头规避浮点误差（0.1 + 0.2 !== 0.3）；
 * 2. "数值层"与"展示层"分离：
 *    - decimalValue：真实数值（DecimalClass），受控/非受控双模式；
 *    - inputValue：输入框展示文本，经 parser（解析）/ formatter（格式化）转换；
 * 3. 输入合法性：用户输入实时解析（mergedParser），合法才进数值层
 *    （triggerValueUpdate），并做 min/max 范围钳制与 precision 归一化；
 * 4. 步进三入口统一走 onInternalStep：按钮（StepHandler）、键盘（↑/↓，
 *    Shift 十倍）、滚轮（changeOnWheel，累积距离达到阈值才步进）；
 * 5. 交互细节：composition 输入法保护、formatter 时的光标恢复（useCursor）、
 *    中文句号"。"自动转小数点、失焦 flush 归一化。
 */

import type { DecimalClass, InputFocusOptions, ValueType } from '../util';

import { computed, defineComponent, shallowRef, watch, watchEffect } from 'vue';

import { clsx, omit } from '@arvin-studio/kit';

import { KeyCodeStr, triggerFocus } from '../util';
import getMiniDecimal, {
  getNumberPrecision,
  num2str,
  toFixed,
  validateNumber,
} from '../util/mini-decimal';
import useCursor from './hooks/useCursor';
import useFrame from './hooks/useFrame';
import StepHandler from './StepHandler';
import { getDecupleSteps } from './utils/numberUtil';

/** Accumulated wheel distance that adds up to a single step. */
/** 滚轮累积滚动距离达到该值才步进一次（高精度触控板每次滚动只有几像素） */
const WHEEL_STEP_DISTANCE = 100;
const WHEEL_LINE_HEIGHT = 40;
const WHEEL_PAGE_HEIGHT = 800;
/** Idle gap after which a new wheel gesture starts from scratch. */
/** 两次滚轮事件间隔超过该值视为新手势，累积距离清零 */
const WHEEL_DELTA_RESET_INTERVAL = 200;

/** Normalize `deltaY` to pixels — browsers may report it in lines or pages. */
/** 把 deltaY 归一化为像素：deltaMode 0=像素、1=行、2=页 */
function getWheelDeltaY(event: WheelEvent) {
  switch (event.deltaMode) {
    case 1: {
      return event.deltaY * WHEEL_LINE_HEIGHT;
    }
    case 2: {
      return event.deltaY * WHEEL_PAGE_HEIGHT;
    }
    default: {
      return event.deltaY;
    }
  }
}

/** 语义化类名/样式的部件名 */
type SemanticName =
  | 'action'
  | 'actions'
  | 'input'
  | 'prefix'
  | 'root'
  | 'suffix';

export interface InputNumberProps<T extends ValueType = ValueType> {
  /** 失焦时是否 flush 归一化（默认 true） */
  changeOnBlur?: boolean;
  /** 聚焦时是否支持滚轮步进，默认 false */
  changeOnWheel?: boolean;
  class?: any;
  className?: string;
  /** 语义化类名：root/actions/input/action/prefix/suffix */
  classNames?: Partial<Record<SemanticName, string>>;
  /** 是否显示步进按钮，默认 true */
  controls?: boolean;
  /** 小数分隔符（如 '，'），显示与解析时与 '.' 互换 */
  decimalSeparator?: string;
  defaultValue?: T;
  disabled?: boolean;
  /** 自定义下步进按钮（插槽 downHandler 优先） */
  downHandler?: any;
  /** 格式化器：把数值格式化为展示文本（接收 userTyping 标记） */
  formatter?: (
    value: T | undefined,
    info: { input: string; userTyping: boolean },
  ) => string;
  /** 是否启用键盘步进（↑/↓ 方向键），默认 true */
  keyboard?: boolean;
  /** 最大值 */
  max?: T;
  /** 最小值（超出钳制） */
  min?: T;
  /** 显示模式：input（默认，右侧上下按钮）/ spinner（左右两侧单按钮） */
  mode?: 'input' | 'spinner';
  onBeforeInput?: (event: InputEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  /** 数值变化回调（合法数值或 null） */
  onChange?: (value: null | T) => void;
  onClick?: (event: MouseEvent) => void;
  onCompositionEnd?: (event: CompositionEvent) => void;
  onCompositionStart?: (event: CompositionEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  /** 输入变化回调（展示文本，不保证是合法数值） */
  onInput?: (text: string) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  onMouseDown?: (event: MouseEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
  onMouseMove?: (event: MouseEvent) => void;
  onMouseOut?: (event: MouseEvent) => void;
  onMouseUp?: (event: MouseEvent) => void;
  onPressEnter?: (e: KeyboardEvent) => void;
  /** 步进回调（emitter 区分来源：按钮/键盘/滚轮） */
  onStep?: (
    value: T,
    info: {
      emitter: 'handler' | 'keyboard' | 'wheel';
      offset: ValueType;
      type: 'down' | 'up';
    },
  ) => void;
  /** 解析器：把展示文本解析为数值（缺省：去非法字符 + 小数分隔符转换） */
  parser?: (displayValue: string | undefined) => T;
  placeholder?: string;
  /** 小数精度（缺省取输入值/step 的最大精度） */
  precision?: number;
  /** 前缀内容 */
  prefix?: any;
  prefixCls?: string;
  readOnly?: boolean;
  /** 步进值（默认 1；Shift 操作时为 10 倍） */
  step?: ValueType;
  /** 字符串模式：数值以字符串传递（大数精度时用），默认 false */
  stringMode?: boolean;
  style?: any;
  styles?: Partial<Record<SemanticName, any>>;
  /** 后缀内容 */
  suffix?: any;
  tabIndex?: number;
  /** 自定义上步进按钮（插槽 upHandler 优先） */
  upHandler?: any;
  value?: null | T;
}

/** 对外暴露的实例（同时兼容原生 input 的属性访问） */
export interface InputNumberRef extends HTMLInputElement {
  blur: () => void;
  focus: (options?: InputFocusOptions) => void;
  input: HTMLInputElement | null;
  nativeElement: HTMLElement | null;
}

/** 默认 props */
const defaults: InputNumberProps = {
  prefixCls: 'headless-input-number',
  step: 1,
  controls: true,
  changeOnWheel: false,
  mode: 'input',
  stringMode: false,
};

/** 数值层 → 对外值：stringMode 或空值时返回字符串，否则返回 number */
function getDecimalValue(
  stringMode: boolean | undefined,
  decimalValue: DecimalClass,
) {
  if (stringMode || decimalValue.isEmpty()) {
    return decimalValue.toString();
  }

  return decimalValue.toNumber();
}

/** 构造十进制数；非法值（NaN/Infinity 等）返回 null */
function getDecimalIfValidate(value: ValueType) {
  const decimal = getMiniDecimal(value);
  return decimal.isInvalidate() ? null : decimal;
}

const InputNumber = defineComponent<InputNumberProps>(
  (props = defaults, { attrs, slots, expose, emit }) => {
    const focus = shallowRef(false);
    // 用户是否正在输入（决定 formatter/parser 是否生效）
    const userTypingRef = shallowRef(false);
    // 输入法组合中
    const compositionRef = shallowRef(false);
    // Shift 是否按下（步进 10 倍）
    const shiftKeyRef = shallowRef(false);

    const rootRef = shallowRef<HTMLDivElement>();
    const inputRef = shallowRef<HTMLInputElement>();

    // 对外暴露标准实例方法
    expose({
      focus: (option?: InputFocusOptions) => {
        if (inputRef.value) {
          triggerFocus(inputRef.value, option);
        }
      },
      blur: () => {
        inputRef.value?.blur?.();
      },
      nativeElement: computed(() => rootRef.value || inputRef.value || null),
      input: inputRef,
    });

    // ============================ Value =============================
    // 数值层：受控（props.value）优先，缺省 defaultValue，再缺省空
    const decimalValue = shallowRef<DecimalClass>(
      getMiniDecimal((props.value ?? props.defaultValue ?? '') as any),
    );

    // 非受控模式才回写数值层（受控时由外部 value 驱动）
    const setUncontrolledDecimalValue = (newDecimal: DecimalClass) => {
      if (props.value === undefined) {
        decimalValue.value = newDecimal;
      }
    };

    // ====================== Parser & Formatter ======================
    /** 计算展示精度：输入中不处理；显式 precision 优先；否则取输入值与 step 的最大精度 */
    const getPrecision = (numStr: string, userTyping: boolean) => {
      if (userTyping) {
        return undefined;
      }

      if (props.precision !== undefined && props.precision >= 0) {
        return props.precision;
      }

      return Math.max(
        getNumberPrecision(numStr),
        getNumberPrecision(props.step ?? 1),
      );
    };

    /** 解析器：展示文本 → 数值字符串（自定义 parser 优先；缺省去非法字符 + 分隔符替换） */
    const mergedParser = (num: number | string) => {
      const numStr = String(num);

      if (props.parser) {
        return props.parser(numStr);
      }

      let parsedStr = numStr;
      if (props.decimalSeparator) {
        parsedStr = parsedStr.replace(props.decimalSeparator, '.');
      }

      // 只保留数字、字母、正负号、小数点（\w 含数字字母下划线）
      return parsedStr.replaceAll(/[^\w.-]+/g, '');
    };

    // 展示层：输入框当前文本（含用户输入中的非法中间态）
    const inputValue = shallowRef<number | string>('');
    // 同步副本（供 formatter 读取"用户此刻看到的文本"）
    const inputValueRef = shallowRef<number | string>('');

    /** 格式化器：数值字符串 → 展示文本（自定义 formatter 优先；缺省做精度归一化） */
    const mergedFormatter = (number: string, userTyping: boolean) => {
      if (props.formatter) {
        return props.formatter(number, {
          userTyping,
          input: String(inputValueRef.value),
        });
      }

      let str = typeof number === 'number' ? num2str(number) : number;

      // 非输入态：按精度 toFixed 归一化（支持自定义小数分隔符）
      if (!userTyping) {
        const mergedPrecision = getPrecision(str, userTyping);

        if (
          validateNumber(str) &&
          (props.decimalSeparator ||
            (mergedPrecision !== undefined && mergedPrecision >= 0))
        ) {
          const separatorStr = props.decimalSeparator || '.';

          str = toFixed(str, separatorStr, mergedPrecision);
        }
      }

      return str;
    };

    /** 用数值层的值初始化展示文本（首次/外部值变化时） */
    const syncInputValue = () => {
      const initValue = props.defaultValue ?? props.value;
      if (
        decimalValue.value.isInvalidate() &&
        ['number', 'string'].includes(typeof initValue as any)
      ) {
        inputValue.value = Number.isNaN(initValue as any)
          ? ''
          : (initValue as any);
      } else {
        inputValue.value = mergedFormatter(
          decimalValue.value.toString(),
          false,
        );
      }
      inputValueRef.value = inputValue.value;
    };

    syncInputValue();

    watch(inputValue, (val) => {
      inputValueRef.value = val;
    });

    /** 用数值更新展示文本（格式化后写入） */
    const setInputValue = (newValue: DecimalClass, userTyping: boolean) => {
      inputValue.value = mergedFormatter(
        newValue.isInvalidate()
          ? newValue.toString(false)
          : newValue.toString(!userTyping),
        userTyping,
      );
    };

    // >>> Max & Min limit
    // min/max 的十进制表示（非法值忽略）
    const maxDecimal = computed(() =>
      props.max === undefined ? null : getDecimalIfValidate(props.max as any),
    );
    const minDecimal = computed(() =>
      props.min === undefined ? null : getDecimalIfValidate(props.min as any),
    );

    // 上/下步进是否被边界禁用
    const upDisabled = computed(() => {
      if (
        !maxDecimal.value ||
        !decimalValue.value ||
        decimalValue.value.isInvalidate()
      ) {
        return false;
      }

      return maxDecimal.value.lessEquals(decimalValue.value);
    });

    const downDisabled = computed(() => {
      if (
        !minDecimal.value ||
        !decimalValue.value ||
        decimalValue.value.isInvalidate()
      ) {
        return false;
      }

      return decimalValue.value.lessEquals(minDecimal.value);
    });

    // Cursor controller
    // 光标记录/恢复（formatter 改写文本后保持光标位置）
    const recordCursorRef = shallowRef<() => void>(() => {});
    const restoreCursorRef = shallowRef<() => void>(() => {});
    watchEffect(() => {
      if (!inputRef.value) {
        return;
      }

      const [record, restore] = useCursor(inputRef.value, focus.value);
      recordCursorRef.value = record;
      restoreCursorRef.value = restore;
    });
    const recordCursor = () => recordCursorRef.value?.();
    const restoreCursor = () => restoreCursorRef.value?.();

    // ============================= Data =============================
    /** 取越界钳制值：超出 max 返回 max，低于 min 返回 min，否则 null */
    const getRangeValue = (target: DecimalClass) => {
      if (maxDecimal.value && !target.lessEquals(maxDecimal.value)) {
        return maxDecimal.value;
      }

      if (minDecimal.value && !minDecimal.value.lessEquals(target)) {
        return minDecimal.value;
      }

      return null;
    };

    /** 是否在范围内 */
    const isInRange = (target: DecimalClass) => !getRangeValue(target);

    /**
     * 数值更新统一入口：校验 → 钳制 → 精度归一化 → 写值 → 通知外部
     * @returns 实际生效的数值（可能被钳制/归一化）
     */
    const triggerValueUpdate = (
      newValue: DecimalClass,
      userTyping: boolean,
    ): DecimalClass => {
      let updateValue = newValue;

      // 输入中的非法/越界值：不立即钳制（等 flush），但记录是否越界
      let isRangeValidate = isInRange(updateValue) || updateValue.isEmpty();

      // 非输入态（步进/失焦 flush）：越界直接钳制
      if (!updateValue.isEmpty() && !userTyping) {
        updateValue = getRangeValue(updateValue) || updateValue;
        isRangeValidate = true;
      }

      if (!props.readOnly && !props.disabled && isRangeValidate) {
        // 精度归一化：超出精度的小数四舍五入（必要时再钳制一次）
        const numStr = updateValue.toString();
        const mergedPrecision = getPrecision(numStr, userTyping);
        if (mergedPrecision !== undefined && mergedPrecision >= 0) {
          updateValue = getMiniDecimal(toFixed(numStr, '.', mergedPrecision));

          if (!isInRange(updateValue)) {
            updateValue = getMiniDecimal(
              toFixed(numStr, '.', mergedPrecision, true),
            );
          }
        }

        // 值确实变化才通知外部
        if (!updateValue.equals(decimalValue.value)) {
          setUncontrolledDecimalValue(updateValue);
          const outValue = updateValue.isEmpty()
            ? null
            : getDecimalValue(props.stringMode, updateValue);
          emit('update:value', outValue as any);
          props.onChange?.(outValue as any);

          // 非受控：同步展示层（受控时展示层由 props.value watch 驱动）
          if (props.value === undefined) {
            setInputValue(updateValue, userTyping);
          }
        }

        return updateValue;
      }

      return decimalValue.value;
    };

    // ========================== User Input ==========================
    // 下一帧调度器（延迟处理输入）
    const onNextPromise = useFrame();

    /**
     * 输入处理：记录光标 → 更新展示文本 → 解析并触发数值更新 → 延迟处理
     * （中文句号"。"→"."）
     */
    const collectInputValue = (inputStr: string) => {
      recordCursor();

      inputValueRef.value = inputStr;
      inputValue.value = inputStr;

      // 非组合态：解析输入，合法则进入数值层
      if (!compositionRef.value) {
        const finalValue = mergedParser(inputStr);
        const finalDecimal = getMiniDecimal(finalValue as any);
        if (!finalDecimal.isNaN()) {
          triggerValueUpdate(finalDecimal, true);
        }
      }

      props.onInput?.(inputStr);

      // 延迟到下一帧：中文输入法句号"。"自动替换为"."（仅缺省 parser 时）
      onNextPromise(() => {
        const nextInputStr = props.parser
          ? inputStr
          : inputStr.replaceAll('。', '.');

        if (nextInputStr !== inputStr) {
          collectInputValue(nextInputStr);
        }
      });
    };

    // >>> Composition
    const onCompositionStart = (e: CompositionEvent) => {
      compositionRef.value = true;
      props.onCompositionStart?.(e);
    };

    const onCompositionEnd = (e: CompositionEvent) => {
      compositionRef.value = false;
      props.onCompositionEnd?.(e);

      // 组合结束：以最终值重新走输入流程（确保组合期间的值被解析）
      if (inputRef.value) {
        collectInputValue(inputRef.value.value);
      }
    };

    // >>> Input
    const onInternalInput = (e: Event) => {
      collectInputValue((e.target as HTMLInputElement).value);
    };

    // ============================= Step =============================
    /** 步进统一入口（emitter 区分来源） */
    const onInternalStep = (
      up: boolean,
      emitter: 'handler' | 'keyboard' | 'wheel',
    ) => {
      // 边界禁用
      if ((up && upDisabled.value) || (!up && downDisabled.value)) {
        return;
      }

      userTypingRef.value = false;

      // Shift 按下时步进 10 倍
      let stepDecimal = getMiniDecimal(
        shiftKeyRef.value
          ? getDecupleSteps(props.step ?? 1)
          : (props.step ?? 1),
      );
      if (!up) {
        stepDecimal = stepDecimal.negate();
      }

      // 当前值 + 步进值（空值视为 0）
      const target = (decimalValue.value || getMiniDecimal(0)).add(
        stepDecimal.toString(),
      );

      const updatedValue = triggerValueUpdate(target, false);

      // 通知 onStep（携带偏移量与来源）
      const outValue = getDecimalValue(props.stringMode, updatedValue);
      props.onStep?.(outValue as any, {
        offset: shiftKeyRef.value
          ? getDecupleSteps(props.step ?? 1)
          : (props.step ?? 1),
        type: up ? 'up' : 'down',
        emitter,
      });

      // 步进后把焦点还给输入框（点击按钮会抢走焦点）
      inputRef.value?.focus();
    };

    // ============================ Flush =============================
    /** 把展示文本"落定"为数值（失焦/回车时调用）：解析 → 钳制 → 归一化 → 重写展示 */
    const flushInputValue = (userTyping: boolean) => {
      const parsedValue = getMiniDecimal(mergedParser(inputValue.value));
      let formatValue: DecimalClass;

      // eslint-disable-next-line unicorn/prefer-minimal-ternary
      formatValue = parsedValue.isNaN()
        ? triggerValueUpdate(decimalValue.value, userTyping)
        : triggerValueUpdate(parsedValue, userTyping);

      // 受控：展示层跟随数值层；非受控：展示层写回格式化后的数值
      if (props.value !== undefined) {
        setInputValue(decimalValue.value, false);
      } else if (!formatValue.isNaN()) {
        setInputValue(formatValue, false);
      }
    };

    // 输入前标记"用户输入中"（formatter 据此不格式化，保留用户原样输入）
    const onBeforeInput = (e: InputEvent) => {
      userTypingRef.value = true;
      props.onBeforeInput?.(e);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const { key, shiftKey } = event;
      userTypingRef.value = true;

      shiftKeyRef.value = shiftKey;

      // 回车：flush 归一化 + onPressEnter
      if (key === KeyCodeStr.Enter) {
        if (!compositionRef.value) {
          userTypingRef.value = false;
        }
        flushInputValue(false);
        props.onPressEnter?.(event);
      }

      // keyboard=false 时不响应方向键步进
      if (props.keyboard === false) {
        props.onKeyDown?.(event);
        return;
      }

      // ↑/↓ 方向键步进（组合态不响应）
      if (
        !compositionRef.value &&
        ['ArrowDown', 'ArrowUp', 'Down', 'Up'].includes(key)
      ) {
        onInternalStep(key === 'Up' || key === 'ArrowUp', 'keyboard');
        event.preventDefault();
      }

      props.onKeyDown?.(event);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      userTypingRef.value = false;
      shiftKeyRef.value = false;
      props.onKeyUp?.(event);
    };

    // ============================ Wheel ============================
    // Accumulate wheel distance instead of stepping per event: high-resolution
    // trackpads emit many tiny deltas, which would otherwise race the value.
    // 滚轮步进：累积距离而非每次事件步进——高精度触控板会发出大量微小 delta，
    // 若每次事件都步进会导致数值狂跳
    let wheelDelta = 0;
    let wheelTimestamp = 0;

    const resetWheel = () => {
      wheelDelta = 0;
      wheelTimestamp = 0;
    };

    const onInternalWheel = (event: WheelEvent) => {
      const delta = getWheelDeltaY(event);
      if (!delta) {
        return;
      }

      // 间隔过久 → 视为新手势，从零累积
      const eventTimestamp = event.timeStamp || Date.now();
      if (eventTimestamp - wheelTimestamp > WHEEL_DELTA_RESET_INTERVAL) {
        wheelDelta = 0;
      }
      wheelTimestamp = eventTimestamp;

      // Reversing direction mid-gesture should not be damped by leftover travel.
      // 中途反向滚动：清掉残留距离，避免被旧方向的累积拖累
      if (wheelDelta && Math.sign(wheelDelta) !== Math.sign(delta)) {
        wheelDelta = 0;
      }

      wheelDelta += delta;

      // 达到步进阈值 → 步进一次，并扣除已消耗的距离
      if (Math.abs(wheelDelta) >= WHEEL_STEP_DISTANCE) {
        // moving mouse wheel rises wheel event with deltaY < 0
        // scroll value grows from top to bottom, as screen Y coordinate
        // 向上滚 deltaY < 0 → up
        onInternalStep(wheelDelta < 0, 'wheel');
        wheelDelta -= Math.sign(wheelDelta) * WHEEL_STEP_DISTANCE;
      }
    };

    // changeOnWheel 且聚焦时给 input 挂滚轮监听（passive: false 才能 preventDefault）
    watchEffect((onCleanup) => {
      if (!(props.changeOnWheel && focus.value && inputRef.value)) {
        return;
      }

      const onWheel = (event: WheelEvent) => {
        onInternalWheel(event);
        event.preventDefault();
      };
      inputRef.value.addEventListener('wheel', onWheel, { passive: false });
      onCleanup(() => {
        inputRef.value?.removeEventListener('wheel', onWheel);
        resetWheel();
      });
    });

    // >>> Focus & Blur
    const onBlur = (e: FocusEvent) => {
      // 失焦 flush：把输入中的非法/未归一化文本落定为数值
      if (props.changeOnBlur ?? true) {
        flushInputValue(false);
      }

      focus.value = false;
      userTypingRef.value = false;
      resetWheel();
      props.onBlur?.(e);
    };

    const onFocus = (e: FocusEvent) => {
      focus.value = true;
      props.onFocus?.(e);
    };

    // >>> Mouse events
    // 点击根容器（非 input 区域，如按钮/前缀）时聚焦 input 并阻止默认（避免抢焦点闪烁）
    const onInternalMouseDown = (event: MouseEvent) => {
      if (inputRef.value && event.target !== inputRef.value) {
        inputRef.value.focus();
        event.preventDefault();
      }

      props.onMouseDown?.(event);
    };

    // ========================== Controlled ==========================
    // precision/formatter/decimalSeparator 变化：重算展示层
    watch(
      [
        () => props.precision,
        () => props.formatter,
        () => props.decimalSeparator,
      ],
      () => {
        if (!decimalValue.value.isInvalidate()) {
          setInputValue(decimalValue.value, false);
        }
      },
    );

    // 受控 value 变化：同步数值层与展示层（用户输入中且无 formatter 时保留输入文本）
    watch(
      () => props.value,
      (newVal) => {
        const newValue = getMiniDecimal((newVal ?? '') as any);
        decimalValue.value = newValue;
        const currentParsedValue = getMiniDecimal(
          mergedParser(inputValue.value),
        );

        if (
          !newValue.equals(currentParsedValue) ||
          !userTypingRef.value ||
          props.formatter
        ) {
          setInputValue(newValue, userTypingRef.value);
        }
      },
    );

    // ============================ Cursor ============================
    // 展示文本变化时恢复光标（仅 formatter 场景，因为 formatter 会改写文本）
    watch(
      () => inputValue.value,
      () => {
        if (props.formatter) {
          restoreCursor();
        }
      },
      {
        flush: 'post',
      },
    );

    return () => {
      const {
        prefixCls = defaults.prefixCls,
        classNames,
        styles,
        step = defaults.step,
        disabled,
        readOnly,
        controls = defaults.controls,
        mode = defaults.mode,
        placeholder,
      } = props;

      const mergedPrefixCls = prefixCls || defaults.prefixCls!;

      // attrs 拆分：class/style 手动合并，其余透传
      const { class: className, style, ...restAttrs } = attrs;
      const mergedClassName = props.className || (className as any);
      const mergedStyle = {
        ...styles?.root,
        ...(props.style as any),
        ...(style as any),
      };

      // 插槽优先，props 兜底
      const prefixNode = slots.prefix?.() ?? props.prefix;
      const suffixNode = slots.suffix?.() ?? props.suffix;
      const upNode = slots.upHandler?.() ?? props.upHandler;
      const downNode = slots.downHandler?.() ?? props.downHandler;

      const upHandlerNode = (
        <StepHandler
          action="up"
          className={classNames?.action}
          disabled={upDisabled.value}
          onStep={onInternalStep}
          prefixCls={mergedPrefixCls}
          style={styles?.action}
        >
          {upNode}
        </StepHandler>
      );

      const downHandlerNode = (
        <StepHandler
          action="down"
          className={classNames?.action}
          disabled={downDisabled.value}
          onStep={onInternalStep}
          prefixCls={mergedPrefixCls}
          style={styles?.action}
        >
          {downNode}
        </StepHandler>
      );

      // 本组件消费的 props 不再透传给原生 input
      const inputAttrs = omit(
        {
          ...restAttrs,
        },
        [
          'prefixCls',
          'classNames',
          'styles',
          'defaultValue',
          'value',
          'prefix',
          'suffix',
          'upHandler',
          'downHandler',
          'keyboard',
          'changeOnWheel',
          'controls',
          'mode',
          'parser',
          'formatter',
          'precision',
          'decimalSeparator',
          'onChange',
          'onInput',
          'onPressEnter',
          'onStep',
          'changeOnBlur',
          'class',
          'style',
          'onMouseDown',
          'onClick',
          'onMouseUp',
          'onMouseLeave',
          'onMouseMove',
          'onMouseEnter',
          'onMouseOut',
          'onFocus',
          'onBlur',
          'onKeyDown',
          'onKeyUp',
          'onCompositionStart',
          'onCompositionEnd',
          'onBeforeInput',
        ],
      );

      return (
        <div
          class={clsx(
            mergedPrefixCls,
            `${mergedPrefixCls}-mode-${mode}`,
            mergedClassName,
            classNames?.root,
            {
              [`${mergedPrefixCls}-focused`]: focus.value,
              [`${mergedPrefixCls}-disabled`]: disabled,
              [`${mergedPrefixCls}-readonly`]: readOnly,
              [`${mergedPrefixCls}-not-a-number`]: decimalValue.value.isNaN(),
              [`${mergedPrefixCls}-out-of-range`]:
                !decimalValue.value.isInvalidate() &&
                !isInRange(decimalValue.value),
            },
          )}
          onClick={(e: MouseEvent) => {
            props.onClick?.(e);
          }}
          onMousedown={onInternalMouseDown}
          onMouseenter={(e: MouseEvent) => {
            props.onMouseEnter?.(e);
          }}
          onMouseleave={(e: MouseEvent) => {
            props.onMouseLeave?.(e);
          }}
          onMousemove={(e: MouseEvent) => {
            props.onMouseMove?.(e);
          }}
          onMouseout={(e: MouseEvent) => {
            props.onMouseOut?.(e);
          }}
          onMouseup={(e: MouseEvent) => {
            props.onMouseUp?.(e);
          }}
          ref={rootRef}
          style={mergedStyle}
        >
          {/* spinner 模式：下按钮在左 */}
          {mode === 'spinner' && controls && downHandlerNode}

          {!!prefixNode && (
            <div
              class={clsx(`${mergedPrefixCls}-prefix`, classNames?.prefix)}
              style={styles?.prefix}
            >
              {prefixNode}
            </div>
          )}

          {/* 原生 input：role=spinbutton + aria 无障碍属性 */}
          <input
            aria-valuemax={props.max as any}
            aria-valuemin={props.min as any}
            aria-valuenow={
              decimalValue.value.isInvalidate()
                ? null
                : (decimalValue.value.toString() as any)
            }
            autocomplete="off"
            class={clsx(`${mergedPrefixCls}-input`, classNames?.input)}
            disabled={disabled}
            onBeforeinput={onBeforeInput}
            onBlur={onBlur}
            onCompositionend={onCompositionEnd}
            onCompositionstart={onCompositionStart}
            onFocus={onFocus}
            onInput={onInternalInput}
            onKeydown={onKeyDown}
            onKeyup={onKeyUp}
            placeholder={placeholder}
            readonly={readOnly}
            ref={inputRef}
            role="spinbutton"
            step={step as any}
            style={styles?.input}
            value={inputValue.value}
            {...(inputAttrs as any)}
          />

          {!!suffixNode && (
            <div
              class={clsx(`${mergedPrefixCls}-suffix`, classNames?.suffix)}
              style={styles?.suffix}
            >
              {suffixNode}
            </div>
          )}

          {/* spinner 模式：上按钮在右 */}
          {mode === 'spinner' && controls && upHandlerNode}

          {/* input 模式：上下按钮合并为右侧 actions 区 */}
          {mode === 'input' && controls && (
            <div
              class={clsx(`${mergedPrefixCls}-actions`, classNames?.actions)}
              style={styles?.actions}
            >
              {upHandlerNode}
              {downHandlerNode}
            </div>
          )}
        </div>
      );
    };
  },
  {
    name: 'InputNumber',
    inheritAttrs: false,
    emits: ['update:value'],
  },
);

export default InputNumber;
