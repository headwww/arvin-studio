import helperCreateIterateHandle from './helperCreateIterateHandle';

/**
 * 从左至右遍历，匹配最近的一条数据
 * @param list 数组
 * @param iterate 回调
 * @param context 上下文
 */
function find<T, C = any>(
  list: T[] | undefined,
  iterate: (this: C, item: T, index: number, list: T[]) => boolean,
  context?: C,
): T | undefined;

/**
 * 从左至右遍历，匹配最近的一条数据
 * @param obj 对象
 * @param iterate 回调
 * @param context 上下文
 */
function find<T, C = any>(
  obj: T,
  iterate: (this: C, item: any, key: string, obj: T) => boolean,
  context?: C,
): any;

function find(obj: any, iterate: any, context?: any): any {
  return helperCreateIterateHandle(
    'find',
    true,
    3,
    true,
    undefined,
  )(obj, iterate, context);
}

export default find;
