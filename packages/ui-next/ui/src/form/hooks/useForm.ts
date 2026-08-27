import type { NamePath } from '../types';

import { toArray } from '@arvin-studio/kit';

export function toNamePathStr(name: NamePath) {
  const namePath = toArray(name);
  return namePath.join('_');
}
