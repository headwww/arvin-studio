/* eslint-disable valid-typeof */
import staticStrUndefined from './staticStrUndefined';

/**
 * 判断是否 WeakMap 对象
 * @param val 值
 */
const supportWeakMap = typeof WeakMap !== staticStrUndefined;
function isWeakMap(val: any): val is WeakMap<any, any> {
  return supportWeakMap && val instanceof WeakMap;
}

export default isWeakMap;
