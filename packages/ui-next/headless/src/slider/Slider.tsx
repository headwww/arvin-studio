import type { CSSProperties, Ref } from 'vue';

import type { HandlesRef } from './Handles';
import type {
  AriaValueFormat,
  Direction,
  OnStartMove,
  SliderClassNames,
  SliderStyles,
} from './interface';
import type { InternalMarkObj, MarkObj } from './Marks';

import {
  computed,
  defineComponent,
  isVNode,
  ref,
  shallowRef,
  watch,
} from 'vue';

import { clsx } from '@arvin-studio/kit';

import { warning } from '../util';
import isEqual from '../util/isEqual';
import { useProviderSliderContext } from './context';
import Handles from './Handles';
import useDisabled from './hooks/useDisabled';
import useDrag from './hooks/useDrag';
import useOffset, { getClosestEnabledHandleIndex } from './hooks/useOffset';
import useRange from './hooks/useRange';
import Marks from './Marks';
import Steps from './Steps';
import Tracks from './Tracks';

export interface RangeConfig {
  draggableTrack?: boolean;
  editable?: boolean;
  /** Set max count when `editable` */
  maxCount?: number;
  /** Set min count when `editable` */
  minCount?: number;
}

export interface RenderProps {
  dragging: boolean;
  draggingDelete: boolean;
  index: null | number;
  node: any;
  prefixCls: string;
  value: number;
}

type ValueType = number | number[];

export interface SliderProps<Value extends ValueType = ValueType> {
  activeDotStyle?: ((dotValue: number) => CSSProperties) | CSSProperties;
  activeHandleRender?: (props: RenderProps) => any;
  // Cross
  allowCross?: boolean;

  ariaLabelForHandle?: string | string[];
  ariaLabelledByForHandle?: string | string[];

  ariaRequired?: boolean;

  ariaValueTextFormatterForHandle?: AriaValueFormat | AriaValueFormat[];
  autoFocus?: boolean;
  className?: string;
  classNames?: SliderClassNames;
  /** @deprecated Use `range.minCount` or `range.maxCount` to handle this */
  count?: number;

  defaultValue?: null | Value;
  // Status
  /**
   * `boolean` disables the whole slider (legacy). `boolean[]` disables a
   * specific handle by index (rc-slider#1069); missing entries are treated
   * as `false`. Disabled handles act as fixed anchors enabled handles
   * cannot cross or push past.
   */
  disabled?: boolean | boolean[];
  dots?: boolean;
  dotStyle?: ((dotValue: number) => CSSProperties) | CSSProperties;
  // Components
  handleRender?: (props: RenderProps) => any;
  /** @deprecated Please use `styles.handle` instead */
  handleStyle?: CSSProperties | CSSProperties[];
  id?: string;
  // Style
  included?: boolean;
  keyboard?: boolean;
  // Decorations
  marks?: Record<number | string, any | MarkObj>;
  max?: number;

  min?: number;
  /** @deprecated Use `onChangeComplete` instead */
  onAfterChange?: (value: Value) => void;

  /** @deprecated It's always better to use `onChange` instead */
  onBeforeChange?: (value: Value) => void;
  onBlur?: (e: FocusEvent) => void;

  onChange?: (value: Value) => void;
  onChangeComplete?: (value: Value) => void;
  onFocus?: (e: FocusEvent) => void;
  prefixCls?: string;
  pushable?: boolean | number;
  /** @deprecated Please use `styles.rail` instead */
  railStyle?: CSSProperties;
  // Value
  range?: boolean | RangeConfig;

  // Direction
  reverse?: boolean;
  startPoint?: number;

  step?: null | number;
  style?: CSSProperties;
  styles?: SliderStyles;

  // Accessibility
  tabIndex?: number | number[];
  track?: boolean;
  /** @deprecated Please use `styles.track` instead */
  trackStyle?: CSSProperties | CSSProperties[];
  value?: null | Value;
  vertical?: boolean;
}

export interface SliderRef {
  blur: () => void;
  focus: () => void;
}

const sliderDefaults: SliderProps = {
  prefixCls: 'vc-slider',
  keyboard: true,
  disabled: false,
  min: 0,
  max: 100,
  step: 1,
  allowCross: true,
  pushable: false,
  included: true,
  tabIndex: 0,
  track: true,
};

const Slider = defineComponent<SliderProps>(
  (props = sliderDefaults, { attrs, slots, emit, expose }) => {
    const prefixCls = computed(
      () => props.prefixCls ?? sliderDefaults.prefixCls!,
    );
    // rc-slider#1069: `disabled` is now `boolean | boolean[]`. `useDisabled`
    // gives us a stable per-handle lookup plus a `getDisabledState` derived
    // from the current value list (set further below).
    const rawDisabled = computed(
      () => props.disabled ?? sliderDefaults.disabled!,
    );
    const { isHandleDisabled, getDisabledState } = useDisabled(rawDisabled);
    const keyboard = computed(() => props.keyboard ?? sliderDefaults.keyboard!);
    const included = computed(() => props.included ?? sliderDefaults.included!);
    const tabIndex = computed(() => props.tabIndex ?? sliderDefaults.tabIndex!);
    const allowCross = computed(
      () => props.allowCross ?? sliderDefaults.allowCross!,
    );

    const direction = computed<Direction>(() => {
      if (props.vertical) {
        return props.reverse ? 'ttb' : 'btt';
      }
      return props.reverse ? 'rtl' : 'ltr';
    });

    // ============================ Range =============================
    const rangeConfig = computed(() => {
      const [
        rangeEnabled,
        rangeEditable,
        rangeDraggableTrack,
        minCount,
        maxCount,
      ] = useRange(props.range);
      return {
        rangeEnabled,
        rangeEditable,
        rangeDraggableTrack,
        minCount,
        maxCount,
      };
    });
    const rangeEnabled = computed(() => rangeConfig.value.rangeEnabled);
    const rangeEditable = computed(() => rangeConfig.value.rangeEditable);
    const rangeDraggableTrack = computed(
      () => rangeConfig.value.rangeDraggableTrack,
    );
    const minCount = computed(() => rangeConfig.value.minCount ?? 0);
    const maxCount = computed(() => rangeConfig.value.maxCount);

    const mergedMin = computed(() =>
      Number.isFinite(props.min ?? 0) ? (props.min ?? 0) : 0,
    );
    const mergedMax = computed(() =>
      Number.isFinite(props.max ?? 100) ? (props.max ?? 100) : 100,
    );

    // ============================= Step =============================
    const mergedStep = computed<null | number>(() => {
      const step = props.step ?? sliderDefaults.step!;
      if (step !== null && step <= 0) {
        return 1;
      }
      return step;
    });

    // ============================= Push =============================
    const mergedPush = computed<false | null | number>(() => {
      const pushable = props.pushable ?? sliderDefaults.pushable!;
      if (typeof pushable === 'boolean') {
        return pushable ? mergedStep.value : false;
      }
      return pushable >= 0 ? pushable : false;
    });

    // ============================ Marks =============================
    const markList = computed<InternalMarkObj[]>(() => {
      return Object.keys(props.marks || {})
        .map<InternalMarkObj>((key) => {
          const mark = props.marks?.[key];
          const markObj: InternalMarkObj = {
            value: Number(key),
          };

          if (
            mark &&
            typeof mark === 'object' &&
            !isVNode(mark) &&
            ('label' in mark || 'style' in mark)
          ) {
            markObj.style = mark.style;
            markObj.label = mark.label;
          } else {
            markObj.label = mark;
          }

          return markObj;
        })
        .filter(({ label }) => label || typeof label === 'number')
        .toSorted((a, b) => a.value - b.value);
    });

    // ============================ Format ============================
    const [formatValue, offsetValues] = useOffset(
      mergedMin,
      mergedMax,
      mergedStep,
      markList,
      allowCross,
      mergedPush,
      isHandleDisabled,
    );
    const formatValueRef = computed(() => formatValue);
    const offsetValuesRef = computed(() => offsetValues);

    // ============================ Values ============================
    const mergedValue = shallowRef<null | undefined | ValueType>(
      props.value === undefined ? props.defaultValue : props.value,
    );

    watch(
      () => props.value,
      (val) => {
        if (val !== undefined) {
          mergedValue.value = val;
        }
      },
    );

    const rawValues = computed<number[]>(() => {
      const valueList =
        mergedValue.value === null || mergedValue.value === undefined
          ? []
          : Array.isArray(mergedValue.value)
            ? mergedValue.value
            : [mergedValue.value];

      const [val0 = mergedMin.value] = valueList;
      let returnValues: number[] = mergedValue.value === null ? [] : [val0];

      // Format as range
      if (rangeEnabled.value) {
        returnValues = [...valueList];

        // When count provided or value is `undefined`, we fill values
        if (
          typeof props.count === 'number' ||
          mergedValue.value === undefined
        ) {
          const pointCount =
            typeof props.count === 'number' && props.count >= 0
              ? props.count + 1
              : 2;
          returnValues = returnValues.slice(0, pointCount);

          // Fill with count
          while (returnValues.length < pointCount) {
            returnValues.push(
              returnValues[returnValues.length - 1] ?? mergedMin.value,
            );
          }
        }
        returnValues.sort((a, b) => a - b);
      }

      // Align in range
      returnValues.forEach((val, index) => {
        returnValues[index] = formatValue(val);
      });

      return returnValues;
    });

    // =========================== onChange ===========================
    const handlesRef = ref<HandlesRef>();
    const containerRef = ref<HTMLDivElement>();

    const getTriggerValue = (triggerValues: number[]): ValueType =>
      (rangeEnabled.value ? triggerValues : triggerValues[0]) as ValueType;

    const triggerChange = (nextValues: number[]) => {
      const cloneNextValues = [...nextValues].toSorted((a, b) => a - b);

      if (!isEqual(cloneNextValues, rawValues.value, true)) {
        const triggerValue = getTriggerValue(cloneNextValues);
        emit('change', triggerValue);
        props.onChange?.(triggerValue);
      }

      mergedValue.value = cloneNextValues as ValueType;
    };

    const finishChange = (draggingDelete?: boolean) => {
      if (draggingDelete) {
        handlesRef.value?.hideHelp();
      }

      const finishValue = getTriggerValue(rawValues.value);
      emit('afterChange', finishValue);
      props.onAfterChange?.(finishValue);
      warning(
        !props.onAfterChange,
        '[vc-slider] `onAfterChange` is deprecated. Please use `onChangeComplete` instead.',
      );
      emit('changeComplete', finishValue);
      props.onChangeComplete?.(finishValue);
    };

    // rc-slider#1069: derive whole-slider `disabled` and `hasDisabledHandle` from
    // the per-handle map. When any handle is disabled, range edit / delete are
    // suppressed because we can't keep boundary semantics straight under those
    // operations.
    const disabledState = computed(() => getDisabledState(rawValues.value));
    const disabled = computed(() => disabledState.value[0]);
    const hasDisabledHandle = computed(() => disabledState.value[1]);
    const effectiveRangeEditable = computed(
      () => rangeEditable.value && !hasDisabledHandle.value,
    );

    const onDelete = (index: number) => {
      if (
        disabled.value ||
        !effectiveRangeEditable.value ||
        rawValues.value.length <= minCount.value
      ) {
        return;
      }

      const cloneNextValues = [...rawValues.value];
      cloneNextValues.splice(index, 1);

      const triggerValue = getTriggerValue(cloneNextValues);
      emit('beforeChange', triggerValue);
      props.onBeforeChange?.(triggerValue);
      triggerChange(cloneNextValues);

      const nextFocusIndex = Math.max(0, index - 1);
      handlesRef.value?.hideHelp();
      handlesRef.value?.focus(nextFocusIndex);
    };

    const [
      draggingIndex,
      draggingValue,
      draggingDelete,
      cacheValues,
      onStartDrag,
    ] = useDrag(
      containerRef as unknown as Ref<HTMLDivElement>,
      direction,
      rawValues,
      mergedMin,
      mergedMax,
      formatValueRef,
      triggerChange,
      finishChange,
      offsetValuesRef,
      effectiveRangeEditable,
      minCount,
      isHandleDisabled,
    );

    /**
     * When `rangeEditable` will insert a new value in the values array.
     * Else it will replace the value in the values array.
     */
    const changeToCloseValue = (newValue: number, e?: MouseEvent) => {
      if (disabled.value) {
        return;
      }

      // rc-slider#1069: when the click target falls into a segment fenced off
      // by disabled handles (with no enabled handle reachable), bail instead
      // of forcing an enabled handle to a boundary value.
      const valueIndex =
        rawValues.value.length > 0
          ? getClosestEnabledHandleIndex(
              rawValues.value,
              newValue,
              mergedMin.value,
              mergedMax.value,
              mergedPush.value,
              isHandleDisabled,
            )
          : 0;

      if (valueIndex === -1) {
        return;
      }

      const cloneNextValues = [...rawValues.value];

      let valueBeforeIndex = 0;
      const valueDist =
        rawValues.value.length > 0
          ? Math.abs(newValue - rawValues.value[valueIndex]!)
          : mergedMax.value - mergedMin.value;

      rawValues.value.forEach((val, index) => {
        if (val < newValue) {
          valueBeforeIndex = index;
        }
      });

      // eslint-disable-next-line no-useless-assignment
      let focusIndex = valueIndex;

      if (
        effectiveRangeEditable.value &&
        valueDist !== 0 &&
        (!maxCount.value || rawValues.value.length < maxCount.value)
      ) {
        cloneNextValues.splice(valueBeforeIndex + 1, 0, newValue);
        focusIndex = valueBeforeIndex + 1;
      } else {
        cloneNextValues[valueIndex] = newValue;
        focusIndex = valueIndex;
      }

      if (
        rangeEnabled.value &&
        rawValues.value.length === 0 &&
        props.count === undefined
      ) {
        cloneNextValues.push(newValue);
      }

      const nextValue = getTriggerValue(cloneNextValues);
      // emit('beforeChange', nextValue)
      props.onBeforeChange?.(nextValue);
      triggerChange(cloneNextValues);

      if (e) {
        (document.activeElement as HTMLElement)?.blur?.();
        handlesRef.value?.focus(focusIndex);
        onStartDrag(e, focusIndex, cloneNextValues);
      } else {
        // emit('afterChange', nextValue)
        props.onAfterChange?.(nextValue);
        warning(
          !props.onAfterChange,
          '[vc-slider] `onAfterChange` is deprecated. Please use `onChangeComplete` instead.',
        );
        emit('changeComplete', nextValue);
        props.onChangeComplete?.(nextValue);
      }
    };

    // ============================ Click =============================
    const onSliderMouseDown = (e: MouseEvent) => {
      e.preventDefault();

      const rect = containerRef.value?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const { width, height, left, top, bottom, right } = rect;
      const { clientX, clientY } = e;

      let percent: number;
      switch (direction.value) {
        case 'btt': {
          percent = (bottom - clientY) / height;
          break;
        }

        case 'rtl': {
          percent = (right - clientX) / width;
          break;
        }

        case 'ttb': {
          percent = (clientY - top) / height;
          break;
        }

        default: {
          percent = (clientX - left) / width;
        }
      }

      const nextValue =
        mergedMin.value + percent * (mergedMax.value - mergedMin.value);
      changeToCloseValue(formatValue(nextValue), e);
    };

    // =========================== Keyboard ===========================
    // rc-slider#1069: remember the offset target's handle index so the focus
    // re-target after re-render finds the right slot even when the value list
    // shifts past it.
    const keyboardValue = shallowRef<null | { index: number; value: number }>(
      null,
    );

    const onHandleOffsetChange = (
      offset: 'max' | 'min' | number,
      valueIndex: number,
    ) => {
      if (disabled.value || isHandleDisabled(valueIndex)) {
        return;
      }

      const next = offsetValues(rawValues.value, offset, valueIndex);

      const currentValue = getTriggerValue(rawValues.value);
      emit('beforeChange', currentValue);
      props.onBeforeChange?.(currentValue);
      triggerChange(next.values);

      keyboardValue.value = { value: next.value, index: valueIndex };
    };

    watch(keyboardValue, (val) => {
      if (val !== null) {
        const valueIndex =
          rawValues.value[val.index] === val.value
            ? val.index
            : rawValues.value.indexOf(val.value);
        if (valueIndex >= 0) {
          handlesRef.value?.focus(valueIndex);
        }
      }

      keyboardValue.value = null;
    });

    // ============================= Drag =============================
    const mergedDraggableTrack = computed(() => {
      if (rangeDraggableTrack.value && mergedStep.value === null) {
        return false;
      }
      return rangeDraggableTrack.value;
    });

    const onStartMove: OnStartMove = (e, valueIndex) => {
      onStartDrag(e, valueIndex);
      const triggerValue = getTriggerValue(rawValues.value);
      emit('beforeChange', triggerValue);
      props.onBeforeChange?.(triggerValue);
    };

    // Auto focus for updated handle
    const dragging = computed(() => draggingIndex.value !== -1);
    watch(dragging, (isDragging) => {
      if (
        isDragging ||
        draggingValue.value === null ||
        draggingValue.value === undefined
      ) {
        return;
      }

      const valueIndex = rawValues.value.lastIndexOf(draggingValue.value);
      if (valueIndex !== -1) {
        handlesRef.value?.focus(valueIndex);
      }
    });

    // =========================== Included ===========================
    const sortedCacheValues = computed(() =>
      [...cacheValues.value].toSorted((a, b) => a - b),
    );
    const includedRange = computed<[number, number]>(() => {
      if (!rangeEnabled.value) {
        return [mergedMin.value, sortedCacheValues.value[0] ?? mergedMin.value];
      }
      if (sortedCacheValues.value.length === 0) {
        return [mergedMin.value, mergedMin.value];
      }
      return [
        sortedCacheValues.value[0],
        sortedCacheValues.value[sortedCacheValues.value.length - 1],
      ] as any;
    });
    const includedStart = computed(() => includedRange.value[0]);
    const includedEnd = computed(() => includedRange.value[1]);

    // ============================= Refs =============================
    expose({
      focus: () => {
        handlesRef.value?.focus(0);
      },
      blur: () => {
        const { activeElement } = document;
        if (containerRef.value?.contains(activeElement)) {
          (activeElement as HTMLElement)?.blur();
        }
      },
    });

    // ========================== Auto Focus ==========================
    watch(
      () => props.autoFocus,
      (autoFocus) => {
        if (autoFocus) {
          handlesRef.value?.focus(0);
        }
      },
      { immediate: true },
    );

    // =========================== Context ============================
    useProviderSliderContext(
      computed(() => ({
        min: mergedMin.value,
        max: mergedMax.value,
        direction: direction.value,
        disabled: disabled.value,
        keyboard: keyboard.value,
        step: mergedStep.value,
        included: included.value,
        includedStart: includedStart.value,
        includedEnd: includedEnd.value,
        range: rangeEnabled.value,
        tabIndex: tabIndex.value,
        ariaLabelForHandle: props.ariaLabelForHandle,
        ariaLabelledByForHandle: props.ariaLabelledByForHandle,
        ariaRequired: props.ariaRequired,
        ariaValueTextFormatterForHandle: props.ariaValueTextFormatterForHandle,
        styles: props.styles || {},
        classNames: props.classNames || {},
        isHandleDisabled,
      })),
    );

    // ============================ Render ============================
    return () => {
      const {
        id,
        startPoint,
        trackStyle,
        handleStyle,
        railStyle,
        dotStyle,
        activeDotStyle,
        dots,
        handleRender,
        activeHandleRender,
        classNames,
        styles,
      } = props;

      const mergedClassName = clsx(
        prefixCls.value,
        props.className,
        (attrs as any).class,
        {
          [`${prefixCls.value}-disabled`]: disabled.value,
          [`${prefixCls.value}-vertical`]: props.vertical,
          [`${prefixCls.value}-horizontal`]: !props.vertical,
          [`${prefixCls.value}-with-marks`]: markList.value.length,
        },
      );

      const mergedStyle = {
        ...(props.style as CSSProperties),
        ...(attrs.style as CSSProperties),
      };

      return (
        <div
          class={mergedClassName}
          id={id}
          onMousedown={onSliderMouseDown}
          ref={containerRef}
          style={mergedStyle}
        >
          <div
            class={clsx(`${prefixCls.value}-rail`, classNames?.rail)}
            style={{ ...railStyle, ...styles?.rail }}
          />

          {props.track !== false && (
            <Tracks
              onStartMove={mergedDraggableTrack.value ? onStartMove : undefined}
              prefixCls={prefixCls.value}
              startPoint={startPoint}
              trackStyle={trackStyle}
              values={rawValues.value}
            />
          )}

          <Steps
            activeStyle={activeDotStyle}
            dots={dots}
            marks={markList.value}
            prefixCls={prefixCls.value}
            style={dotStyle}
          />

          <Handles
            activeHandleRender={activeHandleRender}
            draggingDelete={draggingDelete.value}
            draggingIndex={draggingIndex.value}
            handleRender={handleRender}
            handleStyle={handleStyle}
            onBlur={(e: FocusEvent) => {
              props.onBlur?.(e);
            }}
            onChangeComplete={finishChange}
            onDelete={effectiveRangeEditable.value ? onDelete : () => {}}
            onFocus={(e: FocusEvent) => {
              props.onFocus?.(e);
            }}
            onOffsetChange={onHandleOffsetChange}
            onStartMove={onStartMove}
            prefixCls={prefixCls.value}
            ref={handlesRef}
            values={cacheValues.value}
          />

          <Marks
            marks={markList.value}
            onClick={changeToCloseValue}
            prefixCls={prefixCls.value}
            v-slots={slots}
          />
        </div>
      );
    };
  },
);

export default Slider;
