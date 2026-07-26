import staticStrUndefined from './staticStrUndefined';

/**
 * 判断是否 Set 对象
 * @param val 值
 */
// oxlint-disable-next-line valid-typeof
const supportSet = typeof Set !== staticStrUndefined;
function isSet(val: any): val is Set<any> {
  return supportSet && val instanceof Set;
}

export default isSet;
