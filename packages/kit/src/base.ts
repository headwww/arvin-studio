import clear from './clear';
import clone from './clone';
import countBy from './countBy';
import destructuring from './destructuring';
import each from './each';
import entries from './entries';
import eqNull from './eqNull';
import findIndexOf from './findIndexOf';
import findLastIndexOf from './findLastIndexOf';
import first from './first';
import get from './get';
import getSize from './getSize';
import getType from './getType';
import groupBy from './groupBy';
import has from './has';
import hasOwnProp from './hasOwnProp';
import indexOf from './indexOf';
import isArguments from './isArguments';
import isArray from './isArray';
import isBoolean from './isBoolean';
import isDate from './isDate';
import isDocument from './isDocument';
import isElement from './isElement';
import isEmpty from './isEmpty';
import isEqual from './isEqual';
import isEqualWith from './isEqualWith';
import isError from './isError';
import isNumberFinite from './isFinite';
import isFloat from './isFloat';
import isFormData from './isFormData';
import isFunction from './isFunction';
import isInteger from './isInteger';
import isLeapYear from './isLeapYear';
import isMap from './isMap';
import isMatch from './isMatch';
import isNumberNaN from './isNaN';
import isNull from './isNull';
import isNumber from './isNumber';
import isObject from './isObject';
import isPlainObject from './isPlainObject';
import isRegExp from './isRegExp';
import isSet from './isSet';
import isString from './isString';
import isSymbol from './isSymbol';
import isTypeError from './isTypeError';
import isUndefined from './isUndefined';
import isWeakMap from './isWeakMap';
import isWeakSet from './isWeakSet';
import isWindow from './isWindow';
import keys from './keys';
import last from './last';
import lastEach from './lastEach';
import lastIndexOf from './lastIndexOf';
import omit from './omit';
import pick from './pick';
import range from './range';
import remove from './remove';
import set from './set';
import toJSONString from './toJSONString';
import toStringJSON from './toStringJSON';
import uniqueId from './uniqueId';
import values from './values';

const baseExports = {
  hasOwnProp,
  eqNull,
  isNaN: isNumberNaN,
  isFinite: isNumberFinite,
  isUndefined,
  isArray,
  isFloat,
  isInteger,
  isFunction,
  isBoolean,
  isString,
  isNumber,
  isRegExp,
  isObject,
  isPlainObject,
  isDate,
  isError,
  isTypeError,
  isEmpty,
  isNull,
  isSymbol,
  isArguments,
  isElement,
  isDocument,
  isWindow,
  isFormData,
  isMap,
  isWeakMap,
  isSet,
  isWeakSet,
  isLeapYear,
  isMatch,
  isEqual,
  isEqualWith,
  getType,
  uniqueId,
  getSize,
  indexOf,
  lastIndexOf,
  findIndexOf,
  findLastIndexOf,
  toStringJSON,
  toJSONString,
  keys,
  values,
  entries,
  pick,
  omit,
  first,
  last,
  each,
  lastEach,
  has,
  get,
  set,
  groupBy,
  countBy,
  clone,
  clear,
  remove,
  range,
  destructuring,
};

export default baseExports;
