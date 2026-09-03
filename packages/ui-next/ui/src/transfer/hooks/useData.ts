import type { Ref } from 'vue';

import type { AnyObject } from '../../_util';
import type { KeyWise, TransferKey, TransferProps } from '../interface';

import { computed, unref } from 'vue';

import { groupKeysMap } from '../../_util/transKeys';

type MaybeRef<T> = Ref<T> | T;

function useData<RecordType extends AnyObject>(
  dataSource?: MaybeRef<RecordType[] | undefined>,
  rowKey?: MaybeRef<TransferProps<RecordType>['rowKey']>,
  targetKeys?: MaybeRef<TransferKey[] | undefined>,
) {
  const mergedDataSource = computed(() => {
    const source = unref(dataSource) || [];
    const getRowKey = unref(rowKey);
    return source.map((record) => {
      if (getRowKey) {
        return { ...record, key: getRowKey(record) };
      }
      return record;
    });
  });

  const mergedLists = computed(() => {
    const leftData: KeyWise<RecordType>[] = [];
    const targetKeysValue = unref(targetKeys) || [];
    const rightData = Array.from<KeyWise<RecordType>>({
      length: targetKeysValue.length,
    });
    const targetKeysMap = groupKeysMap(targetKeysValue);

    mergedDataSource.value.forEach((record: any) => {
      if (targetKeysMap.has(record.key)) {
        const idx = targetKeysMap.get(record.key)!;
        rightData[idx] = record as KeyWise<RecordType>;
      } else {
        leftData.push(record as KeyWise<RecordType>);
      }
    });

    return {
      leftData,
      rightData,
    };
  });

  const leftDataSource = computed(() =>
    mergedLists.value.leftData.filter(Boolean),
  );
  const rightDataSource = computed(() =>
    mergedLists.value.rightData.filter(Boolean),
  );

  return [mergedDataSource, leftDataSource, rightDataSource] as const;
}

export default useData;
