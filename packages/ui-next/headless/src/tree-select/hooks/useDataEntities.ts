import type { Ref } from 'vue';

import type { DataEntity, KeyEntities } from '../../tree';
import type { DataNode, FieldNames, SafeKey } from '../interface';

import { shallowRef, watchEffect } from 'vue';

import { convertDataToEntities } from '../../tree';

export default function useDataEntities(
  treeData: Ref<DataNode[]>,
  fieldNames: Ref<FieldNames>,
): {
  keyEntities: Ref<KeyEntities>;
  valueEntities: Ref<Map<SafeKey, DataEntity>>;
} {
  const valueEntities = shallowRef<Map<SafeKey, DataEntity>>(new Map());
  const keyEntities = shallowRef<KeyEntities>({});

  watchEffect(() => {
    const mergedFieldNames = fieldNames.value as any;

    const collection = convertDataToEntities(treeData.value as any, {
      fieldNames: mergedFieldNames,
      initWrapper: (wrapper: any) => ({
        ...wrapper,
        valueEntities: new Map(),
      }),
      processEntity: (entity: DataEntity, wrapper: any) => {
        const val = (entity.node as any)[mergedFieldNames.value];

        wrapper.valueEntities.set(val, entity);
      },
    }) as any;

    keyEntities.value = collection.keyEntities;
    valueEntities.value = collection.valueEntities;
  });

  return {
    valueEntities,
    keyEntities,
  };
}
