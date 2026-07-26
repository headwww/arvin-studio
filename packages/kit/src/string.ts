import camelCase from './camelCase';
import endsWith from './endsWith';
import escape from './escape';
import kebabCase from './kebabCase';
import padEnd from './padEnd';
import padStart from './padStart';
import repeat from './repeat';
import startsWith from './startsWith';
import template from './template';
import toFormatString from './toFormatString';
import toValueString from './toValueString';
import trim from './trim';
import trimLeft from './trimLeft';
import trimRight from './trimRight';
import unescape from './unescape';

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
  camelCase,
  endsWith,
  escape,
  kebabCase,
  padEnd,
  padStart,
  repeat,
  startsWith,
  template,
  toFormatString,
  toValueString,
  trim,
  trimLeft,
  trimRight,
  unescape,
};
