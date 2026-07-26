// 核心
import AsKit from './ctor';

// 对象相关的方法
import assign from './assign';
import objectEach from './objectEach';
import lastObjectEach from './lastObjectEach';
import objectMap from './objectMap';
import merge from './merge';

// 数组相关的方法
import map from './map';
import some from './some';
import every from './every';
import includeArrays from './includeArrays';
import arrayEach from './arrayEach';
import lastArrayEach from './lastArrayEach';
import uniq from './uniq';
import union from './union';
import toArray from './toArray';
import sortBy from './sortBy';
import orderBy from './orderBy';
import shuffle from './shuffle';
import sample from './sample';
import slice from './slice';
import filter from './filter';
import findKey from './findKey';
import includes from './includes';
import find from './find';
import findLast from './findLast';
import reduce from './reduce';
import copyWithin from './copyWithin';
import chunk from './chunk';
import zip from './zip';
import unzip from './unzip';
import zipObject from './zipObject';
import flatten from './flatten';
import pluck from './pluck';
import invoke from './invoke';
import toArrayTree from './toArrayTree';
import toTreeArray from './toTreeArray';
import findTree from './findTree';
import eachTree from './eachTree';
import mapTree from './mapTree';
import filterTree from './filterTree';
import searchTree from './searchTree';
import arrayIndexOf from './arrayIndexOf';
import arrayLastIndexOf from './arrayLastIndexOf';

// 基础方法
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

// 数值相关方法
import random from './random';
import max from './max';
import min from './min';
import commafy from './commafy';
import round from './round';
import ceil from './ceil';
import floor from './floor';
import toFixed from './toFixed';
import toInteger from './toInteger';
import toNumber from './toNumber';
import toNumberString from './toNumberString';
import add from './add';
import subtract from './subtract';
import multiply from './multiply';
import divide from './divide';
import sum from './sum';
import mean from './mean';

// 日期相关的方法
import getWhatYear from './getWhatYear';
import getWhatQuarter from './getWhatQuarter';
import getWhatMonth from './getWhatMonth';
import getWhatWeek from './getWhatWeek';
import getWhatDay from './getWhatDay';
import getWhatHours from './getWhatHours';
import getWhatMinutes from './getWhatMinutes';
import getWhatSeconds from './getWhatSeconds';
import toStringDate from './toStringDate';
import toDateString from './toDateString';
import now from './now';
import timestamp from './timestamp';
import isValidDate from './isValidDate';
import isDateSame from './isDateSame';
import getYearDay from './getYearDay';
import getYearWeek from './getYearWeek';
import getMonthWeek from './getMonthWeek';
import getDayOfYear from './getDayOfYear';
import getDayOfQuarter from './getDayOfQuarter';
import getDayOfMonth from './getDayOfMonth';
import getDateDiff from './getDateDiff';

// 字符串相关的方法
import padEnd from './padEnd';
import padStart from './padStart';
import repeat from './repeat';
import trim from './trim';
import trimRight from './trimRight';
import trimLeft from './trimLeft';
import escape from './escape';
import unescape from './unescape';
import camelCase from './camelCase';
import kebabCase from './kebabCase';
import startsWith from './startsWith';
import endsWith from './endsWith';
import template from './template';
import toFormatString from './toFormatString';
import toValueString from './toValueString';

// 函数相关的方法
import noop from './noop';
import property from './property';
import bind from './bind';
import once from './once';
import after from './after';
import before from './before';
import throttle from './throttle';
import debounce from './debounce';
import delay from './delay';

// 地址相关的方法
import unserialize from './unserialize';
import serialize from './serialize';
import parseUrl from './parseUrl';

// 浏览器相关的方法
import getBaseURL from './getBaseURL';
import locat from './locat';
import cookie from './cookie';
import browse from './browse';

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
});

export default AsKit;

export {
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
  isNumberNaN,
  isNumberFinite,
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
};
