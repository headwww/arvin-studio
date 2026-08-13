import {
  clone,
  equals,
  evolve,
  mergeLeft,
  mergeRight,
  pipe,
  when,
  where,
} from 'ramda';

import { TransformFactory, TransformOptions } from '..';
import { AbstractNode } from '../../templates/types';

type Dictionary = Record<string, string>;

export function assignAttrsAtTag(
  tag: string,
  extraPropertiesOrFunction:
    | ((
        options: TransformOptions & { previousAttrs: Dictionary },
      ) => Dictionary)
    | Dictionary,
): TransformFactory {
  return (options) => (asn) =>
    when<AbstractNode, AbstractNode>(
      where({
        tag: equals(tag),
      }),
      evolve({
        attrs: pipe<any, Dictionary, Dictionary>(
          clone,
          mergeLeft(
            typeof extraPropertiesOrFunction === 'function'
              ? extraPropertiesOrFunction(
                  mergeRight(options, { previousAttrs: asn.attrs }),
                )
              : extraPropertiesOrFunction,
          ),
        ),
      }),
    )(asn);
}
