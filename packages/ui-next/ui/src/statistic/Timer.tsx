import type { SlotsType } from 'vue';

import type { StatisticProps, StatisticSlots } from './Statistic';
import type { FormatConfig, valueType } from './utils';

import { computed, defineComponent, onMounted, shallowRef, watch } from 'vue';

import { raf } from '@arvin-studio/headless';
import { omit } from '@arvin-studio/kit';

import { cloneElement } from '../_util/vueNode';
import Statistic from './Statistic';
import { formatCounter } from './utils';

export type TimerType = 'countdown' | 'countup';

export type StatisticTimerProps = FormatConfig &
  StatisticProps & {
    format?: string;
    type: TimerType;
  };

export interface StatisticTimeEmits {
  change: (value?: valueType) => void;
  /**
   * Only to be called when the type is `countdown`.
   */
  finish: () => void;
}

function getTime(value?: valueType) {
  return new Date(value as valueType).getTime();
}

const defaults = {
  value: 0,
  decimalSeparator: '.',
  groupSeparator: ',',
  loading: false,
  format: 'HH:mm:ss',
  title: undefined,
  suffix: undefined,
  prefix: undefined,
} as any;
export interface InternalStatisticTimerProps /* @vue-ignore */
  extends StatisticTimeEmitsProps, StatisticTimerProps {}

export interface StatisticTimeEmitsProps {
  onChange?: StatisticTimeEmits['change'];
  onFinish?: StatisticTimeEmits['finish'];
}

const StatisticTimer = defineComponent<
  InternalStatisticTimerProps,
  StatisticTimeEmits,
  string,
  SlotsType<StatisticSlots>
>(
  (props = defaults, { slots, attrs, emit }) => {
    const down = computed(() => props.type === 'countdown');
    // We reuse state here to do same as `forceUpdate`
    const showTime = shallowRef<null | object>(null);
    // ======================== Update ========================
    const update = () => {
      const { value } = props;
      const now = Date.now();
      const timestamp = getTime(value);
      showTime.value = {};
      const timeDiff = down.value ? timestamp - now : now - timestamp;
      emit('change', timeDiff);
      // Only countdown will trigger `onFinish`
      if (down.value && timestamp < now) {
        emit('finish');
        return false;
      }
      return true;
    };
    watch(
      [() => props.value, down],
      (_n, _o, onCleanup) => {
        let refId: number;
        const clear = () => raf.cancel(refId!);
        const rafUpdate = () => {
          refId = raf(() => {
            if (update()) {
              rafUpdate();
            }
          });
        };
        rafUpdate();
        onCleanup(clear);
      },
      {
        immediate: true,
      },
    );
    onMounted(() => {
      showTime.value = {};
    });
    // ======================== Format ========================
    const formatter: StatisticProps['formatter'] = (formatValue, config) =>
      showTime.value
        ? formatCounter(
            formatValue,
            { ...config, format: props.format },
            down.value,
          )
        : '-';
    const valueRender: StatisticProps['valueRender'] = (node) =>
      cloneElement(node, { title: undefined });
    return () => {
      // ======================== Render ========================
      return (
        <Statistic
          {...attrs}
          {...omit(props, ['value', 'format', 'type'])}
          formatter={formatter}
          v-slots={slots}
          value={props.value}
          valueRender={valueRender}
        />
      );
    };
  },
  {
    name: 'AStatisticTimer',
    inheritAttrs: false,
  },
);

export default StatisticTimer;
