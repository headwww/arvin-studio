import type { DecimalClass, ValueType } from './interface';

import {
  isE,
  isEmpty,
  num2str,
  trimNumber,
  validateNumber,
} from './numberUtil';

export default class BigIntDecimal implements DecimalClass {
  decimal: bigint = 0n;
  /** BigInt will convert `0009` to `9`. We need record the len of decimal */
  decimalLen: number = 0;
  empty: boolean = false;
  integer: bigint = 0n;
  nan: boolean = false;
  negative: boolean = false;
  origin: string = '';

  constructor(value: number | string) {
    if (isEmpty(value)) {
      this.empty = true;
      return;
    }

    this.origin = String(value);

    // Act like Number convert
    if (value === '-' || Number.isNaN(value)) {
      this.nan = true;
      return;
    }

    let mergedValue = value;

    // We need convert back to Number since it require `toFixed` to handle this
    if (isE(mergedValue)) {
      mergedValue = Number(mergedValue);
    }

    mergedValue =
      typeof mergedValue === 'string' ? mergedValue : num2str(mergedValue);

    if (validateNumber(mergedValue)) {
      const trimRet = trimNumber(mergedValue);
      this.negative = trimRet.negative;
      const numbers = trimRet.trimStr.split('.');
      this.integer = BigInt(numbers[0]!);
      const decimalStr = numbers[1] || '0';
      this.decimal = BigInt(decimalStr);
      this.decimalLen = decimalStr.length;
    } else {
      this.nan = true;
    }
  }

  add(value: ValueType): BigIntDecimal {
    if (this.isInvalidate()) {
      return new BigIntDecimal(value);
    }

    const offset = new BigIntDecimal(value);
    if (offset.isInvalidate()) {
      return this;
    }

    return this.cal(
      offset,
      (num1, num2) => num1 + num2,
      (len) => len,
    );
  }

  /**
   * @private Align BigIntDecimal with same decimal length. e.g. 12.3 + 5 = 1230000
   * This is used for add function only.
   */
  alignDecimal(decimalLength: number): bigint {
    const str = `${this.getMark()}${this.getIntegerStr()}${this.getDecimalStr().padEnd(
      decimalLength,
      '0',
    )}`;
    return BigInt(str);
  }

  equals(target: DecimalClass) {
    return this.toString() === target?.toString();
  }

  /**
   * @private get decimal string
   */
  getDecimalStr() {
    return this.decimal.toString().padStart(this.decimalLen, '0');
  }

  isEmpty() {
    return this.empty;
  }

  isInvalidate() {
    return this.isEmpty() || this.isNaN();
  }

  isNaN() {
    return this.nan;
  }

  lessEquals(target: DecimalClass) {
    return this.add(target.negate().toString()).toNumber() <= 0;
  }

  multi(value: ValueType): BigIntDecimal {
    const target = new BigIntDecimal(value);

    if (this.isInvalidate() || target.isInvalidate()) {
      return new BigIntDecimal(NaN);
    }

    return this.cal(
      target,
      (num1, num2) => num1 * num2,
      (len) => len * 2,
    );
  }

  negate() {
    const clone = new BigIntDecimal(this.toString());
    clone.negative = !clone.negative;
    return clone;
  }

  toNumber() {
    if (this.isNaN()) {
      return NaN;
    }
    return Number(this.toString());
  }

  toString(safe: boolean = true) {
    if (!safe) {
      return this.origin;
    }

    if (this.isInvalidate()) {
      return '';
    }

    return trimNumber(
      `${this.getMark()}${this.getIntegerStr()}.${this.getDecimalStr()}`,
    ).fullStr;
  }

  // eslint-disable-next-line unicorn/consistent-class-member-order
  private cal(
    offset: BigIntDecimal,
    calculator: (bigInt1: bigint, bigInt2: bigint) => bigint,
    calDecimalLen: (maxDecimalLength: number) => number,
  ): BigIntDecimal {
    const maxDecimalLength = Math.max(
      this.getDecimalStr().length,
      offset.getDecimalStr().length,
    );
    const myAlignedDecimal = this.alignDecimal(maxDecimalLength);
    const offsetAlignedDecimal = offset.alignDecimal(maxDecimalLength);

    const valueStr = calculator(
      myAlignedDecimal,
      offsetAlignedDecimal,
    ).toString();

    const nextDecimalLength = calDecimalLen(maxDecimalLength);

    // We need fill string length back to `maxDecimalLength` to avoid parser failed
    const { negativeStr, trimStr } = trimNumber(valueStr);
    const hydrateValueStr = `${negativeStr}${trimStr.padStart(
      nextDecimalLength + 1,
      '0',
    )}`;

    return new BigIntDecimal(
      `${hydrateValueStr.slice(0, -nextDecimalLength)}.${hydrateValueStr.slice(
        -nextDecimalLength,
      )}`,
    );
  }

  private getIntegerStr() {
    return this.integer.toString();
  }

  private getMark() {
    return this.negative ? '-' : '';
  }
}
