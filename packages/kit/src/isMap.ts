import staticStrUndefined from './staticStrUndefined';

/**
 * 判断是否 Map 对象
 * @param val 值
 */
// oxlint-disable-next-line valid-typeof
const supportMap = typeof Map !== staticStrUndefined;
function isMap(val: any): val is Map<any, any> {
  return supportMap && val instanceof Map;
}

export default isMap;
