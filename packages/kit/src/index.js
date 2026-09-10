// 核心
import AsKit from './ctor.js'

// 对象相关的方法
import assign from './assign.js'
import objectEach from './objectEach.js'
import lastObjectEach from './lastObjectEach.js'
import objectMap from './objectMap.js'
import merge from './merge.js'

// 数组相关的方法
import map from './map.js'
import some from './some.js'
import every from './every.js'
import includeArrays from './includeArrays.js'
import arrayEach from './arrayEach.js'
import lastArrayEach from './lastArrayEach.js'
import uniq from './uniq.js'
import union from './union.js'
import toArray from './toArray.js'
import sortBy from './sortBy.js'
import orderBy from './orderBy.js'
import shuffle from './shuffle.js'
import sample from './sample.js'
import slice from './slice.js'
import filter from './filter.js'
import findKey from './findKey.js'
import includes from './includes.js'
import find from './find.js'
import findLast from './findLast.js'
import reduce from './reduce.js'
import copyWithin from './copyWithin.js'
import chunk from './chunk.js'
import zip from './zip.js'
import unzip from './unzip.js'
import zipObject from './zipObject.js'
import flatten from './flatten.js'
import pluck from './pluck.js'
import invoke from './invoke.js'
import toArrayTree from './toArrayTree.js'
import toTreeArray from './toTreeArray.js'
import findTree from './findTree.js'
import eachTree from './eachTree.js'
import mapTree from './mapTree.js'
import filterTree from './filterTree.js'
import searchTree from './searchTree.js'
import arrayIndexOf from './arrayIndexOf.js'
import arrayLastIndexOf from './arrayLastIndexOf.js'

// 基础方法
import hasOwnProp from './hasOwnProp.js'
import isArray from './isArray.js'
import isNull from './isNull.js'
import isNumberNaN from './isNaN.js'
import isUndefined from './isUndefined.js'
import isFunction from './isFunction.js'
import isObject from './isObject.js'
import isString from './isString.js'
import isPlainObject from './isPlainObject.js'
import isLeapYear from './isLeapYear.js'
import isDate from './isDate.js'
import eqNull from './eqNull.js'
import each from './each.js'
import forOf from './forOf.js'
import lastForOf from './lastForOf.js'
import indexOf from './indexOf.js'
import lastIndexOf from './lastIndexOf.js'
import keys from './keys.js'
import values from './values.js'
import clone from './clone.js'
import getSize from './getSize.js'
import lastEach from './lastEach.js'
import remove from './remove.js'
import clear from './clear.js'
import isNumberFinite from './isFinite.js'
import isFloat from './isFloat.js'
import isInteger from './isInteger.js'
import isBoolean from './isBoolean.js'
import isNumber from './isNumber.js'
import isRegExp from './isRegExp.js'
import isError from './isError.js'
import isTypeError from './isTypeError.js'
import isEmpty from './isEmpty.js'
import isSymbol from './isSymbol.js'
import isArguments from './isArguments.js'
import isElement from './isElement.js'
import isDocument from './isDocument.js'
import isWindow from './isWindow.js'
import isFormData from './isFormData.js'
import isMap from './isMap.js'
import isWeakMap from './isWeakMap.js'
import isSet from './isSet.js'
import isWeakSet from './isWeakSet.js'
import isMatch from './isMatch.js'
import isEqual from './isEqual.js'
import isEqualWith from './isEqualWith.js'
import getType from './getType.js'
import uniqueId from './uniqueId.js'
import findIndexOf from './findIndexOf.js'
import findLastIndexOf from './findLastIndexOf.js'
import toStringJSON from './toStringJSON.js'
import toJSONString from './toJSONString.js'
import entries from './entries.js'
import pick from './pick.js'
import omit from './omit.js'
import first from './first.js'
import last from './last.js'
import has from './has.js'
import get from './get.js'
import set from './set.js'
import groupBy from './groupBy.js'
import countBy from './countBy.js'
import range from './range.js'
import destructuring from './destructuring.js'

// 数值相关方法
import random from './random.js'
import max from './max.js'
import min from './min.js'
import commafy from './commafy.js'
import round from './round.js'
import ceil from './ceil.js'
import floor from './floor.js'
import toFixed from './toFixed.js'
import toInteger from './toInteger.js'
import toNumber from './toNumber.js'
import toNumberString from './toNumberString.js'
import add from './add.js'
import subtract from './subtract.js'
import multiply from './multiply.js'
import divide from './divide.js'
import sum from './sum.js'
import mean from './mean.js'

// 日期相关的方法
import getWhatYear from './getWhatYear.js'
import getWhatQuarter from './getWhatQuarter.js'
import getWhatMonth from './getWhatMonth.js'
import getWhatWeek from './getWhatWeek.js'
import getWhatDay from './getWhatDay.js'
import getWhatHours from './getWhatHours.js'
import getWhatMinutes from './getWhatMinutes.js'
import getWhatSeconds from './getWhatSeconds.js'
import toStringDate from './toStringDate.js'
import toDateString from './toDateString.js'
import now from './now.js'
import timestamp from './timestamp.js'
import isValidDate from './isValidDate.js'
import isDateSame from './isDateSame.js'
import getYearDay from './getYearDay.js'
import getYearWeek from './getYearWeek.js'
import getMonthWeek from './getMonthWeek.js'
import getDayOfYear from './getDayOfYear.js'
import getDayOfQuarter from './getDayOfQuarter.js'
import getDayOfMonth from './getDayOfMonth.js'
import getDateDiff from './getDateDiff.js'

// 字符串相关的方法
import padEnd from './padEnd.js'
import padStart from './padStart.js'
import repeat from './repeat.js'
import trim from './trim.js'
import trimRight from './trimRight.js'
import trimLeft from './trimLeft.js'
import escape from './escape.js'
import unescape from './unescape.js'
import camelCase from './camelCase.js'
import kebabCase from './kebabCase.js'
import startsWith from './startsWith.js'
import endsWith from './endsWith.js'
import template from './template.js'
import toFormatString from './toFormatString.js'
import toValueString from './toValueString.js'

// 函数相关的方法
import noop from './noop.js'
import property from './property.js'
import bind from './bind.js'
import once from './once.js'
import after from './after.js'
import before from './before.js'
import throttle from './throttle.js'
import debounce from './debounce.js'
import delay from './delay.js'

// 地址相关的方法
import unserialize from './unserialize.js'
import serialize from './serialize.js'
import parseUrl from './parseUrl.js'

// 浏览器相关的方法
import getBaseURL from './getBaseURL.js'
import locat from './locat.js'
import cookie from './cookie.js'
import browse from './browse.js'

// class辅助处理
import clsx from './clsx.js'

assign(AsKit, {
  // object
  assign: assign,
  objectEach: objectEach,
  lastObjectEach: lastObjectEach,
  objectMap: objectMap,
  merge: merge,

  // array
  uniq: uniq,
  union: union,
  sortBy: sortBy,
  orderBy: orderBy,
  shuffle: shuffle,
  sample: sample,
  some: some,
  every: every,
  slice: slice,
  filter: filter,
  find: find,
  findLast: findLast,
  findKey: findKey,
  includes: includes,
  arrayIndexOf: arrayIndexOf,
  arrayLastIndexOf: arrayLastIndexOf,
  map: map,
  reduce: reduce,
  copyWithin: copyWithin,
  chunk: chunk,
  zip: zip,
  unzip: unzip,
  zipObject: zipObject,
  flatten: flatten,
  toArray: toArray,
  includeArrays: includeArrays,
  pluck: pluck,
  invoke: invoke,
  arrayEach: arrayEach,
  lastArrayEach: lastArrayEach,
  toArrayTree: toArrayTree,
  toTreeArray: toTreeArray,
  findTree: findTree,
  eachTree: eachTree,
  mapTree: mapTree,
  filterTree: filterTree,
  searchTree: searchTree,

  // base
  hasOwnProp: hasOwnProp,
  eqNull: eqNull,
  isNaN: isNumberNaN,
  isFinite: isNumberFinite,
  isUndefined: isUndefined,
  isArray: isArray,
  isFloat: isFloat,
  isInteger: isInteger,
  isFunction: isFunction,
  isBoolean: isBoolean,
  isString: isString,
  isNumber: isNumber,
  isRegExp: isRegExp,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isDate: isDate,
  isError: isError,
  isTypeError: isTypeError,
  isEmpty: isEmpty,
  isNull: isNull,
  isSymbol: isSymbol,
  isArguments: isArguments,
  isElement: isElement,
  isDocument: isDocument,
  isWindow: isWindow,
  isFormData: isFormData,
  isMap: isMap,
  isWeakMap: isWeakMap,
  isSet: isSet,
  isWeakSet: isWeakSet,
  isLeapYear: isLeapYear,
  isMatch: isMatch,
  isEqual: isEqual,
  isEqualWith: isEqualWith,
  getType: getType,
  uniqueId: uniqueId,
  getSize: getSize,
  indexOf: indexOf,
  lastIndexOf: lastIndexOf,
  findIndexOf: findIndexOf,
  findLastIndexOf: findLastIndexOf,
  toStringJSON: toStringJSON,
  toJSONString: toJSONString,
  keys: keys,
  values: values,
  entries: entries,
  pick: pick,
  omit: omit,
  first: first,
  last: last,
  each: each,
  forOf: forOf,
  lastForOf: lastForOf,
  lastEach: lastEach,
  has: has,
  get: get,
  set: set,
  groupBy: groupBy,
  countBy: countBy,
  clone: clone,
  clear: clear,
  remove: remove,
  range: range,
  destructuring: destructuring,

  // number
  random: random,
  min: min,
  max: max,
  commafy: commafy,
  round: round,
  ceil: ceil,
  floor: floor,
  toFixed: toFixed,
  toNumber: toNumber,
  toNumberString: toNumberString,
  toInteger: toInteger,
  add: add,
  subtract: subtract,
  multiply: multiply,
  divide: divide,
  sum: sum,
  mean: mean,

  // date
  now: now,
  timestamp: timestamp,
  isValidDate: isValidDate,
  isDateSame: isDateSame,
  toStringDate: toStringDate,
  toDateString: toDateString,
  getWhatYear: getWhatYear,
  getWhatQuarter: getWhatQuarter,
  getWhatMonth: getWhatMonth,
  getWhatWeek: getWhatWeek,
  getWhatDay: getWhatDay,
  getWhatHours: getWhatHours,
  getWhatMinutes: getWhatMinutes,
  getWhatSeconds: getWhatSeconds,
  getYearDay: getYearDay,
  getYearWeek: getYearWeek,
  getMonthWeek: getMonthWeek,
  getDayOfYear: getDayOfYear,
  getDayOfQuarter: getDayOfQuarter,
  getDayOfMonth: getDayOfMonth,
  getDateDiff: getDateDiff,

  // string
  trim: trim,
  trimLeft: trimLeft,
  trimRight: trimRight,
  escape: escape,
  unescape: unescape,
  camelCase: camelCase,
  kebabCase: kebabCase,
  repeat: repeat,
  padStart: padStart,
  padEnd: padEnd,
  startsWith: startsWith,
  endsWith: endsWith,
  template: template,
  toFormatString: toFormatString,
  toString: toValueString,
  toValueString: toValueString,

  // function
  noop: noop,
  property: property,
  bind: bind,
  once: once,
  after: after,
  before: before,
  throttle: throttle,
  debounce: debounce,
  delay: delay,

  // url
  unserialize: unserialize,
  serialize: serialize,
  parseUrl: parseUrl,

  // web
  getBaseURL: getBaseURL,
  locat: locat,
  browse: browse,
  cookie: cookie,

  // class
  clsx: clsx
})

export default AsKit

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
  forOf,
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
  isNumberFinite as isFinite,
  isFloat,
  isFormData,
  isFunction,
  isInteger,
  isLeapYear,
  isMap,
  isMatch,
  isNumberNaN as isNaN,
  isNull,
  isNumber,
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
  lastForOf,
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
  toValueString as toString,
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
  zipObject
};
