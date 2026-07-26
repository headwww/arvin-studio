import staticStrUndefined from './staticStrUndefined';

/**
 * 判断是否 Symbol 对象
 * @param val 值
 */
// oxlint-disable-next-line valid-typeof
const supportSymbol = typeof Symbol !== staticStrUndefined;
function isSymbol(val: any): val is symbol {
  // eslint-disable-next-line unicorn/no-nonstandard-builtin-properties
  return supportSymbol && (Symbol as any).isSymbol
    ? // eslint-disable-next-line unicorn/no-nonstandard-builtin-properties
      (Symbol as any).isSymbol(val)
    : typeof val === 'symbol';
}

export default isSymbol;
