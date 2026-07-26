import staticStrUndefined from './staticStrUndefined';

/**
 * 判断是否 WeakSet 对象
 * @param val 值
 */
// oxlint-disable-next-line valid-typeof
const supportWeakSet = typeof WeakSet !== staticStrUndefined;
function isWeakSet(val: any): val is WeakSet<any> {
  return supportWeakSet && val instanceof WeakSet;
}

export default isWeakSet;
