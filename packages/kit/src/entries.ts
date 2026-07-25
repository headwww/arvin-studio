import helperCreateGetObjects from './helperCreateGetObjects';

/**
 * 获取对象所有属性、值
 * @param obj 对象
 */
function entries(obj: any): Array<[string, any]> {
  return helperCreateGetObjects('entries', 2)(obj);
}

export default entries;
