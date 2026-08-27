import type { CSSProperties } from 'vue';

import {
  computed,
  defineComponent,
  onBeforeUnmount,
  shallowRef,
  watch,
} from 'vue';

import { clsx } from '@arvin-studio/kit';

export interface SingleNumberProps {
  count: number;
  prefixCls: string;
  value: string;
}

function getOffset(start: number, end: number, unit: -1 | 1) {
  let index = start;
  let offset = 0;

  while ((index + 10) % 10 !== end) {
    index += unit;
    offset += unit;
  }

  return offset;
}

export default defineComponent<SingleNumberProps>(
  (props) => {
    const valueNumber = computed(() => Number(props.value));
    const countNumber = computed(() => Math.abs(props.count));
    const prevValue = shallowRef(valueNumber.value);
    const prevCount = shallowRef(countNumber.value);
    const fallbackTimer = shallowRef<null | ReturnType<typeof setTimeout>>(
      null,
    );

    const onTransitionEnd = () => {
      prevValue.value = valueNumber.value;
      prevCount.value = countNumber.value;
    };

    watch(
      [valueNumber, countNumber],
      () => {
        if (fallbackTimer.value) {
          clearTimeout(fallbackTimer.value);
          fallbackTimer.value = null;
        }
        fallbackTimer.value = setTimeout(onTransitionEnd, 1000);
      },
      { immediate: true },
    );

    onBeforeUnmount(() => {
      if (!fallbackTimer.value) {
        return;
      }

      clearTimeout(fallbackTimer.value);
      fallbackTimer.value = null;
    });

    return () => {
      const prefixCls = props.prefixCls;
      const value = valueNumber.value;
      const count = countNumber.value;
      const previousValue = prevValue.value;
      const previousCount = prevCount.value;

      const renderUnit = (
        unitValue: number | string,
        offset = 0,
        current = false,
        key?: number | string,
      ) => {
        const style = offset
          ? ({
              position: 'absolute',
              top: `${offset}00%`,
              left: 0,
            } as CSSProperties)
          : undefined;

        const spanKey = Number.isNaN(key) ? unitValue : (key ?? unitValue);
        return (
          <span
            class={clsx(`${prefixCls}-only-unit`, { current })}
            key={spanKey}
            style={style}
          >
            {unitValue}
          </span>
        );
      };

      let unitNodes;
      let offsetStyle: CSSProperties | undefined;

      if (
        previousValue === value ||
        Number.isNaN(value) ||
        Number.isNaN(previousValue)
      ) {
        unitNodes = [renderUnit(props.value, 0, true, value)];
        offsetStyle = { transition: 'none' };
      } else {
        const unitNumberList: number[] = [];
        for (let index = value; index <= value + 10; index += 1) {
          unitNumberList.push(index);
        }

        const unit: -1 | 1 = previousCount < count ? 1 : -1;
        const prevIndex = unitNumberList.findIndex(
          (n: number) => n % 10 === previousValue,
        );
        const cutList =
          unit < 0
            ? unitNumberList.slice(0, prevIndex + 1)
            : unitNumberList.slice(prevIndex);

        unitNodes = cutList.map((n, index) => {
          const singleUnit = n % 10;
          return renderUnit(
            singleUnit,
            unit < 0 ? index - prevIndex : index,
            index === prevIndex,
            n,
          );
        });

        offsetStyle = {
          transform: `translateY(${-getOffset(previousValue, value, unit)}00%)`,
        };
      }

      return (
        <span
          class={`${prefixCls}-only`}
          onTransitionend={onTransitionEnd}
          style={offsetStyle}
        >
          {unitNodes}
        </span>
      );
    };
  },
  {
    name: 'AsSingleNumber',
    inheritAttrs: false,
  },
);
