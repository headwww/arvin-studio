import type { ComputedRef, Ref } from 'vue';

import type { TooltipConfig } from '../../config-provider/context';

import { computed } from 'vue';

interface MergedArrow {
  pointAtCenter?: boolean;
  show: boolean;
}

function useMergedArrow(
  providedArrow?: Ref<TooltipConfig['arrow'] | undefined>,
  providedContextArrow?: Ref<TooltipConfig['arrow'] | undefined>,
): ComputedRef<MergedArrow> {
  const toConfig = (
    arrow?: boolean | TooltipConfig['arrow'],
  ): Partial<MergedArrow> =>
    typeof arrow === 'boolean' ? { show: arrow } : arrow || {};

  return computed(() => {
    const arrowConfig = toConfig(providedArrow?.value);
    const contextArrowConfig = toConfig(providedContextArrow?.value);

    const finalShow =
      providedArrow?.value === undefined
        ? (contextArrowConfig.show ?? true)
        : (arrowConfig.show ?? true);

    return {
      ...contextArrowConfig,
      ...arrowConfig,
      show: finalShow,
    };
  });
}

export default useMergedArrow;
