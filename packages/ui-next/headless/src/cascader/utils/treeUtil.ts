import type {
  DefaultOptionType,
  InternalFieldNames,
  LegacyKey,
  ShowCheckedStrategy,
  SingleValueType,
} from '../Cascader';
import type { GetEntities } from '../hooks/useEntities';

import { SHOW_CHILD } from './commonUtil';

export function formatStrategyValues(
  pathKeys: LegacyKey[],
  getKeyPathEntities: GetEntities,
  showCheckedStrategy?: ShowCheckedStrategy,
) {
  const valueSet = new Set(pathKeys);
  const keyPathEntities = getKeyPathEntities();

  return pathKeys.filter((key) => {
    const entity = keyPathEntities[key];
    const parent = entity ? entity.parent : null;
    const children = entity ? entity.children : null;

    if (entity && entity.node.disabled) {
      return true;
    }

    return showCheckedStrategy === SHOW_CHILD
      ? !(
          children &&
          children.some(
            (child) => child.key && valueSet.has(child.key as LegacyKey),
          )
        )
      : !(
          parent &&
          !parent.node.disabled &&
          valueSet.has(parent.key as LegacyKey)
        );
  });
}

export function toPathOptions(
  valueCells: SingleValueType,
  options: DefaultOptionType[],
  fieldNames: InternalFieldNames,
  stringMode = false,
) {
  let currentList = options;
  const valueOptions: {
    index: number;
    option: DefaultOptionType;
    value: SingleValueType[number];
  }[] = [];

  for (const valueCell of valueCells) {
    const foundIndex = currentList?.findIndex((option) => {
      const val = option[fieldNames.value];
      return stringMode ? String(val) === String(valueCell) : val === valueCell;
    });
    const foundOption = foundIndex === -1 ? null : currentList?.[foundIndex];

    valueOptions.push({
      value: foundOption?.[fieldNames.value] ?? valueCell,
      index: foundIndex,
      option: foundOption as DefaultOptionType,
    });

    currentList = foundOption?.[fieldNames.children];
  }

  return valueOptions;
}
