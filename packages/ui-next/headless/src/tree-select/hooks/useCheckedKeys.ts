import type { Ref } from 'vue';

import type { DataEntity } from '../../tree';
import type { Key, LabeledValueType } from '../interface';

import { computed } from 'vue';

import { conductCheck } from '../../tree';

export default function useCheckedKeys(
  rawLabeledValues: Ref<LabeledValueType[]>,
  rawHalfCheckedValues: Ref<LabeledValueType[]>,
  treeConduction: Ref<boolean>,
  keyEntities: Ref<Record<string, DataEntity>>,
): readonly [Ref<Key[]>, Ref<Key[]>] {
  const merged = computed<readonly [Key[], Key[]]>(() => {
    const extractValues = (values: LabeledValueType[]): Key[] =>
      values.map(({ value }) => value!);

    const checkedKeys = extractValues(rawLabeledValues.value);
    const halfCheckedKeys = extractValues(rawHalfCheckedValues.value);

    const missingValues = checkedKeys.filter(
      (key) => !keyEntities.value[String(key)],
    );

    let finalCheckedKeys = checkedKeys;
    let finalHalfCheckedKeys = halfCheckedKeys;

    if (treeConduction.value) {
      const conductResult = conductCheck(checkedKeys, true, keyEntities.value);
      finalCheckedKeys = conductResult.checkedKeys;
      finalHalfCheckedKeys = conductResult.halfCheckedKeys;
    }

    return [
      Array.from(new Set([...missingValues, ...finalCheckedKeys])),
      finalHalfCheckedKeys,
    ] as const;
  });

  const checkedKeys = computed(() => merged.value[0]);
  const halfCheckedKeys = computed(() => merged.value[1]);

  return [checkedKeys, halfCheckedKeys] as const;
}
