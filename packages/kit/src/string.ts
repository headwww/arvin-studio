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

const stringExports = {
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
};

export default stringExports;
export {
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
};
