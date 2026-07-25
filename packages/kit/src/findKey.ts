import helperCreateIterateHandle from './helperCreateIterateHandle';

/**
 * 从左至右遍历，返回匹配的第一条数据的键
 */
function findKey<T, C = any>(
  obj: T,
  iterate: (this: C, item: any, key: string, obj: T) => boolean,
  context?: C,
): string | undefined;

function findKey(obj: any, iterate: any, context?: any): any {
  return helperCreateIterateHandle(
    '',
    false,
    2,
    true,
    undefined,
  )(obj, iterate, context);
}

export default findKey;
