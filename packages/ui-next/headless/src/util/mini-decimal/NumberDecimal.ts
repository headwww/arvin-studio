import type { DecimalClass, ValueType } from './interface';

import { getNumberPrecision, isEmpty, num2str } from './numberUtil';

/**
 * We can remove this when IE not support anymore
 */
export default class NumberDecimal implements DecimalClass {
  empty: boolean = false;
  number: number = 0;
  origin: string = '';

  constructor(value: ValueType) {
    if (isEmpty(value)) {
      this.empty = true;
      return;
    }

    this.origin = String(value);
    this.number = Number(value);
  }

  add(value: ValueType) {
    if (this.isInvalidate()) {
      return new NumberDecimal(value);
    }

    const target = Number(value);

    if (Number.isNaN(target)) {
      return this;
    }

    const number = this.number + target;

    // [Legacy] Back to safe integer
    if (number > Number.MAX_SAFE_INTEGER) {
      return new NumberDecimal(Number.MAX_SAFE_INTEGER);
    }

    if (number < Number.MIN_SAFE_INTEGER) {
      return new NumberDecimal(Number.MIN_SAFE_INTEGER);
    }

    const maxPrecision = Math.max(
      getNumberPrecision(this.number),
      getNumberPrecision(target),
    );
    return new NumberDecimal(number.toFixed(maxPrecision));
  }

  equals(target: DecimalClass) {
    return this.toNumber() === target?.toNumber();
  }

  isEmpty() {
    return this.empty;
  }

  isInvalidate() {
    return this.isEmpty() || this.isNaN();
  }

  isNaN() {
    return Number.isNaN(this.number);
  }

  lessEquals(target: DecimalClass) {
    return this.add(target.negate().toString()).toNumber() <= 0;
  }

  multi(value: ValueType) {
    const target = Number(value);

    if (this.isInvalidate() || Number.isNaN(target)) {
      return new NumberDecimal(NaN);
    }

    const number = this.number * target;

    // [Legacy] Back to safe integer
    if (number > Number.MAX_SAFE_INTEGER) {
      return new NumberDecimal(Number.MAX_SAFE_INTEGER);
    }

    if (number < Number.MIN_SAFE_INTEGER) {
      return new NumberDecimal(Number.MIN_SAFE_INTEGER);
    }

    const maxPrecision = Math.max(
      getNumberPrecision(this.number),
      getNumberPrecision(target),
    );
    return new NumberDecimal(number.toFixed(maxPrecision));
  }

  negate() {
    return new NumberDecimal(-this.toNumber());
  }

  toNumber() {
    return this.number;
  }

  toString(safe: boolean = true) {
    if (!safe) {
      return this.origin;
    }

    if (this.isInvalidate()) {
      return '';
    }

    return num2str(this.number);
  }
}
