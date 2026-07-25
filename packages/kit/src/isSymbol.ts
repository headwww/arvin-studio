/* eslint-disable valid-typeof */
import staticStrUndefined from './staticStrUndefined';

/**
 * 判断是否 Symbol 对象
 * @param val 值
 */
const supportSymbol = typeof Symbol !== staticStrUndefined;
function isSymbol(val: any): val is symbol {
  return supportSymbol && (Symbol as any).isSymbol
    ? (Symbol as any).isSymbol(val)
    : typeof val === 'symbol';
}

export default isSymbol;
