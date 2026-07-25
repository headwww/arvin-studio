import hasOwnProp from './hasOwnProp';
import isArray from './isArray';
import isNull from './isNull';
import isNumberNaN from './isNaN';
import isUndefined from './isUndefined';
import isFunction from './isFunction';
import isObject from './isObject';
import isString from './isString';
import isPlainObject from './isPlainObject';
import isLeapYear from './isLeapYear';
import isDate from './isDate';
import eqNull from './eqNull';
import each from './each';
import indexOf from './indexOf';
import lastIndexOf from './lastIndexOf';
import keys from './keys';
import values from './values';
import clone from './clone';
import getSize from './getSize';
import lastEach from './lastEach';
import remove from './remove';
import clear from './clear';
import isNumberFinite from './isFinite';
import isFloat from './isFloat';
import isInteger from './isInteger';
import isBoolean from './isBoolean';
import isNumber from './isNumber';
import isRegExp from './isRegExp';
import isError from './isError';
import isTypeError from './isTypeError';
import isEmpty from './isEmpty';
import isSymbol from './isSymbol';
import isArguments from './isArguments';
import isElement from './isElement';
import isDocument from './isDocument';
import isWindow from './isWindow';
import isFormData from './isFormData';
import isMap from './isMap';
import isWeakMap from './isWeakMap';
import isSet from './isSet';
import isWeakSet from './isWeakSet';
import isMatch from './isMatch';
import isEqual from './isEqual';
import isEqualWith from './isEqualWith';
import getType from './getType';
import uniqueId from './uniqueId';
import findIndexOf from './findIndexOf';
import findLastIndexOf from './findLastIndexOf';
import toStringJSON from './toStringJSON';
import toJSONString from './toJSONString';
import entries from './entries';
import pick from './pick';
import omit from './omit';
import first from './first';
import last from './last';
import has from './has';
import get from './get';
import set from './set';
import groupBy from './groupBy';
import countBy from './countBy';
import range from './range';
import destructuring from './destructuring';

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
