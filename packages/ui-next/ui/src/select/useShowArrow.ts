import type { VueNode } from '../_util';

import { getSlotPropsFnRun } from '../_util/tools';

/**
 * Since Select, TreeSelect, Cascader is same Select like component.
 * We just use same hook to handle this logic.
 *
 * If `suffixIcon` is not equal to `null`, always show it.
 */
export default function useShowArrow(
  suffixIcon?: VueNode,
  showArrow?: boolean,
) {
  showArrow = getSlotPropsFnRun({}, { suffixIcon }, 'suffixIcon');
  return showArrow === undefined ? suffixIcon !== null : showArrow;
}
