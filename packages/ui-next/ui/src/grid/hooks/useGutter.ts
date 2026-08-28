import type { Ref } from 'vue';

import type { Breakpoint, ScreenMap } from '../../_util/responsiveObserver';
import type { RowProps } from '../row';

import { computed, ref, watchEffect } from 'vue';

import { responsiveArray } from '../../_util/responsiveObserver';

type Gap = number | undefined;

export default function useGutter(
  gutter: Ref<RowProps['gutter']>,
  screens: Ref<null | ScreenMap>,
): Ref<[Gap, Gap]> {
  const results = ref<[Gap, Gap]>([undefined, undefined]);
  const normalizedGutter = computed(() => {
    return Array.isArray(gutter.value)
      ? gutter.value
      : [gutter.value, undefined];
  });
  // By default use as `xs`
  const mergedScreens = computed(() => {
    return (
      screens.value || {
        xs: true,
        sm: true,
        md: true,
        lg: true,
        xl: true,
        xxl: true,
        xxxl: true,
      }
    );
  });

  watchEffect(() => {
    normalizedGutter.value.forEach((g, index) => {
      if (typeof g === 'object' && g !== null) {
        for (const element of responsiveArray) {
          const breakpoint: Breakpoint = element!;
          if (mergedScreens.value[breakpoint] && g[breakpoint] !== undefined) {
            results.value[index] = g[breakpoint] as number;
            break;
          }
        }
      } else {
        results.value[index] = g;
      }
    });
  });
  return results;
}
