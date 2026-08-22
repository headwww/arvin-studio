import type { Key } from '../../util';
import type { RowKey } from '../interface';

import useEvent from '../../util/hooks/useEvent';

export default function useItemKey<T>(rowKey: RowKey<T>) {
  return useEvent(
    (item: T): Key =>
      typeof rowKey === 'function' ? rowKey(item) : (item[rowKey] as Key),
  );
}
