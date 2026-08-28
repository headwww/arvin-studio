import type { TooltipProps } from '../tooltip';
import type { VueNode } from './types';

import { isVNode } from 'vue';

export default function convertToTooltipProps<P extends TooltipProps>(
  tooltip?: P | VueNode,
  context?: P,
): null | P {
  if (tooltip === undefined || tooltip === null) {
    return null;
  }
  if (
    typeof tooltip === 'object' &&
    !Array.isArray(tooltip) &&
    !isVNode(tooltip)
  ) {
    return { ...context, ...tooltip } as P;
  }
  return {
    ...context,
    title: tooltip,
  } as P;
}
