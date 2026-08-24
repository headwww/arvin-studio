import type { DefaultOptionType, FieldNames } from '../Cascader';

import { warning } from '../../util';

// value in Cascader options should not be null
export function warningNullOptions(
  options: DefaultOptionType[],
  fieldNames: FieldNames,
) {
  if (!options) {
    return;
  }

  const recursiveOptions = (optionsList: DefaultOptionType[]) => {
    for (const option of optionsList) {
      if (option[fieldNames?.value as string] === null) {
        warning(false, '`value` in Cascader options should not be `null`.');
        return true;
      }

      if (
        Array.isArray(option[fieldNames?.children as string]) &&
        recursiveOptions(option[fieldNames?.children as string])
      ) {
        return true;
      }
    }
  };

  recursiveOptions(options);
}
