// oxlint-disable-next-line typescript/ban-ts-comment
// @ts-nocheck
import type { VNode } from 'vue';

import type { FocusEventHandler, KeyboardEventHandler } from '../util';
import type { StarProps } from './Star';

import { computed, defineComponent, onMounted, ref } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { getAttrStyleAndClass, pickAttrs } from '../util';
import useMergedState from '../util/hooks/useMergedState';
import KeyCode from '../util/KeyCode';
import Star from './Star';
import useRefs from './useRefs';
import { getOffsetLeft } from './util';

// TODO: Import from other components
export type Direction = 'ltr' | 'rtl';

const defaults = {
  prefixCls: 'headless-rate',
  count: 5,
  allowHalf: false,
  allowClear: true,
  keyboard: true,
  character: '★',
  direction: 'ltr',
  tabIndex: 0,
} as RateProps;

export interface RateProps extends Pick<
  StarProps,
  'allowHalf' | 'character' | 'characterRender' | 'count' | 'disabled'
> {
  allowClear?: boolean;
  autoFocus?: boolean;
  defaultValue?: number;
  direction?: Direction;
  id?: string;
  keyboard?: boolean;
  onBlur?: () => void;
  onChange?: (value: number) => void;
  onFocus?: () => void;
  onHoverChange?: (value: number | undefined) => void;
  onKeyDown?: KeyboardEventHandler;
  onMouseLeave?: FocusEventHandler;
  'onUpdate:value'?: (value: number) => void;
  prefixCls?: string;
  tabIndex?: number | string;
  value?: number;
}

export default defineComponent<RateProps>(
  (props = defaults, { attrs, expose }) => {
    const [setStarRef, starRefs] = useRefs();
    const rateRef = ref<HTMLUListElement | null>(null);

    const triggerFocus = () => {
      if (!props.disabled) {
        rateRef.value!.focus();
      }
    };

    const triggerBlur = () => {
      if (!props.disabled) {
        rateRef.value!.blur();
      }
    };

    expose({
      focus: triggerFocus,
      blur: triggerBlur,
    });

    const [state, setStateValue] = useMergedState(props.defaultValue || 0, {
      value: computed(() => props.value),
    });

    const [cleanedValue, setCleanedValue] = useMergedState<null | number>(null);

    const getStarValue = (index: number, x: number) => {
      const { direction, allowHalf } = props;
      const reverse = direction === 'rtl';
      let starValue = index + 1;
      if (allowHalf) {
        const starEle = starRefs.value.get(index) as HTMLElement;
        const leftDis = getOffsetLeft(starEle);
        const width = starEle.clientWidth;
        if (reverse && x - leftDis > width / 2) {
          starValue -= 0.5;
          // eslint-disable-next-line unicorn/no-duplicate-if-branches
        } else if (!reverse && x - leftDis < width / 2) {
          starValue -= 0.5;
        }
      }
      return starValue;
    };

    const changeValue = (nextValue: number) => {
      setStateValue(nextValue);
      props?.onChange?.(nextValue);
    };

    const focused = ref(false);

    const onInternalFocus = () => {
      focused.value = true;
      props?.onFocus?.();
    };

    const onInternalBlur = () => {
      focused.value = false;
      props?.onBlur?.();
    };

    // =========================== Hover ============================
    const hoverValue = ref<null | number>(null);

    const onHover = (event: MouseEvent, index: number) => {
      const nextHoverValue = getStarValue(index, event.pageX);
      if (nextHoverValue !== cleanedValue.value) {
        hoverValue.value = nextHoverValue;
        setCleanedValue(null);
      }
      props?.onHoverChange?.(nextHoverValue);
    };

    const onMouseLeaveCallback = (event?: MouseEvent) => {
      const { disabled } = props;
      if (!disabled) {
        hoverValue.value = null;
        setCleanedValue(null);
        props?.onHoverChange?.(undefined);
      }
      if (event) {
        props?.onMouseLeave?.(event);
      }
    };

    const onClick = (event: KeyboardEvent | MouseEvent, index: number) => {
      const { allowClear } = props;
      const newValue = getStarValue(index, (event as MouseEvent).pageX);
      const isReset = allowClear ? newValue === state.value : false;
      onMouseLeaveCallback();
      changeValue(isReset ? 0 : newValue);
      setCleanedValue(isReset ? newValue : null);
    };

    const onInternalKeyDown: KeyboardEventHandler = (event) => {
      const { keyCode } = event;
      const value = state.value!;
      const { keyboard, count, direction, allowHalf } = props;
      const reverse = direction === 'rtl';
      const step = allowHalf ? 0.5 : 1;

      if (keyboard) {
        if (keyCode === KeyCode.RIGHT && value < count! && !reverse) {
          changeValue(value + step);
          event.preventDefault();
        } else if (keyCode === KeyCode.LEFT && value > 0 && !reverse) {
          changeValue(value - step);
          event.preventDefault();
          // eslint-disable-next-line unicorn/no-duplicate-if-branches
        } else if (keyCode === KeyCode.RIGHT && value > 0 && reverse) {
          changeValue(value - step);
          event.preventDefault();
        } else if (keyCode === KeyCode.LEFT && value < count! && reverse) {
          changeValue(value + step);
          event.preventDefault();
        }
      }

      props?.onKeyDown?.(event);
    };

    onMounted(() => {
      const { autoFocus, disabled } = props;
      if (autoFocus && !disabled) {
        triggerFocus();
      }
    });

    return () => {
      const {
        count,
        allowHalf,
        disabled,
        prefixCls,
        direction,
        character,
        characterRender,
        tabIndex,
        ...restProps
      } = props;
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const classString = clsx(prefixCls, className, {
        [`${prefixCls}-disabled`]: disabled,
        [`${prefixCls}-rtl`]: direction === 'rtl',
      });

      const starNodes = Array.from({ length: count! })
        // eslint-disable-next-line unicorn/no-array-from-fill
        .fill(0)
        .map((_, index) => (
          <Star
            allowHalf={allowHalf}
            character={character}
            characterRender={characterRender}
            count={count}
            disabled={disabled}
            focused={focused.value}
            index={index}
            key={index}
            onClick={onClick}
            onHover={onHover}
            prefixCls={`${prefixCls}-star`}
            ref={setStarRef(index) as () => VNode}
            value={hoverValue.value === null ? state.value : hoverValue.value}
          />
        ));

      return (
        <ul
          class={classString}
          id={restProps.id}
          onBlur={disabled ? null : onInternalBlur}
          onFocus={disabled ? null : onInternalFocus}
          onKeydown={disabled ? null : onInternalKeyDown}
          onMouseleave={onMouseLeaveCallback}
          ref={rateRef}
          style={style}
          tabindex={disabled ? -1 : tabIndex}
          {...pickAttrs(restAttrs, { aria: true, data: true, attr: true })}
        >
          {starNodes}
        </ul>
      );
    };
  },
  {
    name: 'Rate',
    inheritAttrs: false,
  },
);
