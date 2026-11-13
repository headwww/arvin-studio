import type { AsComponentSlotType } from '../table/types/common';

import { isArray } from '@arvin-studio/kit';

export function getSlotVNs(vns: AsComponentSlotType | AsComponentSlotType[]) {
  if (vns === null || vns === undefined) {
    return [];
  }
  if (isArray(vns)) {
    return vns;
  }
  return [vns];
}
