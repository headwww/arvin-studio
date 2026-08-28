import type { Ref } from 'vue';

import { computed, shallowRef, watch } from 'vue';

const AUTO_INTERVAL = 200;
const STEP_BUCKETS: [limit: number, stepPtg: number][] = [
  [30, 0.05],
  [70, 0.03],
  [96, 0.01],
];

export default function usePercent(
  spinning: Ref<boolean>,
  percent: Ref<'auto' | number | undefined>,
) {
  const mockPercent = shallowRef(0);
  let mockIntervalRef = null as null | ReturnType<typeof setInterval>;
  const isAuto = computed(() => percent.value === 'auto');
  watch(
    [isAuto, spinning],
    (_n, _o, onCleanup) => {
      if (isAuto.value && spinning.value) {
        mockPercent.value = 0;
        mockIntervalRef = setInterval(() => {
          const prev = mockPercent.value;
          const restPTG = 100 - prev;

          for (const STEP_BUCKET of STEP_BUCKETS) {
            const [limit, stepPtg] = STEP_BUCKET as [number, number];
            if (prev <= limit) {
              mockPercent.value = prev + restPTG * stepPtg;
              break;
            }
          }
        }, AUTO_INTERVAL);
      }

      onCleanup(() => {
        if (!mockIntervalRef) {
          return;
        }

        clearInterval(mockIntervalRef);
        mockIntervalRef = null;
      });
    },
    {
      immediate: true,
    },
  );
  return computed(() => (isAuto.value ? mockPercent.value : percent.value));
}
