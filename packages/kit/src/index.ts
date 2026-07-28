import add from './add';
import after from './after';
import arrayEach from './arrayEach';
import arrayIndexOf from './arrayIndexOf';
import arrayLastIndexOf from './arrayLastIndexOf';
// 对象相关的方法
import assign from './assign';
import before from './before';
import bind from './bind';
import browse from './browse';
import camelCase from './camelCase';
import ceil from './ceil';
import chunk from './chunk';
import clear from './clear';
import clone from './clone';
// class辅助处理
import clsx from './clsx';
import commafy from './commafy';
import cookie from './cookie';
import copyWithin from './copyWithin';
import countBy from './countBy';
// 核心
import AsKit from './ctor';
import debounce from './debounce';
import delay from './delay';
import destructuring from './destructuring';
import divide from './divide';
import each from './each';
import eachTree from './eachTree';
import endsWith from './endsWith';
import entries from './entries';
import eqNull from './eqNull';
import escape from './escape';
import every from './every';
import filter from './filter';
import filterTree from './filterTree';
import find from './find';
import findIndexOf from './findIndexOf';
import findKey from './findKey';
import findLast from './findLast';
import findLastIndexOf from './findLastIndexOf';
import findTree from './findTree';
import first from './first';
import flatten from './flatten';
import floor from './floor';
import get from './get';
// 浏览器相关的方法
import getBaseURL from './getBaseURL';
import getDateDiff from './getDateDiff';
import getDayOfMonth from './getDayOfMonth';
import getDayOfQuarter from './getDayOfQuarter';
import getDayOfYear from './getDayOfYear';
import getMonthWeek from './getMonthWeek';
import getSize from './getSize';
import getType from './getType';
import getWhatDay from './getWhatDay';
import getWhatHours from './getWhatHours';
import getWhatMinutes from './getWhatMinutes';
import getWhatMonth from './getWhatMonth';
import getWhatQuarter from './getWhatQuarter';
import getWhatSeconds from './getWhatSeconds';
import getWhatWeek from './getWhatWeek';
// 日期相关的方法
import getWhatYear from './getWhatYear';
import getYearDay from './getYearDay';
import getYearWeek from './getYearWeek';
import groupBy from './groupBy';
import has from './has';
// 基础方法
import hasOwnProp from './hasOwnProp';
import includeArrays from './includeArrays';
import includes from './includes';
import indexOf from './indexOf';
import invoke from './invoke';
import isArguments from './isArguments';
import isArray from './isArray';
import isBoolean from './isBoolean';
import isDate from './isDate';
import isDateSame from './isDateSame';
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
import isValidDate from './isValidDate';
import isWeakMap from './isWeakMap';
import isWeakSet from './isWeakSet';
import isWindow from './isWindow';
import kebabCase from './kebabCase';
import keys from './keys';
import last from './last';
import lastArrayEach from './lastArrayEach';
import lastEach from './lastEach';
import lastIndexOf from './lastIndexOf';
import lastObjectEach from './lastObjectEach';
import locat from './locat';
// 数组相关的方法
import map from './map';
import mapTree from './mapTree';
import max from './max';
import mean from './mean';
import merge from './merge';
import min from './min';
import multiply from './multiply';
// 函数相关的方法
import noop from './noop';
import now from './now';
import objectEach from './objectEach';
import objectMap from './objectMap';
import omit from './omit';
import once from './once';
import orderBy from './orderBy';
// 字符串相关的方法
import padEnd from './padEnd';
import padStart from './padStart';
import parseUrl from './parseUrl';
import pick from './pick';
import pluck from './pluck';
import property from './property';
// 数值相关方法
import random from './random';
import range from './range';
import reduce from './reduce';
import remove from './remove';
import repeat from './repeat';
import round from './round';
import sample from './sample';
import searchTree from './searchTree';
import serialize from './serialize';
import set from './set';
import shuffle from './shuffle';
import slice from './slice';
import some from './some';
import sortBy from './sortBy';
import startsWith from './startsWith';
import subtract from './subtract';
import sum from './sum';
import template from './template';
import throttle from './throttle';
import timestamp from './timestamp';
import toArray from './toArray';
import toArrayTree from './toArrayTree';
import toDateString from './toDateString';
import toFixed from './toFixed';
import toFormatString from './toFormatString';
import toInteger from './toInteger';
import toJSONString from './toJSONString';
import toNumber from './toNumber';
import toNumberString from './toNumberString';
import toStringDate from './toStringDate';
import toStringJSON from './toStringJSON';
import toTreeArray from './toTreeArray';
import toValueString from './toValueString';
import trim from './trim';
import trimLeft from './trimLeft';
import trimRight from './trimRight';
import unescape from './unescape';
import union from './union';
import uniq from './uniq';
import uniqueId from './uniqueId';
// 地址相关的方法
import unserialize from './unserialize';
import unzip from './unzip';
import values from './values';
import zip from './zip';
import zipObject from './zipObject';

assign(AsKit, {
  assign,
  objectEach,
  lastObjectEach,
  objectMap,
  merge,

  uniq,
  union,
  sortBy,
  orderBy,
  shuffle,
  sample,
  some,
  every,
  slice,
  filter,
  find,
  findLast,
  findKey,
  includes,
  arrayIndexOf,
  arrayLastIndexOf,
  map,
  reduce,
  copyWithin,
  chunk,
  zip,
  unzip,
  zipObject,
  flatten,
  toArray,
  includeArrays,
  pluck,
  invoke,
  arrayEach,
  lastArrayEach,
  toArrayTree,
  toTreeArray,
  findTree,
  eachTree,
  mapTree,
  filterTree,
  searchTree,

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

  random,
  min,
  max,
  commafy,
  round,
  ceil,
  floor,
  toFixed,
  toNumber,
  toNumberString,
  toInteger,
  add,
  subtract,
  multiply,
  divide,
  sum,
  mean,

  now,
  timestamp,
  isValidDate,
  isDateSame,
  toStringDate,
  toDateString,
  getWhatYear,
  getWhatQuarter,
  getWhatMonth,
  getWhatWeek,
  getWhatDay,
  getWhatHours,
  getWhatMinutes,
  getWhatSeconds,
  getYearDay,
  getYearWeek,
  getMonthWeek,
  getDayOfYear,
  getDayOfQuarter,
  getDayOfMonth,
  getDateDiff,

  trim,
  trimLeft,
  trimRight,
  escape,
  unescape,
  camelCase,
  kebabCase,
  repeat,
  padStart,
  padEnd,
  startsWith,
  endsWith,
  template,
  toFormatString,
  toString: toValueString,
  toValueString,

  noop,
  property,
  bind,
  once,
  after,
  before,
  throttle,
  debounce,
  delay,

  unserialize,
  serialize,
  parseUrl,

  getBaseURL,
  locat,
  browse,
  cookie,
  clsx,
});

export default AsKit;

export {
  add,
  after,
  arrayEach,
  arrayIndexOf,
  arrayLastIndexOf,
  assign,
  before,
  bind,
  browse,
  camelCase,
  ceil,
  chunk,
  clear,
  clone,
  clsx,
  commafy,
  cookie,
  copyWithin,
  countBy,
  debounce,
  delay,
  destructuring,
  divide,
  each,
  eachTree,
  endsWith,
  entries,
  eqNull,
  escape,
  every,
  filter,
  filterTree,
  find,
  findIndexOf,
  findKey,
  findLast,
  findLastIndexOf,
  findTree,
  first,
  flatten,
  floor,
  get,
  getBaseURL,
  getDateDiff,
  getDayOfMonth,
  getDayOfQuarter,
  getDayOfYear,
  getMonthWeek,
  getSize,
  getType,
  getWhatDay,
  getWhatHours,
  getWhatMinutes,
  getWhatMonth,
  getWhatQuarter,
  getWhatSeconds,
  getWhatWeek,
  getWhatYear,
  getYearDay,
  getYearWeek,
  groupBy,
  has,
  hasOwnProp,
  includeArrays,
  includes,
  indexOf,
  invoke,
  isArguments,
  isArray,
  isBoolean,
  isDate,
  isDateSame,
  isDocument,
  isElement,
  isEmpty,
  isEqual,
  isEqualWith,
  isError,
  isFloat,
  isFormData,
  isFunction,
  isInteger,
  isLeapYear,
  isMap,
  isMatch,
  isNull,
  isNumber,
  isNumberFinite,
  isNumberNaN,
  isObject,
  isPlainObject,
  isRegExp,
  isSet,
  isString,
  isSymbol,
  isTypeError,
  isUndefined,
  isValidDate,
  isWeakMap,
  isWeakSet,
  isWindow,
  kebabCase,
  keys,
  last,
  lastArrayEach,
  lastEach,
  lastIndexOf,
  lastObjectEach,
  locat,
  map,
  mapTree,
  max,
  mean,
  merge,
  min,
  multiply,
  noop,
  now,
  objectEach,
  objectMap,
  omit,
  once,
  orderBy,
  padEnd,
  padStart,
  parseUrl,
  pick,
  pluck,
  property,
  random,
  range,
  reduce,
  remove,
  repeat,
  round,
  sample,
  searchTree,
  serialize,
  set,
  shuffle,
  slice,
  some,
  sortBy,
  startsWith,
  subtract,
  sum,
  template,
  throttle,
  timestamp,
  toArray,
  toArrayTree,
  toDateString,
  toFixed,
  toFormatString,
  toInteger,
  toJSONString,
  toNumber,
  toNumberString,
  toStringDate,
  toStringJSON,
  toTreeArray,
  toValueString,
  trim,
  trimLeft,
  trimRight,
  unescape,
  union,
  uniq,
  uniqueId,
  unserialize,
  unzip,
  values,
  zip,
  zipObject,
};
