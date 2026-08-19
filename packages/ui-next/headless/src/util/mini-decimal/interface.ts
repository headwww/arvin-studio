export type ValueType = number | string;

export interface DecimalClass {
  add: (value: ValueType) => DecimalClass;

  equals: (target: DecimalClass) => boolean;

  isEmpty: () => boolean;

  isInvalidate: () => boolean;

  isNaN: () => boolean;

  lessEquals: (target: DecimalClass) => boolean;

  multi: (value: ValueType) => DecimalClass;

  negate: () => DecimalClass;

  toNumber: () => number;

  /**
   * Parse value as string. Will return empty string if `isInvalidate`.
   * You can set `safe=false` to get origin string content.
   */
  toString: (safe?: boolean) => string;
}
